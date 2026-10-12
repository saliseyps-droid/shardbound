import { describe, expect, it } from 'vitest';
import { act, giveCard, newGame, setEnergy, unitAt } from './helpers';
import { getCard, collectibleCards } from '@/data/cards';
import { currentHealth, hasKeyword, unitAttack } from '@/engine/queries';
import { applyAction } from '@/engine';

/** Void Reckoning: Consume and Corrupt. */
describe('Consume', () => {
  it('eats another friendly unit and takes its Attack and Health', () => {
    let s = newGame({ board0: ['neu_scarred_pitfighter'] });
    setEnergy(s, 0, 10);
    const eaten = unitAt(s, 0, 0);
    const atk = unitAttack(s, eaten);
    const hp = currentHealth(eaten);
    const uid = giveCard(s, 0, 'vod_hollow_glutton');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: { type: 'unit', uid: eaten.uid } });
    expect(s.players[0].board).toHaveLength(1);
    const glutton = s.players[0].board[0];
    expect(glutton.cardId).toBe('vod_hollow_glutton');
    expect(unitAttack(s, glutton)).toBe(getCard('vod_hollow_glutton')!.attack! + atk);
    expect(currentHealth(glutton)).toBe(getCard('vod_hollow_glutton')!.health! + hp);
    // It counts as a friendly death.
    expect(s.players[0].allyDiedThisTurn).toBe(true);
  });

  it('can be played with nothing to eat', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'vod_hollow_glutton');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[0].board.map((u) => u.cardId)).toEqual(['vod_hollow_glutton']);
  });
});

describe('Corrupt', () => {
  it('silences the unit and shrinks it by 1/1 at the start of each of its turns until it dies', () => {
    let s = newGame({ board1: ['neu_scarred_pitfighter'] });
    setEnergy(s, 0, 10);
    const target = unitAt(s, 1, 0);
    const hp = currentHealth(target);
    const uid = giveCard(s, 0, 'vod_sunless_hymn');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: { type: 'unit', uid: target.uid } });
    const u = s.players[1].board[0];
    expect(u.corrupt).toBe(true);
    expect(u.silenced).toBe(true);
    expect(currentHealth(u)).toBe(hp);
    s = act(s, { type: 'END_TURN', player: 0 });
    // The enemy's turn started: it decays.
    if (hp > 1) expect(currentHealth(s.players[1].board[0])).toBe(hp - 1);
    for (let i = 0; i < 2 * hp + 2; i++) {
      s = act(s, { type: 'END_TURN', player: s.activePlayer });
    }
    expect(s.players[1].board.some((x) => x.uid === target.uid)).toBe(false);
  });

  it('is cleansed away, and so are Frozen and Burn', () => {
    let s = newGame({ board0: ['neu_scarred_pitfighter'] });
    const u = unitAt(s, 0, 0);
    u.corrupt = true;
    u.frozen = true;
    u.burn = 2;
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'ast_purify');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    const after = s.players[0].board[0];
    expect(after.corrupt).toBe(false);
    expect(after.frozen).toBe(false);
    expect(after.burn).toBe(0);
  });

  it('Cleanse gives a Corrupted unit its text back (keywords and abilities, so their badges show)', () => {
    let s = newGame({ board1: ['ver_mossback_grazer'] });
    setEnergy(s, 0, 10);
    const target = unitAt(s, 1, 0);
    const hymn = giveCard(s, 0, 'vod_sunless_hymn');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: hymn, target: { type: 'unit', uid: target.uid } });
    expect(hasKeyword(s, s.players[1].board[0], 'REGENERATE')).toBe(false);
    s = act(s, { type: 'END_TURN', player: 0 });
    setEnergy(s, 1, 10);
    const mender = giveCard(s, 1, 'ver_grove_mender');
    s = act(s, { type: 'PLAY_CARD', player: 1, cardUid: mender });
    const after = s.players[1].board.find((x) => x.uid === target.uid)!;
    expect(after.corrupt).toBe(false);
    expect(after.silenced).toBe(false);
    expect(hasKeyword(s, after, 'REGENERATE')).toBe(true);
  });

  it('Cleanse does not undo a plain Silence', () => {
    let s = newGame({ board0: ['ver_mossback_grazer'] });
    const u = unitAt(s, 0, 0);
    u.silenced = true;
    u.keywords = [];
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'ast_purify');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[0].board[0].silenced).toBe(true);
    expect(hasKeyword(s, s.players[0].board[0], 'REGENERATE')).toBe(false);
  });

  it('extra damage against Corrupted units', () => {
    let s = newGame({ board1: ['neu_crag_colossus'] });
    setEnergy(s, 0, 10);
    const target = unitAt(s, 1, 0);
    const hp = currentHealth(target);
    target.corrupt = true;
    const uid = giveCard(s, 0, 'emb_purging_bolt');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: { type: 'unit', uid: target.uid } });
    expect(currentHealth(s.players[1].board[0])).toBe(hp - 4);
  });
});

