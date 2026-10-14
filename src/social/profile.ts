import { collectibleCards } from '@/data/cards';
import { ACHIEVEMENTS } from '@/data/achievements';
import { allEncounters } from '@/data/opponents';
import { CROWN_RANK } from '@/domain/aiRanked';
import { ownedCopies, type GameSave } from '@/domain/save';
import { PLAYABLE_FACTIONS } from '@/game/types';
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

export const PROFILE_COUNT_MAX = 1000;
export type ProfileExtras = Pick<PublicProfile, 'aiRank' | 'achievementsDone' | 'achievementsTotal' | 'campaignWon' | 'campaignTotal' | 'favFaction'>;

/**
 * What friends see besides level and cards: the Ranked vs AI rank (once played), achievements,
 * campaign fights won across every campaign and the faction with the most wins.
 */
export function profileExtras(save: GameSave): ProfileExtras {
  const p = save.profile;
  const air = p.aiRanked;
  const played = !!air && air.wins + air.losses > 0;
  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter((a) => p.achievements?.[a.id]).length;
  const fights = allEncounters();
  const won = fights.filter((e) => save.pve.completed[e.id]).length;
  let fav = '';
  let best = 0;
  for (const f of PLAYABLE_FACTIONS) {
    const w = p.factionWins[f] ?? 0;
    if (w > best) {
      best = w;
      fav = f;
    }
  }
  return {
    ...(played ? { aiRank: clampInt(air.rank, 0, CROWN_RANK) } : {}),
    achievementsDone: clampInt(done, 0, PROFILE_COUNT_MAX),
    achievementsTotal: clampInt(total, 0, PROFILE_COUNT_MAX),
    campaignWon: clampInt(won, 0, PROFILE_COUNT_MAX),
    campaignTotal: clampInt(fights.length, 0, PROFILE_COUNT_MAX),
    favFaction: fav,
  };
}

const PROFILE_KEYS = new Set(['name', 'avatar', 'portrait', 'friendCode', 'level', 'title', 'cardsOwned', 'cardsTotal', 'aiRank', 'achievementsDone', 'achievementsTotal', 'campaignWon', 'campaignTotal', 'favFaction']);
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
  if (p.aiRank !== undefined && !isInt(p.aiRank, 0, CROWN_RANK)) return false;
  for (const [a, b] of [['achievementsDone', 'achievementsTotal'], ['campaignWon', 'campaignTotal']] as const) {
    if (p[a] !== undefined && !isInt(p[a], 0, PROFILE_COUNT_MAX)) return false;
    if (p[b] !== undefined && !isInt(p[b], 0, PROFILE_COUNT_MAX)) return false;
    if (p[a] !== undefined && (p[b] === undefined || (p[a] as number) > (p[b] as number))) return false;
  }
  if (p.favFaction !== undefined && p.favFaction !== '' && !(PLAYABLE_FACTIONS as readonly string[]).includes(p.favFaction)) return false;
  return true;
}

/** Identity of what friends see, so an unchanged profile is not written again. */
export function profileKey(p: PublicProfile): string {
  return JSON.stringify([p.name, p.avatar, p.portrait, p.friendCode, p.level ?? null, p.title || null, p.cardsOwned ?? null, p.cardsTotal ?? null, p.aiRank ?? null, p.achievementsDone ?? null, p.achievementsTotal ?? null, p.campaignWon ?? null, p.campaignTotal ?? null, p.favFaction ?? null]);
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
