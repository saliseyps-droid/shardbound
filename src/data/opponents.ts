import type { Difficulty } from '@/config/progression';
import type { Faction, PlayableFaction, Rarity, SetId } from '@/game/types';
import type { AiPersonality } from '@/ai/config';
import type { TalentPick } from './wardenTalents';

export interface OpponentReward {
  gold?: number;
  essence?: number;
  packs?: { setId: SetId; amount: number };
  xp?: number;
  cardId?: string;
}

export interface SpecialRules {
  heroHealth?: number;
  bonusStartingEnergy?: number;
  /** Fixed Warden abilities (bosses); otherwise the AI build for the personality. */
  talents?: TalentPick[];
  startingBoard?: string[];
  startingRelics?: string[];
  startingLocation?: string;
  /** Extra cards shuffled into the boss deck. */
  extraCards?: string[];
  description: string[];
}

export interface OpponentDef {
  id: string;
  name: string;
  title: string;
  avatar: string;
  faction: PlayableFaction;
  secondFaction?: Faction;
  archetype?: string;
  difficulty: Difficulty;
  personality: AiPersonality;
  intro: string;
  /** Rarity pool used by the auto-built deck. */
  rarities: Rarity[];
  special?: SpecialRules;
  firstWinReward?: OpponentReward;
  boss?: boolean;
}

const ALL: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const EASY_POOL: Rarity[] = ['COMMON'];
const NORMAL_POOL: Rarity[] = ['COMMON', 'RARE'];
const HARD_POOL: Rarity[] = ['COMMON', 'RARE', 'EPIC'];

export const DIFFICULTY_POOLS: Record<Difficulty, Rarity[]> = {
  EASY: EASY_POOL,
  NORMAL: NORMAL_POOL,
  HARD: HARD_POOL,
  EXPERT: ALL,
};

