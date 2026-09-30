import { DAILY_CONFIG, DAILY_REWARDS, type DailyReward } from '@/config/dailyRewards';
import { cardsBy } from '@/data/cards';
import type { RngState } from '@/core/rng';
import { pickOne } from '@/core/rng';
import { dayKey, daysBetween, err, ok, type Result } from '@/core/utils';
import { addCards, pushReward, type GameSave } from './save';

export interface DailyStatus {
  canClaim: boolean;
  /** Index of the reward that would be claimed now (0-6). */
  index: number;
  reason?: string;
}

/**
 * One claim per local calendar day. A clock moved backwards never grants a
 * claim (lastClaimAt is monotonic), preventing trivial repeat claims.
 */
export function dailyStatus(save: GameSave, now: number): DailyStatus {
  const d = save.daily;
  const today = dayKey(now);
  if (d.lastClaimDay === today) return { canClaim: false, index: d.nextIndex, reason: 'Already claimed today.' };
  if (now < d.lastClaimAt) return { canClaim: false, index: d.nextIndex, reason: 'System clock appears to have moved backwards.' };
  let index = d.nextIndex % DAILY_REWARDS.length;
  if (d.lastClaimDay && daysBetween(d.lastClaimDay, today) > 1 + DAILY_CONFIG.streakGraceDays) index = 0;
  return { canClaim: true, index };
}

export function claimDaily(save: GameSave, now: number, rng: RngState): Result<{ save: GameSave; reward: DailyReward; cardId?: string }> {
  const status = dailyStatus(save, now);
  if (!status.canClaim) return err(status.reason ?? 'Cannot claim.');
  const reward = DAILY_REWARDS[status.index];
  let next: GameSave = {
    ...save,
    daily: { nextIndex: (status.index + 1) % DAILY_REWARDS.length, lastClaimDay: dayKey(now), lastClaimAt: now, totalClaims: save.daily.totalClaims + 1 },
  };
  let cardId: string | undefined;
  const source = `Daily reward — Day ${status.index + 1}`;
  switch (reward.kind) {
    case 'GOLD':
      next = { ...next, profile: { ...next.profile, gold: next.profile.gold + reward.amount } };
      next = pushReward(next, { source, gold: reward.amount }, now);
      break;
    case 'ESSENCE':
      next = { ...next, profile: { ...next.profile, essence: next.profile.essence + reward.amount } };
      next = pushReward(next, { source, essence: reward.amount }, now);
      break;
    case 'PACK':
      next = { ...next, economy: { ...next.economy, packs: { ...next.economy.packs, [reward.setId]: (next.economy.packs[reward.setId] ?? 0) + reward.amount } } };
      next = pushReward(next, { source, packs: { setId: reward.setId, amount: reward.amount } }, now);
      break;
    case 'RANDOM_CARD': {
      const pool = cardsBy({ rarity: reward.rarity });
      const unowned = pool.filter((c) => !(next.collection.cards[c.id] && next.collection.cards[c.id].NORMAL + next.collection.cards[c.id].FOIL + next.collection.cards[c.id].PRISMATIC > 0));
      const card = pickOne(rng, unowned.length ? unowned : pool);
      if (card) {
        cardId = card.id;
        next = { ...next, collection: addCards(next.collection, [{ cardId: card.id, variant: 'NORMAL' }]) };
        next = pushReward(next, { source, cards: [{ cardId: card.id, variant: 'NORMAL' }] }, now);
      }
      break;
    }
  }
  return ok({ save: next, reward, cardId });
}
