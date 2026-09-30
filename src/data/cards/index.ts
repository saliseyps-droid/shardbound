import type { CardDefinition, Faction, Rarity, SetId } from '@/game/types';
import { validateCardDefinition } from '@/game/validateCard';
import { describeCard } from '@/game/describe';
import { TOKEN_CARDS } from './tokens';
import { EMBER_CARDS } from './ember';
import { VERDANT_CARDS } from './verdant';
import { IRON_CARDS } from './iron';
import { ASTRAL_CARDS } from './astral';
import { VOID_CARDS } from './void';
import { TIDE_CARDS } from './tide';
import { NEUTRAL_CARDS } from './neutral';

const RAW: CardDefinition[] = [
  ...TOKEN_CARDS,
  ...EMBER_CARDS,
  ...VERDANT_CARDS,
  ...IRON_CARDS,
  ...ASTRAL_CARDS,
  ...VOID_CARDS,
  ...TIDE_CARDS,
  ...NEUTRAL_CARDS,
];

export const CARD_LOAD_ERRORS: string[] = [];

function buildRegistry(): Map<string, CardDefinition> {
  const ids = new Set(RAW.map((c) => c?.id).filter(Boolean));
  const rawById = new Map(RAW.map((c) => [c.id, c]));
  const lookup = (id: string) => rawById.get(id);
  const map = new Map<string, CardDefinition>();
  for (const card of RAW) {
    const errors = validateCardDefinition(card, ids);
    if (map.has(card.id)) errors.push(`Duplicate card id ${card.id}`);
    if (errors.length > 0) {
      CARD_LOAD_ERRORS.push(...errors);
      continue;
    }
    map.set(card.id, { ...card, description: card.description ?? describeCard(card, lookup) });
  }
  if (CARD_LOAD_ERRORS.length > 0 && typeof console !== 'undefined') {
    console.warn('[cards] Some card definitions were rejected:', CARD_LOAD_ERRORS);
  }
  return map;
}

const REGISTRY = buildRegistry();
const ALL = [...REGISTRY.values()];
const COLLECTIBLE = ALL.filter((c) => c.collectible);

export function getCard(id: string): CardDefinition | undefined {
  return REGISTRY.get(id);
}

/** Placeholder used when a save references a card that no longer exists. */
export const UNKNOWN_CARD: CardDefinition = {
  id: '__unknown__',
  name: 'Lost Shard',
  description: 'This card could not be found.',
  cardType: 'UNIT',
  faction: 'NEUTRAL',
  rarity: 'COMMON',
  manaCost: 0,
  attack: 0,
  health: 1,
  set: 'CORE',
  collectible: false,
};

export function getCardSafe(id: string): CardDefinition {
  return REGISTRY.get(id) ?? UNKNOWN_CARD;
}

export function hasCard(id: string): boolean {
  return REGISTRY.has(id);
}

export function allCards(): readonly CardDefinition[] {
  return ALL;
}

export function collectibleCards(): readonly CardDefinition[] {
  return COLLECTIBLE;
}

export function cardsBy(filter: { set?: SetId; rarity?: Rarity; faction?: Faction }): CardDefinition[] {
  return COLLECTIBLE.filter(
    (c) =>
      (!filter.set || c.set === filter.set) &&
      (!filter.rarity || c.rarity === filter.rarity) &&
      (!filter.faction || c.faction === filter.faction),
  );
}
