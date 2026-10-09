import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { useMatch } from '@/state/matchStore';
import '@/ui/styles/legendary.css';

/** The fallen Warden's portrait breaks into GRID × GRID pieces. */
const GRID = 4;
const EMBERS = 26;

const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Is (x, y), in 0..1 of the portrait box, inside its hexagon? */
const inHex = (x: number, y: number) => {
  const dx = Math.abs(x - 0.5) * 2;
  return y >= 0.14 * dx && y <= 1 - 0.14 * dx;
};

interface Target {
  x: number;
  y: number;
  w: number;
  h: number;
  art: string | null;
}

/**
 * The killing blow: the camera leans in on the fallen Warden, its portrait flares white and shatters into
 * pieces of itself that fly apart, with rings of force, embers and smoke; then the results show.
 */
export function FinalBlow() {
  const finale = useMatch((s) => s.finale);
  const [target, setTarget] = useState<Target | null>(null);
  useLayoutEffect(() => {
    if (!finale) return;
    const hero = document.querySelector<HTMLElement>(`[data-entity="h:${finale.loser}"]`);
    const r = hero?.getBoundingClientRect();
    const art = hero?.querySelector('img')?.getAttribute('src') ?? null;
    setTarget(r ? { x: r.left, y: r.top, w: r.width, h: r.height, art } : { x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 68, w: 120, h: 136, art: null });
    hero?.classList.add('is-shattering');
    const board = document.querySelector<HTMLElement>('.match');
    if (board && r) board.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
    board?.classList.add('is-final-blow');
    return () => {
      board?.classList.remove('is-final-blow');
      if (board) board.style.transformOrigin = '';
      hero?.classList.remove('is-shattering');
    };
  }, [finale]);
  if (!finale || !target) return null;
  const pieces: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID; row++) for (let col = 0; col < GRID; col++) if (inHex((col + 0.5) / GRID, (row + 0.5) / GRID)) pieces.push({ col, row });
  return (
    <div
      key={finale.id}
      className="final-blow"
      style={{ '--hx': `${target.x}px`, '--hy': `${target.y}px`, '--hw': `${target.w}px`, '--hh': `${target.h}px`, '--cx': `${target.x + target.w / 2}px`, '--cy': `${target.y + target.h / 2}px`, '--hs': `${target.w}px` } as CSSProperties}
      aria-hidden
    >
      <div className="fb-dim" />
      <div className="fb-glow" />
      <div className="fb-ring" />
      <div className="fb-ring late" />
      <div className="fb-smoke" />
      <div className="fb-pieces">
        {pieces.map(({ col, row }, i) => {
          // Fly away from the centre, a little up first, then fall.
          const dx = (col + 0.5) / GRID - 0.5;
          const dy = (row + 0.5) / GRID - 0.5;
          const len = Math.hypot(dx, dy) || 0.1;
          const j = (k: number) => rnd(i, k);
          return (
            <span
              key={i}
              className="fb-piece"
              style={
                {
                  left: `${(col / GRID) * 100}%`,
                  top: `${(row / GRID) * 100}%`,
                  backgroundImage: target.art ? `url("${target.art}")` : undefined,
                  backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
                  '--tx': `${(dx / len) * (2.2 + j(1) * 2.4)}`,
                  '--ty': `${(dy / len) * (2.2 + j(2) * 2.4) - 1}`,
                  '--rot': `${(j(3) - 0.5) * 540}deg`,
                  '--d': `${j(4) * 0.08}s`,
                  clipPath: `polygon(${j(5) * 18}% 0, 100% ${j(6) * 18}%, ${100 - j(7) * 18}% 100%, 0 ${100 - j(8) * 18}%)`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      <div className="fb-embers">
        {Array.from({ length: EMBERS }, (_, i) => (
          <span key={i} style={{ '--a': `${(i / EMBERS) * 360 + rnd(i, 9) * 14}deg`, '--s': rnd(i, 10), '--d': `${rnd(i, 11) * 0.15}s` } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}
