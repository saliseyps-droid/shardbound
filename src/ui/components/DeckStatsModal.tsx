import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { games, playedModes, rankedCards, statsFor, winRate, type DeckMode, type Tally } from '@/domain/deckStats';
import type { Deck } from '@/domain/decks';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { useAccount } from '@/state/accountStore';
import { useUi } from '@/state/uiStore';
import { Modal } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { formatDate, t } from '@/i18n';

export const DECK_MODE_LABEL: Record<DeckMode, string> = {
  PRACTICE: 'Practice vs AI',
  PVE: 'Campaign',
  AI_RANKED: 'Ranked vs AI',
  PVP: 'Online match',
  RANKED: 'Ranked',
  TOURNAMENT: 'Tournament',
  BRAWL: 'Brawl',
  TUTORIAL: 'Tutorial',
  ARENA: 'Arena',
  DUNGEON: 'Dungeon',
  PUZZLE: 'Daily puzzle',
};

/** A card needs this many games with it before it is ranked among the best and worst. */
const MIN_CARD_GAMES = 3;

function Rate({ tally }: { tally: Tally }) {
  const rate = winRate(tally);
  return (
    <span className="ds-rate">
      <span className="ds-bar" aria-hidden>
        <span style={{ width: `${rate ?? 0}%` } as CSSProperties} />
      </span>
      <strong className="num">{rate === null ? '–' : `${rate}%`}</strong>
    </span>
  );
}

/** A deck's results: every mode together or one mode, against each faction, and its best and worst cards. */
export function DeckStatsModal({ deck, onClose }: { deck: Deck; onClose: () => void }) {
  const stats = useAccount((s) => s.save?.profile.deckStats?.[deck.id]);
  const modes = playedModes(stats);
  const [mode, setMode] = useState<DeckMode | 'ALL'>('ALL');
  const m = statsFor(stats, mode);
  const n = games(m);
  const cards = rankedCards(m, MIN_CARD_GAMES);
  const best = cards.slice(0, 5);
  const worst = cards.length > 5 ? [...cards].reverse().slice(0, 5) : [];
  const factions = PLAYABLE_FACTIONS.filter((f) => games(m.vs[f]) > 0);
  const inspect = (id: string) => useUi.getState().inspectCard(id, 'NORMAL');

  // Portalled: the deck tile it is opened from clips and transforms its children.
  return createPortal(
    <Modal open onClose={onClose} title={t('{name}: statistics', { name: deck.name })} wide className="deck-stats">
      {modes.length === 0 ? (
        <p className="muted">{t('No games with this deck yet. Play it in any mode and its results show up here.')}</p>
      ) : (
        <>
          <div className="ds-tabs" role="tablist" aria-label={t('Game mode')}>
            {(['ALL', ...modes] as (DeckMode | 'ALL')[]).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} className={`ds-tab ${mode === k ? 'is-active' : ''}`} onClick={() => setMode(k)}>
                {k === 'ALL' ? t('All modes') : t(DECK_MODE_LABEL[k])}
                <span className="faint num"> {games(k === 'ALL' ? statsFor(stats, 'ALL') : stats!.modes[k])}</span>
              </button>
            ))}
          </div>

          <div className="ds-summary">
            <div>
              <span className="faint">{t('Win rate')}</span>
              <Rate tally={m} />
            </div>
            <div>
              <span className="faint">{t('Games')}</span>
              <strong className="num">{n}</strong>
            </div>
            <div>
              <span className="faint">{t('Wins / losses')}</span>
              <strong className="num">
                {m.w} / {m.l}
                {m.d ? ` / ${m.d}` : ''}
              </strong>
            </div>
            <div>
              <span className="faint">{t('Average length')}</span>
              <strong className="num">{t('{n} turns', { n: n ? Math.round(m.turns / n) : 0 })}</strong>
            </div>
            {stats?.lastPlayed ? (
              <div>
                <span className="faint">{t('Last played')}</span>
                <strong>{formatDate(stats.lastPlayed, { day: 'numeric', month: 'short' })}</strong>
              </div>
            ) : null}
          </div>

          {mode === 'ALL' && modes.length > 1 && (
            <section>
              <h4>{t('By mode')}</h4>
              <ul className="ds-rows">
                {modes.map((k) => (
                  <li key={k}>
                    <span>{t(DECK_MODE_LABEL[k])}</span>
                    <span className="faint num">{t('{w} W · {l} L', { w: stats!.modes[k]!.w, l: stats!.modes[k]!.l })}</span>
                    <Rate tally={stats!.modes[k]!} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h4>{t('Against each faction')}</h4>
            {factions.length === 0 ? (
              <p className="faint">{t('Opponents are counted from this version on.')}</p>
            ) : (
              <ul className="ds-rows">
                {factions.map((f) => (
                  <li key={f} style={{ '--f1': FACTIONS[f].colors.primary } as CSSProperties}>
                    <span className="ds-faction">
                      <Glyph name={FACTIONS[f].sigil} size={14} /> {FACTIONS[f].name}
                    </span>
                    <span className="faint num">{t('{w} W · {l} L', { w: m.vs[f]!.w, l: m.vs[f]!.l })}</span>
                    <Rate tally={m.vs[f]!} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ds-cards">
            <h4>{t('Cards')}</h4>
            {best.length === 0 ? (
              <p className="faint">{t('A card shows up here once it has been played in {n} games. Cards are counted from this version on.', { n: MIN_CARD_GAMES })}</p>
            ) : (
              <div className="ds-card-cols">
                <div>
                  <div className="ds-col-title good">{t('Best when played')}</div>
                  <CardRows rows={best} onInspect={inspect} />
                </div>
                {worst.length > 0 && (
                  <div>
                    <div className="ds-col-title bad">{t('Worst when played')}</div>
                    <CardRows rows={worst} onInspect={inspect} />
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </Modal>,
    document.body,
  );
}

function CardRows({ rows, onInspect }: { rows: { id: string; games: number; rate: number }[]; onInspect: (id: string) => void }) {
  return (
    <ul className="ds-rows">
      {rows.map((r) => {
        const c = getCard(r.id);
        return (
          <li key={r.id}>
            <button type="button" className="text-btn ds-card" onClick={() => onInspect(r.id)}>
              {c ? c.name : r.id}
            </button>
            <span className="faint num">{t('{n} games', { n: r.games })}</span>
            <strong className="num">{r.rate}%</strong>
          </li>
        );
      })}
    </ul>
  );
}
