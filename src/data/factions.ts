import type { Faction } from '@/game/types';

export interface FactionInfo {
  id: Faction;
  name: string;
  short: string;
  motto: string;
  identity: string;
  lore: string;
  archetypes: { name: string; description: string }[];
  /** Visual identity used by card frames, art generator and UI accents. */
  colors: { primary: string; secondary: string; glow: string; dark: string };
  sigil: string;
}

export const WORLD_LORE = {
  title: 'The Shattering of Aethra',
  paragraphs: [
    'For a thousand years the Sundered Crown hovered above the world of Aethra, a lattice of living crystal that held the elements in balance. When the last Sovereign vanished, the Crown cracked into ten thousand Shards and rained across the continents.',
    'Each Shard is a fragment of raw Aether — power enough to raise a forest overnight, boil a sea, or wake the dead. Those who can bind Shards to their will are called Wardens, and every faction of Aethra now races to claim them before the Crown can be re-forged in someone else\'s image.',
    'You are a newly awakened Warden. Your Shards answer when you call them into battle as cards: soldiers, spells, relics and the very places where history is made.',
  ],
};

export const FACTIONS: Record<Faction, FactionInfo> = {
  EMBER: {
    id: 'EMBER',
    name: 'Cinder Legion',
    short: 'Cinder',
    motto: 'Burn bright. Burn first.',
    identity: 'Aggressive units, direct damage and Burn. Wins fast before opponents stabilise.',
    lore: 'Born in the volcanic caldera of Kharzul, the Legion believes the Crown\'s fall was a purification. Their pyromancers and drake-riders march under banners of living flame, and they would rather see Aethra scorched than ruled by anyone else.',
    archetypes: [
      { name: 'Blitz', description: 'Cheap Swift units and burn spells aimed at the enemy Warden.' },
      { name: 'Pyromancy', description: 'Empower and spell-damage payoffs that turn every spell into a fireball.' },
    ],
    colors: { primary: '#ff6a3d', secondary: '#ffb347', glow: '#ff7b39', dark: '#3a1208' },
    sigil: 'flame',
  },
  VERDANT: {
    id: 'VERDANT',
    name: 'Thornweald Circle',
    short: 'Thornweald',
    motto: 'What is rooted endures.',
    identity: 'Healing, growth, buffs and resilient defenders. Outlasts and overgrows.',
    lore: 'The druids of the Thornweald sing to the World-Root that runs beneath every continent. Where a Shard falls in their forests, groves erupt in a single night, and the Circle swears to keep the Crown\'s power in the soil where it belongs.',
    archetypes: [
      { name: 'Overgrowth', description: 'Buff your units every turn until they tower over the board.' },
      { name: 'Wellspring', description: 'Healing payoffs that turn restored Health into value.' },
    ],
    colors: { primary: '#5fcf6a', secondary: '#c7ef7a', glow: '#7dff8a', dark: '#0e2a12' },
    sigil: 'leaf',
  },
  IRON: {
    id: 'IRON',
    name: 'Brass Dominion',
    short: 'Brass',
    motto: 'Progress is inevitable.',
    identity: 'Constructs, Armor and energy generation. Builds an engine, then overwhelms.',
    lore: 'The foundry-cities of the Brass Dominion harvest Shards to fuel their engines. Their artificers believe the Crown was merely a machine, and machines can be rebuilt — better, stronger, and answering only to the Dominion Assembly.',
    archetypes: [
      { name: 'Assembly Line', description: 'Construct synergies that reward flooding the board with machines.' },
      { name: 'Bulwark', description: 'Gain Armor and ramp energy to land huge late-game threats.' },
    ],
    colors: { primary: '#d8a24a', secondary: '#9fb4c7', glow: '#ffd27a', dark: '#2a1d0b' },
    sigil: 'gear',
  },
  ASTRAL: {
    id: 'ASTRAL',
    name: 'Lumen Conclave',
    short: 'Lumen',
    motto: 'Every star is a written word.',
    identity: 'Spells, card draw and manipulation. Controls the game and wins with a single brilliant turn.',
    lore: 'High above the clouds, the astromancers of the Lumen Conclave chart the orbits of falling Shards. They consider themselves the Crown\'s rightful archivists, and they fight with spells scribed in starlight.',
    archetypes: [
      { name: 'Spellweave', description: 'Cast many spells in one turn to empower Spellweave payoffs.' },
      { name: 'Starlit Control', description: 'Draw, remove and stall until a finisher closes the game.' },
    ],
    colors: { primary: '#7ea6ff', secondary: '#d7c7ff', glow: '#9fd0ff', dark: '#0d1433' },
    sigil: 'star',
  },
  VOID: {
    id: 'VOID',
    name: 'Hollow Choir',
    short: 'Hollow',
    motto: 'All songs end in silence.',
    identity: 'Sacrifice, Last Breath triggers and resurrection. Turns death into power.',
    lore: 'Where Shards pierced the earth too deep, the Hollow opened. The Choir are those who heard its song and answered — cultists, wraiths and things that were once people, who believe death is only a verse in a longer hymn.',
    archetypes: [
      { name: 'Requiem', description: 'Last Breath units and effects that trigger whenever allies die.' },
      { name: 'Offering', description: 'Sacrifice your own units for overwhelming payoffs and resurrection.' },
    ],
    colors: { primary: '#b061ff', secondary: '#ff5fa2', glow: '#c77dff', dark: '#1c0a2b' },
    sigil: 'eye',
  },
  TIDE: {
    id: 'TIDE',
    name: 'Rimetide Court',
    short: 'Rimetide',
    motto: 'The tide always returns.',
    identity: 'Tempo, Freeze, bounce and delayed effects. Denies the opponent their turns.',
    lore: 'Beneath the frozen Rimed Sea lies a drowned court of leviathan-lords and frost-witches. The Court plays the long game: freezing enemies in place, pulling them back into the depths, and striking when the tide turns.',
    archetypes: [
      { name: 'Deep Freeze', description: 'Freeze enemies and punish Frozen targets.' },
      { name: 'Undertow', description: 'Return units to hand to replay On Deploy effects and stall enemies.' },
    ],
    colors: { primary: '#3fd3d3', secondary: '#a4f0ff', glow: '#66f0ff', dark: '#06232b' },
    sigil: 'wave',
  },
  NEUTRAL: {
    id: 'NEUTRAL',
    name: 'Wanderers',
    short: 'Neutral',
    motto: 'The road belongs to no one.',
    identity: 'Flexible cards usable in any deck.',
    lore: 'Mercenaries, merchants, beasts and hedge-mages who owe allegiance to no faction. Every Warden hires them eventually.',
    archetypes: [{ name: 'Utility', description: 'Solid bodies and flexible effects that fill any curve.' }],
    colors: { primary: '#b9b3a8', secondary: '#e8e0d0', glow: '#fff4d6', dark: '#1d1b18' },
    sigil: 'compass',
  },
};

export const factionName = (f: Faction) => FACTIONS[f]?.name ?? f;
