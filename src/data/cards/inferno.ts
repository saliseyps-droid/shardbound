import type { CardDefinition } from '@/game/types';

/**
 * THE UNDERFLAME — the demon lords on the road down to the Burning Throne, two per faction. Each
 * one is won by beating it in that campaign (src/data/opponents.ts INFERNO_CAMPAIGN); the four
 * chapter bosses are Legendary. Not in any pack, never crafted, recycled or generated.
 */
const base = { cardType: 'UNIT' as const, set: 'CORE' as const, collectible: true, rewardOnly: true, archetypes: ['Utility'], tags: ['Demon'] };

export const INFERNO_CARDS: CardDefinition[] = [
  // Chapter I — The Burning Root
  {
    ...base, id: 'emb_the_hollow_rider', name: 'The Hollow Rider', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 3, attack: 3, health: 2, keywords: ['RUSH'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'BURN', amount: 2, target: 'TARGET' }] }],
    description: 'Rush. On Deploy: Apply Burn 2 to an enemy unit.',
    flavorText: 'He rides the burning root up and down, and nobody has ever heard the horse breathe.',
  },
  {
    ...base, id: 'ver_mother_blight', name: 'Mother Blight', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 5, attack: 3, health: 7, keywords: ['GUARD'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_sapling', count: 3 }] }],
    description: 'Guard. Last Breath: Summon three 1/2 Saplings.',
    flavorText: 'Everything that rots in the Underflame grows again in her. She calls them her children.',
  },
  {
    ...base, id: 'vod_vhessa_the_ash_serpent', name: 'Vhessa, the Ash Serpent', faction: 'VOID', rarity: 'LEGENDARY',
    manaCost: 5, attack: 4, health: 6,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'CORRUPT', target: 'ALL_ENEMY_UNITS' }] }],
    description: 'On Deploy: Corrupt all enemy units.',
    flavorText: 'She guards the first gate of the deep. What she breathes on does not burn. It simply forgets it was ever alive.',
  },
  // Chapter II — The Iron Muster
  {
    ...base, id: 'irn_the_brass_locust', name: 'The Brass Locust', faction: 'IRON', rarity: 'EPIC',
    manaCost: 2, attack: 2, health: 1, keywords: ['SWIFT'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'SUMMON', cardId: 'token_scrapbot', count: 2 }] }],
    description: 'Swift. Last Breath: Summon two 1/1 Scrapbots.',
    flavorText: 'The forges of the Underflame turn out a thousand of them a night. Each one remembers how to swarm.',
  },
  {
    ...base, id: 'tid_brineclaw', name: 'Brineclaw', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 4, attack: 4, health: 4,
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }, { type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }] }],
    description: 'On Deploy: Freeze an enemy unit and deal 2 damage to it.',
    flavorText: 'It hunts the boiling brine that cools the forges, and nothing that falls in comes out whole.',
  },
  {
    ...base, id: 'irn_ghul_the_forgemaster', name: 'Ghul, the Forgemaster', faction: 'IRON', rarity: 'LEGENDARY',
    manaCost: 6, attack: 5, health: 7,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', attack: 1, target: 'OTHER_ALLY_UNITS' }, { type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }] }],
    description: 'At the end of your turn, give your other units +1 Attack and gain 2 Armor.',
    flavorText: 'Every blade of the Sovereign’s legions was hammered on his anvil. He has never once made a shield.',
  },
  // Chapter III — The Frozen Lake
  {
    ...base, id: 'vod_the_thousand_eyed', name: 'The Thousand-Eyed', faction: 'VOID', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 5,
    abilities: [{ trigger: 'ENEMY_DIED', effects: [{ type: 'DRAW_CARDS', amount: 1 }] }],
    description: 'Whenever an enemy unit dies, draw a card.',
    flavorText: 'It keeps watch over the prisoners in the ice. It has never closed a single eye.',
  },
  {
    ...base, id: 'ast_the_sunfallen_seraph', name: 'The Sunfallen Seraph', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 5, keywords: ['BARRIER'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 4, target: 'ALLY_HERO' }] }],
    description: 'Barrier. On Deploy: Restore 4 Health to your Warden.',
    flavorText: 'She fell from the Lumen sky so long ago that her light has turned the colour of embers.',
  },
  {
    ...base, id: 'tid_rimegrave_lord_of_the_frozen_lake', name: 'Rimegrave, Lord of the Frozen Lake', faction: 'TIDE', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 8,
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }] },
      { trigger: 'TURN_END', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'FROZEN_ENEMY_UNITS' }] },
    ],
    description: 'On Deploy: Freeze all enemy units. At the end of your turn, deal 2 damage to all Frozen enemy units.',
    flavorText: 'At the very bottom of the fire there is ice. Azgaroth keeps his enemies there, and Rimegrave keeps the ice.',
  },
  // Chapter IV — Pyrethrone
  {
    ...base, id: 'ver_the_lantern_of_rot', name: 'The Lantern of Rot', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 3, attack: 2, health: 4,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }],
    description: 'At the end of your turn, restore 2 Health to your Warden and deal 1 damage to the enemy Warden.',
    flavorText: 'It lights the way to the throne with a lamp of green fire. Nobody who follows the light comes back.',
  },
  {
    ...base, id: 'ast_the_pale_herald', name: 'The Pale Herald', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 4,
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { cardType: 'SPELL' } }] },
      { trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF' }] },
    ],
    description: 'On Deploy: Draw a spell. Whenever you cast a spell, gain +1/+1.',
    flavorText: 'It announces every guest at the Burning Throne. Most of them, it announces only once.',
  },
  {
    ...base, id: 'emb_azgaroth_the_ninth_sovereign', name: 'Azgaroth, the Ninth Sovereign', faction: 'EMBER', rarity: 'LEGENDARY',
    manaCost: 8, attack: 8, health: 8,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALL_ENEMIES' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 2, target: 'ALL_ENEMY_UNITS' }] }],
    description: 'On Deploy: Deal 3 damage to all enemies, then apply Burn 2 to all enemy units.',
    flavorText: 'Older than fire, crowned with a stolen Shard. Even dead, the flames of the Underflame still bow to him.',
  },
];
