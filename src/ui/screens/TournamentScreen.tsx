import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { tournamentWatchCode } from '@/net/watchCode';
import { spectate } from '@/state/spectateLaunch';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useTournament, myMatch } from '@/state/tournamentStore';
import { toast } from '@/state/uiStore';
import { DIFFICULTIES, type Difficulty } from '@/config/progression';
import { TOURNAMENT_CONFIG, TOURNAMENT_PACK_SET, TOURNAMENT_SIZES, matchLabel, playerById, placementOf, roundDepths, roundLabel, roundMatches, sizeOf, tournamentPrizes, type PlacePrize, type Tournament, type TournamentMatch, type TournamentSize } from '@/domain/tournament';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { DeckPicker, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { TournamentInvites } from '@/ui/components/TournamentInvites';
import { SET_INFO } from '@/config/economy';
import { tr } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';

const DIFF_LABEL: Record<Difficulty, string> = { EASY: 'Easy', NORMAL: 'Normal', HARD: 'Hard', EXPERT: 'Expert' };

function prizeText(p: PlacePrize): string {
  return p.packs > 0 ? tr('{gold} Gold and {packs}× {set} pack', { gold: p.gold, packs: p.packs, set: SET_INFO[TOURNAMENT_PACK_SET].name }) : tr('{gold} Gold', { gold: p.gold });
}

function PrizeList({ size }: { size: TournamentSize }) {
  const p = tournamentPrizes(size);
  return (
    <ul className="t-prizes">
      <li>🥇 {prizeText(p.champion)}</li>
      <li>🥈 {prizeText(p.runnerUp)}</li>
      <li>🥉 {prizeText(p.third)}</li>
    </ul>
  );
}

export default function TournamentScreen() {
  const save = useAccount((s) => s.save);
  const t = useTournament();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [joinCode, setJoinCode] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [size, setSize] = useState<TournamentSize>(8);
  const [invitedTo, setInvitedTo] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const inviteCode = (params.get('join') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const handledInvite = useRef<string | null>(null);

  // Accepted a friend's tournament invite (/tournament?join=CODE): join with the selected deck
  // right away, or prefill the join form when no deck is valid yet.
  useEffect(() => {
    if (!inviteCode || !save || handledInvite.current === inviteCode) return;
    handledInvite.current = inviteCode;
    setParams(
      (p) => {
        p.delete('join');
        return p;
      },
      { replace: true },
    );
    const tour = useTournament.getState();
    if (tour.role !== 'none') {
      if (tour.code !== inviteCode) toast('Leave your current tournament first.', 'info');
      return;
    }
    const id = firstValidDeck(save, deckId);
    const chosen = id ? save.decks.find((d) => d.id === id) : undefined;
    if (chosen) {
      setDeckId(chosen.id);
      void tour.join(inviteCode, chosen);
    } else {
      setJoinCode(inviteCode);
      setInvitedTo(inviteCode);
    }
  }, [inviteCode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!save) return null;
  const deck = save.decks.find((d) => d.id === deckId);
  const valid = !!deck && deckId === firstValidDeck(save, deckId);

  if (t.role === 'none') {
    return (
      <div className="screen online-screen">
        <ScreenHeader title={tr('Tournament')} subtitle={tr('A knockout for 4 to 32 players. Empty seats are filled with bots.')} />
        <div className="online-grid">
          <section className="panel">
            <div className="panel-title">{tr('Your deck')}</div>
            <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          </section>
          <section className="panel online-host" aria-live="polite">
            <div className="panel-title">{tr('Create a tournament')}</div>
            <p className="muted">{tr('You organise it: share the code, start when your friends are in. Keep this browser open until the tournament ends.')}</p>
            <div className="field">
              <span className="faint">{tr('Players')}</span>
              <div className="segmented" role="group" aria-label={tr('Players')}>
                {TOURNAMENT_SIZES.map((n) => (
                  <button key={n} aria-pressed={size === n} onClick={() => setSize(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="faint">{tr('Prizes')}</span>
              <PrizeList size={size} />
            </div>
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
            <button className="btn btn-primary btn-lg" disabled={!valid || t.status === 'connecting'} onClick={() => deck && void t.create(deck, difficulty, size)}>
              {t.status === 'connecting' ? tr('Creating…') : tr('Create tournament')}
            </button>
            <hr className="divider" />
            <div className="panel-title">{tr('Join with a code')}</div>
            {invitedTo && !valid && <p className="online-warning">{tr('You were invited to tournament {code}. Choose a valid deck, then join.', { code: invitedTo })}</p>}
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
            <p className="faint">{tr('Every match also gives the usual Gold, XP and quest progress. Bigger tournaments pay bigger prizes.')}</p>
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

/** Every seat of the lobby: roomy rows for 4 and 8 players, a compact grid of tiles for 16 and 32. */
export function SeatList({ tour, myId }: { tour: Tournament; myId: string | null }) {
  const humans = tour.players.filter((p) => !p.bot);
  const size = sizeOf(tour);
  const compact = size > 8;
  const seats = Array.from({ length: size }, (_, i) => humans[i]);
  return (
    <ul className={`t-seats${compact ? ' compact' : ''}`}>
      {seats.map((p, i) => (
        <li key={p?.id ?? `open-${i}`} className={`t-seat ${p ? '' : 'empty'}`}>
          {p ? <WardenPortrait faction={p.faction} portrait={p.side?.portrait} size={compact ? 26 : 44} /> : <span className="t-seat-empty" aria-hidden />}
          <span>
            <strong>{p ? p.name : tr('Open seat')}</strong>
            <span className="faint">{p ? (p.id === 'p0' ? tr('Organizer') : p.id === myId ? tr('You') : tr('Player')) : compact ? tr('Bot if nobody joins') : tr('A bot takes this seat if nobody joins')}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Lobby({ tour }: { tour: Tournament }) {
  const t = useTournament();
  const humans = tour.players.filter((p) => !p.bot);
  const size = sizeOf(tour);
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
        <div className="panel-title">
          {tr('Players')} <span className="faint num">{humans.length} / {size}</span>
        </div>
        <SeatList tour={tour} myId={t.myId} />
        {size > 8 && <p className="faint">{tr('{n} open seats. Bots take the seats nobody joins.', { n: size - humans.length })}</p>}
        <div className="faint" style={{ marginTop: 'var(--space-3)' }}>{tr('Prizes')}</div>
        <PrizeList size={size} />
      </section>
      <div className="t-lobby-side">
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
                {tr('{n} / {size} players. Bots: {difficulty}.', { n: humans.length, size, difficulty: tr(DIFF_LABEL[t.botDifficulty]) })}
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
        {t.role === 'organizer' && <TournamentInvites tour={tour} />}
      </div>
    </div>
  );
}

function PlayerLine({ tour, id, winner }: { tour: Tournament; id: string | null; winner: string | null }) {
  const p = playerById(tour, id);
  const me = useTournament((s) => s.myId);
  if (!p) return <div className="t-player tbd">{tr('To be decided')}</div>;
  return (
    <div className={`t-player ${winner === p.id ? 'won' : winner ? 'lost' : ''} ${p.id === me ? 'me' : ''}`}>
      <WardenPortrait faction={p.faction} portrait={p.side?.portrait} size={34} />
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
  const me = useTournament((s) => s.myId);
  const navigate = useNavigate();
  // Every match with a player in it can be watched (bot against bot is only simulated).
  const watchable = m.status === 'playing' && m.a !== me && m.b !== me && [m.a, m.b].some((id) => playerById(tour, id) && !playerById(tour, id)!.bot);
  return (
    <div className={`t-match panel-tight ${m.status}`}>
      <div className="t-match-head">
        <strong>{tr(matchLabel(m.id))}</strong>
        <span className="faint">{m.status === 'done' ? tr('Finished') : m.status === 'playing' ? tr('In progress') : m.status === 'ready' ? tr('Ready') : tr('Waiting')}</span>
      </div>
      <PlayerLine tour={tour} id={m.a} winner={m.winner} />
      <PlayerLine tour={tour} id={m.b} winner={m.winner} />
      {watchable && (
        <button className="btn btn-sm btn-cyan t-watch" onClick={() => spectate(tournamentWatchCode(tour.code, m.id), navigate)}>
          {tr('Watch')}
        </button>
      )}
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

  const third = tour.matches.find((m) => m.id === 'P3');
  const champion = playerById(tour, tour.championId);
  const prizes = tournamentPrizes(sizeOf(tour));
  return (
    <>
      {tour.phase === 'done' && champion && (
        <section className="panel t-champion">
          <WardenPortrait faction={champion.faction} portrait={champion.side?.portrait} size={90} />
          <div>
            <h3>{champion.id === t.myId ? tr('You are the champion!') : tr('{name} wins the tournament', { name: champion.name })}</h3>
            <p className="muted">{place === 1 ? tr('Prize: {prize}.', { prize: prizeText(prizes.champion) }) : place === 2 ? tr('Runner-up prize: {prize}.', { prize: prizeText(prizes.runnerUp) }) : place === 3 ? tr('Third place prize: {prize}.', { prize: prizeText(prizes.third) }) : tr('Better luck next time.')}</p>
          </div>
        </section>
      )}
      {mine && tour.phase === 'running' && (
        <section className="panel t-ready" aria-live="assertive">
          <strong>{tr('Your match is ready: {label}.', { label: tr(matchLabel(mine.id)) })}</strong>
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
      <div className="t-bracket" style={{ '--t-rounds': roundDepths(tour).length } as CSSProperties}>
        {roundDepths(tour)
          .filter((d) => d > 0)
          .map((d) => (
            <div key={d} className="t-round">
              <span className="faint t-round-label">{tr(roundLabel(d))}</span>
              <div className="t-round-body">
                {roundMatches(tour, d).map((m) => (
                  <MatchCard key={m.id} tour={tour} m={m} />
                ))}
              </div>
            </div>
          ))}
        <div className="t-round t-final">
          <span className="faint t-round-label">{tr('Final')}</span>
          <div className="t-round-body">
          {roundMatches(tour, 0).map((m) => (
            <MatchCard key={m.id} tour={tour} m={m} />
          ))}
          {third && (
            <>
              <span className="faint">{tr('Third place')}</span>
              <MatchCard tour={tour} m={third} />
            </>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
