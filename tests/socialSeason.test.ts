import { describe, expect, it } from 'vitest';
import { createNewSave } from '@/domain/newAccount';
import { applyAiRankedResult, repairAiRanked, CROWN_RANK } from '@/domain/aiRanked';
import { applyRanked } from '@/domain/ranked';
import {
  acknowledgeSeasonReward,
  applySeasonRollover,
  daysLeftInSeason,
  seasonKeyOf,
  seasonRewardFor,
  softResetAiRank,
  softResetRating,
} from '@/domain/season';
import { migrateSave } from '@/persistence/migrations';
import type { GameSave } from '@/domain/save';

const SEP_15 = Date.UTC(2026, 8, 15, 12);
const OCT_02 = Date.UTC(2026, 9, 2, 12);
const NOV_03 = Date.UTC(2026, 10, 3, 12);

function saveAt(now: number, ai: Partial<GameSave['profile']['aiRanked']> = {}, ranked: Partial<GameSave['profile']['ranked']> = {}): GameSave {
  const s = createNewSave('Tester', 'compass', now, 'p1');
  return { ...s, profile: { ...s.profile, lastSeenAt: now, aiRanked: { ...s.profile.aiRanked, ...ai }, ranked: { ...s.profile.ranked, ...ranked } } };
}

describe('season keys', () => {
  it('uses the UTC month', () => {
    expect(seasonKeyOf(SEP_15)).toBe('2026-09');
    expect(seasonKeyOf(Date.UTC(2026, 11, 31, 23, 59))).toBe('2026-12');
    expect(seasonKeyOf(Date.UTC(2027, 0, 1, 0, 0))).toBe('2027-01');
  });

  it('counts the days left in the month', () => {
    expect(daysLeftInSeason(Date.UTC(2026, 9, 31, 12))).toBe(1);
    expect(daysLeftInSeason(Date.UTC(2026, 9, 1, 0))).toBe(31);
  });
});

describe('season rewards and soft reset', () => {
  it('pays by the best tier reached', () => {
    expect(seasonRewardFor(0)).toMatchObject({ gold: 100, essence: 0, packs: 0 });
    expect(seasonRewardFor(3)).toMatchObject({ gold: 200, packs: 1 });
    expect(seasonRewardFor(8)).toMatchObject({ gold: 300, packs: 2 });
    expect(seasonRewardFor(9)).toMatchObject({ gold: 400, packs: 2, essence: 100 });
    expect(seasonRewardFor(14)).toMatchObject({ gold: 600, packs: 3, essence: 200 });
    expect(seasonRewardFor(CROWN_RANK)).toMatchObject({ gold: 1000, packs: 5, essence: 400 });
  });

  it('drops six ranks, never below Bronze III; Crown lands in Diamond III', () => {
    expect(softResetAiRank(CROWN_RANK)).toBe(12);
    expect(softResetAiRank(14)).toBe(8);
    expect(softResetAiRank(4)).toBe(0);
    expect(softResetAiRank(0)).toBe(0);
  });

  it('pulls a high PvP rating halfway back to the start', () => {
    expect(softResetRating(1400)).toBe(1200);
    expect(softResetRating(900)).toBe(900);
  });
});

