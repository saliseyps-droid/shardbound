import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { GameService } from '@/services/gameService';
import { IndexedDbStore, MemoryStore } from '@/persistence/storage';
import { SaveGateway } from '@/persistence/repositories';
import { migrateSave } from '@/persistence/migrations';
import { CURRENT_SAVE_VERSION, ownedCopies } from '@/domain/save';
import { deckSize, validateDeck, deckToList } from '@/domain/decks';
import { applyAction, createGame } from '@/engine';
import type { GameState, PlayerId } from '@/engine';
import { chooseAction, makeAiConfig, runAiMulligan } from '@/ai';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import { PRACTICE_OPPONENTS, DIFFICULTY_POOLS } from '@/data/opponents';
import { getCard } from '@/data/cards';
import { SHOP_OFFERS } from '@/config/economy';
const prof = (username: string, avatar: string, cardBack?: string) => ({ username, avatar, cardBack: cardBack as string, portraits: [], factionPortraits: {} });

function playMatch(state: GameState, seed: number): GameState {
  const cfg = makeAiConfig('NORMAL');
  let s = runAiMulligan(runAiMulligan(state, 0, cfg), 1, cfg);
  let per = 0;
  let turn = s.turn;
  for (let i = 0; i < 4000 && s.phase === 'MAIN'; i++) {
    if (s.turn !== turn) [per, turn] = [0, s.turn];
    const me = s.activePlayer as PlayerId;
    const res = applyAction(s, chooseAction(s, me, cfg, seed + i, per++).action);
    s = res.error ? applyAction(s, { type: 'END_TURN', player: me }).state : res.state;
  }
  return s;
}

