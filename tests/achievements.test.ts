import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievement } from '@/data/achievements';
import { achievementProgress, evaluateAchievements, recordAchievementMatch, repairAchievements, settleAchievements } from '@/domain/achievements';
import { createNewSave } from '@/domain/newAccount';
import type { MatchSummary } from '@/domain/matchResults';
import type { GameSave } from '@/domain/save';
import { CAMPAIGN } from '@/data/opponents';
import { collectibleCards } from '@/data/cards';
import { migrateSave } from '@/persistence/migrations';
import { GameService } from '@/services/gameService';
import { MemoryStore } from '@/persistence/storage';
import { GLYPHS } from '@/ui/components/Icons';
import { tr } from '@/i18n';

const NOW = 1_700_000_000_000;
const fresh = (): GameSave => createNewSave('Tester', 'flame', NOW, 'p1');
const withProfile = (s: GameSave, patch: Partial<GameSave['profile']>): GameSave => ({ ...s, profile: { ...s.profile, ...patch } });
const stats = { damageDealt: 10, heroDamageDealt: 10, cardsPlayed: 5, unitsPlayed: 3, spellsPlayed: 2, unitsDestroyed: 1, healingDone: 0, cardsDrawn: 6 };
const summary = (over: Partial<MatchSummary> = {}): MatchSummary => ({
  mode: 'PRACTICE',
  opponentId: 'o',
  opponentName: 'O',
  difficulty: 'NORMAL',
  deckId: 'd',
  deckName: 'D',
  deckFaction: 'EMBER',
  result: 'WIN',
  turns: 8,
  durationMs: 1000,
  stats,
  conceded: false,
  ...over,
});

describe('achievement data', () => {
  it('has about thirty achievements with unique ids, known categories, glyphs and rewards', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(28);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(ACHIEVEMENT_CATEGORIES.map((c) => c.id)).toContain(a.category);
      expect(GLYPHS[a.icon], a.id).toBeDefined();
      expect(a.rewards.length, a.id).toBeGreaterThan(0);
      expect(['BRONZE', 'SILVER', 'GOLD']).toContain(a.tier);
      expect(!!a.check || !!a.progress, a.id).toBe(true);
    }
    // Every category has something in it.
    for (const c of ACHIEVEMENT_CATEGORIES) expect(ACHIEVEMENTS.some((a) => a.category === c.id), c.id).toBe(true);
  });

  it('every name, description, title and category has a distinct Czech translation', () => {
    const texts = [
      ...ACHIEVEMENTS.flatMap((a) => [a.name, a.description, ...a.rewards.flatMap((r) => (r.kind === 'TITLE' ? [r.title] : []))]),
      ...ACHIEVEMENT_CATEGORIES.map((c) => c.label),
    ];
    const missing = texts.filter((s) => tr(s, {}, 'cs') === s);
    expect(missing).toEqual([]);
  });
});

