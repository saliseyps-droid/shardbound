import { describe, expect, it } from 'vitest';
import { CRAFTING, SHOP_OFFERS, STARTING_CURRENCY } from '@/config/economy';
import { createRng } from '@/core/rng';
import { buyOffer, craftCard, openPack, recycleAllSurplus, recycleCard, surplusCopies } from '@/domain/economy';
import { createNewSave } from '@/domain/newAccount';
import { ownedCopies } from '@/domain/save';
import { cardsBy } from '@/data/cards';

const fresh = () => createNewSave('Tester', 'flame', Date.parse('2026-01-05T10:00:00'), 'p1');

describe('shop', () => {
  it('buying a pack reduces gold and adds an unopened pack', () => {
    const save = fresh();
    const offer = SHOP_OFFERS.find((o) => o.id === 'core_1')!;
    const res = buyOffer(save, offer.id, 0);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.profile.gold).toBe(STARTING_CURRENCY.gold - offer.price);
    expect(res.value.economy.packs.CORE).toBe((save.economy.packs.CORE ?? 0) + 1);
  });

  it('rejects purchases with insufficient gold', () => {
    const save = { ...fresh(), profile: { ...fresh().profile, gold: 50 } };
    const res = buyOffer(save, 'core_1', 0);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('Not enough Gold.');
  });

  it('opening a pack consumes it and adds cards to the collection', () => {
    const save = fresh();
    const before = Object.values(save.collection.cards).reduce((a, v) => a + v.NORMAL + v.FOIL + v.PRISMATIC, 0);
    const res = openPack(save, 'CORE', createRng(1));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const after = Object.values(res.value.save.collection.cards).reduce((a, v) => a + v.NORMAL + v.FOIL + v.PRISMATIC, 0);
    expect(after - before).toBe(5);
    expect(res.value.save.economy.packs.CORE).toBe((save.economy.packs.CORE ?? 0) - 1);
    expect(res.value.save.profile.packsOpened).toBe(1);
    for (const c of res.value.cards) expect(ownedCopies(res.value.save.collection, c.cardId)).toBeGreaterThan(0);
  });

  it('cannot open packs you do not have', () => {
    const save = { ...fresh(), economy: { packs: {}, pity: {} } };
    expect(openPack(save, 'CORE', createRng(1)).ok).toBe(false);
  });
});

describe('crafting and recycling', () => {
  const epic = cardsBy({ rarity: 'EPIC' })[0];

  it('crafts a card for its configured essence cost', () => {
    const save = { ...fresh(), profile: { ...fresh().profile, essence: 1000 } };
    const res = craftCard(save, epic.id, 'NORMAL', 0);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.profile.essence).toBe(1000 - CRAFTING.craft.EPIC);
    expect(ownedCopies(res.value.collection, epic.id)).toBe(1);
  });

  it('refuses crafting without enough essence', () => {
    const save = { ...fresh(), profile: { ...fresh().profile, essence: 10 } };
    expect(craftCard(save, epic.id, 'NORMAL', 0).ok).toBe(false);
  });

  it('recycles cards for essence and trims decks that relied on them', () => {
    const save = fresh();
    const deck = save.decks[0];
    const cardId = Object.keys(deck.cards)[0];
    const res = recycleCard(save, cardId, 'NORMAL', 2);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.essence).toBe(2 * CRAFTING.recycle.COMMON);
    expect(ownedCopies(res.value.save.collection, cardId)).toBe(0);
    expect(res.value.save.decks[0].cards[cardId]).toBeUndefined();
  });

  it('cannot recycle more copies than owned', () => {
    expect(recycleCard(fresh(), epic.id, 'NORMAL', 1).ok).toBe(false);
  });

  it('identifies and recycles surplus copies only', () => {
    let save = fresh();
    const id = Object.keys(save.collection.cards)[0];
    save = { ...save, collection: { ...save.collection, cards: { ...save.collection.cards, [id]: { NORMAL: 4, FOIL: 1, PRISMATIC: 0 } } } };
    const surplus = surplusCopies(save, id);
    // Keep the foil (cosmetic priority) + 1 normal; 3 normals surplus.
    expect(surplus).toEqual({ NORMAL: 3, FOIL: 0, PRISMATIC: 0 });
    const res = recycleAllSurplus(save);
    expect(res.cards).toBe(3);
    expect(ownedCopies(res.save.collection, id)).toBe(2);
  });

  it('foil variants cost more to craft but are identical in play', () => {
    const save = { ...fresh(), profile: { ...fresh().profile, essence: 5000 } };
    const res = craftCard(save, epic.id, 'FOIL', 0);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.profile.essence).toBe(5000 - CRAFTING.craft.EPIC * CRAFTING.variantMultiplier.FOIL);
  });
});
