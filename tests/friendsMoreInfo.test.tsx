// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ACHIEVEMENTS } from '@/data/achievements';
import { allEncounters } from '@/data/opponents';
import { createNewSave } from '@/domain/newAccount';
import { FakeSocialBackend } from '@/social/fakeBackend';
import { isValidProfile, profileExtras } from '@/social/profile';
import type { PublicProfile } from '@/social/backend';
import type { FriendView } from '@/state/socialStore';
import { FriendInfo, friendStatusText } from '@/ui/components/FriendInfo';

const NOW = 1_800_000_000_000;

describe('friends see more: rank, achievements, campaign, favourite faction, match kind', () => {
  it('computes the extras from the save', () => {
    const s = createNewSave('Ann', 'compass', NOW, 'p1');
    const fresh = profileExtras(s);
    expect(fresh.aiRank).toBeUndefined();
    expect(fresh.favFaction).toBe('');
    expect(fresh.achievementsTotal).toBe(ACHIEVEMENTS.length);
    expect(fresh.campaignTotal).toBe(allEncounters().length);
    s.profile.aiRanked = { ...s.profile.aiRanked, rank: 7, wins: 3, losses: 1 };
    s.profile.factionWins = { EMBER: 2, TIDE: 5 };
    s.profile.achievements = { [ACHIEVEMENTS[0].id]: 1, [ACHIEVEMENTS[1].id]: 1, not_a_real_one: 1 };
    s.pve.completed = { c1_e1: { firstClearAt: 1, wins: 1 }, w1_e1: { firstClearAt: 1, wins: 1 } };
    expect(profileExtras(s)).toMatchObject({ aiRank: 7, favFaction: 'TIDE', achievementsDone: 2, campaignWon: 2 });
    expect(isValidProfile({ name: 'Ann', avatar: '', portrait: '', friendCode: 'AAAAAAAA', ...profileExtras(s) })).toBe(true);
  });

  it('validation mirrors the rules', async () => {
    const base: PublicProfile = { name: 'Ann', avatar: 'VOID', portrait: '', friendCode: 'AAAAAAAA' };
    const put = async (p: Partial<PublicProfile>) => {
      const b = new FakeSocialBackend();
      await b.claimFriendCode('ann', 'AAAAAAAA');
      return b.putProfile('ann', { ...base, ...p }).then(() => 'ok', () => 'denied');
    };
    expect(await put({ aiRank: 15, achievementsDone: 3, achievementsTotal: 70, campaignWon: 0, campaignTotal: 88, favFaction: 'EMBER' })).toBe('ok');
    expect(await put({ aiRank: 16 })).toBe('denied');
    expect(await put({ achievementsDone: 5 })).toBe('denied');
    expect(await put({ campaignWon: 9, campaignTotal: 8 })).toBe('denied');
    expect(await put({ favFaction: 'NEUTRAL' })).toBe('denied');
  });

  it('shows the match kind and the second stats line', () => {
    expect(friendStatusText({ presence: { lastSeen: NOW - 1000, inMatch: true, activity: 'AI_RANKED' } }, NOW)).toBe('In a match: Ranked vs AI');
    expect(friendStatusText({ presence: { lastSeen: NOW - 1000, inMatch: true, activity: 'nonsense' } }, NOW)).toBe('In a match');
    const f: FriendView = { uid: 'x', name: 'Bob', avatar: 'TIDE', portrait: '', presence: null, aiRank: 15, achievementsDone: 12, achievementsTotal: 70, campaignWon: 30, campaignTotal: 88, favFaction: 'VOID' };
    const { container } = render(<FriendInfo friend={f} now={NOW} />);
    const more = container.querySelector('.friend-more')!.textContent!;
    expect(more).toContain('Ranked vs AI: Crown');
    expect(more).toContain('Achievements 12 / 70');
    expect(more).toContain('Campaign 30 / 88');
    expect(more).toContain('Hollow Choir');
  });
});
