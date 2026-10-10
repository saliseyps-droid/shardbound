import type { DataConnection, Peer } from 'peerjs';
import type { GameEvent, GameState } from '@/engine/types';
import { peerOptions } from './iceServers';
import { CONTENT_HASH, ID_PREFIX, PROTOCOL_VERSION, makeRoomCode } from './session';
import { gzipSupported, pack, unpack, type Compressed } from './compress';
import { spectatorEvents, spectatorView } from './view';
import { isWatchCode, matchWatchCode, tournamentWatchCode } from './watchCode';

/**
 * Spectating. Whoever runs a match's engine (the online host, or the player in a match against the
 * AI) opens a watch room next to it: a separate PeerJS peer that up to MAX_SPECTATORS can join. After
 * every change they get the whole state as a spectator sees it (no hands, no deck order) with its
 * events, so their board animates like the players' boards. Spectators never send actions.
 */

export const MAX_SPECTATORS = 4;
const HEARTBEAT_MS = 4000;
const TIMEOUT_MS = 15000;

/** Who is playing, shown to spectators. */
export interface WatchInfo {
  players: [{ name: string; avatar: string }, { name: string; avatar: string }];
  /** The match's mode (MatchConfig['mode']), for the spectator's title. */
  mode: string;
}

export type WatchMessage =
  | { t: 'w-hello'; protocol: number; content: number; gzip?: boolean }
  | { t: 'w-welcome'; info: WatchInfo }
  | { t: 'w-reject'; reason: string }
  | { t: 'w-state'; seq: number; state: GameState; events: GameEvent[] }
  | { t: 'ping' }
  | { t: 'bye' };

export { isWatchCode, matchWatchCode, tournamentWatchCode };

/** A fresh watch room for a match against the AI. */
export const newWatchCode = () => matchWatchCode(makeRoomCode());

export function validWatchHello(msg: unknown): string | null {
  const m = msg as Partial<Extract<WatchMessage, { t: 'w-hello' }>> | null;
  if (!m || m.t !== 'w-hello') return 'Invalid request.';
  if (m.protocol !== PROTOCOL_VERSION || m.content !== CONTENT_HASH) return 'You are running different versions of the game. Reload the page.';
  return null;
}

async function createPeer(id?: string): Promise<Peer> {
  const [{ Peer }, options] = await Promise.all([import('peerjs'), peerOptions()]);
  return new Promise((resolve, reject) => {
    const peer = id ? new Peer(id, options) : new Peer(options);
    const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking service. Check your internet connection.')), 15000);
    peer.on('open', () => {
      clearTimeout(timer);
      resolve(peer);
    });
    peer.on('error', (e: Error & { type?: string }) => {
      clearTimeout(timer);
      reject(Object.assign(new Error(e.type === 'peer-unavailable' ? 'This match is no longer running.' : e.message), { type: e.type }));
    });
  });
}

interface Watcher {
  conn: DataConnection;
  gzip: boolean;
  lastSeen: number;
}

/** The player's side: the watch room of the match being played. */
class WatchHub {
  code: string | null = null;
  private peer: Peer | null = null;
  private info: WatchInfo | null = null;
  private watchers = new Set<Watcher>();
  private latest: Extract<WatchMessage, { t: 'w-state' }> | null = null;
  private seq = 0;
  private heartbeat: number | null = null;
  /** Bumped by every open/close, so a slow open that was overtaken gives up. */
  private gen = 0;

  get spectators() {
    return this.watchers.size;
  }

  /** Opens the watch room; failures (offline, code taken) only mean nobody can watch. */
  async open(code: string, info: WatchInfo) {
    this.close();
    const gen = ++this.gen;
    this.code = code;
    this.info = info;
    let peer: Peer;
    try {
      peer = await createPeer(ID_PREFIX + code);
    } catch (e) {
      console.warn('[watch] could not open the watch room', e);
      if (gen === this.gen) this.code = null;
      return;
    }
    if (gen !== this.gen) return void peer.destroy();
    this.peer = peer;
    peer.on('connection', (conn) => this.accept(conn));
    this.heartbeat = window.setInterval(() => {
      const now = Date.now();
      for (const w of [...this.watchers]) {
        if (now - w.lastSeen > TIMEOUT_MS || !w.conn.open) this.drop(w);
        else w.conn.send({ t: 'ping' } satisfies WatchMessage);
      }
    }, HEARTBEAT_MS);
  }

