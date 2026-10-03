import { describe, expect, it } from 'vitest';
import { BUNDLES } from '@/config/economy';
import { buyBundle, bundlePrice, bundleValue } from '@/domain/bundles';
import { createNewSave } from '@/domain/newAccount';
import { migrateSave } from '@/persistence/migrations';
import { CURRENT_SAVE_VERSION } from '@/domain/save';

const rich = (gold = 5000) => {
  const s = createNewSave('Tester', 'compass', 0, 'p1');
  return { ...s, profile: { ...s.profile, gold } };
};
const bundle = BUNDLES.find((b) => b.setId === 'ABYSS')!;

describe('set bundle', () => {
  it('holds packs of the newest set, a card back and a portrait for less than buying them apart', () => {
    expect(bundle.packs).toBeGreaterThan(0);
    expect(bundle.cardBack).toBeTruthy();
    expect(bundle.portrait).toBeTruthy();
    expect(bundlePrice(rich(), bundle)).toBeLessThan(bundleValue(rich(), bundle));
  });

  it('grants everything once and can only be bought once', () => {
    const s = rich();
    const price = bundlePrice(s, bundle);
    const res = buyBundle(s, bundle.id, 1);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const p = res.value.profile;
    expect(p.gold).toBe(5000 - price);
    expect(p.cardBacks).toContain(bundle.cardBack);
    expect(p.portraits).toContain(bundle.portrait);
    expect(res.value.economy.packs.ABYSS ?? 0).toBe((s.economy.packs.ABYSS ?? 0) + bundle.packs);
    expect(buyBundle(res.value, bundle.id, 2).ok).toBe(false);
  });

  it('is cheaper when you already own the card back or the portrait, and needs enough Gold', () => {
    const s = rich();
    const owning = { ...s, profile: { ...s.profile, cardBacks: [...s.profile.cardBacks, bundle.cardBack!] } };
    expect(bundlePrice(owning, bundle)).toBeLessThan(bundlePrice(s, bundle));
    expect(buyBundle(rich(100), bundle.id, 1).ok).toBe(false);
  });

  it('old saves start with no bundles bought', () => {
    const save = migrateSave({ saveVersion: CURRENT_SAVE_VERSION, profile: { username: 'Old' }, decks: [] }).save;
    expect(save.profile.bundlesBought).toEqual([]);
  });
});
