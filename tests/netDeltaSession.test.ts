// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gzipSync } from 'node:zlib';

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
  constructor(public peer: string, public metadata?: unknown) {
    super();
  }
  send(m: unknown) {
    this.sent.push(m);
  }
  close() {}
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
vi.mock('@/net/iceServers', () => ({ peerOptions: async () => ({}) }));

const { netSession, PROTOCOL_VERSION, CONTENT_HASH } = await import('@/net/session');
const { gzip, gunzip, gzipSupported, pack, unpack } = await import('@/net/compress');
const { playerSide } = await import('@/domain/matchSetup');
const { createNewSave } = await import('@/domain/newAccount');
import type { NetMessage } from '@/net/session';

const save = createNewSave('G', 'b', 0, 'g');
const side = playerSide({ ...save.profile, username: 'Guest' }, save.decks[0]);
const big = (i: number): NetMessage => ({ t: 'error', message: `big ${i} ` + 'x'.repeat(5000) });
const flush = () => new Promise((r) => setTimeout(r, 50));

async function connect(guestGzip: boolean) {
  await netSession.host('Host', 'a', () => null, { code: `RM${peers.length}` });
  const guest = new FakeConn('guest-peer');
  peers[peers.length - 1].emit('connection', guest);
  guest.doOpen();
  guest.emit('data', { t: 'hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH, side, deckName: 'D', gzip: guestGzip });
  expect(netSession.status).toBe('connected');
  const welcome = guest.sent.shift() as { t: string; gzip?: boolean };
  expect(welcome.t).toBe('welcome');
  return { guest, welcome };
}

beforeEach(() => {
  peers.length = 0;
});
afterEach(() => {
  vi.unstubAllGlobals();
  netSession.close();
});

describe('message compression', () => {
  it('round-trips through gzip (Node/browser CompressionStream)', async () => {
    expect(PROTOCOL_VERSION).toBe(5);
    if (!gzipSupported()) return;
    const text = JSON.stringify({ t: 'state', s: 'é ✓ '.repeat(3000) });
    const z = await gzip(text);
    expect(z.length).toBeLessThan(text.length / 10);
    expect(await gunzip(z)).toBe(text);
    expect(await gunzip(new Uint8Array(gzipSync(text)).buffer)).toBe(text); // ArrayBuffer as unpacked by PeerJS
    const packed = await pack(big(1), true);
    expect((packed as { t: string }).t).toBe('z');
    expect(await unpack(packed)).toEqual(big(1));
  });

  it('keeps small messages plain and falls back to plain without CompressionStream', async () => {
    expect(await pack({ t: 'ping' }, true)).toEqual({ t: 'ping' });
    expect(await pack(big(1), false)).toEqual(big(1));
    vi.stubGlobal('CompressionStream', undefined);
    expect(gzipSupported()).toBe(false);
    expect(await pack(big(1), true)).toEqual(big(1));
  });

  it('sends large messages compressed, strictly in order with small ones, and the goodbye last', async () => {
    if (!gzipSupported()) return;
    const { guest, welcome } = await connect(true);
    expect(welcome.gzip).toBe(true);
    netSession.send(big(1));
    netSession.send({ t: 'error', message: 'small' });
    netSession.send(big(2));
    netSession.close();
    await flush();
    const got = await Promise.all(guest.sent.map((m) => unpack(m as NetMessage)));
    expect(got).toEqual([big(1), { t: 'error', message: 'small' }, big(2), { t: 'bye' }]);
    expect((guest.sent[0] as { t: string }).t).toBe('z');
    expect((guest.sent[1] as { t: string }).t).toBe('error');
  });

  it('delivers received messages in order while compressed ones are unpacked', async () => {
    if (!gzipSupported()) return;
    const { guest } = await connect(true);
    const seen: NetMessage[] = [];
    const off = netSession.onMessage((m) => seen.push(m));
    guest.emit('data', await pack(big(1), true));
    guest.emit('data', { t: 'error', message: 'small' });
    guest.emit('data', await pack(big(2), true));
    await flush();
    off();
    expect(seen).toEqual([big(1), { t: 'error', message: 'small' }, big(2)]);
    expect(((await pack(big(1), true)) as { t: string }).t).toBe('z');
  });

  it('sends plain messages to a guest that cannot gunzip', async () => {
    const { guest } = await connect(false);
    netSession.send(big(1));
    expect(guest.sent).toEqual([big(1)]);
  });
});
