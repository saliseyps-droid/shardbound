import type { CardDefinition, CardType, Faction, Rarity, SetId } from '@/game/types';
import { ALL_FACTIONS, RARITIES } from '@/game/types';

export type SortKey = 'cost' | 'name' | 'rarity' | 'faction';
export type OwnershipFilter = 'ALL' | 'OWNED' | 'MISSING';

export interface CardFilterState {
  faction: Faction | 'ALL';
  rarity: Rarity | 'ALL';
  set: SetId | 'ALL';
  type: CardType | 'ALL';
  /** 0..7 where 7 means 7+. */
  cost: number | 'ALL';
  search: string;
  sort: SortKey;
  ownership: OwnershipFilter;
}

export const DEFAULT_FILTERS: CardFilterState = {
  faction: 'ALL',
  rarity: 'ALL',
  set: 'ALL',
  type: 'ALL',
  cost: 'ALL',
  search: '',
  sort: 'cost',
  ownership: 'ALL',
};

const rarityRank = (r: Rarity) => RARITIES.indexOf(r);
const factionRank = (f: Faction) => ALL_FACTIONS.indexOf(f);

function matchesSearch(card: CardDefinition, q: string): boolean {
  if (!q) return true;
  const hay = `${card.name} ${card.description ?? ''} ${(card.tags ?? []).join(' ')} ${(card.keywords ?? []).join(' ')} ${card.cardType}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

/** Pure filter + sort; callers memoize on (cards, filters, owned). */
export function filterCards(
  cards: readonly CardDefinition[],
  f: CardFilterState,
  owned: (id: string) => number,
  allowedFactions?: readonly Faction[],
): CardDefinition[] {
  const out = cards.filter((c) => {
    if (allowedFactions && !allowedFactions.includes(c.faction)) return false;
    if (f.faction !== 'ALL' && c.faction !== f.faction) return false;
    if (f.rarity !== 'ALL' && c.rarity !== f.rarity) return false;
    if (f.set !== 'ALL' && c.set !== f.set) return false;
    if (f.type !== 'ALL' && c.cardType !== f.type) return false;
    if (f.cost !== 'ALL' && (f.cost >= 7 ? c.manaCost < 7 : c.manaCost !== f.cost)) return false;
    if (f.ownership === 'OWNED' && owned(c.id) === 0) return false;
    if (f.ownership === 'MISSING' && owned(c.id) > 0) return false;
    return matchesSearch(c, f.search.trim());
  });
  const byName = (a: CardDefinition, b: CardDefinition) => a.name.localeCompare(b.name);
  const byCost = (a: CardDefinition, b: CardDefinition) => a.manaCost - b.manaCost || byName(a, b);
  const cmp: Record<SortKey, (a: CardDefinition, b: CardDefinition) => number> = {
    cost: byCost,
    name: byName,
    rarity: (a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || byCost(a, b),
    faction: (a, b) => factionRank(a.faction) - factionRank(b.faction) || byCost(a, b),
  };
  return out.sort(cmp[f.sort]);
}
