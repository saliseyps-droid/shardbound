import { QUEST_CONFIG, QUEST_TEMPLATES, type QuestTemplate, type QuestType } from '@/config/quests';
import type { RngState } from '@/core/rng';
import { pickOne } from '@/core/rng';
import { dayKey, err, ok, type Result } from '@/core/utils';
import type { PlayableFaction } from '@/game/types';
import { grantXp, type LevelUp } from './progression';
import { pushReward, type GameSave, type Quest } from './save';

export interface QuestProgressEvent {
  type: QuestType;
  amount: number;
  faction?: PlayableFaction;
}

function fromTemplate(t: QuestTemplate, now: number, n: number): Quest {
  return {
    id: `quest_${now.toString(36)}_${n}_${t.id}`,
    templateId: t.id,
    type: t.type,
    name: t.name,
    description: t.description,
    target: t.target,
    progress: 0,
    gold: t.gold,
    xp: t.xp,
    faction: t.faction,
    completed: false,
    claimed: false,
    createdAt: now,
  };
}

function pickTemplate(active: Quest[], rng: RngState, exclude: string[] = []): QuestTemplate | undefined {
  const used = new Set([...active.map((q) => q.templateId), ...exclude]);
  return pickOne(rng, QUEST_TEMPLATES.filter((t) => !used.has(t.id))) ?? pickOne(rng, QUEST_TEMPLATES);
}

/** Daily refresh: grants new quests (up to the maximum) once per calendar day. */
export function refreshQuests(save: GameSave, now: number, rng: RngState): GameSave {
  const today = dayKey(now);
  const q = save.quests;
  if (q.lastRefreshDay === today) return save;
  // Remove claimed quests, keep unfinished ones.
  let active = q.active.filter((x) => !x.claimed);
  const isFirstEver = q.lastRefreshDay === null;
  const toAdd = isFirstEver ? QUEST_CONFIG.maxActive : QUEST_CONFIG.newPerDay;
  for (let i = 0; i < toAdd && active.length < QUEST_CONFIG.maxActive; i++) {
    const t = pickTemplate(active, rng);
    if (t) active = [...active, fromTemplate(t, now, i)];
  }
  return { ...save, quests: { ...q, active, lastRefreshDay: today } };
}

export function applyQuestProgress(save: GameSave, events: QuestProgressEvent[]): { save: GameSave; completed: Quest[] } {
  const completed: Quest[] = [];
  const active = save.quests.active.map((quest) => {
    if (quest.completed) return quest;
    let progress = quest.progress;
    for (const e of events) {
      if (e.type !== quest.type || e.amount <= 0) continue;
      if (quest.type === 'WIN_WITH_FACTION' && quest.faction !== e.faction) continue;
      progress += e.amount;
    }
    // Guard against corrupted/invalid progress values.
    if (!Number.isFinite(progress) || progress < 0) progress = 0;
    progress = Math.min(progress, quest.target);
    const done = progress >= quest.target;
    const next = { ...quest, progress, completed: done };
    if (done && !quest.completed) completed.push(next);
    return next;
  });
  return { save: { ...save, quests: { ...save.quests, active } }, completed };
}

export function claimQuest(save: GameSave, questId: string, now: number): Result<{ save: GameSave; quest: Quest; levelUps: LevelUp[] }> {
  const quest = save.quests.active.find((q) => q.id === questId);
  if (!quest) return err('Quest not found.');
  if (!quest.completed) return err('Quest is not complete yet.');
  if (quest.claimed) return err('Reward already claimed.');
  let next: GameSave = {
    ...save,
    profile: { ...save.profile, gold: save.profile.gold + quest.gold },
    quests: {
      ...save.quests,
      active: save.quests.active.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
      totalCompleted: save.quests.totalCompleted + 1,
    },
  };
  const xp = grantXp(next, quest.xp, now);
  next = pushReward(xp.save, { source: `Quest: ${quest.name}`, gold: quest.gold, xp: quest.xp }, now);
  return ok({ save: next, quest, levelUps: xp.levelUps });
}

export function canReroll(save: GameSave, now: number): boolean {
  const today = dayKey(now);
  const used = save.quests.rerollDay === today ? save.quests.rerollsUsed : 0;
  return used < QUEST_CONFIG.rerollsPerDay;
}

export function rerollQuest(save: GameSave, questId: string, now: number, rng: RngState): Result<GameSave> {
  const quest = save.quests.active.find((q) => q.id === questId);
  if (!quest) return err('Quest not found.');
  if (quest.completed) return err('Completed quests cannot be replaced.');
  if (!canReroll(save, now)) return err('No quest rerolls left today.');
  const t = pickTemplate(save.quests.active, rng, [quest.templateId]);
  if (!t) return err('No other quests available.');
  const today = dayKey(now);
  const used = save.quests.rerollDay === today ? save.quests.rerollsUsed : 0;
  const replacement = fromTemplate(t, now, 9);
  return ok({
    ...save,
    quests: {
      ...save.quests,
      active: save.quests.active.map((q) => (q.id === questId ? replacement : q)),
      rerollDay: today,
      rerollsUsed: used + 1,
    },
  });
}
