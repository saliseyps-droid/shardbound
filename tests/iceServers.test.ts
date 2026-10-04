import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_ICE, iceServers, resetIceCache } from '@/net/iceServers';

afterEach(() => {
  resetIceCache();
  vi.restoreAllMocks();
});

const relayList = [{ urls: 'turn:global.relay.metered.ca:80', username: 'u', credential: 'c' }];
const ok = (body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;

describe('ICE servers', () => {
  it('adds the TURN relay to the STUN servers and caches it', async () => {
    const f = ok(relayList);
    expect(await iceServers(f, 0)).toEqual([...FALLBACK_ICE, ...relayList]);
    await iceServers(f, 1000);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('falls back to STUN only when the relay list cannot be fetched', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failing = vi.fn(async () => new Response('{"error":"Invalid API Key"}', { status: 401 })) as unknown as typeof fetch;
    expect(await iceServers(failing, 0)).toEqual(FALLBACK_ICE);
    expect(await iceServers(ok([{ nope: 1 }]), 0)).toEqual(FALLBACK_ICE);
  });
});
