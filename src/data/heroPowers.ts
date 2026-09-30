import type { HeroPowerDefinition, PlayableFaction } from '@/game/types';

/** Warden Sigils: a once-per-turn ability every Warden carries. */
export const HERO_POWERS: HeroPowerDefinition[] = [
  { id: 'hp_ember', name: 'Cinder Bolt', cost: 2, description: 'Deal 1 damage to an enemy.', target: { kind: 'ENEMY' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }] },
  { id: 'hp_verdant', name: 'Sap of the Root', cost: 2, description: 'Restore 2 Health to a friendly character.', target: { kind: 'ALLY' }, effects: [{ type: 'HEAL', amount: 2, target: 'TARGET' }] },
  { id: 'hp_iron', name: 'Rivet Plating', cost: 2, description: 'Gain 2 Armor.', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }] },
  { id: 'hp_astral', name: 'Starlit Insight', cost: 2, description: 'Add a Fleeting Mote of Insight to your hand.', effects: [{ type: 'CREATE_CARD', cardId: 'token_mote_insight', destination: 'HAND', fleeting: true }] },
  { id: 'hp_void', name: 'Hollow Summons', cost: 2, description: 'Summon a 1/1 Hollow Wisp.', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp', target: 'ALLY_HERO' }] },
  { id: 'hp_tide', name: 'Rime Touch', cost: 2, description: 'Freeze an enemy unit.', target: { kind: 'ENEMY_UNIT' }, effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] },
  // Boss sigils
  { id: 'hp_boss_inferno', name: 'Caldera Eruption', cost: 2, description: 'Deal 1 damage to all enemies.', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' }] },
  { id: 'hp_boss_leviathan', name: 'Crushing Depths', cost: 3, description: 'Return a random enemy unit to its owner\'s hand.', effects: [{ type: 'RETURN_TO_HAND', target: 'RANDOM_ENEMY_UNIT' }] },
  { id: 'hp_boss_choir', name: 'Requiem Chorus', cost: 2, description: 'Summon two 1/1 Hollow Wisps.', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp', count: 2 }] },
  { id: 'hp_boss_sovereign', name: 'Crown Fragment', cost: 1, description: 'Draw a card and gain 2 Armor.', effects: [{ type: 'DRAW_CARDS', amount: 1 }, { type: 'GAIN_ARMOR', amount: 2 }] },
  { id: 'hp_boss_colossus', name: 'Overclock', cost: 2, description: 'Give a random friendly unit +2/+2.', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'RANDOM_ALLY_UNIT' }] },
];

const BY_ID = new Map(HERO_POWERS.map((p) => [p.id, p]));

export function getHeroPower(id: string): HeroPowerDefinition | undefined {
  return BY_ID.get(id);
}

export const FACTION_HERO_POWER: Record<PlayableFaction, string> = {
  EMBER: 'hp_ember',
  VERDANT: 'hp_verdant',
  IRON: 'hp_iron',
  ASTRAL: 'hp_astral',
  VOID: 'hp_void',
  TIDE: 'hp_tide',
};
