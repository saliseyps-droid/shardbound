import type { CardDefinition } from '@/game/types';

/**
 * RIMETIDE COURT — tempo, Freeze, bounce and delayed effects.
 * Archetypes: Deep Freeze (freeze & punish Frozen targets), Undertow (return units, replay On Deploy, steal).
 */
const base = { faction: 'TIDE' as const, collectible: true };

export const TIDE_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'tid_frostfin_scout', name: 'Frostfin Scout', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 1, health: 2, tags: ['Leviathan'], archetypes: ['Deep Freeze'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] }],
    flavorText: 'It darts beneath the ice, leaving a trail of hoarfrost in its wake.',
  },
  {
    ...base, id: 'tid_rimebound_acolyte', name: 'Rimebound Acolyte', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 3, tags: ['Mage'], archetypes: ['Deep Freeze'],
    flavorText: 'Novices of the Court spend a year beneath the ice before they may speak.',
  },
  {
    ...base, id: 'tid_chill_snap', name: 'Chill Snap', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The sea remembers every warm thing it has ever stilled.',
  },
  {
    ...base, id: 'tid_tidecaller_eel', name: 'Tidecaller Eel', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 3, health: 2, keywords: ['AMBUSH'], tags: ['Leviathan'], archetypes: ['Undertow'],
    flavorText: 'By the time you see the ripple, it has already struck.',
  },
  {
    ...base, id: 'tid_drowned_sentinel', name: 'Drowned Sentinel', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 4, keywords: ['GUARD'], tags: ['Undead'], archetypes: ['Deep Freeze'],
    flavorText: 'Its oath outlived its lungs.',
  },
  {
    ...base, id: 'tid_frost_lance', name: 'Frost Lance', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 2, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Deep Freeze'],
    abilities: [{
      trigger: 'ON_CAST',
      effects: [
        { type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' },
        { type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET', condition: { kind: 'TARGET_FROZEN' } },
      ],
    }],
    description: 'Deal 2 damage to an enemy unit. If it is Frozen, deal 2 more.',
    flavorText: 'Frozen flesh shatters so beautifully.',
  },
  {
    ...base, id: 'tid_riptide_reaver', name: 'Riptide Reaver', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 4, health: 4, archetypes: ['Undertow'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { maxCost: 3 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }] }],
    flavorText: 'The current takes what the Reaver points at.',
  },
  {
    ...base, id: 'tid_glacier_hulk', name: 'Glacier Hulk', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 4, health: 6, tags: ['Elemental'], archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'A thousand winters, given legs and a grudge.',
  },
  {
    ...base, id: 'tid_wavebreaker_bard', name: 'Wavebreaker Bard', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE',
    manaCost: 3, attack: 3, health: 3, archetypes: ['Undertow'],
    target: { kind: 'OTHER_ALLY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET', costReduction: 1 }] }],
    flavorText: '"The tide goes out so it may return stronger. Sing it again, friend."',
  },
  {
    ...base, id: 'tid_hailstorm', name: 'Hailstorm', cardType: 'SPELL', rarity: 'COMMON', set: 'DEEP',
    manaCost: 4, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMY_UNITS' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }] }],
    flavorText: 'Every stone of it was once a drop of the Rimed Sea.',
  },
  {
    ...base, id: 'tid_shivering_harpooner', name: 'Shivering Harpooner', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 3, attack: 3, health: 2, archetypes: ['Deep Freeze'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { frozen: true } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }] }],
    flavorText: 'Still targets make for easy trophies.',
  },

  // ----- Rares -----
  {
    ...base, id: 'tid_undertow_smuggler', name: 'Undertow Smuggler', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 3, attack: 2, health: 3, archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'STEAL_CARD', from: 'DECK', amount: 1 }] }],
    flavorText: 'Whatever sinks, she finds. Whatever floats, she finds faster.',
  },
  {
    ...base, id: 'tid_icebound_oracle', name: 'Icebound Oracle', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 4, tags: ['Mage'], archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'She foresaw your attack. She has already stopped it.',
  },
  {
    ...base, id: 'tid_rimed_tide_bell', name: 'Rimed Tide-Bell', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 2, charges: 3, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'When it tolls, the waves stand still to listen.',
  },
  {
    ...base, id: 'tid_shatterpoint', name: 'Shatterpoint', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 3, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Deep Freeze'],
    abilities: [{
      trigger: 'ON_CAST',
      effects: [
        { type: 'DESTROY', target: 'TARGET', condition: { kind: 'TARGET_FROZEN' } },
        { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' },
      ],
    }],
    description: 'If an enemy unit is Frozen, destroy it. Otherwise, Freeze it.',
    flavorText: 'One tap, in exactly the right place.',
  },
  {
    ...base, id: 'tid_tidal_recall', name: 'Tidal Recall', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 1, target: { kind: 'ALLY_UNIT', optional: true }, archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET', costReduction: 2 }, { type: 'DRAW_CARDS', amount: 1 }] }],
    description: 'Return a friendly unit to your hand. It costs (2) less. Draw a card.',
    flavorText: 'The sea gives back what it borrows — eventually.',
  },
  {
    ...base, id: 'tid_floe_lancer', name: 'Floe Lancer', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 3, attack: 3, health: 3, keywords: ['RUSH'], archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_ATTACK', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    
    flavorText: 'Her lance is carved from a single icicle that never melts.',
  },

  // ----- Epics -----
  {
    ...base, id: 'tid_the_drowned_court', name: 'The Drowned Court', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, duration: 3, archetypes: ['Deep Freeze', 'Undertow'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'Beneath the ice, the thrones are still occupied.',
  },
  {
    ...base, id: 'tid_deep_winter', name: 'Deep Winter', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 5, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: { kind: 'FROZEN_ENEMY_COUNT', max: 3 } }] }],
    description: 'Freeze all enemy units. Draw a card for each Frozen enemy (up to 3).',
    flavorText: 'Not a season. A sentence.',
  },
  {
    ...base, id: 'tid_undertow_maelstrom', name: 'Undertow Maelstrom', cardType: 'SPELL', rarity: 'EPIC', set: 'DEEP',
    manaCost: 6, archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RETURN_TO_HAND', target: 'ALL_UNITS' }] }],
    description: 'Return all units to their owners\' hands.',
    flavorText: 'The sea takes everything back. Everything.',
  },
  {
    ...base, id: 'tid_tidewitch_of_the_rime', name: 'Tidewitch of the Rime', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 5, attack: 4, health: 5, keywords: ['AMBUSH'], tags: ['Mage'], archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ENEMY_DIED', effects: [{ type: 'CREATE_CARD', cardId: 'token_ice_shard', destination: 'HAND' }] }],
    flavorText: 'Each soul she drowns becomes a splinter of ice for the next.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'tid_ysolde', name: 'Ysolde, Rimed Sovereign', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 7, attack: 5, health: 7, archetypes: ['Deep Freeze'],
    abilities: [{
      trigger: 'ON_DEPLOY',
      effects: [
        { type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' },
        { type: 'DEAL_DAMAGE', amount: { kind: 'FROZEN_ENEMY_COUNT', times: 2 }, target: 'ENEMY_HERO' },
      ],
    }],
    description: 'On Deploy: Freeze all enemy units. Then deal 2 damage to the enemy Warden for each Frozen enemy.',
    flavorText: 'Queen of a court that has not breathed in a thousand years.',
  },
  {
    ...base, id: 'tid_morrowgast', name: 'Morrowgast, the Deep Leviathan', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 9, attack: 7, health: 7, tags: ['Leviathan'], archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'RANDOM_ENEMY_UNIT', repeat: 2 }, { type: 'SUMMON', cardId: 'token_kraken_tentacle', count: 2 }] }],
    description: 'On Deploy: Return 2 random enemy units to their owner\'s hand. Summon two 1/1 Grasping Tentacles with Guard.',
    flavorText: 'When it rises, the horizon rises with it.',
  },
];
