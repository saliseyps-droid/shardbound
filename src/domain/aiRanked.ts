import type { AiPersonality, AiTuning } from '@/ai/config';
import type { Difficulty } from '@/config/progression';
import { createRng, hashString, nextInt, pickOne } from '@/core/rng';
import { PRACTICE_OPPONENTS, type OpponentDef } from '@/data/opponents';
import { PLAYABLE_FACTIONS, type Rarity, type SetId } from '@/game/types';

/**
 * Ranked vs AI: a star ladder against the computer. Fifteen ranks from Bronze III to Diamond I,
 * then Crown at the top. Each rank needs three stars; the AI gets stronger with every rank.
 */
export interface AiRankedState {
  /** 0 = Bronze III … 14 = Diamond I, 15 = Crown. */
  rank: number;
  /** Stars in the current rank (0–2); at Crown, the Crown points earned. */
  stars: number;
  /** Consecutive wins. */
  streak: number;
  wins: number;
  losses: number;
  /** Drawn matches (left out while 0, so older saves and fresh ladders look the same). */
  draws?: number;
  /** Highest rank ever reached. */
  best: number;
  /** Tiers whose one-time reward has been granted. */
  tierRewardsClaimed: string[];
}

export type AiTierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Crown';
export const AI_TIERS: AiTierName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown'];
export const CROWN_RANK = 15;
export const STARS_PER_RANK = 3;
/** Ranks that, once reached, the player can never fall below. */
const FLOORS = [3, 6, 12];
/** Bonus star on the 3rd+ consecutive win, below this rank (Diamond III). */
const STREAK_BONUS_BELOW = 12;
const STREAK_BONUS_FROM = 3;

export interface TierReward {
  gold: number;
  essence: number;
  packs: { setId: SetId; amount: number };
}

export const AI_RANKED_CONFIG = {
  winGold: { Bronze: 20, Silver: 25, Gold: 30, Platinum: 35, Diamond: 40, Crown: 50 } as Record<AiTierName, number>,
  tierRewards: {
    Silver: { gold: 100, essence: 0, packs: { setId: 'CORE', amount: 1 } },
    Gold: { gold: 150, essence: 0, packs: { setId: 'DEEP', amount: 1 } },
    Platinum: { gold: 200, essence: 100, packs: { setId: 'ABYSS', amount: 1 } },
    Diamond: { gold: 300, essence: 200, packs: { setId: 'ABYSS', amount: 2 } },
    Crown: { gold: 500, essence: 300, packs: { setId: 'ABYSS', amount: 3 } },
  } as Record<Exclude<AiTierName, 'Bronze'>, TierReward>,
};

export const TIER_COLORS: Record<AiTierName, string> = {
  Bronze: '#c98b5a',
  Silver: '#c9d2dc',
  Gold: '#ffd27a',
  Platinum: '#72dfe6',
  Diamond: '#9fb4ff',
  Crown: '#ff9f5a',
};

const clampRank = (r: number) => Math.max(0, Math.min(CROWN_RANK, r));

export function newAiRanked(): AiRankedState {
  return { rank: 0, stars: 0, streak: 0, wins: 0, losses: 0, best: 0, tierRewardsClaimed: [] };
}

export function aiTierIndex(rank: number): number {
  return Math.min(5, Math.floor(clampRank(rank) / 3));
}

export function aiTierOf(rank: number): AiTierName {
  return AI_TIERS[aiTierIndex(rank)];
}

/** 3, 2 or 1 within a tier (III is the lowest); null at Crown. */
export function divisionOf(rank: number): 3 | 2 | 1 | null {
  const r = clampRank(rank);
  if (r >= CROWN_RANK) return null;
  return (3 - (r % 3)) as 3 | 2 | 1;
}

const ROMAN = { 3: 'III', 2: 'II', 1: 'I' } as const;
export function rankName(rank: number): string {
  const div = divisionOf(rank);
  return div ? `${aiTierOf(rank)} ${ROMAN[div]}` : 'Crown';
}

export function divisionNumeral(rank: number): string {
  const div = divisionOf(rank);
  return div ? ROMAN[div] : '';
}

function floorFor(best: number): number {
  let f = 0;
  for (const x of FLOORS) if (best >= x) f = x;
  return f;
}

