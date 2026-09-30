import { applyAction, createGame } from '@/engine/game';
import type { PlayerId, SideSetup } from '@/engine/types';
import type { Difficulty } from '@/config/progression';
import { chooseAction } from './search';
import { makeAiConfig } from './config';
import { runAiMulligan } from './index';

/** Plays a full AI-vs-AI game with the real rules engine. Returns the winning seat. */
export function simulateBotMatch(a: SideSetup, b: SideSetup, difficulties: [Difficulty, Difficulty], seed: number): PlayerId {
  const cfgs = [makeAiConfig(difficulties[0]), makeAiConfig(difficulties[1])] as const;
  let s = createGame({ seed, players: [a, b] }).state;
  s = runAiMulligan(runAiMulligan(s, 0, cfgs[0]), 1, cfgs[1]);
  let perTurn = 0;
  let turn = s.turn;
  for (let i = 0; i < 4000 && s.phase === 'MAIN'; i++) {
    if (s.turn !== turn) [perTurn, turn] = [0, s.turn];
    const me = s.activePlayer as PlayerId;
    const res = applyAction(s, chooseAction(s, me, cfgs[me], seed * 31 + i, perTurn++).action);
    s = res.error ? applyAction(s, { type: 'END_TURN', player: me }).state : res.state;
  }
  if (s.winner === 0 || s.winner === 1) return s.winner;
  // Draws (or the safety cap) are settled by remaining health, then a coin flip.
  const [h0, h1] = [s.players[0].hero.health, s.players[1].hero.health];
  return h0 === h1 ? ((seed & 1) as PlayerId) : h0 > h1 ? 0 : 1;
}
