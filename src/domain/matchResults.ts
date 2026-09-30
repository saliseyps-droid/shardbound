import { MATCH_REWARDS, XP_REWARDS, type Difficulty } from '@/config/progression';
import { dayKey } from '@/core/utils';
import type { MatchStats } from '@/engine/types';
import type { OpponentReward } from '@/data/opponents';
import type { PlayableFaction, SetId } from '@/game/types';
import { grantXp, type LevelUp } from './progression';
import { applyRanked } from './ranked';
import { applyQuestProgress, type QuestProgressEvent } from './quests';
import { addCards, MATCH_HISTORY_LIMIT, pushReward, type GameSave, type MatchRecord, type Quest } from './save';

export interface MatchSummary {
  mode: MatchRecord['mode'];
  opponentId: string;
  opponentName: string;
  difficulty: Difficulty;
  deckId: string;
  deckName: string;
  deckFaction: PlayableFaction;
  result: 'WIN' | 'LOSS' | 'DRAW';
  turns: number;
  durationMs: number;
  stats: MatchStats;
  conceded: boolean;
  /** PvE encounter first-clear reward (applied only on first win). */
  pveEncounterId?: string;
  firstWinReward?: OpponentReward;
  /** Ranked online match: the opponent's rating at match start. */
  ranked?: { opponentRating: number };
}

export interface RewardLine {
  label: string;
  gold?: number;
  xp?: number;
  essence?: number;
  packs?: { setId: SetId; amount: number };
  cardId?: string;
}

export interface MatchRewards {
  gold: number;
  xp: number;
  essence: number;
  lines: RewardLine[];
  levelUps: LevelUp[];
  questsCompleted: Quest[];
  firstClear: boolean;
  levelBefore: number;
  xpBefore: number;
  /** Ranked rating change (ranked matches only). */
  ratingChange?: number;
  ratingAfter?: number;
}

export function questEventsFromMatch(summary: MatchSummary): QuestProgressEvent[] {
  const s = summary.stats;
  const events: QuestProgressEvent[] = [
    { type: 'PLAY_MATCHES', amount: 1 },
    { type: 'PLAY_CARDS', amount: s.cardsPlayed },
    { type: 'PLAY_UNITS', amount: s.unitsPlayed },
    { type: 'PLAY_SPELLS', amount: s.spellsPlayed },
    { type: 'DEAL_DAMAGE', amount: s.damageDealt },
    { type: 'DESTROY_UNITS', amount: s.unitsDestroyed },
  ];
  if (summary.result === 'WIN') {
    events.push({ type: 'WIN_MATCHES', amount: 1 });
    events.push({ type: 'WIN_WITH_FACTION', amount: 1, faction: summary.deckFaction });
  }
  return events;
}

