import type { CardDefinition } from '@/game/types';

/**
 * CURSE OF THE ABYSS — Knights from every faction, sworn to the dark below the world.
 * Tallys the Menace (void.ts) and Liu Kano (astral.ts) also belong to this set.
 * Set theme: Knight synergy (draw Knights, reward controlling another Knight) on top of each faction's own plan.
 */
const knight = { cardType: 'UNIT' as const, set: 'ABYSS' as const, collectible: true, tags: ['Knight'] };

export const ABYSS_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...knight, id: 'tid_tidewrack_knight', name: 'Tidewrack Knight', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3, archetypes: ['Deep Freeze'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] }],
    flavorText: 'He sank with his ship. He came back up without it.',
  },
  {
    ...knight, id: 'ver_thornmail_knight', name: 'Thornmail Knight', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 3, keywords: ['REGENERATE'], archetypes: ['Wellspring'],
    flavorText: 'The roots grew through his armour. Now they mend it every night.',
  },
  {
    ...knight, id: 'neu_redcloak_sentinel', name: 'Redcloak Sentinel', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3,
    abilities: [{
      trigger: 'ON_DEPLOY',
      effects: [
        { type: 'BUFF', attack: 1, health: 1, target: 'SELF', condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } },
        { type: 'GRANT_KEYWORD', keyword: 'GUARD', target: 'SELF', condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } },
      ],
    }],
    description: 'On Deploy: If you control another Knight, gain +1/+1 and Guard.',
    flavorText: 'The red cloak marks the one who stays behind so the others can fall back.',
  },
  {
    ...knight, id: 'neu_duskwing_knight', name: 'Duskwing Knight', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 2,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Knight' } }] }],
    description: 'On Deploy: Draw a Knight from your deck.',
    flavorText: 'Where the bat-winged herald lands, an oath is about to be kept.',
  },
  // ----- Rares -----
  {
    ...knight, id: 'irn_stormrivet_dreadknight', name: 'Stormrivet Dreadknight', faction: 'IRON', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 5, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'Every rivet was struck in a thunderstorm. He still hums when it rains.',
  },
  {
    ...knight, id: 'vod_gravecloak_knight', name: 'Gravecloak Knight', faction: 'VOID', rarity: 'RARE',
    manaCost: 4, attack: 4, health: 3, archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'He was buried with his blade. It was a mistake to bury him at all.',
  },
  {
    ...knight, id: 'vod_hornmoon_reaver', name: 'Hornmoon Reaver', faction: 'VOID', rarity: 'RARE',
    manaCost: 5, attack: 5, health: 4, keywords: ['DRAIN'], archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_KILL', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF' }] }],
    flavorText: 'He rides out only under a horned moon, and comes back heavier.',
  },
  {
    ...knight, id: 'emb_cinderhelm_knight', name: 'Cinderhelm Knight', faction: 'EMBER', rarity: 'RARE',
    manaCost: 3, attack: 3, health: 2, keywords: ['RUSH'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_ATTACK', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }],
    flavorText: 'His helm never cooled after the forge. Neither did he.',
  },
  // ----- Epics -----
  {
    ...knight, id: 'ast_halberdier_of_last_light', name: 'Halberdier of the Last Light', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 5, keywords: ['WARD'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF' }] }],
    flavorText: 'He guards the last lit window of the Conclave. Every spell cast inside makes him stronger.',
  },
  {
    ...knight, id: 'ver_verdigris_knight', name: 'Verdigris Knight', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 6, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALL_ALLIES' }] }],
    flavorText: 'Moss took his armour long ago. He let it, and it has kept him alive since.',
  },
  {
    ...knight, id: 'irn_bastion_dreadknight', name: 'Bastion Dreadknight', faction: 'IRON', rarity: 'EPIC',
    manaCost: 6, attack: 5, health: 7, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', health: 2, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: 'Stand behind him. There is room. There is always room.',
  },
  // ----- Legendaries -----
  {
    ...knight, id: 'emb_vorgrath_the_burning_oath', name: 'Vorgrath, the Burning Oath', faction: 'EMBER', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 6, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_ENEMIES' }] }],
    flavorText: 'He swore to burn until the Abyss was closed. He is still burning.',
  },
  {
    ...knight, id: 'tid_azhrel_drowned_champion', name: 'Azhrel, the Drowned Champion', faction: 'TIDE', rarity: 'LEGENDARY',
    manaCost: 6, attack: 5, health: 6, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: "The sea took the Court's champion. The Abyss gave him back, burning cold.",
  },
];
