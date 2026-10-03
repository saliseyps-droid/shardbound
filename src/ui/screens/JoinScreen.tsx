import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { netSession } from '@/net/session';
import { onlineOpponent } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { FACTIONS } from '@/data/factions';
import { t } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

/** Guest lobby: opened from an invite link (#/join/CODE). */
export default function JoinScreen() {
  const { code = '' } = useParams();
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!save) return null;
  const deck = save.decks.find((d) => d.id === deckId);
  const valid = !!deck && deckId === firstValidDeck(save, deckId);

  const join = async () => {
    if (!deck) return;
    setBusy(true);
    setError(null);
    try {
      await netSession.join(code, playerSide(save.profile, deck), deck.name);
      // Host faction isn't known yet; the board shows the real Warden once the state arrives.
      launchMatch({ mode: 'ONLINE', online: 'guest', deckId: deck.id, opponent: onlineOpponent(netSession.remoteName, netSession.remoteAvatar, 'EMBER') }, navigate);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="screen online-screen">
      <ScreenHeader title={t('Join a match')} subtitle={t('You were invited to room {code}. Pick your deck and join.', { code: code.toUpperCase() })} />
      <div className="online-grid">
        <section className="panel">
          <div className="panel-title">{t('Your deck')}</div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
        </section>
        <section className="panel online-host" aria-live="polite">
          <div className="panel-title">{t('Room {code}', { code: code.toUpperCase() })}</div>
          {deck && (
            <p className="muted">
              {t('You’ll play')} <strong style={{ color: FACTIONS[deck.heroFaction].colors.primary }}>{deck.name}</strong>. {t('Online matches give the same rewards and quest progress as normal matches.')}
            </p>
          )}
          <button className="btn btn-primary btn-lg" disabled={!valid || busy} onClick={() => void join()}>
            {busy ? t('Connecting…') : t('Join match')}
          </button>
          {busy && <Spinner label={t('Connecting')} />}
          {!valid && <p className="deckbox-issue">{t('Choose a valid 30-card deck first.')}</p>}
          {error && <p className="online-error">{t(error)}</p>}
          <Link to="/online" className="small-link">
            {t('Create your own match instead')}
          </Link>
        </section>
      </div>
    </div>
  );
}