/** Applies a finished match to the save: stats, rewards, quests, PvE and history. */
export function applyMatchResult(save: GameSave, summary: MatchSummary, now: number): { save: GameSave; rewards: MatchRewards } {
  const today = dayKey(now);
  const lines: RewardLine[] = [];
  let gold = 0;
  let xp = 0;
  let essence = 0;
  let firstClear = false;
  const levelBefore = save.profile.level;
  const xpBefore = save.profile.xp;

  const winsToday = save.profile.winsTodayDay === today ? save.profile.winsToday : 0;
  // Online (PvP) matches reward and progress quests exactly like normal matches.
  const eligible = summary.result === 'WIN' || summary.turns >= MATCH_REWARDS.minTurnsForRewards;
  const xpMult = MATCH_REWARDS.difficultyXpMultiplier[summary.difficulty] ?? 1;

  let s: GameSave = save;

  if (summary.mode === 'TUTORIAL') {
    if (!save.profile.tutorialCompleted && summary.result === 'WIN') {
      gold += MATCH_REWARDS.tutorialGold;
      xp += XP_REWARDS.tutorialComplete;
      lines.push({ label: 'Tutorial complete', gold: MATCH_REWARDS.tutorialGold, xp: XP_REWARDS.tutorialComplete });
      s = { ...s, profile: { ...s.profile, tutorialCompleted: true } };
    }
  } else if (eligible) {
    if (summary.result === 'WIN') {
      let g = MATCH_REWARDS.goldPerWin + (MATCH_REWARDS.difficultyGoldBonus[summary.difficulty] ?? 0);
      if (winsToday >= MATCH_REWARDS.dailyFullGoldWins) g = Math.round(g * MATCH_REWARDS.reducedGoldMultiplier);
      const x = Math.round(XP_REWARDS.win * xpMult);
      gold += g;
      xp += x;
      lines.push({ label: 'Victory', gold: g, xp: x });
      if (save.profile.firstWinDay !== today) {
        gold += MATCH_REWARDS.firstWinOfDayGold;
        xp += XP_REWARDS.firstWinOfDay;
        lines.push({ label: 'First win of the day', gold: MATCH_REWARDS.firstWinOfDayGold, xp: XP_REWARDS.firstWinOfDay });
      }
    } else {
      const g = MATCH_REWARDS.goldPerLoss;
      const x = Math.round(XP_REWARDS.loss * xpMult);
      gold += g;
      xp += x;
      lines.push({ label: summary.result === 'DRAW' ? 'Draw' : 'Defeat', gold: g, xp: x });
    }
  }

  // PvE first clear.
  if (summary.mode === 'PVE' && summary.pveEncounterId && summary.result === 'WIN') {
    const prev = s.pve.completed[summary.pveEncounterId];
    if (!prev) {
      firstClear = true;
      const r = summary.firstWinReward ?? {};
      const g = r.gold ?? 0;
      const x = (r.xp ?? 0) + XP_REWARDS.pveFirstClear;
      gold += g;
      xp += x;
      essence += r.essence ?? 0;
      lines.push({ label: 'First clear', gold: g || undefined, xp: x, essence: r.essence, packs: r.packs, cardId: r.cardId });
      if (r.packs) {
        s = { ...s, economy: { ...s.economy, packs: { ...s.economy.packs, [r.packs.setId]: (s.economy.packs[r.packs.setId] ?? 0) + r.packs.amount } } };
      }
      if (r.cardId) s = { ...s, collection: addCards(s.collection, [{ cardId: r.cardId, variant: 'NORMAL' }]) };
    }
    s = {
      ...s,
      pve: {
        completed: {
          ...s.pve.completed,
          [summary.pveEncounterId]: { firstClearAt: prev?.firstClearAt ?? now, wins: (prev?.wins ?? 0) + 1 },
        },
      },
    };
  }

  // Profile stats.
  const p = s.profile;
  const factionWins = { ...p.factionWins };
  if (summary.result === 'WIN') factionWins[summary.deckFaction] = (factionWins[summary.deckFaction] ?? 0) + 1;
  s = {
    ...s,
    profile: {
      ...p,
      gold: p.gold + gold,
      essence: p.essence + essence,
      wins: p.wins + (summary.result === 'WIN' && summary.mode !== 'TUTORIAL' ? 1 : 0),
      losses: p.losses + (summary.result === 'LOSS' && summary.mode !== 'TUTORIAL' ? 1 : 0),
      draws: p.draws + (summary.result === 'DRAW' ? 1 : 0),
      firstWinDay: summary.result === 'WIN' && summary.mode !== 'TUTORIAL' ? today : p.firstWinDay,
      winsToday: summary.result === 'WIN' ? winsToday + 1 : winsToday,
      winsTodayDay: today,
      factionWins,
    },
  };

  // Quests (tutorial matches don't count).
  let questsCompleted: Quest[] = [];
  if (summary.mode !== 'TUTORIAL' && eligible) {
    const q = applyQuestProgress(s, questEventsFromMatch(summary));
    s = q.save;
    questsCompleted = q.completed;
  }

  let ratingChange: number | undefined;
  if (summary.ranked && summary.mode === 'RANKED') {
    const r = applyRanked(s.profile.ranked, summary.ranked.opponentRating, summary.result);
    ratingChange = r.delta;
    s = { ...s, profile: { ...s.profile, ranked: r.state } };
  }

  const xpResult = grantXp(s, xp, now);
  s = xpResult.save;

  const record: MatchRecord = {
    id: `m_${now.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    date: now,
    durationMs: summary.durationMs,
    mode: summary.mode,
    opponentId: summary.opponentId,
    opponentName: summary.opponentName,
    difficulty: summary.difficulty,
    deckId: summary.deckId,
    deckName: summary.deckName,
    deckFaction: summary.deckFaction,
    result: summary.result,
    turns: summary.turns,
    damageDealt: summary.stats.damageDealt,
    cardsPlayed: summary.stats.cardsPlayed,
    unitsDestroyed: summary.stats.unitsDestroyed,
    goldEarned: gold,
    xpEarned: xp,
    conceded: summary.conceded,
    ratingChange,
  };
  s = { ...s, matchHistory: [record, ...s.matchHistory].slice(0, MATCH_HISTORY_LIMIT) };
  if (gold || xp || essence) {
    s = pushReward(s, { source: `${summary.result === 'WIN' ? 'Victory' : summary.result === 'DRAW' ? 'Draw' : 'Defeat'} vs ${summary.opponentName}`, gold: gold || undefined, xp: xp || undefined, essence: essence || undefined }, now);
  }

  return { save: s, rewards: { gold, xp, essence, lines, levelUps: xpResult.levelUps, questsCompleted, firstClear, levelBefore, xpBefore, ratingChange, ratingAfter: ratingChange !== undefined ? s.profile.ranked.rating : undefined } };
}
