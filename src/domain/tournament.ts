import type { Difficulty } from '@/config/progression';
import type { PlayableFaction, SetId } from '@/game/types';
import type { SideSetup } from '@/engine/types';

/**
 * Single-elimination tournament for 4, 8, 16 or 32 players. Empty seats are filled with
 * bots. The two semi-final losers play a third-place match alongside the final.
 * Pure data + transitions (no networking).
 *
 * Match ids name the round: R32-n, R16-n, QF n, SF n, F (final) and P3 (third place).
 */

export interface TournamentPlayer {
  id: string;
  name: string;
  avatar: string;
  faction: PlayableFaction;
  bot: boolean;
  /** Bots only: AI difficulty. */
  difficulty?: Difficulty;
  /** Humans: the deck they registered with (validated by the organizer). */
  side?: SideSetup;
  connected: boolean;
}

export type TournamentMatchId = string;
export type TournamentSize = 4 | 8 | 16 | 32;
export const TOURNAMENT_SIZES: TournamentSize[] = [4, 8, 16, 32];

export interface TournamentMatch {
  id: TournamentMatchId;
  a: string | null;
  b: string | null;
  winner: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'done';
  /** Human vs human: which player hosts the 1v1 connection, and its room code. */
  hostId?: string;
  room?: string;
}

export interface Tournament {
  code: string;
  /** Seats in the bracket (older saves/peers without it are 4). */
  size?: TournamentSize;
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  phase: 'lobby' | 'running' | 'done';
  championId: string | null;
  runnerUpId: string | null;
  thirdId?: string | null;
}

export const TOURNAMENT_CONFIG = {
  minHumans: 2,
};

/** Tournament prize packs come from the newest set. */
export const TOURNAMENT_PACK_SET: SetId = 'DRAGON';

export interface PlacePrize {
  gold: number;
  /** Packs of TOURNAMENT_PACK_SET. */
  packs: number;
}

/** Bigger tournaments pay more: more rounds to win and more players to beat. */
export function tournamentPrizes(size: TournamentSize): { champion: PlacePrize; runnerUp: PlacePrize; third: PlacePrize } {
  switch (size) {
    case 4:
      return { champion: { gold: 250, packs: 0 }, runnerUp: { gold: 100, packs: 0 }, third: { gold: 50, packs: 0 } };
    case 8:
      return { champion: { gold: 400, packs: 1 }, runnerUp: { gold: 200, packs: 0 }, third: { gold: 100, packs: 0 } };
    case 16:
      return { champion: { gold: 600, packs: 2 }, runnerUp: { gold: 300, packs: 1 }, third: { gold: 150, packs: 0 } };
    case 32:
      return { champion: { gold: 1000, packs: 3 }, runnerUp: { gold: 500, packs: 2 }, third: { gold: 250, packs: 1 } };
  }
}

export const sizeOf = (t: Tournament): TournamentSize => t.size ?? 4;

// ---------------------------------------------------------------------------
// Rounds and match ids. "Depth" counts rounds back from the final (final = 0).
// ---------------------------------------------------------------------------

const PREFIX = ['F', 'SF', 'QF', 'R16-', 'R32-'];

function idFor(depth: number, index: number): TournamentMatchId {
  return depth === 0 ? 'F' : `${PREFIX[depth]}${index}`;
}

function parseId(id: TournamentMatchId): { depth: number; index: number } | null {
  if (id === 'F') return { depth: 0, index: 1 };
  for (let depth = PREFIX.length - 1; depth >= 1; depth--) {
    if (id.startsWith(PREFIX[depth])) {
      const index = Number(id.slice(PREFIX[depth].length));
      if (Number.isInteger(index) && index >= 1) return { depth, index };
    }
  }
  return null;
}

/** English label of a whole round (depth from the final). */
export function roundLabel(depth: number): string {
  return ['Final', 'Semi-finals', 'Quarter-finals', 'Round of 16', 'Round of 32'][depth] ?? 'Round';
}

/** English label of one match. */
export function matchLabel(id: TournamentMatchId): string {
  if (id === 'P3') return 'Third-place match';
  const p = parseId(id);
  if (!p) return id;
  if (p.depth === 0) return 'Final';
  if (p.depth === 1) return `Semi-final ${p.index}`;
  if (p.depth === 2) return `Quarter-final ${p.index}`;
  return `${roundLabel(p.depth)}, match ${p.index}`;
}

const roundsOf = (size: TournamentSize) => Math.log2(size);

/** Matches of one round, in bracket order. */
export function roundMatches(t: Tournament, depth: number): TournamentMatch[] {
  return t.matches.filter((m) => parseId(m.id)?.depth === depth).sort((x, y) => parseId(x.id)!.index - parseId(y.id)!.index);
}

