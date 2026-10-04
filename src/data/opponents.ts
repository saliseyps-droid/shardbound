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
  /** Warden portrait (src/data/portraits.ts); null = the faction's default; missing = random. */
  portrait?: string | null;
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
  {
    id: 'ch4',
    name: 'Chapter IV — Legions of Shadow',
    description: 'The Crown is mended, but its shadow walks on. Knights of every banner now march for it.',
    encounters: [
      {
        id: 'c4_e1', name: 'Dame Rowena Thorne', title: 'Briarhelm Oathkeeper', avatar: 'leaf', faction: 'VERDANT', archetype: 'Overgrowth', difficulty: 'NORMAL', personality: 'BALANCED', rarities: HARD_POOL,
        intro: 'My oath was to the grove. The shadow simply grew there first.',
        special: { extraCards: ['ver_briarhelm_knight', 'ver_antlerhelm_knight'], description: ['Her deck holds extra Knights of the briar.'] },
        firstWinReward: { gold: 200, xp: 200, packs: { setId: 'ABYSS', amount: 1 } },
      },
      {
        id: 'c4_e2', name: 'Sir Halvard Brine', title: 'Knight of the Drowned Banner', avatar: 'wave', faction: 'TIDE', archetype: 'Deep Freeze', difficulty: 'HARD', personality: 'CONTROL', rarities: HARD_POOL,
        intro: 'I drowned once already. It did not take.',
        special: { extraCards: ['tid_frostspine_knight', 'tid_brinehair_duelist'], description: ['His deck holds extra drowned Knights.'] },
        firstWinReward: { gold: 200, xp: 200 },
      },
      {
        id: 'c4_e3', name: 'Marshal Dagna Ironvow', title: 'Dreadknight of the Forge', avatar: 'gear', faction: 'IRON', archetype: 'Bulwark', difficulty: 'HARD', personality: 'CONTROL', rarities: HARD_POOL,
        intro: 'Every rivet in this armour is a promise. None of them to you.',
        special: { extraCards: ['irn_stormrivet_dreadknight', 'irn_ironvow_axeman'], description: ['Her deck holds extra Dreadknights.'] },
        firstWinReward: { gold: 220, xp: 220, packs: { setId: 'ABYSS', amount: 1 } },
      },
      {
        id: 'c4_e4', name: 'The Violet Blade', title: 'Duelist of the Last Light', avatar: 'star', faction: 'ASTRAL', archetype: 'Spellweave', difficulty: 'HARD', personality: 'AGGRESSIVE', rarities: HARD_POOL,
        intro: 'The stars went dark. My blade did not.',
        special: { extraCards: ['ast_isera_of_the_violet_blade', 'ast_duskstar_sentinel'], description: ['Her deck holds extra Knights of the Last Light.'] },
        firstWinReward: { gold: 220, xp: 220 },
      },
      {
        id: 'c4_boss', name: 'Vorgrath', title: 'The Burning Oath', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', difficulty: 'HARD', personality: 'AGGRESSIVE', rarities: ALL, boss: true,
        intro: 'I swore to burn for the Crown. Now I burn for what comes after it.',
        special: {
          talents: [{ abilityId: 'wt_boss_oath_of_cinders', level: 0 }, { abilityId: 'wt_ember_warcry', level: 2 }],
          extraCards: ['emb_vorgrath_the_burning_oath', 'emb_hellshield_marauder', 'emb_cinderhelm_knight'],
          description: ['Warden abilities: Oath of Cinders, Warcry III.', 'His deck holds Vorgrath himself and his sworn Knights.'],
        },
        firstWinReward: { gold: 400, xp: 350, packs: { setId: 'ABYSS', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch5',
    name: 'Chapter V — The Shadow Throne',
    description: 'At the bottom of the world the Legions gather around an empty throne. Someone means to sit on it.',
    encounters: [
      {
        id: 'c5_b1', name: 'Azhrel', title: 'The Drowned Champion', avatar: 'wave', faction: 'TIDE', archetype: 'Undertow', difficulty: 'HARD', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'The tide took my kingdom. The shadow gave me a sword to take it back.',
        special: {
          heroHealth: 35,
          talents: [{ abilityId: 'wt_boss_black_tide', level: 0 }, { abilityId: 'wt_tide_cold_snap', level: 1 }],
          extraCards: ['tid_azhrel_drowned_champion', 'tid_drowned_ward'],
          description: ['Starts with 35 Health.', 'Warden abilities: Black Tide, Cold Snap II.'],
        },
        firstWinReward: { gold: 400, xp: 400, essence: 200 },
      },
      {
        id: 'c5_b2', name: 'Kaelthar', title: 'Pyre of Souls', avatar: 'eye', faction: 'VOID', archetype: 'Requiem', difficulty: 'HARD', personality: 'BALANCED', rarities: ALL, boss: true,
        intro: 'Every soul you spent to reach me now burns in my fire.',
        special: {
          heroHealth: 35,
          talents: [{ abilityId: 'wt_boss_soul_pyre', level: 0 }, { abilityId: 'wt_void_soul_harvest', level: 2 }],
          extraCards: ['vod_kaelthar_pyre_of_souls', 'vod_horned_revenant', 'vod_pentacle_of_souls'],
          description: ['Starts with 35 Health.', 'Warden abilities: Soul Pyre, Soul Harvest III.'],
        },
        firstWinReward: { gold: 450, xp: 400, packs: { setId: 'ABYSS', amount: 2 } },
      },
      {
        id: 'c5_final', name: 'Rendoslav', title: 'Lord of the Shadow Legions', avatar: 'crown', faction: 'VOID', secondFaction: 'NEUTRAL', archetype: 'Requiem', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'Every banner kneels to me in the end. Yours will be the last.',
        special: {
          heroHealth: 40,
          talents: [{ abilityId: 'wt_boss_shadow_muster', level: 0 }, { abilityId: 'wt_boss_crown_fragment', level: 0 }],
          extraCards: ['neu_rendoslav', 'neu_sigil_of_the_abyss_lord', 'neu_scarlet_oathbreaker', 'neu_crown_of_the_abyss'],
          description: ['Starts with 40 Health.', 'Warden abilities: Shadow Muster, Crown Fragment.', 'His deck holds Rendoslav himself and the relics of the Abyss Lord.'],
        },
        firstWinReward: { gold: 600, xp: 600, essence: 400, packs: { setId: 'ABYSS', amount: 3 } },
      },
    ],
  },
  {
    id: 'ch6',
    name: 'Chapter VI — The Burning Bloom',
    description: 'With the Shadow Throne broken, its Shards fall into the wildlands, where fire and root fight over every one.',
    encounters: [
      {
        id: 'c6_e1', name: 'Kindler Maeve', title: 'Ashroad Firestarter', avatar: 'flame', faction: 'EMBER', archetype: 'Pyromancy', difficulty: 'HARD', personality: 'AGGRESSIVE', rarities: HARD_POOL,
        intro: 'Everything burns brighter with a Shard in it.',
        special: { extraCards: ['emb_legion_warbringer'], description: ['Her deck holds an extra Legion Warbringer.'] },
        firstWinReward: { gold: 250, xp: 250 },
      },
      {
        id: 'c6_e2', name: 'Old Barkhide', title: 'Treant of the Scorched Grove', avatar: 'leaf', faction: 'VERDANT', archetype: 'Overgrowth', difficulty: 'HARD', personality: 'BALANCED', rarities: HARD_POOL,
        intro: 'The fire took my grove. I will take something back.',
        special: { extraCards: ['ver_ancient_of_tendrils'], description: ['His deck holds an extra Ancient of Tendrils.'] },
        firstWinReward: { gold: 250, xp: 250, packs: { setId: 'CORE', amount: 1 } },
      },
      {
        id: 'c6_e3', name: 'Sootwing Kalla', title: 'Drake-Tamer', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', difficulty: 'HARD', personality: 'AGGRESSIVE', rarities: ALL,
        intro: 'My drakes have not eaten today.',
        special: { extraCards: ['emb_ashborn_phoenix'], description: ['Her deck holds an extra Ashborn Phoenix.'] },
        firstWinReward: { gold: 260, xp: 260 },
      },
      {
        id: 'c6_e4', name: 'The Bloomwarden', title: 'Keeper of the Wellspring', avatar: 'leaf', faction: 'VERDANT', archetype: 'Wellspring', difficulty: 'HARD', personality: 'CONTROL', rarities: ALL,
        intro: 'Every seed you burn, I plant twice.',
        special: { extraCards: ['ver_wellspring_oracle'], description: ['Their deck holds an extra Wellspring Oracle.'] },
        firstWinReward: { gold: 260, xp: 260, packs: { setId: 'DEEP', amount: 1 } },
      },
      {
        id: 'c6_boss', name: 'Vulkara', title: 'Mother of Drakes', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', difficulty: 'EXPERT', personality: 'AGGRESSIVE', rarities: ALL, boss: true,
        intro: 'You walked into my nest. Few walk out.',
        special: {
          heroHealth: 35,
          talents: [{ abilityId: 'wt_boss_drake_brood', level: 0 }, { abilityId: 'wt_ember_kindled_fury', level: 2 }],
          extraCards: ['emb_vulkara', 'emb_ignivar', 'emb_kharzul_caldera'],
          description: ['Starts with 35 Health.', 'Warden abilities: Drake Brood, Kindled Fury III.'],
        },
        firstWinReward: { gold: 500, xp: 450, essence: 200, packs: { setId: 'CORE', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch7',
    name: 'Chapter VII — The Clockwork Heavens',
    description: 'The Shards rise into the sky, where the Brass Dominion and the Lumen Conclave race to claim them first.',
    encounters: [
      {
        id: 'c7_e1', name: 'Foreman Rusk', title: 'Cogspire Overseer', avatar: 'gear', faction: 'IRON', archetype: 'Assembly Line', difficulty: 'HARD', personality: 'SWARM', rarities: ALL,
        intro: 'Line up. Get assembled.',
        special: { extraCards: ['irn_aetherdyne_core'], description: ['His deck holds an extra Aetherdyne Core.'] },
        firstWinReward: { gold: 280, xp: 280 },
      },
      {
        id: 'c7_e2', name: 'Stargazer Ilwen', title: 'Orbit Keeper', avatar: 'star', faction: 'ASTRAL', archetype: 'Starlit Control', difficulty: 'HARD', personality: 'CONTROL', rarities: ALL,
        intro: 'I saw your defeat in the stars last night.',
        special: { extraCards: ['ast_conduit_of_lumen'], description: ['Her deck holds an extra Conduit of Lumen.'] },
        firstWinReward: { gold: 280, xp: 280, packs: { setId: 'DEEP', amount: 1 } },
      },
      {
        id: 'c7_e3', name: 'The Brass Seraph', title: 'Aetherdyne Prototype', avatar: 'gear', faction: 'IRON', archetype: 'Bulwark', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL,
        intro: 'DIRECTIVE: PRESERVE THE SHARD. DIRECTIVE: REMOVE THE WARDEN.',
        special: { extraCards: ['irn_aegis_titan'], description: ['Its deck holds an extra Aegis Titan.'] },
        firstWinReward: { gold: 300, xp: 300 },
      },
      {
        id: 'c7_e4', name: 'Archon Teyra', title: 'Spellweaver of the Conclave', avatar: 'star', faction: 'ASTRAL', archetype: 'Spellweave', difficulty: 'EXPERT', personality: 'AGGRESSIVE', rarities: ALL,
        intro: 'My spells were written before you were born.',
        special: { extraCards: ['ast_pilfered_constellation'], description: ['Her deck holds an extra Pilfered Constellation.'] },
        firstWinReward: { gold: 300, xp: 300, packs: { setId: 'ABYSS', amount: 1 } },
      },
      {
        id: 'c7_boss', name: 'Omnifex', title: 'The Prime Assembler', avatar: 'gear', faction: 'IRON', archetype: 'Assembly Line', difficulty: 'EXPERT', personality: 'SWARM', rarities: ALL, boss: true,
        intro: 'Every Shard is a part. You are a spare one.',
        special: {
          heroHealth: 35,
          talents: [{ abilityId: 'wt_boss_siege_protocol', level: 0 }, { abilityId: 'wt_iron_overclock', level: 2 }],
          extraCards: ['irn_omnifex', 'irn_mass_production', 'irn_cogspire_foundry'],
          description: ['Starts with 35 Health.', 'Warden abilities: Siege Protocol, Overclock III.'],
        },
        firstWinReward: { gold: 550, xp: 500, essence: 250, packs: { setId: 'DEEP', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch8',
    name: 'Chapter VIII — The Drowned Hymn',
    description: 'The Shards sink into the deep, where the Rimetide Court and the Hollow Choir sing them to sleep.',
    encounters: [
      {
        id: 'c8_e1', name: 'Rimecaller Odo', title: 'Icebound Hermit', avatar: 'wave', faction: 'TIDE', archetype: 'Deep Freeze', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL,
        intro: 'Stay a while. Stay forever.',
        special: { extraCards: ['tid_tidewitch_of_the_rime'], description: ['His deck holds an extra Tidewitch of the Rime.'] },
        firstWinReward: { gold: 300, xp: 300 },
      },
      {
        id: 'c8_e2', name: 'Mother Hush', title: 'Abbess of the Choir', avatar: 'eye', faction: 'VOID', archetype: 'Requiem', difficulty: 'EXPERT', personality: 'BALANCED', rarities: ALL,
        intro: 'Shh. The dead are listening.',
        special: { extraCards: ['vod_siphoning_wraith'], description: ['Her deck holds an extra Siphoning Wraith.'] },
        firstWinReward: { gold: 300, xp: 300, packs: { setId: 'CORE', amount: 1 } },
      },
      {
        id: 'c8_e3', name: 'Captain Saltgrave', title: 'Ghost of the Drowned Fleet', avatar: 'wave', faction: 'TIDE', archetype: 'Undertow', difficulty: 'EXPERT', personality: 'AGGRESSIVE', rarities: ALL,
        intro: 'My crew went down with the ship. They came back up without it.',
        special: { extraCards: ['tid_undertow_maelstrom'], description: ['His deck holds an extra Undertow Maelstrom.'] },
        firstWinReward: { gold: 320, xp: 320 },
      },
      {
        id: 'c8_e4', name: 'The Pale Cantor', title: 'Voice of the Unmaking', avatar: 'eye', faction: 'VOID', archetype: 'Requiem', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL,
        intro: 'One more verse, and the world forgets you.',
        special: { extraCards: ['vod_hymn_of_unmaking'], description: ['Their deck holds an extra Hymn of Unmaking.'] },
        firstWinReward: { gold: 320, xp: 320, packs: { setId: 'ABYSS', amount: 1 } },
      },
      {
        id: 'c8_boss', name: 'Morrowgast', title: 'The Deep Leviathan', avatar: 'wave', faction: 'TIDE', archetype: 'Deep Freeze', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'The sea has a bottom. I am what lives beneath it.',
        special: {
          heroHealth: 40,
          startingLocation: 'tid_the_drowned_court',
          talents: [{ abilityId: 'wt_boss_frozen_hymn', level: 0 }, { abilityId: 'wt_boss_crushing_depths', level: 0 }],
          extraCards: ['tid_morrowgast', 'tid_deep_winter'],
          description: ['Starts with 40 Health and The Drowned Court in play.', 'Warden abilities: Frozen Hymn, Crushing Depths.'],
        },
        firstWinReward: { gold: 600, xp: 550, essence: 300, packs: { setId: 'DEEP', amount: 2 } },
      },
    ],
  },
  {
    id: 'ch9',
    name: 'Chapter IX — The Last Shard',
    description: 'Every Shard is gathered at last. Only the powers that scattered them stand between you and the whole Crown.',
    encounters: [
      {
        id: 'c9_b1', name: 'Aeon', title: 'The Pale Wanderer', avatar: 'star', faction: 'ASTRAL', secondFaction: 'NEUTRAL', archetype: 'Starlit Control', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'I have walked past the end of every world. Yours is next.',
        special: {
          heroHealth: 40,
          talents: [{ abilityId: 'wt_boss_starfall', level: 0 }, { abilityId: 'wt_astral_foresight', level: 2 }],
          extraCards: ['neu_aeon_pale_wanderer', 'ast_oruvael', 'ast_collapse_of_heaven'],
          description: ['Starts with 40 Health.', 'Warden abilities: Starfall, Foresight III.'],
        },
        firstWinReward: { gold: 500, xp: 500, essence: 300 },
      },
      {
        id: 'c9_b2', name: 'Ysolde', title: 'The Thrice-Crowned', avatar: 'leaf', faction: 'VERDANT', secondFaction: 'NEUTRAL', archetype: 'Wellspring', difficulty: 'EXPERT', personality: 'BALANCED', rarities: ALL, boss: true,
        intro: 'Spring, Hollow and Rime — I have been queen of all three. Kneel to each of me.',
        special: {
          heroHealth: 40,
          talents: [{ abilityId: 'wt_boss_requiem_chorus', level: 0 }, { abilityId: 'wt_verdant_wellspring', level: 2 }],
          extraCards: ['ver_ysolde', 'vod_ysolde', 'tid_ysolde'],
          description: ['Starts with 40 Health.', 'Warden abilities: Requiem Chorus, Wellspring III.', 'Her deck holds all three Ysoldes.'],
        },
        firstWinReward: { gold: 550, xp: 500, packs: { setId: 'ABYSS', amount: 2 } },
      },
      {
        id: 'c9_b3', name: 'Ignivar', title: 'The Crown-Burner', avatar: 'flame', faction: 'EMBER', archetype: 'Blitz', difficulty: 'EXPERT', personality: 'AGGRESSIVE', rarities: ALL, boss: true,
        intro: 'I burned the Crown once. I will gladly do it again.',
        special: {
          heroHealth: 40,
          talents: [{ abilityId: 'wt_boss_caldera_eruption', level: 0 }, { abilityId: 'wt_ember_searing_wrath', level: 2 }],
          extraCards: ['emb_ignivar', 'emb_vulkara', 'emb_ashborn_phoenix'],
          description: ['Starts with 40 Health.', 'Warden abilities: Caldera Eruption, Searing Wrath III.'],
        },
        firstWinReward: { gold: 550, xp: 500, packs: { setId: 'CORE', amount: 2 } },
      },
      {
        id: 'c9_final', name: 'The Sundered Crown', title: 'All That Was Broken', avatar: 'crown', faction: 'ASTRAL', secondFaction: 'NEUTRAL', archetype: 'Starlit Control', difficulty: 'EXPERT', personality: 'CONTROL', rarities: ALL, boss: true,
        intro: 'You gathered every piece of me. Now see what they make together.',
        special: {
          heroHealth: 50,
          bonusStartingEnergy: 1,
          talents: [{ abilityId: 'wt_boss_last_shard', level: 0 }, { abilityId: 'wt_boss_crown_fragment', level: 0 }],
          extraCards: ['neu_skyrift_wyrm', 'ast_selenne', 'neu_sigil_of_the_abyss_lord', 'neu_crown_of_the_abyss'],
          description: ['Starts with 50 Health and 1 extra Energy.', 'Warden abilities: The Last Shard, Crown Fragment.'],
        },
        firstWinReward: { gold: 1000, xp: 1000, essence: 600, packs: { setId: 'ABYSS', amount: 5 } },
      },
    ],
  },
];

/**
 * Every campaign Warden has a fixed portrait from the shop set, picked to fit the character
 * (null = the faction's default portrait). Neighbouring rivals never share one.
 */
const CAMPAIGN_PORTRAITS: Record<string, string | null> = {
  c1_e1: 'verdant_dryad', c1_e2: 'ember_orc_warchief', c1_e3: 'iron_goblin_tinker', c1_e4: 'void_night_elf', c1_boss: 'iron_lion_lord',
  c2_e1: 'tide_sea_elf', c2_e2: 'astral_white_seer', c2_e3: null, c2_e4: 'ember_black_drake', c2_boss: 'tide_sapphire_dragon',
  c3_b1: 'ember_flameborn', c3_b2: 'void_horned_warlock', c3_final: 'astral_eagle_herald',
  c4_e1: 'verdant_dryad', c4_e2: 'tide_frost_lich', c4_e3: 'iron_dwarf_forgemaster', c4_e4: 'astral_white_seer', c4_boss: 'ember_flameborn',
  c5_b1: 'tide_sea_elf', c5_b2: 'void_horned_warlock', c5_final: null,
  c6_e1: null, c6_e2: 'verdant_ancient_treant', c6_e3: 'ember_orc_warchief', c6_e4: 'verdant_bamboo_monk', c6_boss: 'ember_black_drake',
  c7_e1: 'iron_goblin_tinker', c7_e2: 'astral_white_seer', c7_e3: null, c7_e4: 'astral_eagle_herald', c7_boss: 'iron_lion_lord',
  c8_e1: 'tide_frost_lich', c8_e2: 'void_night_elf', c8_e3: null, c8_e4: 'void_horned_warlock', c8_boss: 'tide_sapphire_dragon',
  c9_b1: 'astral_eagle_herald', c9_b2: 'verdant_dryad', c9_b3: 'ember_flameborn', c9_final: null,
};
for (const ch of CAMPAIGN) for (const e of ch.encounters) if (e.id in CAMPAIGN_PORTRAITS) e.portrait = CAMPAIGN_PORTRAITS[e.id];

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
