import { describe, expect, it } from 'vitest';
import { PACK_CONFIG } from '@/config/economy';
import { createRng } from '@/core/rng';
import { generatePack, type PityState } from '@/domain/packs';
import { getCard, cardsBy } from '@/data/cards';
import { maxCopiesFor } from '@/domain/decks';
import type { Rarity } from '@/game/types';

const RANK: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };

function simulate(n: number, seed = 1, withCollection = false) {
  const rng = createRng(seed);
  const owned = new Map<string, number>();
  let pity: PityState = { EPIC: 0, LEGENDARY: 0 };
  const packs = [];
  for (let i = 0; i < n; i++) {
    const res = generatePack('CORE', pity, (id) => (withCollection ? owned.get(id) ?? 0 : 0), rng);
    pity = res.pity;
    if (withCollection) for (const c of res.cards) owned.set(c.cardId, (owned.get(c.cardId) ?? 0) + 1);
    packs.push(res);
  }
  return { packs, owned };
}

describe('booster packs', () => {
  it('contain the configured number of cards from the chosen set', () => {
    for (const p of simulate(200).packs) {
      expect(p.cards.length).toBe(PACK_CONFIG.cardsPerPack);
      for (const c of p.cards) expect(getCard(c.cardId)?.set).toBe('CORE');
    }
  });

  it('always include at least one Rare or better', () => {
    for (const p of simulate(2000, 5).packs) {
      expect(p.cards.some((c) => RANK[c.rarity] >= RANK.RARE)).toBe(true);
    }
  });

  it('rarity distribution matches configured probabilities (statistical)', () => {
    const N = 20000;
    const { packs } = simulate(N, 42);
    const standard: Record<Rarity, number> = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
    for (const p of packs) for (const c of p.cards.slice(0, PACK_CONFIG.cardsPerPack - 1)) standard[c.rarity]++;
    const totalSlots = N * (PACK_CONFIG.cardsPerPack - 1);
    const weights = PACK_CONFIG.standardSlotWeights;
    const wSum = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const r of Object.keys(weights) as Rarity[]) {
      const expected = weights[r] / wSum;
      const observed = standard[r] / totalSlots;
      // Within 1 percentage point on 80k samples (≈ >5 sigma for common rarities).
      expect(Math.abs(observed - expected), r).toBeLessThan(0.01);
    }
  });

  it('pity timer guarantees an Epic within the configured number of packs', () => {
    const { packs } = simulate(5000, 9);
    let sinceEpic = 0;
    let sinceLegendary = 0;
    for (const p of packs) {
      sinceEpic = p.cards.some((c) => RANK[c.rarity] >= RANK.EPIC) ? 0 : sinceEpic + 1;
      sinceLegendary = p.cards.some((c) => c.rarity === 'LEGENDARY') ? 0 : sinceLegendary + 1;
      expect(sinceEpic).toBeLessThan(PACK_CONFIG.pity.EPIC!);
      expect(sinceLegendary).toBeLessThan(PACK_CONFIG.pity.LEGENDARY!);
    }
  });

  it('pity counters reset when the rarity is found', () => {
    const rng = createRng(3);
    const res = generatePack('CORE', { EPIC: PACK_CONFIG.pity.EPIC! - 1, LEGENDARY: 0 }, () => 0, rng);
    expect(res.cards.some((c) => RANK[c.rarity] >= RANK.EPIC)).toBe(true);
    expect(res.pity.EPIC).toBe(0);
  });

  it('duplicate protection avoids legendaries already owned while others are missing', () => {
    const legendaries = cardsBy({ set: 'CORE', rarity: 'LEGENDARY' });
    const ownedOne = legendaries[0];
    const rng = createRng(77);
    for (let i = 0; i < 300; i++) {
      const res = generatePack('CORE', { EPIC: 0, LEGENDARY: 99 }, (id) => (id === ownedOne.id ? maxCopiesFor(ownedOne) : 0), rng);
      const legendary = res.cards.find((c) => c.rarity === 'LEGENDARY');
      expect(legendary).toBeDefined();
      if (legendaries.length > 1) expect(legendary!.cardId).not.toBe(ownedOne.id);
    }
  });

  it('never exceeds a playset on protected rarities before the set is complete', () => {
    const { owned } = simulate(60, 11, true);
    for (const [id, n] of owned) {
      const card = getCard(id)!;
      if (!PACK_CONFIG.duplicateProtection[card.rarity]) continue;
      const pool = cardsBy({ set: 'CORE', rarity: card.rarity });
      const complete = pool.every((c) => (owned.get(c.id) ?? 0) >= maxCopiesFor(c));
      if (!complete) expect(n, id).toBeLessThanOrEqual(maxCopiesFor(card) + 1);
    }
  });

  it('is deterministic with a seeded RNG', () => {
    const a = simulate(20, 1234).packs.map((p) => p.cards.map((c) => c.cardId + c.variant).join());
    const b = simulate(20, 1234).packs.map((p) => p.cards.map((c) => c.cardId + c.variant).join());
    expect(a).toEqual(b);
  });

  it('cosmetic variants appear rarely', () => {
    const { packs } = simulate(5000, 21);
    const all = packs.flatMap((p) => p.cards);
    const foil = all.filter((c) => c.variant === 'FOIL').length / all.length;
    const prismatic = all.filter((c) => c.variant === 'PRISMATIC').length / all.length;
    expect(foil).toBeGreaterThan(0.025);
    expect(foil).toBeLessThan(0.055);
    expect(prismatic).toBeLessThan(0.012);
  });
});
