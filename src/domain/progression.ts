import { LEVELS, MAX_LEVEL, type LevelDefinition, type LevelReward } from '@/config/progression';
import type { GameSave } from './save';
import { pushReward } from './save';
import { CARD_BACKS } from '@/data/cardBacks';

/** Gold instead of a card back when the player already owns every one. */
export const CARD_BACK_FALLBACK_GOLD = 300;

export interface LevelUp {
  level: number;
  rewards: LevelReward[];
}

export function xpToNext(level: number): number {
  return LEVELS[level - 1]?.xpToNext ?? 0;
}

export function levelDef(level: number): LevelDefinition | undefined {
  return LEVELS[level - 1];
}

/** Applies a level reward to the save. */
export function applyLevelReward(save: GameSave, reward: LevelReward): GameSave {
  switch (reward.kind) {
    case 'GOLD':
      return { ...save, profile: { ...save.profile, gold: save.profile.gold + reward.amount } };
    case 'ESSENCE':
      return { ...save, profile: { ...save.profile, essence: save.profile.essence + reward.amount } };
    case 'PACK': {
      const packs = { ...save.economy.packs, [reward.setId]: (save.economy.packs[reward.setId] ?? 0) + reward.amount };
      return { ...save, economy: { ...save.economy, packs } };
    }
    case 'CARD_BACK': {
      const next = CARD_BACKS.find((b) => !save.profile.cardBacks.includes(b.id));
      if (!next) return { ...save, profile: { ...save.profile, gold: save.profile.gold + CARD_BACK_FALLBACK_GOLD } };
      return { ...save, profile: { ...save.profile, cardBacks: [...save.profile.cardBacks, next.id] } };
    }
    case 'TITLE': {
      const titles = save.profile.titles.includes(reward.title) ? save.profile.titles : [...save.profile.titles, reward.title];
      return { ...save, profile: { ...save.profile, titles, title: reward.title } };
    }
  }
}

/** Grants XP, processing any number of level-ups and their rewards. */
export function grantXp(save: GameSave, amount: number, now: number): { save: GameSave; levelUps: LevelUp[] } {
  if (amount <= 0 || !Number.isFinite(amount)) return { save, levelUps: [] };
  let s: GameSave = { ...save, profile: { ...save.profile, xp: save.profile.xp + Math.round(amount), totalXp: save.profile.totalXp + Math.round(amount) } };
  const levelUps: LevelUp[] = [];
  while (s.profile.level < MAX_LEVEL && s.profile.xp >= xpToNext(s.profile.level)) {
    const needed = xpToNext(s.profile.level);
    const level = s.profile.level + 1;
    s = { ...s, profile: { ...s.profile, level, xp: s.profile.xp - needed } };
    const rewards = levelDef(level)?.rewards ?? [];
    for (const r of rewards) s = applyLevelReward(s, r);
    levelUps.push({ level, rewards });
    s = pushReward(
      s,
      {
        source: `Reached level ${level}`,
        gold: rewards.reduce((a, r) => a + (r.kind === 'GOLD' ? r.amount : 0), 0) || undefined,
        essence: rewards.reduce((a, r) => a + (r.kind === 'ESSENCE' ? r.amount : 0), 0) || undefined,
        packs: rewards.find((r) => r.kind === 'PACK') as GameSave['recentRewards'][number]['packs'],
        title: (rewards.find((r) => r.kind === 'TITLE') as { title: string } | undefined)?.title,
      },
      now,
    );
  }
  if (s.profile.level >= MAX_LEVEL) s = { ...s, profile: { ...s.profile, xp: 0 } };
  return { save: s, levelUps };
}
