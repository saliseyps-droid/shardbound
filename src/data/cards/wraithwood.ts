import type { CardDefinition } from '@/game/types';

/**
 * THE WRAITHWOOD INN — the guests of the haunted tavern, two per faction. Each one is won by
 * beating it at its table in that campaign (src/data/opponents.ts INN_CAMPAIGN); the four chapter
 * hosts are Legendary. Not in any pack, never crafted, recycled or generated.
 */
const base = { cardType: 'UNIT' as const, set: 'CORE' as const, collectible: true, rewardOnly: true, archetypes: ['Utility'] };

export const WRAITHWOOD_CARDS: CardDefinition[] = [
  // Chapter I — A Seat by the Fire
  {
    ...base, id: 'ast_the_pale_lodger', name: 'The Pale Lodger', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 2, attack: 2, health: 2, keywords: ['AMBUSH'], tags: ['Wraith'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'CREATE_CARD', cardId: 'ast_the_pale_lodger', destination: 'HAND' }] }],
    description: 'Ambush. Last Breath: Add a new Pale Lodger to your hand.',
    flavorText: 'It took the room by the window a hundred years ago. Every time it is thrown out, it is back by morning.',
  },
  {
    ...base, id: 'vod_hollow_tom_night_ranger', name: 'Hollow Tom, Night Ranger', faction: 'VOID', rarity: 'EPIC',
    manaCost: 3, attack: 2, health: 2, keywords: ['DRAIN'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }] }],
    description: 'Drain. On Deploy: Deal 2 damage to an enemy unit.',
    flavorText: 'He walked the forest edge every night for forty years. One night, the forest walked him home.',
  },
  {
    ...base, id: 'ver_mossmantle_the_antlered_ranger', name: 'Mossmantle, the Antlered Ranger', faction: 'VERDANT', rarity: 'LEGENDARY',
    manaCost: 4, attack: 3, health: 5, keywords: ['GUARD'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_OTHER_ALLY_UNIT' }] }],
    description: 'Guard. At the end of your turn, give another random friendly unit +1/+1.',
    flavorText: 'The moss grew over the last ranger of the Wraithwood. He let it. It keeps him warm.',
  },
  // Chapter II — Last Orders
  {
    ...base, id: 'irn_doctor_corvin', name: 'Doctor Corvin', faction: 'IRON', rarity: 'EPIC',
    manaCost: 3, attack: 2, health: 3, keywords: ['VENOM'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }] }],
    description: 'Venom. On Deploy: Gain 3 Armor.',
    flavorText: 'His mask has a cure in the beak. Nobody at the inn has ever asked for it.',
  },
  {
    ...base, id: 'emb_the_crimson_hood', name: 'The Crimson Hood', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 3, attack: 3, health: 2, keywords: ['AMBUSH'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    description: 'Ambush. On Deploy: Deal 2 damage to the enemy Warden.',
    flavorText: 'The rangers say she wore a green hood once. Nobody says what she dyed it with.',
  },
  {
    ...base, id: 'emb_bramhorn_the_skull_masked', name: 'Bramhorn, the Skull-Masked', faction: 'EMBER', rarity: 'LEGENDARY',
    manaCost: 5, attack: 5, health: 4, keywords: ['RUSH'],
    abilities: [{ trigger: 'ON_KILL', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'SELF' }] }],
    description: 'Rush. Whenever this destroys a unit, gain +2/+2.',
    flavorText: 'He wears the skull of the first thing he hunted in the Wraithwood. He is still looking for a bigger one.',
  },
  // Chapter III — The Cellar Stairs
  {
    ...base, id: 'tid_the_drowned_guest', name: 'The Drowned Guest', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 5, tags: ['Horror'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    description: 'On Deploy: Freeze an enemy unit. Draw a card.',
    flavorText: 'It came up the well in the cellar and asked for a table. The water is still dripping off its chair.',
  },
  {
    ...base, id: 'ver_hartwrath_the_stag_ranger', name: 'Hartwrath, the Stag Ranger', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 4, attack: 4, health: 3, keywords: ['RUSH', 'REGENERATE'],
    description: 'Rush. Regenerate.',
    flavorText: 'The great stag of the Wraithwood was never hunted down. It hunted down the hunter, and wore him home.',
  },
  {
    ...base, id: 'tid_the_widow_in_white', name: 'The Widow in White', faction: 'TIDE', rarity: 'LEGENDARY',
    manaCost: 6, attack: 4, health: 6, keywords: ['WARD'], tags: ['Wraith'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }] }],
    description: 'Ward. On Deploy: Freeze all enemy units.',
    flavorText: 'She waits by the window for a ranger who went into the lake. The glass frosts over wherever she looks.',
  },
  // Chapter IV — The Host's Table
  {
    ...base, id: 'ast_the_quiet_patron', name: 'The Quiet Patron', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 4, attack: 2, health: 5, keywords: ['GUARD'], tags: ['Wraith'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'STEAL_CARD', from: 'DECK', amount: 1 }] }],
    description: 'Guard. On Deploy: Steal a card from your opponent’s deck.',
    flavorText: 'He never orders, never speaks, never loses. He just watches the cards.',
  },
  {
    ...base, id: 'vod_old_marrow_the_barkeep', name: 'Old Marrow, the Barkeep', faction: 'VOID', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 4, tags: ['Undead'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RESURRECT', count: 1, maxCost: 4 }] }],
    description: 'On Deploy: Resurrect a random friendly unit that costs 4 or less and died this game.',
    flavorText: '“Nobody leaves the Wraithwood Inn before last orders. Not even the dead.”',
  },
  {
    ...base, id: 'irn_the_hollow_host', name: 'The Hollow Host', faction: 'IRON', rarity: 'LEGENDARY',
    manaCost: 8, attack: 6, health: 7, tags: ['Knight'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_skeleton', count: 2 }, { type: 'BUFF', attack: 1, health: 1, target: 'OTHER_ALLY_UNITS' }] }],
    description: 'On Deploy: Summon two 2/2 Risen Bones, then give your other units +1/+1.',
    flavorText: 'The inn was built around his table. Every guest who ever lost to him is still sitting at it.',
  },
];
