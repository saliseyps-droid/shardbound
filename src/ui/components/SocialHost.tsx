import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount, gameService } from '@/state/accountStore';
import { useCloud } from '@/state/cloudStore';
import { SET_INFO } from '@/config/economy';
import { formatDate, t } from '@/i18n';
import { seasonBounds } from '@/domain/season';
import { Essence, Gold, Modal } from './common';
import { PackIcon } from './Icons';
import { aiRankLabel } from './meta/aiRankedUi';

/** Loaded only while signed in (or in the dev preview): friends, presence and match invites. */
const SocialLayer = lazy(() => import('./SocialLayer'));

/** Dev-only preview of the signed-in social screens with fake data: open the app with ?devsocial. */
const DEV_SOCIAL = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('devsocial');

/** "October 2026" in the app language. */
export function seasonName(key: string): string {
  return formatDate(seasonBounds(key).start, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** The end-of-season reward, shown once on the next visit after a season ends. */
function SeasonRewardDialog() {
  const grant = useAccount((s) => s.save?.profile.aiRanked?.pendingSeasonReward);
  const status = useAccount((s) => s.status);
  const location = useLocation();
  if (!grant || status !== 'READY' || location.pathname.startsWith('/match')) return null;
  const close = () => gameService.acknowledgeSeasonReward();
  return (
    <Modal open onClose={close} title={t('The {season} season has ended', { season: seasonName(grant.season) })}>
      <p className="muted">{t('Your best rank in Ranked vs AI: {rank}. Your season reward:', { rank: aiRankLabel(grant.bestRank) })}</p>
      <div className="reward-bits season-reward-bits">
        <Gold amount={grant.gold} size={18} />
        {grant.essence > 0 && <Essence amount={grant.essence} size={18} />}
        {grant.packs > 0 && (
          <span className="currency">
            <PackIcon size={18} /> {grant.packs} {SET_INFO[grant.setId].name}
          </span>
        )}
      </div>
      <p className="faint">{t('A new season has begun: your rank dropped a little, so the climb starts again.')}</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={close}>
          {t('Collect')}
        </button>
      </div>
    </Modal>
  );
}

export function SocialHost() {
  const user = useCloud((s) => s.user);
  const status = useAccount((s) => s.status);
  return (
    <>
      <SeasonRewardDialog />
      {status === 'READY' && (user || DEV_SOCIAL) && (
        <Suspense fallback={null}>
          <SocialLayer uid={user?.uid ?? null} dev={!user && DEV_SOCIAL} />
        </Suspense>
      )}
    </>
  );
}
