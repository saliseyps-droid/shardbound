import type { CardDefinition } from '@/game/types';

/**
 * LUMEN CONCLAVE — spells, card draw, manipulation.
 * Archetypes: Spellweave (cast many spells per turn), Starlit Control (draw, removal, finishers).
 */
const base = { faction: 'ASTRAL' as const, collectible: true };

export const ASTRAL_CARDS: CardDefinition[] = [
  // ----- Commons -----
  {
    ...base, id: 'ast_lumen_acolyte', name: 'Lumen Acolyte', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, attack: 1, health: 2, keywords: ['EMPOWER'], keywordValues: { EMPOWER: 1 }, tags: ['Mage'], archetypes: ['Spellweave'],
    flavorText: 'First-year students polish the telescopes. Second-years learn why they glow.',
  },
  {
    ...base, id: 'ast_starlit_spark', name: 'Starlit Spark', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 1, target: { kind: 'ANY' }, archetypes: ['Spellweave', 'Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }] }],
    description: 'Deal 1 damage to a character. Draw a card.',
    flavorText: 'A single spark, catalogued and named, can light a thousand pages.',
  },
  {
    ...base, id: 'ast_orrery_apprentice', name: 'Orrery Apprentice', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 3, tags: ['Mage'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, target: 'SELF' }] }],
    flavorText: 'Each spell turns another brass ring of her orrery. Each ring sharpens her aim.',
  },
  {
    ...base, id: 'ast_glimmer_wisp', name: 'Glimmer Wisp', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 2, attack: 2, health: 2, tags: ['Spirit'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'CREATE_CARD', cardId: 'token_mote_insight', destination: 'HAND', fleeting: true }] }],
    flavorText: 'It sheds a mote of starlight wherever it drifts. Scholars follow it with jars.',
  },
  {
    ...base, id: 'ast_prismwarden', name: 'Prismwarden', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 2, health: 6, keywords: ['GUARD'], tags: ['Construct'], archetypes: ['Starlit Control'],
    flavorText: 'Light bends around it. So do the blades of anyone foolish enough to charge.',
  },
  {
    ...base, id: 'ast_comet_scholar', name: 'Comet Scholar', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 3, attack: 3, health: 4, tags: ['Mage'], target: { kind: 'ENEMY_UNIT' }, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }] }],
    flavorText: 'She predicted the comet\'s landing site to the inch. Her rival did not move in time.',
  },
  {
    ...base, id: 'ast_nebula_sentinel', name: 'Nebula Sentinel', cardType: 'UNIT', rarity: 'COMMON', set: 'CORE', starter: true,
    manaCost: 5, attack: 5, health: 6, keywords: ['WARD'], tags: ['Spirit'], archetypes: ['Starlit Control'],
    flavorText: 'Woven from the dust between stars, it cannot be unmade by a mere incantation.',
  },
  {
    ...base, id: 'ast_chart_the_heavens', name: 'Chart the Heavens', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 1, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 2 }] }],
    flavorText: 'Every constellation is a sentence. Every sentence is a secret.',
  },
  {
    ...base, id: 'ast_hush_of_stars', name: 'Hush of Stars', cardType: 'SPELL', rarity: 'COMMON', set: 'CORE',
    manaCost: 1, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Starlit Control', 'Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'SILENCE', target: 'TARGET' }] }],
    flavorText: 'In the silence of the upper sky, even curses forget their words.',
  },
  {
    ...base, id: 'ast_ringing_refrain', name: 'Ringing Refrain', cardType: 'SPELL', rarity: 'COMMON', set: 'DEEP',
    manaCost: 1, keywords: ['ECHO'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'Conclave choirs sing a single note of light — and let the heavens repeat it.',
  },
  {
    ...base, id: 'ast_moonlit_librarian', name: 'Moonlit Librarian', cardType: 'UNIT', rarity: 'COMMON', set: 'DEEP',
    manaCost: 3, attack: 2, health: 4, tags: ['Mage'], archetypes: ['Spellweave', 'Starlit Control'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DRAW_CARDS', amount: 1, filter: { cardType: 'SPELL' } }] }],
    flavorText: 'She shelves books by the phase of the moon. Nobody else can find anything.',
  },

  // ----- Rares -----
  {
    ...base, id: 'ast_spellweaver_adept', name: 'Spellweaver Adept', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 3, attack: 3, health: 3, tags: ['Mage'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'DEAL_DAMAGE', amount: { kind: 'SPELLS_CAST_THIS_TURN', times: 2 }, target: 'RANDOM_ENEMY' }] }],
    description: 'On Deploy: Deal 2 damage to a random enemy for each spell you cast this turn.',
    flavorText: 'She weaves each finished spell into the next, until the pattern bites.',
  },
  {
    ...base, id: 'ast_starfall', name: 'Starfall', cardType: 'SPELL', rarity: 'RARE', set: 'CORE',
    manaCost: 3, target: { kind: 'ENEMY_UNIT' }, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'TARGET_AND_ADJACENT' }] }],
    flavorText: 'The Conclave does not throw stars. It simply stops holding them up.',
  },
  {
    ...base, id: 'ast_astrolabe_of_seers', name: 'Astrolabe of Seers', cardType: 'RELIC', rarity: 'RARE', set: 'CORE',
    manaCost: 2, charges: 3, archetypes: ['Spellweave', 'Starlit Control'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DRAW_CARDS', amount: 1 }] }],
    flavorText: 'Align the rings, speak a spell, and the future turns a page for you.',
  },
  {
    ...base, id: 'ast_starlight_mirror', name: 'Starlight Mirror', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 1, target: { kind: 'ANY_UNIT' }, archetypes: ['Starlit Control', 'Spellweave'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'COPY_CARD', destination: 'HAND', target: 'TARGET' }] }],
    flavorText: 'What the mirror sees, the Conclave keeps.',
  },
  {
    ...base, id: 'ast_veiled_astromancer', name: 'Veiled Astromancer', cardType: 'UNIT', rarity: 'RARE', set: 'CORE',
    manaCost: 4, attack: 4, health: 4, keywords: ['WARD'], tags: ['Mage'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'REDUCE_COST', amount: 1, scope: 'HAND', filter: { cardType: 'SPELL' } }] }],
    flavorText: 'Behind her veil, a sky no one else has ever seen.',
  },
  {
    ...base, id: 'ast_archive_unbound', name: 'Archive Unbound', cardType: 'SPELL', rarity: 'RARE', set: 'DEEP',
    manaCost: 4, archetypes: ['Starlit Control'],
    abilities: [
      { trigger: 'ON_CAST', effects: [{ type: 'DRAW_CARDS', amount: 2 }] },
      { trigger: 'ON_CAST', overcharge: 2, effects: [{ type: 'DRAW_CARDS', amount: 1 }, { type: 'GAIN_ARMOR', amount: 3 }] },
    ],
    description: 'Draw 2 cards. Overcharge 2: Draw another card and gain 3 Armor.',
    flavorText: 'Some books are chained for the reader\'s protection. Some are chained for the world\'s.',
  },

  // ----- Epics -----
  {
    ...base, id: 'ast_glass_observatory', name: 'The Glass Observatory', cardType: 'LOCATION', rarity: 'EPIC', set: 'CORE',
    manaCost: 3, duration: 3, archetypes: ['Spellweave', 'Starlit Control'],
    abilities: [{ trigger: 'TURN_START', effects: [{ type: 'CREATE_CARD', pool: { faction: 'ASTRAL', cardType: 'SPELL' }, destination: 'HAND' }] }],
    flavorText: 'Its dome is ground from a single fallen Shard. The stars look back.',
  },
  {
    ...base, id: 'ast_collapse_of_heaven', name: 'Collapse of Heaven', cardType: 'SPELL', rarity: 'EPIC', set: 'CORE',
    manaCost: 4, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 4, target: 'ALL_UNITS' }] }],
    flavorText: 'The astromancers call it "rewriting the chart". Everyone else calls it the end.',
  },
  {
    ...base, id: 'ast_conduit_of_lumen', name: 'Conduit of Lumen', cardType: 'UNIT', rarity: 'EPIC', set: 'CORE',
    manaCost: 3, attack: 3, health: 4, tags: ['Construct'], archetypes: ['Spellweave'],
    costAura: { side: 'ALLY', cardType: 'SPELL', amount: -1 },
    flavorText: 'A lattice of lenses that drinks starlight and pours it, cheaply, into spells.',
  },
  {
    ...base, id: 'ast_pilfered_constellation', name: 'Pilfered Constellation', cardType: 'SPELL', rarity: 'EPIC', set: 'DEEP',
    manaCost: 3, archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_CAST', effects: [{ type: 'STEAL_CARD', from: 'DECK', amount: 2 }] }],
    flavorText: 'Read an enemy\'s stars closely enough, and they become yours.',
  },

  // ----- Legendaries -----
  {
    ...base, id: 'ast_selenne', name: 'Selenne, Keeper of Orbits', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'CORE',
    manaCost: 5, attack: 4, health: 6, tags: ['Mage'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'SUMMON', cardId: 'token_star_fragment' }] }],
    flavorText: 'Every spell she casts leaves a new star in orbit around her. She has lost count.',
  },
  {
    ...base, id: 'ast_oruvael', name: 'Oruvael, the Final Star', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'DEEP',
    manaCost: 8, attack: 8, health: 8, keywords: ['WARD'], tags: ['Spirit'], archetypes: ['Starlit Control'],
    abilities: [{ trigger: 'ON_DEPLOY', effects: [{ type: 'SILENCE', target: 'ALL_ENEMY_UNITS' }, { type: 'DRAW_CARDS', amount: 2 }] }],
    description: 'Ward. On Deploy: Silence all enemy units. Draw 2 cards.',
    flavorText: 'When the last star in the Conclave\'s chart burns out, it will be this one.',
  },
  {
    ...base, id: 'ast_liu_kano', name: 'Liu Kano', cardType: 'UNIT', rarity: 'LEGENDARY', set: 'ABYSS',
    manaCost: 6, attack: 5, health: 5, keywords: ['WARD'], tags: ['Knight'], archetypes: ['Spellweave'],
    abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }] }],
    flavorText: 'He left the Conclave\'s light to hunt what hides in the dark. He took the light with him.',
  },
];
