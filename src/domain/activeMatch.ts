import { DIFFICULTIES, type Difficulty } from '@/config/progression';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { recordArenaMatch } from './arena';
import { recordDungeonMatch } from './dungeon';
import { applyMatchResult, type MatchSummary } from './matchResults';
import { sanitizeRating } from './ranked';
import type { GameSave, MatchRecord } from './save';

/**
 * A match with something at stake (Arena, Ranked, tournament, online PvP) is written to
 * the save when it starts and cleared when its result is recorded. If the app is reloaded
 * or closed mid-match the marker is still there at the next start, and the match is
 * recorded as a conceded loss, exactly as if the player had left through the menu.
 */
export interface ActiveMatch {
  id: string;
  mode: Extract<MatchRecord['mode'], 'ARENA' | 'RANKED' | 'TOURNAMENT' | 'PVP' | 'AI_RANKED' | 'DUNGEON'>;
  startedAt: number;
  opponentId: string;
  opponentName: string;
  difficulty: Difficulty;
  deckId: string;
  deckName: string;
  deckFaction: PlayableFaction;
  /** Ranked: the opponent's rating when the match was found. */
  opponentRating?: number;
}

export const STAKE_MODES: readonly ActiveMatch['mode'][] = ['ARENA', 'RANKED', 'TOURNAMENT', 'PVP', 'AI_RANKED', 'DUNGEON'];

const NO_STATS = { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 0, unitsPlayed: 0, spellsPlayed: 0, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 };

export function setActiveMatch(save: GameSave, marker: ActiveMatch | null): GameSave {
  return { ...save, profile: { ...save.profile, activeMatch: marker } };
}

/** The summary recorded for a match that was abandoned by reloading or closing the app. */
export function abandonedSummary(m: ActiveMatch, now: number): MatchSummary {
  return {
    mode: m.mode,
    ranked: m.mode === 'RANKED' ? { opponentRating: sanitizeRating(m.opponentRating) } : undefined,
    opponentId: m.opponentId,
    opponentName: m.opponentName,
    difficulty: m.difficulty,
    deckId: m.deckId,
    deckName: m.deckName,
    deckFaction: m.deckFaction,
    result: 'LOSS',
    turns: 0,
    durationMs: Math.max(0, now - m.startedAt),
    stats: { ...NO_STATS },
    conceded: true,
  };
}

/** Records the abandoned match (if any) as a loss and clears the marker. */
export function settleAbandonedMatch(save: GameSave, now: number): { save: GameSave; settled: ActiveMatch | null } {
  const m = save.profile.activeMatch;
  if (!m) return { save, settled: null };
  let next = applyMatchResult(setActiveMatch(save, null), abandonedSummary(m, now), now).save;
  if (m.mode === 'ARENA') {
    const res = recordArenaMatch(next, 'LOSS', now);
    if (res.ok) next = res.value;
  }
  if (m.mode === 'DUNGEON') {
    const res = recordDungeonMatch(next, 'LOSS', now);
    if (res.ok) next = res.value;
  }
  return { save: setActiveMatch(next, null), settled: m };
}

/** Load-time repair: a marker is kept only when it is well formed. */
export function repairActiveMatch(raw: unknown): ActiveMatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== 'string' || !(STAKE_MODES as readonly unknown[]).includes(m.mode)) return null;
  const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
  return {
    id: m.id,
    mode: m.mode as ActiveMatch['mode'],
    startedAt: typeof m.startedAt === 'number' && Number.isFinite(m.startedAt) ? m.startedAt : 0,
    opponentId: str(m.opponentId, 'unknown'),
    opponentName: str(m.opponentName, 'Opponent'),
    difficulty: (DIFFICULTIES as unknown[]).includes(m.difficulty) ? (m.difficulty as Difficulty) : 'NORMAL',
    deckId: str(m.deckId, 'unknown'),
    deckName: str(m.deckName, 'Deck'),
    deckFaction: (PLAYABLE_FACTIONS as readonly unknown[]).includes(m.deckFaction) ? (m.deckFaction as PlayableFaction) : 'EMBER',
    opponentRating: m.opponentRating === undefined ? undefined : sanitizeRating(m.opponentRating),
  };
}
