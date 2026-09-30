import type { SetId } from '@/game/types';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';
export const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'EXPERT'];

export const XP_REWARDS = {
  win: 100,
  loss: 40,
  firstWinOfDay: 150,
  pveFirstClear: 120,
  tutorialComplete: 200,
};

export const MATCH_REWARDS = {
  goldPerWin: 25,
  goldPerLoss: 5,
  difficultyGoldBonus: { EASY: 0, NORMAL: 5, HARD: 15, EXPERT: 25 } as Record<Difficulty, number>,
  difficultyXpMultiplier: { EASY: 0.8, NORMAL: 1, HARD: 1.2, EXPERT: 1.5 } as Record<Difficulty, number>,
  firstWinOfDayGold: 50,
  /** Wins per day that grant full gold (soft anti-farm cap). */
  dailyFullGoldWins: 10,
  reducedGoldMultiplier: 0.4,
  /** Minimum turns for a match to award anything (prevents instant-concede farming). */
  minTurnsForRewards: 3,
  tutorialGold: 100,
};

export type LevelReward =
  | { kind: 'GOLD'; amount: number }
  | { kind: 'ESSENCE'; amount: number }
  | { kind: 'PACK'; setId: SetId; amount: number }
  | { kind: 'TITLE'; title: string };

export interface LevelDefinition {
  level: number;
  /** XP needed to go from this level to the next (0 at max level). */
  xpToNext: number;
  /** Rewards granted upon reaching this level. */
  rewards: LevelReward[];
}

const TITLES = ['Shardseeker', 'Crownbreaker', 'Aether Warden', 'Sovereign of Shards'];

function levelReward(level: number): LevelReward[] {
  if (level % 10 === 0) {
    return [
      { kind: 'PACK', setId: 'DEEP', amount: 3 },
      { kind: 'TITLE', title: TITLES[level / 10 - 1] ?? 'Veteran' },
    ];
  }
  if (level % 5 === 0) return [{ kind: 'PACK', setId: 'CORE', amount: 2 }, { kind: 'ESSENCE', amount: 100 }];
  if (level % 3 === 0) return [{ kind: 'PACK', setId: 'CORE', amount: 1 }];
  if (level % 2 === 0) return [{ kind: 'ESSENCE', amount: 60 }];
  return [{ kind: 'GOLD', amount: 50 + level * 5 }];
}

export const MAX_LEVEL = 40;

export const LEVELS: LevelDefinition[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  return {
    level,
    xpToNext: level >= MAX_LEVEL ? 0 : Math.round(200 + level * 60 + Math.pow(level, 1.6) * 8),
    rewards: level === 1 ? [] : levelReward(level),
  };
});
