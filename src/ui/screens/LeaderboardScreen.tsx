import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useCloud } from '@/state/cloudStore';
import { socialBackend, useSocial } from '@/state/socialStore';
import { daysLeftInSeason, seasonKeyOf } from '@/domain/season';
import { TIER_COLORS, aiTierOf, CROWN_RANK } from '@/domain/aiRanked';
import { tierFor } from '@/domain/ranked';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { LEADERBOARD_SIZE, locateMe, sortEntries, sortValue, buildLeaderboardEntries, type Board, type LeaderboardEntry, type MyPosition } from '@/social/leaderboard';
import { ScreenHeader, Spinner } from '@/ui/components/common';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { aiRankLabel } from '@/ui/components/meta/aiRankedUi';
import { seasonName } from '@/ui/components/SocialHost';
import { t, tn } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/social.css';

const asFaction = (v: string): PlayableFaction | null => ((PLAYABLE_FACTIONS as readonly string[]).includes(v) ? (v as PlayableFaction) : null);

interface BoardState {
  loading: boolean;
  error: string | null;
  entries: LeaderboardEntry[];
  me: MyPosition | null;
}

/** Season leaderboards: Ranked vs AI and PvP Ranked, top 100 of the current month. */
export default function LeaderboardScreen() {
  const [params, setParams] = useSearchParams();
  const board: Board = params.get('board') === 'ranked' ? 'ranked' : 'aiRanked';
  const save = useAccount((s) => s.save);
  const cloudConfigured = useCloud((s) => s.configured);
  const cloudUser = useCloud((s) => s.user);
  const socialUid = useSocial((s) => s.uid);
  const mode = useSocial((s) => s.mode);
  const uid = socialUid ?? cloudUser?.uid ?? null;
  const [now] = useState(() => Date.now());
  const season = seasonKeyOf(now);
  const [state, setState] = useState<BoardState>({ loading: true, error: null, entries: [], me: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    void (async () => {
      try {
        const backend = await socialBackend();
        if (!backend) throw new Error('off');
        const entries = sortEntries(board, await backend.topEntries(season, board, LEADERBOARD_SIZE));
        let me: MyPosition | null = null;
        if (uid) {
          if (entries.some((e) => e.uid === uid)) me = locateMe(entries, uid, null);
          else {
            const mine = (await backend.getEntry(season, board, uid)) ?? null;
            me = mine ? locateMe(entries, uid, await backend.countAhead(season, board, sortValue(board, mine))) : null;
          }
        }
        if (!cancelled) setState({ loading: false, error: null, entries, me });
      } catch (e) {
        console.warn('[leaderboard] load failed', e);
        if (!cancelled) setState({ loading: false, error: 'Could not load the leaderboard. Check your connection and try again.', entries: [], me: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [board, season, uid, reload, mode]);

  if (!save) return null;
  const days = daysLeftInSeason(now);
  const playedThisSeason = !!buildLeaderboardEntries(save, now)[board];

  const tab = (b: Board, label: string) => (
    <button type="button" role="tab" aria-selected={board === b} className={`lb-tab ${board === b ? 'is-active' : ''}`} onClick={() => setParams(b === 'ranked' ? { board: 'ranked' } : {}, { replace: true })}>
      {label}
    </button>
  );

  return (
    <div className="screen lb-screen">
      <ScreenHeader
        title={t('Leaderboard')}
        subtitle={
          <>
            {t('Season {name}', { name: seasonName(season) })} · {tn(days, '{n} day left', '{n} days left')}
          </>
        }
        actions={
          <button className="btn btn-sm btn-ghost" onClick={() => setReload((n) => n + 1)} disabled={state.loading}>
            {t('Refresh')}
          </button>
        }
      />

      <div className="lb-tabs" role="tablist" aria-label={t('Leaderboard')}>
        {tab('aiRanked', t('Ranked vs AI'))}
        {tab('ranked', t('Ranked'))}
      </div>

      {!uid && cloudConfigured && (
        <div className="panel lb-signin">
          <span>{t('Sign in to a cloud account to appear on the leaderboard.')}</span>
          <Link to="/settings" className="btn btn-sm btn-primary">
            {t('Sign in')}
          </Link>
        </div>
      )}

      {uid && state.me && (
        <div className="panel lb-me">
          {state.me.kind === 'listed' && <span>{t('You are #{n} this season.', { n: state.me.position })}</span>}
          {state.me.kind === 'outside' && <span>{t('You are #{n} this season (outside the top 100).', { n: state.me.position })}</span>}
          {state.me.kind === 'unknown' && <span>{t('You are not in the top 100 yet.')}</span>}
        </div>
      )}
      {uid && !state.loading && !state.error && !state.me && (
        <div className="panel lb-me faint">{playedThisSeason ? t('Your result is being uploaded. Refresh in a moment.') : t('Play a match this season to appear on this board.')}</div>
      )}

      <section className="panel lb-board" aria-busy={state.loading}>
        {state.loading && <Spinner label={t('Loading')} />}
        {!state.loading && state.error && <p className="online-error">{t(state.error)}</p>}
        {!state.loading && !state.error && state.entries.length === 0 && <p className="muted">{t('Nobody is on this board yet this season. Be the first!')}</p>}
        {!state.loading && !state.error && state.entries.length > 0 && (
          <ol className="lb-list">
            <li className="lb-row lb-head" aria-hidden>
              <span>#</span>
              <span>{t('Player')}</span>
              <span className="lb-num">{board === 'ranked' ? t('Rating') : t('Rank')}</span>
              <span className="lb-num lb-wins">{t('Wins')}</span>
            </li>
            {state.entries.map((e, i) => {
              const mine = e.uid === uid;
              const color = board === 'ranked' ? tierFor(e.rating ?? 0).color : TIER_COLORS[aiTierOf(e.rank ?? 0)];
              return (
                <li key={e.uid} className={`lb-row ${mine ? 'is-me' : ''} ${i < 3 ? `is-top top-${i + 1}` : ''}`} style={{ '--tc': color } as CSSProperties} aria-current={mine ? 'true' : undefined}>
                  <span className="lb-pos num">{i + 1}</span>
                  <span className="lb-player">
                    <WardenPortrait faction={asFaction(e.avatar)} portrait={e.portrait || null} size={32} fallbackGlyph="person" />
                    <span className="lb-name">
                      {e.name}
                      {mine && <span className="chip lb-you">{t('You')}</span>}
                    </span>
                  </span>
                  <span className="lb-num lb-value">
                    {board === 'ranked' ? (
                      <>
                        <span className="faint lb-tier">{t(tierFor(e.rating ?? 0).name)}</span> <span className="num">{e.rating}</span>
                      </>
                    ) : (
                      <>
                        {aiRankLabel(e.rank ?? 0)}
                        {(e.rank ?? 0) >= CROWN_RANK && <span className="faint num"> · {t('{n} Crown points', { n: e.crownPoints ?? 0 })}</span>}
                      </>
                    )}
                  </span>
                  <span className="lb-num lb-wins num">{e.wins}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
      <p className="faint lb-note">{t('Seasons last one calendar month (UTC). Results upload automatically after every ranked match while you are signed in.')}</p>
    </div>
  );
}
