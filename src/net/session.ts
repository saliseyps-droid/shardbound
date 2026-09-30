import type { DataConnection, Peer } from 'peerjs';
import { collectibleCards } from '@/data/cards';
import { hashString } from '@/core/rng';
import type { GameAction, GameEvent, GameState, SideSetup } from '@/engine/types';

/**
 * Peer-to-peer match session (WebRTC via PeerJS's public signalling server).
 * The host is authoritative: it runs the engine and sends the guest redacted,
 * mirrored views. The guest only sends actions.
 */

export const PROTOCOL_VERSION = 1;
const ID_PREFIX = 'shardbound-v1-';
const HEARTBEAT_MS = 4000;
const TIMEOUT_MS = 15000;

/** Both players must run the same card database. */
export const CONTENT_HASH = hashString(
  collectibleCards()
    .map((c) => `${c.id}:${c.manaCost}:${c.attack ?? ''}:${c.health ?? ''}:${JSON.stringify(c.abilities ?? [])}`)
    .join('|'),
);

export type NetMessage =
  | { t: 'hello'; protocol: number; content: number; side: SideSetup; deckName: string }
  | { t: 'welcome'; hostName: string; hostAvatar: string }
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
  async host(hostName: string, hostAvatar: string, validate: (msg: Extract<NetMessage, { t: 'hello' }>) => string | null): Promise<string> {
    this.close();
    this.role = 'host';
    this.setStatus('opening');
    let peer: Peer | null = null;
    for (let attempt = 0; attempt < 3 && !peer; attempt++) {
      this.code = makeRoomCode();
      try {
        peer = await this.createPeer(ID_PREFIX + this.code);
      } catch (e) {
        if (attempt === 2 || !(e as Error).message.includes('taken')) throw e;
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
          this.remoteSide = msg.side;
          this.remoteDeckName = msg.deckName;
          this.remoteName = msg.side.name;
          this.remoteAvatar = msg.side.avatar;
          this.attach(conn);
          conn.send({ t: 'welcome', hostName, hostAvatar } satisfies NetMessage);
          this.setStatus('connected');
        };
        conn.on('data', onHello);
      });
    });
    return this.code!;
  }

  /** Guest: connects to a room code and sends its deck. Resolves on welcome. */
  async join(code: string, side: SideSetup, deckName: string): Promise<void> {
    this.close();
    this.role = 'guest';
    this.code = code.toUpperCase();
    this.setStatus('connecting');
    this.peer = await this.createPeer();
    const conn = this.peer.connect(ID_PREFIX + this.code, { reliable: true });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Your friend’s game did not answer. Make sure they are still on the waiting screen.')), 20000);
      conn.on('open', () => {
        conn.send({ t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName } satisfies NetMessage);
      });
      conn.on('data', (raw) => {
        const msg = raw as NetMessage;
        if (msg?.t === 'welcome') {
          clearTimeout(timer);
          this.remoteName = msg.hostName;
          this.remoteAvatar = msg.hostAvatar;
          this.attach(conn);
          this.setStatus('connected');
          resolve();
        } else if (msg?.t === 'reject') {
          clearTimeout(timer);
          reject(new Error(msg.reason));
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
    if (this.status !== 'idle') this.setStatus('idle');
  }
}

export const netSession = new NetSession();
