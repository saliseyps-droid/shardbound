import { create } from 'zustand';
import type { DataConnection, Peer } from 'peerjs';
import type { Difficulty } from '@/config/progression';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import type { SideSetup } from '@/engine/types';
import { FACTIONS } from '@/data/factions';
import { PRACTICE_OPPONENTS, DIFFICULTY_POOLS } from '@/data/opponents';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import type { Deck } from '@/domain/decks';
import {
  forfeitPlayer,
  markPlaying,
  newTournament,
  playerById,
  readyMatches,
  reportResult,
  startTournament,
  TOURNAMENT_CONFIG,
  type Tournament,
  type TournamentMatch,
  type TournamentMatchId,
  type TournamentPlayer,
} from '@/domain/tournament';
import { CONTENT_HASH, PROTOCOL_VERSION, makeRoomCode, netSession, roomPeerId } from '@/net/session';
import { onlineOpponent, validateRemoteSide } from '@/net/lobby';
import { simulateBotMatch } from '@/ai/simulate';
import { gameService, useAccount } from './accountStore';
import { launchMatch } from './matchLaunch';
import { setTournamentMatchHandler } from './matchStore';
import { toast } from './uiStore';

/**
 * Tournament coordination (star topology): the organizer's browser keeps the
 * bracket and every other player connects to it. Each bracket match is played
 * separately — human vs human over its own 1v1 connection, human vs bot locally,
 * bot vs bot simulated by the organizer — and results are reported back.
 */

type TMsg =
  | { t: 't-join'; protocol: number; content: number; name: string; avatar: string; side: SideSetup }
  | { t: 't-welcome'; youAre: string }
  | { t: 't-reject'; reason: string }
  | { t: 't-state'; tournament: Tournament }
  | { t: 't-start'; matchId: TournamentMatchId }
  | { t: 't-result'; matchId: TournamentMatchId; winnerId: string }
  | { t: 'ping' }
  | { t: 'bye' };

const HEARTBEAT_MS = 4000;
const TIMEOUT_MS = 15000;

interface TournamentStore {
  role: 'none' | 'organizer' | 'member';
  status: 'idle' | 'connecting' | 'active' | 'error';
  error: string | null;
  code: string | null;
  myId: string | null;
  tournament: Tournament | null;
  botDifficulty: Difficulty;
  deckId: string | null;
  /** Bracket match currently being joined/played by this client. */
  activeMatch: TournamentMatchId | null;
  connectingMatch: string | null;
  prizeGiven: boolean;
  create: (deck: Deck, botDifficulty: Difficulty) => Promise<void>;
  join: (code: string, deck: Deck) => Promise<void>;
  start: () => void;
  leave: () => void;
  playMyMatch: (navigate: (path: string) => void) => Promise<void>;
}

// Networking handles (not part of reactive state).
let peer: Peer | null = null;
const conns = new Map<string, DataConnection>(); // organizer: playerId -> conn
let hostConn: DataConnection | null = null; // member: link to organizer
const lastSeen = new Map<string, number>();
let heartbeat: ReturnType<typeof setInterval> | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function myMatch(t: Tournament | null, myId: string | null): TournamentMatch | undefined {
  if (!t || !myId) return undefined;
  return t.matches.find((m) => (m.status === 'ready' || m.status === 'playing') && (m.a === myId || m.b === myId));
}

