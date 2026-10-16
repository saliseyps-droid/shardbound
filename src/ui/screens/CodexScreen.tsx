import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAccount } from '@/state/accountStore';
import { getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { audio } from '@/audio/audioService';
import { anim } from '@/state/settingsStore';
import { useUi } from '@/state/uiStore';
import { ScreenHeader } from '@/ui/components/common';
import { Cinematic, cinematicImageUrl } from '@/ui/components/Cinematic';
import { Glyph } from '@/ui/components/Icons';
import { portraitUrl } from '@/ui/components/WardenPortrait';
import { BrandLogo } from '@/ui/components/BrandLogo';
import { codexEntries, codexParts, type CodexEntry, type CodexPart } from '@/ui/codex/codexEntries';
import { markCodexSeen, unreadCodex, useCodexSeen } from '@/ui/codex/codexSeen';
import { CodexMarks } from '@/ui/codex/CodexMarks';
import { formatDate, t, tn } from '@/i18n';
import '@/ui/styles/codex.css';

/** How long a page takes to turn (ms, before animation-speed scaling). */
const TURN_MS = 700;

type Turn = { dir: 'next' | 'prev'; from: number; to: number };

function EntryImage({ e }: { e: CodexEntry }) {
  if (!e.unlocked)
    return (
      <div className="cx-blank">
        <Glyph name="eye" size={44} />
      </div>
    );
  const src = e.image.kind === 'cinematic' ? cinematicImageUrl(e.image.id) : portraitUrl(e.image.faction, e.image.portrait);
  return (
    <figure className={`cx-plate cx-plate-${e.image.kind}`}>
      {src && <img src={src} alt="" draggable={false} style={e.image.kind === 'cinematic' && e.image.focus ? { objectPosition: e.image.focus } : undefined} />}
    </figure>
  );
}

function EntryText({ e, page, fresh, onWatch }: { e: CodexEntry; page: number; fresh: boolean; onWatch: (id: string) => void }) {
  const card = e.rewardCard ? getCard(e.rewardCard) : undefined;
  return (
    <div className="cx-text">
      <div className="cx-kicker">
        {t(e.kicker)}
        {fresh && <span className="cx-new">{t('New page')}</span>}
      </div>
      {e.unlocked ? (
        <>
          <h2 className="cx-title">{e.kind === 'shot' ? null : t(e.title)}</h2>
          {e.subtitle && <div className="cx-subtitle">{e.subtitle}</div>}
          {e.text && <p className={e.kind === 'shot' ? 'cx-narration' : 'cx-body'}>{t(e.text)}</p>}
          {e.quote && <blockquote className="cx-quote">“{e.quote}”</blockquote>}
          {e.kind === 'boss' && (
            <dl className="cx-facts">
              {e.faction && (
                <>
                  <dt>{t('Faction')}</dt>
                  <dd>
                    <Glyph name={FACTIONS[e.faction].sigil} size={13} /> {FACTIONS[e.faction].name}
                  </dd>
                </>
              )}
              {e.beaten && (
                <>
                  {/* Very old saves may not have a real time for the first clear. */}
                  {e.beaten.at > Date.UTC(2020, 0, 1) && (
                    <>
                      <dt>{t('First defeated')}</dt>
                      <dd>{formatDate(e.beaten.at, { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                    </>
                  )}
                  <dt>{t('Victories')}</dt>
                  <dd className="num">{tn(e.beaten.wins, '{n} time', '{n} times')}</dd>
                </>
              )}
            </dl>
          )}
          {card && (
            <button type="button" className="cx-reward" onClick={() => useUi.getState().inspectCard(card.id, 'NORMAL')}>
              <Glyph name="crystal" size={14} /> {t('Won: {card}', { card: card.name })}
            </button>
          )}
          {e.cinematic && (
            <button type="button" className="btn btn-sm cx-watch" onClick={() => onWatch(e.cinematic!)}>
              ▶ {t('Watch this cinematic')}
            </button>
          )}
        </>
      ) : (
        <>
          <h2 className="cx-title cx-unknown">???</h2>
          <p className="cx-hint">{t(e.hint.key, { name: t(e.hint.name) })}</p>
        </>
      )}
      <div className="cx-folio">{page}</div>
    </div>
  );
}

function Cover({ open, total }: { open: number; total: number }) {
  return (
    <div className="cx-cover">
      <BrandLogo size={110} />
      <h2>{t('The Codex of Aethra')}</h2>
      <p>{t('Everything that happened since the Crown broke, as far as you have seen it.')}</p>
      <div className="cx-progress">{t('{open} of {total} pages written', { open, total })}</div>
    </div>
  );
}

function Contents({ parts, fresh, onJump }: { parts: CodexPart[]; fresh: Record<string, number>; onJump: (spread: number) => void }) {
  return (
    <div className="cx-text cx-contents">
      <div className="cx-kicker">{t('Contents')}</div>
      <ol>
        {parts.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onJump(p.first)}>
              <span>
                {t(p.title)}
                {fresh[p.id] ? <span className="cx-new">{t('{n} new', { n: fresh[p.id] })}</span> : null}
              </span>
              <span className="cx-dots" aria-hidden />
              <span className="num">
                {p.open} / {p.count}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="cx-tip">{t('Turn the pages with the arrows, the arrow keys or a swipe.')}</p>
    </div>
  );
}

/**
 * The Codex: the story as a book with turning pages. Spread 0 is the cover and contents; every
 * other spread is one entry (picture on the left, text on the right).
 */
export default function CodexScreen() {
  const save = useAccount((s) => s.save);
  const entries = useMemo(() => (save ? codexEntries(save) : []), [save]);
  const parts = useMemo(() => codexParts(entries), [entries]);
  const open = entries.filter((e) => e.unlocked).length;
  const last = entries.length;
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [watching, setWatching] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  // Pages written since the last visit stay marked "New" during this visit; the menu dot clears at once.
  const [fresh] = useState(() => new Set(unreadCodex(entries.filter((e) => e.unlocked).map((e) => e.id), useCodexSeen.getState().seen)));
  useEffect(() => markCodexSeen(entries.filter((e) => e.unlocked).map((e) => e.id)), [entries]);
  const freshByPart = useMemo(() => {
    const out: Record<string, number> = {};
    for (const e of entries) if (fresh.has(e.id)) out[e.part] = (out[e.part] ?? 0) + 1;
    return out;
  }, [entries, fresh]);

  const go = useCallback(
    (to: number) => {
      if (turn || to === spread || to < 0 || to > last) return;
      audio.play('play');
      const t2: Turn = { dir: to > spread ? 'next' : 'prev', from: spread, to };
      setTurn(t2);
      timer.current = window.setTimeout(() => {
        setSpread(to);
        setTurn(null);
      }, anim(TURN_MS));
    },
    [turn, spread, last],
  );
  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (watching) return;
      if (e.key === 'ArrowRight') go(spread + 1);
      else if (e.key === 'ArrowLeft') go(spread - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, spread, watching]);

  // A swipe turns the page too.
  const swipe = useRef<number | null>(null);

  // Faint ink marks behind every page, two different styles on each spread.
  const left = (i: number): ReactNode => (
    <>
      <CodexMarks spread={i} side="left" />
      {i === 0 ? <Cover open={open} total={last} /> : <EntryImage e={entries[i - 1]} />}
    </>
  );
  const right = (i: number): ReactNode => (
    <>
      <CodexMarks spread={i} side="right" />
      {i === 0 ? <Contents parts={parts} fresh={freshByPart} onJump={go} /> : <EntryText e={entries[i - 1]} page={i} fresh={fresh.has(entries[i - 1].id)} onWatch={setWatching} />}
    </>
  );

  if (!save) return null;
  // While a page turns, the pages underneath already show where it lands.
  const baseLeft = turn ? (turn.dir === 'next' ? turn.from : turn.to) : spread;
  const baseRight = turn ? (turn.dir === 'next' ? turn.to : turn.from) : spread;

  return (
    <div className="screen codex-screen">
      <ScreenHeader title={t('Codex')} subtitle={t('The story so far, page by page. New pages appear as you watch the cinematics and beat the bosses.')} />
      <div
        className="cx-book"
        onPointerDown={(e) => (swipe.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 60) go(spread + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="cx-spread">
          <div className="cx-page cx-left">{left(baseLeft)}</div>
          <div className="cx-page cx-right">{right(baseRight)}</div>
          {turn && (
            <div className={`cx-leaf cx-leaf-${turn.dir}`} style={{ animationDuration: `${anim(TURN_MS)}ms` }} aria-hidden>
              <div className={`cx-face cx-front cx-page ${turn.dir === 'next' ? 'cx-right' : 'cx-left'}`}>{turn.dir === 'next' ? right(turn.from) : left(turn.from)}</div>
              <div className={`cx-face cx-back cx-page ${turn.dir === 'next' ? 'cx-left' : 'cx-right'}`}>{turn.dir === 'next' ? left(turn.to) : right(turn.to)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="cx-nav">
        <button type="button" className="btn" disabled={spread === 0 || !!turn} onClick={() => go(spread - 1)} aria-label={t('Previous page')}>
          ‹
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={spread === 0 || !!turn} onClick={() => go(0)}>
          {t('Contents')}
        </button>
        <span className="cx-pageno num">{spread === 0 ? t('Cover') : `${spread} / ${last}`}</span>
        <button type="button" className="btn" disabled={spread === last || !!turn} onClick={() => go(spread + 1)} aria-label={t('Next page')}>
          ›
        </button>
      </div>
      {watching && <Cinematic key={watching} id={watching} onDone={() => setWatching(null)} />}
    </div>
  );
}
