import type { Difficulty } from './progression';
import type { SetId } from '@/game/types';

/**
 * Dungeon run: pick a Warden, start from a small deck, beat 3 floors of 3 opponents (the third is a boss).
 * After a normal win you add cards to the deck; after a boss you take a treasure. One loss ends the run.
 */
export const DUNGEON = {
  entryGold: 200,
  floors: 3,
  perFloor: 3,
  /** Cards in the starting deck (Warden faction and Neutral commons). */
  startDeckSize: 20,
  /** Opponent difficulty by match index (0–8); every third is the floor boss. */
  difficultyByMatch: ['EASY', 'EASY', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD', 'HARD', 'EXPERT', 'EXPERT'] as Difficulty[],
  /** Campaign bosses that can guard each floor. */
  bossesByFloor: [
    ['c1_boss', 'c2_boss'],
    ['c3_b1', 'c3_b2', 'c4_boss', 'c5_b1', 'c5_b2', 'c6_boss'],
    ['c7_boss', 'c8_boss', 'c9_b1', 'c9_b2', 'c9_b3', 'c5_final', 'c3_final'],
  ],
  packSet: 'DRAGON' as SetId,
  /** Rewards by wins (index = wins, 0–9). */
  rewards: [
    { gold: 25, packs: 0, essence: 0 },
    { gold: 50, packs: 0, essence: 0 },
    { gold: 75, packs: 0, essence: 0 },
    { gold: 125, packs: 1, essence: 0 },
    { gold: 175, packs: 1, essence: 0 },
    { gold: 225, packs: 1, essence: 50 },
    { gold: 300, packs: 2, essence: 50 },
    { gold: 375, packs: 2, essence: 100 },
    { gold: 450, packs: 2, essence: 100 },
    { gold: 600, packs: 4, essence: 250 },
  ],
};

export const DUNGEON_MATCHES = DUNGEON.floors * DUNGEON.perFloor;