export interface AiRankedOutcome {
  state: AiRankedState;
  rankChange: 'UP' | 'DOWN' | 'NONE';
  /** Stars won (+) or lost (−) this match, counting a rank change. */
  starDelta: number;
  /** A tier entered for the first time. */
  tierReached?: AiTierName;
}

export function applyAiRankedResult(prev: AiRankedState, result: 'WIN' | 'LOSS' | 'DRAW'): AiRankedOutcome {
  const s = repairAiRanked(prev);
  // A draw keeps the stars but breaks the win streak.
  if (result === 'DRAW') return { state: { ...s, streak: 0, draws: (s.draws ?? 0) + 1 }, rankChange: 'NONE', starDelta: 0 };
  if (result === 'WIN') {
    const streak = s.streak + 1;
    let rank = s.rank;
    let stars = s.stars;
    let gained = 1;
    if (rank < STREAK_BONUS_BELOW && streak >= STREAK_BONUS_FROM) gained++;
    if (rank >= CROWN_RANK) {
      stars += 1;
      gained = 1;
    } else {
      stars += gained;
      if (stars >= STARS_PER_RANK) {
        rank++;
        stars = rank >= CROWN_RANK ? 0 : stars - STARS_PER_RANK;
      }
    }
    const best = Math.max(s.best, rank);
    const tierReached = aiTierIndex(rank) > aiTierIndex(s.best) ? aiTierOf(rank) : undefined;
    return {
      state: { ...s, rank, stars, streak, wins: s.wins + 1, best },
      rankChange: rank > s.rank ? 'UP' : 'NONE',
      starDelta: gained,
      tierReached,
    };
  }
  // Loss.
  let rank = s.rank;
  let stars = s.stars;
  let lost = 0;
  if (rank >= CROWN_RANK) {
    // Crown is permanent and keeps its points.
  } else if (stars > 0) {
    stars--;
    lost = 1;
  } else if (rank > floorFor(s.best)) {
    rank--;
    stars = STARS_PER_RANK - 1;
    lost = 1;
  }
  return {
    state: { ...s, rank, stars, streak: 0, losses: s.losses + 1 },
    rankChange: rank < s.rank ? 'DOWN' : 'NONE',
    starDelta: -lost,
  };
}

/** Load-time repair: numbers clamped, unknown tiers dropped, missing state → a fresh ladder. */
export function repairAiRanked(raw: unknown): AiRankedState {
  if (!raw || typeof raw !== 'object') return newAiRanked();
  const r = raw as Record<string, unknown>;
  const int = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : min);
  const rank = int(r.rank, 0, CROWN_RANK);
  const stars = rank >= CROWN_RANK ? int(r.stars) : int(r.stars, 0, STARS_PER_RANK - 1);
  const claimed = Array.isArray(r.tierRewardsClaimed) ? r.tierRewardsClaimed.filter((x): x is string => typeof x === 'string' && (AI_TIERS as string[]).includes(x) && x !== 'Bronze') : [];
  const draws = int(r.draws);
  return {
    rank,
    stars,
    streak: int(r.streak),
    wins: int(r.wins),
    losses: int(r.losses),
    ...(draws > 0 ? { draws } : {}),
    best: Math.max(rank, int(r.best, 0, CROWN_RANK)),
    tierRewardsClaimed: [...new Set(claimed)],
  };
}

/** Tiers reached (by best rank) whose one-time reward has not been granted yet. */
export function unclaimedTierRewards(s: AiRankedState): Exclude<AiTierName, 'Bronze'>[] {
  const top = aiTierIndex(s.best);
  return AI_TIERS.slice(1, top + 1).filter((t) => !s.tierRewardsClaimed.includes(t)) as Exclude<AiTierName, 'Bronze'>[];
}

/** The next tier above the current rank whose reward is still to come. */
export function nextTierReward(s: AiRankedState): { tier: Exclude<AiTierName, 'Bronze'>; reward: TierReward } | null {
  for (const tier of AI_TIERS.slice(aiTierIndex(s.rank) + 1) as Exclude<AiTierName, 'Bronze'>[]) {
    if (!s.tierRewardsClaimed.includes(tier)) return { tier, reward: AI_RANKED_CONFIG.tierRewards[tier] };
  }
  return null;
}

