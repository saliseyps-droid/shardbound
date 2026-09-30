import type { Difficulty } from '@/config/progression';
import type { PlayableFaction } from '@/game/types';
import type { SideSetup } from '@/engine/types';

/**
 * Four-player single-elimination tournament: two semi-finals, then a final.
 * Empty seats are filled with bots. Pure data + transitions (no networking).
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

export type TournamentMatchId = 'SF1' | 'SF2' | 'F';

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
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  phase: 'lobby' | 'running' | 'done';
  championId: string | null;
  runnerUpId: string | null;
}

export const TOURNAMENT_CONFIG = {
  size: 4,
  minHumans: 2,
  prizes: { champion: 250, runnerUp: 100 },
};

export const MATCH_LABEL: Record<TournamentMatchId, string> = { SF1: 'Semi-final 1', SF2: 'Semi-final 2', F: 'Final' };

export function newTournament(code: string, organizer: TournamentPlayer): Tournament {
  return { code, players: [organizer], matches: [], phase: 'lobby', championId: null, runnerUpId: null };
}

/** Fills empty seats with bots and draws the bracket. */
export function startTournament(t: Tournament, bots: Omit<TournamentPlayer, 'id' | 'connected' | 'bot'>[], random: () => number = Math.random): Tournament {
  const humans = t.players.filter((p) => !p.bot);
  if (humans.length < TOURNAMENT_CONFIG.minHumans) throw new Error(`At least ${TOURNAMENT_CONFIG.minHumans} players are needed.`);
  const players = [...humans];
  for (let i = 0; players.length < TOURNAMENT_CONFIG.size; i++) {
    const b = bots[i % bots.length];
    players.push({ ...b, id: `bot${i + 1}`, bot: true, connected: true });
  }
  // Random seeding.
  const seeds = [...players];
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
  }
  const matches: TournamentMatch[] = [
    { id: 'SF1', a: seeds[0].id, b: seeds[3].id, winner: null, status: 'ready' },
    { id: 'SF2', a: seeds[1].id, b: seeds[2].id, winner: null, status: 'ready' },
    { id: 'F', a: null, b: null, winner: null, status: 'waiting' },
  ];
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

/** Records a result and advances the bracket. Ignores results for finished matches. */
export function reportResult(t: Tournament, matchId: TournamentMatchId, winnerId: string): Tournament {
  const match = t.matches.find((m) => m.id === matchId);
  if (!match || match.status === 'done' || (winnerId !== match.a && winnerId !== match.b)) return t;
  let matches = t.matches.map((m) => (m.id === matchId ? { ...m, winner: winnerId, status: 'done' as const } : m));
  let next: Tournament = { ...t, matches };
  if (matchId !== 'F') {
    const sf1 = matches.find((m) => m.id === 'SF1')!;
    const sf2 = matches.find((m) => m.id === 'SF2')!;
    if (sf1.winner && sf2.winner) {
      matches = matches.map((m) => (m.id === 'F' ? { ...m, a: sf1.winner, b: sf2.winner, status: 'ready' as const } : m));
      next = assignRooms({ ...next, matches });
    }
  } else {
    const loser = winnerId === match.a ? match.b : match.a;
    next = { ...next, phase: 'done', championId: winnerId, runnerUpId: loser };
  }
  return next;
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

export function placementOf(t: Tournament, playerId: string): 1 | 2 | 3 | null {
  if (t.phase !== 'done') return null;
  if (t.championId === playerId) return 1;
  if (t.runnerUpId === playerId) return 2;
  return t.players.some((p) => p.id === playerId) ? 3 : null;
}
