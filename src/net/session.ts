import { BOSS_TALENTS, FACTION_TALENTS } from '@/data/wardenTalents';
import type { DataConnection, Peer } from 'peerjs';
import { collectibleCards } from '@/data/cards';
import { hashString } from '@/core/rng';
import type { GameAction, GameEvent, GameState, SideSetup } from '@/engine/types';
import { sanitizeRemoteSide } from './lobby';

/**
 * Peer-to-peer match session (WebRTC via PeerJS's public signalling server).
 * The host is authoritative: it runs the engine and sends the guest redacted,
 * mirrored views. The guest only sends actions.
 */

export const PROTOCOL_VERSION = 4;
export const ID_PREFIX = 'shardbound-v1-';
const HEARTBEAT_MS = 4000;
const TIMEOUT_MS = 15000;
/** PeerJS's public signalling server (the one `new Peer()` uses); reachable = our network works. */
const SIGNALLING_PROBE = 'https://0.peerjs.com/peerjs/id';

/** Both players must run the same card database (mechanics only, so different languages can play together). */
export function contentHash(): number {
  return hashString(
  collectibleCards()
    .map((c) => `${c.id}:${c.manaCost}:${c.attack ?? ''}:${c.health ?? ''}:${JSON.stringify(c.abilities ?? [])}`)
    .join('|') +
    // Mechanics only: names and texts differ between languages, which must still play together.
    JSON.stringify([...Object.values(FACTION_TALENTS).flat(), ...BOSS_TALENTS].map((t) => [t.id, t.kind, t.levels.map(({ description: _d, ...rules }) => rules)])),
  );
}
export const CONTENT_HASH = contentHash();

export type NetMessage =
  | { t: 'hello'; protocol: number; content: number; side: SideSetup; deckName: string; meta?: Record<string, unknown> }
  | { t: 'welcome'; hostName: string; hostAvatar: string; meta?: Record<string, unknown> }
  | { t: 'reject'; reason: string }
  | { t: 'state'; state: GameState; events: GameEvent[]; initial?: boolean }
  /** Sent by the guest in its own (mirrored) coordinates; the host converts it. */
  | { t: 'action'; action: GameAction }
  | { t: 'error'; message: string }
  | { t: 'ping' }
  | { t: 'bye' };

export type SessionStatus = 'idle' | 'opening' | 'waiting' | 'connecting' | 'connected' | 'closed' | 'error';

