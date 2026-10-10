import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { getCardSafe } from '@/data/cards';
import { useMatch } from '@/state/matchStore';
import { cardArtUri } from '@/ui/components/cardArt';
import { RuneCircle } from './LegendaryEntrance';
import { t } from '@/i18n';
import '@/ui/styles/legendary.css';

const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A card taking the Warden's place (Sali, the Creator): a rift tears open above the Warden, the colossal
 * Sali descends into it, rings of creation close in, everything implodes into the new Warden.
 */
export function Ascension() {
  const asc = useMatch((s) => s.ascension);
  const [at, setAt] = useState<{ x: number; y: number; size: number } | null>(null);
  useLayoutEffect(() => {
    if (!asc) return;
    const hero = document.querySelector<HTMLElement>(`[data-entity="h:${asc.player}"]`);
    const r = hero?.getBoundingClientRect();
    setAt(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width } : { x: window.innerWidth / 2, y: window.innerHeight * 0.8, size: 100 });
    hero?.classList.add('is-ascending');
    const board = document.querySelector('.match');
    board?.classList.add('is-ascension');
    return () => {
      hero?.classList.remove('is-ascending');
      board?.classList.remove('is-ascension');
    };
  }, [asc]);
  if (!asc || !at) return null;
  const card = getCardSafe(asc.cardId);
  return (
    <div key={asc.id} className="ascension" style={{ '--cx': `${at.x}px`, '--cy': `${at.y}px`, '--hs': `${at.size}px` } as CSSProperties} aria-hidden>
      <div className="as2-dark" />
      <img className="as2-colossus" src={cardArtUri(card)} alt="" draggable={false} />
      <div className="as2-rings">
        {[0, 1, 2].map((i) => (
          <div key={i} className="as2-ring" style={{ '--i': i } as CSSProperties}>
            <RuneCircle />
          </div>
        ))}
      </div>
      <div className="as2-in">
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} style={{ '--i': i, '--s': rnd(i, 1), '--d': rnd(i, 2) } as CSSProperties} />
        ))}
      </div>
      <div className="as2-flash" />
      <div className="as2-shock" />
      <div className="as2-name">
        <small>{t('New Warden')}</small>
        <strong>{card.name}</strong>
      </div>
    </div>
  );
}
