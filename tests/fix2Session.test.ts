// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  closed = false;
  constructor(
    public peer: string,
    public metadata?: unknown,
  ) {
    super();
  }
  send(m: unknown) {
    this.sent.push(m);
  }
  close() {
    this.closed = true;
  }
  doOpen() {
    this.open = true;
    this.emit('open');
  }
}
const peers: FakePeer[] = [];
class FakePeer extends Emitter {
  destroyed = false;
  disconnected = false;
  constructor(public id = `rand-${peers.length}`) {
    super();
    peers.push(this);
    setTimeout(() => this.emit('open', this.id), 0);
  }
  connect(id: string, opts?: { metadata?: unknown }) {
    return new FakeConn(id, opts?.metadata);
  }
  destroy() {
    this.destroyed = true;
  }
}
vi.mock('peerjs', () => ({ Peer: FakePeer }));

const { netSession, PROTOCOL_VERSION, CONTENT_HASH, ID_PREFIX } = await import('@/net/session');
const { playerSide } = await import('@/domain/matchSetup');
const { createNewSave } = await import('@/domain/newAccount');

const save = createNewSave('G', 'b', 0, 'g');
const side = playerSide({ ...save.profile, username: 'Guest' }, save.decks[0]);

async function hostAndConnectGuest(code = 'ROOM01') {
  await netSession.host('Host', 'a', () => null, { code });
  const peer = peers[peers.length - 1];
  const guest = new FakeConn('guest-peer');
  peer.emit('connection', guest);
  guest.doOpen();
  guest.emit('data', { t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName: 'D' });
  expect(netSession.status).toBe('connected');
  return { peer, guest };
}

beforeEach(() => {
  peers.length = 0;
});
afterEach(() => {
  vi.useRealTimers();
  netSession.close();
});

describe('net session after a match started', () => {
  it('the host never takes a new player after its guest dropped', async () => {
    const { peer, guest } = await hostAndConnectGuest();
    guest.emit('close');
    expect(netSession.status).toBe('closed');
    const intruder = new FakeConn('intruder');
    peer.emit('connection', intruder);
    intruder.doOpen();
    intruder.emit('data', { t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName: 'D' });
    expect(intruder.sent).toContainEqual(expect.objectContaining({ t: 'reject' }));
    expect(intruder.sent).not.toContainEqual(expect.objectContaining({ t: 'welcome' }));
    expect(netSession.status).toBe('closed');
  });

  it('probe connections are closed without an answer', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const p = netSession.host('Host', 'a', () => null, { code: 'ROOM02' });
    await vi.advanceTimersByTimeAsync(1);
    await p;
    const probe = new FakeConn('prober', { probe: true });
    peers[0].emit('connection', probe);
    probe.doOpen();
    await vi.advanceTimersByTimeAsync(600);
    expect(probe.closed).toBe(true);
    expect(probe.sent).toEqual([]);
  });

  it('a late "peer-unavailable" (e.g. from a timed-out probe) does not turn a dropped match into an error', async () => {
    const { peer, guest } = await hostAndConnectGuest('ROOM03');
    guest.emit('close');
    peer.emit('error', Object.assign(new Error('Could not connect to peer'), { type: 'peer-unavailable' }));
    expect(netSession.status).toBe('closed');
  });

  it('after a disconnect draw the peer lingers so the other player\'s probes still find it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const p = netSession.host('Host', 'a', () => null, { code: 'ROOM04' });
    await vi.advanceTimersByTimeAsync(1);
    await p;
    const peer = peers[0];
    netSession.close({ lingerMs: 90_000 });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(peer.destroyed).toBe(false);
    // Still answers probes while lingering, but takes no players.
    const probe = new FakeConn('prober', { probe: true });
    peer.emit('connection', probe);
    probe.doOpen();
    const player = new FakeConn('player');
    peer.emit('connection', player);
    player.doOpen();
    expect(player.sent).toContainEqual(expect.objectContaining({ t: 'reject' }));
    await vi.advanceTimersByTimeAsync(31_000);
    expect(peer.destroyed).toBe(true);
  });

  it('hosting the same room again ends a lingering peer that holds its id', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let p = netSession.host('Host', 'a', () => null, { code: 'ROOM05' });
    await vi.advanceTimersByTimeAsync(1);
    await p;
    const first = peers[0];
    expect(first.id).toBe(ID_PREFIX + 'ROOM05');
    netSession.close({ lingerMs: 90_000 });
    p = netSession.host('Host', 'a', () => null, { code: 'ROOM05' });
    expect(first.destroyed).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await p;
  });

  it('a normal close still destroys the peer right away', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const p = netSession.host('Host', 'a', () => null, { code: 'ROOM06' });
    await vi.advanceTimersByTimeAsync(1);
    await p;
    netSession.close();
    await vi.advanceTimersByTimeAsync(400);
    expect(peers[0].destroyed).toBe(true);
  });
});
