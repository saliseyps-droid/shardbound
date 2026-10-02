import { useNavigate } from 'react-router-dom';
import { CARD_BACKS } from '@/data/cardBacks';
import { useAccount } from '@/state/accountStore';
import { ScreenHeader } from '@/ui/components/common';
import { CardBackGrid } from '@/ui/components/CardBackGrid';

/** The card backs the player owns; pick the one used in matches. */
export default function CardBacksScreen() {
  const navigate = useNavigate();
  const owned = useAccount((s) => s.save?.profile.cardBacks.length ?? 1);
  return (
    <div className="screen cardbacks-screen">
      <ScreenHeader
        title="Card Backs"
        subtitle={`You own ${owned} of ${CARD_BACKS.length}. Pick the back your deck and hand show in every match.`}
        actions={
          <button className="btn btn-cyan" onClick={() => navigate('/shop')}>
            Get more in the Shop
          </button>
        }
      />
      <section className="panel">
        <CardBackGrid mode="owned" />
      </section>
    </div>
  );
}
