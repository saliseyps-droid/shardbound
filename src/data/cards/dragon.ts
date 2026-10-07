import type { CardDefinition, Condition } from '@/game/types';

/**
 * DRAGON REALM — Dragons, the Dragon Knights who ride beside them, and the Fae of the old woods.
 * Set theme: Dragons (tag 'Dragon') are big, breath-weapon bodies; Knights (tag 'Knight', so the
 * Legions of Shadow Knight cards work with them) and spells reward controlling a Dragon; Fae (tag 'Fae')
 * are cheap tricksters with their own small engine (Maelis, Glowmoss Fae, The Faerie Ring).
 */
const dragon = { cardType: 'UNIT' as const, set: 'DRAGON' as const, collectible: true, tags: ['Dragon'] };
const knight = { cardType: 'UNIT' as const, set: 'DRAGON' as const, collectible: true, tags: ['Knight'] };
const fae = { cardType: 'UNIT' as const, set: 'DRAGON' as const, collectible: true, tags: ['Fae'] };
const spell = { cardType: 'SPELL' as const, set: 'DRAGON' as const, collectible: true };
const relic = { cardType: 'RELIC' as const, set: 'DRAGON' as const, collectible: true };
const location = { cardType: 'LOCATION' as const, set: 'DRAGON' as const, collectible: true };

/** "If you control a Dragon" (another one, when the source is itself a Dragon). */
const HAS_DRAGON: Condition = { kind: 'CONTROLS_TAG', tag: 'Dragon' };

