/**
 * Brawl modifiers. A Brawl fight combines two of them; a rotation (src/domain/brawl.ts) offers
 * two fights with four different modifiers. Effects that last the whole match are rule cards
 * (src/data/cards/tokens.ts, `brawl_rule_*`) that take no relic slot.
 */

export interface BrawlSideMods {
  heroHealth?: number;
  bonusStartingEnergy?: number;
  startingArmor?: number;
  rules?: string[];
  startingBoard?: string[];
}

export interface BrawlModifier {
  id: string;
  name: string;
  /** Player-facing rules text. */
  description: string;
  /** Modifiers sharing a group never share a fight (e.g. two different Warden Health rules). */
  groups?: ('health' | 'enemyBoard')[];
  both?: BrawlSideMods;
  player?: BrawlSideMods;
  opponent?: BrawlSideMods;
  /** The opponent starts with a Legendary unit of its faction on the board. */
  opponentLegendary?: boolean;
}

export const BRAWL_MODIFIERS: BrawlModifier[] = [
  { id: 'fire_surge', name: 'Fire Surge', description: 'Both Wardens start with 2 extra energy crystals and 40 Health.', groups: ['health'], both: { heroHealth: 40, bonusStartingEnergy: 2 } },
  { id: 'long_winter', name: 'Long Winter', description: 'Both Wardens have 60 Health. At the start of each turn, a random enemy unit is Frozen.', groups: ['health'], both: { heroHealth: 60, rules: ['brawl_rule_long_winter'] } },
  { id: 'dragon_nest', name: 'Dragon Nest', description: 'At the start of each turn, its player adds a random Dragon to their hand.', both: { rules: ['brawl_rule_dragon_nest'] } },
  { id: 'blood_arena', name: 'Blood Arena', description: 'Every unit gets +1/+1 when it is summoned. Both Wardens have only 20 Health.', groups: ['health'], both: { heroHealth: 20, rules: ['brawl_rule_blood_arena'] } },
  { id: 'spell_storm', name: 'Spell Storm', description: 'At the start of each turn, its player adds a random spell that costs 3 or less to their hand.', both: { rules: ['brawl_rule_spell_storm'] } },
  { id: 'munitions', name: 'Munitions Depot', description: 'At the start of each turn, its Warden deals 1 damage to a random enemy.', both: { rules: ['brawl_rule_munitions'] } },
  { id: 'siege', name: 'Siege', description: 'Your opponent starts with three 0/4 Siege Walls with Guard. You start with 1 extra energy crystal.', groups: ['enemyBoard'], player: { bonusStartingEnergy: 1 }, opponent: { startingBoard: ['token_brawl_wall', 'token_brawl_wall', 'token_brawl_wall'] } },
  { id: 'treasury', name: 'Rich Treasury', description: 'All cards cost 1 less (but never less than 1).', both: { rules: ['brawl_rule_treasury'] } },
  { id: 'final_breath', name: 'Final Breath', description: 'Whenever a unit dies, its owner draws a card.', both: { rules: ['brawl_rule_last_breath'] } },
  { id: 'champion', name: 'Champion', description: 'Your opponent has 40 Health and starts with a Legendary unit on the board. You start with 10 Armor and 1 extra energy crystal.', groups: ['health', 'enemyBoard'], opponent: { heroHealth: 40 }, player: { startingArmor: 10, bonusStartingEnergy: 1 }, opponentLegendary: true },
];

export const getBrawlModifier = (id: string) => BRAWL_MODIFIERS.find((m) => m.id === id);
