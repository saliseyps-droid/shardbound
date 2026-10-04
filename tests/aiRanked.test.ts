import { describe, expect, it } from 'vitest';
import {
  AI_RANKED_CONFIG,
  CROWN_RANK,
  aiRankedOpponent,
  aiStrengthFor,
  aiTierOf,
  applyAiRankedResult,
  newAiRanked,
  rankName,
  repairAiRanked,
  type AiRankedState,
} from '@/domain/aiRanked';
import { makeAiConfig } from '@/ai/config';
import { DIFFICULTIES } from '@/config/progression';
import { createNewSave } from '@/domain/newAccount';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';
import { abandonedSummary, repairActiveMatch, settleAbandonedMatch, setActiveMatch } from '@/domain/activeMatch';
import { migrateSave } from '@/persistence/migrations';
import { CURRENT_SAVE_VERSION } from '@/domain/save';
import { opponentSide } from '@/domain/matchSetup';

const at = (rank: number, stars = 0, extra: Partial<AiRankedState> = {}): AiRankedState => ({ ...newAiRanked(), rank, stars, best: Math.max(rank, extra.best ?? 0), ...extra });
const win = (s: AiRankedState) => applyAiRankedResult(s, 'WIN');
const loss = (s: AiRankedState) => applyAiRankedResult(s, 'LOSS');

describe('AI ranked ladder', () => {
  it('names ranks from Bronze III to Crown', () => {
    expect(rankName(0)).toBe('Bronze III');
    expect(rankName(2)).toBe('Bronze I');
    expect(rankName(7)).toBe('Gold II');
    expect(rankName(14)).toBe('Diamond I');
    expect(rankName(CROWN_RANK)).toBe('Crown');
    expect(aiTierOf(9)).toBe('Platinum');
  });

  it('starts at Bronze III with nothing', () => {
    expect(newAiRanked()).toEqual({ rank: 0, stars: 0, streak: 0, wins: 0, losses: 0, best: 0, tierRewardsClaimed: [] });
  });

  it('a win adds a star and three stars rank up', () => {
    let s = newAiRanked();
    s = win(s).state;
    expect([s.rank, s.stars, s.streak, s.wins]).toEqual([0, 1, 1, 1]);
    s = win(s).state;
    const r = win(s);
    // Third win in a row: +1 bonus star, 2 + 2 = 4 → Bronze II with 1 star.
    expect(r.rankChange).toBe('UP');
    expect([r.state.rank, r.state.stars]).toEqual([1, 1]);
    expect(r.starDelta).toBe(2);
    expect(r.state.best).toBe(1);
  });

  it('gives no streak bonus at Diamond and above', () => {
    const r = win(at(12, 0, { streak: 5 }));
    expect([r.state.rank, r.state.stars, r.state.streak]).toEqual([12, 1, 6]);
  });

  it('a loss removes a star and resets the streak', () => {
    const r = loss(at(1, 2, { streak: 4 }));
    expect([r.state.rank, r.state.stars, r.state.streak, r.state.losses]).toEqual([1, 1, 0, 1]);
    expect(r.rankChange).toBe('NONE');
  });

  it('a loss at 0 stars drops a rank with 2 stars', () => {
    const r = loss(at(4, 0));
    expect([r.state.rank, r.state.stars]).toEqual([3, 2]);
    expect(r.rankChange).toBe('DOWN');
    expect(loss(at(10, 0)).state.rank).toBe(9);
    expect(loss(at(9, 0)).state.rank).toBe(8); // Platinum III can fall to Gold I
  });

  it('never drops below Bronze III or a reached tier floor', () => {
    expect(loss(at(0, 0)).state).toMatchObject({ rank: 0, stars: 0 });
    expect(loss(at(3, 0)).state).toMatchObject({ rank: 3, stars: 0 }); // Silver III
    expect(loss(at(6, 0)).state).toMatchObject({ rank: 6, stars: 0 }); // Gold III
    expect(loss(at(12, 0)).state).toMatchObject({ rank: 12, stars: 0 }); // Diamond III
    expect(loss(at(6, 0)).rankChange).toBe('NONE');
  });

  it('a draw changes nothing on the ladder', () => {
    const s = at(5, 2, { streak: 2 });
    const r = applyAiRankedResult(s, 'DRAW');
    expect(r.state).toEqual(s);
    expect(r.starDelta).toBe(0);
  });

  it('reaches Crown and counts Crown points', () => {
    const r = win(at(14, 2));
    expect(r.state.rank).toBe(CROWN_RANK);
    expect(r.state.stars).toBe(0);
    expect(r.tierReached).toBe('Crown');
    let s = r.state;
    for (let i = 0; i < 7; i++) s = win(s).state;
    expect([s.rank, s.stars]).toEqual([CROWN_RANK, 7]);
    // Losses at Crown never demote and keep the points earned.
    const l = loss(s);
    expect([l.state.rank, l.state.stars]).toEqual([CROWN_RANK, 7]);
  });

  it('reports a tier only the first time it is reached', () => {
    expect(win(at(2, 2)).tierReached).toBe('Silver');
    // Fell back to Bronze is impossible, but re-entering Gold from Platinum is not a new tier.
    expect(win(at(8, 2, { best: 9 })).tierReached).toBeUndefined();
  });

  it('repairs broken or missing state', () => {
    expect(repairAiRanked(undefined)).toEqual(newAiRanked());
    expect(repairAiRanked({ rank: 99, stars: -3, streak: 'x', wins: 2.7, losses: NaN, best: 3, tierRewardsClaimed: ['Silver', 4, 'Nope'] })).toEqual({
      rank: CROWN_RANK,
      stars: 0,
      streak: 0,
      wins: 2,
      losses: 0,
      best: CROWN_RANK,
      tierRewardsClaimed: ['Silver'],
    });
    expect(repairAiRanked({ rank: 4, stars: 9 })).toMatchObject({ rank: 4, stars: 2, best: 4 });
  });

  it('migrations add the ladder to old saves and keep a valid one', () => {
    const s = createNewSave('A', 'flame', 1, 'p');
    expect(s.profile.aiRanked).toEqual(newAiRanked());
    const { aiRanked: _omit, ...oldProfile } = s.profile;
    void _omit;
    expect(migrateSave({ ...s, saveVersion: CURRENT_SAVE_VERSION, profile: oldProfile }).save.profile.aiRanked).toEqual(newAiRanked());
    const kept = at(7, 1, { wins: 9, tierRewardsClaimed: ['Silver', 'Gold'] });
    expect(migrateSave({ ...s, profile: { ...s.profile, aiRanked: kept } }).save.profile.aiRanked).toEqual(kept);
  });
});

