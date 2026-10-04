import { CROWN_RANK, repairAiRanked } from '@/domain/aiRanked';
import { RANKED_CONFIG } from '@/domain/ranked';
import { effectivePortrait } from '@/domain/portraits';
import { seasonKeyOf } from '@/domain/season';
import type { GameSave } from '@/domain/save';
import type { Board, LeaderboardEntry, LeaderboardUpload } from './backend';

export type { Board, LeaderboardEntry, LeaderboardUpload } from './backend';

/**
 * Season leaderboards: what a player uploads and how boards are ordered. The checks below mirror
 * firestore.rules, so the client never sends an entry the server would refuse.
 */

export const LEADERBOARD_SIZE = 100;
export const NAME_MAX = 20;
const CROWN_POINTS_MAX = 99_999;

/** One sortable number for Ranked vs AI: rank first, Crown points break ties. */
export function aiScore(rank: number, crownPoints: number): number {
  return rank * 100_000 + Math.min(CROWN_POINTS_MAX, crownPoints);
}

/** The entries this save should have on this month's boards (only boards played this season). */
export function buildLeaderboardEntries(save: GameSave, now: number): Partial<Record<Board, LeaderboardUpload>> {
  const season = seasonKeyOf(now);
  const p = save.profile;
  const deck = save.decks.find((d) => d.id === p.selectedDeckId) ?? save.decks.find((d) => d.id === p.favoriteDeckId) ?? save.decks[0];
  const common = {
    name: p.username.trim().slice(0, NAME_MAX) || '?',
    avatar: deck?.heroFaction ?? '',
    portrait: (deck && effectivePortrait(deck, p)) || '',
  };
  const out: Partial<Record<Board, LeaderboardUpload>> = {};
  const ai = repairAiRanked(p.aiRanked);
  if (ai.season === season && (ai.seasonGames ?? 0) > 0) {
    const crownPoints = ai.rank >= CROWN_RANK ? Math.min(CROWN_POINTS_MAX, ai.stars) : 0;
    out.aiRanked = { ...common, wins: ai.seasonWins ?? 0, rank: ai.rank, crownPoints, score: aiScore(ai.rank, crownPoints) };
  }
  const r = p.ranked;
  if (r.season === season && (r.seasonGames ?? 0) > 0) {
    out.ranked = { ...common, wins: r.seasonWins ?? 0, rating: Math.round(Math.max(RANKED_CONFIG.floor, Math.min(RANKED_CONFIG.ceiling, r.rating))) };
  }
  return out;
}

const isInt = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const isStr = (v: unknown, min: number, max: number) => typeof v === 'string' && v.length >= min && v.length <= max;

/** Same limits as firestore.rules (validAiEntry / validRankedEntry). */
export function isValidEntry(board: Board, e: Partial<LeaderboardUpload>): boolean {
  if (!isStr(e.name, 1, NAME_MAX) || !isStr(e.avatar, 0, 40) || !isStr(e.portrait, 0, 40) || !isInt(e.wins, 0, 100_000)) return false;
  if (board === 'ranked') return isInt(e.rating, RANKED_CONFIG.floor, RANKED_CONFIG.ceiling);
  return (
    isInt(e.rank, 0, CROWN_RANK) &&
    isInt(e.crownPoints, 0, CROWN_POINTS_MAX) &&
    (e.rank === CROWN_RANK || e.crownPoints === 0) &&
    e.score === aiScore(e.rank!, e.crownPoints!)
  );
}

/** The value a board is ordered by (descending). */
export function sortValue(board: Board, e: Pick<LeaderboardUpload, 'score' | 'rating' | 'rank' | 'crownPoints'>): number {
  return board === 'ranked' ? (e.rating ?? 0) : (e.score ?? aiScore(e.rank ?? 0, e.crownPoints ?? 0));
}

export function sortEntries(board: Board, entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => sortValue(board, b) - sortValue(board, a) || b.wins - a.wins || a.updatedAt - b.updatedAt);
}

/** Identity of what the board shows, so unchanged entries are not uploaded again. */
export function entryKey(e: LeaderboardUpload): string {
  return JSON.stringify([e.name, e.avatar, e.portrait, e.wins, e.rank ?? null, e.crownPoints ?? null, e.rating ?? null]);
}

export type MyPosition = { kind: 'listed'; position: number } | { kind: 'outside'; position: number } | { kind: 'unknown' };

/** 1-based position: from the top list, else from the count of players ahead. */
export function locateMe(sorted: LeaderboardEntry[], uid: string, countAhead: number | null): MyPosition {
  const i = sorted.findIndex((e) => e.uid === uid);
  if (i >= 0) return { kind: 'listed', position: i + 1 };
  return countAhead === null ? { kind: 'unknown' } : { kind: 'outside', position: countAhead + 1 };
}
