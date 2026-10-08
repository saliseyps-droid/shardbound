import { describe, expect, it } from 'vitest';
import { generatePack } from '@/domain/packs';
import { buyOffer, openPack } from '@/domain/economy';
import { createNewSave } from '@/domain/newAccount';
import { createRng } from '@/core/rng';
import { getCard } from '@/data/cards';
import { PRISMATIC_PACK, SHOP_OFFERS } from '@/config/economy';

describe('Prismatic pack', () => {
  it('holds five Prismatic cards from every set', () => {
    const sets = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const p = generatePack('PRISMATIC', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(i));
      expect(p.cards).toHaveLength(5);
      for (const c of p.cards) {
        expect(c.variant).toBe('PRISMATIC');
        sets.add(getCard(c.cardId)!.set);
      }
    }
    expect([...sets].sort()).toEqual(['ABYSS', 'CORE', 'DEEP', 'DRAGON']);
  });

  it('guarantees a Legendary within ten packs', () => {
    let pity = { EPIC: 0, LEGENDARY: 0 };
    let longest = 0;
    let since = 0;
    for (let i = 0; i < 300; i++) {
      const p = generatePack('PRISMATIC', pity, () => 0, createRng(1000 + i));
      pity = p.pity;
      since = p.cards.some((c) => c.rarity === 'LEGENDARY') ? 0 : since + 1;
      longest = Math.max(longest, since);
    }
    expect(longest).toBeLessThan(PRISMATIC_PACK.pityLegendary);
  });

  it('is bought for 1000 Gold and opened from the inventory', () => {
    const offer = SHOP_OFFERS.find((o) => o.setId === 'PRISMATIC')!;
    expect(offer.price).toBe(1000);
    const base = createNewSave('A', 'flame', 1, 'p');
    const rich = { ...base, profile: { ...base.profile, gold: 1500 } };
    const bought = buyOffer(rich, offer.id, 1);
    if (!bought.ok) throw new Error(bought.error);
    expect(bought.value.profile.gold).toBe(500);
    expect(bought.value.economy.packs.PRISMATIC).toBe(1);
    const opened = openPack(bought.value, 'PRISMATIC', createRng(3));
    if (!opened.ok) throw new Error(opened.error);
    expect(opened.value.save.economy.packs.PRISMATIC).toBe(0);
    for (const c of opened.value.cards) expect(opened.value.save.collection.cards[c.cardId].PRISMATIC).toBeGreaterThan(0);
  });

  it('the Prismatic Legend holds one Prismatic Legendary, preferring ones you do not own', () => {
    const owned = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const p = generatePack('PRISMATIC_LEGEND', { EPIC: 0, LEGENDARY: 0 }, (id) => (owned.has(id) ? 1 : 0), createRng(500 + i));
      expect(p.cards).toHaveLength(1);
      expect(p.cards[0]).toMatchObject({ rarity: 'LEGENDARY', variant: 'PRISMATIC' });
      owned.add(p.cards[0].cardId);
    }
    expect(owned.size).toBeGreaterThan(15);
    expect(SHOP_OFFERS.find((o) => o.setId === 'PRISMATIC_LEGEND')?.price).toBe(5000);
  });
});
