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

describe('weekly quest', () => {
  it('appears once per week and rewards a pack', () => {
    let s = fresh();
    const weekly = s.quests.weekly!;
    expect(weekly).toBeTruthy();
    expect(weekly.packs?.amount).toBeGreaterThan(0);
    // Same week: unchanged.
    expect(refreshQuests(s, MON + 3 * DAY, createRng(2)).quests.weekly!.id).toBe(weekly.id);
    // Progress and claim.
    s = applyQuestProgress(s, [{ type: weekly.type, amount: weekly.target, faction: weekly.faction }]).save;
    const claimed = claimQuest(s, weekly.id, MON + DAY);
    expect(claimed.ok).toBe(true);
    if (!claimed.ok) return;
    const packsBefore = s.economy.packs[weekly.packs!.setId] ?? 0;
    expect(claimed.value.save.economy.packs[weekly.packs!.setId]).toBe(packsBefore + weekly.packs!.amount);
    // Next week: a new one.
    const next = refreshQuests(claimed.value.save, MON + 7 * DAY, createRng(3)).quests.weekly!;
    expect(next.id).not.toBe(weekly.id);
    expect(next.claimed).toBe(false);
  });

  it('keeps a finished but unclaimed weekly quest into the next week', () => {
    let s = fresh();
    const w = s.quests.weekly!;
    s = applyQuestProgress(s, [{ type: w.type, amount: w.target, faction: w.faction }]).save;
    expect(refreshQuests(s, MON + 8 * DAY, createRng(4)).quests.weekly!.id).toBe(w.id);
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
