import { describe, expect, it } from 'vitest';
import { autoBuildDeck, canAddCard, deckSize, deckStats, validateDeck, type Deck } from '@/domain/decks';
import { cardsBy, collectibleCards } from '@/data/cards';
import { createNewSave } from '@/domain/newAccount';
import { ownedCopies } from '@/domain/save';
import { PLAYABLE_FACTIONS } from '@/game/types';

const deck = (cards: Record<string, number>, heroFaction: Deck['heroFaction'] = 'EMBER'): Deck => ({
  id: 'd', name: 'Test', heroFaction, cards, favorite: false, createdAt: 0, updatedAt: 0,
});

describe('deck validation', () => {
  it('starter decks are valid and owned', () => {
    const save = createNewSave('T', 'a', 0, 'p');
    expect(save.decks.length).toBe(3);
    for (const d of save.decks) {
      expect(validateDeck(d, (id) => ownedCopies(save.collection, id)), d.name).toEqual([]);
    }
  });

  it('requires exactly 30 cards', () => {
    const issues = validateDeck(deck({ emb_kindling_imp: 2 }));
    expect(issues.find((i) => i.code === 'SIZE')?.message).toBe('2 / 30 cards');
  });

  it('limits copies of normal and legendary cards', () => {
    const legendary = cardsBy({ faction: 'EMBER', rarity: 'LEGENDARY' })[0];
    const issues = validateDeck(deck({ emb_kindling_imp: 3, [legendary.id]: 2 }));
    expect(issues.some((i) => i.code === 'COPIES')).toBe(true);
    expect(issues.some((i) => i.code === 'LEGENDARY_COPIES')).toBe(true);
  });

  it('allows only the Warden faction and Neutral cards', () => {
    const e = cardsBy({ faction: 'EMBER' })[0].id;
    const n = cardsBy({ faction: 'NEUTRAL' })[0].id;
    const v = cardsBy({ faction: 'VERDANT' })[0].id;
    expect(validateDeck(deck({ [e]: 1, [n]: 1 })).some((i) => i.code === 'FACTIONS')).toBe(false);
    const issues = validateDeck(deck({ [e]: 1, [v]: 1 }));
    expect(issues.find((i) => i.code === 'FACTIONS')?.message).toMatch(/only Cinder Legion and Neutral/);
  });

  it('flags cards not owned', () => {
    const issues = validateDeck(deck({ emb_kindling_imp: 2 }), () => 1);
    expect(issues.some((i) => i.code === 'NOT_OWNED')).toBe(true);
  });

  it('canAddCard explains why a card cannot be added', () => {
    const d = deck({ emb_kindling_imp: 2 });
    expect(canAddCard(d, 'emb_kindling_imp', 5)).toMatch(/Max/);
    expect(canAddCard(d, 'emb_flame_jolt', 0)).toBe('Not enough copies owned');
    expect(canAddCard(d, 'emb_flame_jolt', 2)).toBeNull();
    expect(canAddCard(d, cardsBy({ faction: 'TIDE' })[0].id, 2)).toBe('Only Cinder Legion and Neutral cards');
    expect(canAddCard(d, cardsBy({ faction: 'NEUTRAL' })[0].id, 2)).toBeNull();
  });

  it('auto-builds valid decks for every faction', () => {
    for (const f of PLAYABLE_FACTIONS) {
      const cards = autoBuildDeck({ heroFaction: f, owned: null, seed: 1 });
      expect(deckSize({ cards })).toBe(30);
      expect(validateDeck(deck(cards, f))).toEqual([]);
    }
  });

  it('auto-build respects ownership', () => {
    const save = createNewSave('T', 'a', 0, 'p');
    const cards = autoBuildDeck({ heroFaction: 'IRON', owned: (id) => ownedCopies(save.collection, id), seed: 2 });
    expect(validateDeck(deck(cards, 'IRON'), (id) => ownedCopies(save.collection, id))).toEqual([]);
  });

  it('computes mana curve and type stats', () => {
    const stats = deckStats({ cards: { emb_kindling_imp: 2, emb_flame_jolt: 1 } });
    expect(stats.curve[1]).toBe(3);
    expect(stats.types.UNIT).toBe(2);
    expect(stats.types.SPELL).toBe(1);
  });

  it('the card pool reaches the content target', () => {
    expect(collectibleCards().length).toBeGreaterThanOrEqual(150);
  });
});
