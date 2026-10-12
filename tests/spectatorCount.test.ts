// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

type Handler = (...args: unknown[]) => void;
class Emitter {
  handlers = new Map<string, Set<Handler>>();
  on(ev: string, fn: Handler) {
    if (!this.handlers.has(ev)) this.handlers.set(ev, new Set());
    this.handlers.get(ev)!.add(fn);
    return this;
  }
  off(ev: string, fn: Handler) {
    this.handlers.get(ev)?.delete(fn);
    return this;
  }
  emit(ev: string, ...args: unknown[]) {
    for (const fn of [...(this.handlers.get(ev) ?? [])]) fn(...args);
  }
}
class FakeConn extends Emitter {
  open = false;
  sent: unknown[] = [];
  send(m: unknown) {
    this.sent.push(m);
  }
  close() {
    this.open = false;
  }
}
const peers: FakePeer[] = [];
class FakePeer extends Emitter {
  constructor(public id = `rand-${peers.length}`) {
    super();
    peers.push(this);
    setTimeout(() => this.emit('open', this.id), 0);
  }
  destroy() {}
}
vi.mock('peerjs', () => ({ Peer: FakePeer }));
vi.mock('@/net/iceServers', () => ({ peerOptions: async () => ({}) }));
// The hub skips opening without WebRTC.
(globalThis as { RTCPeerConnection?: unknown }).RTCPeerConnection ??= class {};

const { watchHub, MAX_SPECTATORS } = await import('@/net/spectate');
const { PROTOCOL_VERSION, CONTENT_HASH } = await import('@/net/session');

const info = { players: [{ name: 'A', avatar: 'a' }, { name: 'B', avatar: 'b' }] as [{ name: string; avatar: string }, { name: string; avatar: string }], mode: 'PRACTICE' };

function join(hello: unknown = { t: 'w-hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH }) {
  const conn = new FakeConn();
  peers[peers.length - 1].emit('connection', conn);
  conn.open = true;
  conn.emit('open');
  conn.emit('data', hello);
  return conn;
}

afterEach(() => watchHub.close());

describe('spectator count', () => {
  it('counts spectators joining and leaving, and reports each change', async () => {
    await watchHub.open('TESTROOM1', info);
    const counts: number[] = [];
    const off = watchHub.onSpectators((n) => counts.push(n));
    const a = join();
    const b = join();
    expect(watchHub.spectators).toBe(2);
    a.emit('close');
    expect(watchHub.spectators).toBe(1);
    // A second close or error of the same link changes nothing.
    a.emit('error');
    b.emit('error');
    expect(watchHub.spectators).toBe(0);
    expect(counts).toEqual([1, 2, 1, 0]);
    off();
    join();
    expect(counts).toEqual([1, 2, 1, 0]);
  });

  it('does not count rejected spectators', async () => {
    await watchHub.open('TESTROOM2', info);
    const counts: number[] = [];
    watchHub.onSpectators((n) => counts.push(n));
    join({ t: 'w-hello', protocol: -1, content: CONTENT_HASH });
    for (let i = 0; i < MAX_SPECTATORS + 2; i++) join();
    expect(watchHub.spectators).toBe(MAX_SPECTATORS);
    expect(counts).toEqual(Array.from({ length: MAX_SPECTATORS }, (_, i) => i + 1));
  });

  it('drops to zero when the watch room closes', async () => {
    await watchHub.open('TESTROOM3', info);
    join();
    const counts: number[] = [];
    watchHub.onSpectators((n) => counts.push(n));
    watchHub.close();
    expect(watchHub.spectators).toBe(0);
    expect(counts).toEqual([0]);
  });

  it('drops spectators that stop answering', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'Date'] });
    try {
      await watchHub.open('TESTROOM4', info);
      join();
      expect(watchHub.spectators).toBe(1);
      vi.advanceTimersByTime(20000);
      expect(watchHub.spectators).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
