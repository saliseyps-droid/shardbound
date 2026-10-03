import type { CardDefinition } from '@/game/types';

/**
 * CURSE OF THE ABYSS — Knights from every faction, sworn to the dark below the world.
 * Tallys the Menace (void.ts) and Liu Kano (astral.ts) also belong to this set.
 * Set theme: Knight synergy (draw Knights, reward controlling another Knight) on top of each faction's own plan.
 */
const knight = { cardType: 'UNIT' as const, set: 'ABYSS' as const, collectible: true, tags: ['Knight'] };
const spell = { cardType: 'SPELL' as const, set: 'ABYSS' as const, collectible: true };

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
    manaCost: 4, attack: 4, health: 3,
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
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 1, target: 'ALL_ALLIES' }] }],
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
    manaCost: 6, attack: 5, health: 5,
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'RESURRECT', count: 1, maxCost: 5 }] }],
    flavorText: 'When he falls, the Abyss opens a door. Something always walks back through it.',
  },
  // ----- Legendaries -----
  {
    ...knight, id: 'ver_sylvara_the_thornwinged', name: 'Sylvara, the Thornwinged', faction: 'VERDANT', rarity: 'LEGENDARY',
    manaCost: 7, attack: 4, health: 6, archetypes: ['Overgrowth'],
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

  // ===== Third wave =====
  // ----- Commons -----
  {
    ...knight, id: 'ver_briarhelm_knight', name: 'Briarhelm Knight', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_OTHER_ALLY_UNIT' }] }],
    flavorText: 'Wherever he plants his blade, something nearby starts to grow.',
  },
  {
    ...knight, id: 'vod_bloodcape_zealot', name: 'Bloodcape Zealot', faction: 'VOID', rarity: 'COMMON',
    manaCost: 2, attack: 3, health: 3, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'His cape was white once. He offered that too.',
  },
  {
    ...knight, id: 'neu_redscarf_lancer', name: 'Redscarf Lancer', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 2, keywords: ['RUSH'],
    flavorText: 'The red scarf is so the others know where the charge begins.',
  },
  {
    ...knight, id: 'tid_undertow_halberdier', name: 'Undertow Halberdier', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 3, attack: 2, health: 3, archetypes: ['Undertow'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { maxCost: 2 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }] }],
    description: "On Deploy: Return an enemy unit that costs 2 or less to its owner's hand.",
    flavorText: 'One sweep of the halberd, and the tide carries the small ones home.',
  },
  {
    ...knight, id: 'irn_steelwatch_knight', name: 'Steelwatch Knight', faction: 'IRON', rarity: 'COMMON',
    manaCost: 2, attack: 1, health: 3, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'The Steelwatch never sleeps. It just leans on its shield with its eyes closed.',
  },
  {
    ...knight, id: 'neu_emberward_shieldbearer', name: 'Emberward Shieldbearer', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 3, keywords: ['GUARD'],
    flavorText: 'Her shield was forged from a city gate that refused to burn.',
  },
  // ----- Rares -----
  {
    ...knight, id: 'tid_frostspine_knight', name: 'Frostspine Knight', faction: 'TIDE', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 5, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DAMAGED', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'Strike him and the cold strikes back.',
  },
  {
    ...knight, id: 'ver_antlerhelm_knight', name: 'Antlerhelm Knight', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 4, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ALLY_HEALED', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] }],
    flavorText: 'The stag gave him its crown. Every wound the Circle mends sharpens it.',
  },
  {
    ...knight, id: 'ast_duskstar_sentinel', name: 'Duskstar Sentinel', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 4, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, condition: { kind: 'SPELLS_CAST_THIS_TURN_GTE', n: 1 } }] }],
    description: 'On Deploy: If you cast a spell this turn, draw a card.',
    flavorText: 'He keeps watch for the first star of dusk, and writes down what it says.',
  },
  // ----- Epics -----
  {
    ...knight, id: 'emb_gildflame_champion', name: 'Gildflame Champion', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 4, attack: 3, health: 4, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMY_UNITS' }] }],
    flavorText: 'His armour was gilded for parades. The Legion found better uses for him.',
  },
  {
    ...knight, id: 'emb_hellshield_marauder', name: 'Hellshield Marauder', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 5, keywords: ['GUARD'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DAMAGED', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    flavorText: 'Every blow on his shield sends sparks across the field, straight at the one who ordered it.',
  },
  {
    ...knight, id: 'irn_gearspike_commander', name: 'Gearspike Commander', faction: 'IRON', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 4, archetypes: ['Assembly Line'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_sentry' }] }],
    flavorText: 'He never rides into battle without a sentry at his side. He builds a new one each time.',
  },
  {
    ...knight, id: 'ast_starbound_inquisitor', name: 'Starbound Inquisitor', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 4, keywords: ['WARD'], archetypes: ['Starlit Control'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SILENCE', target: 'TARGET' }] }],
    flavorText: 'The stars have already judged you. He is only here to read the verdict.',
  },
  // ----- Legendaries -----
  {
    ...knight, id: 'neu_rendoslav', name: 'Rendoslav', faction: 'NEUTRAL', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 6,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 2, filter: { tag: 'Knight' } }, { type: 'BUFF', attack: 1, health: 1, target: 'OTHER_ALLY_UNITS' }] }],
    description: 'On Deploy: Draw 2 Knights from your deck. Give your other units +1/+1.',
    flavorText: 'The Abyss crowned him king of every knight who swore to it. All of them still answer.',
  },
  {
    ...knight, id: 'vod_kaelthar_pyre_of_souls', name: 'Kaelthar, Pyre of Souls', faction: 'VOID', rarity: 'LEGENDARY',
    manaCost: 6, attack: 5, health: 5, keywords: ['DRAIN'], archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: { kind: 'ALLY_DEATHS_THIS_GAME', max: 5 }, target: 'ALL_ENEMY_UNITS' }] }],
    description: 'Drain. On Deploy: Deal 1 damage to all enemy units for each friendly unit that died this game (up to 5).',
    flavorText: 'Every soul the Choir has lost burns in him. He lets them out one at a time.',
  },

  // ===== Spells: the Abyssal braziers =====
  // ----- Commons -----
  {
    ...spell, id: 'irn_forge_oath', name: 'Forge Oath', faction: 'IRON', rarity: 'COMMON',
    manaCost: 2, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'GAIN_ARMOR', amount: 4, target: 'ALLY_HERO' }, { type: 'DRAW_CARDS', amount: 1, condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } }] }],
    description: 'Gain 4 Armor. If you control a Knight, draw a card.',
    flavorText: 'Sworn over a brass brazier, an oath is hammered into the armour itself.',
  },
  {
    ...spell, id: 'emb_abyssal_flare', name: 'Abyssal Flare', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 1, target: { kind: 'ANY_UNIT' }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET', condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } }] }],
    description: 'Deal 2 damage to a unit. If you control a Knight, deal 1 more.',
    flavorText: 'A flare from the deep fires: small, red, and aimed by someone in armour.',
  },
  {
    ...spell, id: 'vod_soulfire_rite', name: 'Soulfire Rite', faction: 'VOID', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ANY_UNIT' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 4, target: 'TARGET' }, { type: 'DEAL_DAMAGE', amount: 2, target: 'ALLY_HERO' }] }],
    description: 'Deal 4 damage to a unit. Deal 2 damage to your Warden.',
    flavorText: 'The fire burns brighter for every drop of its keeper it is fed.',
  },
  {
    ...spell, id: 'tid_undertow_surge', name: 'Undertow Surge', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET', condition: { kind: 'TARGET_FROZEN' } }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] }],
    description: 'If an enemy unit is Frozen, deal 3 damage to it. Then Freeze it.',
    flavorText: 'The cold pulls twice: once to hold you, once to drown you.',
  },
  {
    ...spell, id: 'neu_ember_of_oaths', name: 'Ember of Oaths', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ALLY_UNIT', filter: { tag: 'Knight' } },
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'TARGET' }] }],
    description: 'Give a friendly Knight +2/+2.',
    flavorText: 'Every Knight of the Abyss carries one ember from the brazier where they swore.',
  },
  {
    ...spell, id: 'vod_choirs_lament', name: "Choir's Lament", faction: 'VOID', rarity: 'COMMON',
    manaCost: 2, archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp', count: 2 }] }],
    flavorText: 'The lament has two voices. Neither of them is alive.',
  },
  // ----- Rares -----
  {
    ...spell, id: 'vod_hollow_pact', name: 'Hollow Pact', faction: 'VOID', rarity: 'RARE',
    manaCost: 2, target: { kind: 'ALLY_UNIT' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 2 }] }],
    description: 'Destroy a friendly unit. Draw 2 cards.',
    flavorText: 'Give the violet flame one of yours. It answers with two secrets.',
  },
  {
    ...spell, id: 'emb_wildfire_charge', name: 'Wildfire Charge', faction: 'EMBER', rarity: 'RARE',
    manaCost: 4, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_ENEMY_UNITS' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 1, target: 'ALL_ENEMY_UNITS' }] }],
    flavorText: 'The Legion lights the brazier and then simply lets go of it.',
  },
  {
    ...spell, id: 'ver_verdant_rekindling', name: 'Verdant Rekindling', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 3, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'HEAL', amount: 5, target: 'ALLY_HERO' }, { type: 'BUFF', health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'Even in the Abyss, the green fire remembers how to grow.',
  },
  {
    ...spell, id: 'ast_starfall_lance', name: 'Starfall Lance', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 3, target: { kind: 'ANY_UNIT' }, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'A falling star, caught in a brazier and thrown again.',
  },
  // ----- Epics -----
  {
    ...spell, id: 'irn_molten_bulwark', name: 'Molten Bulwark', faction: 'IRON', rarity: 'EPIC',
    manaCost: 4, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'SUMMON', cardId: 'token_sentry', count: 2 }] }],
    description: 'Summon two 2/3 Brass Sentries with Guard.',
    flavorText: 'Pour the brass, cool it in the dark, and two sentries stand up out of the mould.',
  },
  {
    ...spell, id: 'tid_drowned_ward', name: 'Drowned Ward', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 5, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Undertow', 'Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }] }],
    description: "Return an enemy unit to its owner's hand. Freeze all other enemy units.",
    flavorText: 'The ring of runes closes. What is inside is taken; what is outside is held.',
  },
  {
    ...spell, id: 'neu_abyssal_pyre', name: 'Abyssal Pyre', faction: 'NEUTRAL', rarity: 'EPIC',
    manaCost: 4, target: { kind: 'ENEMY_UNIT' },
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET_AND_ADJACENT' }] }],
    description: 'Deal 3 damage to an enemy unit and the units next to it.',
    flavorText: 'Light one pyre in the Abyss and the ones beside it catch as well.',
  },
  // ----- Legendaries -----
  {
    ...spell, id: 'neu_crown_of_the_abyss', name: 'Crown of the Abyss', faction: 'NEUTRAL', rarity: 'LEGENDARY',
    manaCost: 5,
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 2, filter: { tag: 'Knight' } }, { type: 'REDUCE_COST', amount: 1, scope: 'HAND', filter: { tag: 'Knight' } }] }],
    description: 'Draw 2 Knights from your deck. Knights in your hand cost (1) less.',
    flavorText: 'Whoever lights the golden brazier is crowned. Every Knight below answers the call.',
  },
  {
    ...spell, id: 'ast_wings_of_the_last_light', name: 'Wings of the Last Light', faction: 'ASTRAL', rarity: 'LEGENDARY',
    manaCost: 5, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'ALL_ALLY_UNITS' }, { type: 'GRANT_KEYWORD', keyword: 'WARD', target: 'ALL_ALLY_UNITS' }] }],
    description: 'Give your units +2/+2 and Ward.',
    flavorText: 'The last light of the Conclave spread its wings over everyone still standing.',
  },

  // ===== Spells, second wave: sigils and pillars =====
  // ----- Commons -----
  {
    ...spell, id: 'emb_cinder_kiss', name: 'Cinder Kiss', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 1, target: { kind: 'ANY' }, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, condition: { kind: 'CONTROLS_TAG', tag: 'Knight' } }] }],
    description: 'Deal 1 damage to a character. If you control a Knight, draw a card.',
    flavorText: 'A kiss from the pyre. Knights learn to welcome it.',
  },
  {
    ...spell, id: 'irn_gild_the_blade', name: 'Gild the Blade', faction: 'IRON', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ALLY_UNIT' }, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 1, health: 2, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'GUARD', target: 'TARGET' }] }],
    description: 'Give a friendly unit +1/+2 and Guard.',
    flavorText: 'Gold over the blade, gold over the shield, and a promise to stand in front.',
  },
  {
    ...spell, id: 'tid_frostspear_volley', name: 'Frostspear Volley', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 2, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT', repeat: 2 }] }],
    description: 'Freeze a random enemy unit, twice.',
    flavorText: 'Two spears of ice, thrown blind into the dark. The deep is crowded; they rarely miss.',
  },
  {
    ...spell, id: 'emb_crimson_surge', name: 'Crimson Surge', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ALLY_UNIT' }, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 3, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'RUSH', target: 'TARGET' }] }],
    description: 'Give a friendly unit +3/+0 and Rush.',
    flavorText: 'The red fire does not warm. It pushes.',
  },
  {
    ...spell, id: 'ast_violet_vigil', name: 'Violet Vigil', faction: 'ASTRAL', rarity: 'COMMON',
    manaCost: 1, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { cardType: 'SPELL' } }] }],
    description: 'Draw a spell from your deck.',
    flavorText: 'Keep the violet lamp lit through the night, and by morning it will have written a new spell.',
  },
  {
    ...spell, id: 'tid_riptide_flow', name: 'Riptide Flow', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 3, target: { kind: 'ENEMY_UNIT', filter: { maxCost: 3 } }, archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    description: "Return an enemy unit that costs 3 or less to its owner's hand. Draw a card.",
    flavorText: 'The current takes what is light enough to carry.',
  },
  // ----- Rares -----
  {
    ...spell, id: 'emb_pyre_spiral', name: 'Pyre Spiral', faction: 'EMBER', rarity: 'RARE',
    manaCost: 3, target: { kind: 'ANY_UNIT' }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 2, target: 'TARGET' }] }],
    description: 'Deal 3 damage to a unit and apply Burn 2 to it.',
    flavorText: 'It coils once around its target, then tightens.',
  },
  {
    ...spell, id: 'vod_crystal_requiem', name: 'Crystal Requiem', faction: 'VOID', rarity: 'RARE',
    manaCost: 4, archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RESURRECT', count: 2, maxCost: 3 }] }],
    description: 'Resurrect 2 random friendly units that cost 3 or less and died this game.',
    flavorText: 'Each crystal petal holds one name. The Choir sings two of them back.',
  },
  {
    ...spell, id: 'ver_emerald_ward', name: 'Emerald Ward', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 3, target: { kind: 'ALLY_UNIT' }, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 2, health: 3, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'REGENERATE', target: 'TARGET' }] }],
    description: 'Give a friendly unit +2/+3 and Regenerate.',
    flavorText: 'A ring of green fire, and inside it, something that will not stay wounded.',
  },
  {
    ...spell, id: 'ast_azure_maelstrom', name: 'Azure Maelstrom', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 4, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The sky folds into a whirlpool and pours itself onto the battlefield.',
  },
  // ----- Epics -----
  {
    ...spell, id: 'irn_forgefire_ring', name: 'Forgefire Ring', faction: 'IRON', rarity: 'EPIC',
    manaCost: 4, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'GAIN_ARMOR', amount: 5, target: 'ALLY_HERO' }, { type: 'BUFF', attack: 1, health: 1, target: 'ALL_ALLY_UNITS' }] }],
    flavorText: 'Inside the ring of forge-fire, everything comes out harder than it went in.',
  },
  {
    ...spell, id: 'tid_glacial_thornwings', name: 'Glacial Thornwings', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 4, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMY_UNITS' }] }],
    description: 'Freeze all enemy units and deal 1 damage to them.',
    flavorText: 'Thorns of ice unfold like wings, and everything they touch stops.',
  },
  {
    ...spell, id: 'vod_pentacle_of_souls', name: 'Pentacle of Souls', faction: 'VOID', rarity: 'EPIC',
    manaCost: 4, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DEAL_DAMAGE', amount: 3, target: 'ALLY_HERO' }] }],
    description: 'Destroy an enemy unit. Deal 3 damage to your Warden.',
    flavorText: 'Five points, five prices. The Choir always pays the last one itself.',
  },
  // ----- Legendaries -----
  {
    ...spell, id: 'ast_sunburst_covenant', name: 'Sunburst Covenant', faction: 'ASTRAL', rarity: 'LEGENDARY',
    manaCost: 6, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALL_ENEMIES' }, { type: 'HEAL', amount: 3, target: 'ALL_ALLIES' }] }],
    description: 'Deal 3 damage to all enemies. Restore 3 Health to all friendly characters.',
    flavorText: 'The oldest covenant of the Conclave: the sun burns the dark and heals the light.',
  },
  {
    ...spell, id: 'neu_sigil_of_the_abyss_lord', name: 'Sigil of the Abyss Lord', faction: 'NEUTRAL', rarity: 'LEGENDARY',
    manaCost: 6, target: { kind: 'ENEMY_UNIT', filter: { maxCost: 5 } },
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'TAKE_CONTROL', target: 'TARGET' }] }],
    description: 'Take control of an enemy unit that costs 5 or less.',
    flavorText: 'Burn the winged sigil into the ground, and whoever stands on it swears to you.',
  },
];
