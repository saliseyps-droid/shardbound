import type { CardDefinition } from '@/game/types';

/**
 * THE TWIN OATH — the knights of the Host on the Rainbow Stair, in the Seven Skies and at the
 * Tribunal. Each one is won by beating it in that co-op campaign (src/data/opponents.ts
 * HEAVEN_CAMPAIGN); the three chapter bosses are Legendary. Not in any pack, never crafted,
 * recycled or generated.
 */
const base = { cardType: 'UNIT' as const, set: 'CORE' as const, collectible: true, rewardOnly: true, archetypes: ['Utility'], tags: ['Angel'] };

export const HEAVEN_CARDS: CardDefinition[] = [
  // Chapter I — The Rainbow Stair
  {
    ...base, id: 'ast_ostiarius_keeper_of_the_stair', name: 'Ostiarius, Keeper of the Stair', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 3, attack: 2, health: 5, keywords: ['GUARD'],
    target: { kind: 'ALLY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GRANT_KEYWORD', keyword: 'BARRIER', target: 'TARGET' }] }],
    description: 'Guard. On Deploy: Give another friendly unit Barrier.',
    flavorText: 'He has kept the bottom step for nine hundred years. Nobody has ever climbed past him alone.',
  },
  {
    ...base, id: 'vod_brother_thurifer', name: 'Brother Thurifer', faction: 'VOID', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 4,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'APPLY_STATUS', status: 'CORRUPT', target: 'RANDOM_ENEMY_UNIT' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    description: 'At the end of your turn, Corrupt a random enemy unit and restore 2 Health to your Warden.',
    flavorText: 'His censer once burned sweet resin for the pilgrims. Now its smoke finds the sins in them and makes them grow.',
  },
  {
    ...base, id: 'ast_halcyon_captain_of_the_pearl_gate', name: 'Halcyon, Captain of the Pearl Gate', faction: 'ASTRAL', rarity: 'LEGENDARY',
    manaCost: 6, attack: 5, health: 6, keywords: ['GUARD', 'BARRIER'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'GRANT_KEYWORD', keyword: 'BARRIER', target: 'OTHER_ALLY_UNITS' }] },
      { trigger: 'ALLY_SUMMONED', effects: [{ type: 'GRANT_KEYWORD', keyword: 'BARRIER', target: 'TRIGGER_UNIT' }] },
    ],
    description: 'Guard. Barrier. On Deploy: Give your other units Barrier. Whenever you summon another unit, give it Barrier.',
    flavorText: 'The Pearl Gate has never fallen. Halcyon would like you to know it is not going to start with you.',
  },
  // Chapter II — The Seven Skies
  {
    ...base, id: 'tid_nimbriel_of_the_frozen_sky', name: 'Nimbriel of the Frozen Sky', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 5,
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, target: 'ALLY_HERO' }] }],
    description: 'On Deploy: Freeze an enemy unit. Draw a card.',
    flavorText: 'In the fourth sky the snow never reaches the ground. It hangs in the air around her and listens.',
  },
  {
    ...base, id: 'ver_ysandre_of_the_falling_waters', name: 'Ysandre of the Falling Waters', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 3, attack: 2, health: 4,
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALL_ALLIES' }] }],
    description: 'At the end of your turn, restore 2 Health to all friendly characters.',
    flavorText: 'The rivers of Aethra begin in her sky. She has never asked them to come back.',
  },
  {
    ...base, id: 'emb_azrafel_angel_of_the_red_moon', name: 'Azrafel, Angel of the Red Moon', faction: 'EMBER', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 6, keywords: ['RUSH', 'DRAIN'],
    abilities: [{ trigger: 'ON_KILL', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ENEMY_HERO' }] }],
    description: 'Rush. Drain. Whenever this destroys a unit, deal 3 damage to the enemy Warden.',
    flavorText: 'The Host keeps one angel who does not sing. When the Red Moon rises over the seventh sky, he goes to work.',
  },
  // Chapter III — The Tribunal
  {
    ...base, id: 'irn_the_chainbearer', name: 'The Chainbearer', faction: 'IRON', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 5, keywords: ['GUARD'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SILENCE', target: 'TARGET' }, { type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }] }],
    description: 'Guard. On Deploy: Silence an enemy unit. Gain 3 Armor.',
    flavorText: 'Every chain he carries was forged for one prisoner. He has never had to forge a second one.',
  },
  {
    ...base, id: 'ast_solenne_voice_of_the_throne', name: 'Solenne, Voice of the Throne', faction: 'IRON', rarity: 'EPIC',
    manaCost: 5, attack: 3, health: 5,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: { kind: 'FROZEN_ENEMY_COUNT', max: 3 }, target: 'ALLY_HERO' }] }],
    description: 'On Deploy: Freeze all enemy units. Draw a card for each Frozen enemy unit (up to 3).',
    flavorText: 'The Throne has not spoken in an age, so Solenne speaks for it. She has never been told she was wrong.',
  },
  {
    ...base, id: 'neu_the_arbiter', name: 'The Arbiter', faction: 'NEUTRAL', rarity: 'LEGENDARY',
    manaCost: 8, attack: 3, health: 3,
    abilities: [
      {
        trigger: 'ON_DEPLOY',
        effects: [
          // Counted before the verdict: every enemy unit and every other friendly one.
          { type: 'BUFF', attack: { kind: 'ENEMY_UNIT_COUNT' }, health: { kind: 'ENEMY_UNIT_COUNT' }, target: 'SELF' },
          { type: 'BUFF', attack: { kind: 'ALLY_UNIT_COUNT', plus: -1 }, health: { kind: 'ALLY_UNIT_COUNT', plus: -1 }, target: 'SELF' },
          { type: 'DESTROY', target: 'ALL_ENEMY_UNITS' },
          { type: 'DESTROY', target: 'OTHER_ALLY_UNITS' },
        ],
      },
    ],
    description: 'On Deploy: Pass judgment: destroy all other units, friend and foe, and gain +1/+1 for each one.',
    flavorText: 'He weighed the Crown when it was whole and found it light. He has weighed Aethra since, and found it wanting.',
  },
];