  private accept(conn: DataConnection) {
    conn.on('open', () => {
      const onHello = (raw: unknown) => {
        conn.off('data', onHello);
        const problem = validWatchHello(raw) ?? (this.watchers.size >= MAX_SPECTATORS ? 'This match already has the most spectators it can take.' : null);
        if (problem || !this.info) {
          conn.send({ t: 'w-reject', reason: problem ?? 'This match is no longer running.' } satisfies WatchMessage);
          setTimeout(() => conn.close(), 500);
          return;
        }
        const w: Watcher = { conn, gzip: (raw as { gzip?: boolean }).gzip === true && gzipSupported(), lastSeen: Date.now() };
        this.watchers.add(w);
        conn.on('data', () => void (w.lastSeen = Date.now()));
        conn.on('close', () => this.drop(w));
        conn.on('error', () => this.drop(w));
        conn.send({ t: 'w-welcome', info: this.info } satisfies WatchMessage);
        if (this.latest) void this.sendTo(w, { ...this.latest, events: [] });
      };
      conn.on('data', onHello);
    });
  }

  private drop(w: Watcher) {
    if (!this.watchers.delete(w)) return;
    try {
      w.conn.close();
    } catch {
      /* ignore */
    }
  }

  private async sendTo(w: Watcher, msg: WatchMessage) {
    try {
      const payload = await pack(msg, w.gzip);
      if (w.conn.open) w.conn.send(payload);
    } catch (e) {
      console.warn('[watch] send failed', e);
    }
  }

  /** The match changed: send the spectators' view of `state` (with the events that led to it). */
  push(state: GameState, events: GameEvent[]) {
    if (!this.code) return;
    this.latest = { t: 'w-state', seq: ++this.seq, state: spectatorView(state), events: spectatorEvents(events) };
    for (const w of this.watchers) void this.sendTo(w, this.latest);
  }

  /** Ends the watch room (after the final state has gone out). */
  close() {
    this.gen++;
    if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
    for (const w of this.watchers) {
      try {
        if (w.conn.open) w.conn.send({ t: 'bye' } satisfies WatchMessage);
      } catch {
        /* ignore */
      }
    }
    const peer = this.peer;
    setTimeout(() => peer?.destroy(), 1500);
    this.watchers.clear();
    this.peer = null;
    this.code = null;
    this.info = null;
    this.latest = null;
    this.seq = 0;
  }
}

export const watchHub = new WatchHub();

export interface Watching {
  info: WatchInfo;
  /** The first state (the match as it is when the spectator joins). */
  initial: GameState;
  close: () => void;
}

/**
 * The spectator's side: joins a watch room. `onState` gets every later change; `onEnd` is called
 * when the room closes (match over, host gone) or the link drops.
 */
export async function watchMatch(code: string, onState: (state: GameState, events: GameEvent[]) => void, onEnd: (reason: string) => void): Promise<Watching> {
  const peer = await createPeer();
  let lastSeen = Date.now();
  let ended = false;
  let heartbeat: number | null = null;
  const finish = (reason: string) => {
    if (ended) return;
    ended = true;
    if (heartbeat !== null) window.clearInterval(heartbeat);
    setTimeout(() => peer.destroy(), 300);
    onEnd(reason);
  };
  const conn = peer.connect(ID_PREFIX + code, { reliable: true });
  let chain: Promise<void> = Promise.resolve();
  let lastSeq = 0;
  return new Promise<Watching>((resolve, reject) => {
    let info: WatchInfo | null = null;
    const timer = setTimeout(() => {
      reject(new Error('The match did not answer.'));
      finish('timeout');
    }, 20000);
    peer.on('error', (e: Error & { type?: string }) => {
      if (info) return;
      clearTimeout(timer);
      reject(new Error(e.type === 'peer-unavailable' ? 'This match is no longer running.' : e.message));
      finish('error');
    });
    conn.on('open', () => conn.send({ t: 'w-hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, gzip: gzipSupported() } satisfies WatchMessage));
    conn.on('data', (raw) => {
      lastSeen = Date.now();
      chain = chain
        .then(async () => {
          const msg = await unpack<WatchMessage>(raw as WatchMessage | Compressed);
          if (!msg || typeof msg !== 'object') return;
          if (msg.t === 'w-reject') {
            clearTimeout(timer);
            reject(new Error(msg.reason));
            finish('rejected');
          } else if (msg.t === 'w-welcome') {
            info = msg.info;
          } else if (msg.t === 'w-state' && info) {
            if (msg.seq <= lastSeq) return;
            const first = lastSeq === 0;
            lastSeq = msg.seq;
            if (first) {
              clearTimeout(timer);
              heartbeat = window.setInterval(() => {
                if (conn.open) conn.send({ t: 'ping' } satisfies WatchMessage);
                if (Date.now() - lastSeen > TIMEOUT_MS) finish('timeout');
              }, HEARTBEAT_MS);
              resolve({ info, initial: msg.state, close: () => finish('left') });
            } else onState(msg.state, msg.events);
          } else if (msg.t === 'bye') finish('closed');
        })
        .catch((e) => console.warn('[watch] could not read a message', e));
    });
    conn.on('close', () => finish('closed'));
    conn.on('error', () => finish('error'));
  });
}
