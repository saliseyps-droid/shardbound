import { createGame, applyAction } from '@/engine';
import type { GameAction, GameState, PlayerId, TargetRef, UnitInstance } from '@/engine';
import type { StaticKeyword } from '@/game/types';

export const filler = (id = 'token_recruit', n = 30) => Array.from({ length: n }, () => id);

export function newGame(opts: {
  deck0?: string[];
  deck1?: string[];
  board0?: string[];
  board1?: string[];
  hp0?: string | null;
  hp1?: string | null;
  seed?: number;
} = {}): GameState {
  const { state } = createGame({
    seed: opts.seed ?? 1,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      { name: 'P0', avatar: 'a', deck: opts.deck0 ?? filler(), startingBoard: opts.board0, heroPowerId: opts.hp0 ?? null, keepDeckOrder: true },
      { name: 'P1', avatar: 'b', deck: opts.deck1 ?? filler(), startingBoard: opts.board1, heroPowerId: opts.hp1 ?? null, keepDeckOrder: true },
    ],
  });
  return state;
}

export function act(state: GameState, action: GameAction): GameState {
  const res = applyAction(state, action);
  if (res.error) throw new Error(`Action failed: ${res.error} (${JSON.stringify(action)})`);
  return res.state;
}

export function tryAct(state: GameState, action: GameAction) {
  return applyAction(state, action);
}

export function setEnergy(state: GameState, p: PlayerId, n: number) {
  state.players[p].energy = n;
  state.players[p].maxEnergy = Math.max(state.players[p].maxEnergy, n);
}

/** Puts a specific card into a player's hand and returns its uid. */
export function giveCard(state: GameState, p: PlayerId, cardId: string): number {
  const uid = state.nextUid++;
  state.players[p].hand.push({ uid, cardId, costMod: 0 });
  return uid;
}

export function unitAt(state: GameState, p: PlayerId, index: number): UnitInstance {
  return state.players[p].board[index];
}

export function addKeyword(unit: UnitInstance, kw: StaticKeyword) {
  unit.keywords.push(kw);
  if (kw === 'BARRIER') unit.barrier = true;
  if (kw === 'AMBUSH') unit.ambush = true;
}

/** Makes units ready to attack this turn. */
export function ready(state: GameState, p: PlayerId) {
  for (const u of state.players[p].board) {
    u.summonedThisTurn = false;
    u.attacksThisTurn = 0;
  }
}

export const hero = (player: PlayerId): TargetRef => ({ type: 'hero', player });
export const unitRef = (u: UnitInstance): TargetRef => ({ type: 'unit', uid: u.uid });

export function endTurn(state: GameState): GameState {
  return act(state, { type: 'END_TURN', player: state.activePlayer });
}
