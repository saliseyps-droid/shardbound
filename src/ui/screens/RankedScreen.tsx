import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { netSession } from '@/net/session';
import { findRankedMatch, MatchmakingCancelled } from '@/net/matchmaking';
import { onlineOpponent } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import { factionOfList } from '@/domain/decks';
import { sanitizeRating, TIERS, tierFor } from '@/domain/ranked';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { ProgressBar, ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import { tr } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

/** Ranked ladder: find a random opponent who is also searching. */
export default function RankedScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!searching) return;
    const t0 = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(timer);
  }, [searching]);

  // Leaving the screen stops the search.
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  if (!save) return null;
  const r = save.profile.ranked;
  const tier = tierFor(r.rating);
  const next = TIERS.find((t) => t.min > r.rating);
  const deck = save.decks.find((d) => d.id === deckId);
  const valid = !!deck && deckId === firstValidDeck(save, deckId);

  const search = async () => {
    if (!deck || searching) return;
    cancelled.current = false;
    setError(null);
    setSearching(true);
    try {
      const role = await findRankedMatch({
        name: save.profile.username,
        avatar: save.profile.avatar,
        side: playerSide(save.profile, deck),
        deckName: deck.name,
        rating: r.rating,
        onStatus: setStatus,
        isCancelled: () => cancelled.current,
      });
      audio.play('turn');
      const theirRating = sanitizeRating(netSession.remoteMeta.rating);
      const metaFaction = netSession.remoteMeta.faction;
      const faction: PlayableFaction =
        role === 'host' && netSession.remoteSide ? factionOfList(netSession.remoteSide.deck) : (PLAYABLE_FACTIONS as readonly unknown[]).includes(metaFaction) ? (metaFaction as PlayableFaction) : 'EMBER';
      launchMatch(
        { mode: 'RANKED', online: role, deckId: deck.id, opponent: onlineOpponent(netSession.remoteName, netSession.remoteAvatar, faction), opponentRating: theirRating },
        navigate,
      );
    } catch (e) {
      if (!(e instanceof MatchmakingCancelled)) setError((e as Error).message);
      setSearching(false);
    }
  };

  const cancel = () => {
    cancelled.current = true;
    setStatus('Cancelling…');
  };

  return (
    <div className="screen online-screen">
      <ScreenHeader title={tr('Ranked')} subtitle={tr('Get matched against a random Warden who is searching right now. Wins raise your rating; losses lower it.')} />
      <div className="online-grid">
        <section className="panel" aria-labelledby="ranked-deck">
          <div className="panel-title" id="ranked-deck">
            {tr('Your deck')}
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
        </section>
        <section className="panel online-host" aria-live="polite">
          <div className="ranked-tier" style={{ color: tier.color }}>
            <span className="ranked-tier-name">{tr(tier.name)}</span>
            <span className="ranked-rating num">{r.rating}</span>
          </div>
          {next && (
            <div className="ranked-next">
              <ProgressBar value={r.rating - tier.min} max={next.min - tier.min} gold label={tr('Progress to {tier}', { tier: tr(next.name) })} />
              <span className="faint num">
                {next.min - r.rating} {tr('to {tier}', { tier: tr(next.name) })}
              </span>
            </div>
          )}
          <p className="muted num">
            {tr('{wins} wins, {losses} losses, peak {peak}', { wins: r.wins, losses: r.losses, peak: r.peak })}
          </p>
          {!searching ? (
            <button className="btn btn-primary btn-lg" disabled={!valid} onClick={() => void search()}>
              {tr('Find match')}
            </button>
          ) : (
            <>
              <Spinner label={tr('Searching')} />
              <p className="muted">
                {tr(status)} <span className="num">{elapsed}s</span>
              </p>
              <p className="faint">{tr('An opponent appears as soon as another player searches at the same time.')}</p>
              <button className="btn btn-ghost btn-sm" onClick={cancel}>
                {tr('Cancel search')}
              </button>
            </>
          )}
          {!valid && <p className="deckbox-issue">{tr('Choose a valid 30-card deck first.')}</p>}
          {error && <p className="online-error">{tr(error)}</p>}
          <p className="faint">{tr('Ranked matches give the usual Gold, XP and quest progress too.')}</p>
        </section>
      </div>
    </div>
  );
}
