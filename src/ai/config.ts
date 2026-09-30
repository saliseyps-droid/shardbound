import type { Difficulty } from '@/config/progression';

/** Heuristic weights for board evaluation. All tunable per difficulty and personality. */
export interface EvalWeights {
  myHealth: number;
  enemyHealth: number;
  /** Extra penalty per point of own health below the danger threshold. */
  danger: number;
  dangerThreshold: number;
  unitAttack: number;
  unitHealth: number;
  /** Multiplier on enemy unit value — models threat priority. */
  enemyBoard: number;
  cardInHand: number;
  enemyCardInHand: number;
  keywordValue: number;
  abilityValue: number;
  relic: number;
  /** Bonus when our board threatens lethal next turn. */
  lethalThreat: number;
  armor: number;
}

export type AiPersonality = 'BALANCED' | 'AGGRESSIVE' | 'CONTROL' | 'SWARM';

export interface AiConfig {
  difficulty: Difficulty;
  /** Actions considered per search step (after one-ply pruning). */
  beamWidth: number;
  /** Planned actions per search. */
  depth: number;
  /** Candidate actions kept per node before deeper search. */
  branching: number;
  /** Probability to pick a random legal action instead of the best. */
  blunderChance: number;
  /** Multiplicative noise applied to evaluations. */
  noise: number;
  /** Probability to end the turn while still holding playable cards. */
  passChance: number;
  /** Simulate the opponent's attack response before committing (Expert). */
  simulateResponse: boolean;
  checkLethal: boolean;
  weights: EvalWeights;
  /** Safety cap on actions per turn. */
  maxActionsPerTurn: number;
}

export const BASE_WEIGHTS: EvalWeights = {
  myHealth: 1.0,
  enemyHealth: 1.1,
  danger: 1.4,
  dangerThreshold: 12,
  unitAttack: 1.25,
  unitHealth: 1.0,
  enemyBoard: 1.15,
  cardInHand: 1.8,
  enemyCardInHand: 1.2,
  keywordValue: 1.0,
  abilityValue: 1.0,
  relic: 2.5,
  lethalThreat: 12,
  armor: 0.9,
};

const PERSONALITY_MODS: Record<AiPersonality, Partial<EvalWeights>> = {
  BALANCED: {},
  AGGRESSIVE: { enemyHealth: 1.6, enemyBoard: 0.95, danger: 1.0, lethalThreat: 18 },
  CONTROL: { enemyBoard: 1.45, myHealth: 1.3, cardInHand: 2.2, enemyHealth: 0.9 },
  SWARM: { unitAttack: 1.4, unitHealth: 0.9, enemyHealth: 1.3 },
};

export const DIFFICULTY_CONFIGS: Record<Difficulty, Omit<AiConfig, 'weights'>> = {
  EASY: { difficulty: 'EASY', beamWidth: 1, depth: 1, branching: 6, blunderChance: 0.25, noise: 0.35, passChance: 0.15, simulateResponse: false, checkLethal: false, maxActionsPerTurn: 25 },
  NORMAL: { difficulty: 'NORMAL', beamWidth: 1, depth: 1, branching: 12, blunderChance: 0.04, noise: 0.08, passChance: 0, simulateResponse: false, checkLethal: true, maxActionsPerTurn: 30 },
  HARD: { difficulty: 'HARD', beamWidth: 3, depth: 3, branching: 8, blunderChance: 0, noise: 0.02, passChance: 0, simulateResponse: false, checkLethal: true, maxActionsPerTurn: 35 },
  EXPERT: { difficulty: 'EXPERT', beamWidth: 4, depth: 4, branching: 9, blunderChance: 0, noise: 0, passChance: 0, simulateResponse: true, checkLethal: true, maxActionsPerTurn: 40 },
};

export function makeAiConfig(difficulty: Difficulty, personality: AiPersonality = 'BALANCED'): AiConfig {
  const base = DIFFICULTY_CONFIGS[difficulty];
  const weights: EvalWeights = { ...BASE_WEIGHTS, ...PERSONALITY_MODS[personality] };
  if (difficulty === 'EASY') {
    // Easy bots undervalue threats and overvalue going face.
    weights.enemyBoard = 0.8;
    weights.enemyHealth *= 1.3;
    weights.lethalThreat = 0;
  }
  return { ...base, weights };
}
