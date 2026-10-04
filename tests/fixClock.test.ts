import { describe, expect, it } from 'vitest';
import { createRng } from '@/core/rng';
import { createNewSave } from '@/domain/newAccount';
import { hasFreeArenaEntry, retireArena, startArena } from '@/domain/arena';
import { canReroll, refreshQuests, rerollQuest } from '@/domain/quests';
import type { GameSave } from '@/domain/save';

const DAY = 86_400_000;
const T0 = new Date(2026, 5, 10, 12).getTime(); // a Wednesday noon
const fresh = (seen = T0): GameSave => {
  const s = createNewSave('A', 'flame', T0 - 30 * DAY, 'p');
  return { ...s, profile: { ...s.profile, lastSeenAt: seen } };
};

describe('clock moved backwards', () => {
  it('no second free Arena entry by setting the clock back a day', () => {
    let s = fresh();
    expect(hasFreeArenaEntry(s, T0)).toBe(true);
    const r = startArena(s, T0, 1);
    expect(r.ok).toBe(true);
    s = r.ok ? retireArena(r.value, T0).ok ? (retireArena(r.value, T0) as { value: GameSave }).value : s : s;
    expect(hasFreeArenaEntry(s, T0 - DAY)).toBe(false);
    expect(hasFreeArenaEntry(s, T0 + DAY)).toBe(true);
  });

  it('a clock earlier than the last time seen never starts a new day', () => {
    const s = fresh(T0 + 5 * DAY);
    const used = { ...s, arena: { ...s.arena, freeEntryDay: null } };
    expect(hasFreeArenaEntry(used, T0)).toBe(true); // never used: still free
    const started = startArena(used, T0, 1);
    expect(started.ok && started.value.arena.freeEntryDay).not.toBe(null);
  });

  it('daily quests do not refresh when the clock goes back', () => {
    let s = refreshQuests(fresh(), T0, createRng(1));
    s = refreshQuests(s, T0 + DAY, createRng(2)); // the next real day
    const claimedAll = { ...s, quests: { ...s.quests, active: s.quests.active.map((q) => ({ ...q, completed: true, claimed: true })) } };
    // Back to "yesterday": nothing new.
    const back = refreshQuests(claimedAll, T0, createRng(3));
    expect(back.quests.active.every((q) => q.claimed)).toBe(true);
    expect(back.quests.lastRefreshDay).toBe(s.quests.lastRefreshDay);
  });

  it('the weekly quest does not change when the clock goes back a week', () => {
    const s = refreshQuests(fresh(), T0, createRng(1));
    const weekly = s.quests.weekly!;
    const back = refreshQuests({ ...s, quests: { ...s.quests, weekly: { ...weekly, completed: true, claimed: true } } }, T0 - 7 * DAY, createRng(9));
    expect(back.quests.weekly!.id).toBe(weekly.id);
  });

  it('rerolls are not reset by going back a day', () => {
    let s = refreshQuests(fresh(), T0 + DAY, createRng(1));
    const r = rerollQuest(s, s.quests.active[0].id, T0 + DAY, createRng(2));
    expect(r.ok).toBe(true);
    if (r.ok) s = r.value;
    expect(canReroll(s, T0 + DAY)).toBe(false);
    expect(canReroll(s, T0)).toBe(false);
    expect(canReroll(s, T0 + 2 * DAY)).toBe(true);
  });
});

describe('retiring an Arena run', () => {
  it('a free run retired before any match pays nothing', () => {
    const s = fresh();
    const started = startArena(s, T0, 1);
    if (!started.ok) throw new Error(started.error);
    const r = retireArena(started.value, T0);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.arena.run).toBeNull();
    expect(r.value.profile.gold).toBe(s.profile.gold);
    expect(r.value.economy.packs).toEqual(s.economy.packs);
  });

  it('a paid run retired at once still pays the 0-win reward', () => {
    const s0 = fresh();
    const s = { ...s0, profile: { ...s0.profile, gold: 1000 }, arena: { ...s0.arena, freeEntryDay: '2026-06-10' } };
    const started = startArena(s, T0, 1);
    if (!started.ok) throw new Error(started.error);
    const r = retireArena(started.value, T0);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.profile.gold).toBeGreaterThan(started.value.profile.gold);
  });
});
