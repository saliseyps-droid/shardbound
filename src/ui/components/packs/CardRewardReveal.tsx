import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { getCardSafe } from '@/data/cards';
import { maxCopiesFor } from '@/domain/decks';
import { ownedCopies } from '@/domain/save';
import type { Rarity, Variant } from '@/game/types';
import { useAccount } from '@/state/accountStore';
import { anim, useSettings } from '@/state/settingsStore';
import { audio, type SoundEvent } from '@/audio/audioService';
import { CardBack, CardView, isTouchScreen } from '@/ui/components/CardView';
import { LegendShowcase } from '@/ui/match/LegendaryEntrance';
import { PARTICLES } from './PackOpening';
import { packCardWidth } from './packLayout';
import { t } from '@/i18n';
import '@/ui/styles/packs.css';

const REVEAL_SOUND: Record<Rarity, SoundEvent> = { COMMON: 'reveal', RARE: 'rareReveal', EPIC: 'epicReveal', LEGENDARY: 'legendaryReveal' };
const RARITY_LABEL: Record<Rarity, string> = { COMMON: 'Common', RARE: 'Rare', EPIC: 'Epic', LEGENDARY: 'Legendary' };

/**
 * A card won in a fight (a campaign first clear): shown face down like a card from a pack, turned
 * over with a click, with the same sounds and the Legendary burst and entrance.
 */
export function CardRewardReveal({ cardId, variant, onDone }: { cardId: string; variant: Variant; onDone: () => void }) {
  const def = getCardSafe(cardId);
  const [up, setUp] = useState(false);
  const [legendFx, setLegendFx] = useState(false);
  const [showcase, setShowcase] = useState(false);
  const endShowcase = useCallback(() => setShowcase(false), []);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const cardBack = useAccount((s) => s.save?.profile.cardBack);
  const owned = useAccount((s) => (s.save ? ownedCopies(s.save.collection, cardId) : 0));
  const cardW = Math.round(Math.min(packCardWidth(window.innerWidth, window.innerHeight) * 1.25, window.innerHeight * 0.4));
  const timers = useRef<number[]>([]);
  const touch = isTouchScreen();
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);
  useEffect(() => audio.play('packOpen'), []);

  const reveal = useCallback(() => {
    if (up) return;
    setUp(true);
    audio.play(REVEAL_SOUND[def.rarity]);
    if (def.rarity === 'LEGENDARY' && !reducedMotion) {
      setLegendFx(true);
      timers.current.push(window.setTimeout(() => setLegendFx(false), anim(1700)));
      timers.current.push(window.setTimeout(() => setShowcase(true), anim(900)));
    }
  }, [up, def.rarity, reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Escape') return;
      e.preventDefault();
      if (!up) reveal();
      else if (!showcase) onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [up, showcase, reveal, onDone]);

  return (
    <div className={`pack-stage phase-reveal card-reward ${legendFx ? 'legend-shake' : ''}`} style={{ '--pack-card-w': `${cardW}px` } as CSSProperties} role="dialog" aria-modal="true" aria-label={t('A card for your collection')}>
      <div className="pack-stage-bg" aria-hidden />
      <div className="card-reward-body">
        <p className="card-reward-title">{up ? t('Added to your collection') : t('You won a card')}</p>
        <ol className="pack-cards">
          <li className={`pack-slot rarity-${def.rarity.toLowerCase()} ${up ? 'is-up fresh' : ''}`} style={{ '--i': 0 } as CSSProperties}>
            <button className="flip-card" onClick={reveal} aria-label={up ? def.name : t('Reveal the card')}>
              <span className="flip-inner">
                <span className="flip-face flip-back">
                  <CardBack width={cardW} design={cardBack} />
                  <span className="back-hint" aria-hidden />
                </span>
                <span className="flip-face flip-front">
                  <CardView card={def} width={cardW} variant={variant} />
                  {variant !== 'NORMAL' && <span className="variant-label">{variant === 'FOIL' ? t('Foil') : t('Prismatic')}</span>}
                </span>
              </span>
              {up && def.rarity === 'EPIC' && <span className="epic-swirl" aria-hidden />}
              {up && def.rarity !== 'COMMON' && <span className="rarity-halo" aria-hidden />}
            </button>
            <div className="slot-meta" aria-hidden={!up}>
              {up && (
                <>
                  <span className={`rarity-text-${def.rarity.toLowerCase()}`}>{t(RARITY_LABEL[def.rarity])}</span>
                  <span className="faint">
                    {t('Owned')} <span className="num">{owned} / {maxCopiesFor(def)}</span>
                  </span>
                </>
              )}
            </div>
          </li>
        </ol>
      </div>
      <div className="pack-controls">
        {up ? (
          <button className="btn btn-primary btn-lg" onClick={onDone} autoFocus={!touch}>
            {t('Continue')}
          </button>
        ) : (
          <span className="muted">{touch ? t('Tap the card to reveal it') : t('Click the card to reveal it')}</span>
        )}
      </div>
      {showcase && <LegendShowcase cardId={cardId} onDone={endShowcase} />}
      {legendFx && (
        <div className="legend-fx" aria-hidden>
          <span className="legend-flash" />
          <span className="legend-rays" />
          {PARTICLES.map((p, i) => (
            <span key={i} className="legend-particle" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--d': `${p.delay}ms`, '--s': `${p.size}px` } as CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