describe('evaluateAchievements', () => {
  it('a new account has nothing unlocked', () => {
    expect(evaluateAchievements(fresh())).toEqual([]);
  });

  it('unlocks win milestones by count', () => {
    const s = withProfile(fresh(), { wins: 10 });
    const ids = evaluateAchievements(s);
    expect(ids).toContain('win_1');
    expect(ids).toContain('win_10');
    expect(ids).not.toContain('win_50');
  });

  it('skips achievements that are already unlocked', () => {
    const s = withProfile(fresh(), { wins: 1, achievements: { win_1: NOW } });
    expect(evaluateAchievements(s)).not.toContain('win_1');
  });

  it('campaign chapters need every encounter cleared; the final boss is its own achievement', () => {
    const ch1 = CAMPAIGN[0];
    const partial: GameSave = { ...fresh(), pve: { completed: { [ch1.encounters[0].id]: { firstClearAt: NOW, wins: 1 } } } };
    expect(evaluateAchievements(partial)).toContain('camp_first');
    expect(evaluateAchievements(partial)).not.toContain('camp_ch1');
    const full: GameSave = { ...fresh(), pve: { completed: Object.fromEntries(ch1.encounters.map((e) => [e.id, { firstClearAt: NOW, wins: 1 }])) } };
    expect(evaluateAchievements(full)).toContain('camp_ch1');
    const crown: GameSave = { ...fresh(), pve: { completed: { c9_final: { firstClearAt: NOW, wins: 1 } } } };
    expect(evaluateAchievements(crown)).toContain('camp_crown');
  });

  it('Ranked vs AI tiers use the best rank ever reached', () => {
    const s = withProfile(fresh(), { aiRanked: { ...fresh().profile.aiRanked, rank: 2, best: 12 } });
    const ids = evaluateAchievements(s);
    expect(ids).toEqual(expect.arrayContaining(['air_silver', 'air_gold', 'air_diamond']));
    expect(ids).not.toContain('air_crown');
  });

  it('arena, packs, crafting, levels, tutorial and tournaments', () => {
    let s = withProfile(fresh(), { packsOpened: 10, cardsCrafted: 10, level: 20, tutorialCompleted: true, tournamentsWon: 1 });
    s = { ...s, arena: { ...s.arena, runsPlayed: 1, bestWins: 4 } };
    const ids = evaluateAchievements(s);
    expect(ids).toEqual(expect.arrayContaining(['packs_10', 'craft_10', 'level_10', 'level_20', 'tutorial', 'tournament_win', 'arena_first', 'arena_2', 'arena_4']));
    expect(ids).not.toContain('packs_50');
    expect(ids).not.toContain('level_40');
  });

  it('factions: a win with every faction, and a Legendary set of one faction', () => {
    const s = withProfile(fresh(), { factionWins: { EMBER: 1, VERDANT: 1, IRON: 1, ASTRAL: 1, VOID: 1, TIDE: 30 } });
    expect(evaluateAchievements(s)).toEqual(expect.arrayContaining(['faction_all', 'faction_25']));
    const legends = collectibleCards().filter((c) => c.rarity === 'LEGENDARY' && c.faction === 'VOID');
    const cards = { ...fresh().collection.cards };
    for (const c of legends) cards[c.id] = { NORMAL: 1, FOIL: 0, PRISMATIC: 0 };
    expect(evaluateAchievements({ ...fresh(), collection: { cards, unseen: [] } })).toContain('legend_faction');
  });

  it('match-only feats look at the match just played', () => {
    const s = fresh();
    expect(evaluateAchievements(s, summary({ heroHealth: 26 }))).toContain('flawless');
    expect(evaluateAchievements(s, summary({ heroHealth: 10 }))).not.toContain('flawless');
    expect(evaluateAchievements(s, summary({ heroHealth: 30, result: 'LOSS' }))).not.toContain('flawless');
    expect(evaluateAchievements(s, summary({ heroHealth: 30, turns: 2 }))).not.toContain('flawless');
    expect(evaluateAchievements(s, summary({ heroHealth: 30, mode: 'TUTORIAL' }))).not.toContain('flawless');
    expect(evaluateAchievements(s, summary({ mode: 'PVP' }))).toContain('online_win');
  });
});

describe('progress', () => {
  it('reports current and target, capped at the target', () => {
    const s = withProfile(fresh(), { wins: 7, packsOpened: 80 });
    expect(achievementProgress(s, getAchievement('win_10')!)).toEqual({ current: 7, target: 10 });
    expect(achievementProgress(s, getAchievement('packs_50')!)).toEqual({ current: 50, target: 50 });
    expect(achievementProgress(s, getAchievement('camp_all')!)?.target).toBe(CAMPAIGN.reduce((a, c) => a + c.encounters.length, 0));
    expect(achievementProgress(s, getAchievement('tutorial')!)).toBeNull();
  });

  it('win streaks: counted per match, best kept, tutorial ignored', () => {
    let s = fresh();
    for (let i = 0; i < 4; i++) s = recordAchievementMatch(s, summary());
    s = recordAchievementMatch(s, summary({ mode: 'TUTORIAL', result: 'LOSS' }));
    expect(s.profile.winStreak).toBe(4);
    s = recordAchievementMatch(s, summary({ result: 'LOSS' }));
    expect(s.profile.winStreak).toBe(0);
    expect(s.profile.bestWinStreak).toBe(4);
    expect(achievementProgress(s, getAchievement('streak_5')!)).toEqual({ current: 4, target: 5 });
  });

  it('the best single-match damage comes from match history', () => {
    const s = fresh();
    const rec = { id: 'm', date: NOW, durationMs: 1, mode: 'PRACTICE' as const, opponentId: 'o', opponentName: 'O', difficulty: 'NORMAL' as const, deckId: 'd', deckName: 'D', deckFaction: 'EMBER' as const, result: 'WIN' as const, turns: 9, damageDealt: 44, cardsPlayed: 1, unitsDestroyed: 1, goldEarned: 0, xpEarned: 0, conceded: false };
    expect(evaluateAchievements({ ...s, matchHistory: [rec] })).toContain('damage_40');
  });
});

