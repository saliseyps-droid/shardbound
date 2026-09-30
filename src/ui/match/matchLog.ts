import type { GameEvent } from '@/engine/types';

/** Event log of the most recent (or current) match, for the debug screen. */
let lastLog: GameEvent[] = [];

export function setLastMatchLog(log: GameEvent[]) {
  lastLog = log;
}

export function getLastMatchLog(): GameEvent[] {
  return lastLog;
}
