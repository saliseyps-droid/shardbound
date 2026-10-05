// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { formatDate, setLocaleForTests } from '@/i18n';
import { collectibleCards } from '@/data/cards';
import { createNewSave } from '@/domain/newAccount';
import { addCards, type GameSave } from '@/domain/save';
import { FakeSocialBackend } from '@/social/fakeBackend';
import { formatLastOnline, isValidProfile, profileStats } from '@/social/profile';
import { SocialService } from '@/social/service';
import type { PublicProfile } from '@/social/backend';
import type { FriendView } from '@/state/socialStore';
import { FriendInfo, friendStatusText } from '@/ui/components/FriendInfo';

afterEach(() => {
  setLocaleForTests('en');
  vi.useRealTimers();
});

// Local time, so calendar days ("yesterday") are the same wherever the tests run.
const NOW = new Date(2026, 9, 5, 15, 0).getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;

describe('last online', () => {
  it('uses relative wording for the last week, then a date', () => {
    expect(formatLastOnline(NOW - 30_000, NOW)).toBe('Last online just now');
    expect(formatLastOnline(NOW - 5 * MIN, NOW)).toBe('Last online 5 min ago');
    expect(formatLastOnline(NOW - 3 * HOUR - 10 * MIN, NOW)).toBe('Last online 3 h ago');
    expect(formatLastOnline(new Date(2026, 9, 4, 10).getTime(), NOW)).toBe('Last online yesterday');
    expect(formatLastOnline(new Date(2026, 9, 2, 22).getTime(), NOW)).toBe('Last online 3 days ago');
    expect(formatLastOnline(new Date(2026, 8, 29, 9).getTime(), NOW)).toBe('Last online 6 days ago');
    const old = new Date(2026, 8, 20, 9).getTime();
    expect(formatLastOnline(old, NOW)).toBe(`Last online ${formatDate(old, { day: 'numeric', month: 'short' })}`);
    expect(formatLastOnline(old, NOW)).toMatch(/20/);
    expect(formatLastOnline(new Date(2025, 11, 30).getTime(), NOW)).toMatch(/2025/);
  });

  it('speaks Czech, with plural forms', () => {
    setLocaleForTests('cs');
    expect(formatLastOnline(NOW - 5 * MIN, NOW)).toBe('Naposledy online před 5 min');
    expect(formatLastOnline(new Date(2026, 9, 4, 10).getTime(), NOW)).toBe('Naposledy online včera');
    expect(formatLastOnline(new Date(2026, 9, 2, 10).getTime(), NOW)).toBe('Naposledy online před 3 dny');
    expect(formatLastOnline(new Date(2026, 8, 30, 10).getTime(), NOW)).toBe('Naposledy online před 5 dny');
  });

  it('online and in-match friends keep their status; never-seen friends are just offline', () => {
    expect(friendStatusText({ presence: { lastSeen: NOW - 20_000, inMatch: false } }, NOW)).toBe('Online');
    expect(friendStatusText({ presence: { lastSeen: NOW - 20_000, inMatch: true } }, NOW)).toBe('In a match');
    expect(friendStatusText({ presence: { lastSeen: NOW - 3 * HOUR, inMatch: false } }, NOW)).toBe('Last online 3 h ago');
    expect(friendStatusText({ presence: null }, NOW)).toBe('Offline');
  });
});

function save(): GameSave {
  return createNewSave('Ann', 'compass', NOW, 'p1');
}

describe('profile stats', () => {
  it('counts distinct collectible cards and keeps level and title', () => {
    const s = save();
    const all = collectibleCards();
    const before = profileStats(s);
    expect(before.cardsTotal).toBe(all.length);
    // A second copy of an owned card does not count twice.
    const fresh = all.find((c) => !s.collection.cards[c.id])!;
    const withCards: GameSave = { ...s, collection: addCards(s.collection, [{ cardId: fresh.id, variant: 'NORMAL' }, { cardId: fresh.id, variant: 'FOIL' }]), profile: { ...s.profile, level: 12, title: 'Wayfarer' } };
    expect(profileStats(withCards)).toEqual({ level: 12, title: 'Wayfarer', cardsOwned: before.cardsOwned + 1, cardsTotal: all.length });
    expect(isValidProfile({ name: 'Ann', avatar: '', portrait: '', friendCode: 'AAAAAAAA', ...profileStats(withCards) })).toBe(true);
  });
});

