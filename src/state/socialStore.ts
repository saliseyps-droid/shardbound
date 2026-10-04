import { create } from 'zustand';
import { cloudConfigured } from '@/config/firebase';
import { loadCloud } from '@/cloud/firebase';
import { seasonKeyOf } from '@/domain/season';
import { effectivePortrait } from '@/domain/portraits';
import type { GameSave } from '@/domain/save';
import type { FriendRequest, MatchInvite, PublicProfile, SocialBackend, Unsubscribe } from '@/social/backend';
import { PRESENCE_INTERVAL_MS, type Presence } from '@/social/friends';
import { buildLeaderboardEntries } from '@/social/leaderboard';
import { SocialService } from '@/social/service';
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
  setInMatch: (inMatch: boolean) => void;
}

let unsubs: Unsubscribe[] = [];
let friendUnsubs = new Map<string, Unsubscribe>();
let heartbeat: ReturnType<typeof setInterval> | null = null;
let inMatchNow = false;
let mockBackend: SocialBackend | null = null;

function profileInfo(save: GameSave): Omit<PublicProfile, 'friendCode'> {
  const p = save.profile;
  const deck = save.decks.find((d) => d.id === p.selectedDeckId) ?? save.decks[0];
  return { name: p.username, avatar: deck?.heroFaction ?? '', portrait: (deck && effectivePortrait(deck, p)) || '' };
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

    // Leaderboard entries: after every change of the save (matches), and right now (sign-in).
    let profileKey = save ? JSON.stringify(profileInfo(save)) : '';
    const upload = (s: GameSave | null) => {
      if (!s) return;
      const now = Date.now();
      service.queueLeaderboard(seasonKeyOf(now), buildLeaderboardEntries(s, now));
      const key = JSON.stringify(profileInfo(s));
      if (key !== profileKey && get().me) {
        profileKey = key;
        void service.ensureProfile(profileInfo(s)).then((me) => get().uid === uid && set({ me })).catch(() => undefined);
      }
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
          void backend.getProfile(fid).then((p) => p && set({ friends: get().friends.map((f) => (f.uid === fid ? { ...f, name: p.name, avatar: p.avatar, portrait: p.portrait } : f)) }));
        }
      }),
    );

    const beat = () => void service.heartbeat(inMatchNow).catch((e) => console.warn('[social] presence failed', e));
    beat();
    heartbeat = setInterval(beat, PRESENCE_INTERVAL_MS);
  },

  stop: () => {
    const service = get().service;
    if (service) void service.flushLeaderboard().finally(() => service.dispose());
    unsubs.forEach((u) => u());
    unsubs = [];
    friendUnsubs.forEach((u) => u());
    friendUnsubs = new Map();
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    set({ mode: 'off', uid: null, me: null, friends: [], incoming: [], outgoing: [], invites: [], names: {}, service: null });
  },

  setInMatch: (inMatch) => {
    if (inMatch === inMatchNow) return;
    inMatchNow = inMatch;
    void get().service?.heartbeat(inMatch).catch(() => undefined);
  },
}));

/** Backend for reading leaderboards, also when signed out (public read). Null when cloud is off. */
export async function socialBackend(): Promise<SocialBackend | null> {
  if (useSocial.getState().mode === 'mock' && mockBackend) return mockBackend;
  if (!cloudConfigured()) return null;
  return (await loadCloud()).social;
}
