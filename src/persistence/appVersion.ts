import { LATEST_PATCH } from '@/data/patchNotes';

/**
 * The game version that writes a save (the newest patch note). Stored in the save's meta so an
 * older copy of the game (a tab left open, a cached page, an old offline HTML file) that does not
 * know the newest cards never loads the save and writes it back without them.
 */
export const APP_VERSION = LATEST_PATCH;

/** True when version `a` ("0.42.0") is newer than `b`. Missing versions count as old. */
export function isNewerVersion(a: string | null | undefined, b: string): boolean {
  if (typeof a !== 'string') return false;
  const pa = a.split('.').map((n) => Number(n) || 0);
  const pb = b.split('.').map((n) => Number(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

/** Thrown instead of writing over a save made by a newer version of the game. */
export class OutdatedClientError extends Error {
  constructor(readonly savedBy: string) {
    super(`This save was made by a newer version (${savedBy}).`);
    this.name = 'OutdatedClientError';
  }
}