describe('the Void Reckoning set', () => {
  const set = collectibleCards().filter((c) => c.set === 'RECKONING');
  it('has about seventy cards across every faction', () => {
    expect(set.length).toBeGreaterThanOrEqual(68);
    const count = (r: string) => set.filter((c) => c.rarity === r).length;
    expect(count('LEGENDARY')).toBeGreaterThanOrEqual(8);
    expect(new Set(set.map((c) => c.faction)).size).toBe(7);
  });

  it('every card can be played on an empty board without breaking the game', () => {
    for (const card of set) {
      const s = newGame();
      setEnergy(s, 0, 10);
      const uid = giveCard(s, 0, card.id);
      const res = applyAction(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
      // Cards that need a target refuse cleanly; everything else plays.
      if (res.error) expect(res.error, card.id).toMatch(/target/i);
    }
  });
});

describe('Void Reckoning in the shop', () => {
  it('is the newest set, sold in packs with its own art, and the prize set', async () => {
    const { SET_INFO, SHOP_OFFERS } = await import('@/config/economy');
    const { TOURNAMENT_PACK_SET } = await import('@/domain/tournament');
    const { ARENA } = await import('@/config/arena');
    const { DUNGEON } = await import('@/config/dungeon');
    const { generatePack } = await import('@/domain/packs');
    const { createRng } = await import('@/core/rng');
    expect(SET_INFO.RECKONING.name).toBe('Void Reckoning');
    expect(Math.max(...Object.values(SET_INFO).map((s) => s.releaseOrder))).toBe(SET_INFO.RECKONING.releaseOrder);
    expect(SHOP_OFFERS.filter((o) => o.setId === 'RECKONING').map((o) => o.packs)).toEqual([1, 5, 10]);
    expect(TOURNAMENT_PACK_SET).toBe('RECKONING');
    expect(ARENA.packSets).toContain('RECKONING');
    expect(DUNGEON.packSet).toBe('RECKONING');
    const pack = generatePack('RECKONING', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(5));
    expect(pack.cards.every((c) => getCard(c.cardId)?.set === 'RECKONING')).toBe(true);
  });
});

describe('Archmage Elinka', () => {
  it('silences a random enemy unit, takes it for this turn with Rush, then gives it back', () => {
    let s = newGame({ board1: ['neu_crag_colossus'] });
    setEnergy(s, 0, 10);
    const enemy = unitAt(s, 1, 0);
    const uid = giveCard(s, 0, 'ast_archmage_elinka');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    const taken = s.players[0].board.find((u) => u.uid === enemy.uid)!;
    expect(taken).toBeDefined();
    expect(taken.silenced).toBe(true);
    // Rush: it can attack enemy units right away.
    expect(taken.keywords).toContain('RUSH');
    s = act(s, { type: 'END_TURN', player: 0 });
    expect(s.players[1].board.some((u) => u.uid === enemy.uid)).toBe(true);
    expect(s.players[0].board.some((u) => u.uid === enemy.uid)).toBe(false);
  });
});

describe('Simba, the Ultimate Predator', () => {
  it('Consumes on deploy and, after every kill, grows and may attack again', () => {
    let s = newGame({ board0: ['neu_scarred_pitfighter'], board1: ['token_recruit', 'token_recruit', 'token_recruit'] });
    setEnergy(s, 0, 10);
    const food = unitAt(s, 0, 0);
    const uid = giveCard(s, 0, 'vod_simba_ultimate_predator');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: { type: 'unit', uid: food.uid } });
    const simba = s.players[0].board.find((u) => u.cardId === 'vod_simba_ultimate_predator')!;
    expect(s.players[0].board).toHaveLength(1);
    const atk0 = unitAttack(s, simba);
    // Swift: it hunts right away, and each kill readies it for the next.
    for (let i = 0; i < 3; i++) {
      const prey = s.players[1].board[0];
      s = act(s, { type: 'ATTACK', player: 0, attackerUid: simba.uid, target: { type: 'unit', uid: prey.uid } });
    }
    expect(s.players[1].board).toHaveLength(0);
    expect(unitAttack(s, s.players[0].board[0])).toBe(atk0 + 3);
  });
});

