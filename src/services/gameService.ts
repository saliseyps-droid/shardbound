import { createRng, randomSeed } from '@/core/rng';
import { err, ok, uid, type Result } from '@/core/utils';
import { collectibleCards, getCard } from '@/data/cards';
import { DECK_RULES } from '@/config/gameRules';
import { LEVELS } from '@/config/progression';
import type { PlayableFaction, SetId, Variant } from '@/game/types';
import { maxCopiesFor, type Deck } from '@/domain/decks';
import { defaultBuild, type TalentPick } from '@/data/wardenTalents';
import { acknowledgeArenaResult, chooseArenaFaction, pickArenaCard, recordArenaMatch, retireArena, setArenaTalents, startArena } from '@/domain/arena';
import { buyCardBack, buyOffer, craftCard, equipCardBack, openPack, recycleAllSurplus, recycleCard } from '@/domain/economy';
import { claimDaily } from '@/domain/daily';
import { applyMatchResult, type MatchRewards, type MatchSummary } from '@/domain/matchResults';
import { createNewSave } from '@/domain/newAccount';
import type { PackCard } from '@/domain/packs';
import { grantXp, type LevelUp } from '@/domain/progression';
import { applyQuestProgress, claimQuest, refreshQuests, rerollQuest } from '@/domain/quests';
import { emptyVariants, pushReward, type GameSave, type Quest } from '@/domain/save';
import { decodeDeck } from '@/domain/deckCode';
import { buyPortrait, choosePortrait } from '@/domain/portraits';
import { buyBundle } from '@/domain/bundles';
import { applyRedeem, findCode } from '@/domain/redeem';
import { migrateSave } from '@/persistence/migrations';
import { SaveGateway } from '@/persistence/repositories';
import { IndexedDbStore, MemoryStore, type KeyValueStore } from '@/persistence/storage';

export type InitStatus =
  | { kind: 'NEW' }
  | { kind: 'LOADED'; notes: string[] }
  | { kind: 'CORRUPTED'; error: string; backupKey?: string };

type Listener = (save: GameSave | null) => void;
type ErrorListener = (message: string) => void;

/**
 * Local implementation of the game backend. Every mutation runs a pure domain
 * function, then persists the changed slices. A remote implementation can
 * later expose the same methods over HTTP (server-side packs, economy, etc.).
 */
export class GameService {
  private save: GameSave | null = null;
  private listeners = new Set<Listener>();
  private errorListeners = new Set<ErrorListener>();
  private writeChain: Promise<void> = Promise.resolve();
  private readonly gateway: SaveGateway;
  /** Injectable clock for tests. */
  now: () => number = () => Date.now();

  constructor(store: KeyValueStore) {
    this.gateway = new SaveGateway(store);
  }

  static createDefault(): GameService {
    return new GameService(GameService.defaultStore());
  }

  /** The device's own store: IndexedDB, or memory when the browser blocks it. */
  static defaultStore(): KeyValueStore {
    return IndexedDbStore.isAvailable() ? new IndexedDbStore() : new MemoryStore();
  }

  // -------------------------------------------------------------------------
  // Subscription
  // -------------------------------------------------------------------------

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  get current(): GameSave | null {
    return this.save;
  }

  /** Resolves when all pending writes are flushed. */
  flush(): Promise<void> {
    return this.writeChain;
  }

  /** Last snapshot known to be on disk; diffs are computed against it so a failed write is retried in full. */
  private lastPersisted: GameSave | null = null;

  private commit(next: GameSave) {
    this.save = next;
    for (const l of this.listeners) l(next);
    this.writeChain = this.writeChain
      .then(() => this.gateway.persist(next, this.lastPersisted))
      .then(() => {
        this.lastPersisted = next;
      })
      .catch((e) => {
        console.error('[save] persist failed', e);
        this.lastPersisted = null;
        for (const l of this.errorListeners) l('Could not save your progress. It will be retried on the next change.');
      });
  }

