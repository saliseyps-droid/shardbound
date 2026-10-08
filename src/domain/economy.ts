import { CRAFTING, SHOP_BONUS_PACKS, SHOP_OFFERS, packInfo, type PackId } from '@/config/economy';
import { getCardBack } from '@/data/cardBacks';
import { getCard } from '@/data/cards';
import type { RngState } from '@/core/rng';
import { err, ok, type Result } from '@/core/utils';
import type { Variant } from '@/game/types';
import { VARIANTS } from '@/game/types';
import { maxCopiesFor } from './decks';
import { generatePack, type PackCard } from './packs';
import { addCards, emptyVariants, ownedCopies, pushReward, type GameSave } from './save';

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export function buyOffer(save: GameSave, offerId: string, now: number): Result<GameSave> {
  const offer = SHOP_OFFERS.find((o) => o.id === offerId);
  if (!offer) return err('This offer is no longer available.');
  if (save.profile.gold < offer.price) return err('Not enough Gold.');
  const amount = offer.packs + (SHOP_BONUS_PACKS[offer.id] ?? 0);
  const packs = { ...save.economy.packs, [offer.setId]: (save.economy.packs[offer.setId] ?? 0) + amount };
  let next: GameSave = { ...save, profile: { ...save.profile, gold: save.profile.gold - offer.price }, economy: { ...save.economy, packs } };
  const setId = offer.setId;
  next = setId === 'PRISMATIC' || setId === 'PRISMATIC_LEGEND'
    ? pushReward(next, { source: `Purchased ${packInfo(setId).name}` }, now)
    : pushReward(next, { source: `Purchased ${amount} pack${amount > 1 ? 's' : ''}`, packs: { setId, amount } }, now);
  return ok(next);
}

/** Buys a cosmetic card back with Gold. */
export function buyCardBack(save: GameSave, backId: string, now: number): Result<GameSave> {
  const back = getCardBack(backId);
  if (!back) return err('This card back is not available.');
  if (save.profile.cardBacks.includes(backId)) return err('You already own this card back.');
  if (save.profile.gold < back.price) return err('Not enough Gold.');
  const next: GameSave = { ...save, profile: { ...save.profile, gold: save.profile.gold - back.price, cardBacks: [...save.profile.cardBacks, backId] } };
  return ok(pushReward(next, { source: `Purchased the ${back.name} card back` }, now));
}

export function equipCardBack(save: GameSave, backId: string): Result<GameSave> {
  if (!save.profile.cardBacks.includes(backId)) return err('You do not own this card back yet.');
  return ok({ ...save, profile: { ...save.profile, cardBack: backId } });
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export function openPack(save: GameSave, setId: PackId, rng: RngState): Result<{ save: GameSave; cards: PackCard[] }> {
  const available = save.economy.packs[setId] ?? 0;
  if (available <= 0) return err('You have no unopened packs of this set.');
  const pity = save.economy.pity[setId] ?? { EPIC: 0, LEGENDARY: 0 };
  const result = generatePack(setId, pity, (id) => ownedCopies(save.collection, id), rng);
  const next: GameSave = {
    ...save,
    collection: addCards(save.collection, result.cards),
    economy: {
      ...save.economy,
      packs: { ...save.economy.packs, [setId]: available - 1 },
      pity: { ...save.economy.pity, [setId]: result.pity },
    },
    profile: { ...save.profile, packsOpened: save.profile.packsOpened + 1 },
  };
  return ok({ save: next, cards: result.cards });
}

// ---------------------------------------------------------------------------
// Crafting & recycling
// ---------------------------------------------------------------------------

export function craftCost(cardId: string, variant: Variant = 'NORMAL'): number {
  const card = getCard(cardId);
  if (!card) return Infinity;
  return (card.craftingCost ?? CRAFTING.craft[card.rarity]) * CRAFTING.variantMultiplier[variant];
}

export function recycleValue(cardId: string, variant: Variant = 'NORMAL'): number {
  const card = getCard(cardId);
  if (!card) return 0;
  return (card.disenchantValue ?? CRAFTING.recycle[card.rarity]) * CRAFTING.variantMultiplier[variant];
}

export function craftCard(save: GameSave, cardId: string, variant: Variant, now: number): Result<GameSave> {
  const card = getCard(cardId);
  if (!card || !card.collectible) return err('This card cannot be crafted.');
  const cost = craftCost(cardId, variant);
  if (save.profile.essence < cost) return err('Not enough Essence.');
  let next: GameSave = {
    ...save,
    profile: { ...save.profile, essence: save.profile.essence - cost, cardsCrafted: save.profile.cardsCrafted + 1 },
    collection: addCards(save.collection, [{ cardId, variant }]),
  };
  next = pushReward(next, { source: `Crafted ${card.name}`, cards: [{ cardId, variant }] }, now);
  return ok(next);
}

export function recycleCard(save: GameSave, cardId: string, variant: Variant, count = 1): Result<{ save: GameSave; essence: number }> {
  const card = getCard(cardId);
  if (!card) return err('Unknown card.');
  const owned = save.collection.cards[cardId]?.[variant] ?? 0;
  if (count <= 0 || owned < count) return err('You do not own enough copies to recycle.');
  const essence = recycleValue(cardId, variant) * count;
  const counts = { ...(save.collection.cards[cardId] ?? emptyVariants()), [variant]: owned - count };
  const next: GameSave = {
    ...save,
    profile: { ...save.profile, essence: save.profile.essence + essence, cardsRecycled: save.profile.cardsRecycled + count },
    collection: { ...save.collection, cards: { ...save.collection.cards, [cardId]: counts } },
  };
  // Remove recycled cards from decks if they are no longer owned in sufficient quantity.
  const total = ownedCopies(next.collection, cardId);
  const decks = next.decks.map((d) => {
    const inDeck = d.cards[cardId] ?? 0;
    if (inDeck <= total) return d;
    const cards = { ...d.cards };
    if (total <= 0) delete cards[cardId];
    else cards[cardId] = total;
    return { ...d, cards, updatedAt: Date.now() };
  });
  return ok({ save: { ...next, decks }, essence });
}

/** Copies beyond the maximum playable count, per variant (prismatic kept first, normal recycled first). */
export function surplusCopies(save: GameSave, cardId: string): Record<Variant, number> {
  const card = getCard(cardId);
  const counts = save.collection.cards[cardId] ?? emptyVariants();
  const out: Record<Variant, number> = emptyVariants();
  if (!card) return out;
  let keep = maxCopiesFor(card);
  for (const v of [...VARIANTS].reverse()) {
    const kept = Math.min(keep, counts[v]);
    keep -= kept;
    out[v] = counts[v] - kept;
  }
  return out;
}

export function totalSurplusValue(save: GameSave): { cards: number; essence: number } {
  let cards = 0;
  let essence = 0;
  for (const id of Object.keys(save.collection.cards)) {
    const s = surplusCopies(save, id);
    for (const v of VARIANTS) {
      cards += s[v];
      essence += s[v] * recycleValue(id, v);
    }
  }
  return { cards, essence };
}

export function recycleAllSurplus(save: GameSave): { save: GameSave; essence: number; cards: number } {
  let next = save;
  let essence = 0;
  let cards = 0;
  for (const id of Object.keys(save.collection.cards)) {
    const surplus = surplusCopies(next, id);
    for (const v of VARIANTS) {
      if (surplus[v] <= 0) continue;
      const res = recycleCard(next, id, v, surplus[v]);
      if (res.ok) {
        next = res.value.save;
        essence += res.value.essence;
        cards += surplus[v];
      }
    }
  }
  return { save: next, essence, cards };
}
