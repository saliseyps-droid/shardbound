import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { SET_INFO } from '@/config/economy';
import { getCardSafe } from '@/data/cards';
import { maxCopiesFor } from '@/domain/decks';
import { recycleValue } from '@/domain/economy';
import type { PackCard } from '@/domain/packs';
import { ownedCopies } from '@/domain/save';
import type { Rarity, SetId } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { anim, useSettings } from '@/state/settingsStore';
import { toast, useUi } from '@/state/uiStore';
import { audio, type SoundEvent } from '@/audio/audioService';
import { CardBack, CardView } from '@/ui/components/CardView';
import { Essence } from '@/ui/components/common';
import { BoosterPack, PACK_THEME } from './BoosterPack';
import { t, tn } from '@/i18n';

type Phase = 'intro' | 'opening' | 'reveal' | 'summary';

const REVEAL_SOUND: Record<Rarity, SoundEvent> = { COMMON: 'reveal', RARE: 'rareReveal', EPIC: 'epicReveal', LEGENDARY: 'legendaryReveal' };
const RARITY_LABEL: Record<Rarity, string> = { COMMON: 'Common', RARE: 'Rare', EPIC: 'Epic', LEGENDARY: 'Legendary' };

function useCardWidth(): number {
  const calc = () => Math.round(Math.max(120, Math.min(250, (window.innerWidth - 160) / 5.8, (window.innerHeight - 330) / 1.4)));
  const [w, setW] = useState(calc);
  useEffect(() => {
    const on = () => setW(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/** Deterministic particle layout for the legendary burst. */
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 180 + ((i * 37) % 160);
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, delay: (i % 7) * 40, size: 4 + (i % 4) * 2 };
});

export function PackOpening({ setId, onClose, onOpenAnother }: { setId: SetId; onClose: () => void; onOpenAnother: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [cards, setCards] = useState<PackCard[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [legendFx, setLegendFx] = useState(false);
  const [freshReveal, setFreshReveal] = useState<number | null>(null);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const collection = useAccount((s) => s.save?.collection);
  const cardBack = useAccount((s) => s.save?.profile.cardBack);
  const remaining = useAccount((s) => s.save?.economy.packs[setId] ?? 0);
  const inspect = useUi((s) => s.inspectCard);
  const cardW = useCardWidth();
  const openBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const theme = PACK_THEME[setId];

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);
  useEffect(() => {
    if (phase === 'intro') openBtn.current?.focus();
  }, [phase]);

  const open = useCallback(() => {
    if (phase !== 'intro') return;
    // Cards are granted immediately so a reload mid-animation never loses them.
    const res = gameService.openPack(setId);
    if (!res.ok) {
      audio.play('error');
      toast(res.error, 'error');
      onClose();
      return;
    }
    setCards(res.value);
    setRevealed(res.value.map(() => false));
    setPhase('opening');
    audio.play('packOpen');
    later(() => setPhase('reveal'), anim(1250));
  }, [phase, setId, onClose]);

  const revealedRef = useRef<boolean[]>([]);
  revealedRef.current = revealed;

  const reveal = useCallback(
    (i: number) => {
      const prev = revealedRef.current;
      if (prev[i] || !cards[i]) return;
      const next = [...prev];
      next[i] = true;
      revealedRef.current = next;
      setRevealed(next);
      const card = cards[i];
      audio.play(REVEAL_SOUND[card.rarity]);
      if (card.rarity === 'LEGENDARY' && !reducedMotion) {
        setLegendFx(true);
        later(() => setLegendFx(false), anim(1700));
      }
      setFreshReveal(i);
      later(() => setFreshReveal((f) => (f === i ? null : f)), anim(1400));
      if (next.every(Boolean)) later(() => setPhase('summary'), anim(700));
    },
    [cards, reducedMotion],
  );

  const revealAll = useCallback(() => {
    // Stagger for a satisfying cascade; highest rarity sound plays last.
    const order = cards.map((_, i) => i).filter((i) => !revealed[i]);
    order.forEach((i, n) => later(() => reveal(i), anim(n * 220)));
  }, [cards, revealed, reveal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'intro' && (e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body) {
        e.preventDefault();
        open();
      } else if (phase === 'reveal' && (e.key === 'r' || e.key === 'R')) {
        revealAll();
      } else if (e.key === 'Escape') {
        if (phase === 'intro') onClose();
        else if (phase === 'reveal') revealAll();
        else if (phase === 'summary') onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, open, revealAll, onClose]);

  const summary = useMemo(() => {
    if (!collection) return { newCount: 0, surplusEssence: 0, best: 'COMMON' as Rarity };
    const surplusLeft = new Map<string, number>();
    let surplusEssence = 0;
    for (const c of cards) {
      if (!surplusLeft.has(c.cardId)) {
        const max = maxCopiesFor(getCardSafe(c.cardId));
        surplusLeft.set(c.cardId, Math.max(0, ownedCopies(collection, c.cardId) - max));
      }
      const left = surplusLeft.get(c.cardId)!;
      if (left > 0) {
        surplusEssence += recycleValue(c.cardId, c.variant);
        surplusLeft.set(c.cardId, left - 1);
      }
    }
    const rank: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    const best = cards.reduce<Rarity>((b, c) => (rank.indexOf(c.rarity) > rank.indexOf(b) ? c.rarity : b), 'COMMON');
    return { newCount: cards.filter((c) => c.isNew).length, surplusEssence, best };
  }, [cards, collection]);

  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  return (
    <div
      className={`pack-stage phase-${phase} ${legendFx ? 'legend-shake' : ''}`}
      style={{ '--pack-glow': theme.glow, '--pack-a': theme.a, '--pack-card-w': `${cardW}px` } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={t('Opening a {name} pack', { name: SET_INFO[setId].name })}
    >
      <div className="pack-stage-bg" aria-hidden />
      {(phase === 'intro' || phase === 'opening') && (
        <div className="pack-center">
          <button ref={openBtn} className="pack-open-btn" onClick={open} disabled={phase !== 'intro'} aria-label={t('Open the pack')}>
            <BoosterPack setId={setId} width={Math.min(260, cardW * 1.15)} className="pack-hero" />
            {phase === 'opening' && (
              <>
                <span className="pack-burst" aria-hidden />
                <span className="pack-tear" aria-hidden />
              </>
            )}
          </button>
          <p className="pack-instruction" aria-live="polite">
            {phase === 'intro' ? t('Click the pack or press Space to open it') : t('The seal breaks…')}
          </p>
          {phase === 'intro' && (
            <button className="btn btn-ghost pack-cancel" onClick={onClose}>
              {t('Back to inventory')}
            </button>
          )}
        </div>
      )}

      {(phase === 'reveal' || phase === 'summary') && (
        <>
          <ol className="pack-cards" aria-label={t('Pack contents')}>
            {cards.map((c, i) => {
              const isUp = revealed[i];
              const def = getCardSafe(c.cardId);
              const owned = collection ? ownedCopies(collection, c.cardId) : 0;
              const max = maxCopiesFor(def);
              return (
                <li
                  key={i}
                  className={`pack-slot rarity-${c.rarity.toLowerCase()} ${isUp ? 'is-up' : ''} ${freshReveal === i ? 'fresh' : ''}`}
                  style={{ '--i': i } as CSSProperties}
                >
                  <button
                    className="flip-card"
                    onClick={() => (isUp ? inspect(c.cardId, c.variant) : reveal(i))}
                    aria-label={isUp ? `${def.name}, ${t(RARITY_LABEL[c.rarity])}${c.isNew ? t(', new') : ''}. ${t('Open details')}` : t('Reveal card {n}', { n: i + 1 })}
                  >
                    <span className="flip-inner">
                      <span className="flip-face flip-back">
                        <CardBack width={cardW} design={cardBack} />
                        <span className="back-hint" aria-hidden />
                      </span>
                      <span className="flip-face flip-front">
                        <CardView card={def} width={cardW} variant={c.variant} />
                        {c.variant !== 'NORMAL' && <span className="variant-label">{c.variant === 'FOIL' ? t('Foil') : t('Prismatic')}</span>}
                      </span>
                    </span>
                    {isUp && c.rarity === 'EPIC' && <span className="epic-swirl" aria-hidden />}
                    {isUp && (c.rarity === 'RARE' || c.rarity === 'EPIC' || c.rarity === 'LEGENDARY') && <span className="rarity-halo" aria-hidden />}
                  </button>
                  <div className="slot-meta" aria-hidden={!isUp}>
                    {isUp && (
                      <>
                        {c.isNew && <span className="badge-new">{t('New')}</span>}
                        <span className={`rarity-text-${c.rarity.toLowerCase()}`}>{t(RARITY_LABEL[c.rarity])}</span>
                        <span className="faint">
                          {t('Owned')} <span className="num">{owned} / {max}</span>
                        </span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="pack-controls">
            {phase === 'reveal' && !allRevealed && (
              <>
                <span className="muted">{t('Click a card to reveal it')}</span>
                <button className="btn btn-cyan" onClick={revealAll}>
                  {t('Reveal all')}
                </button>
              </>
            )}
            {phase === 'summary' && (
              <div className="pack-summary panel panel-tight" role="status">
                <div className="pack-summary-text">
                  <strong className="summary-title">
                    {summary.best === 'LEGENDARY' ? t('A Legendary pull') : summary.best === 'EPIC' ? t('An Epic pack') : t('Pack opened')}
                  </strong>
                  <span className="muted">
                    {summary.newCount > 0 ? tn(summary.newCount, '{n} new card added to your collection.', '{n} new cards added to your collection.') : t('All cards added to your collection.')}
                    {summary.surplusEssence > 0 && (
                      <>
                        {' '}
                        {t('Extra copies beyond a playset are worth')} <Essence amount={summary.surplusEssence} />{t(' if recycled.')}
                      </>
                    )}
                  </span>
                </div>
                <div className="pack-summary-actions">
                  {remaining > 0 && (
                    <button className="btn btn-primary" onClick={onOpenAnother} autoFocus>
                      {t('Open another ({n} left)', { n: remaining })}
                    </button>
                  )}
                  <a className="btn" href="#/collection">
                    {t('View collection')}
                  </a>
                  <button className="btn btn-ghost" onClick={onClose} autoFocus={remaining === 0}>
                    {t('Done')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {legendFx && (
        <div className="legend-fx" aria-hidden>
          <span className="legend-flash" />
          <span className="legend-rays" />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="legend-particle"
              style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--d': `${p.delay}ms`, '--s': `${p.size}px` } as CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