describe('AI strength per rank', () => {
  it('difficulty never decreases as the rank rises', () => {
    const order = Array.from({ length: CROWN_RANK + 1 }, (_, r) => DIFFICULTIES.indexOf(aiStrengthFor(r).difficulty));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]);
    expect(aiStrengthFor(0).difficulty).toBe('EASY');
    expect(aiStrengthFor(3).difficulty).toBe('NORMAL');
    expect(aiStrengthFor(6).difficulty).toBe('HARD');
    expect(aiStrengthFor(9).difficulty).toBe('EXPERT');
  });

  it('gets sharper within a tier: fewer blunders and less noise per division', () => {
    for (let r = 1; r <= CROWN_RANK; r++) {
      const a = aiStrengthFor(r - 1);
      const b = aiStrengthFor(r);
      if (a.difficulty !== b.difficulty) continue;
      const ca = makeAiConfig(a.difficulty, 'BALANCED', a.tuning);
      const cb = makeAiConfig(b.difficulty, 'BALANCED', b.tuning);
      expect(cb.blunderChance + cb.noise + cb.passChance).toBeLessThanOrEqual(ca.blunderChance + ca.noise + ca.passChance);
    }
    const b3 = makeAiConfig('EASY', 'BALANCED', aiStrengthFor(0).tuning);
    const b1 = makeAiConfig('EASY', 'BALANCED', aiStrengthFor(2).tuning);
    expect(b1.blunderChance).toBeLessThan(b3.blunderChance);
    expect(b1.noise).toBeLessThan(b3.noise);
  });

  it('widens the card pool and adds boss bonuses at the top', () => {
    expect(aiStrengthFor(0).rarities).toEqual(['COMMON']);
    expect(aiStrengthFor(4).rarities).toEqual(['COMMON', 'RARE']);
    expect(aiStrengthFor(7).rarities).toEqual(['COMMON', 'RARE', 'EPIC']);
    expect(aiStrengthFor(10).rarities).toContain('LEGENDARY');
    expect(aiStrengthFor(10).heroHealth).toBeUndefined();
    expect(aiStrengthFor(13).heroHealth).toBe(35);
    expect(aiStrengthFor(CROWN_RANK)).toMatchObject({ heroHealth: 35, bonusStartingEnergy: 1 });
  });

  it('builds a seeded opponent with the rank strength', () => {
    const a = aiRankedOpponent(13, 42);
    expect(aiRankedOpponent(13, 42)).toEqual(a);
    expect(a.difficulty).toBe('EXPERT');
    expect(a.special?.heroHealth).toBe(35);
    expect(a.special?.talents).toBeUndefined();
    const side = opponentSide(a, () => 0.5);
    expect(side.heroHealth).toBe(35);
    expect(side.deck).toHaveLength(30);
    expect(side.talents?.length).toBeGreaterThan(0);
    const factions = new Set(Array.from({ length: 40 }, (_, i) => aiRankedOpponent(0, i).faction));
    expect(factions.size).toBeGreaterThan(3);
  });
});

