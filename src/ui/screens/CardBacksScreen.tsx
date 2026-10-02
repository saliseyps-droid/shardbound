import { useNavigate } from 'react-router-dom';
import { CARD_BACKS } from '@/data/cardBacks';
import { useAccount } from '@/state/accountStore';
import { ScreenHeader } from '@/ui/components/common';
import { CardBackGrid } from '@/ui/components/CardBackGrid';
import { t } from '@/i18n';

/** The card backs the player owns; pick the one used in matches. */
export default function CardBacksScreen() {
  const navigate = useNavigate();
  const owned = useAccount((s) => s.save?.profile.cardBacks.length ?? 1);
  return (
    <div className="screen cardbacks-screen">
      <ScreenHeader
        title={t('Card Backs')}
        subtitle={t('You own {n} of {max}. Pick the back your deck and hand show in every match.', { n: owned, max: CARD_BACKS.length })}
        actions={
          <button className="btn btn-cyan" onClick={() => navigate('/shop')}>
            {t('Get more in the Shop')}
          </button>
        }
      />
      <section className="panel">
        <CardBackGrid mode="owned" />
      </section>
    </div>
  );
}
