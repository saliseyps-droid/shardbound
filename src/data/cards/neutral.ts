import type { CardDefinition } from '@/game/types';

/**
 * WANDERERS — neutral utility usable in any deck.
 */
const base = { faction: 'NEUTRAL' as const, collectible: true, archetypes: ['Utility'] };

export const NEUTRAL_CARDS: CardDefinition[] = [
  // ----- Commons (starters) -----
  {
    ...base, id: 'neu_trail_hound', name: 'Trail Hound', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 2, health: 1, tags: ['Beast'],
    flavorText: 'Every caravan keeps one. The smart ones keep two.',
  },
  {
    ...base, id: 'neu_caravan_sellsword', name: 'Caravan Sellsword', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 3, health: 2,
    flavorText: 'Paid by the league, not by the enemy.',
  },
  {
    ...base, id: 'neu_hedge_mage', name: 'Hedge Mage', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 2, tags: ['Mage'],
    target: { kind: 'ANY', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }] }],
    flavorText: 'Self-taught, underpaid, and surprisingly accurate.',
  },
  {
    ...base, id: 'neu_oathbound_shieldbearer', name: 'Oathbound Shieldbearer', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 4, keywords: ['GUARD'],
    flavorText: 'She swore to protect the road. The road is very long.',
  },
  {
    ...base, id: 'neu_wandering_cartographer', name: 'Wandering Cartographer', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 3,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'Her maps show where the Shards fell. For a price.',
  },
  {
    ...base, id: 'neu_wayfarer_captain', name: 'Wayfarer Captain', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 3, health: 4,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_recruit' }] }],
    flavorText: '"Keep up, recruit. The road waits for no one."',
  },
  {
    ...base, id: 'neu_stonehide_ox', name: 'Stonehide Ox', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 5, health: 6, tags: ['Beast'],
    flavorText: 'It pulls the caravan. It also pulls the bandits, if they grab on.',
  },
  {
    ...base, id: 'neu_crag_colossus', name: 'Crag Colossus', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 6, attack: 5, health: 7, keywords: ['GUARD'], tags: ['Elemental'],
    flavorText: 'The mountain woke up. The mountain is annoyed.',
  },

  // ----- Commons -----
  {
    ...base, id: 'neu_bog_toadcaller', name: 'Bog Toadcaller', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 2, health: 2,
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_frog', count: 2 }] }],
    flavorText: 'Nobody knows where the toads come from. Nobody wants to ask.',
  },
  {
    ...base, id: 'neu_dune_cutpurse', name: 'Dune Cutpurse', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 3, health: 1, keywords: ['AMBUSH'],
    flavorText: 'You will notice your purse is missing around the same time you notice the knife.',
  },
  {
    ...base, id: 'neu_roving_herbalist', name: 'Roving Herbalist', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE',
    manaCost: 3, attack: 3, health: 2,
    target: { kind: 'ALLY', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 3, target: 'TARGET' }] }],
    flavorText: 'Mudroot poultice for wounds. Firemoss tea for everything else.',
  },
  {
    ...base, id: 'neu_ironwood_sellsword', name: 'Ironwood Mercenary', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE',
    manaCost: 4, attack: 4, health: 3, keywords: ['RUSH'],
    flavorText: 'He charges by the hour. He also just charges.',
  },
  {
    ...base, id: 'neu_shardstone_behemoth', name: 'Shardstone Behemoth', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 7, attack: 7, health: 8, tags: ['Elemental'],
    flavorText: 'A Shard fell into a quarry. The quarry stood up.',
  },

  // ----- Rares -----
  {
    ...base, id: 'neu_hush_wanderer', name: 'Hush Wanderer', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 2, attack: 2, health: 2,
    target: { kind: 'ANY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SILENCE', target: 'TARGET' }] }],
    flavorText: 'She took a vow of silence. So did everything near her.',
  },
  {
    ...base, id: 'neu_bounty_stalker', name: 'Bounty Stalker', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 3,
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { maxAttack: 2 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'TARGET' }] }],
    flavorText: 'Small bounties, paid in full.',
  },
  {
    ...base, id: 'neu_giantbane_ranger', name: 'Giantbane Ranger', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 2, health: 3,
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { minAttack: 6 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'TARGET' }] }],
    flavorText: 'The bigger they are, the bigger the trophy.',
  },
  {
    ...base, id: 'neu_pilgrims_lantern', name: "Pilgrim's Lantern", cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 1, charges: 3,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'Its flame has guided travellers since before the Crown fell.',
  },
  {
    ...base, id: 'neu_crossroads_inn', name: 'The Crossroads Inn', cardType: 'LOCATION', rarity: 'RARE', set: 'DEEP',
    manaCost: 2, duration: 3,
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'SUMMON', cardId: 'token_recruit' }] }],
    flavorText: 'Every road leads here eventually. So does every hopeful sellsword.',
  },
  {
    ...base, id: 'neu_aegis_pilgrim', name: 'Aegis Pilgrim', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 3, attack: 3, health: 2, keywords: ['BARRIER'],
    flavorText: 'Faith is a shield. Hers happens to be literal.',
  },
  {
    ...base, id: 'neu_scarred_pitfighter', name: 'Scarred Pit-Fighter', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 5, attack: 3, health: 6,
    abilities: [{ trigger: 'ON_DAMAGED', effects: [{ type: 'BUFF', attack: 2, target: 'SELF' }] }],
    flavorText: 'Every scar is a lesson. Every lesson makes him angrier.',
  },

  // ----- Epics -----
  {
    ...base, id: 'neu_toadcurse', name: 'Toadcurse', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, target: { kind: 'ANY_UNIT' },
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'TRANSFORM', target: 'TARGET', cardId: 'token_frog' }] }],
    flavorText: 'Ribbit.',
  },
  {
    ...base, id: 'neu_grand_bazaar', name: 'Grand Bazaar of Vey', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 3, duration: 3,
    costAura: { side: 'ALLY', cardType: 'UNIT', amount: -1 },
    flavorText: 'Every mercenary in Aethra is for hire here — at a discount, if you haggle.',
  },
  {
    ...base, id: 'neu_silvertongue_envoy', name: 'Silvertongue Envoy', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 6, attack: 3, health: 3,
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { maxAttack: 3 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'TAKE_CONTROL', target: 'TARGET' }] }],
    flavorText: '"Why fight for them, when you could be paid by me?"',
  },
  {
    ...base, id: 'neu_skyrift_wyrm', name: 'Skyrift Wyrm', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 6, attack: 5, health: 5, keywords: ['WARD', 'RUSH'], tags: ['Dragon'],
    flavorText: 'It nests in the tears the Crown left in the sky.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'neu_oskar_vell', name: 'Oskar Vell, Merchant Prince', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 4, attack: 3, health: 5,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'CREATE_CARD', pool: { maxCost: 3 }, destination: 'HAND' }] }],
    flavorText: 'He has sold Shards to every faction. Twice.',
  },
  {
    ...base, id: 'neu_aeon_pale_wanderer', name: 'Aeon, the Pale Wanderer', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 9, attack: 6, health: 6,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'ALL_OTHER_UNITS' }] }],
    flavorText: 'It walked out of the Crown on the day it shattered, and it has been ending things ever since.',
  },
  {
    ...base, id: 'neu_captain_abandoneer', name: 'Captain Abandoneer', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 6, attack: 5, health: 4, keywords: ['RUSH'], tags: ['Pirate'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'STEAL_CARD', from: 'HAND', amount: 1 }] },
      { trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_deckhand', count: 2 }] },
    ],
    flavorText: 'She has abandoned three ships, two crews and one kingdom. Never the treasure.',
  },
  {
    ...base, id: 'neu_meowchick', name: 'Meowchick', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 3, attack: 1, health: 1, keywords: ['SWIFT'], tags: ['Beast'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 2, target: 'ALL_ALLY_UNITS' }] }],
    description: 'Swift. On Deploy: Give all your units, including this one, +2 Attack.',
    flavorText: 'Nobody knows where it came from. Everybody follows it into battle anyway.',
  },
];
