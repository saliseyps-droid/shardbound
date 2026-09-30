import { applyAction } from '@/engine/game';
import type { GameEvent, GameState, PlayerId } from '@/engine/types';
import type { AiConfig } from './config';
import { chooseAction, chooseMulligan } from './search';

export * from './config';
export { chooseAction, chooseMulligan, determinize } from './search';
export { evaluate } from './evaluate';

/**
 * Plays a full AI turn synchronously (used by simulations/tests; the UI steps
 * one action at a time with animations instead).
 */
export function runAiTurn(state: GameState, me: PlayerId, cfg: AiConfig, seed: number): { state: GameState; events: GameEvent[]; actions: number } {
  let s = state;
  const events: GameEvent[] = [];
  let actions = 0;
  while (s.phase === 'MAIN' && s.activePlayer === me) {
    const decision = chooseAction(s, me, cfg, seed + actions * 7919, actions);
    let res = applyAction(s, decision.action);
    if (res.error) res = applyAction(s, { type: 'END_TURN', player: me });
    if (res.error) break;
    events.push(...res.events);
    s = res.state;
    actions++;
    if (decision.action.type === 'END_TURN') break;
  }
  return { state: s, events, actions };
}

export function runAiMulligan(state: GameState, me: PlayerId, cfg: AiConfig): GameState {
  const res = applyAction(state, { type: 'MULLIGAN', player: me, replaceUids: chooseMulligan(state, me, cfg) });
  return res.error ? state : res.state;
}
