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
  | { kind: 'TITLE'; title: string }
  /** A card back the player does not own yet (Gold when they own them all). */
  | { kind: 'CARD_BACK' };

export interface LevelDefinition {
  level: number;
  /** XP needed to go from this level to the next (0 at max level). */
  xpToNext: number;
  /** Rewards granted upon reaching this level. */
  rewards: LevelReward[];
}

/** One title every 5 levels (levels 5, 10, ... 40). */
const TITLES = [
  'Wayfarer',
  'Shardseeker',
  'Bladebound',
  'Crownbreaker',
  'Stormcaller',
  'Aether Warden',
  'Rift Marshal',
  'Sovereign of Shards',
];
const titleFor = (level: number) => TITLES[level / 5 - 1] ?? 'Veteran';

/** Every title earned on the way to `level`. */
export function titlesUpTo(level: number): string[] {
  return TITLES.filter((_, i) => (i + 1) * 5 <= level);
}

/** Pack rewards cycle through the sets so every set shows up while levelling. */
const PACK_ROTATION: SetId[] = ['CORE', 'DEEP', 'ABYSS', 'DRAGON'];
const rotatingSet = (n: number): SetId => PACK_ROTATION[n % PACK_ROTATION.length];

function levelReward(level: number): LevelReward[] {
  if (level % 10 === 0) {
    return [
      { kind: 'PACK', setId: rotatingSet(level / 10 + 1), amount: 3 },
      { kind: 'CARD_BACK' },
      { kind: 'TITLE', title: titleFor(level) },
    ];
  }
  if (level % 5 === 0) {
    return [{ kind: 'PACK', setId: rotatingSet(level / 5), amount: 2 }, { kind: 'ESSENCE', amount: 100 }, { kind: 'TITLE', title: titleFor(level) }];
  }
  if (level % 3 === 0) return [{ kind: 'PACK', setId: rotatingSet(level / 3), amount: 1 }];
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
