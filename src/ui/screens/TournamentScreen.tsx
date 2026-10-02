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
import { tr } from '@/i18n';
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
        <ScreenHeader title={tr('Tournament')} subtitle={tr('Play a {size}-player knockout with 2–{size} friends. Empty seats are filled with bots.', { size: TOURNAMENT_CONFIG.size })} />
        <div className="online-grid">
          <section className="panel">
            <div className="panel-title">{tr('Your deck')}</div>
            <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          </section>
          <section className="panel online-host" aria-live="polite">
            <div className="panel-title">{tr('Create a tournament')}</div>
            <p className="muted">{tr('You organise it: share the code, start when your friends are in. Keep this browser open until the tournament ends.')}</p>
            <div className="field">
              <span className="faint">{tr('Bot difficulty')}</span>
              <div className="segmented" role="group" aria-label={tr('Bot difficulty')}>
                {DIFFICULTIES.map((d) => (
                  <button key={d} aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>
                    {tr(DIFF_LABEL[d])}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg" disabled={!valid || t.status === 'connecting'} onClick={() => deck && void t.create(deck, difficulty)}>
              {t.status === 'connecting' ? tr('Creating…') : tr('Create tournament')}
            </button>
            <hr className="divider" />
            <div className="panel-title">{tr('Join with a code')}</div>
            <form
              className="invite-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (deck && joinCode.trim().length >= 4) void t.join(joinCode.trim().toUpperCase(), deck);
              }}
            >
              <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={tr('Tournament code')} maxLength={8} aria-label={tr('Tournament code')} />
              <button className="btn" type="submit" disabled={!valid || joinCode.trim().length < 4 || t.status === 'connecting'}>
                {t.status === 'connecting' ? tr('Joining…') : tr('Join')}
              </button>
            </form>
            {!valid && <p className="deckbox-issue">{tr('Choose a valid 30-card deck first.')}</p>}
            {t.error && <p className="online-error">{tr(t.error)}</p>}
            <p className="faint">{tr('Every match gives the usual Gold, XP and quest progress. Champion +{champion} Gold, runner-up +{runnerUp} Gold.', { champion: TOURNAMENT_CONFIG.prizes.champion, runnerUp: TOURNAMENT_CONFIG.prizes.runnerUp })}</p>
          </section>
        </div>
      </div>
    );
  }

  const tour = t.tournament;
  return (
    <div className="screen online-screen">
      <ScreenHeader
        title={tr('Tournament')}
        subtitle={tour?.phase === 'lobby' ? tr('Waiting for players.') : tour?.phase === 'done' ? tr('The tournament is over.') : tr('Knockout in progress.')}
        actions={
          <button className="btn btn-ghost" onClick={() => t.leave()}>
            {tour?.phase === 'done' ? tr('Close') : tr('Leave tournament')}
          </button>
        }
      />
      {!tour ? (
        <div className="panel">
          <Spinner label={tr('Connecting')} />
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
        <div className="panel-title">{tr('Players')}</div>
        <ul className="t-seats">
          {seats.map((p, i) => (
            <li key={i} className={`t-seat ${p ? '' : 'empty'}`}>
              {p ? <WardenPortrait faction={p.faction} size={44} /> : <span className="t-seat-empty" aria-hidden />}
              <span>
                <strong>{p ? p.name : tr('Open seat')}</strong>
                <span className="faint">{p ? (p.id === 'p0' ? tr('Organizer') : p.id === t.myId ? tr('You') : tr('Player')) : tr('A bot takes this seat if nobody joins')}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel online-host" aria-live="polite">
        <div className="panel-title">{tr('Tournament code')}</div>
        <div className="invite-row">
          <strong className="room-code">{tour.code}</strong>
          <button className="btn btn-cyan" onClick={() => void copy()}>
            {tr('Copy code')}
          </button>
        </div>
        <p className="muted">{tr('Friends join from Play → Tournament → Join with a code.')}</p>
        {t.role === 'organizer' ? (
          <>
            <p className="faint">
              {tr('{n} / {size} players. Bots: {difficulty}.', { n: humans.length, size: TOURNAMENT_CONFIG.size, difficulty: tr(DIFF_LABEL[t.botDifficulty]) })}
            </p>
            <button className="btn btn-primary btn-lg" disabled={humans.length < TOURNAMENT_CONFIG.minHumans} onClick={() => t.start()}>
              {tr('Start tournament')}
            </button>
            {humans.length < TOURNAMENT_CONFIG.minHumans && <p className="faint">{tr('At least {n} players are needed to start.', { n: TOURNAMENT_CONFIG.minHumans })}</p>}
          </>
        ) : (
          <>
            <Spinner label={tr('Waiting')} />
            <p className="muted">{tr('Waiting for the organizer to start.')}</p>
          </>
        )}
      </section>
    </div>
  );
}

function PlayerLine({ tour, id, winner }: { tour: Tournament; id: string | null; winner: string | null }) {
  const p = playerById(tour, id);
  const me = useTournament((s) => s.myId);
  if (!p) return <div className="t-player tbd">{tr('To be decided')}</div>;
  return (
    <div className={`t-player ${winner === p.id ? 'won' : winner ? 'lost' : ''} ${p.id === me ? 'me' : ''}`}>
      <WardenPortrait faction={p.faction} size={34} />
      <span className="t-name">
        {p.name}
        {p.id === me && ` ${tr('(you)')}`}
      </span>
      {!p.connected && <span className="faint">{tr('left')}</span>}
      {winner === p.id && <span className="t-win" aria-label={tr('winner')}>✓</span>}
    </div>
  );
}

function MatchCard({ tour, m }: { tour: Tournament; m: TournamentMatch }) {
  return (
    <div className={`t-match panel-tight ${m.status}`}>
      <div className="t-match-head">
        <strong>{tr(MATCH_LABEL[m.id])}</strong>
        <span className="faint">{m.status === 'done' ? tr('Finished') : m.status === 'playing' ? tr('In progress') : m.status === 'ready' ? tr('Ready') : tr('Waiting')}</span>
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
            <h3>{champion.id === t.myId ? tr('You are the champion!') : tr('{name} wins the tournament', { name: champion.name })}</h3>
            <p className="muted">{place === 1 ? tr('+{n} Gold prize.', { n: TOURNAMENT_CONFIG.prizes.champion }) : place === 2 ? tr('Runner-up: +{n} Gold prize.', { n: TOURNAMENT_CONFIG.prizes.runnerUp }) : tr('Better luck next time.')}</p>
          </div>
        </section>
      )}
      {mine && tour.phase === 'running' && (
        <section className="panel t-ready" aria-live="assertive">
          <strong>{tr(`Your ${MATCH_LABEL[mine.id].toLowerCase()} is ready.`)}</strong>
          {t.connectingMatch ? (
            <span className="muted">{tr('Connecting to your opponent…')}</span>
          ) : t.activeMatch ? (
            <span className="muted">{tr('Match in progress.')}</span>
          ) : (
            <span className="muted">{tr('Starting in {n}s', { n: countdown ?? 0 })}</span>
          )}
          <button className="btn btn-primary" disabled={!!t.connectingMatch} onClick={() => void t.playMyMatch(navigate)}>
            {tr('Play now')}
          </button>
        </section>
      )}
      {!mine && tour.phase === 'running' && <p className="muted">{tr('Waiting for the other matches to finish…')}</p>}
      <div className="t-bracket">
        <div className="t-round">
          <span className="faint">{tr('Semi-finals')}</span>
          {sf.map((m) => (
            <MatchCard key={m.id} tour={tour} m={m} />
          ))}
        </div>
        <div className="t-round t-final">
          <span className="faint">{tr('Final')}</span>
          <MatchCard tour={tour} m={final} />
        </div>
      </div>
    </>
  );
}