/** Rounds from the first one to the final (depths, high to low). */
export function roundDepths(t: Tournament): number[] {
  return Array.from({ length: roundsOf(sizeOf(t)) }, (_, i) => roundsOf(sizeOf(t)) - 1 - i);
}

// ---------------------------------------------------------------------------

export function newTournament(code: string, organizer: TournamentPlayer, size: TournamentSize = 4): Tournament {
  return { code, size, players: [organizer], matches: [], phase: 'lobby', championId: null, runnerUpId: null, thirdId: null };
}

/** Fills empty seats with bots and draws the bracket. */
export function startTournament(t: Tournament, bots: Omit<TournamentPlayer, 'id' | 'connected' | 'bot'>[], random: () => number = Math.random): Tournament {
  const size = sizeOf(t);
  const humans = t.players.filter((p) => !p.bot).slice(0, size);
  if (humans.length < TOURNAMENT_CONFIG.minHumans) throw new Error(`At least ${TOURNAMENT_CONFIG.minHumans} players are needed.`);
  const players = [...humans];
  for (let i = 0; players.length < size; i++) {
    const b = bots[i % bots.length];
    players.push({ ...b, id: `bot${i + 1}`, bot: true, connected: true });
  }
  // Random seeding.
  const seeds = [...players];
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
  }
  const rounds = roundsOf(size);
  const matches: TournamentMatch[] = [];
  for (let depth = rounds - 1; depth >= 0; depth--) {
    const count = 2 ** depth;
    for (let i = 1; i <= count; i++) {
      const first = depth === rounds - 1;
      matches.push({
        id: idFor(depth, i),
        a: first ? seeds[(i - 1) * 2].id : null,
        b: first ? seeds[(i - 1) * 2 + 1].id : null,
        winner: null,
        status: first ? 'ready' : 'waiting',
      });
    }
  }
  matches.push({ id: 'P3', a: null, b: null, winner: null, status: 'waiting' });
  return assignRooms({ ...t, players, matches, phase: 'running' });
}

/** Human-vs-human matches get a host and a room code for their 1v1 connection. */
function assignRooms(t: Tournament): Tournament {
  return {
    ...t,
    matches: t.matches.map((m) => {
      if (m.status !== 'ready' || m.room || !m.a || !m.b) return m;
      const a = playerById(t, m.a);
      const b = playerById(t, m.b);
      if (!a || !b || a.bot || b.bot) return m;
      return { ...m, hostId: a.id, room: `T${t.code}${m.id}` };
    }),
  };
}

export function playerById(t: Tournament, id: string | null | undefined): TournamentPlayer | undefined {
  return id ? t.players.find((p) => p.id === id) : undefined;
}

export function markPlaying(t: Tournament, matchId: TournamentMatchId): Tournament {
  return { ...t, matches: t.matches.map((m) => (m.id === matchId && m.status === 'ready' ? { ...m, status: 'playing' } : m)) };
}

/** Puts a player into a slot of a later match; the match becomes ready when both slots are filled. */
function seat(matches: TournamentMatch[], id: TournamentMatchId, slot: 'a' | 'b', playerId: string | null): TournamentMatch[] {
  return matches.map((m) => {
    if (m.id !== id) return m;
    const next = { ...m, [slot]: playerId };
    return next.a && next.b && next.status === 'waiting' ? { ...next, status: 'ready' as const } : next;
  });
}

/** Records a result and advances the bracket. Ignores results for finished matches. */
export function reportResult(t: Tournament, matchId: TournamentMatchId, winnerId: string): Tournament {
  const match = t.matches.find((m) => m.id === matchId);
  if (!match || match.status === 'done' || !match.a || !match.b || (winnerId !== match.a && winnerId !== match.b)) return t;
  const loserId = winnerId === match.a ? match.b : match.a;
  let matches = t.matches.map((m) => (m.id === matchId ? { ...m, winner: winnerId, status: 'done' as const } : m));
  let next: Tournament = { ...t, matches };
  const pos = parseId(matchId);
  if (matchId === 'P3') {
    next = { ...next, thirdId: winnerId };
  } else if (pos && pos.depth === 0) {
    next = { ...next, championId: winnerId, runnerUpId: loserId };
  } else if (pos) {
    const slot = pos.index % 2 === 1 ? 'a' : 'b';
    matches = seat(matches, idFor(pos.depth - 1, Math.ceil(pos.index / 2)), slot, winnerId);
    if (pos.depth === 1) matches = seat(matches, 'P3', slot, loserId);
    next = resolveAbsent(assignRooms({ ...next, matches }));
  }
  const unfinished = next.matches.some((m) => (m.id === 'F' || m.id === 'P3') && m.status !== 'done');
  return unfinished ? next : { ...next, phase: 'done' };
}

