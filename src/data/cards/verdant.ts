import type { CardDefinition } from '@/game/types';

/**
 * THORNWEALD CIRCLE — healing, growth, buffs, resilient defenders.
 * Archetypes: Overgrowth (buff your units every turn), Wellspring (healing payoffs).
 */
const base = { faction: 'VERDANT' as const, collectible: true };

export const VERDANT_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'ver_rootling_scout', name: 'Rootling Scout', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 1, health: 2, tags: ['Treant'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'It hums as it walks. The grass leans in to listen.',
  },
  {
    ...base, id: 'ver_briarhide_sentinel', name: 'Briarhide Sentinel', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 3, keywords: ['GUARD'], tags: ['Treant'], archetypes: ['Overgrowth'],
    flavorText: 'Every thorn was once a promise to protect.',
  },
  {
    ...base, id: 'ver_grove_tender', name: 'Grove Tender', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 1, tags: ['Druid'], archetypes: ['Overgrowth'],
    target: { kind: 'OTHER_ALLY_UNIT' },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TARGET' }] }],
    flavorText: 'A little water, a little song, and a great deal of patience.',
  },
  {
    ...base, id: 'ver_thornpelt_packmother', name: 'Thornpelt Packmother', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 1, health: 2, tags: ['Beast'], archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_wolf' }] }],
    flavorText: 'She never hunts alone. Neither do her pups.',
  },
  {
    ...base, id: 'ver_bloomcaller', name: 'Bloomcaller', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 3, tags: ['Druid'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'Where she sleeps, flowers wake.',
  },
  {
    ...base, id: 'ver_canopy_stalker', name: 'Canopy Stalker', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 4, attack: 3, health: 4, tags: ['Beast'], archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_sapling' }] }],
    flavorText: 'Seeds cling to its fur. Forests follow in its wake.',
  },
  {
    ...base, id: 'ver_oakheart_warden', name: 'Oakheart Warden', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 3, health: 6, keywords: ['GUARD', 'REGENERATE'], tags: ['Treant'], archetypes: ['Overgrowth', 'Wellspring'],
    flavorText: 'Axes break. Oaks remember.',
  },
  {
    ...base, id: 'ver_entangling_roots', name: 'Entangling Roots', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 2, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'The forest takes, and the forest gives back.',
  },
  {
    ...base, id: 'ver_surge_of_spring', name: 'Surge of Spring', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 3, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'One warm morning is all the Thornweald needs.',
  },
  {
    ...base, id: 'ver_dewdrop_druid', name: 'Dewdrop Druid', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 2, attack: 1, health: 3, tags: ['Druid'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ALLY_HEALED', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] }],
    flavorText: 'Each drop of healing she gives returns to her as strength.',
  },
  {
    ...base, id: 'ver_bramble_boar', name: 'Bramble Boar', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 3, attack: 4, health: 2, keywords: ['RUSH'], tags: ['Beast'], archetypes: ['Overgrowth'],
    flavorText: 'It does not go around the hedge. It becomes a hole in the hedge.',
  },

  // ----- Rares -----
  {
    ...base, id: 'ver_heartwood_idol', name: 'Heartwood Idol', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 2, charges: 3, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT' }] }],
    flavorText: 'Carved from the first tree to sprout where a Shard fell.',
  },
  {
    ...base, id: 'ver_lifebloom_shaman', name: 'Lifebloom Shaman', cardType: 'UNIT', rarity: 'RARE', set: 'DEEP',
    manaCost: 3, attack: 2, health: 4, tags: ['Druid'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ALLY_HEALED', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Life must balance. What she mends, she takes from elsewhere.',
  },
  {
    ...base, id: 'ver_rootbound_vigor', name: 'Rootbound Vigor', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 2, target: { kind: 'ALLY_UNIT', optional: true }, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 1, health: 2, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'REGENERATE', target: 'TARGET' }] }],
    flavorText: 'Roots run deeper than wounds.',
  },
  {
    ...base, id: 'ver_briarheart_matron', name: 'Briarheart Matron', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 3, health: 4, tags: ['Treant'], archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', health: 1, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: 'Her children grow a ring thicker every night.',
  },
  {
    ...base, id: 'ver_rain_of_renewal', name: 'Rain of Renewal', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 3, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'HEAL', amount: 4, target: 'ALL_ALLIES' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The druids call it weather. Their enemies call it unfair.',
  },
  {
    ...base, id: 'ver_thornweald_stag', name: 'Thornweald Stag', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 5, attack: 4, health: 4, keywords: ['DRAIN', 'RUSH'], tags: ['Beast'], archetypes: ['Wellspring'],
    flavorText: 'Its antlers bloom in spring and draw blood in autumn.',
  },

  // ----- Epics -----
  {
    ...base, id: 'ver_world_root_hollow', name: 'The World-Root Hollow', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, duration: 2, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'Beneath every continent runs a single root. Here, it surfaces.',
  },
  {
    ...base, id: 'ver_ancient_of_tendrils', name: 'Ancient of Tendrils', cardType: 'UNIT', rarity: 'EPIC', set: 'CORE',
    manaCost: 7, attack: 4, health: 6, keywords: ['GUARD'], tags: ['Treant'], archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_treant' }] }],
    flavorText: 'Older than the Crown. Unimpressed by its fall.',
  },
  {
    ...base, id: 'ver_bloomstorm', name: 'Bloomstorm', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 6, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'SUMMON', cardId: 'token_sapling', count: 2 }, { type: 'BUFF', attack: 2, health: 2, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'A season of growth in a single breath.',
  },
  {
    ...base, id: 'ver_wellspring_oracle', name: 'Wellspring Oracle', cardType: 'UNIT', rarity: 'EPIC', set: 'DEEP',
    manaCost: 4, attack: 3, health: 5, tags: ['Druid'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ALLY_HEALED', effects: [{ type: 'BUFF', attack: 2, target: 'TRIGGER_UNIT' }] }],
    description: 'Whenever a friendly unit is healed, give it +2 Attack.',
    flavorText: 'She drinks from the spring beneath the World-Root, and sees tomorrow.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'ver_sylvara', name: 'Sylvara, Voice of the Root', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 8, attack: 5, health: 7, keywords: ['GUARD', 'REGENERATE'], tags: ['Druid'], archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: 'When she sings, the Thornweald sings with her — and it has been waiting a long time.',
  },
  {
    ...base, id: 'ver_ysolde', name: 'Ysolde, the Endless Spring', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 6, attack: 4, health: 7, keywords: ['DRAIN'], tags: ['Druid'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 3, target: 'ALL_ALLIES' }] }],
    flavorText: 'Drowned once, she rose from the spring and never needed to breathe again.',
  },
];