describe('persistence', () => {
  it('round-trips a save through IndexedDB', async () => {
    const store = new IndexedDbStore('test_roundtrip');
    const svc = new GameService(store);
    expect((await svc.init()).kind).toBe('NEW');
    await svc.createProfile('Ada', 'star');
    svc.buy('core_1');
    await svc.flush();
    const svc2 = new GameService(new IndexedDbStore('test_roundtrip'));
    const status = await svc2.init();
    expect(status.kind).toBe('LOADED');
    expect(svc2.current!.profile.username).toBe('Ada');
    expect(svc2.current!.profile.gold).toBe(svc.current!.profile.gold);
    expect(svc2.current!.economy.packs.CORE).toBe(svc.current!.economy.packs.CORE);
  });

  it('migrates a v1 save with numeric collection counts', () => {
    const report = migrateSave({
      saveVersion: 1,
      profile: { username: 'Old', gold: 'lots', level: 3 },
      collection: { cards: { emb_kindling_imp: 2, not_a_card: 5 } },
      decks: [{ id: 'd1', name: 'Legacy', heroFaction: 'EMBER', cards: { emb_kindling_imp: 2, gone: 1 } }],
    });
    expect(report.save.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(report.save.collection.cards.emb_kindling_imp).toEqual({ NORMAL: 2, FOIL: 0, PRISMATIC: 0 });
    expect(report.save.collection.cards.not_a_card).toBeUndefined();
    expect(report.save.profile.gold).toBe(0);
    expect(report.save.decks[0].cards).toEqual({ emb_kindling_imp: 2 });
    expect(report.notes.length).toBeGreaterThan(0);
  });

  it('reports corrupted saves without crashing and keeps a backup', async () => {
    const store = new MemoryStore();
    await store.set('meta', { saveVersion: 3 });
    await store.set('profile', 'garbage');
    const svc = new GameService(store);
    const status = await svc.init();
    expect(status.kind).toBe('CORRUPTED');
    expect((await store.keys()).some((k) => k.startsWith('backup_'))).toBe(true);
  });

  it('only writes changed slices', async () => {
    const store = new MemoryStore();
    const gw = new SaveGateway(store);
    const svc = new GameService(store);
    await svc.createProfile('A', 'a');
    const before = svc.current!;
    const writes: string[] = [];
    const orig = store.setMany.bind(store);
    store.setMany = async (entries) => {
      writes.push(...entries.map(([k]) => k));
      return orig(entries);
    };
    svc.buy('core_1');
    await svc.flush();
    expect(writes).toContain('profile');
    expect(writes).not.toContain('collection');
    expect(writes).not.toContain('decks');
    expect(before).not.toBe(svc.current);
    expect(gw).toBeDefined();
  });
});

describe('end-to-end gameplay loop (definition of done)', () => {
  it('new profile → match → rewards → buy → open → deck edit → match with new card → reload', async () => {
    const dbName = 'test_e2e';
    const svc = new GameService(new IndexedDbStore(dbName));
    expect((await svc.init()).kind).toBe('NEW');
    await svc.createProfile('Wren', 'leaf');
    let save = svc.current!;

    // Starter collection and valid decks.
    expect(save.decks.length).toBeGreaterThanOrEqual(3);
    for (const d of save.decks) expect(validateDeck(d, (id) => ownedCopies(save.collection, id))).toEqual([]);

    // Play a match against an AI bot with a starter deck.
    const deck = save.decks[0];
    const opponent = { ...PRACTICE_OPPONENTS.VERDANT, difficulty: 'EASY' as const, rarities: DIFFICULTY_POOLS.EASY };
    const game = createGame({ seed: 17, players: [playerSide(prof(save.profile.username, 'leaf'), deck), opponentSide(opponent)] }).state;
    const ended = playMatch(game, 1);
    expect(ended.phase).toBe('ENDED');
    const result = ended.winner === 0 ? 'WIN' : ended.winner === 1 ? 'LOSS' : 'DRAW';
    const goldBefore = save.profile.gold;
    const xpBefore = save.profile.totalXp;
    const rewards = svc.recordMatch({
      mode: 'PRACTICE', opponentId: opponent.id, opponentName: opponent.name, difficulty: 'EASY', deckId: deck.id, deckName: deck.name,
      deckFaction: deck.heroFaction, result, turns: ended.turn, durationMs: 1000, stats: ended.players[0].stats, conceded: false,
    });
    save = svc.current!;
    expect(rewards.gold).toBeGreaterThan(0);
    expect(save.profile.gold).toBe(goldBefore + rewards.gold);
    expect(save.profile.totalXp).toBeGreaterThan(xpBefore);

    // Buy a booster.
    const goldPreShop = save.profile.gold;
    const packsBefore = save.economy.packs.CORE ?? 0;
    expect(svc.buy('core_1').ok).toBe(true);
    save = svc.current!;
    expect(save.profile.gold).toBe(goldPreShop - SHOP_OFFERS[0].price);
    expect(save.economy.packs.CORE).toBe(packsBefore + 1);

    // Open packs until we get a card for the deck's factions that isn't in the deck yet.
    let newCard: string | undefined;
    for (let i = 0; i < 40 && !newCard; i++) {
      if ((svc.current!.economy.packs.CORE ?? 0) === 0) {
        svc.debugGrant('gold', 100);
        svc.buy('core_1');
      }
      const opened = svc.openPack('CORE');
      expect(opened.ok).toBe(true);
      if (!opened.ok) break;
      expect(opened.value.length).toBe(5);
      newCard = opened.value.map((c) => c.cardId).find((id) => {
        const c = getCard(id)!;
        return (c.faction === deck.heroFaction || c.faction === 'NEUTRAL') && !deck.cards[id];
      });
    }
    expect(newCard).toBeDefined();
    save = svc.current!;
    expect(ownedCopies(save.collection, newCard!)).toBeGreaterThan(0);

    // Put the new card into the deck (swap out one card) and save it.
    const edited = { ...deck, cards: { ...deck.cards } };
    const swapOut = Object.keys(edited.cards)[0];
    edited.cards[swapOut] -= 1;
    if (edited.cards[swapOut] === 0) delete edited.cards[swapOut];
    edited.cards[newCard!] = 1;
    expect(deckSize(edited)).toBe(30);
    expect(validateDeck(edited, (id) => ownedCopies(save.collection, id))).toEqual([]);
    expect(svc.updateDeck(edited).ok).toBe(true);

    // Start another match: the new card is present in the deck and can be drawn and played.
    const savedDeck = svc.current!.decks.find((d) => d.id === deck.id)!;
    expect(savedDeck.cards[newCard!]).toBe(1);
    const side = playerSide(prof('Wren', 'leaf'), savedDeck);
    expect(side.deck).toContain(newCard);
    // A unit on each side so targeted cards always have a legal target.
    let g2 = createGame({ seed: 5, skipMulligan: true, firstPlayer: 0, players: [{ ...side, startingBoard: ['token_recruit'] }, { ...opponentSide(opponent), startingBoard: ['token_recruit'] }] }).state;
    // Move the new card to the top of the deck, then draw it next turn and play it.
    const deckList = g2.players[0].deck;
    const idx = deckList.findIndex((c) => c.cardId === newCard);
    expect(idx).toBeGreaterThanOrEqual(0);
    deckList.unshift(...deckList.splice(idx, 1));
    g2 = applyAction(g2, { type: 'END_TURN', player: 0 }).state;
    g2 = applyAction(g2, { type: 'END_TURN', player: 1 }).state;
    const inHand = g2.players[0].hand.find((c) => c.cardId === newCard);
    expect(inHand).toBeDefined();
    g2.players[0].energy = 10;
    g2.players[0].maxEnergy = 10;
    const legal = (await import('@/engine/legal')).getLegalActions(g2, 0).filter((a) => a.type === 'PLAY_CARD' && a.cardUid === inHand!.uid);
    expect(legal.length).toBeGreaterThan(0);
    const played = applyAction(g2, legal[0]);
    expect(played.error).toBeUndefined();
    expect(played.events.some((e) => e.type === 'CARD_PLAYED' && e.cardId === newCard)).toBe(true);

    // Reload: everything persisted.
    await svc.flush();
    const reloaded = new GameService(new IndexedDbStore(dbName));
    expect((await reloaded.init()).kind).toBe('LOADED');
    const r = reloaded.current!;
    expect(r.profile.gold).toBe(svc.current!.profile.gold);
    expect(r.profile.packsOpened).toBe(svc.current!.profile.packsOpened);
    expect(r.decks.find((d) => d.id === deck.id)!.cards[newCard!]).toBe(1);
    expect(ownedCopies(r.collection, newCard!)).toBe(ownedCopies(svc.current!.collection, newCard!));
    expect(r.matchHistory.length).toBe(1);
    expect(deckToList(r.decks[0]).length).toBe(30);
  }, 60_000);
});
