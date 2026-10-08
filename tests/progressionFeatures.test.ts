import { migrateSave } from '@/persistence/migrations';
import { describe, expect, it } from 'vitest';
import { createNewSave } from '@/domain/newAccount';
import { decodeDeck, encodeDeck } from '@/domain/deckCode';
import { applyQuestProgress, claimQuest, refreshQuests } from '@/domain/quests';
import { hasFreeArenaEntry, startArena } from '@/domain/arena';
import { ARENA } from '@/config/arena';
import { LEVELS } from '@/config/progression';
import { applyLevelReward } from '@/domain/progression';
import { CARD_BACKS } from '@/data/cardBacks';
import { createRng } from '@/core/rng';
import type { Deck } from '@/domain/decks';
import type { GameSave } from '@/domain/save';

const MON = new Date(2026, 9, 5, 12).getTime(); // Monday 5 Oct 2026
const DAY = 86_400_000;
const fresh = (now = MON): GameSave => refreshQuests(createNewSave('Tester', 'compass', now, 'p1'), now, createRng(1));

describe('deck codes', () => {
  const deck: Deck = {
    id: 'd1', name: 'Ember Rush', heroFaction: 'EMBER', favorite: false, createdAt: 0, updatedAt: 0,
    cards: { emb_magma_brute: 2, neu_meowchick: 1 },
    talents: [{ abilityId: 'wt_ember_cinder_bolt', level: 2 }, { abilityId: 'wt_ember_kindled_fury', level: 1 }],
  };

  it('round-trips name, Warden, cards and talents', () => {
    const code = encodeDeck(deck);
    expect(code.startsWith('SB1.')).toBe(true);
    const r = decodeDeck(code);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toMatchObject({ name: 'Ember Rush', heroFaction: 'EMBER', cards: { emb_magma_brute: 2, neu_meowchick: 1 } });
  });

  it('accepts a code with spaces around it and drops unknown cards', () => {
    const code = encodeDeck({ ...deck, cards: { ...deck.cards, not_a_card: 2 } });
    const r = decodeDeck(`  ${code}\n`);
    expect(r.ok && r.value.cards).toEqual({ emb_magma_brute: 2, neu_meowchick: 1 });
    expect(r.ok && r.value.unknownCards).toEqual(['not_a_card']);
  });

  it('rejects text that is not a deck code', () => {
    expect(decodeDeck('hello').ok).toBe(false);
    expect(decodeDeck('SB1.!!!').ok).toBe(false);
  });
});

describe('weekly quests', () => {
  it('three different weekly quests each week, each rewarding a pack', () => {
    let s = fresh();
    const weekly = s.quests.weekly;
    expect(weekly).toHaveLength(3);
    expect(new Set(weekly.map((q) => q.templateId)).size).toBe(3);
    for (const q of weekly) expect(q.packs?.amount).toBeGreaterThan(0);
    // Same week: unchanged.
    expect(refreshQuests(s, MON + 3 * DAY, createRng(2)).quests.weekly.map((q) => q.id)).toEqual(weekly.map((q) => q.id));
    // Progress and claim one.
    const w = weekly[1];
    s = applyQuestProgress(s, [{ type: w.type, amount: w.target, faction: w.faction }]).save;
    const claimed = claimQuest(s, w.id, MON + DAY);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) return;
    const packsBefore = s.economy.packs[w.packs!.setId] ?? 0;
    expect(claimed.value.save.economy.packs[w.packs!.setId]).toBe(packsBefore + w.packs!.amount);
    expect(claimed.value.save.quests.weekly.find((q) => q.id === w.id)?.claimed).toBe(true);
    // Next week: three new ones.
    const next = refreshQuests(claimed.value.save, MON + 7 * DAY, createRng(3)).quests.weekly;
    expect(next).toHaveLength(3);
    for (const q of next) expect(weekly.map((x) => x.id)).not.toContain(q.id);
    expect(next.every((q) => !q.claimed)).toBe(true);
  });

  it('keeps a finished but unclaimed weekly quest into the next week, next to two new ones', () => {
    let s = fresh();
    const w = s.quests.weekly[0];
    s = applyQuestProgress(s, [{ type: w.type, amount: w.target, faction: w.faction }]).save;
    const next = refreshQuests(s, MON + 8 * DAY, createRng(4)).quests.weekly;
    expect(next).toHaveLength(3);
    expect(next[0].id).toBe(w.id);
    expect(new Set(next.map((q) => q.templateId)).size).toBe(3);
  });

  it('an old save with a single weekly quest keeps it as one of the list', () => {
    const s = fresh();
    const one = s.quests.weekly[0];
    const migrated = migrateSave({ ...s, quests: { ...s.quests, weekly: one } }).save;
    expect(migrated.quests.weekly.map((q) => q.id)).toEqual([one.id]);
    expect(migrateSave({ ...s, quests: { ...s.quests, weekly: null } }).save.quests.weekly).toEqual([]);
  });
});

describe('daily free Arena entry', () => {
  it('is free once a day, then costs Gold', () => {
    const s = { ...fresh(), profile: { ...fresh().profile, gold: 1000 } };
    expect(hasFreeArenaEntry(s, MON)).toBe(true);
    const a = startArena(s, MON, 1);
    expect(a.ok && a.value.profile.gold).toBe(1000);
    if (!a.ok) return;
    const ended = { ...a.value, arena: { ...a.value.arena, run: null } };
    expect(hasFreeArenaEntry(ended, MON + 1000)).toBe(false);
    const b = startArena(ended, MON + 1000, 2);
    expect(b.ok && b.value.profile.gold).toBe(1000 - ARENA.entryGold);
    expect(hasFreeArenaEntry(ended, MON + DAY)).toBe(true);
  });
});

describe('level rewards', () => {
  it('include Legions of Shadow packs and a card back every 10 levels', () => {
    const all = LEVELS.flatMap((l) => l.rewards);
    expect(all.some((r) => r.kind === 'PACK' && r.setId === 'ABYSS')).toBe(true);
    for (const lv of [10, 20, 30, 40]) expect(LEVELS[lv - 1].rewards.some((r) => r.kind === 'CARD_BACK')).toBe(true);
  });

  it('a card back reward gives one you do not own yet, or Gold when you own them all', () => {
    const s = fresh();
    const got = applyLevelReward(s, { kind: 'CARD_BACK' });
    expect(got.profile.cardBacks.length).toBe(s.profile.cardBacks.length + 1);
    const all = { ...s, profile: { ...s.profile, cardBacks: CARD_BACKS.map((b) => b.id) } };
    const gold = applyLevelReward(all, { kind: 'CARD_BACK' });
    expect(gold.profile.gold).toBeGreaterThan(all.profile.gold);
  });
});
