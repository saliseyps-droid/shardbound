import type { LevelReward } from '@/config/progression';
import { MAX_LEVEL } from '@/config/progression';
import { ARENA } from '@/config/arena';
import { CAMPAIGN, CAMPAIGNS, HEAVEN_CAMPAIGN, INFERNO_CAMPAIGN, INN_CAMPAIGN } from './opponents';
import { collectibleCards, poolCards } from './cards';
import { AI_TIERS, aiTierIndex, type AiTierName } from '@/domain/aiRanked';
import { ownedCopies, type GameSave, type MatchRecord } from '@/domain/save';
import type { MatchSummary } from '@/domain/matchResults';
import { PLAYABLE_FACTIONS, type SetId } from '@/game/types';
import { PORTRAITS } from './portraits';
import { findBrawlFight } from '@/domain/brawl';
import { FRAME_WINS } from '@/domain/frames';
import { codexProgress } from '@/ui/codex/codexEntries';
import { nightmareBosses, nightmareCleared } from './nightmare';

/**
 * Achievements: one-time goals computed from the save (and, for a few feats, the match just played).
 * Names, descriptions and titles are English source text, translated at display time
 * (Czech in src/i18n/cs/ui/achievements.ts). Logic lives in src/domain/achievements.ts.
 */
export type AchievementCategory = 'BATTLE' | 'CAMPAIGN' | 'AI_RANKED' | 'ARENA' | 'BRAWL' | 'DUNGEON' | 'COLLECTION' | 'FACTIONS' | 'ONLINE';
export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  /** A Glyph name (src/ui/components/Icons.tsx). */
  icon: string;
  /** Granted once on unlock (same kinds as level rewards). */
  rewards: LevelReward[];
  /** Counted goal: unlocks when `current` reaches `target`. */
  progress?: (save: GameSave) => AchievementProgress;
  /** One-off condition; may look at the match that was just recorded. */
  check?: (save: GameSave, match?: MatchSummary & { heroHealth?: number }) => boolean;
}

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'BATTLE', label: 'Battle', icon: 'sword' },
  { id: 'CAMPAIGN', label: 'Campaign', icon: 'map' },
  { id: 'AI_RANKED', label: 'Ranked vs AI', icon: 'crown' },
  { id: 'ARENA', label: 'Arena', icon: 'trophy' },
  { id: 'BRAWL', label: 'Brawl fights', icon: 'bolt' },
  { id: 'DUNGEON', label: 'Dungeon runs', icon: 'skull' },
  { id: 'COLLECTION', label: 'Collection', icon: 'crystal' },
  { id: 'FACTIONS', label: 'Factions', icon: 'shield' },
  { id: 'ONLINE', label: 'Online play', icon: 'compass' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const gold = (amount: number): LevelReward => ({ kind: 'GOLD', amount });
const essence = (amount: number): LevelReward => ({ kind: 'ESSENCE', amount });
const pack = (setId: SetId, amount = 1): LevelReward => ({ kind: 'PACK', setId, amount });
const title = (t: string): LevelReward => ({ kind: 'TITLE', title: t });
const cardBack: LevelReward = { kind: 'CARD_BACK' };

const count = (current: number, target: number) => ({ current, target });
const cleared = (save: GameSave, id: string) => !!save.pve.completed[id];
const chapterCleared = (save: GameSave, chapterId: string) => {
  const ch = CAMPAIGNS.flatMap((c) => c.chapters).find((c) => c.id === chapterId);
  return !!ch && ch.encounters.every((e) => cleared(save, e.id));
};
const allEncounterIds = () => CAMPAIGN.flatMap((c) => c.encounters.map((e) => e.id));
const reachedTier = (save: GameSave, tier: AiTierName) => aiTierIndex(save.profile.aiRanked?.best ?? 0) >= AI_TIERS.indexOf(tier);

const ONLINE_MODES: MatchRecord['mode'][] = ['PVP', 'RANKED', 'TOURNAMENT'];
const onlineWins = (save: GameSave) => Math.max(save.profile.ranked.wins, save.matchHistory.filter((m) => m.result === 'WIN' && ONLINE_MODES.includes(m.mode)).length);

/** Longest run of wins in the recorded history (oldest first), tutorial matches skipped. */
export function longestStreakInHistory(history: MatchRecord[]): number {
  let best = 0;
  let run = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.mode === 'TUTORIAL') continue;
    run = m.result === 'WIN' ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

const ownedOf = (save: GameSave, cards: readonly { id: string }[]) => cards.filter((c) => ownedCopies(save.collection, c.id) > 0).length;

/** The faction closest to owning all of its Legendaries. */
function bestLegendaryFaction(save: GameSave): AchievementProgress {
  let best = { current: 0, target: 1 };
  for (const f of PLAYABLE_FACTIONS) {
    const pool = collectibleCards().filter((c) => c.rarity === 'LEGENDARY' && c.faction === f);
    if (pool.length === 0) continue;
    const owned = ownedOf(save, pool);
    if (owned / pool.length > best.current / best.target) best = { current: owned, target: pool.length };
  }
  return best;
}

const setProgress = (save: GameSave, set: SetId) => {
  const pool = poolCards().filter((c) => c.set === set);
  return count(ownedOf(save, pool), pool.length);
};
const shinyCards = (save: GameSave) => Object.values(save.collection.cards).filter((v) => v.FOIL + v.PRISMATIC > 0).length;
const prismaticCards = (save: GameSave) => Object.values(save.collection.cards).filter((v) => v.PRISMATIC > 0).length;
const dragonPool = () => collectibleCards().filter((c) => c.tags?.includes('Dragon'));
/** The four cat Legendaries of Void Reckoning. */
export const CAT_LEGENDS = ['emb_artemis_qinnys_bane', 'vod_simba_ultimate_predator', 'ver_scar_liu_kanos_mauler', 'ast_archmage_elinka'];
/** The three Lamplighter legends and the twelve guests of the Wraithwood Inn (campaign-only cards). */
export const LAMP_LEGENDS = ['neu_nyx_lantern_of_nul', 'neu_vael_the_void_knell', 'neu_oblivia_keeper_of_the_last_page'];
export const innGuestCards = () => INN_CAMPAIGN.flatMap((ch) => ch.encounters.map((e) => e.firstWinReward?.cardId ?? '')).filter(Boolean);
const framesEarned = (save: GameSave) => PLAYABLE_FACTIONS.filter((f) => (save.profile.factionWins[f] ?? 0) >= FRAME_WINS).length;
const ownedIds = (save: GameSave, ids: string[]) => ids.filter((id) => ownedCopies(save.collection, id) > 0).length;
export const infernoCourtCards = () => INFERNO_CAMPAIGN.flatMap((ch) => ch.encounters.map((e) => e.firstWinReward?.cardId ?? '')).filter(Boolean);
const infernoCleared = (save: GameSave) => INFERNO_CAMPAIGN.flatMap((ch) => ch.encounters).filter((e) => cleared(save, e.id)).length;
export const heavenHostCards = () => HEAVEN_CAMPAIGN.flatMap((ch) => ch.encounters.map((e) => e.firstWinReward?.cardId ?? '')).filter(Boolean);
const heavenCleared = (save: GameSave) => HEAVEN_CAMPAIGN.flatMap((ch) => ch.encounters).filter((e) => cleared(save, e.id)).length;
const innCleared = (save: GameSave) => INN_CAMPAIGN.flatMap((ch) => ch.encounters).filter((e) => cleared(save, e.id)).length;
/** Brawl fights won in the saved (latest) rotation. */
const brawlFightsWon = (save: GameSave) => save.profile.brawl?.won.length ?? 0;

/** Wardens keep at least this much health for the Untouchable feat. */
export const FLAWLESS_HEALTH = 25;
const FLAWLESS_MIN_TURNS = 5;
export const BIG_DAMAGE = 40;

// ---------------------------------------------------------------------------
// The list
// ---------------------------------------------------------------------------

export const ACHIEVEMENTS: AchievementDef[] = [
  // Battle ------------------------------------------------------------------
  { id: 'tutorial', name: 'Basic Training', description: 'Complete the tutorial.', category: 'BATTLE', tier: 'BRONZE', icon: 'scroll', rewards: [gold(50)], check: (s) => s.profile.tutorialCompleted },
  { id: 'win_1', name: 'First Blood', description: 'Win your first match.', category: 'BATTLE', tier: 'BRONZE', icon: 'sword', rewards: [gold(50)], progress: (s) => count(s.profile.wins, 1) },
  { id: 'win_10', name: 'Seasoned Warden', description: 'Win 10 matches.', category: 'BATTLE', tier: 'BRONZE', icon: 'sword', rewards: [gold(150)], progress: (s) => count(s.profile.wins, 10) },
  { id: 'win_50', name: 'Veteran of the Shards', description: 'Win 50 matches.', category: 'BATTLE', tier: 'SILVER', icon: 'sword', rewards: [pack('DEEP', 2), essence(100)], progress: (s) => count(s.profile.wins, 50) },
  { id: 'win_200', name: 'Living Legend', description: 'Win 200 matches.', category: 'BATTLE', tier: 'GOLD', icon: 'sword', rewards: [title('Warlord of Shards'), cardBack, essence(300)], progress: (s) => count(s.profile.wins, 200) },
  {
    id: 'streak_5', name: 'Unstoppable', description: 'Win 5 matches in a row.', category: 'BATTLE', tier: 'SILVER', icon: 'bolt', rewards: [gold(200)],
    progress: (s) => count(Math.max(s.profile.bestWinStreak ?? 0, longestStreakInHistory(s.matchHistory)), 5),
  },
  {
    id: 'damage_40', name: 'Overwhelming Force', description: 'Deal 40 or more damage in a single match.', category: 'BATTLE', tier: 'SILVER', icon: 'flame', rewards: [essence(100)],
    progress: (s) => count(Math.max(0, ...s.matchHistory.map((m) => m.damageDealt ?? 0)), BIG_DAMAGE),
  },
  {
    id: 'flawless', name: 'Untouchable', description: 'Win a match of 5 or more turns with your Warden at 25 health or more.', category: 'BATTLE', tier: 'SILVER', icon: 'heart', rewards: [essence(150)],
    check: (_s, m) => !!m && m.result === 'WIN' && m.mode !== 'TUTORIAL' && m.turns >= FLAWLESS_MIN_TURNS && (m.heroHealth ?? 0) >= FLAWLESS_HEALTH,
  },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10.', category: 'BATTLE', tier: 'BRONZE', icon: 'star', rewards: [gold(150)], progress: (s) => count(s.profile.level, 10) },
  { id: 'level_20', name: 'Shard Adept', description: 'Reach level 20.', category: 'BATTLE', tier: 'SILVER', icon: 'star', rewards: [essence(200)], progress: (s) => count(s.profile.level, 20) },
  { id: 'level_40', name: 'Pinnacle', description: 'Reach the maximum level, 40.', category: 'BATTLE', tier: 'GOLD', icon: 'star', rewards: [pack('ABYSS', 3), cardBack], progress: (s) => count(s.profile.level, MAX_LEVEL) },

  // Campaign ----------------------------------------------------------------
  { id: 'camp_first', name: 'Off the Wandering Road', description: 'Clear your first campaign encounter.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'map', rewards: [gold(75)], progress: (s) => count(Object.keys(s.pve.completed).length, 1) },
  { id: 'camp_ch1', name: 'The Sky Has Fallen', description: 'Clear every encounter of Chapter I.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'map', rewards: [gold(150)], check: (s) => chapterCleared(s, 'ch1') },
  { id: 'camp_ch3', name: 'Crown Denied', description: 'Clear every encounter of Chapter III.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'crown', rewards: [pack('DEEP'), essence(100)], check: (s) => chapterCleared(s, 'ch3') },
  { id: 'camp_ch6', name: 'Through the Burning Bloom', description: 'Clear every encounter of Chapter VI.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'flame', rewards: [pack('ABYSS'), gold(150)], check: (s) => chapterCleared(s, 'ch6') },
  { id: 'camp_crown', name: 'The Last Shard', description: 'Defeat The Sundered Crown at the end of Chapter IX.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'crown', rewards: [title('Crown Sunderer'), pack('ABYSS', 2)], check: (s) => cleared(s, 'c9_final') },
  { id: 'camp_sali', name: 'Dethroned', description: 'Defeat Sali at the end of The Black Sun.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'crown', rewards: [title('Sunbreaker'), pack('RECKONING', 2)], check: (s) => cleared(s, 'v3_final') },
  // The Lamplighters' Road
  { id: 'lamp_ch1', name: 'Lantern Lit', description: 'Clear Chapter I of The Lamplighters’ Road.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'flame', rewards: [gold(150)], check: (s) => chapterCleared(s, 'lr1') },
  { id: 'lamp_oblivia', name: 'The Last Page', description: 'Defeat Oblivia at the end of The Lamplighters’ Road.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'eye', rewards: [title('Lamplighter'), pack('RECKONING', 2)], check: (s) => cleared(s, 'l3_boss') },
  // The Wraithwood Inn
  { id: 'inn_first', name: 'A Seat at the Table', description: 'Win your first game at The Wraithwood Inn.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'chalice', rewards: [gold(100)], progress: (s) => count(innCleared(s), 1) },
  { id: 'inn_ch2', name: 'Last Orders Served', description: 'Clear Chapter II of The Wraithwood Inn.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'chalice', rewards: [gold(200), essence(100)], check: (s) => chapterCleared(s, 'wi2') },
  { id: 'inn_host', name: 'Closing Time', description: 'Defeat the Hollow Host at the end of The Wraithwood Inn.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'skull', rewards: [title('Regular of the Wraithwood'), pack('ABYSS', 2)], check: (s) => cleared(s, 'w4_boss') },
  {
    id: 'nm_first', name: 'Bad Dreams', description: 'Defeat a campaign boss on Nightmare I.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'skull', rewards: [gold(200), essence(100)],
    progress: (s) => count(Math.min(1, nightmareBosses().filter((b) => nightmareCleared(s, b.id, 1)).length), 1),
  },
  {
    id: 'nm_all', name: 'Lord of Nightmares', description: 'Defeat every campaign boss on Nightmare II.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'skull', rewards: [title('Lord of Nightmares'), essence(600)],
    progress: (s) => count(nightmareBosses().filter((b) => nightmareCleared(s, b.id, 2)).length, nightmareBosses().length),
  },
  { id: 'inf_first', name: 'Into the Fire', description: 'Win your first fight in The Underflame.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'flame', rewards: [gold(100)], progress: (s) => count(Math.min(1, infernoCleared(s)), 1) },
  { id: 'inf_ch2', name: 'The Forges Fall Silent', description: 'Clear Chapter II of The Underflame.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'hammer', rewards: [gold(200), essence(100)], check: (s) => chapterCleared(s, 'uf2') },
  { id: 'inf_sovereign', name: 'Kingslayer', description: 'Defeat Azgaroth, the Ninth Sovereign, at the bottom of The Underflame.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'crown', rewards: [title('Bane of the Underflame'), pack('ABYSS', 2)], check: (s) => cleared(s, 'u4_boss') },
  { id: 'hv_first', name: 'Two Voices', description: 'Win your first fight in The Twin Oath.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'wing', rewards: [gold(100)], progress: (s) => count(Math.min(1, heavenCleared(s)), 1) },
  { id: 'hv_ch2', name: 'Seven Skies Fall Quiet', description: 'Clear Chapter II of The Twin Oath.', category: 'CAMPAIGN', tier: 'SILVER', icon: 'star', rewards: [gold(200), essence(100)], check: (s) => chapterCleared(s, 'tw2') },
  { id: 'hv_arbiter', name: 'Found Worthy', description: 'Defeat the Arbiter at the top of The Twin Oath.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'crown', rewards: [title('Witness of the Tribunal'), pack('RECKONING', 2)], check: (s) => cleared(s, 'hv3_final') },
  { id: 'codex_25', name: 'Turning Pages', description: 'Fill 25 pages of the Codex.', category: 'CAMPAIGN', tier: 'BRONZE', icon: 'scroll', rewards: [gold(150)], progress: (s) => count(codexProgress(s).open, 25) },
  {
    id: 'codex_all', name: 'The Whole Story', description: 'Fill every page of the Codex.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'tower', rewards: [title('Loremaster'), essence(400)],
    progress: (s) => {
      const p = codexProgress(s);
      return count(p.open, p.total);
    },
  },
  {
    id: 'camp_all', name: 'Cartographer of Shards', description: 'Clear every encounter of the campaign.', category: 'CAMPAIGN', tier: 'GOLD', icon: 'compass', rewards: [cardBack, essence(300)],
    progress: (s) => {
      const ids = allEncounterIds();
      return count(ids.filter((id) => cleared(s, id)).length, ids.length);
    },
  },

  // Ranked vs AI ------------------------------------------------------------
  { id: 'air_silver', name: 'Silver Lining', description: 'Reach Silver in Ranked vs AI.', category: 'AI_RANKED', tier: 'BRONZE', icon: 'shield', rewards: [gold(100)], check: (s) => reachedTier(s, 'Silver') },
  { id: 'air_gold', name: 'Gilded Duelist', description: 'Reach Gold in Ranked vs AI.', category: 'AI_RANKED', tier: 'SILVER', icon: 'shield', rewards: [gold(150), essence(50)], check: (s) => reachedTier(s, 'Gold') },
  { id: 'air_diamond', name: 'Diamond Mind', description: 'Reach Diamond in Ranked vs AI.', category: 'AI_RANKED', tier: 'GOLD', icon: 'crystal', rewards: [essence(200), pack('ABYSS')], check: (s) => reachedTier(s, 'Diamond') },
  { id: 'air_crown', name: 'Crowned by the Machine', description: 'Reach Crown, the top of Ranked vs AI.', category: 'AI_RANKED', tier: 'GOLD', icon: 'crown', rewards: [title('Crowned Duelist'), cardBack], check: (s) => reachedTier(s, 'Crown') },

  // Arena -------------------------------------------------------------------
  { id: 'arena_first', name: 'Into the Arena', description: 'Finish an Arena run.', category: 'ARENA', tier: 'BRONZE', icon: 'trophy', rewards: [gold(100)], progress: (s) => count(s.arena.runsPlayed, 1) },
  { id: 'arena_2', name: 'Crowd Pleaser', description: 'Win 2 matches in one Arena run.', category: 'ARENA', tier: 'SILVER', icon: 'trophy', rewards: [pack('CORE'), gold(100)], progress: (s) => count(s.arena.bestWins, 2) },
  { id: 'arena_4', name: 'Arena Legend', description: `Win all ${ARENA.maxWins} matches of an Arena run.`, category: 'ARENA', tier: 'GOLD', icon: 'trophy', rewards: [title('Arena Legend'), pack('ABYSS', 2)], progress: (s) => count(s.arena.bestWins, ARENA.maxWins) },

  // Brawl -------------------------------------------------------------------
  { id: 'brawl_1', name: 'Brawler', description: 'Win a Brawl fight.', category: 'BRAWL', tier: 'BRONZE', icon: 'bolt', rewards: [gold(100)], progress: (s) => count(s.profile.brawlWins ?? 0, 1) },
  { id: 'brawl_both', name: 'Double Trouble', description: 'Win both fights of one Brawl rotation.', category: 'BRAWL', tier: 'SILVER', icon: 'bolt', rewards: [pack('DRAGON')], progress: (s) => count(brawlFightsWon(s), 2) },
  {
    id: 'brawl_champion', name: 'Giant Slayer', description: 'Win a Brawl fight with the Champion rule.', category: 'BRAWL', tier: 'SILVER', icon: 'crown', rewards: [essence(150)],
    check: (_s, m) => !!m && m.mode === 'BRAWL' && m.result === 'WIN' && !!findBrawlFight(m.brawlFightId ?? '')?.modifiers.some((x) => x.id === 'champion'),
  },
  { id: 'brawl_10', name: 'Rule Breaker', description: 'Win 10 Brawl matches.', category: 'BRAWL', tier: 'SILVER', icon: 'bolt', rewards: [pack('DRAGON'), gold(150)], progress: (s) => count(s.profile.brawlWins ?? 0, 10) },
  { id: 'brawl_50', name: 'King of Chaos', description: 'Win 50 Brawl matches.', category: 'BRAWL', tier: 'GOLD', icon: 'crown', rewards: [title('King of Chaos'), cardBack], progress: (s) => count(s.profile.brawlWins ?? 0, 50) },

  // Dungeon -----------------------------------------------------------------
  { id: 'dungeon_floor', name: 'Into the Depths', description: 'Beat the first floor of the Dungeon.', category: 'DUNGEON', tier: 'BRONZE', icon: 'skull', rewards: [gold(150)], progress: (s) => count(s.dungeon?.bestWins ?? 0, 3) },
  { id: 'dungeon_clear', name: 'Dungeon Conqueror', description: 'Clear all three floors of the Dungeon.', category: 'DUNGEON', tier: 'GOLD', icon: 'crown', rewards: [title('Delver of the Deep'), pack('DRAGON', 2)], progress: (s) => count(s.dungeon?.clears ?? 0, 1) },
  {
    id: 'dungeon_three', name: 'Many Paths Down', description: 'Clear the Dungeon with three different factions.', category: 'DUNGEON', tier: 'GOLD', icon: 'compass', rewards: [cardBack, essence(300)],
    progress: (s) => count(s.dungeon?.clearedFactions.length ?? 0, 3),
  },

  // Collection --------------------------------------------------------------
  { id: 'packs_10', name: 'Pack Rat', description: 'Open 10 booster packs.', category: 'COLLECTION', tier: 'BRONZE', icon: 'pack', rewards: [gold(100)], progress: (s) => count(s.profile.packsOpened, 10) },
  { id: 'packs_50', name: 'Hoarder of Boosters', description: 'Open 50 booster packs.', category: 'COLLECTION', tier: 'SILVER', icon: 'pack', rewards: [pack('ABYSS'), essence(100)], progress: (s) => count(s.profile.packsOpened, 50) },
  { id: 'craft_10', name: 'Shardsmith', description: 'Craft 10 cards.', category: 'COLLECTION', tier: 'BRONZE', icon: 'hammer', rewards: [essence(100)], progress: (s) => count(s.profile.cardsCrafted, 10) },
  { id: 'legend_faction', name: 'Hall of Legends', description: 'Own every Legendary card of one faction.', category: 'COLLECTION', tier: 'SILVER', icon: 'crystal', rewards: [essence(250)], progress: bestLegendaryFaction },
  {
    id: 'set_core', name: 'Core Complete', description: 'Own at least one copy of every card in the Core set.', category: 'COLLECTION', tier: 'GOLD', icon: 'deck', rewards: [cardBack, gold(300)],
    progress: (s) => {
      const pool = poolCards().filter((c) => c.set === 'CORE');
      return count(ownedOf(s, pool), pool.length);
    },
  },

  { id: 'packs_100', name: 'Pack Master', description: 'Open 100 booster packs.', category: 'COLLECTION', tier: 'GOLD', icon: 'pack', rewards: [pack('DRAGON', 3), essence(200)], progress: (s) => count(s.profile.packsOpened, 100) },
  { id: 'craft_50', name: 'Master Shardsmith', description: 'Craft 50 cards.', category: 'COLLECTION', tier: 'SILVER', icon: 'hammer', rewards: [essence(300)], progress: (s) => count(s.profile.cardsCrafted, 50) },
  { id: 'set_deep', name: 'Realms Explored', description: 'Own at least one copy of every card in Fantasy Realms.', category: 'COLLECTION', tier: 'GOLD', icon: 'deck', rewards: [cardBack, gold(300)], progress: (s) => setProgress(s, 'DEEP') },
  { id: 'set_abyss', name: 'Shadow Archivist', description: 'Own at least one copy of every card in Legions of Shadow.', category: 'COLLECTION', tier: 'GOLD', icon: 'deck', rewards: [cardBack, gold(300)], progress: (s) => setProgress(s, 'ABYSS') },
  { id: 'set_dragon', name: 'Dragon Hoard', description: 'Own at least one copy of every card in Dragon Realm.', category: 'COLLECTION', tier: 'GOLD', icon: 'wing', rewards: [title('Dragonlord'), cardBack], progress: (s) => setProgress(s, 'DRAGON') },
  { id: 'set_reckoning', name: 'Settled Accounts', description: 'Own at least one copy of every card in Void Reckoning.', category: 'COLLECTION', tier: 'GOLD', icon: 'deck', rewards: [title('Herald of the Black Sun'), cardBack], progress: (s) => setProgress(s, 'RECKONING') },
  {
    id: 'dragons_20', name: 'Dragon Tamer', description: 'Own 20 different Dragon cards.', category: 'COLLECTION', tier: 'SILVER', icon: 'wing', rewards: [pack('DRAGON', 2)],
    progress: (s) => count(ownedOf(s, dragonPool()), Math.min(20, dragonPool().length)),
  },
  {
    id: 'cat_legends', name: 'Four Legendary Paws', description: 'Own Artemis, Simba, Scar and Archmage Elinka.', category: 'COLLECTION', tier: 'GOLD', icon: 'paw', rewards: [title('Fluffseeker')],
    progress: (s) => count(CAT_LEGENDS.filter((id) => ownedCopies(s.collection, id) > 0).length, CAT_LEGENDS.length),
  },
  {
    id: 'lamp_legends', name: 'Keepers of the Flame', description: 'Own Nyx, Vael and Oblivia.', category: 'COLLECTION', tier: 'SILVER', icon: 'flame', rewards: [essence(200)],
    progress: (s) => count(ownedIds(s, LAMP_LEGENDS), LAMP_LEGENDS.length),
  },
  {
    id: 'inn_guests', name: 'Full House', description: 'Own all twelve cards of The Wraithwood Inn.', category: 'COLLECTION', tier: 'GOLD', icon: 'people', rewards: [title('Innkeeper'), essence(300)],
    progress: (s) => count(ownedIds(s, innGuestCards()), innGuestCards().length),
  },
  {
    id: 'inf_court', name: 'The Burning Court', description: 'Own all twelve cards of The Underflame.', category: 'COLLECTION', tier: 'GOLD', icon: 'flame', rewards: [title('Lord of the Burning Court'), essence(300)],
    progress: (s) => count(ownedIds(s, infernoCourtCards()), infernoCourtCards().length),
  },
  {
    id: 'hv_host', name: 'The Heavenly Host', description: 'Own all nine knights of The Twin Oath.', category: 'COLLECTION', tier: 'GOLD', icon: 'wing', rewards: [title('Knight of the Host'), essence(300)],
    progress: (s) => count(ownedIds(s, heavenHostCards()), heavenHostCards().length),
  },
  {
    id: 'legend_10', name: 'Legend Collector', description: 'Own 10 different Legendary cards.', category: 'COLLECTION', tier: 'SILVER', icon: 'crystal', rewards: [essence(200)],
    progress: (s) => count(ownedOf(s, collectibleCards().filter((c) => c.rarity === 'LEGENDARY')), 10),
  },
  {
    id: 'legend_30', name: 'Keeper of Legends', description: 'Own 30 different Legendary cards.', category: 'COLLECTION', tier: 'GOLD', icon: 'crown', rewards: [title('Keeper of Legends'), essence(400)],
    progress: (s) => count(ownedOf(s, collectibleCards().filter((c) => c.rarity === 'LEGENDARY')), 30),
  },
  { id: 'prismatic_1', name: 'Prismatic Prize', description: 'Own a Prismatic card.', category: 'COLLECTION', tier: 'BRONZE', icon: 'star', rewards: [gold(100)], progress: (s) => count(prismaticCards(s), 1) },
  { id: 'shiny_15', name: 'Shimmering Collection', description: 'Own 15 different cards in Foil or Prismatic.', category: 'COLLECTION', tier: 'SILVER', icon: 'star', rewards: [essence(200)], progress: (s) => count(shinyCards(s), 15) },
  { id: 'portraits_3', name: 'New Faces', description: 'Own 3 Warden portraits.', category: 'COLLECTION', tier: 'BRONZE', icon: 'person', rewards: [gold(150)], progress: (s) => count(s.profile.portraits.length, 3) },
  {
    id: 'portraits_all', name: 'Hall of Faces', description: 'Own every Warden portrait.', category: 'COLLECTION', tier: 'GOLD', icon: 'person', rewards: [title('Many-Faced'), essence(300)],
    progress: (s) => count(PORTRAITS.filter((p) => s.profile.portraits.includes(p.id)).length, PORTRAITS.length),
  },
  { id: 'cardbacks_6', name: 'Back Catalogue', description: 'Own 6 card backs.', category: 'COLLECTION', tier: 'SILVER', icon: 'cardback', rewards: [gold(200)], progress: (s) => count(s.profile.cardBacks.length, 6) },
  { id: 'quests_50', name: 'Quest Hunter', description: 'Complete 50 quests.', category: 'BATTLE', tier: 'SILVER', icon: 'scroll', rewards: [pack('DRAGON'), gold(150)], progress: (s) => count(s.quests.totalCompleted, 50) },
  {
    id: 'weekly_all', name: 'A Week Well Spent', description: 'Claim all three weekly quests of one week.', category: 'BATTLE', tier: 'SILVER', icon: 'scroll', rewards: [essence(150)],
    check: (s) => s.quests.weekly.length >= 3 && s.quests.weekly.every((q) => q.claimed),
  },

  // Factions ----------------------------------------------------------------
  {
    id: 'faction_all', name: 'Six Banners', description: 'Win a match with each of the six factions.', category: 'FACTIONS', tier: 'SILVER', icon: 'shield', rewards: [cardBack],
    progress: (s) => count(PLAYABLE_FACTIONS.filter((f) => (s.profile.factionWins[f] ?? 0) > 0).length, PLAYABLE_FACTIONS.length),
  },
  {
    id: 'faction_25', name: 'Sworn Banner', description: 'Win 25 matches with a single faction.', category: 'FACTIONS', tier: 'SILVER', icon: 'tower', rewards: [essence(150)],
    progress: (s) => count(Math.max(0, ...PLAYABLE_FACTIONS.map((f) => s.profile.factionWins[f] ?? 0)), 25),
  },
  {
    id: 'faction_100', name: 'Champion of a Faction', description: 'Win 100 matches with a single faction.', category: 'FACTIONS', tier: 'GOLD', icon: 'tower', rewards: [title('Banner-Sworn'), pack('ABYSS', 2)],
    progress: (s) => count(Math.max(0, ...PLAYABLE_FACTIONS.map((f) => s.profile.factionWins[f] ?? 0)), 100),
  },

  {
    id: 'frames_3', name: 'Thrice Framed', description: 'Earn three Warden frames.', category: 'FACTIONS', tier: 'SILVER', icon: 'shield', rewards: [essence(300)],
    progress: (s) => count(framesEarned(s), 3),
  },
  {
    id: 'frames_all', name: 'Gallery of Wardens', description: 'Earn all six Warden frames.', category: 'FACTIONS', tier: 'GOLD', icon: 'crown', rewards: [title('Warden of Six Frames'), essence(500)],
    progress: (s) => count(framesEarned(s), PLAYABLE_FACTIONS.length),
  },

  // Online ------------------------------------------------------------------
  {
    id: 'online_win', name: 'Worthy Opponent', description: 'Win an online match against another player.', category: 'ONLINE', tier: 'BRONZE', icon: 'compass', rewards: [gold(100)],
    check: (s, m) => onlineWins(s) > 0 || (!!m && m.result === 'WIN' && ONLINE_MODES.includes(m.mode)),
  },
  { id: 'ranked_10', name: 'Ladder Climber', description: 'Win 10 Ranked online matches.', category: 'ONLINE', tier: 'SILVER', icon: 'crown', rewards: [pack('ABYSS'), gold(100)], progress: (s) => count(s.profile.ranked.wins, 10) },
  { id: 'tournament_win', name: 'Bracket Breaker', description: 'Win a tournament.', category: 'ONLINE', tier: 'GOLD', icon: 'chalice', rewards: [title('Bracket Champion'), gold(300)], progress: (s) => count(s.profile.tournamentsWon ?? 0, 1) },
];

const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export const getAchievement = (id: string): AchievementDef | undefined => BY_ID.get(id);
