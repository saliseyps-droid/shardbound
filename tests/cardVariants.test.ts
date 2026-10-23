import { describe, expect, it } from 'vitest';
import { createGame } from '@/engine';
import { act, filler, setEnergy } from './helpers';
import { deckVariants, playerSide } from '@/domain/matchSetup';
import { redactState } from '@/net/view';
import { sanitizeRemoteSide } from '@/net/lobby';
import type { CollectionState } from '@/domain/save';
import type { Deck } from '@/domain/decks';

const UNIT = 'neu_trail_hound';

function game(variants?: Record<string, { PRISMATIC?: number; FOIL?: number }>) {
  return createGame({
    seed: 1,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      { name: 'P0', avatar: 'a', deck: [UNIT, UNIT, UNIT, ...filler('token_recruit', 27)], variants, keepDeckOrder: true },
      { name: 'P1', avatar: 'b', deck: filler(), keepDeckOrder: true },
    ],
  }).state;
}

const collection = (cards: CollectionState['cards']): CollectionState => ({ cards, unseen: [] });

describe('card variants in decks and matches', () => {
  it('assigns the best owned variants to copies in the deck', () => {
    const deck = { cards: { [UNIT]: 2, token_recruit: 1 } } as unknown as Deck;
    expect(deckVariants(collection({ [UNIT]: { NORMAL: 1, FOIL: 0, PRISMATIC: 1, GILDED: 0 } }), deck)).toEqual({ [UNIT]: { PRISMATIC: 1 } });
    expect(deckVariants(collection({ [UNIT]: { NORMAL: 0, FOIL: 3, PRISMATIC: 1, GILDED: 0 } }), deck)).toEqual({ [UNIT]: { PRISMATIC: 1, FOIL: 1 } });
    expect(deckVariants(collection({ [UNIT]: { NORMAL: 0, FOIL: 0, PRISMATIC: 5, GILDED: 0 } }), deck)).toEqual({ [UNIT]: { PRISMATIC: 2 } });
    expect(deckVariants(collection({ [UNIT]: { NORMAL: 2, FOIL: 0, PRISMATIC: 0, GILDED: 0 } }), deck)).toEqual({});
  });

  it('puts the variants on the player side of an existing deck', () => {
    const deck = { id: 'd', name: 'x', heroFaction: 'EMBER', cards: { [UNIT]: 2 }, talents: [], favorite: false, createdAt: 0, updatedAt: 0 } as Deck;
    const profile = { username: 'me', avatar: 'a', cardBack: null, portraits: [], factionPortraits: {} } as never;
    expect(playerSide(profile, deck, collection({ [UNIT]: { NORMAL: 1, FOIL: 1, PRISMATIC: 0, GILDED: 0 } })).variants).toEqual({ [UNIT]: { FOIL: 1 } });
    expect(playerSide(profile, deck).variants).toBeUndefined();
  });

  it('gives deck cards their variant and keeps it when the unit is played', () => {
    let s = game({ [UNIT]: { PRISMATIC: 1, FOIL: 1 } });
    const units = s.players[0].deck.concat(s.players[0].hand).filter((c) => c.cardId === UNIT);
    expect(units.map((c) => c.variant ?? 'NORMAL').sort()).toEqual(['FOIL', 'NORMAL', 'PRISMATIC']);
    const prism = s.players[0].hand.find((c) => c.variant === 'PRISMATIC');
    expect(prism).toBeDefined();
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: prism!.uid });
    expect(s.players[0].board.find((u) => u.cardId === UNIT)?.variant).toBe('PRISMATIC');
  });

  it('never claims more variant copies than the deck holds', () => {
    const s = game({ [UNIT]: { PRISMATIC: 9 }, nope: { FOIL: 2 } });
    const all = s.players[0].deck.concat(s.players[0].hand);
    expect(all.filter((c) => c.variant === 'PRISMATIC')).toHaveLength(3);
    expect(all.filter((c) => c.cardId === 'token_recruit' && c.variant)).toHaveLength(0);
  });

  it('hides the variant of hidden cards from the opponent', () => {
    const s = game({ [UNIT]: { PRISMATIC: 3 } });
    const seen = redactState(s, 1).players[0];
    expect(seen.hand.concat(seen.deck).some((c) => c.variant)).toBe(false);
    expect(redactState(s, 0).players[0].hand.some((c) => c.variant === 'PRISMATIC')).toBe(true);
  });

  it('keeps a remote side variants, clamped to the deck', () => {
    const side = sanitizeRemoteSide({ name: 'g', avatar: 'a', deck: [UNIT, UNIT], variants: { [UNIT]: { PRISMATIC: 5, FOIL: -1 }, other: { FOIL: 1 }, bad: 'x' as never } });
    expect(side.variants).toEqual({ [UNIT]: { PRISMATIC: 2 } });
  });
});

describe('Gilded copies in the collection', () => {
  it('count as owned copies', async () => {
    const { ownedCopies } = await import('@/domain/save');
    expect(ownedCopies(collection({ [UNIT]: { NORMAL: 0, FOIL: 0, PRISMATIC: 0, GILDED: 2 } }), UNIT)).toBe(2);
  });

  it('cannot be crafted', async () => {
    const { craftCard } = await import('@/domain/economy');
    const { createNewSave } = await import('@/domain/newAccount');
    const base = createNewSave('A', 'flame', 1, 'p');
    const rich = { ...base, profile: { ...base.profile, essence: 1_000_000 } };
    const res = craftCard(rich, UNIT, 'GILDED', 1);
    expect(res.ok).toBe(false);
  });

  it('recycle for 16 times a normal copy', async () => {
    const { recycleValue } = await import('@/domain/economy');
    expect(recycleValue(UNIT, 'GILDED')).toBe(recycleValue(UNIT, 'NORMAL') * 16);
  });

  it('are kept first when surplus copies are recycled', async () => {
    const { surplusCopies } = await import('@/domain/economy');
    const { createNewSave } = await import('@/domain/newAccount');
    const base = createNewSave('A', 'flame', 1, 'p');
    const save = { ...base, collection: collection({ [UNIT]: { NORMAL: 1, FOIL: 0, PRISMATIC: 1, GILDED: 1 } }) };
    expect(surplusCopies(save, UNIT)).toEqual({ NORMAL: 1, FOIL: 0, PRISMATIC: 0, GILDED: 0 });
  });

  it('are zero in older saves', async () => {
    const { migrateSave } = await import('@/persistence/migrations');
    const { createNewSave } = await import('@/domain/newAccount');
    const raw = JSON.parse(JSON.stringify(createNewSave('A', 'flame', 1, 'p')));
    raw.collection.cards = { [UNIT]: { NORMAL: 2, FOIL: 1, PRISMATIC: 0 } };
    expect(migrateSave(raw).save.collection.cards[UNIT]).toEqual({ NORMAL: 2, FOIL: 1, PRISMATIC: 0, GILDED: 0 });
  });
});
