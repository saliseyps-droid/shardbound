import type { Difficulty } from './progression';
import type { Rarity, SetId } from '@/game/types';

/** Arena: draft a deck from 3-card offers, then win as many of 4 matches as you can. */
export const ARENA = {
  entryGold: 300,
  deckSize: 30,
  maxWins: 4,
  /** Rarity of each offer (all three cards share it). */
  rarityWeights: { COMMON: 70, RARE: 22, EPIC: 6, LEGENDARY: 2 } as Record<Rarity, number>,
  /** Opponent difficulty by the number of wins so far. */
  difficultyByWins: ['NORMAL', 'NORMAL', 'HARD', 'EXPERT'] as Difficulty[],
  packSets: ['CORE', 'DEEP'] as SetId[],
  /** Rewards by wins (index = wins). */
  rewards: [
    { gold: 50, packs: 1 },
    { gold: 150, packs: 1 },
    { gold: 250, packs: 2 },
    { gold: 400, packs: 2 },
    { gold: 600, packs: 3, cardBack: true },
  ] as { gold: number; packs: number; cardBack?: boolean }[],
  /** Gold instead of the card back when the player already owns every back. */
  cardBackFallbackGold: 300,
};
