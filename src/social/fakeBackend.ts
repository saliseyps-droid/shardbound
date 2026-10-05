import type { Presence } from './friends';
import type { Board, FriendRequest, InviteInput, LeaderboardEntry, LeaderboardUpload, MatchInvite, PublicProfile, SocialBackend, Unsubscribe } from './backend';
import { inviteKind, isValidInvite } from './friends';
import { isValidEntry, sortEntries, sortValue } from './leaderboard';
import { isValidProfile } from './profile';

/**
 * In-memory SocialBackend for tests and the dev-only preview (never used by production code paths).
 * It enforces the same permission checks as firestore.rules where they matter for the game logic.
 */
export class FakeSocialBackend implements SocialBackend {
  /** Leaderboard writes, for tests. */
  puts = 0;
  /** Profile writes, for tests. */
  profilePuts = 0;
  /** Simulated server clock. */
  now: () => number = () => Date.now();
  private boards = new Map<string, Map<string, LeaderboardEntry>>();
  private profiles = new Map<string, PublicProfile>();
  private codes = new Map<string, string>();
  private requests = new Map<string, FriendRequest>();
  private friends = new Map<string, Set<string>>();
  private presence = new Map<string, Presence>();
  private invites = new Map<string, Map<string, MatchInvite>>();
  private listeners = new Set<() => void>();
  private seq = 0;

  private emit() {
    for (const l of [...this.listeners]) l();
  }

  private listen(fn: () => void): Unsubscribe {
    this.listeners.add(fn);
    fn();
    return () => this.listeners.delete(fn);
  }

  private board(season: string, board: Board) {
    const k = `${season}/${board}`;
    if (!this.boards.has(k)) this.boards.set(k, new Map());
    return this.boards.get(k)!;
  }

  // --- leaderboards ---
  async putEntry(season: string, board: Board, uid: string, entry: LeaderboardUpload) {
    if (!isValidEntry(board, entry)) throw new Error('permission-denied');
    this.puts++;
    this.board(season, board).set(uid, { ...entry, uid, updatedAt: this.now() });
  }
  async topEntries(season: string, board: Board, limit: number) {
    return sortEntries(board, [...this.board(season, board).values()]).slice(0, limit);
  }
  async countAhead(season: string, board: Board, value: number) {
    return [...this.board(season, board).values()].filter((e) => sortValue(board, e) > value).length;
  }
  async getEntry(season: string, board: Board, uid: string) {
    return this.board(season, board).get(uid) ?? null;
  }

  // --- profiles ---
  async getProfile(uid: string) {
    return this.profiles.get(uid) ?? null;
  }
  async putProfile(uid: string, profile: PublicProfile) {
    if (this.codes.get(profile.friendCode) !== uid || !isValidProfile(profile)) throw new Error('permission-denied');
    this.profilePuts++;
    this.profiles.set(uid, { ...profile });
  }
  async claimFriendCode(uid: string, code: string) {
    const owner = this.codes.get(code);
    if (owner && owner !== uid) return false;
    this.codes.set(code, uid);
    return true;
  }
  async lookupFriendCode(code: string) {
    return this.codes.get(code) ?? null;
  }

  // --- requests & friends ---
  private reqId = (from: string, to: string) => `${from}_${to}`;
  async sendFriendRequest(req: Omit<FriendRequest, 'createdAt'>) {
    const id = this.reqId(req.from, req.to);
    if (req.from === req.to || this.requests.has(id) || this.friendSet(req.to).has(req.from)) throw new Error('permission-denied');
    this.requests.set(id, { ...req, createdAt: this.now() });
    this.emit();
  }
  async getFriendRequest(from: string, to: string) {
    return this.requests.get(this.reqId(from, to)) ?? null;
  }
  async deleteFriendRequest(from: string, to: string) {
    this.requests.delete(this.reqId(from, to));
    this.emit();
  }
  async acceptFriendRequest(from: string, to: string) {
    if (!this.requests.has(this.reqId(from, to))) throw new Error('permission-denied');
    this.friendSet(from).add(to);
    this.friendSet(to).add(from);
    this.requests.delete(this.reqId(from, to));
    this.emit();
  }
  watchIncomingRequests(uid: string, cb: (reqs: FriendRequest[]) => void) {
    return this.listen(() => cb([...this.requests.values()].filter((r) => r.to === uid)));
  }
  watchOutgoingRequests(uid: string, cb: (reqs: FriendRequest[]) => void) {
    return this.listen(() => cb([...this.requests.values()].filter((r) => r.from === uid)));
  }
  private friendSet(uid: string) {
    if (!this.friends.has(uid)) this.friends.set(uid, new Set());
    return this.friends.get(uid)!;
  }
  watchFriends(uid: string, cb: (uids: string[]) => void) {
    return this.listen(() => cb([...this.friendSet(uid)]));
  }
  async isFriend(uid: string, other: string) {
    return this.friendSet(uid).has(other);
  }
  async removeFriend(uid: string, other: string) {
    this.friendSet(uid).delete(other);
    this.friendSet(other).delete(uid);
    this.emit();
  }

