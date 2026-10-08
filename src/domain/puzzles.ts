import { createGame } from '@/engine';
import type { GameState, SideSetup } from '@/engine/types';
import { PUZZLES, type PuzzleDef, type PuzzleUnit } from '@/data/puzzles';

/**
 * Daily puzzle: everyone gets the same puzzle each UTC day. You must win in one turn; ending
 * the turn fails it (try again as often as you like). The first solve of the day pays a reward
 * and extends the streak of consecutive days.
 */
export const PUZZLE_REWARD = { gold: 60, xp: 120 };
const DAY_MS = 86_400_000;

export interface PuzzleProgress {
  /** UTC day number (days since 1970) of the last solve. */
  lastSolvedDay: number | null;
  streak: number;
  solved: number;
}

export const puzzleDay = (now: number) => Math.floor(now / DAY_MS);

export function puzzleForDay(day: number): PuzzleDef {
  return PUZZLES[((day % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];
}

export const findPuzzle = (id: string) => PUZZLES.find((p) => p.id === id);

export function emptyPuzzleProgress(): PuzzleProgress {
  return { lastSolvedDay: null, streak: 0, solved: 0 };
}

/** Records a solve on `day`; returns null when that day was already solved (no second reward). */
export function solvePuzzle(progress: PuzzleProgress | undefined, day: number): PuzzleProgress | null {
  const p = progress ?? emptyPuzzleProgress();
  if (p.lastSolvedDay !== null && p.lastSolvedDay >= day) return null;
  const streak = p.lastSolvedDay === day - 1 ? p.streak + 1 : 1;
  return { lastSolvedDay: day, streak, solved: p.solved + 1 };
}

/** The current streak as of `day` (0 when a day was missed). */
export function currentStreak(progress: PuzzleProgress | undefined, day: number): number {
  if (!progress || progress.lastSolvedDay === null) return 0;
  return progress.lastSolvedDay >= day - 1 ? progress.streak : 0;
}

const FILLER = Array.from({ length: 10 }, () => 'token_recruit');

const unit = (u: string | PuzzleUnit): PuzzleUnit => (typeof u === 'string' ? { cardId: u } : u);

/** The puzzle's board, ready to play: your turn, the given hand, energy and boards. */
export function createPuzzleGame(puzzle: PuzzleDef, me: Omit<SideSetup, 'deck'>, enemy: Omit<SideSetup, 'deck'>, seed = 1): GameState {
  const { state } = createGame({
    seed,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      // Decks of harmless filler: drawing from an empty deck would deal fatigue damage.
      { ...me, deck: FILLER, talents: [], keepDeckOrder: true, startingBoard: puzzle.board.map((u) => unit(u).cardId) },
      { ...enemy, deck: FILLER, talents: [], keepDeckOrder: true, heroHealth: puzzle.enemy.health, startingBoard: puzzle.enemy.board.map((u) => unit(u).cardId) },
    ],
  });
  const p = state.players[0];
  const e = state.players[1];
  p.hand = puzzle.hand.map((cardId) => ({ uid: state.nextUid++, cardId, costMod: 0 }));
  p.energy = puzzle.energy;
  p.maxEnergy = puzzle.energy;
  p.hero.health = p.hero.maxHealth;
  p.fatigue = 0;
  puzzle.board.map(unit).forEach((u, i) => {
    if (u.frozen && p.board[i]) p.board[i].frozen = true;
  });
  puzzle.enemy.board.map(unit).forEach((u, i) => {
    if (u.frozen && e.board[i]) e.board[i].frozen = true;
  });
  e.hero.health = puzzle.enemy.health;
  e.hero.maxHealth = puzzle.enemy.health;
  state.log = [];
  return state;
}