/** A newly scheduled match against someone who already left is won by the other player. */
function resolveAbsent(t: Tournament): Tournament {
  for (const m of t.matches) {
    if (m.status !== 'ready' || !m.a || !m.b) continue;
    if (!playerById(t, m.a)?.connected) return resolveAbsent(reportResult(t, m.id, m.b));
    if (!playerById(t, m.b)?.connected) return resolveAbsent(reportResult(t, m.id, m.a));
  }
  return t;
}

/** A player left: every unfinished match of theirs is forfeited to the opponent. */
export function forfeitPlayer(t: Tournament, playerId: string): Tournament {
  let next: Tournament = { ...t, players: t.players.map((p) => (p.id === playerId ? { ...p, connected: false } : p)) };
  for (const m of next.matches) {
    if (m.status === 'done' || !m.a || !m.b) continue;
    if (m.a === playerId) next = reportResult(next, m.id, m.b);
    else if (m.b === playerId) next = reportResult(next, m.id, m.a);
  }
  return next;
}

/** Matches that can start now. */
export function readyMatches(t: Tournament): TournamentMatch[] {
  return t.matches.filter((m) => m.status === 'ready' && m.a && m.b);
}

/** 1-3 for the medals, 4 for everyone else (once the tournament is over). */
export function placementOf(t: Tournament, playerId: string): 1 | 2 | 3 | 4 | null {
  if (t.phase !== 'done') return null;
  if (t.championId === playerId) return 1;
  if (t.runnerUpId === playerId) return 2;
  if (t.thirdId === playerId) return 3;
  return t.players.some((p) => p.id === playerId) ? 4 : null;
}

// ---------------------------------------------------------------------------
// Result reports (organizer side)
// ---------------------------------------------------------------------------

/** Organizer bookkeeping for one match: which humans started it and who they say won. */
export interface MatchReports {
  started: string[];
  /** reporting player id -> winner id */
  reports: Record<string, string>;
  firstReportAt?: number;
}

export type ReportDecision = { kind: 'accept'; winnerId: string } | { kind: 'wait' } | { kind: 'replay'; draw?: boolean };

/** Reported instead of a winner id when the match ended in a draw (e.g. a disconnect draw). */
export const DRAW_REPORT = 'DRAW';

/** How long the organizer waits for the second player's report. */
export const REPORT_TIMEOUT_MS = 120_000;

export const emptyReports = (): MatchReports => ({ started: [], reports: {} });

/** Only a human player of an unfinished, scheduled match may start it or report it. */
export function isMatchParticipant(t: Tournament, matchId: TournamentMatchId, playerId: string): boolean {
  const m = t.matches.find((x) => x.id === matchId);
  if (!m || !m.a || !m.b || (m.status !== 'ready' && m.status !== 'playing')) return false;
  if (m.a !== playerId && m.b !== playerId) return false;
  const p = playerById(t, playerId);
  return !!p && !p.bot;
}

/**
 * A human vs bot match counts on the human's report. Between two humans both must
 * report the same winner; different reports mean a replay. If only one reports, the
 * organizer accepts it after a timeout, but only when both players actually started
 * the match (otherwise the match is replayed). A draw eliminates nobody: when every
 * human reports a draw (or a lone draw report times out), the match is replayed.
 */
export function decideReport(t: Tournament, matchId: TournamentMatchId, book: MatchReports, now: number): ReportDecision {
  const m = t.matches.find((x) => x.id === matchId);
  if (!m || !m.a || !m.b || m.status === 'done') return { kind: 'wait' };
  const valid = (w: string | undefined) => w === m.a || w === m.b || w === DRAW_REPORT;
  const humans = [m.a, m.b].filter((id) => !playerById(t, id)?.bot);
  const reported = humans.filter((h) => valid(book.reports[h]));
  if (reported.length === 0) return { kind: 'wait' };
  if (reported.length === humans.length) {
    const winners = new Set(reported.map((h) => book.reports[h]));
    if (winners.size !== 1) return { kind: 'replay' };
    const winnerId = book.reports[reported[0]];
    return winnerId === DRAW_REPORT ? { kind: 'replay', draw: true } : { kind: 'accept', winnerId };
  }
  if (book.firstReportAt !== undefined && now - book.firstReportAt >= REPORT_TIMEOUT_MS) {
    const winnerId = book.reports[reported[0]];
    if (winnerId === DRAW_REPORT) return { kind: 'replay', draw: true };
    return humans.every((h) => book.started.includes(h)) ? { kind: 'accept', winnerId } : { kind: 'replay' };
  }
  return { kind: 'wait' };
}

/** A disputed match goes back to "ready" so its players can play it again. */
export function replayMatch(t: Tournament, matchId: TournamentMatchId): Tournament {
  return { ...t, matches: t.matches.map((m) => (m.id === matchId && m.status === 'playing' ? { ...m, status: 'ready' as const, winner: null } : m)) };
}
