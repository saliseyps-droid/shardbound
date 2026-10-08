import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { FACTIONS } from '@/data/factions';
import { ScreenHeader } from '@/ui/components/common';
import { GoldIcon } from '@/ui/components/Icons';
import { DIFFICULTY_INFO } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';
import { formatDateTime, t, tn } from '@/i18n';

type Filter = 'ALL' | 'WIN' | 'LOSS' | 'DRAW';
const MODE_LABEL = { PRACTICE: 'Practice', PVE: 'Campaign', TUTORIAL: 'Tutorial', PVP: 'Online', RANKED: 'Ranked', TOURNAMENT: 'Tournament', ARENA: 'Arena', AI_RANKED: 'Ranked vs AI', BRAWL: 'Brawl', DUNGEON: 'Dungeon' } as const;

function duration(ms: number) {
  if (!ms || ms < 0) return '—';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function MatchHistoryScreen() {
  const history = useAccount((s) => s.save?.matchHistory ?? []);
  const [filter, setFilter] = useState<Filter>('ALL');
  const rows = history.filter((m) => filter === 'ALL' || m.result === filter);
  const wins = history.filter((m) => m.result === 'WIN').length;
  return (
    <div className="screen history-screen">
      <ScreenHeader
        title={t('Match history')}
        subtitle={history.length ? tn(history.length, 'Last {n} match, {wins} won.', 'Last {n} matches, {wins} won.', { wins }) : undefined}
        actions={
          <div className="segmented" role="group" aria-label={t('Filter by result')}>
            {(['ALL', 'WIN', 'LOSS', 'DRAW'] as Filter[]).map((f) => (
              <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === 'ALL' ? t('All') : f === 'WIN' ? t('Victories') : f === 'LOSS' ? t('Defeats') : t('Draws')}
              </button>
            ))}
          </div>
        }
      />
      {history.length === 0 ? (
        <div className="panel empty">
          <p>{t('No matches yet. Your battles will be recorded here.')}</p>
          <Link to="/play" className="btn btn-primary">
            {t('Play a match')}
          </Link>
        </div>
      ) : (
        <div className="panel history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">{t('Result')}</th>
                <th scope="col">{t('Date')}</th>
                <th scope="col">{t('Opponent')}</th>
                <th scope="col">{t('Mode')}</th>
                <th scope="col">{t('Your deck')}</th>
                <th scope="col" className="r">{t('Turns')}</th>
                <th scope="col" className="r">{t('Duration')}</th>
                <th scope="col" className="r">{t('Damage')}</th>
                <th scope="col" className="r">{t('Cards')}</th>
                <th scope="col" className="r">{t('Rewards')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className={`result-tag ${m.result.toLowerCase()}`}>
                      {m.result === 'WIN' ? `▲ ${t('Victory')}` : m.result === 'LOSS' ? `▼ ${t('Defeat')}` : `■ ${t('Draw')}`}
                    </span>
                    {m.conceded && <span className="faint"> {t('(conceded)')}</span>}
                  </td>
                  <td className="faint">{formatDateTime(m.date)}</td>
                  <td>
                    {m.opponentName} <span className="faint">{DIFFICULTY_INFO[m.difficulty] && t(DIFFICULTY_INFO[m.difficulty].label)}</span>
                  </td>
                  <td>{t(MODE_LABEL[m.mode])}</td>
                  <td>
                    <span style={{ color: FACTIONS[m.deckFaction]?.colors.primary }}>{m.deckName}</span>
                  </td>
                  <td className="r num">{m.turns}</td>
                  <td className="r num">{duration(m.durationMs)}</td>
                  <td className="r num">{m.damageDealt}</td>
                  <td className="r num">{m.cardsPlayed}</td>
                  <td className="r num">
                    <span className="currency">
                      <GoldIcon size={14} />
                      {m.goldEarned}
                    </span>{' '}
                    <span className="faint">+{m.xpEarned} XP</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty">{t('No matches with this result.')}</p>}
        </div>
      )}
    </div>
  );
}