export const DRAGON_CARDS: CardDefinition[] = [
  // ===== Ember =====
  {
    ...dragon, id: 'emb_redsky_wyrm', name: 'Redsky Wyrm', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 4, attack: 4, health: 3, keywords: ['RUSH'], archetypes: ['Blitz'],
    flavorText: 'When the sky over the Caldera turns red, the shepherds count their flocks twice.',
  },
  {
    ...dragon, id: 'emb_cinderperch_drake', name: 'Cinderperch Drake', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GRANT_KEYWORD', keyword: 'SWIFT', target: 'SELF', condition: HAS_DRAGON }] }],
    flavorText: 'It waits on the warm rocks until the flight passes overhead, then joins the hunt.',
  },
  {
    ...dragon, id: 'emb_magmaclaw_drake', name: 'Magmaclaw Drake', faction: 'EMBER', rarity: 'RARE',
    manaCost: 5, attack: 5, health: 4, keywords: ['RUSH'], archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_KILL', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ENEMY_HERO' }] }],
    flavorText: 'Its claws leave burning tracks, and every track leads to the enemy camp.',
  },
  {
    ...dragon, id: 'emb_ashwing_matriarch', name: 'Ashwing Matriarch', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 7, attack: 5, health: 5, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SUMMON', cardId: 'token_drakeling', count: 2 }] }],
    flavorText: 'She never flies alone. The little ones learn to burn by watching her.',
  },
  {
    ...dragon, id: 'emb_pyraxis_ashen_sovereign', name: 'Pyraxis, the Ashen Sovereign', faction: 'EMBER', rarity: 'LEGENDARY',
    manaCost: 8, attack: 6, health: 6, archetypes: ['Pyromancy'],
    abilities: [{
      trigger: 'ON_DEPLOY',
      effects: [
        { type: 'DEAL_DAMAGE', amount: 3, target: 'ALL_ENEMY_UNITS' },
        { type: 'DEAL_DAMAGE', amount: 3, target: 'ENEMY_HERO', condition: HAS_DRAGON },
      ],
    }],
    flavorText: 'Kingdoms rose and fell under his wings. He only remembers the ones that burned well.',
  },
  {
    ...knight, id: 'emb_flamebrand_dragonknight', name: 'Flamebrand Dragonknight', faction: 'EMBER', rarity: 'RARE',
    manaCost: 4, attack: 4, health: 4, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY', condition: HAS_DRAGON }] }],
    flavorText: 'His sword was quenched in dragonfire. It has not stopped glowing since.',
  },
  {
    ...fae, id: 'emb_cinderwing_pixie', name: 'Cinderwing Pixie', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 1, attack: 1, health: 1, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Every spark that drifts off a dragon fire becomes one of them. Most of them are angry about it.',
  },
  {
    ...fae, id: 'emb_blazeheart_fae', name: 'Blazeheart Fae', faction: 'EMBER', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 3, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', pool: { faction: 'EMBER', cardType: 'SPELL', maxCost: 2 }, destination: 'HAND' }] }],
    flavorText: 'She carries a flame in her palm the way others carry a lantern.',
  },
  {
    ...spell, id: 'emb_wyrmfire_breath', name: 'Wyrmfire Breath', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ANY_UNIT' }, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET', bonus: { amount: 1, condition: HAS_DRAGON } }] }],
    flavorText: 'Borrowed from a dragon for a single breath. Returned with interest.',
  },
  {
    ...spell, id: 'emb_kindled_roar', name: 'Kindled Roar', faction: 'EMBER', rarity: 'COMMON',
    manaCost: 2, archetypes: ['Pyromancy'],
    abilities: [{
      trigger: 'ON_CAST',
      effects: [
        { type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' },
        { type: 'APPLY_STATUS', status: 'BURN', amount: 1, target: 'ALL_ENEMY_UNITS', condition: HAS_DRAGON },
      ],
    }],
    flavorText: 'The roar is hot enough. When a dragon joins in, the grass catches fire.',
  },
  {
    ...spell, id: 'emb_call_of_the_red_sun', name: 'Call of the Red Sun', faction: 'EMBER', rarity: 'RARE',
    manaCost: 3, archetypes: ['Blitz'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Dragon' } }, { type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    description: 'Draw a Dragon from your deck. Deal 2 damage to a random enemy.',
    flavorText: 'The sun-priests raise their hands at dawn, and something with wings answers.',
  },
  {
    ...spell, id: 'emb_ashen_ascension', name: 'Ashen Ascension', faction: 'EMBER', rarity: 'EPIC',
    manaCost: 5, archetypes: ['Pyromancy'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALL_ENEMIES', bonus: { amount: 1, condition: HAS_DRAGON } }] }],
    flavorText: 'She rose from the pyre with a firebird on her wrist. Her enemies did not rise at all.',
  },

  // ===== Tide =====
  {
    ...dragon, id: 'tid_brinescale_drake', name: 'Brinescale Drake', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 4, attack: 3, health: 5, archetypes: ['Deep Freeze'],
    target: { kind: 'ENEMY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] }],
    flavorText: 'Its breath is sea spray at the edge of winter. Sailors call it the white squall.',
  },
  {
    ...dragon, id: 'tid_stormtide_wyrm', name: 'Stormtide Wyrm', faction: 'TIDE', rarity: 'RARE',
    manaCost: 5, attack: 4, health: 5, archetypes: ['Undertow'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { maxCost: 3 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }] }],
    flavorText: 'One beat of its wings and the little ones are washed back to shore.',
  },
  {
    ...dragon, id: 'tid_wavebreaker_wyrm', name: 'Wavebreaker Wyrm', faction: 'TIDE', rarity: 'EPIC',
    manaCost: 6, attack: 5, health: 5, keywords: ['WARD'], archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT', repeat: 2 }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'It rises from the surf in a storm of ice. The breakwater did not stop it. Nothing does.',
  },
  {
    ...dragon, id: 'tid_glacivar_rime_sovereign', name: 'Glacivar, the Rime Sovereign', faction: 'TIDE', rarity: 'LEGENDARY',
    manaCost: 8, attack: 6, health: 8, keywords: ['WARD'], archetypes: ['Deep Freeze'],
    abilities: [{
      trigger: 'ON_DEPLOY',
      effects: [
        { type: 'APPLY_STATUS', status: 'FROZEN', target: 'ALL_ENEMY_UNITS' },
        { type: 'DRAW_CARDS', amount: { kind: 'FROZEN_ENEMY_COUNT', max: 2 } },
      ],
    }],
    description: 'Ward. On Deploy: Freeze all enemy units. Draw a card for each Frozen enemy (up to 2).',
    flavorText: 'The glaciers are not ice. They are the places where Glacivar once lay down to sleep.',
  },
  {
    ...knight, id: 'tid_rimewing_dragoon', name: 'Rimewing Dragoon', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 4, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT', condition: HAS_DRAGON }] }],
    flavorText: 'He rides the cold winds behind the white wyrms and finishes what their breath begins.',
  },
  {
    ...knight, id: 'tid_frostblade_dragonknight', name: 'Frostblade Dragonknight', faction: 'TIDE', rarity: 'RARE',
    manaCost: 4, attack: 4, health: 4, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ON_ATTACK', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }] }],
    description: 'Whenever this attacks a unit, Freeze it.',
    flavorText: 'A cut from his blade does not bleed. It frosts over.',
  },
  {
    ...fae, id: 'tid_dewglass_sprite', name: 'Dewglass Sprite', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 2, archetypes: ['Undertow'],
    target: { kind: 'OTHER_ALLY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET', costReduction: 1 }] }],
    flavorText: 'She folds a tired friend into a dewdrop and carries them home.',
  },
  {
    ...fae, id: 'tid_tidewhisper_fae', name: 'Tidewhisper Fae', faction: 'TIDE', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 2, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'She hums the songs the sea sings under the ice, and whoever hears them stands very still.',
  },
  {
    ...relic, id: 'tid_frostwyrm_lodestar', name: 'Frostwyrm Lodestar', faction: 'TIDE', rarity: 'RARE',
    manaCost: 1, charges: 3, archetypes: ['Deep Freeze'],
    abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Dragon' }, effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }],
    flavorText: 'A star of ice that always points north, to where the white wyrms sleep.',
  },
  {
    ...spell, id: 'tid_tideglass_grasp', name: 'Tideglass Grasp', faction: 'TIDE', rarity: 'COMMON',
    manaCost: 1, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Deep Freeze'],
    abilities: [{
      trigger: 'ON_CAST',
      effects: [
        { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' },
        { type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET', condition: HAS_DRAGON },
      ],
    }],
    description: 'Freeze an enemy unit. If you control a Dragon, also deal 2 damage to it.',
    flavorText: 'The sea closes its hand. When a dragon is watching, it squeezes.',
  },
  {
    ...spell, id: 'tid_deep_current_rite', name: 'Deep Current Rite', faction: 'TIDE', rarity: 'RARE',
    manaCost: 5, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Undertow'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The rite calls the deep current up through the stone. It takes one guest back down with it.',
  },

  // ===== Void =====
  {
    ...dragon, id: 'vod_nyxarath_hollow_wyrm', name: 'Nyxarath, the Hollow Wyrm', faction: 'VOID', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 6, keywords: ['DRAIN'], archetypes: ['Offering'],
    target: { kind: 'ENEMY_UNIT', optional: true, filter: { minAttack: 4 } },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DESTROY', target: 'TARGET' }] }],
    flavorText: 'The Hollow Choir sings to it every night. It has never once sung back, only eaten.',
  },
  {
    ...dragon, id: 'vod_ruinwing_drake', name: 'Ruinwing Drake', faction: 'VOID', rarity: 'COMMON',
    manaCost: 5, attack: 5, health: 5, archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'It nests in the ruins it made. When it falls, the ruins fall with it.',
  },
  {
    ...dragon, id: 'vod_gloomcoil_serpent', name: 'Gloomcoil Serpent', faction: 'VOID', rarity: 'COMMON',
    manaCost: 3, attack: 2, health: 4, archetypes: ['Requiem'],
    abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF' }] }],
    flavorText: 'Every soul that slips past it makes the coils a little longer.',
  },
  {
    ...dragon, id: 'vod_duskmaw_dragon', name: 'Duskmaw Dragon', faction: 'VOID', rarity: 'EPIC',
    manaCost: 6, attack: 5, health: 5, keywords: ['DRAIN'], archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_KILL', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'SELF' }] }],
    flavorText: 'At dusk it opens its jaws, and the light goes in first.',
  },
  {
    ...knight, id: 'vod_duskblade_dragonknight', name: 'Duskblade Dragonknight', faction: 'VOID', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 4, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GRANT_KEYWORD', keyword: 'DRAIN', target: 'SELF', condition: HAS_DRAGON }] }],
    flavorText: 'His blade drinks the same way his dragon does: slowly, and never enough.',
  },
  {
    ...knight, id: 'vod_bloodwing_reaver', name: 'Bloodwing Reaver', faction: 'VOID', rarity: 'RARE',
    manaCost: 4, attack: 4, health: 4, archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Dragon' } }] }],
    description: 'Last Breath: Draw a Dragon from your deck.',
    flavorText: 'When he falls, his last cry carries to the roost. Something always answers.',
  },
  {
    ...fae, id: 'vod_nightshade_fae', name: 'Nightshade Fae', faction: 'VOID', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 3, archetypes: ['Requiem'],
    abilities: [{ trigger: 'LAST_BREATH', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Pluck her and she stings. Crush her and she stings harder.',
  },
  {
    ...fae, id: 'vod_gloamveil_fae', name: 'Gloamveil Fae', faction: 'VOID', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 2, keywords: ['AMBUSH', 'VENOM'], archetypes: ['Offering'],
    flavorText: 'You will see her wings once, in the gloam between two trees. Once is enough.',
  },
  {
    ...spell, id: 'vod_soulflame_orb', name: 'Soulflame Orb', faction: 'VOID', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ANY_UNIT' }, archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, condition: { kind: 'ALLY_DIED_THIS_TURN' } }] }],
    flavorText: 'It burns with whatever was lost today. Some days it burns very brightly.',
  },
  {
    ...spell, id: 'vod_wyrmsoul_rebirth', name: 'Wyrmsoul Rebirth', faction: 'VOID', rarity: 'EPIC',
    manaCost: 5, archetypes: ['Requiem'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'RESURRECT', count: 2, maxCost: 5 }] }],
    flavorText: 'The Choir sings the old name backwards, and the bones remember how to stand.',
  },
  {
    ...location, id: 'vod_wyrmbone_sanctum', name: 'The Wyrmbone Sanctum', faction: 'VOID', rarity: 'EPIC',
    manaCost: 2, duration: 3, archetypes: ['Requiem'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'DRAW_CARDS', amount: 1, condition: HAS_DRAGON }] }],
    flavorText: 'Built inside the ribcage of the first dragon. It still whispers to its children.',
  },
  {
    ...spell, id: 'vod_grave_dragons_pact', name: "Grave-Dragon's Pact", faction: 'VOID', rarity: 'RARE',
    manaCost: 3, target: { kind: 'ALLY_UNIT' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 2, filter: { tag: 'Dragon' } }] }],
    description: 'Destroy a friendly unit. Draw 2 Dragons from your deck.',
    flavorText: 'The grave-dragon asks for one life. In return, it sends two of its kin.',
  },
  {
    ...spell, id: 'vod_umbral_siphon', name: 'Umbral Siphon', faction: 'VOID', rarity: 'COMMON',
    manaCost: 3, target: { kind: 'ENEMY' }, archetypes: ['Offering'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET' }, { type: 'HEAL', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'What she takes from them, she keeps. What she keeps, she gives to you.',
  },

  // ===== Verdant =====
  {
    ...dragon, id: 'ver_thornhide_drake', name: 'Thornhide Drake', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 5, attack: 4, health: 6, keywords: ['REGENERATE'], archetypes: ['Overgrowth'],
    flavorText: 'Moss grows between its scales. Cut it and the moss closes the wound overnight.',
  },
  {
    ...dragon, id: 'ver_glade_wyrm', name: 'Glade Wyrm', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 5, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'TURN_END', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_OTHER_ALLY_UNIT' }] }],
    flavorText: 'Where it lies down to sleep, a glade grows. Whoever shelters there wakes stronger.',
  },
  {
    ...dragon, id: 'ver_elderhorn_wyrm', name: 'Elderhorn Wyrm', faction: 'VERDANT', rarity: 'EPIC',
    manaCost: 6, attack: 6, health: 7, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 5, target: 'ALLY_HERO' }, { type: 'BUFF', attack: 1, health: 1, target: 'OTHER_ALLY_UNITS' }] }],
    flavorText: 'Older than the Thornweald. The Circle says the first trees grew from its shed horns.',
  },
  {
    ...knight, id: 'ver_emerald_dragonknight', name: 'Emerald Dragonknight', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 3, attack: 4, health: 4, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'HEAL', amount: 2, target: 'ALLY_HERO' }, { type: 'BUFF', attack: 1, health: 1, target: 'SELF', condition: HAS_DRAGON }] }],
    flavorText: 'His blade is a sliver of living jade. It grows a little every spring.',
  },
  {
    ...knight, id: 'ver_sunspear_dragoon', name: 'Sunspear Dragoon', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 4, attack: 3, health: 4, archetypes: ['Overgrowth'],
    target: { kind: 'OTHER_ALLY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'TARGET' }] }],
    flavorText: 'He raises his spear to the sun, and the whole line stands a little taller.',
  },
  {
    ...fae, id: 'ver_bramblewing_pixie', name: 'Bramblewing Pixie', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 1, attack: 1, health: 1, archetypes: ['Overgrowth'],
    target: { kind: 'OTHER_ALLY_UNIT', optional: true },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TARGET' }] }],
    flavorText: 'A kiss from a bramble pixie leaves a scratch, and a little extra courage.',
  },
  {
    ...fae, id: 'ver_glowmoss_fae', name: 'Glowmoss Fae', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 3, attack: 2, health: 3, archetypes: ['Overgrowth'],
    abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Fae' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TRIGGER_UNIT' }] }],
    flavorText: 'She lights the way for her sisters. Each one arrives brighter than the last.',
  },
  {
    ...fae, id: 'ver_maelis_queen_of_the_glade', name: 'Maelis, Queen of the Glade', faction: 'VERDANT', rarity: 'LEGENDARY',
    manaCost: 5, attack: 4, health: 5, archetypes: ['Overgrowth'],
    costAura: { side: 'ALLY', tag: 'Fae', amount: -1 },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 2, filter: { tag: 'Fae' } }] }],
    description: 'Your Fae cost (1) less. On Deploy: Draw 2 Fae from your deck.',
    flavorText: 'When the Queen of the Glade laughs, every flower in the Thornweald turns to listen.',
  },
  {
    ...spell, id: 'ver_sapsong_blessing', name: 'Sapsong Blessing', faction: 'VERDANT', rarity: 'COMMON',
    manaCost: 2, target: { kind: 'ALLY_UNIT' }, archetypes: ['Wellspring'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'BUFF', attack: 2, health: 2, target: 'TARGET' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'The druids sing to the sap, and the sap sings back through whoever they touch.',
  },
  {
    ...location, id: 'ver_the_faerie_ring', name: 'The Faerie Ring', faction: 'VERDANT', rarity: 'RARE',
    manaCost: 1, duration: 3, archetypes: ['Wellspring'],
    costAura: { side: 'ALLY', tag: 'Fae', amount: -1 },
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'HEAL', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'Step inside the ring of light and the Fae come to you. Step out, if you can.',
  },

  // ===== Astral =====
  {
    ...dragon, id: 'ast_selunith_the_moonwyrm', name: 'Selunith, the Moonwyrm', faction: 'ASTRAL', rarity: 'LEGENDARY',
    manaCost: 7, attack: 6, health: 6, keywords: ['WARD'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', pool: { faction: 'ASTRAL', cardType: 'SPELL' }, count: 2, destination: 'HAND', costReduction: 2 }] }],
    description: 'Ward. On Deploy: Add 2 random Lumen Conclave spells to your hand. They cost (2) less.',
    flavorText: 'The Conclave charts the moon. The moon, they eventually learned, was charting them.',
  },
  {
    ...dragon, id: 'ast_starveil_drake', name: 'Starveil Drake', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 5, attack: 5, health: 7, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { cardType: 'SPELL' } }] }],
    flavorText: 'Its scales hold the colour of the sky an hour after sunset, and the spells that live there.',
  },
  {
    ...knight, id: 'ast_sunscarf_dragoon', name: 'Sunscarf Dragoon', faction: 'ASTRAL', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 3, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, condition: HAS_DRAGON }] }],
    flavorText: 'He reads the stars for his dragon. His dragon reads the battlefield for him.',
  },
  {
    ...knight, id: 'ast_highspire_dragonkin', name: 'Highspire Dragonkin', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 5, attack: 4, health: 5, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', pool: { tag: 'Dragon' }, destination: 'HAND', costReduction: 2 }] }],
    flavorText: 'Half knight, half dragon, and the keeper of every roost in the Highspire.',
  },
  {
    ...fae, id: 'ast_glimmerwing_sprite', name: 'Glimmerwing Sprite', faction: 'ASTRAL', rarity: 'COMMON',
    manaCost: 1, attack: 1, health: 3, keywords: ['BARRIER', 'EMPOWER'], keywordValues: { EMPOWER: 1 }, archetypes: ['Spellweave'],
    flavorText: 'She sits on the edge of a spell and makes it a little brighter.',
  },
  {
    ...fae, id: 'ast_prismwing_enchantress', name: 'Prismwing Enchantress', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 2, attack: 2, health: 3, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'REDUCE_COST', amount: 1, scope: 'HAND', filter: { cardType: 'SPELL' } }] }],
    flavorText: 'Light passes through her wings and comes out as seven easier spells.',
  },
  {
    ...spell, id: 'ast_amethyst_spark', name: 'Amethyst Spark', faction: 'ASTRAL', rarity: 'COMMON',
    manaCost: 1, target: { kind: 'ENEMY' }, archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1, condition: HAS_DRAGON }] }],
    flavorText: 'A chip of dragon amethyst, thrown hard enough to make a point.',
  },
  {
    ...spell, id: 'ast_radiant_wyrmlight', name: 'Radiant Wyrmlight', faction: 'ASTRAL', rarity: 'RARE',
    manaCost: 4, target: { kind: 'ALLY_UNIT' }, archetypes: ['Starlit Control'],
    abilities: [{
      trigger: 'ON_CAST',
      effects: [
        { type: 'BUFF', attack: 2, health: 2, target: 'TARGET' },
        { type: 'GRANT_KEYWORD', keyword: 'WARD', target: 'TARGET' },
        { type: 'DRAW_CARDS', amount: 1 },
      ],
    }],
    description: 'Give a friendly unit +2/+2 and Ward. Draw a card.',
    flavorText: 'The light a dragon sheds when it is pleased with you.',
  },
  {
    ...location, id: 'ast_the_moonfire_circle', name: 'The Moonfire Circle', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 1, duration: 3, archetypes: ['Starlit Control'],
    costAura: { side: 'ALLY', tag: 'Dragon', amount: -1 },
    flavorText: 'A blue fire that burns only under the full moon. Dragons cross half the world to roost beside it.',
  },
  {
    ...spell, id: 'ast_halo_of_the_starwyrm', name: 'Halo of the Starwyrm', faction: 'ASTRAL', rarity: 'EPIC',
    manaCost: 5, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'The Starwyrm spreads its wings behind her, and the stars fall where she points.',
  },

  // ===== Iron =====
  {
    ...dragon, id: 'irn_anvilwing_drake', name: 'Anvilwing Drake', faction: 'IRON', rarity: 'COMMON',
    manaCost: 2, attack: 3, health: 4, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }] }],
    flavorText: 'The Dominion smiths shoe it like a horse and plate it like a fortress.',
  },
  {
    ...dragon, id: 'irn_silverscale_drake', name: 'Silverscale Drake', faction: 'IRON', rarity: 'COMMON',
    manaCost: 4, attack: 4, health: 6, keywords: ['GUARD'], archetypes: ['Bulwark'],
    flavorText: 'Its scales ring like a struck bell. Arrows only make it sing.',
  },
  {
    ...dragon, id: 'irn_bronzecoil_wyrm', name: 'Bronzecoil Wyrm', faction: 'IRON', rarity: 'RARE',
    manaCost: 5, attack: 6, health: 7, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 4, target: 'ALLY_HERO' }] }],
    flavorText: 'It coils around the Dominion foundries, and nothing gets in that it does not allow.',
  },
  {
    ...dragon, id: 'irn_ironspine_dragon', name: 'Ironspine Dragon', faction: 'IRON', rarity: 'EPIC',
    manaCost: 6, attack: 6, health: 7, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [
      { trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }] },
      { trigger: 'ARMOR_GAINED', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF' }] },
    ],
    flavorText: 'Every plate the smiths add, it wears like a trophy.',
  },
  {
    ...knight, id: 'irn_goldwing_vanguard', name: 'Goldwing Vanguard', faction: 'IRON', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 5, keywords: ['GUARD'], archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }, { type: 'BUFF', attack: 1, health: 1, target: 'SELF', condition: HAS_DRAGON }] }],
    flavorText: 'He stands in front of the dragons so the dragons can stand in front of everyone else.',
  },
  {
    ...knight, id: 'irn_valdrek_wingmarshal', name: 'Valdrek, Wingmarshal', faction: 'IRON', rarity: 'LEGENDARY',
    manaCost: 6, attack: 5, health: 6, archetypes: ['Bulwark'],
    aura: { target: 'ALLY_UNITS', tag: 'Dragon', attack: 1 },
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 2, filter: { tag: 'Dragon' } }] }],
    description: 'Your Dragons have +1 Attack. On Deploy: Draw 2 Dragons from your deck.',
    flavorText: 'The Dominion gave him a fortress. He traded it for a sky full of wings.',
  },
  {
    ...relic, id: 'irn_dragonforge_star', name: 'Dragonforge Star', faction: 'IRON', rarity: 'RARE',
    manaCost: 1, charges: 3, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Dragon' }, effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }] }],
    flavorText: 'Forged in dragonfire, it glows whenever one of its makers is near.',
  },
  {
    ...spell, id: 'irn_runeforged_scales', name: 'Runeforged Scales', faction: 'IRON', rarity: 'COMMON',
    manaCost: 2, archetypes: ['Bulwark'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'GAIN_ARMOR', amount: 4, target: 'ALLY_HERO' }, { type: 'DRAW_CARDS', amount: 1, condition: HAS_DRAGON }] }],
    flavorText: 'Shed dragon scales, hammered flat and carved with a rune. Better than any steel.',
  },

  // ===== Neutral =====
  {
    ...dragon, id: 'neu_redcrag_drake', name: 'Redcrag Drake', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 3, attack: 3, health: 3,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'SELF', condition: HAS_DRAGON }] }],
    flavorText: 'Alone it is a nuisance. In a flight it is a disaster.',
  },
  {
    ...dragon, id: 'neu_duskhorn_dragon', name: 'Duskhorn Dragon', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 6, attack: 8, health: 4,
    flavorText: 'No banner, no master, no hurry. It goes where it likes and takes what it finds.',
  },
  {
    ...dragon, id: 'neu_aurumvex_the_hoardwyrm', name: 'Aurumvex, the Hoardwyrm', faction: 'NEUTRAL', rarity: 'LEGENDARY',
    manaCost: 8, attack: 7, health: 7,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', pool: { tag: 'Dragon' }, count: 2, destination: 'HAND' }] }],
    flavorText: 'His hoard is not gold. It is a sphere of eggs, and every one of them is hungry.',
  },
  {
    ...fae, id: 'neu_wanderwing_fae', name: 'Wanderwing Fae', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 2, attack: 2, health: 2,
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Fae' } }] }],
    description: 'On Deploy: Draw a Fae from your deck.',
    flavorText: 'She has visited every glade in Aethra, and she always brings a friend back.',
  },
  {
    ...spell, id: 'neu_wyrmcall', name: 'Wyrmcall', faction: 'NEUTRAL', rarity: 'COMMON',
    manaCost: 1,
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { tag: 'Dragon' } }] }],
    description: 'Draw a Dragon from your deck.',
    flavorText: 'A single word in the old tongue, shaped like a coiling wyrm.',
  },
  {
    ...relic, id: 'neu_wyrmlord_sigil', name: 'Sigil of the Wyrmlords', faction: 'NEUTRAL', rarity: 'RARE',
    manaCost: 2, charges: 3,
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'REDUCE_COST', amount: 1, scope: 'HIGHEST_COST_IN_HAND', filter: { tag: 'Dragon' } }] }],
    flavorText: 'The Wyrmlords burned it into the sky. Dragons still answer it faster than they should.',
  },
];