/** Practice opponents for Quick Play. The player picks faction + difficulty. */
export const PRACTICE_OPPONENTS: Record<PlayableFaction, Omit<OpponentDef, 'difficulty' | 'rarities'>> = {
  EMBER: { id: 'practice_ember', name: 'Captain Sera Voss', title: 'Cinder Legion Vanguard', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', personality: 'AGGRESSIVE', intro: 'Try to keep up.' },
  VERDANT: { id: 'practice_verdant', name: 'Elder Mossgrave', title: 'Thornweald Keeper', avatar: 'leaf', faction: 'VERDANT', archetype: 'Overgrowth', personality: 'BALANCED', intro: 'The grove is patient. Are you?' },
  IRON: { id: 'practice_iron', name: 'Overseer Kettleman', title: 'Brass Dominion Engineer', avatar: 'gear', faction: 'IRON', archetype: 'Assembly Line', personality: 'SWARM', intro: 'Efficiency is victory.' },
  ASTRAL: { id: 'practice_astral', name: 'Archivist Lyrae', title: 'Lumen Conclave Scholar', avatar: 'star', faction: 'ASTRAL', archetype: 'Starlit Control', personality: 'CONTROL', intro: 'I have already read how this ends.' },
  VOID: { id: 'practice_void', name: 'Cantor Nihl', title: 'Hollow Choir Precentor', avatar: 'eye', faction: 'VOID', archetype: 'Requiem', personality: 'BALANCED', intro: 'Sing with us.' },
  TIDE: { id: 'practice_tide', name: 'Marquise Brine', title: 'Rimetide Court Duelist', avatar: 'wave', faction: 'TIDE', archetype: 'Deep Freeze', personality: 'CONTROL', intro: 'Hold still. This will only sting.' },
};

export interface Chapter {
  id: string;
  name: string;
  description: string;
  encounters: OpponentDef[];
}

export const CAMPAIGN: Chapter[] = [
  {
    id: 'ch1',
    name: 'Chapter I — The Falling Sky',
    description: 'Shards rain over the Wandering Road. Rival Wardens are already on the hunt.',
    encounters: [
      { id: 'c1_e1', name: 'Pip Tallow', title: 'Shard Scavenger', avatar: 'compass', faction: 'VERDANT', difficulty: 'EASY', personality: 'BALANCED', rarities: EASY_POOL, intro: 'Finders keepers! That Shard is mine!', firstWinReward: { gold: 100, xp: 100 } },
      { id: 'c1_e2', name: 'Brakka Ashhand', title: 'Legion Deserter', avatar: 'flame', faction: 'EMBER', difficulty: 'EASY', personality: 'AGGRESSIVE', rarities: EASY_POOL, intro: 'The Legion cast me out. You’ll do for practice.', firstWinReward: { gold: 100, xp: 100 } },
      { id: 'c1_e3', name: 'Tinker Wobblesprocket', title: 'Rogue Artificer', avatar: 'gear', faction: 'IRON', difficulty: 'EASY', personality: 'SWARM', rarities: EASY_POOL, intro: 'My automatons need field testing. Hold still.', firstWinReward: { gold: 120, xp: 120, packs: { setId: 'CORE', amount: 1 } } },
      { id: 'c1_e4', name: 'Sister Vey', title: 'Wandering Choir Initiate', avatar: 'eye', faction: 'VOID', difficulty: 'NORMAL', personality: 'BALANCED', rarities: NORMAL_POOL, intro: 'Your Shard sings so loudly. Let me quiet it.', firstWinReward: { gold: 120, xp: 120 } },
      {
        id: 'c1_boss', name: 'Grom the Unbroken', title: 'Warlord of the Road', avatar: 'compass', faction: 'IRON', secondFaction: 'NEUTRAL', archetype: 'Bulwark', difficulty: 'NORMAL', personality: 'CONTROL', rarities: NORMAL_POOL, boss: true,
        intro: 'Every Warden on this road pays my toll.',
        special: { talents: [{ abilityId: 'wt_iron_rivet_plating', level: 2 }, { abilityId: 'wt_iron_reinforced_hull', level: 1 }], description: ['Warden abilities: Rivet Plating III, Reinforced Hull II.'] },
        firstWinReward: { gold: 200, xp: 200, packs: { setId: 'CORE', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch2',
    name: 'Chapter II — The Rimed Sea',
    description: 'The trail of Shards leads north, to the frozen coast and the drowned court beneath.',
    encounters: [
      { id: 'c2_e1', name: 'Harpooner Quell', title: 'Icebreaker Captain', avatar: 'wave', faction: 'TIDE', archetype: 'Undertow', difficulty: 'NORMAL', personality: 'BALANCED', rarities: NORMAL_POOL, intro: 'The sea gives back what it takes. Eventually.', firstWinReward: { gold: 150, xp: 150 } },
      { id: 'c2_e2', name: 'Lumen Scribe Aurel', title: 'Conclave Cartographer', avatar: 'star', faction: 'ASTRAL', archetype: 'Spellweave', difficulty: 'NORMAL', personality: 'CONTROL', rarities: NORMAL_POOL, intro: 'Your path is already charted. It ends here.', firstWinReward: { gold: 150, xp: 150, packs: { setId: 'DEEP', amount: 1 } } },
      { id: 'c2_e3', name: 'The Thornwidow', title: 'Blighted Druid', avatar: 'leaf', faction: 'VERDANT', archetype: 'Wellspring', difficulty: 'EASY', personality: 'BALANCED', rarities: NORMAL_POOL, intro: 'Rot is only another kind of growth.', firstWinReward: { gold: 150, xp: 150 } },
      { id: 'c2_e4', name: 'Commander Ignis Rael', title: 'Legion Drake-Rider', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', difficulty: 'HARD', personality: 'AGGRESSIVE', rarities: HARD_POOL, intro: 'From the sky, the Legion sees all.', firstWinReward: { gold: 150, xp: 150, packs: { setId: 'CORE', amount: 1 } } },
      {
        id: 'c2_boss', name: 'Maw of the Deep', title: 'Leviathan of the Drowned Court', avatar: 'wave', faction: 'TIDE', archetype: 'Deep Freeze', difficulty: 'HARD', personality: 'CONTROL', rarities: HARD_POOL, boss: true,
        intro: 'The water beneath you shifts. Something vast opens its eye.',
        special: { talents: [{ abilityId: 'wt_boss_crushing_depths', level: 0 }, { abilityId: 'wt_tide_rime_touch', level: 2 }], description: ['Warden abilities: Crushing Depths, Rime Touch III.'] },
        firstWinReward: { gold: 300, xp: 250, packs: { setId: 'DEEP', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch3',
    name: 'Chapter III — The Crown Ascendant',
    description: 'Three powers stand between you and the heart of the Sundered Crown.',
    encounters: [
      {
        id: 'c3_b1', name: 'Kharzul Reborn', title: 'The Living Caldera', avatar: 'flame', faction: 'EMBER', archetype: 'Pyromancy', difficulty: 'NORMAL', personality: 'AGGRESSIVE', rarities: ALL, boss: true,
        intro: 'The mountain itself rises to meet you.',
        special: { talents: [{ abilityId: 'wt_boss_caldera_eruption', level: 0 }, { abilityId: 'wt_ember_searing_wrath', level: 1 }], description: ['Warden abilities: Caldera Eruption, Searing Wrath II.'] },
        firstWinReward: { gold: 300, xp: 300, essence: 200 },
      },
      {
        id: 'c3_b2', name: 'The Endless Choir', title: 'Voice of the Hollow', avatar: 'eye', faction: 'VOID', archetype: 'Requiem', difficulty: 'NORMAL', personality: 'BALANCED', rarities: ALL, boss: true,
        intro: 'We are many. We were you, once.',
        special: { talents: [{ abilityId: 'wt_boss_requiem_chorus', level: 0 }, { abilityId: 'wt_void_unending', level: 2 }], description: ['Warden abilities: Requiem Chorus, Unending III.'] },
        firstWinReward: { gold: 350, xp: 300, packs: { setId: 'DEEP', amount: 2 } },
      },
      {
        id: 'c3_final', name: 'The Shattered Sovereign', title: 'Echo of the Crown', avatar: 'crown', faction: 'ASTRAL', archetype: 'Starlit Control', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'You would rebuild my Crown? Then kneel before what it was.',
        special: { talents: [{ abilityId: 'wt_boss_crown_fragment', level: 0 }, { abilityId: 'wt_astral_foresight', level: 2 }], description: ['Warden abilities: Crown Fragment, Foresight III.'] },
        firstWinReward: { gold: 500, xp: 500, essence: 400, packs: { setId: 'CORE', amount: 3 } },
      },
    ],
  },
];

export function findEncounter(id: string): { chapter: Chapter; encounter: OpponentDef; index: number } | undefined {
  for (const chapter of CAMPAIGN) {
    const index = chapter.encounters.findIndex((e) => e.id === id);
    if (index >= 0) return { chapter, encounter: chapter.encounters[index], index };
  }
  return undefined;
}

export function allEncounters(): OpponentDef[] {
  return CAMPAIGN.flatMap((c) => c.encounters);
}
