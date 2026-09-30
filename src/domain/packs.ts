import { PACK_CONFIG } from '@/config/economy';
import { cardsBy } from '@/data/cards';
import type { RngState } from '@/core/rng';
import { nextFloat, pickOne, pickWeighted } from '@/core/rng';
import type { CardDefinition, Rarity, SetId, Variant } from '@/game/types';
import { RARITIES } from '@/game/types';
import { maxCopiesFor } from './decks';

export interface PackCard {
  cardId: string;
  rarity: Rarity;
  variant: Variant;
  /** True when the player owned no copy before this pack. */
  isNew: boolean;
}

export interface PityState {
  EPIC: number;
  LEGENDARY: number;
}

export interface PackResult {
  cards: PackCard[];
  pity: PityState;
}

const rank = (r: Rarity) => RARITIES.indexOf(r);

/**
 * Generates one booster pack.
 * - N-1 standard slots + 1 guaranteed Rare-or-better slot
 * - Pity timers upgrade the guaranteed slot to Epic/Legendary
 * - Duplicate protection prefers cards not yet owned at max playable copies
 * @param owned cardId -> copies owned (including cards already generated in this pack)
 */
export function generatePack(setId: SetId, pity: PityState, owned: (cardId: string) => number, rng: RngState): PackResult {
  const cfg = PACK_CONFIG;
  const rarities: Rarity[] = [];
  for (let i = 0; i < cfg.cardsPerPack - 1; i++) rarities.push(pickWeighted(rng, cfg.standardSlotWeights));
  let guaranteed = pickWeighted(rng, cfg.guaranteedSlotWeights);

  const packsSinceLegendary = pity.LEGENDARY + 1;
  const packsSinceEpic = pity.EPIC + 1;
  const hasAtLeast = (r: Rarity) => [...rarities, guaranteed].some((x) => rank(x) >= rank(r));
  if (cfg.pity.LEGENDARY && packsSinceLegendary >= cfg.pity.LEGENDARY && !hasAtLeast('LEGENDARY')) guaranteed = 'LEGENDARY';
  else if (cfg.pity.EPIC && packsSinceEpic >= cfg.pity.EPIC && !hasAtLeast('EPIC')) guaranteed = 'EPIC';
  rarities.push(guaranteed);

  const inPack = new Map<string, number>();
  const cards: PackCard[] = rarities.map((rarity) => {
    const card = pickCard(setId, rarity, (id) => owned(id) + (inPack.get(id) ?? 0), rng);
    const before = owned(card.id) + (inPack.get(card.id) ?? 0);
    inPack.set(card.id, (inPack.get(card.id) ?? 0) + 1);
    return { cardId: card.id, rarity: card.rarity, variant: pickWeighted(rng, cfg.variantWeights), isNew: before === 0 };
  });

  const gotLegendary = cards.some((c) => c.rarity === 'LEGENDARY');
  const gotEpic = cards.some((c) => rank(c.rarity) >= rank('EPIC'));
  return {
    cards,
    pity: { LEGENDARY: gotLegendary ? 0 : packsSinceLegendary, EPIC: gotEpic ? 0 : packsSinceEpic },
  };
}

function pickCard(setId: SetId, rarity: Rarity, owned: (id: string) => number, rng: RngState): CardDefinition {
  // Fall back through rarities if a set lacks cards of the rolled rarity.
  let pool = cardsBy({ set: setId, rarity });
  for (let r = rank(rarity); pool.length === 0 && r >= 0; r--) pool = cardsBy({ set: setId, rarity: RARITIES[r] });
  if (pool.length === 0) pool = cardsBy({ rarity });
  if (PACK_CONFIG.duplicateProtection[rarity]) {
    const missing = pool.filter((c) => owned(c.id) < maxCopiesFor(c));
    if (missing.length > 0) {
      // Strongly prefer entirely-new cards, then incomplete playsets.
      const brandNew = missing.filter((c) => owned(c.id) === 0);
      pool = brandNew.length > 0 && nextFloat(rng) < 0.75 ? brandNew : missing;
    }
  }
  return pickOne(rng, pool)!;
}
