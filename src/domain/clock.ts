import type { GameSave } from './save';

/**
 * Day and week rollovers (free Arena entry, quest refresh, rerolls, weekly quest) use this
 * instead of the raw clock: it is never earlier than the latest time the save has seen,
 * so turning the device clock back never starts a new day. Together with the "is the key
 * later than the stored one" checks below, a day can only be gained once.
 */
export function trustedNow(save: Pick<GameSave, 'profile'>, now: number): number {
  const seen = save.profile.lastSeenAt;
  return typeof seen === 'number' && Number.isFinite(seen) && seen > now ? seen : now;
}

/** dayKey/weekKey strings (YYYY-MM-DD) sort by date: true when `key` is a later period than `stored`. */
export function isLaterKey(key: string, stored: string | null | undefined): boolean {
  return !stored || key > stored;
}
