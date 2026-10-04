/**
 * Friends: codes, presence and invite timing. Pure helpers; the Firestore side lives behind
 * SocialBackend (src/social/backend.ts).
 */

/** No 0/O, 1/I/L: easy to read aloud and type. */
export const FRIEND_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const FRIEND_CODE_LENGTH = 8;
const CODE_RE = /^[A-HJKMNP-Z2-9]{8}$/;

/** Heartbeat while the app is open, and how recent it must be to count as online. */
export const PRESENCE_INTERVAL_MS = 60_000;
export const ONLINE_WINDOW_MS = 120_000;
/** A match invite is answered within two minutes or it lapses. */
export const INVITE_TTL_MS = 120_000;

export function generateFriendCode(random: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < FRIEND_CODE_LENGTH; i++) s += FRIEND_CODE_ALPHABET[Math.floor(random() * FRIEND_CODE_ALPHABET.length) % FRIEND_CODE_ALPHABET.length];
  return s;
}

/** Uppercase, without spaces and dashes ("abcd-efgh" → "ABCDEFGH"). */
export function normalizeFriendCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '');
}

export function isValidFriendCode(code: string): boolean {
  return CODE_RE.test(code);
}

/** Shown as "ABCD-EFGH". */
export function formatFriendCode(code: string): string {
  return code.length === FRIEND_CODE_LENGTH ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export interface Presence {
  /** Server time of the last heartbeat (ms). */
  lastSeen: number;
  inMatch: boolean;
}

export type PresenceStatus = 'online' | 'inMatch' | 'offline';

export function presenceStatus(p: Presence | null | undefined, now: number): PresenceStatus {
  if (!p || !Number.isFinite(p.lastSeen) || now - p.lastSeen > ONLINE_WINDOW_MS) return 'offline';
  return p.inMatch ? 'inMatch' : 'online';
}

export function inviteIsLive(invite: { createdAt: number; status: string }, now: number): boolean {
  return invite.status === 'pending' && now - invite.createdAt <= INVITE_TTL_MS;
}
