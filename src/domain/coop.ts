import { DIFFICULTY_POOLS, PRACTICE_OPPONENTS, type OpponentDef } from '@/data/opponents';
import { DIFFICULTIES, type Difficulty } from '@/config/progression';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';

/**
 * Co-op practice (2 v 1): two Wardens on one side against a rival who plays as a boss. The teammate
 * is the AI (offline) or a friend who joined the host's room (online; the host's AI plays the boss).
 */

/** The co-op boss's Health (two Wardens share the fight). */
export const COOP_BOSS_HEALTH = 50;

/** The practice rival of `faction` as the co-op boss. */
export function coopBoss(faction: PlayableFaction, difficulty: Difficulty): OpponentDef {
  const opp = PRACTICE_OPPONENTS[faction];
  return { ...opp, id: `coop_${opp.id}`, difficulty, rarities: DIFFICULTY_POOLS[difficulty], special: { heroHealth: COOP_BOSS_HEALTH, bonusStartingEnergy: 1, description: [] } };
}

/** The AI teammate of `faction`. */
export function coopAlly(faction: PlayableFaction): OpponentDef {
  const a = PRACTICE_OPPONENTS[faction];
  return { ...a, id: `ally_${a.id}`, difficulty: 'HARD', rarities: DIFFICULTY_POOLS.HARD };
}

/** What an online co-op host tells the guest in its welcome (`meta.coop`). */
export interface CoopMeta {
  boss: PlayableFaction;
  difficulty: Difficulty;
}

/** Reads `meta.coop` from the host's welcome; null when the room is a normal 1 v 1 match. */
export function readCoopMeta(meta: Record<string, unknown>): CoopMeta | null {
  const c = meta.coop as Partial<CoopMeta> | undefined;
  if (!c || typeof c !== 'object') return null;
  if (!(PLAYABLE_FACTIONS as readonly string[]).includes(c.boss as string) || !(DIFFICULTIES as readonly string[]).includes(c.difficulty as string)) return null;
  return { boss: c.boss as PlayableFaction, difficulty: c.difficulty as Difficulty };
}
