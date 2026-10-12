import type { CardDefinition } from '@/game/types';

/**
 * THE LAMPLIGHTERS' ROAD — Neutral legends won in that campaign (one per chapter boss).
 * Not in any pack, never crafted, recycled or generated: the campaign is the only way to get them.
 */
const base = { faction: 'NEUTRAL' as const, cardType: 'UNIT' as const, rarity: 'LEGENDARY' as const, set: 'CORE' as const, collectible: true, rewardOnly: true, archetypes: ['Utility'] };

export const LAMPLIGHT_CARDS: CardDefinition[] = [
  {
    ...base, id: 'neu_nyx_lantern_of_nul', name: 'Nyx, Lantern of Nul',
    manaCost: 3, attack: 2, health: 5, keywords: ['GUARD'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    description: 'Guard. Whenever you cast a spell, restore 2 Health to your Warden.',
    flavorText: 'She carries the last flame of the Nulwood. It burns purple now, but it still burns.',
  },
  {
    ...base, id: 'neu_vael_the_void_knell', name: 'Vael, the Void Knell',
    manaCost: 6, attack: 3, health: 6, keywords: ['GUARD'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_OTHER_UNITS' }] }],
    description: 'Guard. On Deploy: Deal 2 damage to all other units.',
    flavorText: 'One toll for the grove. One for the road. One for whoever is still standing.',
  },
  {
    ...base, id: 'neu_oblivia_keeper_of_the_last_page', name: 'Oblivia, Keeper of the Last Page',
    manaCost: 7, attack: 5, health: 6,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', recentSpells: 2, destination: 'HAND' }] }],
    description: 'On Deploy: Add copies of the last 2 different spells you cast this game to your hand.',
    flavorText: 'She has read every spell ever cast. She remembers the last ones best.',
  },
];
