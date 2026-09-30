/**
 * Deterministic, serialisable PRNG (mulberry32).
 * The state is a single 32-bit integer so it can live inside plain JSON game state.
 */
export interface RngState {
  seed: number;
}

export function createRng(seed: number): RngState {
  return { seed: seed >>> 0 };
}

/** Returns a float in [0, 1) and advances the state in place. */
export function nextFloat(rng: RngState): number {
  let t = (rng.seed = (rng.seed + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max] inclusive. */
export function nextInt(rng: RngState, min: number, max: number): number {
  return min + Math.floor(nextFloat(rng) * (max - min + 1));
}

export function pickOne<T>(rng: RngState, items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(nextFloat(rng) * items.length)];
}

export function shuffleInPlace<T>(rng: RngState, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(nextFloat(rng) * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Weighted pick. Weights need not sum to 1. */
export function pickWeighted<K extends string>(rng: RngState, weights: Readonly<Record<K, number>>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
  let roll = nextFloat(rng) * total;
  for (const [key, w] of entries) {
    roll -= Math.max(0, w);
    if (roll < 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** Stable 32-bit string hash (FNV-1a). Used for procedural art and seeds. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
