import { describe, expect, it } from 'vitest';
import { createNewSave } from '@/domain/newAccount';
import type { GameSave } from '@/domain/save';
import { aiScore, buildLeaderboardEntries, entryKey, isValidEntry, locateMe, sortEntries, type LeaderboardEntry } from '@/social/leaderboard';

const NOW = Date.UTC(2026, 9, 4, 12);

function save(ai: Partial<GameSave['profile']['aiRanked']> = {}, ranked: Partial<GameSave['profile']['ranked']> = {}): GameSave {
  const s = createNewSave('Morgana the Very Long Name Indeed', 'compass', NOW, 'p1');
  return { ...s, profile: { ...s.profile, aiRanked: { ...s.profile.aiRanked, ...ai }, ranked: { ...s.profile.ranked, ...ranked } } };
}

const e = (uid: string, over: Partial<LeaderboardEntry>): LeaderboardEntry => ({ uid, name: uid, avatar: 'EMBER', portrait: '', wins: 0, updatedAt: 0, ...over });

describe('leaderboard entries', () => {
  it('scores rank first, then Crown points', () => {
    expect(aiScore(15, 7)).toBeGreaterThan(aiScore(15, 3));
    expect(aiScore(15, 0)).toBeGreaterThan(aiScore(14, 0));
    expect(aiScore(3, 0)).toBe(300000);
  });

  it('builds entries only for boards played this season', () => {
    expect(buildLeaderboardEntries(save(), NOW)).toEqual({});
    const out = buildLeaderboardEntries(save({ rank: 15, stars: 4, season: '2026-10', seasonGames: 3, seasonWins: 2 }, { rating: 1234, season: '2026-10', seasonGames: 1, seasonWins: 1 }), NOW);
    expect(out.aiRanked).toMatchObject({ rank: 15, crownPoints: 4, score: 1500004, wins: 2 });
    expect(out.aiRanked!.name.length).toBeLessThanOrEqual(20);
    expect(out.ranked).toMatchObject({ rating: 1234, wins: 1 });
  });

  it('does not upload a ladder stamped with an older season', () => {
    expect(buildLeaderboardEntries(save({ rank: 4, season: '2026-09', seasonGames: 3 }), NOW).aiRanked).toBeUndefined();
  });

  it('validates the same ranges as the Firestore rules', () => {
    const ok = { name: 'Ann', avatar: 'VOID', portrait: '', wins: 3, rank: 4, crownPoints: 0, score: 400000 };
    expect(isValidEntry('aiRanked', ok)).toBe(true);
    expect(isValidEntry('aiRanked', { ...ok, rank: 16, score: 1600000 })).toBe(false);
    expect(isValidEntry('aiRanked', { ...ok, crownPoints: 3 })).toBe(false); // Crown points only at Crown
    expect(isValidEntry('aiRanked', { ...ok, name: 'x'.repeat(21) })).toBe(false);
    expect(isValidEntry('ranked', { name: 'Ann', avatar: 'VOID', portrait: '', wins: 3, rating: 4001 })).toBe(false);
    expect(isValidEntry('ranked', { name: 'Ann', avatar: 'VOID', portrait: '', wins: 3, rating: 100 })).toBe(true);
  });

  it('sorts and locates the player', () => {
    const list = sortEntries('aiRanked', [e('a', { rank: 3, crownPoints: 0, score: 300000 }), e('b', { rank: 15, crownPoints: 9, score: 1500009 }), e('c', { rank: 15, crownPoints: 2, score: 1500002 })]);
    expect(list.map((x) => x.uid)).toEqual(['b', 'c', 'a']);
    expect(locateMe(list, 'c', null)).toEqual({ kind: 'listed', position: 2 });
    expect(locateMe(list, 'z', 140)).toEqual({ kind: 'outside', position: 141 });
    expect(locateMe(list, 'z', null)).toEqual({ kind: 'unknown' });
    const ranked = sortEntries('ranked', [e('a', { rating: 900 }), e('b', { rating: 1500 })]);
    expect(ranked[0].uid).toBe('b');
  });

  it('entryKey changes only when the shown values change', () => {
    const a = buildLeaderboardEntries(save({ rank: 4, season: '2026-10', seasonGames: 1 }), NOW).aiRanked!;
    const b = buildLeaderboardEntries(save({ rank: 4, season: '2026-10', seasonGames: 1 }), NOW + 5000).aiRanked!;
    expect(entryKey(a)).toBe(entryKey(b));
    expect(entryKey(a)).not.toBe(entryKey({ ...a, rank: 5 }));
  });
});