describe('rewards', () => {
  it('are granted once, with the unlock time stored', () => {
    const s = withProfile(fresh(), { wins: 1 });
    const gold = s.profile.gold;
    const first = settleAchievements(s, NOW);
    expect(first.unlocked).toContain('win_1');
    expect(first.save.profile.achievements.win_1).toBe(NOW);
    const g = getAchievement('win_1')!.rewards.find((r) => r.kind === 'GOLD');
    expect(first.save.profile.gold).toBe(gold + (g && g.kind === 'GOLD' ? g.amount : 0));
    const again = settleAchievements(first.save, NOW + 5);
    expect(again.unlocked).toEqual([]);
    expect(again.save.profile.gold).toBe(first.save.profile.gold);
    expect(again.save).toBe(first.save);
  });

  it('titles are added without replacing the equipped one; packs and card backs are granted', () => {
    const s = withProfile(fresh(), { tournamentsWon: 1, title: 'Wayfarer', titles: ['Wayfarer'] });
    const out = settleAchievements(s, NOW).save;
    const def = getAchievement('tournament_win')!;
    const title = def.rewards.find((r) => r.kind === 'TITLE');
    expect(title).toBeDefined();
    if (title?.kind === 'TITLE') expect(out.profile.titles).toContain(title.title);
    expect(out.profile.title).toBe('Wayfarer');
    const crown = settleAchievements(withProfile(fresh(), { aiRanked: { ...fresh().profile.aiRanked, best: 15 } }), NOW).save;
    expect(crown.profile.cardBacks.length).toBeGreaterThan(fresh().profile.cardBacks.length);
  });

  it('a retroactive unlock grants everything once and writes one reward entry', () => {
    const s = withProfile(fresh(), { wins: 60, level: 21, packsOpened: 12, tutorialCompleted: true });
    const out = settleAchievements(s, NOW, undefined, { retroactive: true });
    expect(out.unlocked.length).toBeGreaterThanOrEqual(6);
    expect(out.save.recentRewards.length).toBe(s.recentRewards.length + 1);
    expect(out.save.profile.gold).toBeGreaterThan(s.profile.gold);
    expect(settleAchievements(out.save, NOW, undefined, { retroactive: true }).unlocked).toEqual([]);
  });
});

describe('save migration', () => {
  it('older saves get empty achievements and zero counters', () => {
    const old = fresh() as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    const profile = { ...old.profile };
    delete profile.achievements;
    delete profile.winStreak;
    delete profile.bestWinStreak;
    delete profile.tournamentsWon;
    const { save } = migrateSave({ ...old, profile });
    expect(save.profile.achievements).toEqual({});
    expect(save.profile.winStreak).toBe(0);
    expect(save.profile.bestWinStreak).toBe(0);
    expect(save.profile.tournamentsWon).toBe(0);
  });

  it('repairs junk achievement data', () => {
    expect(repairAchievements({ win_1: 5, nope: 3, win_10: 'x', level_10: -1 })).toEqual({ win_1: 5 });
    expect(repairAchievements(null)).toEqual({});
    expect(repairAchievements([1, 2])).toEqual({});
  });
});

describe('game service', () => {
  it('unlocks retroactively on load, grants once, and reports one retroactive batch', async () => {
    const store = new MemoryStore();
    const svc = new GameService(store);
    await svc.createProfile('A', 'flame');
    // An existing player from before achievements: write the old-style profile straight to storage.
    const prev = svc.current!;
    const p = { ...prev.profile, wins: 12, level: 11, tutorialCompleted: true } as Record<string, unknown>;
    delete p.achievements;
    await store.set('profile', p);
    const svc2 = new GameService(store);
    const events: { ids: string[]; retroactive: boolean }[] = [];
    svc2.onAchievements((ids, retroactive) => events.push({ ids, retroactive }));
    await svc2.init();
    await svc2.flush();
    expect(events.length).toBe(1);
    expect(events[0].retroactive).toBe(true);
    expect(events[0].ids).toEqual(expect.arrayContaining(['win_1', 'win_10', 'level_10', 'tutorial']));
    const gold = svc2.current!.profile.gold;
    const svc3 = new GameService(store);
    const events3: string[][] = [];
    svc3.onAchievements((ids) => events3.push(ids));
    await svc3.init();
    expect(events3).toEqual([]);
    expect(svc3.current!.profile.gold).toBe(gold);
  });

  it('a recorded match reports its unlocks and folds their Gold into the match rewards', async () => {
    const svc = new GameService(new MemoryStore());
    await svc.createProfile('A', 'flame');
    const before = svc.current!.profile.gold;
    const events: { ids: string[]; retroactive: boolean }[] = [];
    svc.onAchievements((ids, retroactive) => events.push({ ids, retroactive }));
    const rewards = svc.recordMatch(summary({ heroHealth: 30 }));
    expect(rewards.achievements).toEqual(expect.arrayContaining(['win_1', 'flawless']));
    expect(svc.current!.profile.gold).toBe(before + rewards.gold);
    expect(events).toEqual([{ ids: rewards.achievements, retroactive: false }]);
    expect(svc.current!.profile.winStreak).toBe(1);
  });

  it('opening packs unlocks pack achievements and a tournament win is counted', async () => {
    const svc = new GameService(new MemoryStore());
    await svc.createProfile('A', 'flame');
    svc.debugGrantPacks('CORE', 10);
    for (let i = 0; i < 10; i++) expect(svc.openPack('CORE').ok).toBe(true);
    expect(svc.current!.profile.achievements.packs_10).toBeDefined();
    svc.grantTournamentPrize(100, 'Tournament champion', 1, true);
    expect(svc.current!.profile.tournamentsWon).toBe(1);
    expect(svc.current!.profile.achievements.tournament_win).toBeDefined();
  });
});
