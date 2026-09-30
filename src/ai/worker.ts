/// <reference lib="webworker" />
import { chooseAction, chooseMulligan } from './search';
import { makeAiConfig, type AiPersonality } from './config';
import type { Difficulty } from '@/config/progression';
import type { GameState, PlayerId } from '@/engine/types';

export interface AiRequest {
  id: number;
  kind: 'action' | 'mulligan';
  state: GameState;
  me: PlayerId;
  difficulty: Difficulty;
  personality: AiPersonality;
  seed: number;
  actionsThisTurn: number;
}

self.onmessage = (e: MessageEvent<AiRequest>) => {
  const req = e.data;
  try {
    const cfg = makeAiConfig(req.difficulty, req.personality);
    if (req.kind === 'mulligan') {
      (self as unknown as Worker).postMessage({ id: req.id, replace: chooseMulligan(req.state, req.me, cfg) });
    } else {
      const decision = chooseAction(req.state, req.me, cfg, req.seed, req.actionsThisTurn);
      (self as unknown as Worker).postMessage({ id: req.id, action: decision.action });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id: req.id, error: String(err) });
  }
};
