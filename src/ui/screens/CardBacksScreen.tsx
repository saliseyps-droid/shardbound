import { useNavigate } from 'react-router-dom';
import { CARD_BACKS } from '@/data/cardBacks';
import { useAccount } from '@/state/accountStore';
import { ScreenHeader } from '@/ui/components/common';
import { CardBackGrid } from '@/ui/components/CardBackGrid';
import { ARENA } from '@/config/arena';
import { Link } from 'react-router-dom';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { Glyph } from '@/ui/components/Icons';
import { PortraitPicker } from '@/ui/components/PortraitPicker';
import { factionStyle } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

/** Customization: the Warden portrait of each faction and the card back used in matches. */
export default function CardBacksScreen() {
  const navigate = useNavigate();
  const owned = useAccount((s) => s.save?.profile.cardBacks.length ?? 1);
  const p = useAccount((s) => s.save?.profile);
  if (!p) return null;
  return (
    <div className="screen cardbacks-screen">
      <ScreenHeader
        title={t('Customization')}
        subtitle={t('Your Warden portraits and card backs.')}
        actions={
          <button className="btn btn-cyan" onClick={() => navigate('/shop')}>
            {t('Get more in the Shop')}
          </button>
        }
      />
      <section className="panel profile-portraits" aria-labelledby="cz-portraits">
        <div className="panel-title" id="cz-portraits">
          <span>{t('Warden portraits')}</span>
          <Link to="/shop" className="small-link">
            {t('More in the Shop')}
          </Link>
        </div>
        <p className="faint">{t('The portrait every deck of that faction shows. A deck can still pick its own in the deck editor.')}</p>
        <div className="profile-portrait-grid">
        {PLAYABLE_FACTIONS.map((f) => (
          <div key={f} className="profile-portrait-row" style={factionStyle(f)}>
            <span className="profile-portrait-faction">
              <Glyph name={FACTIONS[f].sigil} size={14} /> {FACTIONS[f].name}
            </span>
            <PortraitPicker
              faction={f}
              owned={p.portraits}
              value={p.factionPortraits[f] ?? null}
              onChange={(v) => {
                const res = gameService.choosePortrait(f, v);
                if (!res.ok) toast(res.error, 'error');
              }}
            />
          </div>
        ))}
        </div>
      </section>
      <section className="panel" aria-labelledby="cz-backs">
        <div className="panel-title" id="cz-backs">
          {t('Card Backs')}
        </div>
        <p className="faint">{t('You own {n} of {max}. Pick the back your deck and hand show in every match.', { n: owned, max: CARD_BACKS.length })}</p>
        <CardBackGrid mode="owned" />
      </section>
      {owned < CARD_BACKS.length && (
        <section className="panel cardbacks-locked" aria-labelledby="cb-locked">
          <div className="panel-title" id="cb-locked">
            {t('Still to collect')}
          </div>
          <p className="muted">{t('Buy them with Gold in the Shop. An Arena run with {n} wins also brings a card back you don’t own yet.', { n: ARENA.rewards.findIndex((r) => r.cardBack) })}</p>
          <CardBackGrid mode="locked" />
        </section>
      )}
    </div>
  );
}
