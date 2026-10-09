import type { CSSProperties, ReactNode } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { useMatch, AI } from '@/state/matchStore';
import { cardArtUri } from '@/ui/components/cardArt';
import { legendTheme, type LegendTheme } from './legendEntrance';
import { t } from '@/i18n';
import '@/ui/styles/legendary.css';

/** Stable pseudo-random 0..1 per particle, so every entrance looks the same. */
const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** `n` particles with a random x position (--x), delay (--d), size (--s) and drift (--r). */
function particles(n: number, className: string, child?: ReactNode) {
  return Array.from({ length: n }, (_, i) => (
    <span key={i} className={className} style={{ '--i': i, '--x': rnd(i, 1), '--d': rnd(i, 2), '--s': rnd(i, 3), '--r': rnd(i, 4) - 0.5 } as CSSProperties}>
      {child}
    </span>
  ));
}

function Paw() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="42" rx="15" ry="13" />
      <ellipse cx="14" cy="26" rx="6.5" ry="8.5" transform="rotate(-20 14 26)" />
      <ellipse cx="25" cy="15" rx="6.5" ry="9" />
      <ellipse cx="39" cy="15" rx="6.5" ry="9" />
      <ellipse cx="50" cy="26" rx="6.5" ry="8.5" transform="rotate(20 50 26)" />
    </svg>
  );
}

const Crown = () => (
  <svg viewBox="0 0 120 70" aria-hidden>
    <path d="M6 64 L0 14 L32 38 L60 0 L88 38 L120 14 L114 64 Z" />
    <circle cx="60" cy="10" r="6" className="gem" />
    <circle cx="6" cy="18" r="5" className="gem" />
    <circle cx="114" cy="18" r="5" className="gem" />
  </svg>
);

/** A tractor drawn as a constellation: stars joined by faint lines, wheels turning, a headlight and exhaust. */
const TRACTOR_WINDOW = 'M58 20 L102 20 Q107 20 107 25 L109 54 Q109 58 105 58 L56 58 Q52 58 52 54 L53 25 Q53 20 58 20 Z';
/** The body's faint fill, with the window cut out of it. */
const TRACTOR_BODY = `M44 70 L40 8 L120 8 L116 70 L118 58 L226 62 L238 92 L240 112 L186 110 L118 104 Z ${TRACTOR_WINDOW}`;
const TRACTOR_LINES = [
  'M32 8 L128 8', // roof with an overhang
  'M44 70 L40 8 M116 70 L120 8', // cabin posts
  'M116 70 L118 58 L226 62 L238 92 L240 112', // hood and nose
  'M118 104 L186 110', // chassis
  'M228 72 L232 106 M234 74 L236 106', // grille
  'M180 61 L180 20 M173 20 L187 20', // exhaust stack and cap
  'M22 118 A50 50 0 0 1 122 118', // fender over the rear wheel
  'M20 104 L6 104', // hitch
];
const TRACTOR_STARS: [number, number, number][] = [
  [32, 8, 3], [128, 8, 3], [40, 8, 4], [120, 8, 4], [44, 70, 3.5], [116, 70, 3.5],
  [118, 58, 3], [226, 62, 4], [238, 92, 3], [240, 112, 3.5], [186, 110, 3], [118, 104, 3],
  [180, 20, 3], [173, 20, 2.2], [187, 20, 2.2], [22, 118, 3], [122, 118, 3], [72, 68, 3.5], [6, 104, 2.5],
];
const WHEELS = [
  { cx: 72, cy: 118, r: 44, tread: 16, spokes: 6 },
  { cx: 212, cy: 136, r: 26, tread: 10, spokes: 5 },
];
const StarTractor = () => (
  <svg viewBox="-60 -30 330 210" aria-hidden>
    <defs>
      <linearGradient id="tr-beam" x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#bfe0ff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon className="tr-beam" points="240,76 330,52 330,112" fill="url(#tr-beam)" />
    <path className="tr-body" d={TRACTOR_BODY} />
    {/* The cab window: a rounded empty pane with a glint. */}
    <path className="tr-glass" d={TRACTOR_WINDOW} />
    <path className="tr-glint" d="M64 50 L80 26 M74 52 L88 32" />
    {TRACTOR_LINES.map((d, i) => (
      <path key={i} className="tr-line" d={d} />
    ))}
    {TRACTOR_STARS.map(([x, y, r], i) => (
      <circle key={`s${i}`} className="tr-star" cx={x} cy={y} r={r} style={{ animationDelay: `${0.9 + rnd(i, 7) * 0.6}s` }} />
    ))}
    <circle className="tr-star tr-lamp" cx={238} cy={76} r={6} />
    {WHEELS.map((w, wi) => (
      <g key={`w${wi}`} className="tr-wheel" style={{ transformOrigin: `${w.cx}px ${w.cy}px` }}>
        <circle className="tr-line" cx={w.cx} cy={w.cy} r={w.r} />
        <circle className="tr-line" cx={w.cx} cy={w.cy} r={w.r * 0.45} />
        {Array.from({ length: w.spokes }, (_, i) => {
          const a = (i / w.spokes) * Math.PI * 2;
          return <line key={`k${i}`} className="tr-line" x1={w.cx + Math.cos(a) * w.r * 0.45} y1={w.cy + Math.sin(a) * w.r * 0.45} x2={w.cx + Math.cos(a) * w.r} y2={w.cy + Math.sin(a) * w.r} />;
        })}
        {Array.from({ length: w.tread }, (_, i) => {
          const a = (i / w.tread) * Math.PI * 2;
          return <circle key={i} className="tr-star" cx={w.cx + Math.cos(a) * w.r} cy={w.cy + Math.sin(a) * w.r} r={i % 2 ? 2 : 3.2} />;
        })}
        <circle className="tr-star" cx={w.cx} cy={w.cy} r={5} />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <circle key={`p${i}`} className="tr-puff" cx={180} cy={14} r={3 + i * 1.2} style={{ animationDelay: `${0.6 + i * 0.15}s` }} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={`d${i}`} className="tr-dust" cx={30 - i * 6} cy={158 - (i % 2) * 6} r={2 + (i % 3)} style={{ animationDelay: `${0.55 + i * 0.07}s` }} />
    ))}
  </svg>
);

