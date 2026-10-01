import type { CardDefinition } from '@/game/types';

/**
 * CINDER LEGION — aggression, direct damage, Burn.
 * Archetypes: Blitz (Swift units & face damage), Pyromancy (Empower & spell payoffs).
 */
const base = { faction: 'EMBER' as const, collectible: true };

export const EMBER_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'emb_kindling_imp', name: 'Kindling Imp', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 2, health: 1, keywords: ['SWIFT'], tags: ['Elemental'], archetypes: ['Blitz'],
    flavorText: 'Small, hungry, and entirely flammable.',
  },
  {
    ...base, id: 'emb_ashfang_raider', name: 'Ashfang Raider', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 3, health: 2, archetypes: ['Blitz'],
    flavorText: 'Raiders of the Legion never learned the word "retreat". It burned with the rest of the dictionary.',
  },
  {
    ...base, id: 'emb_flame_jolt', name: 'Flame Jolt', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, target: { kind: 'ANY' }, archetypes: ['Pyromancy', 'Blitz'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }] }],
    flavorText: 'The first spell every pyromancer learns. The last one many enemies see.',
  },
  {
    ...base, id: 'emb_scorch_adept', name: 'Scorch Adept', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 2, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, tags: ['Mage'], archetypes: ['Pyromancy'],
    flavorText: 'Her eyebrows grow back. Eventually.',
  },
  {
    ...base, id: 'emb_pyre_hound', name: 'Pyre Hound', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE',
    manaCost: 3, attack: 4, health: 1, keywords: ['SWIFT'], tags: ['Beast'], archetypes: ['Blitz'],
    flavorText: 'Fetch? It prefers "ignite".',
  },
  {
    ...base, id: 'emb_ember_volley', name: 'Ember Volley', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' }] }],
    flavorText: 'Aim is optional when the sky itself is on fire.',
  },
  {
    ...base, id: 'emb_magma_brute', name: 'Magma Brute', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 4, health: 3, tags: ['Elemental'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    flavorText: 'It does not walk so much as flow downhill toward its enemies.',
  },
  {
    ...base, id: 'emb_kindle', name: 'Kindle', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 1, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'APPLY_STATUS', status: 'BURN', amount: 3, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, condition: { kind: 'SPELLS_CAST_THIS_TURN_GTE', n: 2 } }] }],
    description: 'Apply Burn 3 to an enemy unit. If you cast 2 or more spells this turn, draw a card.',
    flavorText: 'Patience is a virtue. Burning is faster.',
  },
  {
    ...base, id: 'emb_flamecaller_initiate', name: 'Flamecaller Initiate', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 3, attack: 2, health: 4, tags: ['Mage'], archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Every incantation leaves sparks. She collects them.',
  },
  {
    ...base, id: 'emb_cinderbreath_drake', name: 'Cinderbreath Drake', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 4, health: 4, keywords: ['SWIFT'], tags: ['Drake'], archetypes: ['Blitz'],
    flavorText: 'Legion riders bond with their drakes in the caldera. Survivors are promoted.',
  },
  {
    ...base, id: 'emb_sparkblade_duelist', name: 'Sparkblade Duelist', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 1, health: 3, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_ATTACK', effects: [{ type: 'BUFF', attack: 2, temporary: true, target: 'SELF' }] }],
    flavorText: 'Her blade is dull. The lightning in it is not.',
  },

  // ----- Rares -----
  {
    ...base, id: 'emb_blazing_barrage', name: 'Blazing Barrage', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 3, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY', repeat: 5 }] }],
    flavorText: 'Five bolts. One very bad day.',
  },
  {
    ...base, id: 'emb_legion_banneret', name: 'Legion Banneret', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 3, attack: 2, health: 3, archetypes: ['Blitz'],
    aura: { target: 'OTHER_ALLY_UNITS', attack: 1 },
    flavorText: 'Where the flame-banner flies, the Legion does not fall back.',
  },
  {
    ...base, id: 'emb_pyroclast_sage', name: 'Pyroclast Sage', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 5, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, tags: ['Mage'], archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', pool: { faction: 'EMBER', cardType: 'SPELL' }, destination: 'HAND' }] }],
    flavorText: 'Every scar is a lesson. She is extremely well educated.',
  },
  {
    ...base, id: 'emb_searing_brand', name: 'Searing Brand', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 2, target: { kind: 'ANY_UNIT' }, archetypes: ['Pyromancy', 'Blitz'],
    abilities: [
      { trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 4, target: 'TARGET' }] },
      { trigger: 'ON_CAST', overcharge: 2, effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] },
    ],
    flavorText: 'Marked by the Legion. Claimed by the fire.',
  },
  {
    ...base, id: 'emb_ashen_duelist', name: 'Ashen Twinblade', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 3, attack: 2, health: 3, keywords: ['FRENZY'], archetypes: ['Blitz'],
    flavorText: 'Two blades. Two strikes. Zero hesitation.',
  },
  {
    ...base, id: 'emb_everburning_kiln', name: 'Everburning Kiln', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 2, charges: 4, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }],
    flavorText: 'Stoked by spells, it never cools.',
  },

  // ----- Epics -----
  {
    ...base, id: 'emb_caldera_cataclysm', name: 'Caldera Cataclysm', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 6, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALL_ENEMIES' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 1, target: 'ALL_ENEMY_UNITS' }] }],
    flavorText: 'When Kharzul wakes, the Legion simply stands behind it.',
  },
  {
    ...base, id: 'emb_kharzul_caldera', name: 'Kharzul Caldera', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 3, duration: 3, archetypes: ['Pyromancy', 'Blitz'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' }] }],
    flavorText: 'The birthplace of the Legion. The deathplace of everyone else.',
  },
  {
    ...base, id: 'emb_ashborn_phoenix', name: 'Ashborn Phoenix', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 5, attack: 4, health: 3, keywords: ['SWIFT'], tags: ['Elemental'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'CREATE_CARD', cardId: 'emb_ashborn_phoenix', destination: 'DECK' }] }],
    description: 'Swift. Last Breath: Shuffle an Ashborn Phoenix into your deck.',
    flavorText: 'Kill it once, shame on you. Kill it twice...',
  },
  {
    ...base, id: 'emb_legion_warbringer', name: 'Legion Warbringer', cardType: 'UNIT', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, attack: 3, health: 3, keywords: ['SWIFT'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 2, temporary: true, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: '"Today, we burn brighter than the sun!"',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'emb_vulkara', name: 'Vulkara, Mother of Drakes', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 8, attack: 6, health: 6, keywords: ['SWIFT'], tags: ['Drake'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' }, { type: 'SUMMON', cardId: 'token_drakeling', count: 2 }] }],
    flavorText: 'Every drake in the caldera answers to one voice.',
  },
  {
    ...base, id: 'emb_ignivar', name: 'Ignivar, Crown-Burner', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 5, attack: 4, health: 5, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 2 }, tags: ['Mage'], archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    flavorText: 'He was the first to touch a falling Shard. He has been on fire ever since.',
  },
];
