import { describe, expect, it } from 'vitest';
import { generatePack } from '@/domain/packs';
import { buyOffer, openPack } from '@/domain/economy';
import { createNewSave } from '@/domain/newAccount';
import { createRng } from '@/core/rng';
import { getCard } from '@/data/cards';
import { GILDED_PACK, SHOP_OFFERS } from '@/config/economy';

const offer = () => SHOP_OFFERS.find((o) => o.setId === 'GILDED')!;
const withGold = (gold: number) => {
  const base = createNewSave('A', 'flame', 1, 'p');
  return { ...base, profile: { ...base.profile, gold } };
};

describe('Forbidden Spellbook (Gilded pack)', () => {
  it('holds five Gilded cards from every set', () => {
    const sets = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const p = generatePack('GILDED', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(i));
      expect(p.cards).toHaveLength(5);
      for (const c of p.cards) {
        expect(c.variant).toBe('GILDED');
        expect(getCard(c.cardId)!.rewardOnly).toBeFalsy();
        sets.add(getCard(c.cardId)!.set);
      }
    }
    expect([...sets].sort()).toEqual(['ABYSS', 'CORE', 'DEEP', 'DRAGON', 'RECKONING']);
  });

  it('guarantees a Legendary within ten packs', () => {
    let pity = { EPIC: 0, LEGENDARY: 0 };
    let longest = 0;
    let since = 0;
    for (let i = 0; i < 300; i++) {
      const p = generatePack('GILDED', pity, () => 0, createRng(1000 + i));
      pity = p.pity;
      since = p.cards.some((c) => c.rarity === 'LEGENDARY') ? 0 : since + 1;
      longest = Math.max(longest, since);
    }
    expect(GILDED_PACK.pityLegendary).toBe(10);
    expect(longest).toBeLessThan(GILDED_PACK.pityLegendary);
  });

  it('is bought for 2500 Gold and opened from the inventory', () => {
    expect(offer().price).toBe(2500);
    expect(GILDED_PACK.name).toBe('Forbidden Spellbook');
    const bought = buyOffer(withGold(3000), offer().id, 1);
    if (!bought.ok) throw new Error(bought.error);
    expect(bought.value.profile.gold).toBe(500);
    expect(bought.value.economy.packs.GILDED).toBe(1);
    const opened = openPack(bought.value, 'GILDED', createRng(3));
    if (!opened.ok) throw new Error(opened.error);
    expect(opened.value.save.economy.packs.GILDED).toBe(0);
    for (const c of opened.value.cards) expect(opened.value.save.collection.cards[c.cardId].GILDED).toBeGreaterThan(0);
  });

  it('is refused with less than 2500 Gold', () => {
    const res = buyOffer(withGold(2499), offer().id, 1);
    expect(res.ok).toBe(false);
  });

  it('normal set packs never hold Gilded cards', () => {
    for (let i = 0; i < 500; i++) {
      const p = generatePack('CORE', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(i));
      expect(p.cards.some((c) => c.variant === 'GILDED')).toBe(false);
    }
  });
});
