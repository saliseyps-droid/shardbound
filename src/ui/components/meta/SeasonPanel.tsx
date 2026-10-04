import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AI_TIERS, TIER_COLORS, aiTierOf, type AiRankedState } from '@/domain/aiRanked';
import { SEASON_REWARDS, SEASON_RESET_RANKS, daysLeftInSeason, seasonKeyOf } from '@/domain/season';
import { Essence, Gold } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { seasonName } from '@/ui/components/SocialHost';
import { aiRankLabel } from './aiRankedUi';
import { t, tn } from '@/i18n';
import '@/ui/styles/social.css';

/** Ranked vs AI: the current season, its end and the reward table. */
export function SeasonPanel({ ladder, now }: { ladder: AiRankedState; now: number }) {
  const key = seasonKeyOf(now);
  const days = daysLeftInSeason(now);
  const best = ladder.season === key ? (ladder.seasonBest ?? ladder.rank) : ladder.rank;
  const played = ladder.season === key && (ladder.seasonGames ?? 0) > 0;
  const bestTier = aiTierOf(best);
  return (
    <div className="air-season" aria-labelledby="air-season-title">
      <div className="air-season-head">
        <span className="air-kicker" id="air-season-title">
          {t('Season {name}', { name: seasonName(key) })} · {tn(days, '{n} day left', '{n} days left')}
        </span>
        <Link to="/leaderboard" className="small-link board-link">
          <Glyph name="trophy" size={14} /> {t('Leaderboard')}
        </Link>
      </div>
      <span className="faint">
        {played ? t('Best rank this season: {rank}', { rank: aiRankLabel(best) }) : t('Play a ranked match this season to earn a season reward.')}
      </span>
      <table className="air-season-table">
        <thead>
          <tr>
            <th>{t('Best rank')}</th>
            <th>{t('Season reward')}</th>
          </tr>
        </thead>
        <tbody>
          {AI_TIERS.map((tier) => {
            const r = SEASON_REWARDS[tier];
            return (
              <tr key={tier} className={played && tier === bestTier ? 'is-current' : ''}>
                <td style={{ color: TIER_COLORS[tier] } as CSSProperties}>{t(tier)}</td>
                <td>
                  <span className="reward-bits">
                    <Gold amount={r.gold} size={14} />
                    {r.packs > 0 && (
                      <span className="currency">
                        <PackIcon size={14} /> {r.packs}
                      </span>
                    )}
                    {r.essence > 0 && <Essence amount={r.essence} size={14} />}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <span className="faint">{t('When the month ends you get the reward for your best rank, then drop {n} ranks (Crown drops to Diamond III).', { n: SEASON_RESET_RANKS })}</span>
    </div>
  );
}
