import { describe, expect, it } from 'vitest';
import { LEVELS, MATCH_REWARDS, XP_REWARDS } from '@/config/progression';
import { DAILY_REWARDS } from '@/config/dailyRewards';
import { QUEST_CONFIG } from '@/config/quests';
import { createRng } from '@/core/rng';
import { createNewSave } from '@/domain/newAccount';
import { grantXp } from '@/domain/progression';
import { applyQuestProgress, claimQuest, refreshQuests, rerollQuest } from '@/domain/quests';
import { claimDaily, dailyStatus } from '@/domain/daily';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';

const T0 = Date.parse('2026-03-10T09:00:00');
const DAY = 86_400_000;
const fresh = () => refreshQuests(createNewSave('T', 'a', T0, 'p'), T0, createRng(1));

const summary = (over: Partial<MatchSummary> = {}): MatchSummary => ({
  mode: 'PRACTICE', opponentId: 'x', opponentName: 'Bot', difficulty: 'NORMAL', deckId: 'starter_ember', deckName: 'Cinder Blitz',
  deckFaction: 'EMBER', result: 'WIN', turns: 12, durationMs: 60000, conceded: false,
  stats: { damageDealt: 30, heroDamageDealt: 30, cardsPlayed: 12, unitsPlayed: 8, spellsPlayed: 4, unitsDestroyed: 5, healingDone: 0, cardsDrawn: 10 },
  ...over,
});

describe('levels', () => {
  it('has at least 30 configured levels', () => expect(LEVELS.length).toBeGreaterThanOrEqual(30));

  it('grants multiple level-ups and their rewards', () => {
    const save = fresh();
    const xp = LEVELS[0].xpToNext + LEVELS[1].xpToNext + 5;
    const res = grantXp(save, xp, T0);
    expect(res.save.profile.level).toBe(3);
    expect(res.save.profile.xp).toBe(5);
    expect(res.levelUps.map((l) => l.level)).toEqual([2, 3]);
    // Level 3 grants a pack in configuration.
    expect((res.save.economy.packs.CORE ?? 0)).toBeGreaterThan(save.economy.packs.CORE ?? 0);
  });
});

describe('quests', () => {
  it('new accounts receive the maximum number of quests', () => {
    expect(fresh().quests.active.length).toBe(QUEST_CONFIG.maxActive);
  });

  it('tracks progress, completes and pays out once', () => {
    let save = fresh();
    const quest = save.quests.active[0];
    const res = applyQuestProgress(save, [{ type: quest.type, amount: quest.target + 50, faction: quest.faction }]);
    save = res.save;
    const q = save.quests.active[0];
    expect(q.progress).toBe(q.target);
    expect(q.completed).toBe(true);
    const gold = save.profile.gold;
    const claimed = claimQuest(save, q.id, T0);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) return;
    expect(claimed.value.save.profile.gold).toBe(gold + q.gold);
    expect(claimQuest(claimed.value.save, q.id, T0).ok).toBe(false);
  });

  it('rerolls once per day', () => {
    let save = fresh();
    const q = save.quests.active[0];
    const r1 = rerollQuest(save, q.id, T0, createRng(2));
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    save = r1.value;
    expect(rerollQuest(save, save.quests.active[1].id, T0, createRng(3)).ok).toBe(false);
    expect(rerollQuest(save, save.quests.active[1].id, T0 + DAY, createRng(3)).ok).toBe(true);
  });

  it('adds new quests on a new day up to the cap', () => {
    let save = fresh();
    save = { ...save, quests: { ...save.quests, active: save.quests.active.slice(1) } };
    save = refreshQuests(save, T0 + DAY, createRng(9));
    expect(save.quests.active.length).toBe(QUEST_CONFIG.maxActive);
  });
});