describe('profile validation (mirrors firestore.rules)', () => {
  const base: PublicProfile = { name: 'Ann', avatar: 'VOID', portrait: '', friendCode: 'AAAAAAAA' };
  async function put(p: Partial<PublicProfile> & Record<string, unknown>) {
    const b = new FakeSocialBackend();
    await b.claimFriendCode('ann', 'AAAAAAAA');
    return b.putProfile('ann', { ...base, ...p } as PublicProfile).then(
      () => 'ok',
      () => 'denied',
    );
  }

  it('accepts old profiles without stats and valid stats', async () => {
    expect(await put({})).toBe('ok');
    expect(await put({ level: 1, title: null, cardsOwned: 0, cardsTotal: 0 })).toBe('ok');
    expect(await put({ level: 100, title: 'x'.repeat(40), cardsOwned: 5000, cardsTotal: 5000 })).toBe('ok');
    expect(await put({ title: '' })).toBe('ok');
  });

  it('refuses what the rules refuse', async () => {
    expect(await put({ level: 0 })).toBe('denied');
    expect(await put({ level: 101 })).toBe('denied');
    expect(await put({ level: 2.5 })).toBe('denied');
    expect(await put({ title: 'x'.repeat(41) })).toBe('denied');
    expect(await put({ title: 7 as unknown as string })).toBe('denied');
    expect(await put({ cardsOwned: 10, cardsTotal: 9 })).toBe('denied');
    expect(await put({ cardsOwned: 10 })).toBe('denied');
    expect(await put({ cardsOwned: -1, cardsTotal: 9 })).toBe('denied');
    expect(await put({ cardsOwned: 1, cardsTotal: 5001 })).toBe('denied');
    expect(await put({ wins: 3 })).toBe('denied');
    expect(await put({ name: '' })).toBe('denied');
  });
});

describe('profile upload', () => {
  const info = { name: 'Ann', avatar: 'VOID', portrait: '', level: 5, title: 'Wayfarer', cardsOwned: 40, cardsTotal: 267 };

  it('includes the stats and skips unchanged profiles', async () => {
    vi.useFakeTimers();
    const backend = new FakeSocialBackend();
    const svc = new SocialService(backend, 'ann', { debounceMs: 1000 });
    await svc.ensureProfile(info);
    expect(backend.profilePuts).toBe(1);
    expect(await backend.getProfile('ann')).toMatchObject({ level: 5, title: 'Wayfarer', cardsOwned: 40, cardsTotal: 267 });

    // Same values: nothing queued, nothing written.
    svc.queueProfile({ ...info });
    await vi.advanceTimersByTimeAsync(2000);
    expect(backend.profilePuts).toBe(1);
    await svc.ensureProfile({ ...info });
    expect(backend.profilePuts).toBe(1);

    // A burst of changes: one write, after the pause, with the latest values.
    const done = vi.fn();
    svc.queueProfile({ ...info, cardsOwned: 41 });
    svc.queueProfile({ ...info, cardsOwned: 42, level: 6 }, done);
    await vi.advanceTimersByTimeAsync(500);
    expect(backend.profilePuts).toBe(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(backend.profilePuts).toBe(2);
    expect(await backend.getProfile('ann')).toMatchObject({ level: 6, cardsOwned: 42 });
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ level: 6, cardsOwned: 42 }));
    svc.dispose();
  });

  it('upgrades an old profile without stats once', async () => {
    const backend = new FakeSocialBackend();
    backend.seedProfile('ann', { name: 'Ann', avatar: 'VOID', portrait: '', friendCode: 'AAAAAAAA' });
    const svc = new SocialService(backend, 'ann');
    const p = await svc.ensureProfile(info);
    expect(p.friendCode).toBe('AAAAAAAA');
    expect(backend.profilePuts).toBe(1);
    expect(await backend.getProfile('ann')).toMatchObject({ level: 5, cardsOwned: 40 });
  });
});

describe('friend row', () => {
  const friend = (over: Partial<FriendView>): FriendView => ({ uid: 'f', name: 'Brynja', avatar: 'TIDE', portrait: '', presence: { lastSeen: NOW - 3 * HOUR, inMatch: false }, ...over });

  it('shows title, level, cards and last online', () => {
    const { container } = render(<FriendInfo friend={friend({ level: 23, title: 'Crownbreaker', cardsOwned: 142, cardsTotal: 267 })} now={NOW} />);
    expect(container.querySelector('.friend-title')?.textContent).toBe('Crownbreaker');
    expect(container.querySelector('.friend-stats')?.textContent).toBe('Level 23 · 142 / 267 cards');
    expect(container.querySelector('.friend-status')?.textContent).toBe('Last online 3 h ago');
  });

  it('leaves out what an older profile does not have', () => {
    const { container } = render(<FriendInfo friend={friend({})} now={NOW} />);
    expect(container.querySelector('strong')?.textContent).toBe('Brynja');
    expect(container.querySelector('.friend-title')).toBeNull();
    expect(container.querySelector('.friend-stats')).toBeNull();
    const partial = render(<FriendInfo friend={friend({ level: 3, title: '' })} now={NOW} />);
    expect(partial.container.querySelector('.friend-stats')?.textContent).toBe('Level 3');
    expect(partial.container.querySelector('.friend-title')).toBeNull();
  });

  it('translates the title', () => {
    setLocaleForTests('cs');
    const { container } = render(<FriendInfo friend={friend({ level: 2, title: 'Crownbreaker', cardsOwned: 31, cardsTotal: 267 })} now={NOW} />);
    expect(container.querySelector('.friend-title')?.textContent).toBe('Lamač korun');
    expect(container.querySelector('.friend-stats')?.textContent).toBe('Úroveň 2 · 31 / 267 karet');
  });
});
