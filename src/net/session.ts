import { BOSS_TALENTS, FACTION_TALENTS } from '@/data/wardenTalents';
import type { DataConnection, Peer } from 'peerjs';
import { peerOptions } from './iceServers';
import { collectibleCards } from '@/data/cards';
import { hashString } from '@/core/rng';
import type { GameAction, SideSetup } from '@/engine/types';
import { sanitizeRemoteSide } from './lobby';
import { gzipSupported, pack, unpack, COMPRESS_MIN_BYTES, type Compressed } from './compress';
import type { DeltaStateMsg, FullStateMsg } from './stateSync';

/**
 * Peer-to-peer match session (WebRTC via PeerJS's public signalling server).
 * The host is authoritative: it runs the engine and sends the guest redacted,
 * mirrored views. The guest only sends actions.
 */

// 5: delta states (`delta`/`resync`) and gzip-compressed large messages (`z`).
export const PROTOCOL_VERSION = 5;
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
  | { t: 'hello'; protocol: number; content: number; side: SideSetup; deckName: string; meta?: Record<string, unknown>; gzip?: boolean }
  | { t: 'welcome'; hostName: string; hostAvatar: string; meta?: Record<string, unknown>; gzip?: boolean }
  | { t: 'reject'; reason: string }
  /** A full guest view (the initial one, or the answer to `resync`). */
  | FullStateMsg
  /** A patch against the last view the guest received (see stateSync.ts). */
  | DeltaStateMsg
  /** Guest: my view is out of step, send a full state. */
  | { t: 'resync' }
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
  /** Both sides can gzip (agreed in hello/welcome): large messages are sent compressed. */
  private gzip = false;
  /** Outgoing messages waiting for compression (sent strictly in order). */
  private sendChain: Promise<void> = Promise.resolve();
  private sendPending = 0;
  /** Incoming messages waiting for decompression (delivered strictly in order). */
  private recvChain: Promise<void> = Promise.resolve();
  private recvPending = 0;
  /** Messages sent in this app session, and how many of them went out compressed. */
  stats = { messages: 0, compressed: 0 };

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
    const conn = this.conn;
    if (!conn?.open) return;
    this.stats.messages++;
    // Small messages go out right away unless a compressed one is still ahead of them.
    if (this.sendPending === 0 && !this.worthCompressing(msg)) {
      conn.send(msg);
      return;
    }
    const gzip = this.gzip;
    this.sendPending++;
    this.sendChain = this.sendChain
      .then(async () => {
        const payload = await pack(msg, gzip);
        if ((payload as Compressed).t === 'z') this.stats.compressed++;
        if (conn.open) conn.send(payload);
      })
      .catch((e) => console.error('[net] send failed', e))
      .finally(() => void this.sendPending--);
  }

  private worthCompressing(msg: NetMessage): boolean {
    if (!this.gzip || msg.t === 'ping' || msg.t === 'bye' || msg.t === 'action' || msg.t === 'resync') return false;
    return JSON.stringify(msg).length >= COMPRESS_MIN_BYTES;
  }

  private deliver(msg: NetMessage) {
    if (!msg || typeof msg !== 'object' || !('t' in msg)) return;
    if (msg.t === 'ping') return;
    if (msg.t === 'bye') return this.handleClose();
    for (const l of this.listeners) l(msg);
  }

  /** Peer id of the other player (kept after the link drops, to ask the server about them). */
  private remotePeerId: string | null = null;
  private probing = false;

  /**
   * After the link dropped: is the opponent's game still registered on the signalling server?
   * False when the server says the peer is gone (closed tab, lost connection); true when it
   * still knows them (or doesn't answer), i.e. only the link between the two players broke.
   */
  async remotePeerPresent(timeoutMs = 6000): Promise<boolean> {
    const peer = this.peer;
    const id = this.remotePeerId;
    if (!peer || peer.destroyed || !id) return true;
    this.probing = true;
    try {
      return await new Promise<boolean>((resolve) => {
        let probe: DataConnection | null = null;
        const done = (present: boolean) => {
          clearTimeout(timer);
          peer.off('error', onError);
          try {
            probe?.close();
          } catch {
            /* ignore */
          }
          resolve(present);
        };
        const onError = (e: Error & { type?: string }) => {
          if (e.type === 'peer-unavailable') done(false);
        };
        const timer = setTimeout(() => done(true), timeoutMs);
        peer.on('error', onError);
        try {
          probe = peer.connect(id, { reliable: true, metadata: { probe: true } });
          probe.on('open', () => done(true));
        } catch {
          done(true);
        }
      });
    } finally {
      this.probing = false;
    }
  }

  private async createPeer(id?: string): Promise<Peer> {
    const [{ Peer }, options] = await Promise.all([import('peerjs'), peerOptions()]);
    return new Promise((resolve, reject) => {
      const peer = id ? new Peer(id, options) : new Peer(options);
      let opened = false;
      const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking service. Check your internet connection.')), 15000);
      peer.on('open', () => {
        opened = true;
        clearTimeout(timer);
        resolve(peer);
      });
      peer.on('error', (e: Error & { type?: string }) => {
        clearTimeout(timer);
        // A closed (or lingering) peer of an earlier session must not touch the current one.
        if (opened && this.peer !== peer) return;
        // Once a match link existed, "peer-unavailable" can only be the answer to a probe
        // (possibly arriving after the probe timed out): it never makes the session fail.
        if (e.type === 'peer-unavailable' && this.remotePeerId) return;
        const message =
          e.type === 'peer-unavailable'
            ? 'This match link is no longer available. Ask your friend for a new one.'
            : e.type === 'unavailable-id'
              ? 'That room code is taken. Try again.'
              : e.type === 'network' || e.type === 'server-error'
                ? 'Could not reach the matchmaking service. Check your internet connection.'
                : e.message;
        if (this.status === 'connected' || this.probing) return; // late signalling errors don't matter once connected
        this.setStatus('error', message);
        reject(new Error(message));
      });
    });
  }

  private attach(conn: DataConnection) {
    this.conn = conn;
    this.remotePeerId = conn.peer;
    this.lastSeen = Date.now();
    conn.on('data', (raw) => {
      this.lastSeen = Date.now();
      const msg = raw as NetMessage | Compressed;
      if (!msg || typeof msg !== 'object' || !('t' in msg)) return;
      if (msg.t === 'ping') return;
      // Uncompressed messages are delivered at once unless a compressed one is still being unpacked.
      if (msg.t !== 'z' && this.recvPending === 0) return this.deliver(msg);
      this.recvPending++;
      this.recvChain = this.recvChain
        .then(async () => {
          const plain = await unpack<NetMessage>(msg);
          if (this.conn === conn) this.deliver(plain);
        })
        .catch((e) => console.error('[net] could not read a message', e))
        .finally(() => void this.recvPending--);
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

  /**
   * After a disconnect draw: the peer stays registered (answering probes only) this long after
   * close(), so the other player's check still sees this side as present and records a draw too.
   */
  private lingering: { peer: Peer; timer: ReturnType<typeof setTimeout> } | null = null;

  /** Until when close() must keep the peer alive (set after a disconnect draw). */
  private lingerUntil = 0;

  /** The next close() (whoever calls it) keeps the peer registered for at least `ms` from now. */
  keepAliveFor(ms: number) {
    this.lingerUntil = Math.max(this.lingerUntil, Date.now() + ms);
  }

  private endLinger() {
    if (!this.lingering) return;
    clearTimeout(this.lingering.timer);
    this.lingering.peer.destroy();
    this.lingering = null;
  }

  /** Answers probes on a peer; every other incoming connection is refused. */
  private static refuse(conn: DataConnection) {
    if ((conn.metadata as { probe?: boolean } | undefined)?.probe) {
      setTimeout(() => conn.close(), 500);
      return;
    }
    conn.on('open', () => {
      conn.send({ t: 'reject', reason: 'This match already has two players.' } satisfies NetMessage);
      setTimeout(() => conn.close(), 500);
    });
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
    // A lingering peer from the last match may still hold this room's id.
    if (opts.code && this.lingering?.peer.id === ID_PREFIX + opts.code) this.endLinger();
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
    const own = peer!;
    this.peer = own;
    this.setStatus('waiting');
    // Once a guest was accepted, this room never takes anyone else (not even after the link
    // dropped, or while the peer lingers after the match).
    let matched = false;
    own.on('connection', (conn) => {
      if (matched || this.peer !== own) return NetSession.refuse(conn);
      if ((conn.metadata as { probe?: boolean } | undefined)?.probe) return NetSession.refuse(conn);
      conn.on('open', () => {
        const onHello = (raw: unknown) => {
          const msg = raw as NetMessage;
          if (msg?.t !== 'hello') return;
          conn.off('data', onHello);
          if (matched || this.peer !== own) {
            conn.send({ t: 'reject', reason: 'This match already has two players.' } satisfies NetMessage);
            setTimeout(() => conn.close(), 500);
            return;
          }
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
          matched = true;
          this.gzip = msg.gzip === true && gzipSupported();
          this.attach(conn);
          conn.send({ t: 'welcome', hostName, hostAvatar, meta: opts.meta, gzip: gzipSupported() } satisfies NetMessage);
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
    // The guest's peer only answers probes (the host checking whether we are still there).
    peer.on('connection', (incoming) => NetSession.refuse(incoming));
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
        conn.send({ t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName, meta: opts.meta, gzip: gzipSupported() } satisfies NetMessage);
      });
      conn.on('data', (raw) => {
        const msg = raw as NetMessage;
        if (msg?.t === 'welcome') {
          clearTimeout(timer);
          this.remoteName = msg.hostName;
          this.remoteAvatar = msg.hostAvatar;
          this.remoteMeta = msg.meta ?? {};
          this.gzip = msg.gzip === true && gzipSupported();
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

  /**
   * Ends the session. With `lingerMs` (after a disconnect draw) the peer is kept registered for
   * that long, answering only probes, so the opponent's disconnect check finds it and agrees.
   */
  close(opts: { lingerMs?: number } = {}) {
    this.stopHeartbeat();
    const conn = this.conn;
    if (conn?.open) {
      // After anything still being compressed (e.g. the final state), so the opponent sees it first.
      const bye = () => {
        try {
          if (conn.open) conn.send({ t: 'bye' } satisfies NetMessage);
        } catch {
          /* ignore */
        }
      };
      if (this.sendPending) void this.sendChain.then(bye);
      else bye();
    }
    const peer = this.peer;
    const lingerMs = Math.max(opts.lingerMs ?? 0, this.lingerUntil - Date.now());
    this.lingerUntil = 0;
    if (peer && !peer.destroyed && lingerMs > 0) {
      this.endLinger();
      const timer = setTimeout(() => {
        if (this.lingering?.peer === peer) this.lingering = null;
        peer.destroy();
      }, lingerMs);
      this.lingering = { peer, timer };
    } else {
      // Give the goodbye a moment to flush.
      setTimeout(() => peer?.destroy(), 300);
    }
    this.peer = null;
    this.conn = null;
    this.remotePeerId = null;
    this.remoteSide = null;
    this.remoteMeta = {};
    this.gzip = false;
    if (this.status !== 'idle') this.setStatus('idle');
  }
}

export const netSession = new NetSession();

/** Peer id for a room code (used by matchmaking/tournament helpers). */
export const roomPeerId = (code: string) => ID_PREFIX + code;
