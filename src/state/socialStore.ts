import { create } from 'zustand';
import { cloudConfigured } from '@/config/firebase';
import { loadCloud } from '@/cloud/firebase';
import { seasonKeyOf } from '@/domain/season';
import { effectivePortrait } from '@/domain/portraits';
import type { GameSave } from '@/domain/save';
import type { FriendRequest, MatchInvite, PublicProfile, SocialBackend, Unsubscribe } from '@/social/backend';
import { PRESENCE_INTERVAL_MS, type Presence } from '@/social/friends';
import { buildLeaderboardEntries } from '@/social/leaderboard';
import { profileStats } from '@/social/profile';
import { SocialService, type ProfileInfo } from '@/social/service';
import { gameService } from './accountStore';

/**
 * Social state of the signed-in player: public profile + friend code, friends with presence,
 * friend requests and incoming match invites. Started by the SocialLayer (mounted only while
 * signed in), so nothing here runs for players without a cloud account.
 */

export interface FriendView {
  uid: string;
  name: string;
  avatar: string;
  portrait: string;
  presence: Presence | null;
  /** From the friend's public profile; missing for profiles written by older versions. */
  level?: number;
  title?: string | null;
  cardsOwned?: number;
  cardsTotal?: number;
}

interface SocialStore {
  /** 'mock' is the dev-only preview with fake data (never in production builds). */
  mode: 'off' | 'real' | 'mock';
  uid: string | null;
  me: PublicProfile | null;
  friends: FriendView[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  invites: MatchInvite[];
  /** Names of players we sent requests to (looked up once). */
  names: Record<string, string>;
  error: string | null;
  service: SocialService | null;
  start: (uid: string, backend: SocialBackend, mode: 'real' | 'mock') => void;
  stop: () => void;
  /** `watch`: the watch room of the match being played, so friends can spectate it. */
  setInMatch: (inMatch: boolean, watch?: string | null) => void;
  /** Re-reads every friend's public profile (level, title, cards change over time). */
  refreshFriendProfiles: () => void;
}

let unsubs: Unsubscribe[] = [];
let friendUnsubs = new Map<string, Unsubscribe>();
let heartbeat: ReturnType<typeof setInterval> | null = null;
let inMatchNow = false;
let watchNow: string | null = null;
let mockBackend: SocialBackend | null = null;

export function profileInfo(save: GameSave): ProfileInfo {
  const p = save.profile;
  const deck = save.decks.find((d) => d.id === p.selectedDeckId) ?? save.decks[0];
  return { name: p.username, avatar: deck?.heroFaction ?? '', portrait: (deck && effectivePortrait(deck, p)) || '', ...profileStats(save) };
}

/** The parts of a friend's profile shown in the list. */
function friendFields(p: PublicProfile): Partial<FriendView> {
  return { name: p.name, avatar: p.avatar, portrait: p.portrait, level: p.level, title: p.title, cardsOwned: p.cardsOwned, cardsTotal: p.cardsTotal };
}

export const useSocial = create<SocialStore>((set, get) => ({
  mode: 'off',
  uid: null,
  me: null,
  friends: [],
  incoming: [],
  outgoing: [],
  invites: [],
  names: {},
  error: null,
  service: null,

  start: (uid, backend, mode) => {
    if (get().uid === uid && get().service) return;
    get().stop();
    if (mode === 'mock') mockBackend = backend;
    const service = new SocialService(backend, uid);
    set({ mode, uid, service, error: null });

    const save = gameService.current;
    if (save) {
      service
        .ensureProfile(profileInfo(save))
        .then((me) => get().uid === uid && set({ me }))
        .catch((e) => {
          console.warn('[social] profile failed', e);
          if (get().uid === uid) set({ error: 'Could not reach the friends service. Try again later.' });
        });
    }

    // Leaderboard entries and the public profile (level, title, cards): after every change of the
    // save, debounced and only when they changed, and right now (sign-in).
    const upload = (s: GameSave | null) => {
      if (!s) return;
      const now = Date.now();
      service.queueLeaderboard(seasonKeyOf(now), buildLeaderboardEntries(s, now));
      service.queueProfile(profileInfo(s), (me) => get().uid === uid && set({ me }));
    };
    upload(save);
    unsubs.push(gameService.subscribe(upload));

    unsubs.push(backend.watchIncomingRequests(uid, (incoming) => set({ incoming })));
    unsubs.push(
      backend.watchOutgoingRequests(uid, (outgoing) => {
        set({ outgoing });
        for (const r of outgoing) {
          if (get().names[r.to]) continue;
          void backend.getProfile(r.to).then((p) => p && set({ names: { ...get().names, [r.to]: p.name } }));
        }
      }),
    );
    unsubs.push(backend.watchInvites(uid, (invites) => set({ invites })));
    unsubs.push(
      backend.watchFriends(uid, (ids) => {
        // Presence watchers follow the list.
        for (const [fid, off] of friendUnsubs) if (!ids.includes(fid)) (off(), friendUnsubs.delete(fid));
        const known = new Map(get().friends.map((f) => [f.uid, f]));
        set({ friends: ids.map((fid) => known.get(fid) ?? { uid: fid, name: '…', avatar: '', portrait: '', presence: null }) });
        for (const fid of ids) {
          if (friendUnsubs.has(fid)) continue;
          friendUnsubs.set(
            fid,
            backend.watchPresence(fid, (presence) => set({ friends: get().friends.map((f) => (f.uid === fid ? { ...f, presence } : f)) })),
          );
          void backend.getProfile(fid).then((p) => p && set({ friends: get().friends.map((f) => (f.uid === fid ? { ...f, ...friendFields(p) } : f)) }));
        }
      }),
    );

    const beat = () => {
      void service.heartbeat(inMatchNow, watchNow).catch((e) => console.warn('[social] presence failed', e));
      get().refreshFriendProfiles();
    };
    beat();
    heartbeat = setInterval(beat, PRESENCE_INTERVAL_MS);
  },

  refreshFriendProfiles: () => {
    const backend = get().service?.backend;
    if (!backend) return;
    for (const f of get().friends) {
      void backend
        .getProfile(f.uid)
        .then((p) => p && set({ friends: get().friends.map((x) => (x.uid === f.uid ? { ...x, ...friendFields(p) } : x)) }))
        .catch(() => undefined);
    }
  },

  stop: () => {
    const service = get().service;
    if (service) void Promise.all([service.flushLeaderboard(), service.flushProfile()]).finally(() => service.dispose());
    unsubs.forEach((u) => u());
    unsubs = [];
    friendUnsubs.forEach((u) => u());
    friendUnsubs = new Map();
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    set({ mode: 'off', uid: null, me: null, friends: [], incoming: [], outgoing: [], invites: [], names: {}, service: null });
  },

  setInMatch: (inMatch, watch = null) => {
    const w = inMatch ? watch : null;
    if (inMatch === inMatchNow && w === watchNow) return;
    inMatchNow = inMatch;
    watchNow = w;
    void get().service?.heartbeat(inMatch, w).catch(() => undefined);
  },
}));

/** Backend for reading leaderboards, also when signed out (public read). Null when cloud is off. */
export async function socialBackend(): Promise<SocialBackend | null> {
  if (useSocial.getState().mode === 'mock' && mockBackend) return mockBackend;
  if (!cloudConfigured()) return null;
  return (await loadCloud()).social;
}
