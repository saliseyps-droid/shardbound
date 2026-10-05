import type { Presence } from './friends';

/**
 * Everything social talks to through this interface: Firestore in production
 * (src/cloud/social.ts), an in-memory fake in tests and the dev preview (src/social/fakeBackend.ts).
 * Timestamps are milliseconds; the Firestore side writes server timestamps and converts them.
 */

export type Board = 'aiRanked' | 'ranked';

/** What a player uploads for one board (uid and time are added by the backend). */
export interface LeaderboardUpload {
  name: string;
  /** Faction of the player's selected deck (the portrait shown next to the name). */
  avatar: string;
  /** Alternative portrait id, '' for the faction default. */
  portrait: string;
  /** Wins this season on this board. */
  wins: number;
  /** Ranked vs AI: ladder index 0–15, Crown points (only at Crown), and rank * 100000 + crownPoints for sorting. */
  rank?: number;
  crownPoints?: number;
  score?: number;
  /** PvP ranked rating. */
  rating?: number;
}

export interface LeaderboardEntry extends LeaderboardUpload {
  uid: string;
  updatedAt: number;
}

export interface PublicProfile {
  name: string;
  avatar: string;
  portrait: string;
  friendCode: string;
  /** Shown to friends; missing on profiles written by older versions (src/social/profile.ts). */
  level?: number;
  /** Equipped title (an English key, translated when shown); null or '' for none. */
  title?: string | null;
  /** Distinct collectible cards owned, out of cardsTotal. */
  cardsOwned?: number;
  cardsTotal?: number;
}

export interface FriendRequest {
  from: string;
  to: string;
  fromName: string;
  fromAvatar: string;
  createdAt: number;
}

export type InviteStatus = 'pending' | 'accepted';

export interface MatchInvite {
  id: string;
  from: string;
  fromName: string;
  /** Room code of the hosted match (src/net/session.ts). */
  code: string;
  createdAt: number;
  status: InviteStatus;
}

export type Unsubscribe = () => void;

export interface SocialBackend {
  // Leaderboards (public read).
  putEntry(season: string, board: Board, uid: string, entry: LeaderboardUpload): Promise<void>;
  topEntries(season: string, board: Board, limit: number): Promise<LeaderboardEntry[]>;
  /** Entries strictly ahead of this sort value (score or rating); null when counting is not possible. */
  countAhead(season: string, board: Board, value: number): Promise<number | null>;
  getEntry(season: string, board: Board, uid: string): Promise<LeaderboardEntry | null>;

  // Public profile and friend code.
  getProfile(uid: string): Promise<PublicProfile | null>;
  putProfile(uid: string, profile: PublicProfile): Promise<void>;
  /** Maps the code to the uid; false when another player already has it. */
  claimFriendCode(uid: string, code: string): Promise<boolean>;
  lookupFriendCode(code: string): Promise<string | null>;

  // Friend requests and the friends list.
  sendFriendRequest(req: Omit<FriendRequest, 'createdAt'>): Promise<void>;
  getFriendRequest(from: string, to: string): Promise<FriendRequest | null>;
  deleteFriendRequest(from: string, to: string): Promise<void>;
  /** Adds both players to each other's list and removes the request (one atomic write). */
  acceptFriendRequest(from: string, to: string): Promise<void>;
  watchIncomingRequests(uid: string, cb: (reqs: FriendRequest[]) => void): Unsubscribe;
  watchOutgoingRequests(uid: string, cb: (reqs: FriendRequest[]) => void): Unsubscribe;
  watchFriends(uid: string, cb: (uids: string[]) => void): Unsubscribe;
  isFriend(uid: string, other: string): Promise<boolean>;
  removeFriend(uid: string, other: string): Promise<void>;

  // Presence.
  setPresence(uid: string, inMatch: boolean): Promise<void>;
  watchPresence(uid: string, cb: (p: Presence | null) => void): Unsubscribe;

  // Match invites (invites/{to}/items/{id}).
  sendInvite(to: string, invite: Omit<MatchInvite, 'id' | 'createdAt' | 'status'>): Promise<string>;
  setInviteStatus(to: string, id: string, status: 'accepted'): Promise<void>;
  deleteInvite(to: string, id: string): Promise<void>;
  watchInvites(uid: string, cb: (invites: MatchInvite[]) => void): Unsubscribe;
  /** One invite, as the host sees it; null once it is gone (declined or cleaned up). */
  watchInvite(to: string, id: string, cb: (invite: MatchInvite | null) => void): Unsubscribe;
}
