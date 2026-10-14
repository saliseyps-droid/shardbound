import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import type { MatchRecord } from './save';

/**
 * Per-deck statistics (save.profile.deckStats[deckId]), kept separately for every game mode:
 * results, results against each opponent faction, and per card played. Running totals, so they
 * outlive the 100-match history.
 */
export interface Tally {
  w: number;
  l: number;
  d: number;
}

export interface CardTally {
  /** Games in which this card was played at least once. */
  games: number;
  wins: number;
}

export interface ModeStats extends Tally {
  /** Sum of turns over these games, for the average length. */
  turns: number;
  vs: Partial<Record<PlayableFaction, Tally>>;
  cards: Record<string, CardTally>;
}

export type DeckMode = MatchRecord['mode'];

export interface DeckStats {
  modes: Partial<Record<DeckMode, ModeStats>>;
  lastPlayed: number;
}

export interface DeckGame {
  mode: DeckMode;
  result: MatchRecord['result'];
  turns: number;
  date: number;
  opponentFaction?: string | null;
  /** Card ids played this game (duplicates are ignored). */
  cardsPlayed?: string[];
}

/** Modes a saved deck can be taken into (not the tutorial, puzzles or the Arena/Dungeon decks). */
export const DECK_STAT_MODES: DeckMode[] = ['PRACTICE', 'PVE', 'AI_RANKED', 'PVP', 'RANKED', 'TOURNAMENT', 'BRAWL'];

export const emptyDeckStats = (): DeckStats => ({ modes: {}, lastPlayed: 0 });
const emptyMode = (): ModeStats => ({ w: 0, l: 0, d: 0, turns: 0, vs: {}, cards: {} });
const add = <T extends Tally>(t: T, r: MatchRecord['result']): T => ({ ...t, w: t.w + (r === 'WIN' ? 1 : 0), l: t.l + (r === 'LOSS' ? 1 : 0), d: t.d + (r === 'DRAW' ? 1 : 0) });

export const games = (t: Tally | undefined) => (t ? t.w + t.l + t.d : 0);
/** Win rate 0-100 (draws count as games), null without games. */
export const winRate = (t: Tally | undefined) => (games(t) ? Math.round((t!.w / games(t)) * 100) : null);

export function recordDeckGame(prev: DeckStats | undefined, g: DeckGame): DeckStats {
  const s = prev ?? emptyDeckStats();
  if (!DECK_STAT_MODES.includes(g.mode)) return s;
  const m = s.modes[g.mode] ?? emptyMode();
  const next: ModeStats = { ...add(m, g.result), turns: m.turns + Math.max(0, Math.round(g.turns)) };
  const of = g.opponentFaction as PlayableFaction;
  if (of && PLAYABLE_FACTIONS.includes(of)) next.vs = { ...m.vs, [of]: add(m.vs[of] ?? { w: 0, l: 0, d: 0 }, g.result) };
  if (g.cardsPlayed?.length) {
    const cards = { ...m.cards };
    for (const id of new Set(g.cardsPlayed)) {
      const c = cards[id] ?? { games: 0, wins: 0 };
      cards[id] = { games: c.games + 1, wins: c.wins + (g.result === 'WIN' ? 1 : 0) };
    }
    next.cards = cards;
  }
  return { modes: { ...s.modes, [g.mode]: next }, lastPlayed: Math.max(s.lastPlayed, g.date) };
}

/** The selected mode, or every mode summed ('ALL'). */
export function statsFor(s: DeckStats | undefined, mode: DeckMode | 'ALL'): ModeStats {
  if (!s) return emptyMode();
  if (mode !== 'ALL') return s.modes[mode] ?? emptyMode();
  const out = emptyMode();
  for (const m of Object.values(s.modes)) {
    if (!m) continue;
    out.w += m.w;
    out.l += m.l;
    out.d += m.d;
    out.turns += m.turns;
    for (const [f, t] of Object.entries(m.vs) as [PlayableFaction, Tally][]) {
      const o = out.vs[f] ?? { w: 0, l: 0, d: 0 };
      out.vs[f] = { w: o.w + t.w, l: o.l + t.l, d: o.d + t.d };
    }
    for (const [id, c] of Object.entries(m.cards)) {
      const o = out.cards[id] ?? { games: 0, wins: 0 };
      out.cards[id] = { games: o.games + c.games, wins: o.wins + c.wins };
    }
  }
  return out;
}

/** Modes this deck has been played in, in DECK_STAT_MODES order. */
export const playedModes = (s: DeckStats | undefined): DeckMode[] => DECK_STAT_MODES.filter((m) => games(s?.modes[m]) > 0);

/** Cards played in at least `min` games, by win rate when played (best first). */
export function rankedCards(m: ModeStats, min = 3): { id: string; games: number; rate: number }[] {
  return Object.entries(m.cards)
    .filter(([, c]) => c.games >= min)
    .map(([id, c]) => ({ id, games: c.games, rate: Math.round((c.wins / c.games) * 100) }))
    .sort((a, b) => b.rate - a.rate || b.games - a.games);
}

/** First run: results by mode rebuilt from the match history (cards and opponent factions were not recorded then). */
export function deckStatsFromHistory(history: { deckId: string; mode: DeckMode; result: MatchRecord['result']; turns: number; date: number }[]): Record<string, DeckStats> {
  const out: Record<string, DeckStats> = {};
  for (const m of [...history].reverse()) out[m.deckId] = recordDeckGame(out[m.deckId], { mode: m.mode, result: m.result, turns: Number(m.turns) || 0, date: Number(m.date) || 0 });
  for (const id of Object.keys(out)) if (playedModes(out[id]).length === 0) delete out[id];
  return out;
}

const int = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
const tally = (v: unknown): Tally => {
  const t = (v && typeof v === 'object' ? v : {}) as Partial<Tally>;
  return { w: int(t.w), l: int(t.l), d: int(t.d) };
};

export function repairDeckStats(raw: unknown): Record<string, DeckStats> {
  const out: Record<string, DeckStats> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const s = v as Partial<DeckStats>;
    const d = emptyDeckStats();
    for (const mode of DECK_STAT_MODES) {
      const src = s.modes?.[mode] as Partial<ModeStats> | undefined;
      if (!src || typeof src !== 'object') continue;
      const m: ModeStats = { ...tally(src), turns: int(src.turns), vs: {}, cards: {} };
      if (!games(m)) continue;
      for (const f of PLAYABLE_FACTIONS) {
        const t = tally(src.vs?.[f]);
        if (games(t)) m.vs[f] = t;
      }
      for (const [cid, c] of Object.entries(src.cards && typeof src.cards === 'object' ? src.cards : {})) {
        const g = int(c?.games);
        if (g) m.cards[cid] = { games: g, wins: Math.min(g, int(c?.wins)) };
      }
      d.modes[mode] = m;
    }
    d.lastPlayed = int(s.lastPlayed);
    out[id] = d;
  }
  return out;
}
