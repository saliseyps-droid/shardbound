/**
 * ICE servers for the P2P link. Direct connections fail between some networks (strict NATs,
 * mobile data, company networks), so a TURN relay from Metered (app shardbound.metered.live)
 * carries the game messages there. The key below only fetches TURN credentials for this one
 * credential; it is not the account's secret key.
 */
const TURN_API_KEY = 'e882140813e81b2713c67c2822675c74615a';
const TURN_URL = `https://shardbound.metered.live/api/v1/turn/credentials?apiKey=${TURN_API_KEY}`;

/** Used on their own when the relay list can't be fetched, and in front of it otherwise. */
export const FALLBACK_ICE: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.relay.metered.ca:80' }];

const CACHE_MS = 60 * 60 * 1000;
let cached: { at: number; servers: RTCIceServer[] } | null = null;

function isIceServer(v: unknown): v is RTCIceServer {
  const urls = (v as RTCIceServer | null)?.urls;
  return typeof urls === 'string' || (Array.isArray(urls) && urls.every((u) => typeof u === 'string'));
}

/** STUN plus the TURN relay; falls back to STUN only (direct links still work) if the fetch fails. */
export async function iceServers(fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<RTCIceServer[]> {
  if (cached && now - cached.at < CACHE_MS) return cached.servers;
  try {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl?.abort(), 5000);
    const res = await fetchImpl(TURN_URL, { signal: ctrl?.signal }).finally(() => clearTimeout(timer));
    if (!res.ok) throw new Error(`TURN credentials: HTTP ${res.status}`);
    const list = (await res.json()) as unknown;
    const relays = Array.isArray(list) ? list.filter(isIceServer) : [];
    if (relays.length === 0) throw new Error('TURN credentials: empty list');
    cached = { at: now, servers: [...FALLBACK_ICE, ...relays] };
    return cached.servers;
  } catch (e) {
    console.warn('[net] TURN relay unavailable, direct connections only', e);
    return FALLBACK_ICE;
  }
}

/** Options for `new Peer(...)`. */
export async function peerOptions() {
  // Diagnostics: localStorage 'shardbound.forceRelay' = '1' sends everything through the TURN relay.
  let forceRelay = false;
  try {
    forceRelay = localStorage.getItem('shardbound.forceRelay') === '1';
  } catch {
    /* storage unavailable */
  }
  return { config: { iceServers: await iceServers(), ...(forceRelay ? { iceTransportPolicy: 'relay' as const } : {}) } };
}

/** Tests only. */
export function resetIceCache() {
  cached = null;
}
