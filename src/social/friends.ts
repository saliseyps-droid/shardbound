import type { InviteKind } from './backend';

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
/** Tournament lobbies wait for players, so their invites stay open for ten minutes. */
export const TOURNAMENT_INVITE_TTL_MS = 600_000;

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
  /** The watch room of the match being played, when friends can spectate it (src/net/spectate.ts). */
  watch?: string | null;
}

export type PresenceStatus = 'online' | 'inMatch' | 'offline';

export function presenceStatus(p: Presence | null | undefined, now: number): PresenceStatus {
  if (!p || !Number.isFinite(p.lastSeen) || now - p.lastSeen > ONLINE_WINDOW_MS) return 'offline';
  return p.inMatch ? 'inMatch' : 'online';
}

/** Invites written before tournaments existed have no kind: they are match invites. */
export function inviteKind(invite: { kind?: unknown }): InviteKind {
  return invite.kind === 'tournament' ? 'tournament' : 'match';
}

export function inviteTtl(invite: { kind?: unknown }): number {
  return inviteKind(invite) === 'tournament' ? TOURNAMENT_INVITE_TTL_MS : INVITE_TTL_MS;
}

export function inviteIsLive(invite: { createdAt: number; status: string; kind?: unknown }, now: number): boolean {
  return invite.status === 'pending' && now - invite.createdAt <= inviteTtl(invite);
}

const INVITE_FIELDS = ['from', 'fromName', 'code', 'kind', 'size'];
export const TOURNAMENT_INVITE_SIZES = { min: 4, max: 32 };

/**
 * What firestore.rules accept when an invite is created (createdAt and status are added by the
 * backend): only known fields, a 1–20 character name, a 4–8 character code, and the optional
 * kind ('match' | 'tournament') and size (whole number 4–32).
 */
export function isValidInvite(d: Record<string, unknown>): boolean {
  if (Object.keys(d).some((k) => !INVITE_FIELDS.includes(k))) return false;
  if (typeof d.from !== 'string' || typeof d.fromName !== 'string' || d.fromName.length < 1 || d.fromName.length > 20) return false;
  if (typeof d.code !== 'string' || !/^[A-Z0-9]{4,8}$/.test(d.code)) return false;
  if ('kind' in d && d.kind !== 'match' && d.kind !== 'tournament') return false;
  if ('size' in d && !(Number.isInteger(d.size) && (d.size as number) >= TOURNAMENT_INVITE_SIZES.min && (d.size as number) <= TOURNAMENT_INVITE_SIZES.max)) return false;
  return true;
}