type Listener = (msg: NetMessage) => void;

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeRoomCode(): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export function joinLink(code: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/join/${code}`;
}

class NetSession {
  role: 'host' | 'guest' | null = null;
  code: string | null = null;
  status: SessionStatus = 'idle';
  error: string | null = null;
  /** Guest's side setup received by the host. */
  remoteSide: SideSetup | null = null;
  remoteDeckName = '';
  remoteName = '';
  remoteAvatar = 'compass';
  /** Extra data exchanged on connect (e.g. ranked rating). */
  remoteMeta: Record<string, unknown> = {};
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<() => void>();
  private lastSeen = 0;
  private heartbeat: number | null = null;

  onMessage(l: Listener) {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  }

  onStatus(l: () => void) {
    this.statusListeners.add(l);
    return () => void this.statusListeners.delete(l);
  }

  get connected() {
    return this.status === 'connected';
  }

  private setStatus(status: SessionStatus, error: string | null = null) {
    this.status = status;
    this.error = error;
    for (const l of this.statusListeners) l();
  }

  send(msg: NetMessage) {
    if (this.conn?.open) this.conn.send(msg);
  }

  private async createPeer(id?: string): Promise<Peer> {
    const { Peer } = await import('peerjs');
    return new Promise((resolve, reject) => {
      const peer = id ? new Peer(id) : new Peer();
      const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking service. Check your internet connection.')), 15000);
      peer.on('open', () => {
        clearTimeout(timer);
        resolve(peer);
      });
      peer.on('error', (e: Error & { type?: string }) => {
        clearTimeout(timer);
        const message =
          e.type === 'peer-unavailable'
            ? 'This match link is no longer available. Ask your friend for a new one.'
            : e.type === 'unavailable-id'
              ? 'That room code is taken. Try again.'
              : e.type === 'network' || e.type === 'server-error'
                ? 'Could not reach the matchmaking service. Check your internet connection.'
                : e.message;
        if (this.status === 'connected') return; // late signalling errors don't matter once connected
        this.setStatus('error', message);
        reject(new Error(message));
      });
    });
  }

  private attach(conn: DataConnection) {
    this.conn = conn;
    this.lastSeen = Date.now();
    conn.on('data', (raw) => {
      this.lastSeen = Date.now();
      const msg = raw as NetMessage;
      if (!msg || typeof msg !== 'object' || !('t' in msg)) return;
      if (msg.t === 'ping') return;
      if (msg.t === 'bye') return this.handleClose();
      for (const l of this.listeners) l(msg);
    });
    conn.on('close', () => this.handleClose());
    conn.on('error', () => this.handleClose());
    this.stopHeartbeat();
    this.heartbeat = window.setInterval(() => {
      this.send({ t: 'ping' });
      if (Date.now() - this.lastSeen > TIMEOUT_MS) this.handleClose();
    }, HEARTBEAT_MS);
  }

  /**
   * After the opponent's connection dropped: is this device's own network still working?
   * False when the browser is offline, when PeerJS lost its signalling server, or when the
   * signalling server can't be reached. Decides who gets the win (see matchStore).
   */
  async localNetworkOk(timeoutMs = 4000): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    if (this.peer && (this.peer.destroyed || this.peer.disconnected)) return false;
    if (typeof fetch !== 'function') return true;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl?.abort(), timeoutMs);
    try {
      await fetch(`${SIGNALLING_PROBE}?ts=${Date.now()}`, { mode: 'no-cors', cache: 'no-store', signal: ctrl?.signal });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  private handleClose() {
    if (this.status === 'closed' || this.status === 'idle') return;
    this.stopHeartbeat();
    this.conn = null;
    this.setStatus('closed', 'Your opponent disconnected.');
  }

  private stopHeartbeat() {
    if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  /** Host: opens a room and resolves when a valid guest has said hello. */
  async host(
    hostName: string,
    hostAvatar: string,
    validate: (msg: Extract<NetMessage, { t: 'hello' }>) => string | null,
    opts: { code?: string; meta?: Record<string, unknown> } = {},
  ): Promise<string> {
    this.close();
    this.role = 'host';
    this.setStatus('opening');
    let peer: Peer | null = null;
    // A fixed code (matchmaking slots, tournament rooms) gets exactly one attempt.
    const attempts = opts.code ? 1 : 3;
    for (let attempt = 0; attempt < attempts && !peer; attempt++) {
      this.code = opts.code ?? makeRoomCode();
      try {
        peer = await this.createPeer(ID_PREFIX + this.code);
      } catch (e) {
        if (attempt === attempts - 1 || !(e as Error).message.includes('taken')) throw e;
      }
    }
    this.peer = peer!;
    this.setStatus('waiting');
    this.peer.on('connection', (conn) => {
      if (this.conn) {
        conn.on('open', () => {
          conn.send({ t: 'reject', reason: 'This match already has two players.' } satisfies NetMessage);
          setTimeout(() => conn.close(), 500);
        });
        return;
      }
      conn.on('open', () => {
        const onHello = (raw: unknown) => {
          const msg = raw as NetMessage;
          if (msg?.t !== 'hello') return;
          conn.off('data', onHello);
          const problem =
            msg.protocol !== PROTOCOL_VERSION || msg.content !== CONTENT_HASH ? 'You and your friend are running different versions of the game. Both of you should reload the page.' : validate(msg);
          if (problem) {
            conn.send({ t: 'reject', reason: problem } satisfies NetMessage);
            setTimeout(() => conn.close(), 500);
            return;
          }
          // Only the validated, whitelisted fields reach the engine (the deck is always shuffled).
          this.remoteSide = sanitizeRemoteSide(msg.side);
          this.remoteDeckName = typeof msg.deckName === 'string' ? msg.deckName.slice(0, 40) : 'Deck';
          this.remoteName = this.remoteSide.name;
          this.remoteAvatar = this.remoteSide.avatar;
          this.remoteMeta = msg.meta && typeof msg.meta === 'object' ? msg.meta : {};
          this.attach(conn);
          conn.send({ t: 'welcome', hostName, hostAvatar, meta: opts.meta } satisfies NetMessage);
          this.setStatus('connected');
        };
        conn.on('data', onHello);
      });
    });
    return this.code!;
  }

  /** Guest: connects to a room code and sends its deck. Resolves on welcome. */
  async join(code: string, side: SideSetup, deckName: string, opts: { meta?: Record<string, unknown>; timeoutMs?: number } = {}): Promise<void> {
    this.close();
    this.role = 'guest';
    this.code = code.toUpperCase();
    this.setStatus('connecting');
    this.peer = await this.createPeer();
    const peer = this.peer;
    const conn = peer.connect(ID_PREFIX + this.code, { reliable: true });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Your friend’s game did not answer. Make sure they are still on the waiting screen.')), opts.timeoutMs ?? 20000);
      // Nobody in that room: fail fast instead of waiting for the timeout.
      peer.on('error', (e: Error & { type?: string }) => {
        if (e.type === 'peer-unavailable') {
          clearTimeout(timer);
          reject(Object.assign(new Error('This room is empty.'), { type: 'peer-unavailable' }));
        }
      });
      conn.on('open', () => {
        conn.send({ t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName, meta: opts.meta } satisfies NetMessage);
      });
      conn.on('data', (raw) => {
        const msg = raw as NetMessage;
        if (msg?.t === 'welcome') {
          clearTimeout(timer);
          this.remoteName = msg.hostName;
          this.remoteAvatar = msg.hostAvatar;
          this.remoteMeta = msg.meta ?? {};
          this.attach(conn);
          this.setStatus('connected');
          resolve();
        } else if (msg?.t === 'reject') {
          clearTimeout(timer);
          reject(Object.assign(new Error(msg.reason), { type: 'rejected' }));
        }
      });
      conn.on('error', (e) => {
        clearTimeout(timer);
        reject(e);
      });
    }).catch((e: Error) => {
      this.setStatus('error', e.message);
      throw e;
    });
  }

  close() {
    this.stopHeartbeat();
    if (this.conn?.open) {
      try {
        this.conn.send({ t: 'bye' } satisfies NetMessage);
      } catch {
        /* ignore */
      }
    }
    const peer = this.peer;
    // Give the goodbye a moment to flush.
    setTimeout(() => peer?.destroy(), 300);
    this.peer = null;
    this.conn = null;
    this.remoteSide = null;
    this.remoteMeta = {};
    if (this.status !== 'idle') this.setStatus('idle');
  }
}

export const netSession = new NetSession();

/** Peer id for a room code (used by matchmaking/tournament helpers). */
export const roomPeerId = (code: string) => ID_PREFIX + code;
