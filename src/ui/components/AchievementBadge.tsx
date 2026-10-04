import type { CSSProperties } from 'react';
import type { LevelReward } from '@/config/progression';
import { SET_INFO } from '@/config/economy';
import { ACHIEVEMENTS, getAchievement, type AchievementDef, type AchievementTier } from '@/data/achievements';
import type { GameSave } from '@/domain/save';
import { Link } from 'react-router-dom';
import { ProgressBar } from './common';
import { t, tn } from '@/i18n';
import { Glyph } from './Icons';
import '@/ui/styles/achievements.css';

export const TIER_COLOR: Record<AchievementTier, string> = { BRONZE: '#d08f5c', SILVER: '#cfd8e3', GOLD: '#ffd27a' };
export const TIER_LABEL: Record<AchievementTier, string> = { BRONZE: 'Bronze', SILVER: 'Silver', GOLD: 'Gold' };

/** Faceted medallion in the achievement's tier colour; greyed out while locked. */
export function AchievementBadge({ def, unlocked, size = 52 }: { def: AchievementDef; unlocked: boolean; size?: number }) {
  return (
    <span
      className={`ach-badge tier-${def.tier.toLowerCase()} ${unlocked ? 'is-unlocked' : 'is-locked'}`}
      style={{ '--tier': TIER_COLOR[def.tier], '--size': `${size}px` } as CSSProperties}
      title={t(TIER_LABEL[def.tier])}
      aria-hidden
    >
      <Glyph name={def.icon} size={Math.round(size * 0.48)} />
    </span>
  );
}

export function achievementRewardLabel(r: LevelReward): string {
  switch (r.kind) {
    case 'GOLD':
      return t('{n} Gold', { n: r.amount });
    case 'ESSENCE':
      return t('{n} Essence', { n: r.amount });
    case 'PACK':
      return tn(r.amount, '{n} {set} pack', '{n} {set} packs', { set: SET_INFO[r.setId].name });
    case 'CARD_BACK':
      return t('New card back');
    case 'TITLE':
      return t('Title: {title}', { title: t(r.title) });
  }
}

export function AchievementRewards({ def }: { def: AchievementDef }) {
  return (
    <span className="ach-rewards">
      {def.rewards.map((r, i) => (
        <span key={i} className={`chip ach-reward kind-${r.kind.toLowerCase()}`}>
          {achievementRewardLabel(r)}
        </span>
      ))}
    </span>
  );
}

/** Profile panel: "Achievements X/Y", a progress bar and the most recent badges. */
export function ProfileAchievements({ save }: { save: GameSave }) {
  const unlocks = save.profile.achievements ?? {};
  const recent = ACHIEVEMENTS.filter((a) => unlocks[a.id])
    .sort((a, b) => unlocks[b.id] - unlocks[a.id])
    .slice(0, 6);
  const done = ACHIEVEMENTS.filter((a) => unlocks[a.id]).length;
  return (
    <section className="panel profile-achievements">
      <div className="panel-title">
        <span>{t('Achievements {done} / {total}', { done, total: ACHIEVEMENTS.length })}</span>
        <Link to="/achievements" className="small-link">
          {t('View all')}
        </Link>
      </div>
      <div className="ach-strip-head">
        <ProgressBar value={done} max={ACHIEVEMENTS.length} gold label={t('Achievements')} />
      </div>
      {recent.length === 0 ? (
        <p className="faint">{t('No achievements unlocked yet. Win a match to earn your first.')}</p>
      ) : (
        <>
          <div className="faint" style={{ marginBottom: 'var(--space-2)' }}>
            {t('Recently unlocked')}
          </div>
          <ul className="ach-strip">
            {recent.map((def) => (
              <li key={def.id} title={t(def.description)}>
                <AchievementBadge def={def} unlocked size={30} />
                <span>{t(def.name)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** Match results: the achievements this match unlocked. */
export function MatchAchievements({ ids }: { ids: string[] }) {
  const defs = ids.map(getAchievement).filter((d): d is AchievementDef => !!d);
  if (defs.length === 0) return null;
  return (
    <div className="results-achievements">
      <h5>{t('Achievements unlocked')}</h5>
      {defs.map((def) => (
        <div key={def.id} className={`results-ach tier-${def.tier.toLowerCase()}`}>
          <AchievementBadge def={def} unlocked size={34} />
          <div>
            <strong>{t(def.name)}</strong>
            <AchievementRewards def={def} />
          </div>
        </div>
      ))}
    </div>
  );
}
