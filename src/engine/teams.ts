import type { GameState, PlayerId } from './types';

/**
 * Sides and teams. A normal match has two players, each its own team (0 and 1). A co-op match
 * (MatchSetup with three sides) has two players on team 0 (seats 0 and 2) against a lone boss on
 * team 1 (seat 1), and turns go 0 → 2 → 1. A defeated co-op Warden leaves the table and is skipped.
 */
export const teamOf = (state: GameState, p: PlayerId): number => state.teams?.[p] ?? p;
export const sameTeam = (state: GameState, a: PlayerId, b: PlayerId): boolean => teamOf(state, a) === teamOf(state, b);
export const isCoop = (state: GameState): boolean => state.players.length > 2;

/** A seat still in the match (its Warden alive, or a normal two-player match). */
export const inPlay = (state: GameState, p: PlayerId): boolean => !isCoop(state) || state.players[p].hero.health > 0;

/** Every opposing seat still in the match. */
export function enemiesOf(state: GameState, p: PlayerId): PlayerId[] {
  return state.players.map((pl) => pl.id).filter((id) => !sameTeam(state, id, p) && inPlay(state, id));
}

/** The teammates of a seat still in the match (not counting itself). */
export function alliesOf(state: GameState, p: PlayerId): PlayerId[] {
  return state.players.map((pl) => pl.id).filter((id) => id !== p && sameTeam(state, id, p) && inPlay(state, id));
}

/** The one opponent of a two-player match, or the first opposing seat still in a co-op one. */
export function mainEnemy(state: GameState, p: PlayerId): PlayerId {
  return enemiesOf(state, p)[0] ?? (state.players.find((pl) => !sameTeam(state, pl.id, p))!.id as PlayerId);
}

/** Turn order of the match (default: the two players alternate). */
export function turnOrder(state: GameState): PlayerId[] {
  return state.turnOrder ?? (state.players.map((p) => p.id) as PlayerId[]);
}

/** Whose turn comes after `p`, skipping defeated co-op Wardens. */
export function nextInTurn(state: GameState, p: PlayerId): PlayerId {
  const order = turnOrder(state);
  const i = order.indexOf(p);
  for (let k = 1; k <= order.length; k++) {
    const q = order[(i + k) % order.length];
    if (inPlay(state, q)) return q;
  }
  return p;
}

/** Whether the match ended in a win for `p`'s team. */
export function wonBy(state: GameState, p: PlayerId): boolean {
  return state.winner !== null && state.winner !== 'DRAW' && sameTeam(state, state.winner, p);
}

/** The seat that stands for a team in `winner` (team 0 → seat 0, team 1 → seat 1). */
export const teamSeat = (team: number): PlayerId => team as PlayerId;
