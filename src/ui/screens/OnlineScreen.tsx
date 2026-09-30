import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { toast } from '@/state/uiStore';
import { netSession } from '@/net/session';
import { onlineOpponent, validateRemoteSide } from '@/net/lobby';
import { factionOfList } from '@/domain/decks';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

/** Host lobby: create a room, share the link, wait for the friend. */
export default function OnlineScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState(netSession.status);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => netSession.onStatus(() => setStatus(netSession.status)), []);

  // Friend connected: start the match as host.
  useEffect(() => {
    if (status !== 'connected' || netSession.role !== 'host' || !netSession.remoteSide) return;
    audio.play('turn');
    const faction = factionOfList(netSession.remoteSide.deck);
    launchMatch({ mode: 'ONLINE', online: 'host', deckId, opponent: onlineOpponent(netSession.remoteName, netSession.remoteAvatar, faction) }, navigate);
  }, [status, deckId, navigate]);

  // Leaving the lobby before a friend joins closes the room.
  useEffect(
    () => () => {
      if (netSession.role === 'host' && netSession.status === 'waiting') netSession.close();
    },
    [],
  );

  if (!save) return null;
  const valid = !!deckId && deckId === firstValidDeck(save, deckId);

  const create = async () => {
    setError(null);
    try {
      const c = await netSession.host(save.profile.username, save.profile.avatar, (hello) => validateRemoteSide(hello.side));
      setCode(c);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code ?? '');
      toast('Code copied', 'success');
    } catch {
      toast('Copy failed — write the code down instead.', 'error');
    }
  };

  const waiting = !!code && status === 'waiting';

  return (
    <div className="screen online-screen">
      <ScreenHeader title="Play a friend" subtitle="Create a match and send your friend the room code. The match starts as soon as they join." />
      <div className="online-grid">
        <section className="panel" aria-labelledby="online-deck">
          <div className="panel-title" id="online-deck">
            Your deck
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
        </section>

        <section className="panel online-host" aria-live="polite">
          {!waiting && (
            <>
              <div className="panel-title">Create a match</div>
              <p className="muted">Online matches give the same Gold, XP and quest progress as normal matches. Both players need an internet connection.</p>
              <button className="btn btn-primary btn-lg" disabled={!valid || status === 'opening'} onClick={() => void create()}>
                {status === 'opening' ? 'Creating…' : 'Create match'}
              </button>
              {!valid && <p className="deckbox-issue">Choose a valid 30-card deck first.</p>}
            </>
          )}
          {waiting && (
            <>
              <div className="panel-title">Waiting for your friend</div>
              <p className="muted">Send your friend this code — they enter it under “Have a code?”. Keep this screen open until they join.</p>
              <div className="invite-row">
                <strong className="room-code" aria-label={`Room code ${code}`}>{code}</strong>
                <button className="btn btn-cyan" onClick={() => void copy()}>
                  Copy code
                </button>
              </div>
              <Spinner label="Waiting for your friend" />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  netSession.close();
                  setCode(null);
                }}
              >
                Cancel
              </button>
            </>
          )}
          {error && <p className="online-error">{error}</p>}

          <hr className="divider" />
          <div className="panel-title">Have a code?</div>
          <form
            className="invite-row"
            onSubmit={(e) => {
              e.preventDefault();
              const c = joinCode.trim().toUpperCase();
              if (c.length >= 4) navigate(`/join/${c}`);
            }}
          >
            <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Room code" maxLength={8} aria-label="Room code" />
            <button className="btn" type="submit" disabled={joinCode.trim().length < 4}>
              Join
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
