import { useMemo, useState } from 'react';
import { useAccount } from '@/state/accountStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, type AchievementCategory, type AchievementTier } from '@/data/achievements';
import { achievementProgress } from '@/domain/achievements';
import { ProgressBar, ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { AchievementBadge, AchievementRewards, TIER_LABEL } from '@/ui/components/AchievementBadge';
import '@/ui/styles/achievements.css';
import { formatDate, t } from '@/i18n';

type Category = 'ALL' | AchievementCategory;
type Status = 'ALL' | 'UNLOCKED' | 'LOCKED';
const TIERS: AchievementTier[] = ['BRONZE', 'SILVER', 'GOLD'];

export default function AchievementsScreen() {
  const save = useAccount((s) => s.save);
  const [category, setCategory] = useState<Category>('ALL');
  const [status, setStatus] = useState<Status>('ALL');
  const rows = useMemo(() => {
    if (!save) return [];
    const unlocks = save.profile.achievements ?? {};
    return ACHIEVEMENTS.map((def) => ({ def, at: unlocks[def.id] as number | undefined, progress: unlocks[def.id] ? null : achievementProgress(save, def) }));
  }, [save]);
  if (!save) return null;
  const done = rows.filter((r) => r.at).length;
  const shown = rows.filter((r) => (category === 'ALL' || r.def.category === category) && (status === 'ALL' || (status === 'UNLOCKED' ? !!r.at : !r.at)));
  // Unlocked first (newest first), then the closest to completion.
  shown.sort((a, b) => (b.at ?? 0) - (a.at ?? 0) || ratio(b.progress) - ratio(a.progress));

  return (
    <div className="screen achievements-screen">
      <ScreenHeader title={t('Achievements')} subtitle={t('Goals that pay out once. Rewards are granted the moment you unlock them.')} />
      <section className="panel ach-summary">
        <div className="ach-summary-main">
          <span className="ach-summary-count num">
            {done}
            <span className="faint"> / {rows.length}</span>
          </span>
          <div className="ach-summary-bar">
            <span className="muted">{t('{done} of {total} unlocked', { done, total: rows.length })}</span>
            <ProgressBar value={done} max={rows.length} gold label={t('Achievements')} />
          </div>
        </div>
        <ul className="ach-tier-counts">
          {TIERS.map((tier) => {
            const pool = rows.filter((r) => r.def.tier === tier);
            return (
              <li key={tier} className={`tier-${tier.toLowerCase()}`}>
                <span className="ach-tier-dot" aria-hidden />
                <span>{t(TIER_LABEL[tier])}</span>
                <span className="num">
                  {pool.filter((r) => r.at).length}/{pool.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="ach-filters">
        <div className="segmented ach-cats" role="group" aria-label={t('Achievements')}>
          <button aria-pressed={category === 'ALL'} onClick={() => setCategory('ALL')}>
            {t('All')}
          </button>
          {ACHIEVEMENT_CATEGORIES.map((c) => {
            const pool = rows.filter((r) => r.def.category === c.id);
            return (
              <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                <Glyph name={c.icon} size={14} />
                <span>{t(c.label)}</span>
                <span className="ach-cat-count num">
                  {pool.filter((r) => r.at).length}/{pool.length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="segmented" role="group" aria-label={t('Show:')}>
          {(['ALL', 'UNLOCKED', 'LOCKED'] as Status[]).map((s) => (
            <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === 'ALL' ? t('All') : s === 'UNLOCKED' ? t('Unlocked') : t('Locked')}
            </button>
          ))}
        </div>
      </div>

      <ul className="ach-grid">
        {shown.map(({ def, at, progress }) => (
          <li key={def.id} className={`panel ach-card tier-${def.tier.toLowerCase()} ${at ? 'is-unlocked' : 'is-locked'}`}>
            <AchievementBadge def={def} unlocked={!!at} />
            <div className="ach-body">
              <div className="ach-head">
                <h3 className="ach-name">{t(def.name)}</h3>
                <span className="ach-tier-label">{t(TIER_LABEL[def.tier])}</span>
              </div>
              <p className="ach-desc">{t(def.description)}</p>
              {progress && (
                <div className="ach-progress">
                  <ProgressBar value={progress.current} max={progress.target} label={t(def.name)} />
                  <span className="num faint">
                    {progress.current} / {progress.target}
                  </span>
                </div>
              )}
              <div className="ach-foot">
                <AchievementRewards def={def} />
                <span className={at ? 'ach-date' : 'ach-date faint'}>{at ? t('Unlocked {date}', { date: formatDate(at) }) : t('Not unlocked yet')}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ratio = (p: { current: number; target: number } | null) => (p && p.target > 0 ? p.current / p.target : 0);