describe('recording AI ranked matches', () => {
  const summary = (result: MatchSummary['result'], extra: Partial<MatchSummary> = {}): MatchSummary => ({
    mode: 'AI_RANKED',
    opponentId: 'x',
    opponentName: 'Bot',
    difficulty: 'EASY',
    deckId: 'd',
    deckName: 'Deck',
    deckFaction: 'EMBER',
    result,
    turns: 8,
    durationMs: 1000,
    stats: { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 0, unitsPlayed: 0, spellsPlayed: 0, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 },
    conceded: false,
    ...extra,
  });
  const NOW = Date.UTC(2026, 9, 4, 12);

  it('a win moves the ladder and pays the tier gold', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    // Skip the first-win-of-day bonus to isolate the win gold.
    const s0 = { ...save, profile: { ...save.profile, firstWinDay: new Date(NOW).toISOString().slice(0, 10), aiRanked: at(7, 0) } };
    const { save: s1, rewards } = applyMatchResult(s0, summary('WIN', { difficulty: 'HARD' }), NOW);
    expect(s1.profile.aiRanked).toMatchObject({ rank: 7, stars: 1, wins: 1 });
    expect(rewards.lines[0]).toMatchObject({ label: 'Victory', gold: AI_RANKED_CONFIG.winGold.Gold });
    expect(rewards.aiRanked).toMatchObject({ before: { rank: 7, stars: 0 }, after: { rank: 7, stars: 1 }, starDelta: 1, rankChange: 'NONE' });
    expect(s1.matchHistory[0].mode).toBe('AI_RANKED');
    expect(s1.profile.wins).toBe(save.profile.wins + 1);
  });

  it('a loss, even a quick concession, costs a star', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const s0 = { ...save, profile: { ...save.profile, aiRanked: at(4, 1) } };
    const { save: s1, rewards } = applyMatchResult(s0, summary('LOSS', { turns: 1, conceded: true }), NOW);
    expect(s1.profile.aiRanked).toMatchObject({ rank: 4, stars: 0, losses: 1 });
    expect(rewards.aiRanked?.starDelta).toBe(-1);
  });

  it('grants each tier reward once', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const s0 = { ...save, profile: { ...save.profile, aiRanked: at(2, 2) } };
    const { save: s1, rewards } = applyMatchResult(s0, summary('WIN'), NOW);
    const silver = AI_RANKED_CONFIG.tierRewards.Silver;
    expect(rewards.aiRanked?.tierReached).toBe('Silver');
    const line = rewards.lines.find((l) => l.label === 'Silver tier reached');
    expect(line).toMatchObject({ gold: silver.gold, packs: silver.packs });
    expect(s1.economy.packs.CORE).toBe((s0.economy.packs.CORE ?? 0) + silver.packs.amount);
    expect(s1.profile.aiRanked.tierRewardsClaimed).toEqual(['Silver']);
    // Drop back (not possible below the floor, but force it) and climb again: no second reward.
    const s2 = { ...s1, profile: { ...s1.profile, aiRanked: { ...s1.profile.aiRanked, rank: 2, stars: 2 } } };
    const again = applyMatchResult(s2, summary('WIN'), NOW + 1000);
    expect(again.rewards.lines.find((l) => l.label === 'Silver tier reached')).toBeUndefined();
    expect(again.save.economy.packs.CORE).toBe(s1.economy.packs.CORE);
  });

  it('pays essence for the higher tier rewards', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const s0 = { ...save, profile: { ...save.profile, aiRanked: at(8, 2, { tierRewardsClaimed: ['Silver', 'Gold'] }) } };
    const { save: s1 } = applyMatchResult(s0, summary('WIN'), NOW);
    expect(s1.profile.essence).toBe(save.profile.essence + AI_RANKED_CONFIG.tierRewards.Platinum.essence);
    expect(s1.economy.packs.ABYSS).toBe((save.economy.packs.ABYSS ?? 0) + 1);
  });

  it('reloading mid-match records an AI ranked loss', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const marker = { id: 'am', mode: 'AI_RANKED' as const, startedAt: NOW - 1000, opponentId: 'o', opponentName: 'Bot', difficulty: 'HARD' as const, deckId: 'd', deckName: 'Deck', deckFaction: 'EMBER' as const };
    expect(repairActiveMatch(marker)?.mode).toBe('AI_RANKED');
    expect(abandonedSummary(marker, NOW).mode).toBe('AI_RANKED');
    const s0 = setActiveMatch({ ...save, profile: { ...save.profile, aiRanked: at(5, 1) } }, marker);
    const { save: s1, settled } = settleAbandonedMatch(s0, NOW);
    expect(settled?.mode).toBe('AI_RANKED');
    expect(s1.profile.aiRanked).toMatchObject({ rank: 5, stars: 0, losses: 1 });
    expect(s1.profile.activeMatch).toBeNull();
  });
});
