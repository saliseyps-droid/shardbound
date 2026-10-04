import type { SetId } from '@/game/types';
import { CROWN_RANK, aiTierOf, repairAiRanked, type AiRankedState, type AiTierName, type SeasonRewardGrant } from './aiRanked';
import { RANKED_CONFIG, type RankedState } from './ranked';
import { isLaterKey, trustedNow } from './clock';
import { pushReward, type GameSave } from './save';

/**
 * Monthly seasons for Ranked vs AI and the PvP ladder. A season is a UTC calendar month ('YYYY-MM').
 * When a new month starts, the player gets a reward for the best Ranked vs AI rank reached last
 * season (if they played it), and both ladders are soft-reset. Works offline; the online
 * leaderboards (src/social) are per season too.
 *
 * Clock safety: the month comes from trustedNow (never earlier than the latest time the save has
 * seen) and a season only rolls when its key is later than the stored one, so turning the clock back
 * and forth can never pay the same season twice.
 */

const DAY_MS = 86_400_000;
/** Packs from season rewards come from the newest set. */
export const SEASON_PACK_SET: SetId = 'ABYSS';
/** Ranks dropped at the start of a season (never below Bronze III; Crown lands in Diamond III). */
export const SEASON_RESET_RANKS = 6;
const CROWN_RESET_RANK = 12;

export interface SeasonReward {
  gold: number;
  packs: number;
  essence: number;
}

/** Paid by the best Ranked vs AI tier reached in the season. */
export const SEASON_REWARDS: Record<AiTierName, SeasonReward> = {
  Bronze: { gold: 100, packs: 0, essence: 0 },
  Silver: { gold: 200, packs: 1, essence: 0 },
  Gold: { gold: 300, packs: 2, essence: 0 },
  Platinum: { gold: 400, packs: 2, essence: 100 },
  Diamond: { gold: 600, packs: 3, essence: 200 },
  Crown: { gold: 1000, packs: 5, essence: 400 },
};

const pad = (n: number) => String(n).padStart(2, '0');

export function seasonKeyOf(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** First millisecond of the season and of the next one. */
export function seasonBounds(key: string): { start: number; end: number } {
  const [y, m] = key.split('-').map(Number);
  return { start: Date.UTC(y, m - 1, 1), end: Date.UTC(y, m, 1) };
}

/** Whole days until the season ends (1 on its last day). */
export function daysLeftInSeason(now: number): number {
  const { end } = seasonBounds(seasonKeyOf(now));
  return Math.max(1, Math.ceil((end - now) / DAY_MS));
}

export function seasonRewardFor(bestRank: number): SeasonReward {
  return SEASON_REWARDS[aiTierOf(bestRank)];
}

export function softResetAiRank(rank: number): number {
  if (rank >= CROWN_RANK) return CROWN_RESET_RANK;
  return Math.max(0, rank - SEASON_RESET_RANKS);
}

/** Ratings above the start rating are pulled halfway back to it. */
export function softResetRating(rating: number): number {
  const start = RANKED_CONFIG.startRating;
  return rating > start ? Math.round(start + (rating - start) / 2) : rating;
}

function rollAiLadder(ai: AiRankedState, key: string): { ai: AiRankedState; grant: SeasonRewardGrant | null } {
  if (!ai.season) return { ai: { ...ai, season: key, seasonBest: ai.rank, seasonGames: 0, seasonWins: 0 }, grant: null };
  const best = ai.seasonBest ?? ai.rank;
  let grant: SeasonRewardGrant | null = null;
  if ((ai.seasonGames ?? 0) > 0) {
    const r = seasonRewardFor(best);
    grant = { season: ai.season, bestRank: best, gold: r.gold, essence: r.essence, packs: r.packs, setId: SEASON_PACK_SET };
  }
  const rank = softResetAiRank(ai.rank);
  const next: AiRankedState = { ...ai, rank, stars: 0, streak: 0, season: key, seasonBest: rank, seasonGames: 0, seasonWins: 0 };
  if (grant) next.pendingSeasonReward = grant;
  return { ai: next, grant };
}

function rollRanked(r: RankedState, key: string): RankedState {
  if (!r.season) return { ...r, season: key, seasonGames: 0, seasonWins: 0 };
  return { ...r, rating: softResetRating(r.rating), season: key, seasonGames: 0, seasonWins: 0 };
}

/**
 * Starts a new season when the (trusted) month is later than the stored one: pays last season's
 * reward and soft-resets the ladders. Returns the same save object when nothing changes.
 */
export function applySeasonRollover(save: GameSave, now: number): { save: GameSave; grant: SeasonRewardGrant | null } {
  const key = seasonKeyOf(trustedNow(save, now));
  const ai = repairAiRanked(save.profile.aiRanked);
  const ranked = save.profile.ranked;
  const aiDue = !ai.season || isLaterKey(key, ai.season);
  const rankedDue = !ranked.season || isLaterKey(key, ranked.season);
  if (!aiDue && !rankedDue) return { save, grant: null };

  let grant: SeasonRewardGrant | null = null;
  let profile = { ...save.profile };
  if (aiDue) {
    const rolled = rollAiLadder(ai, key);
    grant = rolled.grant;
    profile = { ...profile, aiRanked: rolled.ai };
  }
  if (rankedDue) profile = { ...profile, ranked: rollRanked(ranked, key) };

  let next: GameSave = { ...save, profile };
  if (grant) {
    next = {
      ...next,
      profile: { ...next.profile, gold: next.profile.gold + grant.gold, essence: next.profile.essence + grant.essence },
      economy: grant.packs > 0 ? { ...next.economy, packs: { ...next.economy.packs, [grant.setId]: (next.economy.packs[grant.setId] ?? 0) + grant.packs } } : next.economy,
    };
    next = pushReward(
      next,
      { source: 'Season reward', gold: grant.gold, essence: grant.essence || undefined, packs: grant.packs > 0 ? { setId: grant.setId, amount: grant.packs } : undefined },
      trustedNow(save, now),
    );
  }
  return { save: next, grant };
}

/** The player has seen the season reward. */
export function acknowledgeSeasonReward(save: GameSave): GameSave {
  const ai = save.profile.aiRanked;
  if (!ai?.pendingSeasonReward) return save;
  const rest = { ...ai };
  delete rest.pendingSeasonReward;
  return { ...save, profile: { ...save.profile, aiRanked: rest } };
}
