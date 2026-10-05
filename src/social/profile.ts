import { collectibleCards } from '@/data/cards';
import { ownedCopies, type GameSave } from '@/domain/save';
import { formatDate, t, tn } from '@/i18n';
import type { PublicProfile } from './backend';
import { NAME_MAX } from './leaderboard';

/**
 * The public profile friends see (profiles/{uid}): what the owner uploads and the same limits as
 * firestore.rules. The stats (level, title, cards) were added later, so they are optional: older
 * profile documents simply don't have them.
 */

export const PROFILE_LEVEL_MAX = 100;
export const PROFILE_TITLE_MAX = 40;
export const PROFILE_CARDS_MAX = 5000;

export type ProfileStats = Required<Pick<PublicProfile, 'level' | 'title' | 'cardsOwned' | 'cardsTotal'>>;

const clampInt = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number.isFinite(v) ? v : min)));

/** Level, equipped title and distinct collectible cards owned, kept inside the rules' limits. */
export function profileStats(save: GameSave): ProfileStats {
  const p = save.profile;
  const all = collectibleCards();
  const cardsTotal = clampInt(all.length, 0, PROFILE_CARDS_MAX);
  const owned = all.filter((c) => ownedCopies(save.collection, c.id) > 0).length;
  const title = p.title && p.title.length <= PROFILE_TITLE_MAX ? p.title : null;
  return { level: clampInt(p.level, 1, PROFILE_LEVEL_MAX), title, cardsOwned: clampInt(owned, 0, cardsTotal), cardsTotal };
}

const PROFILE_KEYS = new Set(['name', 'avatar', 'portrait', 'friendCode', 'level', 'title', 'cardsOwned', 'cardsTotal']);
const isInt = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const isStr = (v: unknown, min: number, max: number) => typeof v === 'string' && v.length >= min && v.length <= max;

/** Same checks as the profiles/{uid} rule in firestore.rules (except the friend code ownership, checked by the backend). */
export function isValidProfile(p: Partial<PublicProfile>): boolean {
  const rec = p as Record<string, unknown>;
  if (Object.keys(rec).some((k) => !PROFILE_KEYS.has(k) && rec[k] !== undefined)) return false;
  if (!isStr(p.name, 1, NAME_MAX) || !isStr(p.avatar, 0, 40) || !isStr(p.portrait, 0, 40) || typeof p.friendCode !== 'string') return false;
  if (p.level !== undefined && !isInt(p.level, 1, PROFILE_LEVEL_MAX)) return false;
  if (p.title !== undefined && p.title !== null && !isStr(p.title, 0, PROFILE_TITLE_MAX)) return false;
  if (p.cardsOwned !== undefined && !isInt(p.cardsOwned, 0, PROFILE_CARDS_MAX)) return false;
  if (p.cardsTotal !== undefined && !isInt(p.cardsTotal, 0, PROFILE_CARDS_MAX)) return false;
  if (p.cardsOwned !== undefined && (p.cardsTotal === undefined || p.cardsOwned > p.cardsTotal)) return false;
  return true;
}

/** Identity of what friends see, so an unchanged profile is not written again. */
export function profileKey(p: PublicProfile): string {
  return JSON.stringify([p.name, p.avatar, p.portrait, p.friendCode, p.level ?? null, p.title || null, p.cardsOwned ?? null, p.cardsTotal ?? null]);
}

const DAY_MS = 86_400_000;
const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * "Last online 5 min ago / 3 h ago / yesterday / 4 days ago / 4 Oct" for an offline friend's
 * last heartbeat (local calendar days; a date in the app language after a week).
 */
export function formatLastOnline(lastSeen: number, now: number): string {
  const s = Math.max(0, (now - lastSeen) / 1000);
  if (s < 60) return t('Last online just now');
  if (s < 3600) return t('Last online {n} min ago', { n: Math.floor(s / 60) });
  if (s < 86400) return t('Last online {n} h ago', { n: Math.floor(s / 3600) });
  const days = Math.max(1, Math.round((startOfDay(now) - startOfDay(lastSeen)) / DAY_MS));
  if (days === 1) return t('Last online yesterday');
  if (days < 7) return tn(days, 'Last online {n} day ago', 'Last online {n} days ago');
  const sameYear = new Date(lastSeen).getFullYear() === new Date(now).getFullYear();
  return t('Last online {date}', { date: formatDate(lastSeen, sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' }) });
}
