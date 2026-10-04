export interface RankedState {
  rating: number;
  peak: number;
  wins: number;
  losses: number;
}

export const RANKED_CONFIG = {
  startRating: 1000,
  kFactor: 32,
  /** Rating never drops below this floor. */
  floor: 100,
  /** Highest rating accepted from an opponent (anything above is clamped). */
  ceiling: 4000,
};

/** A rating received from another player: a finite number in range, else the start rating. */
export function sanitizeRating(v: unknown): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return RANKED_CONFIG.startRating;
  return Math.round(Math.max(RANKED_CONFIG.floor, Math.min(RANKED_CONFIG.ceiling, n)));
}

export const TIERS: { name: string; min: number; color: string }[] = [
  { name: 'Bronze', min: 0, color: '#c98b5a' },
  { name: 'Silver', min: 1100, color: '#c9d2dc' },
  { name: 'Gold', min: 1250, color: '#ffd27a' },
  { name: 'Platinum', min: 1400, color: '#72dfe6' },
  { name: 'Diamond', min: 1600, color: '#9fb4ff' },
  { name: 'Crown', min: 1850, color: '#ff9f5a' },
];

export function newRanked(): RankedState {
  return { rating: RANKED_CONFIG.startRating, peak: RANKED_CONFIG.startRating, wins: 0, losses: 0 };
}

export function tierFor(rating: number) {
  let tier = TIERS[0];
  for (const t of TIERS) if (rating >= t.min) tier = t;
  return tier;
}

/** Elo change for `mine` after a game against `theirs`. */
export function eloDelta(mine: number, theirs: number, result: 'WIN' | 'LOSS' | 'DRAW'): number {
  mine = Number.isFinite(mine) ? mine : RANKED_CONFIG.startRating;
  theirs = sanitizeRating(theirs);
  const expected = 1 / (1 + Math.pow(10, (theirs - mine) / 400));
  const score = result === 'WIN' ? 1 : result === 'DRAW' ? 0.5 : 0;
  return Math.round(RANKED_CONFIG.kFactor * (score - expected));
}

export function applyRanked(state: RankedState, opponentRating: number, result: 'WIN' | 'LOSS' | 'DRAW'): { state: RankedState; delta: number } {
  const current = Number.isFinite(state.rating) ? state.rating : RANKED_CONFIG.startRating;
  const delta = eloDelta(current, opponentRating, result);
  const rating = Math.max(RANKED_CONFIG.floor, current + delta);
  return {
    delta: rating - current,
    state: {
      rating,
      peak: Math.max(Number.isFinite(state.peak) ? state.peak : rating, rating),
      wins: state.wins + (result === 'WIN' ? 1 : 0),
      losses: state.losses + (result === 'LOSS' ? 1 : 0),
    },
  };
}
