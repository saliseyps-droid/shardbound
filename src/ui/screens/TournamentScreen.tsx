import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useTournament, myMatch } from '@/state/tournamentStore';
import { toast } from '@/state/uiStore';
import { DIFFICULTIES, type Difficulty } from '@/config/progression';
import { MATCH_LABEL, TOURNAMENT_CONFIG, playerById, placementOf, type Tournament, type TournamentMatch } from '@/domain/tournament';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

const DIFF_LABEL: Record<Difficulty, string> = { EASY: 'Easy', NORMAL: 'Normal', HARD: 'Hard', EXPERT: 'Expert' };

export default function TournamentScreen() {
  const save = useAccount((s) => s.save);
  const t = useTournament();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [joinCode, setJoinCode] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  if (!save) return null;
  const deck = save.decks.find((d) => d.id === deckId);
  const valid = !!deck && deckId === firstValidDeck(save, deckId);

  if (t.role === 'none') {
    return (
      <div className="screen online-screen">
        <ScreenHeader title="Tournament" subtitle={`Play a ${TOURNAMENT_CONFIG.size}-player knockout with 2–${TOURNAMENT_CONFIG.size} friends. Empty seats are filled with bots.`} />
        <div className="online-grid">
          <section className="panel">
            <div className="panel-title">Your deck</div>
            <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          </section>
          <section className="panel online-host" aria-live="polite">
            <div className="panel-title">Create a tournament</div>
            <p className="muted">You organise it: share the code, start when your friends are in. Keep this browser open until the tournament ends.</p>
            <div className="field">
              <span className="faint">Bot difficulty</span>
              <div className="segmented" role="group" aria-label="Bot difficulty">
                {DIFFICULTIES.map((d) => (
                  <button key={d} aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>
                    {DIFF_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" disabled={!valid || t.status === 'connecting'} onClick={() => deck && void t.create(deck, difficulty)}>
              {t.status === 'connecting' ? 'Creating…' : 'Create tournament'}
            </button>
            <hr className="divider" />
            <div className="panel-title">Join with a code</div>
            <form
              className="invite-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (deck && joinCode.trim().length >= 4) void t.join(joinCode.trim().toUpperCase(), deck);
              }}
            >
              <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Tournament code" maxLength={8} aria-label="Tournament code" />
              <button className="btn" type="submit" disabled={!valid || joinCode.trim().length < 4 || t.status === 'connecting'}>
                {t.status === 'connecting' ? 'Joining…' : 'Join'}
              </button>
            </form>
            {!valid && <p className="deckbox-issue">Choose a valid 30-card deck first.</p>}
            {t.error && <p className="online-error">{t.error}</p>}
            <p className="faint">Every match gives the usual Gold, XP and quest progress. Champion +{TOURNAMENT_CONFIG.prizes.champion} Gold, runner-up +{TOURNAMENT_CONFIG.prizes.runnerUp} Gold.</p>
          </section>
        </div>
      </div>
    );
  }

  const tour = t.tournament;
  return (
    <div className="screen online-screen">
      <ScreenHeader
        title="Tournament"
        subtitle={tour?.phase === 'lobby' ? 'Waiting for players.' : tour?.phase === 'done' ? 'The tournament is over.' : 'Knockout in progress.'}
        actions={
          <button className="btn btn-ghost" onClick={() => t.leave()}>
            {tour?.phase === 'done' ? 'Close' : 'Leave tournament'}
          </button>
        }
      />
      {!tour ? (
        <div className="panel">
          <Spinner label="Connecting" />
        </div>
      ) : tour.phase === 'lobby' ? (
        <Lobby tour={tour} />
      ) : (
        <Bracket tour={tour} />
      )}
    </div>
  );
}

function Lobby({ tour }: { tour: Tournament }) {
  const t = useTournament();
  const humans = tour.players.filter((p) => !p.bot);
  const seats = Array.from({ length: TOURNAMENT_CONFIG.size }, (_, i) => humans[i]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tour.code);
      toast('Code copied', 'success');
    } catch {
      toast('Copy failed — write the code down instead.', 'error');
    }
  };
  return (
    <div className="online-grid">
      <section className="panel">
        <div className="panel-title">Players</div>
        <ul className="t-seats">
          {seats.map((p, i) => (
            <li key={i} className={`t-seat ${p ? '' : 'empty'}`}>
              {p ? <WardenPortrait faction={p.faction} size={44} /> : <span className="t-seat-empty" aria-hidden />}
              <span>
                <strong>{p ? p.name : 'Open seat'}</strong>
                <span className="faint">{p ? (p.id === 'p0' ? 'Organizer' : p.id === t.myId ? 'You' : 'Player') : 'A bot takes this seat if nobody joins'}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel online-host" aria-live="polite">
        <div className="panel-title">Tournament code</div>
        <div className="invite-row">
          <strong className="room-code">{tour.code}</strong>
          <button className="btn btn-cyan" onClick={() => void copy()}>
            Copy code
          </button>
        </div>
        <p className="muted">Friends join from Play → Tournament → Join with a code.</p>
        {t.role === 'organizer' ? (
          <>
            <p className="faint">
              {humans.length} / {TOURNAMENT_CONFIG.size} players. Bots: {DIFF_LABEL[t.botDifficulty]}.
            </p>
            <button className="btn btn-primary btn-lg" disabled={humans.length < TOURNAMENT_CONFIG.minHumans} onClick={() => t.start()}>
              Start tournament
            </button>
            {humans.length < TOURNAMENT_CONFIG.minHumans && <p className="faint">At least {TOURNAMENT_CONFIG.minHumans} players are needed to start.</p>}
          </>
        ) : (
          <>
            <Spinner label="Waiting" />
            <p className="muted">Waiting for the organizer to start.</p>
          </>
        )}
      </section>
    </div>
  );
}

function PlayerLine({ tour, id, winner }: { tour: Tournament; id: string | null; winner: string | null }) {
  const p = playerById(tour, id);
  const me = useTournament((s) => s.myId);
  if (!p) return <div className="t-player tbd">To be decided</div>;
  return (
    <div className={`t-player ${winner === p.id ? 'won' : winner ? 'lost' : ''} ${p.id === me ? 'me' : ''}`}>
      <WardenPortrait faction={p.faction} size={34} />
      <span className="t-name">
        {p.name}
        {p.id === me && ' (you)'}
      </span>
      {!p.connected && <span className="faint">left</span>}
      {winner === p.id && <span className="t-win" aria-label="winner">✓</span>}
    </div>
  );
}

function MatchCard({ tour, m }: { tour: Tournament; m: TournamentMatch }) {
  return (
    <div className={`t-match panel-tight ${m.status}`}>
      <div className="t-match-head">
        <strong>{MATCH_LABEL[m.id]}</strong>
        <span className="faint">{m.status === 'done' ? 'Finished' : m.status === 'playing' ? 'In progress' : m.status === 'ready' ? 'Ready' : 'Waiting'}</span>
      </div>
      <PlayerLine tour={tour} id={m.a} winner={m.winner} />
      <PlayerLine tour={tour} id={m.b} winner={m.winner} />
    </div>
  );
}

function Bracket({ tour }: { tour: Tournament }) {
  const t = useTournament();
  const navigate = useNavigate();
  const mine = myMatch(tour, t.myId);
  const [countdown, setCountdown] = useState<number | null>(null);
  const place = t.myId ? placementOf(tour, t.myId) : null;

  // Auto-start my match after a short countdown.
  useEffect(() => {
    if (!mine || t.activeMatch || t.connectingMatch) return setCountdown(null);
    setCountdown(5);
    const timer = setInterval(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [mine?.id, t.activeMatch, t.connectingMatch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (countdown === 0) void t.playMyMatch(navigate);
  }, [countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  const sf = tour.matches.filter((m) => m.id !== 'F');
  const final = tour.matches.find((m) => m.id === 'F')!;
  const champion = playerById(tour, tour.championId);
  return (
    <>
      {tour.phase === 'done' && champion && (
        <section className="panel t-champion">
          <WardenPortrait faction={champion.faction} size={90} />
          <div>
            <h3>{champion.id === t.myId ? 'You are the champion!' : `${champion.name} wins the tournament`}</h3>
            <p className="muted">{place === 1 ? `+${TOURNAMENT_CONFIG.prizes.champion} Gold prize.` : place === 2 ? `Runner-up: +${TOURNAMENT_CONFIG.prizes.runnerUp} Gold prize.` : 'Better luck next time.'}</p>
          </div>
        </section>
      )}
      {mine && tour.phase === 'running' && (
        <section className="panel t-ready" aria-live="assertive">
          <strong>Your {MATCH_LABEL[mine.id].toLowerCase()} is ready.</strong>
          {t.connectingMatch ? (
            <span className="muted">Connecting to your opponent…</span>
          ) : t.activeMatch ? (
            <span className="muted">Match in progress.</span>
          ) : (
            <span className="muted">Starting in {countdown ?? 0}s</span>
          )}
          <button className="btn btn-primary" disabled={!!t.connectingMatch} onClick={() => void t.playMyMatch(navigate)}>
            Play now
          </button>
        </section>
      )}
      {!mine && tour.phase === 'running' && <p className="muted">Waiting for the other matches to finish…</p>}
      <div className="t-bracket">
        <div className="t-round">
          <span className="faint">Semi-finals</span>
          {sf.map((m) => (
            <MatchCard key={m.id} tour={tour} m={m} />
          ))}
        </div>
        <div className="t-round t-final">
          <span className="faint">Final</span>
          <MatchCard tour={tour} m={final} />
        </div>
      </div>
    </>
  );
}