describe('daily rewards', () => {
  it('can be claimed once per day and advances the cycle', () => {
    let save = fresh();
    const r1 = claimDaily(save, T0, createRng(1));
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    save = r1.value.save;
    expect(save.profile.gold).toBe(fresh().profile.gold + (DAILY_REWARDS[0] as { amount: number }).amount);
    expect(dailyStatus(save, T0 + 1000).canClaim).toBe(false);
    expect(claimDaily(save, T0 + 3600_000, createRng(1)).ok).toBe(false);
    const r2 = claimDaily(save, T0 + DAY, createRng(1));
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.value.save.daily.nextIndex).toBe(2);
  });

  it('refuses claims when the clock moves backwards', () => {
    const r1 = claimDaily(fresh(), T0, createRng(1));
    if (!r1.ok) throw new Error('claim failed');
    expect(dailyStatus(r1.value.save, T0 - 2 * DAY).canClaim).toBe(false);
  });

  it('resets the streak after missing days', () => {
    const r1 = claimDaily(fresh(), T0, createRng(1));
    if (!r1.ok) throw new Error('claim failed');
    expect(dailyStatus(r1.value.save, T0 + 5 * DAY).index).toBe(0);
  });
});

describe('match rewards', () => {
  it('grants gold and XP for a win including first win bonus', () => {
    const save = fresh();
    const { save: after, rewards } = applyMatchResult(save, summary(), T0);
    const expectedGold = MATCH_REWARDS.goldPerWin + MATCH_REWARDS.difficultyGoldBonus.NORMAL + MATCH_REWARDS.firstWinOfDayGold;
    expect(rewards.gold).toBe(expectedGold);
    expect(rewards.xp).toBe(XP_REWARDS.win + XP_REWARDS.firstWinOfDay);
    expect(after.profile.gold).toBe(save.profile.gold + expectedGold);
    expect(after.profile.wins).toBe(1);
    expect(after.matchHistory[0].result).toBe('WIN');
    // Second win the same day has no first-win bonus.
    const second = applyMatchResult(after, summary(), T0 + 1000);
    expect(second.rewards.gold).toBe(MATCH_REWARDS.goldPerWin + MATCH_REWARDS.difficultyGoldBonus.NORMAL);
  });

  it('advances quests from match stats', () => {
    const save = fresh();
    const { save: after } = applyMatchResult(save, summary(), T0);
    const progressed = after.quests.active.filter((q) => q.progress > 0);
    expect(progressed.length).toBeGreaterThan(0);
  });

  it('instant concedes give no rewards', () => {
    const { rewards } = applyMatchResult(fresh(), summary({ result: 'LOSS', turns: 1, conceded: true }), T0);
    expect(rewards.gold).toBe(0);
    expect(rewards.xp).toBe(0);
  });

  it('PvE first clear grants the encounter reward only once', () => {
    const s1 = applyMatchResult(fresh(), summary({ mode: 'PVE', pveEncounterId: 'c1_e1', firstWinReward: { gold: 100, packs: { setId: 'CORE', amount: 1 } } }), T0);
    expect(s1.rewards.firstClear).toBe(true);
    expect(s1.save.pve.completed.c1_e1.wins).toBe(1);
    const s2 = applyMatchResult(s1.save, summary({ mode: 'PVE', pveEncounterId: 'c1_e1', firstWinReward: { gold: 100 } }), T0 + 10);
    expect(s2.rewards.firstClear).toBe(false);
    expect(s2.save.pve.completed.c1_e1.wins).toBe(2);
  });

  it('tutorial completion is rewarded once', () => {
    const s1 = applyMatchResult(fresh(), summary({ mode: 'TUTORIAL' }), T0);
    expect(s1.save.profile.tutorialCompleted).toBe(true);
    expect(s1.rewards.gold).toBe(MATCH_REWARDS.tutorialGold);
    const s2 = applyMatchResult(s1.save, summary({ mode: 'TUTORIAL' }), T0);
    expect(s2.rewards.gold).toBe(0);
  });
});

describe('online matches', () => {
  it('reward and progress quests like a normal match', () => {
    const save = fresh();
    const normal = applyMatchResult(save, summary(), T0);
    const pvp = applyMatchResult(save, summary({ mode: 'PVP' }), T0);
    expect(pvp.rewards.gold).toBe(normal.rewards.gold);
    expect(pvp.rewards.xp).toBe(normal.rewards.xp);
    expect(pvp.save.quests.active.map((q) => q.progress)).toEqual(normal.save.quests.active.map((q) => q.progress));
    expect(pvp.save.matchHistory[0].mode).toBe('PVP');
  });
});
