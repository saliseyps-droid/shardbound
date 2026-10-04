import { describe, expect, it, vi } from 'vitest';
import { generateFriendCode, isValidFriendCode, normalizeFriendCode, presenceStatus, inviteIsLive, INVITE_TTL_MS } from '@/social/friends';
import { FakeSocialBackend } from '@/social/fakeBackend';
import { SocialService } from '@/social/service';

describe('friend codes', () => {
  it('generates 8 unambiguous characters', () => {
    let i = 0;
    const rand = () => ((i++ * 0.137) % 1);
    const code = generateFriendCode(rand);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    expect(code).not.toMatch(/[01IOL]/);
    expect(isValidFriendCode(code)).toBe(true);
  });

  it('normalizes what players type', () => {
    expect(normalizeFriendCode(' abcd-efgh ')).toBe('ABCDEFGH');
    expect(isValidFriendCode('ABCD')).toBe(false);
    expect(isValidFriendCode('ABCDEFG0')).toBe(false);
  });
});

describe('presence and invites', () => {
  const now = 1_000_000_000;
  it('is online within two minutes of the last heartbeat', () => {
    expect(presenceStatus({ lastSeen: now - 30_000, inMatch: false }, now)).toBe('online');
    expect(presenceStatus({ lastSeen: now - 30_000, inMatch: true }, now)).toBe('inMatch');
    expect(presenceStatus({ lastSeen: now - 3 * 60_000, inMatch: true }, now)).toBe('offline');
    expect(presenceStatus(null, now)).toBe('offline');
  });

  it('invites expire after two minutes', () => {
    expect(inviteIsLive({ createdAt: now - 10_000, status: 'pending' }, now)).toBe(true);
    expect(inviteIsLive({ createdAt: now - INVITE_TTL_MS - 1, status: 'pending' }, now)).toBe(false);
    expect(inviteIsLive({ createdAt: now, status: 'accepted' }, now)).toBe(false);
  });
});

function pair() {
  const backend = new FakeSocialBackend();
  const ann = new SocialService(backend, 'ann');
  const bob = new SocialService(backend, 'bob');
  return { backend, ann, bob };
}