export interface AiStrength {
  difficulty: Difficulty;
  rarities: Rarity[];
  /** Per-division sharpening on top of the difficulty preset. */
  tuning?: AiTuning;
  heroHealth?: number;
  bonusStartingEnergy?: number;
}

const COMMON: Rarity[] = ['COMMON'];
const UP_TO_RARE: Rarity[] = ['COMMON', 'RARE'];
const UP_TO_EPIC: Rarity[] = ['COMMON', 'RARE', 'EPIC'];
const ALL: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

/** Tuning per division, III → II → I (each one sharper than the last). */
const DIVISION_TUNING: Record<'Bronze' | 'Silver' | 'Gold' | 'Platinum', [AiTuning, AiTuning, AiTuning]> = {
  Bronze: [
    { blunderChance: 0.32, noise: 0.42, passChance: 0.2 },
    { blunderChance: 0.25, noise: 0.35, passChance: 0.15 },
    { blunderChance: 0.18, noise: 0.27, passChance: 0.1 },
  ],
  Silver: [
    { blunderChance: 0.08, noise: 0.13, passChance: 0 },
    { blunderChance: 0.04, noise: 0.08, passChance: 0 },
    { blunderChance: 0.02, noise: 0.05, passChance: 0 },
  ],
  Gold: [
    { blunderChance: 0.03, noise: 0.05, passChance: 0 },
    { blunderChance: 0.01, noise: 0.03, passChance: 0 },
    { blunderChance: 0, noise: 0.02, passChance: 0 },
  ],
  Platinum: [
    { blunderChance: 0.02, noise: 0.03, passChance: 0 },
    { blunderChance: 0.01, noise: 0.015, passChance: 0 },
    { blunderChance: 0, noise: 0, passChance: 0 },
  ],
};

export function aiStrengthFor(rank: number): AiStrength {
  const r = clampRank(rank);
  const tier = aiTierOf(r);
  const step = r % 3;
  switch (tier) {
    case 'Bronze':
      return { difficulty: 'EASY', rarities: COMMON, tuning: DIVISION_TUNING.Bronze[step] };
    case 'Silver':
      return { difficulty: 'NORMAL', rarities: UP_TO_RARE, tuning: DIVISION_TUNING.Silver[step] };
    case 'Gold':
      return { difficulty: 'HARD', rarities: UP_TO_EPIC, tuning: DIVISION_TUNING.Gold[step] };
    case 'Platinum':
      return { difficulty: 'EXPERT', rarities: ALL, tuning: DIVISION_TUNING.Platinum[step] };
    case 'Diamond':
      return { difficulty: 'EXPERT', rarities: ALL, heroHealth: 35 };
    default:
      return { difficulty: 'EXPERT', rarities: ALL, heroHealth: 35, bonusStartingEnergy: 1 };
  }
}

/**
 * Seed of the next rival. It comes from the saved ladder (matches played so far), so leaving and
 * re-opening the screen shows the same rival; it changes only once a match result is recorded.
 */
export function nextAiRival(s: AiRankedState): number {
  return hashString(`ai-rival:${s.wins}:${s.losses}:${s.draws ?? 0}`);
}

const PERSONALITIES: AiPersonality[] = ['BALANCED', 'AGGRESSIVE', 'CONTROL', 'SWARM'];

/** A rival for the given rank: seeded faction, Warden and personality, with the rank's strength. */
export function aiRankedOpponent(rank: number, seed: number): OpponentDef {
  const rng = createRng(seed);
  const faction = pickOne(rng, PLAYABLE_FACTIONS) ?? 'EMBER';
  const personality = pickOne(rng, PERSONALITIES) ?? 'BALANCED';
  const deckSeed = nextInt(rng, 0, 1_000_000);
  const base = PRACTICE_OPPONENTS[faction];
  const str = aiStrengthFor(rank);
  const description: string[] = [];
  if (str.heroHealth) description.push(`Starts with ${str.heroHealth} health.`);
  if (str.bonusStartingEnergy) description.push(`Starts with ${str.bonusStartingEnergy} extra energy.`);
  return {
    ...base,
    id: `airanked_${faction.toLowerCase()}_${deckSeed.toString(36)}`,
    personality,
    difficulty: str.difficulty,
    rarities: str.rarities,
    special: description.length ? { heroHealth: str.heroHealth, bonusStartingEnergy: str.bonusStartingEnergy, description } : undefined,
  };
}