  // --- presence ---
  async setPresence(uid: string, inMatch: boolean) {
    this.presence.set(uid, { lastSeen: this.now(), inMatch });
    this.emit();
  }
  watchPresence(uid: string, cb: (p: Presence | null) => void) {
    return this.listen(() => cb(this.presence.get(uid) ?? null));
  }

  // --- invites ---
  private inbox(uid: string) {
    if (!this.invites.has(uid)) this.invites.set(uid, new Map());
    return this.invites.get(uid)!;
  }
  async sendInvite(to: string, invite: InviteInput) {
    // Rules: only someone on the recipient's friends list may invite, with valid fields only.
    const fields = Object.fromEntries(Object.entries(invite).filter(([, v]) => v !== undefined));
    if (!this.friendSet(to).has(invite.from) || !isValidInvite(fields)) throw new Error('permission-denied');
    const id = `inv${++this.seq}`;
    this.inbox(to).set(id, this.read({ ...fields, id, createdAt: this.now(), status: 'pending' }));
    this.emit();
    return id;
  }
  async setInviteStatus(to: string, id: string, status: 'accepted') {
    const inv = this.inbox(to).get(id);
    if (inv) this.inbox(to).set(id, { ...inv, status });
    this.emit();
  }
  async deleteInvite(to: string, id: string) {
    this.inbox(to).delete(id);
    this.emit();
  }
  watchInvites(uid: string, cb: (invites: MatchInvite[]) => void) {
    return this.listen(() => cb([...this.inbox(uid).values()]));
  }
  watchInvite(to: string, id: string, cb: (invite: MatchInvite | null) => void) {
    return this.listen(() => cb(this.inbox(to).get(id) ?? null));
  }

  /** Like the Firestore side: a missing kind reads as 'match'. */
  private read(d: Record<string, unknown>): MatchInvite {
    const inv = { ...d, kind: inviteKind(d) } as MatchInvite;
    if (typeof d.size !== 'number') delete inv.size;
    return inv;
  }

  // --- test helpers ---
  requestsTo(uid: string) {
    return [...this.requests.values()].filter((r) => r.to === uid);
  }
  friendsOf(uid: string) {
    return [...this.friendSet(uid)];
  }
  /** Dev preview / tests: put data in without permission checks. */
  seedEntry(season: string, board: Board, entry: LeaderboardEntry) {
    this.board(season, board).set(entry.uid, entry);
  }
  seedProfile(uid: string, profile: PublicProfile, presence?: Presence) {
    this.codes.set(profile.friendCode, uid);
    this.profiles.set(uid, profile);
    if (presence) this.presence.set(uid, presence);
  }
  seedFriendship(a: string, b: string) {
    this.friendSet(a).add(b);
    this.friendSet(b).add(a);
  }
  /** An invite as stored, possibly by an older version (no kind). */
  seedInvite(to: string, invite: Omit<MatchInvite, 'kind'> & { kind?: MatchInvite['kind'] }) {
    this.inbox(to).set(invite.id, this.read({ ...invite }));
    this.emit();
  }
  seedRequest(req: FriendRequest) {
    this.requests.set(this.reqId(req.from, req.to), req);
  }
}
