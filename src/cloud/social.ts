import type { DocumentData, DocumentSnapshot, Firestore, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Board, FriendRequest, LeaderboardEntry, MatchInvite, SocialBackend } from '@/social/backend';

/**
 * Firestore layout for the social features (rules in firestore.rules):
 *   seasons/{YYYY-MM}/aiRanked/{uid}   { name, avatar, portrait, rank, crownPoints, score, wins, updatedAt }   public read
 *   seasons/{YYYY-MM}/ranked/{uid}     { name, avatar, portrait, rating, wins, updatedAt }                    public read
 *   profiles/{uid}                     { name, avatar, portrait, friendCode, level?, title?, cardsOwned?, cardsTotal?, updatedAt }
 *   friendCodes/{CODE}                 { uid }
 *   friendRequests/{from}_{to}         { from, to, fromName, fromAvatar, createdAt }
 *   users/{uid}/friends/{friendUid}    { since }
 *   presence/{uid}                     { lastSeen, inMatch }
 *   invites/{to}/items/{id}            { from, fromName, code, createdAt, status }
 * Times are server timestamps (the rules require request.time), read back as milliseconds.
 */
export async function createSocialBackend(db: Firestore): Promise<SocialBackend> {
  const fs = await import('firebase/firestore');
  const { collection, doc, getDoc, getDocs, onSnapshot, setDoc, deleteDoc, updateDoc, writeBatch, query, where, orderBy, limit, serverTimestamp, getCountFromServer } = fs;

  const millis = (v: unknown): number => {
    if (v && typeof (v as { toMillis?: unknown }).toMillis === 'function') return (v as { toMillis: () => number }).toMillis();
    return typeof v === 'number' ? v : Date.now();
  };
  const data = (snap: DocumentSnapshot | QueryDocumentSnapshot): DocumentData => snap.data({ serverTimestamps: 'estimate' }) ?? {};
  const sortField = (board: Board) => (board === 'ranked' ? 'rating' : 'score');
  const boardCol = (season: string, board: Board) => collection(db, 'seasons', season, board);

  const toEntry = (snap: DocumentSnapshot | QueryDocumentSnapshot): LeaderboardEntry => {
    const d = data(snap);
    return {
      uid: snap.id,
      name: String(d.name ?? '?'),
      avatar: String(d.avatar ?? ''),
      portrait: String(d.portrait ?? ''),
      wins: Number(d.wins) || 0,
      rank: typeof d.rank === 'number' ? d.rank : undefined,
      crownPoints: typeof d.crownPoints === 'number' ? d.crownPoints : undefined,
      score: typeof d.score === 'number' ? d.score : undefined,
      rating: typeof d.rating === 'number' ? d.rating : undefined,
      updatedAt: millis(d.updatedAt),
    };
  };
  const toRequest = (snap: QueryDocumentSnapshot): FriendRequest => {
    const d = data(snap);
    return { from: String(d.from), to: String(d.to), fromName: String(d.fromName ?? '?'), fromAvatar: String(d.fromAvatar ?? ''), createdAt: millis(d.createdAt) };
  };
  const toInvite = (snap: DocumentSnapshot | QueryDocumentSnapshot): MatchInvite => {
    const d = data(snap);
    return { id: snap.id, from: String(d.from), fromName: String(d.fromName ?? '?'), code: String(d.code ?? ''), createdAt: millis(d.createdAt), status: d.status === 'accepted' ? 'accepted' : 'pending' };
  };
  const warn = (what: string) => (e: unknown) => console.warn(`[social] ${what} failed`, e);
  const reqDoc = (from: string, to: string) => doc(db, 'friendRequests', `${from}_${to}`);

  return {
    async putEntry(season, board, uid, entry) {
      const body: Record<string, unknown> = { name: entry.name, avatar: entry.avatar, portrait: entry.portrait, wins: entry.wins, updatedAt: serverTimestamp() };
      if (board === 'ranked') body.rating = entry.rating;
      else Object.assign(body, { rank: entry.rank, crownPoints: entry.crownPoints, score: entry.score });
      await setDoc(doc(db, 'seasons', season, board, uid), body);
    },
    async topEntries(season, board, n) {
      const snap = await getDocs(query(boardCol(season, board), orderBy(sortField(board), 'desc'), limit(n)));
      return snap.docs.map(toEntry);
    },
    async countAhead(season, board, value) {
      try {
        const res = await getCountFromServer(query(boardCol(season, board), where(sortField(board), '>', value)));
        return res.data().count;
      } catch (e) {
        warn('count')(e);
        return null;
      }
    },
    async getEntry(season, board, uid) {
      const snap = await getDoc(doc(db, 'seasons', season, board, uid));
      return snap.exists() ? toEntry(snap) : null;
    },

    async getProfile(uid) {
      const snap = await getDoc(doc(db, 'profiles', uid));
      if (!snap.exists()) return null;
      const d = snap.data();
      const int = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : undefined);
      // level/title/cards are missing on profiles written before they existed.
      return {
        name: String(d.name ?? '?'),
        avatar: String(d.avatar ?? ''),
        portrait: String(d.portrait ?? ''),
        friendCode: String(d.friendCode ?? ''),
        level: int(d.level),
        title: typeof d.title === 'string' ? d.title : null,
        cardsOwned: int(d.cardsOwned),
        cardsTotal: int(d.cardsTotal),
      };
    },
    async putProfile(uid, p) {
      const body: Record<string, unknown> = { name: p.name, avatar: p.avatar, portrait: p.portrait, friendCode: p.friendCode, updatedAt: serverTimestamp() };
      if (p.level !== undefined) body.level = p.level;
      if (p.title !== undefined) body.title = p.title || null;
      if (p.cardsOwned !== undefined && p.cardsTotal !== undefined) Object.assign(body, { cardsOwned: p.cardsOwned, cardsTotal: p.cardsTotal });
      await setDoc(doc(db, 'profiles', uid), body);
    },
    async claimFriendCode(uid, code) {
      const ref = doc(db, 'friendCodes', code);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data().uid === uid;
      await setDoc(ref, { uid });
      return true;
    },
    async lookupFriendCode(code) {
      const snap = await getDoc(doc(db, 'friendCodes', code));
      return snap.exists() ? String(snap.data().uid) : null;
    },

    async sendFriendRequest(req) {
      await setDoc(reqDoc(req.from, req.to), { ...req, createdAt: serverTimestamp() });
    },
    async getFriendRequest(from, to) {
      try {
        const snap = await getDoc(reqDoc(from, to));
        return snap.exists() ? toRequest(snap as QueryDocumentSnapshot) : null;
      } catch {
        // The rules only let the two players read it; a missing one reads as denied.
        return null;
      }
    },
    async deleteFriendRequest(from, to) {
      await deleteDoc(reqDoc(from, to));
    },
    async acceptFriendRequest(from, to) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', to, 'friends', from), { since: serverTimestamp() });
      batch.set(doc(db, 'users', from, 'friends', to), { since: serverTimestamp() });
      batch.delete(reqDoc(from, to));
      await batch.commit();
    },
    watchIncomingRequests(uid, cb) {
      return onSnapshot(query(collection(db, 'friendRequests'), where('to', '==', uid)), (s) => cb(s.docs.map(toRequest)), warn('incoming requests'));
    },
    watchOutgoingRequests(uid, cb) {
      return onSnapshot(query(collection(db, 'friendRequests'), where('from', '==', uid)), (s) => cb(s.docs.map(toRequest)), warn('outgoing requests'));
    },
    watchFriends(uid, cb) {
      return onSnapshot(collection(db, 'users', uid, 'friends'), (s) => cb(s.docs.map((d) => d.id)), warn('friends'));
    },
    async isFriend(uid, other) {
      return (await getDoc(doc(db, 'users', uid, 'friends', other))).exists();
    },
    async removeFriend(uid, other) {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', uid, 'friends', other));
      batch.delete(doc(db, 'users', other, 'friends', uid));
      await batch.commit();
    },

    async setPresence(uid, inMatch) {
      await setDoc(doc(db, 'presence', uid), { lastSeen: serverTimestamp(), inMatch });
    },
    watchPresence(uid, cb) {
      return onSnapshot(
        doc(db, 'presence', uid),
        (s) => {
          if (!s.exists()) return cb(null);
          const d = data(s);
          cb({ lastSeen: millis(d.lastSeen), inMatch: d.inMatch === true });
        },
        warn('presence'),
      );
    },

    async sendInvite(to, invite) {
      const ref = doc(collection(db, 'invites', to, 'items'));
      await setDoc(ref, { from: invite.from, fromName: invite.fromName, code: invite.code, createdAt: serverTimestamp(), status: 'pending' });
      return ref.id;
    },
    async setInviteStatus(to, id, status) {
      await updateDoc(doc(db, 'invites', to, 'items', id), { status });
    },
    async deleteInvite(to, id) {
      await deleteDoc(doc(db, 'invites', to, 'items', id));
    },
    watchInvites(uid, cb) {
      return onSnapshot(collection(db, 'invites', uid, 'items'), (s) => cb(s.docs.map(toInvite)), warn('invites'));
    },
    watchInvite(to, id, cb) {
      return onSnapshot(
        doc(db, 'invites', to, 'items', id),
        (s) => cb(s.exists() ? toInvite(s) : null),
        () => cb(null),
      );
    },
  };
}
