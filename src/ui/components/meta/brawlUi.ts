import type { BrawlFight } from '@/domain/brawl';
import { t, tn } from '@/i18n';

const HOUR_MS = 3_600_000;

/** "5 days" / "7 hours": time left until the next Brawl rotation. */
export function brawlTimeLeft(ms: number): string {
  const hours = Math.max(1, Math.ceil(ms / HOUR_MS));
  if (hours < 48) return tn(hours, '{n} hour', '{n} hours');
  return tn(Math.floor(hours / 24), '{n} day', '{n} days');
}

/** "Fire Surge + Dragon Nest" */
export const brawlFightTitle = (fight: Pick<BrawlFight, 'modifiers'>) => fight.modifiers.map((m) => t(m.name)).join(' + ');
