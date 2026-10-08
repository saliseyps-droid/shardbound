import { describe, expect, it } from 'vitest';
import { evaluateAchievements } from '@/domain/achievements';
import { createNewSave } from '@/domain/newAccount';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';
import { addCards, type GameSave } from '@/domain/save';
import { collectibleCards } from '@/data/cards';
import { PORTRAITS } from '@/data/portraits';
import { BRAWL_EPOCH, brawlFights } from '@/domain/brawl';
import { refreshQuests } from '@/domain/quests';
import { createRng } from '@/core/rng';

const NOW = BRAWL_EPOCH + 3600_000;
const fresh = (): GameSave => createNewSave('Tester', 'flame', NOW, 'p1');
const stats = { damageDealt: 10, heroDamageDealt: 10, cardsPlayed: 5, unitsPlayed: 3, spellsPlayed: 2, unitsDestroyed: 1, healingDone: 0, cardsDrawn: 6 };
const brawlWin = (fightId: string): MatchSummary => ({
  mode: 'BRAWL', opponentId: 'o', opponentName: 'O', difficulty: 'EXPERT', deckId: 'd', deckName: 'D', deckFaction: 'EMBER',
  result: 'WIN', turns: 8, durationMs: 1000, stats, conceded: false, brawlFightId: fightId,
});

describe('Brawl achievements', () => {
  it('Brawl wins are counted for good, across rotations', () => {
    let s = fresh();
    s = applyMatchResult(s, brawlWin('0-0'), NOW).save;
    s = applyMatchResult(s, brawlWin('0-0'), NOW).save;
    expect(s.profile.brawlWins).toBe(2);
    expect(evaluateAchievements(s)).toContain('brawl_1');
    expect(evaluateAchievements(s)).not.toContain('brawl_both');
    s = applyMatchResult(s, brawlWin('0-1'), NOW).save;
    expect(evaluateAchievements(s)).toContain('brawl_both');
    s = applyMatchResult(s, brawlWin('1-0'), NOW + 3 * 86_400_000).save;
    expect(s.profile.brawlWins).toBe(4);
  });

  it('winning a Champion fight unlocks Giant Slayer', () => {
    const r = Array.from({ length: 300 }, (_, i) => i).find((i) => brawlFights(i).some((f) => f.modifiers.some((m) => m.id === 'champion')))!;
    const f = brawlFights(r).find((x) => x.modifiers.some((m) => m.id === 'champion'))!;
    const s = fresh();
    expect(evaluateAchievements(s, brawlWin(f.id))).toContain('brawl_champion');
    expect(evaluateAchievements(s, brawlWin(brawlFights(r).find((x) => x !== f)!.id))).not.toContain('brawl_champion');
  });
});

describe('collection and quest achievements', () => {
  it('owning a set, Dragons, Legendaries, shiny cards and portraits', () => {
    const base = fresh();
    const dragonSet = collectibleCards().filter((c) => c.set === 'DRAGON');
    const legends = collectibleCards().filter((c) => c.rarity === 'LEGENDARY').slice(0, 10);
    let collection = addCards(base.collection, dragonSet.map((c) => ({ cardId: c.id, variant: 'NORMAL' as const })));
    collection = addCards(collection, legends.map((c) => ({ cardId: c.id, variant: 'NORMAL' as const })));
    collection = addCards(collection, [{ cardId: dragonSet[0].id, variant: 'PRISMATIC' }]);
    const s: GameSave = { ...base, collection, profile: { ...base.profile, portraits: PORTRAITS.slice(0, 3).map((p) => p.id) } };
    const ids = evaluateAchievements(s);
    expect(ids).toEqual(expect.arrayContaining(['set_dragon', 'dragons_20', 'legend_10', 'prismatic_1', 'portraits_3']));
    expect(ids).not.toContain('portraits_all');
    expect(evaluateAchievements({ ...s, profile: { ...s.profile, portraits: PORTRAITS.map((p) => p.id) } })).toContain('portraits_all');
  });

  it('all three weekly quests claimed in one week', () => {
    const base = refreshQuests(fresh(), NOW, createRng(1));
    expect(base.quests.weekly).toHaveLength(3);
    const done = base.quests.weekly.map((q) => ({ ...q, progress: q.target, completed: true, claimed: true }));
    expect(evaluateAchievements({ ...base, quests: { ...base.quests, weekly: done } })).toContain('weekly_all');
    expect(evaluateAchievements({ ...base, quests: { ...base.quests, weekly: [done[0], ...base.quests.weekly.slice(1)] } })).not.toContain('weekly_all');
  });
});