describe('SocialService', () => {
  it('gives every player one stable friend code', async () => {
    const { ann } = pair();
    const p1 = await ann.ensureProfile({ name: 'Ann', avatar: 'VOID', portrait: '' });
    const p2 = await ann.ensureProfile({ name: 'Ann B', avatar: 'VOID', portrait: '' });
    expect(isValidFriendCode(p1.friendCode)).toBe(true);
    expect(p2.friendCode).toBe(p1.friendCode);
    expect(p2.name).toBe('Ann B');
  });

  it('retries when a generated code is taken', async () => {
    const { backend, ann } = pair();
    await backend.claimFriendCode('bob', 'AAAAAAAA');
    const codes = ['AAAAAAAA', 'BBBBBBBB'];
    const svc = new SocialService(backend, 'ann', { makeCode: () => codes.shift()! });
    expect((await svc.ensureProfile({ name: 'Ann', avatar: '', portrait: '' })).friendCode).toBe('BBBBBBBB');
    void ann;
  });

  it('adds a friend by code through a request the other player accepts', async () => {
    const { backend, ann, bob } = pair();
    await ann.ensureProfile({ name: 'Ann', avatar: '', portrait: '' });
    const bobProfile = await bob.ensureProfile({ name: 'Bob', avatar: '', portrait: '' });
    expect(await ann.addFriendByCode('nope')).toEqual({ ok: false, error: 'That friend code is not valid.' });
    expect(await ann.addFriendByCode('ZZZZZZZZ')).toEqual({ ok: false, error: 'No player has this friend code.' });
    const own = (await backend.getProfile('ann'))!.friendCode;
    expect(await ann.addFriendByCode(own)).toEqual({ ok: false, error: 'That is your own friend code.' });

    expect(await ann.addFriendByCode(bobProfile.friendCode.toLowerCase())).toEqual({ ok: true, value: 'sent' });
    const incoming = backend.requestsTo('bob');
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toMatchObject({ from: 'ann', to: 'bob', fromName: 'Ann' });

    await bob.acceptRequest('ann');
    expect(backend.friendsOf('ann')).toEqual(['bob']);
    expect(backend.friendsOf('bob')).toEqual(['ann']);
    expect(backend.requestsTo('bob')).toHaveLength(0);
    expect(await ann.addFriendByCode(bobProfile.friendCode)).toEqual({ ok: false, error: 'You are already friends.' });
  });

  it('adding someone who already asked you accepts their request', async () => {
    const { backend, ann, bob } = pair();
    const annP = await ann.ensureProfile({ name: 'Ann', avatar: '', portrait: '' });
    const bobP = await bob.ensureProfile({ name: 'Bob', avatar: '', portrait: '' });
    await bob.addFriendByCode(annP.friendCode);
    expect(await ann.addFriendByCode(bobP.friendCode)).toEqual({ ok: true, value: 'accepted' });
    expect(backend.friendsOf('ann')).toEqual(['bob']);
  });

  it('declining and removing', async () => {
    const { backend, ann, bob } = pair();
    await ann.ensureProfile({ name: 'Ann', avatar: '', portrait: '' });
    const bobP = await bob.ensureProfile({ name: 'Bob', avatar: '', portrait: '' });
    await ann.addFriendByCode(bobP.friendCode);
    await bob.declineRequest('ann');
    expect(backend.requestsTo('bob')).toHaveLength(0);
    expect(backend.friendsOf('bob')).toEqual([]);

    await ann.addFriendByCode(bobP.friendCode);
    await bob.acceptRequest('ann');
    await ann.removeFriend('bob');
    expect(backend.friendsOf('ann')).toEqual([]);
    expect(backend.friendsOf('bob')).toEqual([]);
  });

  it('only friends can invite; the invitee sees the invite and can decline it', async () => {
    const { backend, ann, bob } = pair();
    await ann.ensureProfile({ name: 'Ann', avatar: '', portrait: '' });
    const bobP = await bob.ensureProfile({ name: 'Bob', avatar: '', portrait: '' });
    await expect(ann.invite('bob', 'Ann', 'ABC234')).rejects.toThrow();
    await ann.addFriendByCode(bobP.friendCode);
    await bob.acceptRequest('ann');

    const seen = vi.fn();
    const stop = backend.watchInvites('bob', seen);
    const id = await ann.invite('bob', 'Ann', 'ABC234');
    expect(seen).toHaveBeenLastCalledWith([expect.objectContaining({ id, from: 'ann', fromName: 'Ann', code: 'ABC234', status: 'pending' })]);

    const hostSees = vi.fn();
    backend.watchInvite('bob', id, hostSees);
    await bob.declineInvite(id);
    expect(hostSees).toHaveBeenLastCalledWith(null);
    stop();
  });

  it('accepting marks the invite so the host knows the friend is coming', async () => {
    const { backend, ann, bob } = pair();
    await ann.ensureProfile({ name: 'Ann', avatar: '', portrait: '' });
    const bobP = await bob.ensureProfile({ name: 'Bob', avatar: '', portrait: '' });
    await ann.addFriendByCode(bobP.friendCode);
    await bob.acceptRequest('ann');
    const id = await ann.invite('bob', 'Ann', 'ABC234');
    const hostSees = vi.fn();
    backend.watchInvite('bob', id, hostSees);
    await bob.acceptInvite(id);
    expect(hostSees).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'accepted' }));
  });
});

describe('leaderboard uploads', () => {
  it('uploads changed entries only, debounced', async () => {
    vi.useFakeTimers();
    try {
      const backend = new FakeSocialBackend();
      const svc = new SocialService(backend, 'ann', { debounceMs: 1000 });
      const entry = { name: 'Ann', avatar: 'VOID', portrait: '', wins: 1, rank: 4, crownPoints: 0, score: 400000 };
      svc.queueLeaderboard('2026-10', { aiRanked: entry });
      svc.queueLeaderboard('2026-10', { aiRanked: entry });
      expect(backend.puts).toBe(0);
      await vi.advanceTimersByTimeAsync(1000);
      expect(backend.puts).toBe(1);
      svc.queueLeaderboard('2026-10', { aiRanked: entry });
      await vi.advanceTimersByTimeAsync(1000);
      expect(backend.puts).toBe(1);
      svc.queueLeaderboard('2026-10', { aiRanked: { ...entry, rank: 5, score: 500000 } });
      await vi.advanceTimersByTimeAsync(1000);
      expect(backend.puts).toBe(2);
      const top = await backend.topEntries('2026-10', 'aiRanked', 100);
      expect(top[0]).toMatchObject({ uid: 'ann', rank: 5 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('never uploads an invalid entry', async () => {
    vi.useFakeTimers();
    try {
      const backend = new FakeSocialBackend();
      const svc = new SocialService(backend, 'ann', { debounceMs: 10 });
      svc.queueLeaderboard('2026-10', { ranked: { name: 'Ann', avatar: '', portrait: '', wins: 1, rating: 99999 } });
      await vi.advanceTimersByTimeAsync(50);
      expect(backend.puts).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
