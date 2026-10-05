import type { Rarity, SetId, Variant } from '@/game/types';

export const STARTING_CURRENCY = {
  gold: 500,
  essence: 100,
  packs: { CORE: 2 } as Partial<Record<SetId, number>>,
};

export interface ShopOffer {
  id: string;
  setId: SetId;
  packs: number;
  price: number;
  label: string;
  badge?: string;
}

export const SHOP_OFFERS: ShopOffer[] = [
  { id: 'core_1', setId: 'CORE', packs: 1, price: 100, label: '1 Pack' },
  { id: 'core_5', setId: 'CORE', packs: 5, price: 450, label: '5 Packs', badge: 'Save 10%' },
  { id: 'core_10', setId: 'CORE', packs: 10, price: 1000, label: '10 Packs', badge: '+2 Bonus Packs' },
  { id: 'deep_1', setId: 'DEEP', packs: 1, price: 100, label: '1 Pack' },
  { id: 'deep_5', setId: 'DEEP', packs: 5, price: 450, label: '5 Packs', badge: 'Save 10%' },
  { id: 'deep_10', setId: 'DEEP', packs: 10, price: 1000, label: '10 Packs', badge: '+2 Bonus Packs' },
  { id: 'abyss_1', setId: 'ABYSS', packs: 1, price: 100, label: '1 Pack' },
  { id: 'abyss_5', setId: 'ABYSS', packs: 5, price: 450, label: '5 Packs', badge: 'Save 10%' },
  { id: 'abyss_10', setId: 'ABYSS', packs: 10, price: 1000, label: '10 Packs', badge: '+2 Bonus Packs' },
  { id: 'dragon_1', setId: 'DRAGON', packs: 1, price: 100, label: '1 Pack' },
  { id: 'dragon_5', setId: 'DRAGON', packs: 5, price: 450, label: '5 Packs', badge: 'Save 10%' },
  { id: 'dragon_10', setId: 'DRAGON', packs: 10, price: 1000, label: '10 Packs', badge: '+2 Bonus Packs' },
];

/** One-time bundles for a set: packs plus cosmetics for less than buying them apart. */
export interface Bundle {
  id: string;
  setId: SetId;
  name: string;
  packs: number;
  cardBack?: string;
  portrait?: string;
  /** Share taken off the value of what the player still gets (0.3 = 30% off). */
  discount: number;
}

export const BUNDLES: Bundle[] = [
  { id: 'dragon_bundle', setId: 'DRAGON', name: 'Dragon Realm Bundle', packs: 10, cardBack: 'crimson_dragon', portrait: 'ember_black_drake', discount: 0.3 },
  { id: 'abyss_bundle', setId: 'ABYSS', name: 'Legions of Shadow Bundle', packs: 10, cardBack: 'hollow_vortex', portrait: 'tide_frost_lich', discount: 0.3 },
];

/** Offers with a bonus badge grant this many extra packs (10 + 2 for 1000 Gold ≈ 83 Gold/pack, the best deal). */
export const SHOP_BONUS_PACKS: Record<string, number> = { core_10: 2, deep_10: 2, abyss_10: 2, dragon_10: 2 };

export const PACK_CONFIG = {
  cardsPerPack: 5,
  /** Slots 1..(n-1) roll on the standard table. */
  standardSlotWeights: { COMMON: 72, RARE: 22.5, EPIC: 4.5, LEGENDARY: 1 } as Record<Rarity, number>,
  /** The final slot is always Rare or better. */
  guaranteedSlotWeights: { COMMON: 0, RARE: 80, EPIC: 16, LEGENDARY: 4 } as Record<Rarity, number>,
  /** Pity: after this many consecutive packs without the rarity, the guaranteed slot is upgraded. */
  pity: { EPIC: 10, LEGENDARY: 30 } as Partial<Record<Rarity, number>>,
  /** When true, new cards of this rarity prefer ones not yet owned at max copies. */
  duplicateProtection: { COMMON: false, RARE: true, EPIC: true, LEGENDARY: true } as Record<Rarity, boolean>,
  variantWeights: { NORMAL: 95.5, FOIL: 4, PRISMATIC: 0.5 } as Record<Variant, number>,
};

export const CRAFTING = {
  craft: { COMMON: 40, RARE: 100, EPIC: 400, LEGENDARY: 1600 } as Record<Rarity, number>,
  recycle: { COMMON: 5, RARE: 20, EPIC: 100, LEGENDARY: 400 } as Record<Rarity, number>,
  /** Cosmetic variants cost/return more but never change gameplay. */
  variantMultiplier: { NORMAL: 1, FOIL: 4, PRISMATIC: 8 } as Record<Variant, number>,
  /** Rarities that require explicit confirmation before recycling. */
  confirmRecycle: ['RARE', 'EPIC', 'LEGENDARY'] as Rarity[],
};

export const SET_INFO: Record<SetId, { name: string; tagline: string; releaseOrder: number }> = {
  CORE: { name: 'Kingdoms at War', tagline: 'Banners rise, crowns clash. The Wardens take the field.', releaseOrder: 1 },
  DEEP: { name: 'Fantasy Realms', tagline: 'Dragons wake in the realms beyond the map.', releaseOrder: 2 },
  ABYSS: { name: 'Legions of Shadow', tagline: 'Knights of every banner, marching for the shadow.', releaseOrder: 3 },
  DRAGON: { name: 'Dragon Realm', tagline: 'Dragons take the sky, and their knights and the Fae ride with them.', releaseOrder: 4 },
};
