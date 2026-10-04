import { ACHIEVEMENTS, getAchievement, type AchievementDef, type AchievementProgress } from '@/data/achievements';
import type { MatchSummary } from './matchResults';
import { applyLevelReward } from './progression';
import { pushReward, type GameSave } from './save';

/** Unlock time per achievement id. */
export type AchievementUnlocks = Record<string, number>;

/** The match just recorded, with the Warden's health left at the end (when known). */
export type AchievementMatch = MatchSummary & { heroHealth?: number };

const unlocks = (save: GameSave): AchievementUnlocks => save.profile.achievements ?? {};

/** Current / target for counted achievements (current capped at target); null for one-off feats. */
export function achievementProgress(save: GameSave, def: AchievementDef): AchievementProgress | null {
  if (!def.progress) return null;
  const p = def.progress(save);
  return { current: Math.min(p.current, p.target), target: p.target };
}

function isMet(save: GameSave, def: AchievementDef, match?: AchievementMatch): boolean {
  if (def.check?.(save, match)) return true;
  if (def.progress) {
    const p = def.progress(save);
    return p.target > 0 && p.current >= p.target;
  }
  return false;
}

/** Ids of achievements whose condition is met now but that are not unlocked yet. */
export function evaluateAchievements(save: GameSave, match?: AchievementMatch): string[] {
  const done = unlocks(save);
  return ACHIEVEMENTS.filter((a) => !done[a.id] && isMet(save, a, match)).map((a) => a.id);
}

/** Marks one achievement unlocked and grants its rewards (titles are added, never equipped). */
function grant(save: GameSave, def: AchievementDef, now: number): GameSave {
  let s: GameSave = { ...save, profile: { ...save.profile, achievements: { ...unlocks(save), [def.id]: now } } };
  for (const r of def.rewards) {
    if (r.kind === 'TITLE') {
      if (!s.profile.titles.includes(r.title)) s = { ...s, profile: { ...s.profile, titles: [...s.profile.titles, r.title] } };
    } else s = applyLevelReward(s, r);
  }
  return s;
}

export interface SettledAchievements {
  save: GameSave;
  /** Newly unlocked ids, in list order. */
  unlocked: string[];
  /** Gold and Essence the unlocks paid out. */
  gold: number;
  essence: number;
}

/**
 * Unlocks every achievement whose condition is met and grants its rewards, exactly once.
 * Retroactive runs (existing progress, on load) write one combined reward entry instead of one per achievement.
 * Returns the same save object when nothing unlocked.
 */
export function settleAchievements(save: GameSave, now: number, match?: AchievementMatch, opts: { retroactive?: boolean } = {}): SettledAchievements {
  let s = save;
  const unlocked: string[] = [];
  // Rewards can themselves complete another goal (rarely); a few passes settle it.
  for (let pass = 0; pass < 3; pass++) {
    const ids = evaluateAchievements(s, match).filter((id) => !unlocked.includes(id));
    if (ids.length === 0) break;
    for (const id of ids) {
      const def = getAchievement(id)!;
      const before = s;
      s = grant(s, def, now);
      if (!opts.retroactive) s = pushReward(s, rewardEntry(`Achievement: ${def.name}`, before, s, def), now);
      unlocked.push(id);
    }
  }
  if (unlocked.length === 0) return { save, unlocked, gold: 0, essence: 0 };
  if (opts.retroactive) s = pushReward(s, rewardEntry('Achievements from past progress', save, s), now);
  return { save: s, unlocked, gold: s.profile.gold - save.profile.gold, essence: s.profile.essence - save.profile.essence };
}

function rewardEntry(source: string, before: GameSave, after: GameSave, def?: AchievementDef) {
  const goldGained = after.profile.gold - before.profile.gold;
  const essenceGained = after.profile.essence - before.profile.essence;
  const packReward = def?.rewards.find((r) => r.kind === 'PACK');
  const titleReward = def?.rewards.find((r) => r.kind === 'TITLE');
  return {
    source,
    gold: goldGained || undefined,
    essence: essenceGained || undefined,
    packs: packReward?.kind === 'PACK' ? { setId: packReward.setId, amount: packReward.amount } : undefined,
    title: titleReward?.kind === 'TITLE' ? titleReward.title : undefined,
  };
}

/** Per-match counters the achievements need (win streak). Tutorial matches don't count. */
export function recordAchievementMatch(save: GameSave, match: MatchSummary): GameSave {
  if (match.mode === 'TUTORIAL') return save;
  const streak = match.result === 'WIN' ? (save.profile.winStreak ?? 0) + 1 : 0;
  return { ...save, profile: { ...save.profile, winStreak: streak, bestWinStreak: Math.max(save.profile.bestWinStreak ?? 0, streak) } };
}

/** Load-time repair: known ids with a valid unlock time only. */
export function repairAchievements(raw: unknown): AchievementUnlocks {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: AchievementUnlocks = {};
  for (const [id, at] of Object.entries(raw as Record<string, unknown>)) {
    if (getAchievement(id) && typeof at === 'number' && Number.isFinite(at) && at >= 0) out[id] = at;
  }
  return out;
}