describe('Steelmaker Gorn', () => {
  it('gains 4 Armor on deploy, and every time you gain Armor a random friendly unit gets +1/+1', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'irn_steelmaker_gorn');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[0].hero.armor).toBe(4);
    const gorn = s.players[0].board[0];
    // Its own Armor already forged it once.
    expect(unitAttack(s, gorn)).toBe(getCard('irn_steelmaker_gorn')!.attack! + 1);
    // Any other Armor forges again: Hungry Crucible gives 3.
    const total = (st: typeof s) => st.players[0].board.reduce((n, u) => n + unitAttack(st, u) + currentHealth(u), 0);
    const crucible = giveCard(s, 0, 'irn_hungry_crucible');
    const before = total(s);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: crucible });
    expect(s.players[0].hero.armor).toBe(7);
    const base = getCard('irn_hungry_crucible')!;
    expect(total(s)).toBe(before + base.attack! + base.health! + 2);
  });
});

describe('Sali, the Creator', () => {
  it('wipes every other unit', () => {
    let s = newGame({ board0: ['neu_scarred_pitfighter'], board1: ['neu_crag_colossus', 'token_recruit'] });
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'neu_sali_the_creator');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[0].board.map((u) => u.cardId)).toEqual(['neu_sali_the_creator']);
  });

  it('on dying becomes your Warden with 10 Health and 5 Armor', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    s.players[0].hero.health = 3;
    const uid = giveCard(s, 0, 'neu_sali_the_creator');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    const sali = s.players[0].board.find((u) => u.cardId === 'neu_sali_the_creator')!;
    // It dies (the next action resolves deaths).
    sali.pendingDestroy = true;
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_rift_spawn') });
    expect(s.players[0].board.some((u) => u.cardId === 'neu_sali_the_creator')).toBe(false);
    expect(s.players[0].hero.health).toBe(10);
    expect(s.players[0].hero.armor).toBe(5);
    expect(s.players[0].hero.name).toBe('Sali, the Creator');
    expect(s.players[0].hero.portrait).toBe('sali_the_creator');
    // Its two abilities summon the Sovereign and the Warden.
    expect(s.players[0].hero.abilities.map((a) => a.id)).toEqual(['wt_boss_sali_risen_sovereign', 'wt_boss_sali_risen_eclipse']);
    setEnergy(s, 0, 10);
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 0 });
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 1 });
    expect(s.players[0].board.map((u) => u.cardId).sort()).toEqual(['neu_rift_spawn', 'token_eclipse_warden', 'token_hollow_sovereign']);    // No cooldown: both are usable again on the very next turn.
    s = act(s, { type: 'END_TURN', player: 0 });
    s = act(s, { type: 'END_TURN', player: 1 });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 0 });
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 1 });
    expect(s.players[0].board.filter((u) => u.cardId.startsWith('token_')).length).toBe(4);
  });
});

describe('Nereth, Heart of the Maelstrom', () => {
  it('freezes every enemy, then at the end of each turn hurts the Frozen ones and freezes another', () => {
    let s = newGame({ board1: ['neu_crag_colossus', 'neu_scarred_pitfighter'] });
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'tid_nereth_heart_of_the_maelstrom');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[1].board.every((u) => u.frozen)).toBe(true);
    const hp = s.players[1].board.map((u) => currentHealth(u));
    s = act(s, { type: 'END_TURN', player: 0 });
    expect(s.players[1].board.map((u) => currentHealth(u))).toEqual(hp.map((h) => h - 2));
    expect(s.players[1].board.some((u) => u.frozen)).toBe(true);
  });
});
