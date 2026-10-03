import type { CardDefinition } from '@/game/types';

/**
 * HOLLOW CHOIR — sacrifice, Last Breath, resurrection.
 * Archetypes: Requiem (death triggers), Offering (sacrifice own units for payoffs).
 */
const base = { faction: 'VOID' as const, collectible: true };

export const VOID_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'vod_grave_whisperer', name: 'Grave Whisperer', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 1, health: 1, tags: ['Wraith'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp' }] }],
    flavorText: 'It speaks only to the dead. The dead, unfortunately, answer.',
  },
  {
    ...base, id: 'vod_tithe_of_bone', name: 'Tithe of Bone', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 1, target: { kind: 'ANY_UNIT' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, condition: { kind: 'ALLY_DIED_THIS_TURN' } }] }],
    description: 'Deal 2 damage to a unit. If a friendly unit died this turn, draw a card.',
    flavorText: 'The Choir always collects. Whose bones it takes is merely a detail.',
  },
  {
    ...base, id: 'vod_choir_novice', name: 'Choir Novice', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 3, tags: ['Cultist'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] }],
    flavorText: 'Each funeral hymn she learns makes her voice a little colder.',
  },
  {
    ...base, id: 'vod_hollow_leech', name: 'Hollow Leech', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 3, keywords: ['DRAIN'], tags: ['Wraith'], archetypes: ['Offering'],
    flavorText: 'It drinks warmth, not blood. The difference matters very little to its victims.',
  },
  {
    ...base, id: 'vod_cryptcrawler', name: 'Cryptcrawler', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 2, tags: ['Undead'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_skeleton' }] }],
    flavorText: 'Break it apart and the pieces simply stand up again.',
  },
  {
    ...base, id: 'vod_marrow_priest', name: 'Marrow Priest', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 3, health: 3, tags: ['Cultist'], target: { kind: 'OTHER_ALLY_UNIT', optional: true }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'BUFF', attack: 2, health: 2, target: 'SELF', condition: { kind: 'ALLY_DIED_THIS_TURN' } }] }],
    description: 'On Deploy: Destroy another friendly unit. If a friendly unit died this turn, gain +2/+2.',
    flavorText: '"Your sacrifice is noted. And digested."',
  },
  {
    ...base, id: 'vod_dirgebound_knight', name: 'Dirgebound Knight', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 4, health: 4, tags: ['Undead'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Sworn to fight until death — and then a little further.',
  },
  {
    ...base, id: 'vod_hollow_matron', name: 'Hollow Matron', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 4, health: 5, tags: ['Wraith'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp', count: 2 }] }],
    flavorText: 'Her children are made of whispers. They are always hungry.',
  },
  {
    ...base, id: 'vod_open_grave', name: 'Open Grave', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 2, archetypes: ['Offering', 'Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RESURRECT', count: 1, maxCost: 3 }] }],
    flavorText: 'The Choir never fills a grave in. It might be needed again.',
  },
  {
    ...base, id: 'vod_venomous_cantor', name: 'Venomous Cantor', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 1, health: 3, keywords: ['VENOM'], tags: ['Cultist'], archetypes: ['Offering'],
    flavorText: 'One note from her throat stops a heart. Two notes stop an army.',
  },
  {
    ...base, id: 'vod_pallbearer', name: 'Silent Pallbearer', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 4, attack: 3, health: 5, keywords: ['GUARD'], tags: ['Undead'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'It has carried a thousand coffins. It waits patiently for its own.',
  },

  // ----- Rares -----
  {
    ...base, id: 'vod_reap', name: 'Reap', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 3, target: { kind: 'ENEMY_UNIT', filter: { maxAttack: 3 } }, archetypes: ['Offering', 'Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DESTROY', target: 'TARGET' }] }],
    flavorText: 'The small ones go first. They always do.',
  },
  {
    ...base, id: 'vod_offering_blade', name: 'Offering Blade', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 1, charges: 3, archetypes: ['Offering'],
    abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT' }] }],
    flavorText: 'A knife that remembers every life it has taken — and shares them.',
  },
  {
    ...base, id: 'vod_requiem_conductor', name: 'Requiem Conductor', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 4, tags: ['Cultist'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: { kind: 'ALLY_DEATHS_THIS_GAME', max: 6 }, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Every fallen voice joins his choir. Every voice sings for vengeance.',
  },
  {
    ...base, id: 'vod_choir_of_moths', name: 'Choir of Moths', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 2, attack: 1, health: 1, tags: ['Wraith'], archetypes: ['Requiem', 'Offering'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'When the swarm scatters, every candle in the Choir burns a little brighter.',
  },
  {
    ...base, id: 'vod_blood_pact', name: 'Blood Pact', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 1, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 2 }, { type: 'DEAL_DAMAGE', amount: 4, target: 'ALLY_HERO' }] }],
    description: 'Draw 2 cards. Deal 4 damage to your Warden.',
    flavorText: 'Signed in red. Paid in full. Eventually.',
  },
  {
    ...base, id: 'vod_ossuary_colossus', name: 'Ossuary Colossus', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 6, attack: 5, health: 6, keywords: ['GUARD'], tags: ['Undead'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: { kind: 'ALLY_DEATHS_THIS_GAME', max: 5 }, health: { kind: 'ALLY_DEATHS_THIS_GAME', max: 5 }, target: 'SELF' }] }],
    description: 'Guard. On Deploy: Gain +1/+1 for each friendly unit that died this game (up to +5/+5).',
    flavorText: 'Built from every soldier the Choir has ever lost. It remembers each of their names.',
  },

  // ----- Epics -----
  {
    ...base, id: 'vod_hollow_cathedral', name: 'The Hollow Cathedral', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 3, duration: 3, archetypes: ['Requiem', 'Offering'],
    abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp' }] }],
    flavorText: 'Its bells ring for every death. Something always answers the call.',
  },
  {
    ...base, id: 'vod_requiem_mass', name: 'Requiem Mass', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 7, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DESTROY', target: 'ALL_UNITS' }, { type: 'RESURRECT', count: 2 }] }],
    description: 'Destroy all units. Then resurrect 2 random friendly units that died this game.',
    flavorText: 'All are equal before the Hymn. Some are simply more equal afterwards.',
  },
  {
    ...base, id: 'vod_siphoning_wraith', name: 'Siphoning Wraith', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 4, attack: 3, health: 3, keywords: ['DRAIN', 'VENOM'], tags: ['Wraith'], archetypes: ['Offering'],
    flavorText: 'Its touch is a slow kiss of ending — slow for you, delicious for it.',
  },
  {
    ...base, id: 'vod_hymn_of_unmaking', name: 'Hymn of Unmaking', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, archetypes: ['Requiem', 'Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_UNITS' }, { type: 'RESURRECT', count: 1, maxCost: 3 }] }],
    description: 'Deal 2 damage to all units. Then resurrect a random friendly unit that costs 3 or less.',
    flavorText: 'The verse that ends all songs. The Choir sings it softly.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'vod_ysolde', name: 'Ysolde, Queen of the Hollow', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 8, attack: 5, health: 7, tags: ['Undead'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RESURRECT', count: 3 }] }],
    flavorText: 'She did not conquer the dead. She simply invited them home.',
  },
  {
    ...base, id: 'vod_nhal', name: 'Nhal, the Silent Hymn', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 5, attack: 4, health: 6, keywords: ['DRAIN'], tags: ['Wraith'], archetypes: ['Offering', 'Requiem'],
    abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    flavorText: 'The last note of every song belongs to it.',
  },
  {
    ...base, id: 'vod_tallys_the_menace', name: 'Tallys the Menace', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 6, attack: 5, health: 5, keywords: ['GUARD'], tags: ['Undead'], archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'Where the Choir sings, he walks ahead. Nothing walks behind him.',
  },
];
