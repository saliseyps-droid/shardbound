import type { Rarity, SetId } from '@/game/types';

export type DailyReward =
  | { kind: 'GOLD'; amount: number }
  | { kind: 'ESSENCE'; amount: number }
  | { kind: 'PACK'; setId: SetId; amount: number }
  | { kind: 'RANDOM_CARD'; rarity: Rarity };

export const DAILY_REWARDS: DailyReward[] = [
  { kind: 'GOLD', amount: 50 },
  { kind: 'GOLD', amount: 75 },
  { kind: 'RANDOM_CARD', rarity: 'RARE' },
  { kind: 'GOLD', amount: 100 },
  { kind: 'PACK', setId: 'CORE', amount: 1 },
  { kind: 'ESSENCE', amount: 150 },
  { kind: 'RANDOM_CARD', rarity: 'EPIC' },
];

export const DAILY_CONFIG = {
  /** Missing more than this many days resets the streak to day 1. */
  streakGraceDays: 1,
};