/** Radiating cracks for Tallys, drawn from the centre outward. */
const Cracks = () => (
  <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
    {[0, 52, 118, 170, 228, 291, 330].map((a, i) => {
      const pts = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const r = 16 + k * 13;
        const jitter = (rnd(i, k + 5) - 0.5) * 34;
        const rad = ((a + jitter) * Math.PI) / 180;
        return `${(Math.cos(rad) * r).toFixed(1)},${(Math.sin(rad) * r).toFixed(1)}`;
      });
      return <polyline key={a} points={`0,0 ${pts.join(' ')}`} pathLength={1} />;
    })}
  </svg>
);

/** Layers behind the portrait (back), on the stage around it (stage) and over everything (front). */
const EXTRAS: Partial<Record<LegendTheme, { back?: () => ReactNode; stage?: () => ReactNode; front?: () => ReactNode }>> = {
  meowchick: {
    stage: () => <div className="legend-bubble">{t('Meow!')}</div>,
    front: () => <div className="legend-paws">{particles(8, 'paw', <Paw />)}</div>,
  },
  liu: {
    back: () => <div className="lk-motes">{particles(40, 'mote')}</div>,
    stage: () => (
      <>
        <div className="lk-aura" />
        <div className="lk-pillars">{particles(13, 'pillar')}</div>
        <div className="lk-ripple" />
        <div className="lk-ripple late" />
        <div className="lk-ripple later" />
        <div className="lk-shards">{particles(24, 'shard')}</div>
        <div className="lk-blades">{particles(16, 'blade')}</div>
        <div className="lk-tractor">
          <StarTractor />
        </div>
        <div className="lk-comet lk-comet-a" />
        <div className="lk-comet lk-comet-b" />
        <div className="lk-comet" />
      </>
    ),
    front: () => (
      <>
        <div className="lk-flash" />
        <div className="lk-flare" />
      </>
    ),
  },
  abandoneer: {
    stage: () => (
      <>
        <div className="ab-wanted">{t('Wanted')}</div>
        <div className="ab-slash" />
      </>
    ),
    front: () => <div className="ab-coins">{particles(22, 'coin', <i>☠</i>)}</div>,
  },
  rendoslav: {
    stage: () => (
      <>
        {(['left', 'right'] as const).map((side) => (
          <div key={side} className={`rd-banner ${side}`}>
            <Crown />
          </div>
        ))}
        <div className="rd-shock" />
        <div className="rd-crown">
          <Crown />
        </div>
      </>
    ),
  },
  qvido: {
    back: () => (
      <>
        <div className="qv-lava" />
        <div className="qv-embers">{particles(22, 'ember')}</div>
      </>
    ),
  },
  qinny: {
    back: () => (
      <>
        <div className="qn-nebula" />
        <div className="qn-stars">{particles(40, 'star')}</div>
        <div className="qn-bubbles">{particles(18, 'bub')}</div>
      </>
    ),
    stage: () => (
      <>
        <div className="qn-bubble" />
        <div className="qn-drops">{particles(14, 'drop')}</div>
      </>
    ),
  },
  tallys: {
    back: () => (
      <div className="tl-cracks">
        <Cracks />
      </div>
    ),
    front: () => <div className="tl-slash" />,
  },
};

/** A short full-screen entrance when a Legendary unit is played, before it lands on the board. */
export function LegendaryEntrance() {
  const legend = useMatch((s) => s.legend);
  if (!legend) return null;
  const card = getCardSafe(legend.cardId);
  const theme = legendTheme(legend.cardId);
  const extras = EXTRAS[theme] ?? {};
  const faction = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  return (
    <div
      key={legend.id}
      className={`legend-entrance theme-${theme} ${legend.player === AI ? 'from-enemy' : 'from-self'}`}
      style={{ '--f1': faction.colors.primary, '--fglow': faction.colors.glow } as CSSProperties}
      role="status"
      aria-label={t('{who} played {card}', { who: legend.player === AI ? t('Opponent') : t('You'), card: card.name })}
    >
      <div className="legend-backdrop" />
      <div className="legend-rays" />
      {extras.back?.()}
      <div className="legend-stage">
        <div className="legend-portrait">
          <img src={cardArtUri(card)} alt="" draggable={false} />
        </div>
        {extras.stage?.()}
        <div className="legend-banner">
          <span className="legend-kicker">{t('Legendary')}</span>
          <strong>{card.name}</strong>
        </div>
      </div>
      {extras.front && <div className="legend-front" aria-hidden>{extras.front()}</div>}
    </div>
  );
}
