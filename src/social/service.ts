import { err, ok, type Result } from '@/core/utils';
import type { Board, LeaderboardUpload, PublicProfile, SocialBackend } from './backend';
import { generateFriendCode, isValidFriendCode, normalizeFriendCode } from './friends';
import { entryKey, isValidEntry } from './leaderboard';

interface ServiceOptions {
  /** Friend code generator (tests). */
  makeCode?: () => string;
  /** Wait this long after a change before uploading leaderboard entries. */
  debounceMs?: number;
}

/**
 * The signed-in player's social actions, on top of a SocialBackend. Holds no UI state; the
 * store (src/state/socialStore.ts) subscribes to the backend's watchers for that.
 */
export class SocialService {
  private uploaded = new Map<string, string>();
  private pending = new Map<string, { season: string; board: Board; entry: LeaderboardUpload }>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    readonly backend: SocialBackend,
    readonly uid: string,
    private readonly opts: ServiceOptions = {},
  ) {}

  /** Creates or refreshes the public profile; the friend code is made once and then kept. */
  async ensureProfile(info: Omit<PublicProfile, 'friendCode'>): Promise<PublicProfile> {
    const existing = await this.backend.getProfile(this.uid);
    let friendCode = existing?.friendCode && isValidFriendCode(existing.friendCode) ? existing.friendCode : '';
    for (let attempt = 0; !friendCode && attempt < 8; attempt++) {
      const code = (this.opts.makeCode ?? generateFriendCode)();
      try {
        if (await this.backend.claimFriendCode(this.uid, code)) friendCode = code;
      } catch {
        // Taken in a race (the rules refuse overwriting a code): try another one.
      }
    }
    if (!friendCode) throw new Error('Could not create a friend code. Try again later.');
    const profile: PublicProfile = { ...info, name: info.name.trim().slice(0, 20) || '?', friendCode };
    if (!existing || existing.name !== profile.name || existing.avatar !== profile.avatar || existing.portrait !== profile.portrait || existing.friendCode !== friendCode) {
      await this.backend.putProfile(this.uid, profile);
    }
    return profile;
  }

  /** Sends a friend request (or accepts theirs, if they already asked). */
  async addFriendByCode(input: string): Promise<Result<'sent' | 'accepted'>> {
    const code = normalizeFriendCode(input);
    if (!isValidFriendCode(code)) return err('That friend code is not valid.');
    const other = await this.backend.lookupFriendCode(code);
    if (!other) return err('No player has this friend code.');
    if (other === this.uid) return err('That is your own friend code.');
    if (await this.backend.isFriend(this.uid, other)) return err('You are already friends.');
    if (await this.backend.getFriendRequest(other, this.uid)) {
      await this.backend.acceptFriendRequest(other, this.uid);
      return ok('accepted');
    }
    if (await this.backend.getFriendRequest(this.uid, other)) return err('You already sent this player a request.');
    const me = await this.backend.getProfile(this.uid);
    await this.backend.sendFriendRequest({ from: this.uid, to: other, fromName: me?.name ?? '?', fromAvatar: me?.avatar ?? '' });
    return ok('sent');
  }

  acceptRequest(from: string) {
    return this.backend.acceptFriendRequest(from, this.uid);
  }

  declineRequest(from: string) {
    return this.backend.deleteFriendRequest(from, this.uid);
  }

  cancelRequest(to: string) {
    return this.backend.deleteFriendRequest(this.uid, to);
  }

  removeFriend(other: string) {
    return this.backend.removeFriend(this.uid, other);
  }

  /** Invites a friend to the room just hosted under `code`. Returns the invite id. */
  invite(friendUid: string, fromName: string, code: string) {
    return this.backend.sendInvite(friendUid, { from: this.uid, fromName: fromName.trim().slice(0, 20) || '?', code });
  }

  acceptInvite(id: string) {
    return this.backend.setInviteStatus(this.uid, id, 'accepted');
  }

  /** Declining deletes the invite; the host sees it disappear. */
  declineInvite(id: string) {
    return this.backend.deleteInvite(this.uid, id);
  }

  heartbeat(inMatch: boolean) {
    return this.backend.setPresence(this.uid, inMatch);
  }

  /** Queues this season's entries; only changed, valid ones are uploaded, after a short pause. */
  queueLeaderboard(season: string, entries: Partial<Record<Board, LeaderboardUpload>>) {
    for (const board of Object.keys(entries) as Board[]) {
      const entry = entries[board]!;
      const k = `${season}/${board}`;
      if (this.uploaded.get(k) === entryKey(entry) || !isValidEntry(board, entry)) {
        this.pending.delete(k);
        continue;
      }
      this.pending.set(k, { season, board, entry });
    }
    if (this.pending.size === 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flushLeaderboard();
    }, this.opts.debounceMs ?? 4000);
  }

  async flushLeaderboard() {
    const jobs = [...this.pending.entries()];
    this.pending.clear();
    for (const [k, { season, board, entry }] of jobs) {
      try {
        await this.backend.putEntry(season, board, this.uid, entry);
        this.uploaded.set(k, entryKey(entry));
      } catch (e) {
        console.warn('[social] leaderboard upload failed', e);
      }
    }
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending.clear();
  }
}
