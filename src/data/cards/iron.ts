import type { CardDefinition } from '@/game/types';

/**
 * BRASS DOMINION — Constructs, Armor, energy generation.
 * Archetypes: Assembly Line (Construct synergies), Bulwark (Armor & ramp into big threats).
 */
const base = { faction: 'IRON' as const, collectible: true };

export const IRON_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'irn_rivet_scamp', name: 'Rivet Scamp', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 1, health: 2, tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 2 }] }],
    flavorText: 'It hands out spare plating to anyone who stands still long enough.',
  },
  {
    ...base, id: 'irn_gearwright_apprentice', name: 'Gearwright Apprentice', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 2, tags: ['Artificer'], archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_scrapbot' }] }],
    flavorText: 'Her first creation bit her. She was very proud.',
  },
  {
    ...base, id: 'irn_plated_bastion', name: 'Plated Bastion', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 1, health: 4, keywords: ['GUARD'], tags: ['Construct'], archetypes: ['Bulwark'],
    flavorText: 'Riveted, bolted, welded, and then riveted again for good measure.',
  },
  {
    ...base, id: 'irn_assembly_foreman', name: 'Assembly Foreman', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 3, health: 3, tags: ['Artificer'], archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Construct' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TRIGGER_UNIT' }] }],
    description: 'Whenever you summon a Construct, give it +1/+1.',
    flavorText: '"Tighter. Tighter. Perfect. Next!"',
  },
  {
    ...base, id: 'irn_steamstride_walker', name: 'Steamstride Walker', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 3, health: 4, tags: ['Construct'], archetypes: ['Assembly Line'],
    flavorText: 'Each step vents a sigh of scalding steam. It sounds almost tired.',
  },
  {
    ...base, id: 'irn_boilerplate_knight', name: 'Boilerplate Knight', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 3, health: 5, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 3 }] }],
    flavorText: 'The armour is mandatory. The knight inside is optional.',
  },
  {
    ...base, id: 'irn_foundry_crusher', name: 'Foundry Crusher', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 5, health: 5, tags: ['Construct'], archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_scrapbot', count: 2 }] }],
    flavorText: 'Even broken, it keeps producing.',
  },
  {
    ...base, id: 'irn_rivet_volley', name: 'Rivet Volley', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 2, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'GAIN_ARMOR', amount: 2 }] }],
    flavorText: 'Hot rivets for them. Cold plating for us.',
  },
  {
    ...base, id: 'irn_aether_capacitor', name: 'Aether Capacitor', cardType: 'SPELL', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'GAIN_MAX_ENERGY', amount: 1, empty: true }] }],
    flavorText: 'Store a little Shardlight today; spend a lot of it tomorrow.',
  },
  {
    ...base, id: 'irn_bulwark_drone', name: 'Bulwark Drone', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 2, health: 3, tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ARMOR_GAINED', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] }],
    flavorText: 'It converts spare plating into spare aggression.',
  },
  {
    ...base, id: 'irn_slag_smelter', name: 'Slag Smelter', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE',
    manaCost: 4, attack: 4, health: 4, tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'REDUCE_COST', amount: 2, scope: 'HIGHEST_COST_IN_HAND' }] }],
    flavorText: 'Melts down scrap into something grander.',
  },

  // ----- Rares -----
  {
    ...base, id: 'irn_overclock_engineer', name: 'Overclock Engineer', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 3, attack: 3, health: 3, tags: ['Artificer'], archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'ON_DEPLOY', condition: { kind: 'CONTROLS_TAG', tag: 'Construct' }, effects: [{ type: 'GAIN_ENERGY', amount: 2 }] }],
    flavorText: 'Safety limits are a suggestion. She never takes suggestions.',
  },
  {
    ...base, id: 'irn_fortress_plating', name: 'Fortress Plating', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 3, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'GAIN_ARMOR', amount: 6 }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The Dominion builds walls first and asks questions never.',
  },
  {
    ...base, id: 'irn_ironclad_juggernaut', name: 'Ironclad Juggernaut', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 6, attack: 4, health: 7, tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: { kind: 'ARMOR', max: 6 }, target: 'SELF' }] }],
    description: 'On Deploy: Gain +X Attack, where X is your Armor (max 6).',
    flavorText: 'Its engine is fed by the walls you have built.',
  },
  {
    ...base, id: 'irn_dominion_forge', name: 'Dominion Forge', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 3, charges: 3, archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'SUMMON', cardId: 'token_scrapbot' }] }],
    flavorText: 'Every morning, a fresh helper rolls off the anvil.',
  },
  {
    ...base, id: 'irn_clockwork_commander', name: 'Clockwork Commander', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 4, tags: ['Construct'], archetypes: ['Assembly Line'],
    aura: { target: 'ALLY_UNITS', tag: 'Construct', attack: 1 },
    flavorText: 'It speaks in ticks. The army understands.',
  },
  {
    ...base, id: 'irn_shieldwall_protocol', name: 'Shieldwall Protocol', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 1, target: { kind: 'ALLY_UNIT', optional: true }, archetypes: ['Bulwark', 'Assembly Line'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 1, health: 2, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'BARRIER', target: 'TARGET' }] }],
    flavorText: 'Directive seven: the plating comes first.',
  },

  // ----- Epics -----
  {
    ...base, id: 'irn_cogspire_foundry', name: 'Cogspire Foundry', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, duration: 3, archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'SUMMON', cardId: 'token_sentry' }] }],
    flavorText: 'The foundry-city never sleeps. Neither do its sentries.',
  },
  {
    ...base, id: 'irn_aegis_titan', name: 'Aegis Titan', cardType: 'UNIT', rarity: 'EPIC', set: 'CORE',
    manaCost: 8, attack: 6, health: 8, keywords: ['GUARD'], tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 6 }] }],
    flavorText: 'A walking citadel, commissioned by the Assembly after the Crown fell.',
  },
  {
    ...base, id: 'irn_mass_production', name: 'Mass Production', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 5, archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'SUMMON', cardId: 'token_scrapbot', count: 3 }, { type: 'BUFF', attack: 1, health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'Quantity has a quality all its own.',
  },
  {
    ...base, id: 'irn_aetherdyne_core', name: 'Aetherdyne Core', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 4, attack: 0, health: 5, keywords: ['GUARD'], tags: ['Construct'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'GAIN_MAX_ENERGY', amount: 1, empty: true }] }],
    flavorText: 'A Shard in a cage of brass, spinning faster every hour.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'irn_omnifex', name: 'Omnifex, the Prime Assembler', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 7, attack: 5, health: 5, tags: ['Construct'], archetypes: ['Assembly Line'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_sentry', count: 2 }] },
      { trigger: 'ALLY_SUMMONED', filter: { tag: 'Construct' }, effects: [{ type: 'APPLY_STATUS', status: 'BARRIER', target: 'TRIGGER_UNIT' }] },
    ],
    description: 'On Deploy: Summon two 2/3 Brass Sentries. Whenever you summon a Construct, give it Barrier.',
    flavorText: 'The first machine that learned to build machines. It has not stopped since.',
  },
  {
    ...base, id: 'irn_halvera', name: 'Marshal Halvera, Iron Wall', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 6, attack: 4, health: 6, archetypes: ['Bulwark'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 5 }] },
      { trigger: 'ARMOR_GAINED', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] },
    ],
    flavorText: 'She has never lost a siege. She has never needed to leave the wall.',
  },
];
