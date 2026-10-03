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

  // ===== Second wave =====
  // ----- Commons -----
  {
    ...knight, id: 'tid_palehood_sentry', name: 'Palehood Sentry', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 2, attack: 1, health: 3, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'Under the pale hood there is only frost, and it is watching.',
  },
  {
    ...knight, id: 'ast_moonlit_duelist', name: 'Moonlit Duelist', faction: 'ASTRAL', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF', condition: { kind: 'SPELLS_CAST_THIS_TURN_GTE', n: 1 } }] }],
    description: 'On Deploy: If you cast a spell this turn, gain +1/+1.',
    flavorText: 'She only duels under a full moon. The Conclave makes sure there is always one.',
  },
  {
    ...knight, id: 'ver_mossguard_knight', name: 'Mossguard Knight', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 3, attack: 2, health: 4, keywords: ['GUARD'], archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'His shield has kept the same patch of moss alive for a hundred years.',
  },
  {
    ...knight, id: 'emb_pyrebrand_knight', name: 'Pyrebrand Knight', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 2, attack: 3, health: 2, archetypes: ['Blitz'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Branded by the pyre, he carries its last spark into every fight.',
  },
  {
    ...knight, id: 'neu_gloomwing_squire', name: 'Gloomwing Squire', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 1, attack: 1, health: 2,
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Knight' } }] }],
    description: 'Last Breath: Draw a Knight from your deck.',
    flavorText: 'Every squire dreams of the spurs. This one dies so a knight can win them.',
  },
  {
    ...knight, id: 'neu_ashroad_sellsword', name: 'Ashroad Sellsword', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 4, attack: 4, health: 4,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GRANT_KEYWORD', keyword: 'RUSH', target: 'SELF', condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } }] }],
    description: 'On Deploy: If you control another Knight, gain Rush.',
    flavorText: 'He fights for coin on the Ashroad, and charges first when other knights are watching.',
  },
  // ----- Rares -----
  {
    ...knight, id: 'irn_ironvow_axeman', name: 'Ironvow Axeman', faction: 'IRON', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 4, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO', condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } }] }],
    description: 'Guard. On Deploy: If you control another Knight, gain 3 Armor.',
    flavorText: 'His vow was forged in iron. So, he insists, was he.',
  },
  {
    ...knight, id: 'vod_hornwing_despoiler', name: 'Hornwing Despoiler', faction: 'VOID', rarity: 'RARE',
    manaCost: 3, attack: 4, health: 4, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'The Choir lends him its strength. It always collects.',
  },
  {
    ...knight, id: 'tid_brinehair_duelist', name: 'Brinehair Duelist', faction: 'TIDE', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 4, archetypes: ['Deep Freeze'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { frozen: true } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }] }],
    description: 'On Deploy: Deal 3 damage to a Frozen enemy unit.',
    flavorText: 'She prefers her opponents frozen. They argue less.',
  },
  // ----- Epics -----
  {
    ...knight, id: 'neu_scarlet_oathbreaker', name: 'Scarlet Oathbreaker', faction: 'NEUTRAL', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 4,
    abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Knight' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TRIGGER_UNIT' }] }],
    description: 'Whenever you summon another Knight, give it +1/+1.',
    flavorText: 'He broke every oath he swore, and every knight who followed him swore a new one.',
  },
  {
    ...knight, id: 'ast_isera_of_the_violet_blade', name: 'Isera of the Violet Blade', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 4, archetypes: ['Spellweave'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { cardType: 'SPELL' } }] },
      { trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] },
    ],
    flavorText: 'Her blade hums with every spell spoken near it, and it remembers each one.',
  },
  {
    ...knight, id: 'emb_phoenixguard_zealot', name: 'Phoenixguard Zealot', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 5, attack: 5, health: 3, keywords: ['SWIFT'], archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'BURN', amount: 2, target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'He walked into the Phoenix pyre a squire and walked out a zealot.',
  },
  {
    ...knight, id: 'vod_horned_revenant', name: 'Horned Revenant', faction: 'VOID', rarity: 'EPIC',
    manaCost: 6, attack: 5, health: 5, archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'RESURRECT', count: 1, maxCost: 5 }] }],
    flavorText: 'When he falls, the Abyss opens a door. Something always walks back through it.',
  },
  // ----- Legendaries -----
  {
    ...knight, id: 'ver_sylvara_the_thornwinged', name: 'Sylvara, the Thornwinged', faction: 'VERDANT', rarity: 'LEGENDARY',
    manaCost: 6, attack: 4, health: 6, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: 'Her wings are bramble and her spear is a sapling. Behind her, the Circle grows.',
  },
  {
    ...knight, id: 'irn_brannoch_bronze_bastion', name: 'Brannoch, the Bronze Bastion', faction: 'IRON', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 8, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: { kind: 'ALLY_UNIT_COUNT', times: 2 }, target: 'ALLY_HERO' }] }],
    description: 'Guard. On Deploy: Gain 2 Armor for each unit you control.',
    flavorText: 'The Dominion built a fortress, then gave it legs.',
  },
];