export const useTournament = create<TournamentStore>((set, get) => {
  // -------------------------------------------------------------------------
  // Organizer side
  // -------------------------------------------------------------------------

  function broadcast() {
    const t = get().tournament;
    if (!t) return;
    for (const c of conns.values()) if (c.open) c.send({ t: 't-state', tournament: t } satisfies TMsg);
  }

  function update(t: Tournament) {
    set({ tournament: t });
    if (get().role === 'organizer') {
      broadcast();
      runBotMatches();
    }
    onStateChanged();
  }

  /** Bot vs bot matches are simulated by the organizer after a short pause. */
  function runBotMatches() {
    const t = get().tournament;
    if (!t || get().role !== 'organizer') return;
    for (const m of readyMatches(t)) {
      const a = playerById(t, m.a)!;
      const b = playerById(t, m.b)!;
      if (!a.bot || !b.bot) continue;
      update(markPlaying(t, m.id));
      setTimeout(() => {
        const cur = get().tournament;
        if (!cur || cur.matches.find((x) => x.id === m.id)?.status === 'done') return;
        const sides = [a, b].map((p) => {
          const d = p.difficulty ?? 'NORMAL';
          return opponentSide({ ...PRACTICE_OPPONENTS[p.faction], name: p.name, difficulty: d, rarities: DIFFICULTY_POOLS[d] });
        }) as [SideSetup, SideSetup];
        const winner = simulateBotMatch(sides[0], sides[1], [a.difficulty ?? 'NORMAL', b.difficulty ?? 'NORMAL'], (Math.random() * 1e9) | 0);
        update(reportResult(get().tournament!, m.id, winner === 0 ? a.id : b.id));
      }, 2500);
    }
  }

  function handleOrganizerMessage(playerId: string, msg: TMsg) {
    const t = get().tournament;
    if (!t) return;
    if (msg.t === 't-start') update(markPlaying(t, msg.matchId));
    if (msg.t === 't-result') {
      const m = t.matches.find((x) => x.id === msg.matchId);
      // Only a participant of that match may report it.
      if (m && (m.a === playerId || m.b === playerId)) update(reportResult(t, msg.matchId, msg.winnerId));
    }
  }

  function dropPlayer(playerId: string) {
    conns.get(playerId)?.close();
    conns.delete(playerId);
    lastSeen.delete(playerId);
    const t = get().tournament;
    if (!t) return;
    if (t.phase === 'lobby') update({ ...t, players: t.players.filter((p) => p.id !== playerId) });
    else update(forfeitPlayer(t, playerId));
  }

  function startHeartbeat() {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = setInterval(() => {
      const now = Date.now();
      if (get().role === 'organizer') {
        for (const [id, c] of conns) {
          if (c.open) c.send({ t: 'ping' } satisfies TMsg);
          if (now - (lastSeen.get(id) ?? now) > TIMEOUT_MS) dropPlayer(id);
        }
      } else if (get().role === 'member' && hostConn) {
        if (hostConn.open) hostConn.send({ t: 'ping' } satisfies TMsg);
        if (now - (lastSeen.get('host') ?? now) > TIMEOUT_MS) organizerLost();
      }
    }, HEARTBEAT_MS);
  }

  function organizerLost() {
    if (get().role !== 'member') return;
    const done = get().tournament?.phase === 'done';
    teardown();
    set({ status: done ? 'idle' : 'error', error: done ? null : 'The organizer left, so the tournament has ended.' });
  }

  // -------------------------------------------------------------------------
  // Shared: react to bracket changes
  // -------------------------------------------------------------------------

  function onStateChanged() {
    const { tournament: t, myId, prizeGiven } = get();
    if (!t || !myId) return;
    if (t.phase === 'done' && !prizeGiven) {
      set({ prizeGiven: true });
      if (t.championId === myId) {
        gameService.grantTournamentPrize(TOURNAMENT_CONFIG.prizes.champion, 'Tournament champion');
        toast(`You won the tournament! +${TOURNAMENT_CONFIG.prizes.champion} Gold`, 'reward');
      } else if (t.runnerUpId === myId) {
        gameService.grantTournamentPrize(TOURNAMENT_CONFIG.prizes.runnerUp, 'Tournament runner-up');
        toast(`Runner-up! +${TOURNAMENT_CONFIG.prizes.runnerUp} Gold`, 'reward');
      }
    }
  }

  function report(rawMatchId: string, won: boolean) {
    const matchId = rawMatchId as TournamentMatchId;
    const { tournament: t, myId, role } = get();
    if (!t || !myId) return;
    const m = t.matches.find((x) => x.id === matchId);
    if (!m) return;
    const winnerId = won ? myId : m.a === myId ? m.b! : m.a!;
    set({ activeMatch: null });
    if (role === 'organizer') update(reportResult(t, matchId, winnerId));
    else hostConn?.send({ t: 't-result', matchId, winnerId } satisfies TMsg);
  }

  function teardown() {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    for (const c of conns.values()) {
      try {
        if (c.open) c.send({ t: 'bye' } satisfies TMsg);
      } catch {
        /* ignore */
      }
    }
    conns.clear();
    lastSeen.clear();
    try {
      if (hostConn?.open) hostConn.send({ t: 'bye' } satisfies TMsg);
    } catch {
      /* ignore */
    }
    hostConn = null;
    const p = peer;
    peer = null;
    setTimeout(() => p?.destroy(), 300);
    setTournamentMatchHandler(null);
    set({ role: 'none', code: null, myId: null, tournament: null, activeMatch: null, connectingMatch: null });
  }

  async function makePeer(id?: string): Promise<Peer> {
    const { Peer } = await import('peerjs');
    return new Promise((resolve, reject) => {
      const p = id ? new Peer(id) : new Peer();
      const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking service. Check your internet connection.')), 15000);
      p.on('open', () => {
        clearTimeout(timer);
        resolve(p);
      });
      p.on('error', (e: Error & { type?: string }) => {
        clearTimeout(timer);
        reject(new Error(e.type === 'peer-unavailable' ? 'No tournament with that code is open.' : e.type === 'unavailable-id' ? 'That tournament code is taken.' : e.message));
      });
    });
  }

  return {
    role: 'none',
    status: 'idle',
    error: null,
    code: null,
    myId: null,
    tournament: null,
    botDifficulty: 'NORMAL',
    deckId: null,
    activeMatch: null,
    connectingMatch: null,
    prizeGiven: false,

    create: async (deck, botDifficulty) => {
      teardown();
      const save = useAccount.getState().save!;
      set({ status: 'connecting', error: null, botDifficulty, deckId: deck.id, prizeGiven: false });
      let code = '';
      for (let attempt = 0; attempt < 3 && !peer; attempt++) {
        code = makeRoomCode().slice(0, 5);
        try {
          peer = await makePeer(roomPeerId(`T${code}`));
        } catch (e) {
          if (attempt === 2) {
            set({ status: 'error', error: (e as Error).message });
            return;
          }
        }
      }
      const me: TournamentPlayer = { id: 'p0', name: save.profile.username, avatar: save.profile.avatar, faction: deck.heroFaction, bot: false, side: playerSide(save.profile.username, save.profile.avatar, deck), connected: true };
      set({ role: 'organizer', status: 'active', code, myId: 'p0', tournament: newTournament(code, me) });
      setTournamentMatchHandler(report);
      startHeartbeat();
      let nextId = 1;
      peer!.on('connection', (conn) => {
        conn.on('open', () => {
          const onData = (raw: unknown) => {
            const msg = raw as TMsg;
            if (!msg || typeof msg !== 'object') return;
            const known = [...conns].find(([, c]) => c === conn)?.[0];
            if (known) {
              lastSeen.set(known, Date.now());
              if (msg.t === 'bye') return dropPlayer(known);
              return handleOrganizerMessage(known, msg);
            }
            if (msg.t !== 't-join') return;
            const t = get().tournament!;
            const reject = (reason: string) => {
              conn.send({ t: 't-reject', reason } satisfies TMsg);
              setTimeout(() => conn.close(), 500);
            };
            if (msg.protocol !== PROTOCOL_VERSION || msg.content !== CONTENT_HASH) return reject('You are running a different version of the game. Reload the page.');
            if (t.phase !== 'lobby') return reject('This tournament has already started.');
            if (t.players.filter((p) => !p.bot).length >= TOURNAMENT_CONFIG.size) return reject('This tournament is full.');
            const problem = validateRemoteSide(msg.side);
            if (problem) return reject(problem);
            const id = `p${nextId++}`;
            conns.set(id, conn);
            lastSeen.set(id, Date.now());
            conn.send({ t: 't-welcome', youAre: id } satisfies TMsg);
            const faction = (msg.side.faction as PlayableFaction) ?? 'EMBER';
            update({ ...t, players: [...t.players, { id, name: msg.name.slice(0, 20), avatar: msg.avatar, faction, bot: false, side: msg.side, connected: true }] });
          };
          conn.on('data', onData);
          conn.on('close', () => {
            const id = [...conns].find(([, c]) => c === conn)?.[0];
            if (id) dropPlayer(id);
          });
        });
      });
    },

    join: async (code, deck) => {
      teardown();
      const save = useAccount.getState().save!;
      set({ status: 'connecting', error: null, deckId: deck.id, prizeGiven: false });
      try {
        peer = await makePeer();
        const conn = peer.connect(roomPeerId(`T${code.toUpperCase()}`), { reliable: true });
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('The tournament did not answer.')), 15000);
          peer!.on('error', (e: Error & { type?: string }) => {
            if (e.type === 'peer-unavailable') {
              clearTimeout(timer);
              reject(new Error('No tournament with that code is open.'));
            }
          });
          conn.on('open', () =>
            conn.send({ t: 't-join', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, name: save.profile.username, avatar: save.profile.avatar, side: playerSide(save.profile.username, save.profile.avatar, deck) } satisfies TMsg),
          );
          conn.on('data', (raw) => {
            const msg = raw as TMsg;
            lastSeen.set('host', Date.now());
            if (msg.t === 't-welcome') {
              clearTimeout(timer);
              hostConn = conn;
              set({ role: 'member', status: 'active', code: code.toUpperCase(), myId: msg.youAre });
              setTournamentMatchHandler(report);
              startHeartbeat();
              resolve();
            } else if (msg.t === 't-reject') {
              clearTimeout(timer);
              reject(new Error(msg.reason));
            } else if (msg.t === 't-state') {
              set({ tournament: msg.tournament });
              onStateChanged();
            } else if (msg.t === 'bye') {
              organizerLost();
            }
          });
          conn.on('close', () => organizerLost());
        });
      } catch (e) {
        teardown();
        set({ status: 'error', error: (e as Error).message });
      }
    },

    start: () => {
      const { tournament: t, botDifficulty, role } = get();
      if (!t || role !== 'organizer') return;
      const taken = new Set(t.players.map((p) => p.faction));
      const factions = [...PLAYABLE_FACTIONS].sort((a, b) => Number(taken.has(a)) - Number(taken.has(b)));
      const bots = factions.map((f) => ({ name: `${PRACTICE_OPPONENTS[f].name} (bot)`, avatar: FACTIONS[f].sigil, faction: f, difficulty: botDifficulty }));
      try {
        update(startTournament(t, bots));
      } catch (e) {
        toast((e as Error).message, 'error');
      }
    },

    leave: () => {
      teardown();
      set({ status: 'idle', error: null });
    },

    playMyMatch: async (navigate) => {
      const { tournament: t, myId, role, deckId } = get();
      const m = myMatch(t, myId);
      const save = useAccount.getState().save;
      if (!t || !m || !myId || !save || get().connectingMatch) return;
      const deck = save.decks.find((d) => d.id === deckId) ?? save.decks[0];
      const opponentId = m.a === myId ? m.b! : m.a!;
      const opp = playerById(t, opponentId)!;
      if (role === 'organizer') update(markPlaying(t, m.id));
      else hostConn?.send({ t: 't-start', matchId: m.id } satisfies TMsg);
      set({ activeMatch: m.id });

      if (opp.bot) {
        const difficulty = opp.difficulty ?? 'NORMAL';
        launchMatch({ mode: 'TOURNAMENT', tournamentMatchId: m.id, deckId: deck.id, opponent: { ...PRACTICE_OPPONENTS[opp.faction], name: opp.name, difficulty, rarities: DIFFICULTY_POOLS[difficulty] } }, navigate);
        return;
      }
      // Human vs human: a dedicated 1v1 connection, hosted by the match's host player.
      set({ connectingMatch: m.id });
      try {
        const side = playerSide(save.profile.username, save.profile.avatar, deck);
        let role1v1: 'host' | 'guest';
        if (m.hostId === myId) {
          await netSession.host(save.profile.username, save.profile.avatar, (hello) => validateRemoteSide(hello.side), { code: m.room! });
          const until = Date.now() + 90000;
          while (netSession.status !== 'connected' && Date.now() < until) await sleep(250);
          if (netSession.status !== 'connected') throw new Error('Your opponent did not connect.');
          role1v1 = 'host';
        } else {
          let lastErr: Error | null = null;
          const until = Date.now() + 90000;
          for (;;) {
            try {
              await netSession.join(m.room!, side, deck.name, { timeoutMs: 8000 });
              break;
            } catch (e) {
              lastErr = e as Error;
              netSession.close();
              if (Date.now() > until) throw lastErr;
              await sleep(2000); // the host may still be getting ready
            }
          }
          role1v1 = 'guest';
        }
        launchMatch({ mode: 'TOURNAMENT', online: role1v1, tournamentMatchId: m.id, deckId: deck.id, opponent: onlineOpponent(opp.name, opp.avatar, opp.faction) }, navigate);
      } catch (e) {
        netSession.close();
        toast((e as Error).message, 'error');
        set({ activeMatch: null });
      } finally {
        set({ connectingMatch: null });
      }
    },
  };
});

export function myTournamentMatch() {
  const s = useTournament.getState();
  return myMatch(s.tournament, s.myId);
}

export { myMatch };
