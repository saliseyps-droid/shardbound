import type { BrawlSideMods } from './brawl';

/** Dungeon treasures: taken after a floor boss, they last for the rest of the run (rule cards: src/data/cards/tokens.ts). */
export interface DungeonTreasure {
  id: string;
  name: string;
  description: string;
  icon: string;
  mods: BrawlSideMods;
}

export const DUNGEON_TREASURES: DungeonTreasure[] = [
  { id: 'crystal_heart', name: 'Crystal Heart', description: 'Start every match with 1 extra energy crystal.', icon: 'crystal', mods: { bonusStartingEnergy: 1 } },
  { id: 'aegis', name: 'Aegis of the Deep', description: 'Start every match with 8 Armor.', icon: 'shield', mods: { startingArmor: 8 } },
  { id: 'giants_blood', name: "Giant's Blood", description: 'Your Warden has 40 Health.', icon: 'heart', mods: { heroHealth: 40 } },
  { id: 'war_banner', name: 'War Banner', description: 'Your units get +1 Attack when they are summoned.', icon: 'sword', mods: { rules: ['dungeon_rule_banner'] } },
  { id: 'spell_tome', name: 'Tome of Echoes', description: 'Your spells cost 1 less (but never less than 1).', icon: 'scroll', mods: { rules: ['dungeon_rule_tome'] } },
  { id: 'quiver', name: 'Endless Quiver', description: 'At the start of your turn, deal 1 damage to a random enemy.', icon: 'bolt', mods: { rules: ['brawl_rule_munitions'] } },
  { id: 'satchel', name: "Scholar's Satchel", description: 'At the start of your turn, if you have 3 or fewer cards in hand, draw a card.', icon: 'deck', mods: { rules: ['dungeon_rule_satchel'] } },
  { id: 'spring', name: 'Healing Spring', description: 'At the end of your turn, restore 2 Health to your Warden.', icon: 'leaf', mods: { rules: ['dungeon_rule_spring'] } },
  { id: 'dragon_egg', name: 'Dragon Egg', description: 'At the start of your turn, add a random Dragon to your hand.', icon: 'wing', mods: { rules: ['brawl_rule_dragon_nest'] } },
  { id: 'guardian', name: 'Brass Guardian', description: 'Start every match with a 2/3 Brass Sentry with Guard on the board.', icon: 'gear', mods: { startingBoard: ['token_sentry'] } },
];

export const getTreasure = (id: string) => DUNGEON_TREASURES.find((t) => t.id === id);