describe('applySeasonRollover', () => {
  it('stamps the current season on a ladder that has none, without a reward', () => {
    const s = saveAt(OCT_02, { rank: 5 });
    const out = applySeasonRollover(s, OCT_02);
    expect(out.grant).toBeNull();
    expect(out.save.profile.aiRanked).toMatchObject({ rank: 5, season: '2026-10', seasonBest: 5 });
    expect(out.save.profile.ranked.season).toBe('2026-10');
    expect(out.save.profile.gold).toBe(s.profile.gold);
  });

  it('returns the same save when nothing changes', () => {
    const s = applySeasonRollover(saveAt(OCT_02), OCT_02).save;
    expect(applySeasonRollover(s, OCT_02 + 1000).save).toBe(s);
  });

  it('grants the reward for last season and soft-resets the ladder in a new month', () => {
    const s = saveAt(SEP_15, { rank: 13, stars: 2, streak: 4, best: 14, season: '2026-09', seasonBest: 14, seasonGames: 20, seasonWins: 14 }, { rating: 1300, season: '2026-09', seasonGames: 3, seasonWins: 2 });
    const out = applySeasonRollover(s, OCT_02);
    expect(out.grant).toMatchObject({ season: '2026-09', bestRank: 14, gold: 600, essence: 200, packs: 3 });
    const p = out.save.profile;
    expect(p.gold).toBe(s.profile.gold + 600);
    expect(p.essence).toBe(s.profile.essence + 200);
    expect((out.save.economy.packs.ABYSS ?? 0) - (s.economy.packs.ABYSS ?? 0)).toBe(3);
    expect(p.aiRanked).toMatchObject({ rank: 7, stars: 0, streak: 0, best: 14, season: '2026-10', seasonBest: 7, seasonGames: 0, seasonWins: 0 });
    expect(p.aiRanked.pendingSeasonReward?.season).toBe('2026-09');
    expect(p.ranked).toMatchObject({ rating: 1150, season: '2026-10', seasonGames: 0, seasonWins: 0 });
    expect(out.save.recentRewards[0]).toMatchObject({ source: 'Season reward', gold: 600 });
  });

  it('pays nothing for a season without ranked games, but still resets', () => {
    const s = saveAt(SEP_15, { rank: 10, best: 10, season: '2026-09', seasonBest: 10, seasonGames: 0 });
    const out = applySeasonRollover(s, OCT_02);
    expect(out.grant).toBeNull();
    expect(out.save.profile.aiRanked.rank).toBe(4);
    expect(out.save.profile.gold).toBe(s.profile.gold);
  });

  it('pays once even when several months were skipped', () => {
    const s = saveAt(SEP_15, { rank: 3, best: 3, season: '2026-08', seasonBest: 3, seasonGames: 2 });
    const once = applySeasonRollover(s, NOV_03);
    expect(once.grant?.season).toBe('2026-08');
    expect(applySeasonRollover(once.save, NOV_03 + 5000).grant).toBeNull();
  });

  it('ignores a clock turned back (the monotonic clock never goes back a month)', () => {
    const s = saveAt(OCT_02, { rank: 9, season: '2026-10', seasonBest: 9, seasonGames: 5 }, { season: '2026-10' });
    const back = applySeasonRollover(s, SEP_15);
    expect(back.grant).toBeNull();
    expect(back.save).toBe(s);
    // Forward again to the same month: still nothing.
    expect(applySeasonRollover(s, OCT_02 + 86400000).grant).toBeNull();
  });

  it('acknowledging clears the pending reward', () => {
    const s = saveAt(SEP_15, { rank: 2, season: '2026-09', seasonBest: 2, seasonGames: 1 });
    const out = applySeasonRollover(s, OCT_02).save;
    expect(out.profile.aiRanked.pendingSeasonReward).toBeTruthy();
    expect(acknowledgeSeasonReward(out).profile.aiRanked.pendingSeasonReward).toBeUndefined();
  });
});

describe('season counters', () => {
  it('ranked vs AI results count toward the season once the ladder has a season', () => {
    const base = repairAiRanked({ rank: 2, stars: 2, season: '2026-10', seasonBest: 2, seasonGames: 0, seasonWins: 0 });
    const win = applyAiRankedResult(base, 'WIN').state;
    expect(win).toMatchObject({ rank: 3, seasonBest: 3, seasonGames: 1, seasonWins: 1 });
    const loss = applyAiRankedResult(win, 'LOSS').state;
    expect(loss).toMatchObject({ seasonBest: 3, seasonGames: 2, seasonWins: 1 });
  });

  it('the rank floors follow the best rank of this season after a reset', () => {
    // All-time best is Diamond, but this season the player only reached Bronze I: a loss at 0 stars drops a rank.
    const s = repairAiRanked({ rank: 2, stars: 0, best: 14, season: '2026-10', seasonBest: 2, seasonGames: 1 });
    expect(applyAiRankedResult(s, 'LOSS').state.rank).toBe(1);
  });

  it('PvP ranked results count toward the season', () => {
    const r = applyRanked({ rating: 1000, peak: 1000, wins: 0, losses: 0, season: '2026-10', seasonGames: 0, seasonWins: 0 }, 1000, 'WIN');
    expect(r.state).toMatchObject({ rating: 1016, seasonGames: 1, seasonWins: 1, season: '2026-10' });
  });

  it('migration keeps the season fields', () => {
    const s = applySeasonRollover(saveAt(OCT_02, { rank: 4 }), OCT_02).save;
    const m = migrateSave(JSON.parse(JSON.stringify(s))).save;
    expect(m.profile.aiRanked).toMatchObject({ season: '2026-10', seasonBest: 4 });
    expect(m.profile.ranked.season).toBe('2026-10');
  });
});