  private require(): GameSave {
    if (!this.save) throw new Error('No profile loaded');
    return this.save;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async init(): Promise<InitStatus> {
    let raw: Record<string, unknown> | null;
    try {
      raw = await this.gateway.loadRaw();
    } catch (e) {
      return { kind: 'CORRUPTED', error: `Storage unavailable: ${(e as Error).message}` };
    }
    if (!raw) return { kind: 'NEW' };
    try {
      const report = migrateSave(raw);
      let save = report.save;
      save = refreshQuests(save, this.now(), createRng(randomSeed()));
      save = { ...save, profile: { ...save.profile, lastSeenAt: this.now() } };
      this.save = save;
      for (const l of this.listeners) l(save);
      // Persist the migrated/repaired save in full.
      this.writeChain = this.gateway
        .persist(save, null)
        .then(() => {
          this.lastPersisted = save;
        })
        .catch((e) => console.error('[save] persist after migration failed', e));
      return { kind: 'LOADED', notes: report.notes };
    } catch (e) {
      let backupKey: string | undefined;
      try {
        backupKey = await this.gateway.backupRaw(raw);
      } catch {
        /* ignore */
      }
      return { kind: 'CORRUPTED', error: (e as Error).message, backupKey };
    }
  }

  async createProfile(username: string, avatar: string): Promise<GameSave> {
    let save = createNewSave(username, avatar, this.now(), uid('player'));
    save = refreshQuests(save, this.now(), createRng(randomSeed()));
    this.commit(save);
    await this.flush();
    return save;
  }

  async resetAccount(): Promise<void> {
    await this.flush();
    await this.gateway.clearSave();
    this.save = null;
    this.lastPersisted = null;
    for (const l of this.listeners) l(null);
  }

  /** Daily housekeeping when the app stays open across midnight. */
  tick() {
    if (!this.save) return;
    const next = refreshQuests(this.save, this.now(), createRng(randomSeed()));
    if (next !== this.save) this.commit(next);
  }

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------

  updateProfile(patch: Partial<Pick<GameSave['profile'], 'username' | 'avatar' | 'title'>>): Result<GameSave> {
    const save = this.require();
    const username = patch.username !== undefined ? patch.username.trim().slice(0, 20) : save.profile.username;
    if (!username) return err('Name cannot be empty.');
    const next = { ...save, profile: { ...save.profile, ...patch, username } };
    this.commit(next);
    return ok(next);
  }

  // -------------------------------------------------------------------------
  // Shop & packs
  // -------------------------------------------------------------------------

  buy(offerId: string): Result<GameSave> {
    const res = buyOffer(this.require(), offerId, this.now());
    if (res.ok) this.commit(res.value);
    return res;
  }

  buyCardBack(backId: string): Result<GameSave> {
    const res = buyCardBack(this.require(), backId, this.now());
    if (res.ok) this.commit(res.value);
    return res;
  }

  equipCardBack(backId: string): Result<GameSave> {
    const res = equipCardBack(this.require(), backId);
    if (res.ok) this.commit(res.value);
    return res;
  }

  openPack(setId: SetId): Result<PackCard[]> {
    const res = openPack(this.require(), setId, createRng(randomSeed()));
    if (!res.ok) return res;
    const quest = applyQuestProgress(res.value.save, [{ type: 'OPEN_PACKS', amount: 1 }]);
    this.commit(quest.save);
    return ok(res.value.cards);
  }

  // -------------------------------------------------------------------------
  // Crafting
  // -------------------------------------------------------------------------

  craft(cardId: string, variant: Variant = 'NORMAL'): Result<GameSave> {
    const res = craftCard(this.require(), cardId, variant, this.now());
    if (!res.ok) return res;
    const quest = applyQuestProgress(res.value, [{ type: 'CRAFT_CARDS', amount: 1 }]);
    this.commit(quest.save);
    return ok(quest.save);
  }

  recycle(cardId: string, variant: Variant, count = 1): Result<number> {
    const res = recycleCard(this.require(), cardId, variant, count);
    if (!res.ok) return res;
    this.commit(res.value.save);
    return ok(res.value.essence);
  }

  recycleSurplus(): { essence: number; cards: number } {
    const res = recycleAllSurplus(this.require());
    if (res.cards > 0) this.commit(res.save);
    return { essence: res.essence, cards: res.cards };
  }

  markSeen(cardIds: string[]) {
    const save = this.require();
    const unseen = save.collection.unseen.filter((id) => !cardIds.includes(id));
    if (unseen.length !== save.collection.unseen.length) this.commit({ ...save, collection: { ...save.collection, unseen } });
  }

  // -------------------------------------------------------------------------
  // Decks
  // -------------------------------------------------------------------------

  createDeck(name: string, heroFaction: PlayableFaction, cards: Record<string, number> = {}, talents: TalentPick[] = defaultBuild(heroFaction)): Result<Deck> {
    const save = this.require();
    if (save.decks.length >= DECK_RULES.maxDecks) return err(`You can have at most ${DECK_RULES.maxDecks} decks.`);
    const now = this.now();
    const deck: Deck = { id: uid('deck'), name: name.trim().slice(0, DECK_RULES.maxDeckNameLength) || 'New Deck', heroFaction, cards, talents, favorite: false, createdAt: now, updatedAt: now };
    this.commit({ ...save, decks: [...save.decks, deck] });
    return ok(deck);
  }

  buyBundle(id: string): Result<GameSave> {
    const res = buyBundle(this.require(), id, this.now());
    if (res.ok) this.commit(res.value);
    return res;
  }

  buyPortrait(id: string): Result<GameSave> {
    const res = buyPortrait(this.require(), id, this.now());
    if (res.ok) this.commit(res.value);
    return res;
  }

  choosePortrait(faction: PlayableFaction, id: string | null): Result<GameSave> {
    const res = choosePortrait(this.require(), faction, id);
    if (res.ok) this.commit(res.value);
    return res;
  }

  /** Adds a deck from a shared deck code. Cards you don't own stay in the deck and are flagged in the editor. */
  importDeck(code: string): Result<{ deck: Deck; missingCopies: number; unknownCards: number }> {
    const decoded = decodeDeck(code);
    if (!decoded.ok) return decoded;
    const { name, heroFaction, cards, talents, unknownCards } = decoded.value;
    const created = this.createDeck(name, heroFaction, cards, talents);
    if (!created.ok) return created;
    const collection = this.require().collection;
    let missingCopies = 0;
    for (const [id, n] of Object.entries(cards)) {
      const v = collection.cards[id];
      const have = v ? v.NORMAL + v.FOIL + v.PRISMATIC : 0;
      missingCopies += Math.max(0, n - have);
    }
    return ok({ deck: created.value, missingCopies, unknownCards: unknownCards.length });
  }

  updateDeck(deck: Deck): Result<Deck> {
    const save = this.require();
    if (!save.decks.some((d) => d.id === deck.id)) return err('Deck not found.');
    const clean: Deck = {
      ...deck,
      name: deck.name.trim().slice(0, DECK_RULES.maxDeckNameLength) || 'Deck',
      cards: Object.fromEntries(Object.entries(deck.cards).filter(([id, n]) => n > 0 && getCard(id))),
      updatedAt: this.now(),
    };
    this.commit({ ...save, decks: save.decks.map((d) => (d.id === deck.id ? clean : d)) });
    return ok(clean);
  }

  deleteDeck(deckId: string): Result<void> {
    const save = this.require();
    if (save.decks.length <= 1) return err('You must keep at least one deck.');
    const decks = save.decks.filter((d) => d.id !== deckId);
    const profile = { ...save.profile };
    if (profile.selectedDeckId === deckId) profile.selectedDeckId = decks[0]?.id ?? null;
    if (profile.favoriteDeckId === deckId) profile.favoriteDeckId = null;
    this.commit({ ...save, decks, profile });
    return ok(undefined);
  }

  duplicateDeck(deckId: string): Result<Deck> {
    const save = this.require();
    const src = save.decks.find((d) => d.id === deckId);
    if (!src) return err('Deck not found.');
    return this.createDeck(`${src.name} Copy`.slice(0, DECK_RULES.maxDeckNameLength), src.heroFaction, { ...src.cards }, src.talents.map((t) => ({ ...t })));
  }

  setFavoriteDeck(deckId: string) {
    const save = this.require();
    const decks = save.decks.map((d) => ({ ...d, favorite: d.id === deckId ? !d.favorite : false }));
    const fav = decks.find((d) => d.favorite)?.id ?? null;
    this.commit({ ...save, decks, profile: { ...save.profile, favoriteDeckId: fav } });
  }

  selectDeck(deckId: string) {
    const save = this.require();
    if (save.decks.some((d) => d.id === deckId)) this.commit({ ...save, profile: { ...save.profile, selectedDeckId: deckId } });
  }

  // -------------------------------------------------------------------------
  // Quests & daily
  // -------------------------------------------------------------------------

  claimQuest(questId: string): Result<{ gold: number; xp: number; packs?: Quest['packs']; levelUps: LevelUp[] }> {
    const res = claimQuest(this.require(), questId, this.now());
    if (!res.ok) return res;
    this.commit(res.value.save);
    return ok({ gold: res.value.quest.gold, xp: res.value.quest.xp, packs: res.value.quest.packs, levelUps: res.value.levelUps });
  }

  rerollQuest(questId: string): Result<GameSave> {
    const res = rerollQuest(this.require(), questId, this.now(), createRng(randomSeed()));
    if (res.ok) this.commit(res.value);
    return res;
  }

  claimDaily() {
    const res = claimDaily(this.require(), this.now(), createRng(randomSeed()));
    if (res.ok) this.commit(res.value.save);
    return res.ok ? ok({ reward: res.value.reward, cardId: res.value.cardId }) : res;
  }

  /** Tournament placement prize (awarded once per finished tournament by the tournament store). */
  grantTournamentPrize(gold: number, source: string, packs = 0) {
    const save = this.require();
    const economy = packs > 0 ? { ...save.economy, packs: { ...save.economy.packs, ABYSS: (save.economy.packs.ABYSS ?? 0) + packs } } : save.economy;
    this.commit(pushReward({ ...save, economy, profile: { ...save.profile, gold: save.profile.gold + gold } }, { source, gold, packs: packs > 0 ? { setId: 'ABYSS', amount: packs } : undefined }, this.now()));
  }

  // -------------------------------------------------------------------------
  // Redeem codes
  // -------------------------------------------------------------------------

  async redeemCode(code: string): Promise<Result<{ label: string; gold: number; essence: number }>> {
    const def = await findCode(code);
    const res = applyRedeem(this.require(), def, this.now());
    if (!res.ok) return res;
    this.commit(res.value.save);
    return ok({ label: res.value.def.label, gold: res.value.def.reward.gold ?? 0, essence: res.value.def.reward.essence ?? 0 });
  }

  // -------------------------------------------------------------------------
  // Matches
  // -------------------------------------------------------------------------

  recordMatch(summary: MatchSummary): MatchRewards {
    let { save, rewards } = applyMatchResult(this.require(), summary, this.now());
    if (summary.mode === 'ARENA') {
      const res = recordArenaMatch(save, summary.result, this.now());
      if (res.ok) save = res.value;
    }
    this.commit(save);
    return rewards;
  }

  // -------------------------------------------------------------------------
  // Arena
  // -------------------------------------------------------------------------

  private applyArena(res: Result<GameSave>): Result<GameSave> {
    if (res.ok) this.commit(res.value);
    return res;
  }
  arenaStart(): Result<GameSave> {
    return this.applyArena(startArena(this.require(), this.now(), randomSeed()));
  }
  arenaChooseFaction(faction: PlayableFaction): Result<GameSave> {
    return this.applyArena(chooseArenaFaction(this.require(), faction));
  }
  arenaPick(cardId: string): Result<GameSave> {
    return this.applyArena(pickArenaCard(this.require(), cardId));
  }
  arenaSetTalents(talents: TalentPick[]): Result<GameSave> {
    return this.applyArena(setArenaTalents(this.require(), talents));
  }
  arenaAcknowledge() {
    const save = this.require();
    const next = acknowledgeArenaResult(save);
    if (next !== save) this.commit(next);
  }
  arenaRetire(): Result<GameSave> {
    return this.applyArena(retireArena(this.require(), this.now()));
  }

  // -------------------------------------------------------------------------
  // Debug tools (only reachable from the dev-only debug screen)
  // -------------------------------------------------------------------------

  debugGrant(kind: 'gold' | 'essence', amount: number) {
    const save = this.require();
    this.commit({ ...save, profile: { ...save.profile, [kind]: Math.max(0, save.profile[kind] + amount) } });
  }

  debugGrantPacks(setId: SetId, amount: number) {
    const save = this.require();
    this.commit({ ...save, economy: { ...save.economy, packs: { ...save.economy.packs, [setId]: Math.max(0, (save.economy.packs[setId] ?? 0) + amount) } } });
  }

  debugUnlockAll() {
    const save = this.require();
    const cards = { ...save.collection.cards };
    for (const c of collectibleCards()) {
      const prev = cards[c.id] ?? emptyVariants();
      cards[c.id] = { ...prev, NORMAL: Math.max(prev.NORMAL, maxCopiesFor(c)) };
    }
    this.commit({ ...save, collection: { ...save.collection, cards } });
  }

  debugSetLevel(level: number) {
    const save = this.require();
    const target = Math.max(1, Math.min(LEVELS.length, Math.round(level)));
    if (target > save.profile.level) {
      const needed = LEVELS.slice(save.profile.level - 1, target - 1).reduce((a, l) => a + l.xpToNext, 0) - save.profile.xp;
      this.commit(grantXp(save, needed, this.now()).save);
    } else {
      this.commit({ ...save, profile: { ...save.profile, level: target, xp: 0 } });
    }
  }

  debugGrantXp(amount: number) {
    this.commit(grantXp(this.require(), amount, this.now()).save);
  }
}
