import type { CSSProperties } from 'react';
import { CROWN_RANK, TIER_COLORS, aiStrengthFor, aiTierOf, divisionNumeral } from '@/domain/aiRanked';
import { Glyph } from '@/ui/components/Icons';
import { t } from '@/i18n';

/** "Gold II" in the current language; "Crown" at the top. */
export function aiRankLabel(rank: number): string {
  const numeral = divisionNumeral(rank);
  return numeral ? `${t(aiTierOf(rank))} ${numeral}` : t('Crown');
}

const DIFFICULTY_LABEL = { EASY: 'Easy AI', NORMAL: 'Normal AI', HARD: 'Hard AI', EXPERT: 'Expert AI' } as const;
const POOL_LABEL = ['Commons only', 'Commons and Rares', 'Commons, Rares and Epics', 'All rarities'] as const;

/** "Hard AI · Commons, Rares and Epics" plus any boss bonuses. */
export function aiStrengthText(rank: number): string {
  const s = aiStrengthFor(rank);
  const parts = [t(DIFFICULTY_LABEL[s.difficulty]), t(POOL_LABEL[s.rarities.length - 1])];
  if (s.heroHealth) parts.push(t('{n} health', { n: s.heroHealth }));
  if (s.bonusStartingEnergy) parts.push(t('+{n} starting energy', { n: s.bonusStartingEnergy }));
  return parts.join(' · ');
}

/** A faceted shard badge in the tier colour with the division numeral (a crown at the top). */
export function AiRankEmblem({ rank, size = 96 }: { rank: number; size?: number }) {
  const tier = aiTierOf(rank);
  const crown = rank >= CROWN_RANK;
  return (
    <span className={`air-emblem tier-${tier.toLowerCase()}`} style={{ '--tc': TIER_COLORS[tier], '--size': `${size}px` } as CSSProperties} aria-hidden>
      <span className="air-emblem-core">{crown ? <Glyph name="crown" size={Math.round(size * 0.42)} /> : <span className="air-emblem-num">{divisionNumeral(rank)}</span>}</span>
    </span>
  );
}
