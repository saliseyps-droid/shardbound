import type { Difficulty } from '@/config/progression';
import type { GameAction, GameState, PlayerId } from '@/engine/types';
import { chooseAction, chooseMulligan } from './search';
import { makeAiConfig, type AiPersonality, type AiTuning } from './config';
import type { AiRequest } from './worker';
// Inlined as a blob so the worker also works from a single offline HTML file (file://).
import AiWorker from './worker?worker&inline';

/**
 * Runs AI decisions off the main thread when Web Workers are available so the
 * board keeps animating while Hard/Expert bots search. Falls back to inline.
 */
class AiClient {
  private worker: Worker | null = null;
  private failed = false;
  private seq = 1;
  private pending = new Map<number, (msg: { action?: GameAction; replace?: number[]; error?: string }) => void>();

  private getWorker(): Worker | null {
    if (this.failed || typeof Worker === 'undefined') return null;
    if (!this.worker) {
      try {
        this.worker = new AiWorker();
        this.worker.onmessage = (e) => {
          const cb = this.pending.get(e.data.id);
          if (cb) {
            this.pending.delete(e.data.id);
            cb(e.data);
          }
        };
        this.worker.onerror = (e) => {
          console.warn('[ai] worker failed, falling back to main thread', e.message);
          this.failed = true;
          this.worker?.terminate();
          this.worker = null;
          for (const cb of this.pending.values()) cb({ error: 'worker failed' });
          this.pending.clear();
        };
      } catch {
        this.failed = true;
        return null;
      }
    }
    return this.worker;
  }

  private request(req: Omit<AiRequest, 'id'>, timeoutMs = 8000): Promise<{ action?: GameAction; replace?: number[]; error?: string }> {
    const worker = this.getWorker();
    if (!worker) return Promise.resolve({ error: 'no worker' });
    const id = this.seq++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ error: 'timeout' });
      }, timeoutMs);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
      worker.postMessage({ ...req, id });
    });
  }

  async chooseAction(state: GameState, me: PlayerId, difficulty: Difficulty, personality: AiPersonality, seed: number, actionsThisTurn: number, tuning?: AiTuning): Promise<GameAction> {
    const res = await this.request({ kind: 'action', state, me, difficulty, personality, seed, actionsThisTurn, tuning });
    if (res.action) return res.action;
    // Inline fallback uses the exact same rules and search.
    return chooseAction(state, me, makeAiConfig(difficulty, personality, tuning), seed, actionsThisTurn).action;
  }

  async chooseMulligan(state: GameState, me: PlayerId, difficulty: Difficulty, personality: AiPersonality, tuning?: AiTuning): Promise<number[]> {
    const res = await this.request({ kind: 'mulligan', state, me, difficulty, personality, seed: 0, actionsThisTurn: 0, tuning });
    if (res.replace) return res.replace;
    return chooseMulligan(state, me, makeAiConfig(difficulty, personality, tuning));
  }
}

export const aiClient = new AiClient();
