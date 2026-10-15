import { describe, expect, it } from 'vitest';
import { allEncounters, campaignOf, findEncounter } from '@/data/opponents';
import { getCard } from '@/data/cards';
import { CURSE_TEXT, NIGHTMARE_CURSES, nightmareBosses, nightmareId, nightmareLines, nightmareOpen, nightmareOpponent, parseNightmare } from '@/data/nightmare';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';
import { evaluateAchievements } from '@/domain/achievements';
import { createNewSave } from '@/domain/newAccount';
import { buildMatchSetup, opponentSide, playerSide } from '@/domain/matchSetup';
import { createGame } from '@/engine/game';
import { GAME_RULES } from '@/config/gameRules';
import { recycleAllSurplus, totalSurplusValue } from '@/domain/economy';

const boss = (id: string) => findEncounter(id)!.encounter;
const stats = { damageDealt: 10, heroDamageDealt: 10, cardsPlayed: 5, unitsPlayed: 3, spellsPlayed: 2, unitsDestroyed: 1, healingDone: 0, cardsDrawn: 6 };
const win = (encounterId: string): MatchSummary => {
  const parsed = parseNightmare(encounterId);
  const foe = parsed ? nightmareOpponent(boss(parsed.bossId), parsed.tier) : boss(encounterId);
  return {
    mode: 'PVE', opponentId: foe.id, opponentName: foe.name, difficulty: foe.difficulty, deckId: 'd', deckName: 'D', deckFaction: 'EMBER',
    result: 'WIN', turns: 8, durationMs: 1000, stats, conceded: false, pveEncounterId: foe.id, firstWinReward: foe.firstWinReward,
  };
};

describe('Nightmare', () => {
  it('has a curse for every campaign boss, made of real cards and explained to the player', () => {
    const bosses = allEncounters().filter((e) => e.boss).map((e) => e.id);
    expect(Object.keys(NIGHTMARE_CURSES).sort()).toEqual(bosses.sort());
    expect(nightmareBosses()).toHaveLength(bosses.length);
    for (const c of Object.values(NIGHTMARE_CURSES)) {
      for (const id of [...(c.rules ?? []), ...(c.startingBoard ?? []), ...(c.extraCards ?? [])]) expect(getCard(id), id).toBeDefined();
      for (const r of c.rules ?? []) expect(CURSE_TEXT[r], r).toBeDefined();
    }
  });

  it('makes the boss stronger on I and adds the curse on II', () => {
    const grom = boss('c1_boss');
    const n1 = nightmareOpponent(grom, 1);
    expect(n1).toMatchObject({ id: 'c1_boss_n1', difficulty: 'EXPERT' });
    expect(n1.special?.heroHealth).toBe(GAME_RULES.heroStartingHealth * 1.5);
    expect(n1.special?.bonusStartingEnergy).toBe(1);
    expect(n1.special?.startingBoard).toBeUndefined();
    const n2 = nightmareOpponent(grom, 2);
    expect(n2.special?.startingArmor).toBe(10);
    expect(n2.special?.startingBoard).toEqual(['token_brawl_wall', 'token_brawl_wall']);
    // Sali keeps his own rules on top.
    const sali = nightmareOpponent(boss('v3_final'), 2);
    expect(sali.special?.heroHealth).toBe(Math.round(45 * 1.5));
    expect(sali.special?.bonusStartingEnergy).toBe(2);
    expect(sali.special?.talents).toEqual(boss('v3_final').special?.talents);
    expect(sali.special?.extraCards?.filter((c) => c === 'neu_sali_the_creator')).toHaveLength(2);
    expect(sali.preCinematic).toBeUndefined();
    expect(nightmareLines(boss('w4_boss'), 2).map((l) => l.key)).toContain('Your cards cost 1 more.');
    // A Nightmare fight still belongs to its campaign (Inn tables, etc.).
    expect(campaignOf('w4_boss_n2').id).toBe('inn');
  });

  it('puts the curse into the match for the boss only', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const deck = save.decks[0];
    const setup = buildMatchSetup(playerSide(save.profile, deck), opponentSide(nightmareOpponent(boss('w4_boss'), 2)), 7);
    const { state } = createGame(setup);
    expect(state.players[1].rules?.map((r) => r.cardId)).toContain('nm_curse_toll');
    expect(state.players[0].rules ?? []).toEqual([]);
    expect(state.players[1].hero.maxHealth ?? state.players[1].hero.health).toBe(Math.round(45 * 1.5));
  });

  it('opens tier by tier and pays Foil, then Prismatic (or packs)', () => {
    let s = createNewSave('A', 'flame', 1, 'p');
    expect(nightmareOpen(s, 'w1_boss', 1)).toBe(false);
    s = applyMatchResult(s, win('w1_boss'), 10).save;
    expect(nightmareOpen(s, 'w1_boss', 1)).toBe(true);
    expect(nightmareOpen(s, 'w1_boss', 2)).toBe(false);
    const card = boss('w1_boss').firstWinReward!.cardId!;
    let r = applyMatchResult(s, win(nightmareId('w1_boss', 1)), 20);
    s = r.save;
    expect(s.collection.cards[card].FOIL).toBe(1);
    expect(r.rewards.lines.find((l) => l.cardId)?.variant).toBe('FOIL');
    expect(evaluateAchievements(s)).toContain('nm_first');
    expect(nightmareOpen(s, 'w1_boss', 2)).toBe(true);
    s = applyMatchResult(s, win(nightmareId('w1_boss', 2)), 30).save;
    expect(s.collection.cards[card].PRISMATIC).toBe(1);
    // The reward is paid once.
    r = applyMatchResult(s, win(nightmareId('w1_boss', 2)), 40);
    expect(r.save.collection.cards[card].PRISMATIC).toBe(1);
    // Normal, Foil and Prismatic of a campaign card: nothing to recycle (they cannot be recycled).
    expect(totalSurplusValue(r.save)).toEqual({ cards: 0, essence: 0 });
    expect(recycleAllSurplus(r.save).cards).toBe(0);

    // No card: 1 pack on I, 3 on II.
    expect(nightmareOpponent(boss('c1_boss'), 1).firstWinReward?.packs).toEqual({ setId: 'CORE', amount: 1 });
    expect(nightmareOpponent(boss('v3_final'), 2).firstWinReward?.packs).toEqual({ setId: 'RECKONING', amount: 3 });
    expect(nightmareOpponent(boss('c3_b1'), 2).firstWinReward?.cardId).toBeUndefined();
  });
});
