import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { useMatch, AI } from '@/state/matchStore';
import { cardArtUri } from '@/ui/components/cardArt';
import { legendTheme, type LegendTheme } from './legendEntrance';
import { audio } from '@/audio/audioService';
import { anim } from '@/state/settingsStore';
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
export const Cracks = () => (
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

/** Elinda's vines climbing both sides of her frame, with leaves and flowers (x/y in hundredths of the portrait width). */
const VINE_LEFT = 'M14 145 C4 120 30 110 22 90 S6 60 26 44 S40 14 62 4';
const VINE_LEAVES: [number, number, number][] = [[20, 128, -40], [16, 104, 30], [25, 82, -50], [13, 64, 20], [30, 44, -30], [44, 20, 40]];
const VINE_FLOWERS: [number, number][] = [[62, 4], [22, 90], [14, 64]];
const Flower = ({ x, y, i }: { x: number; y: number; i: number }) => (
  <g className="el-flower" style={{ animationDelay: `${0.75 + i * 0.1}s` }}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={x} cy={y - 4.5} rx={3} ry={5} transform={`rotate(${a} ${x} ${y})`} />
    ))}
    <circle className="el-heart" cx={x} cy={y} r={2.4} />
  </g>
);
const Vines = () => (
  <svg viewBox="0 0 160 150" aria-hidden>
    {[false, true].map((mirror) => (
      <g key={String(mirror)} transform={mirror ? 'translate(160 0) scale(-1 1)' : undefined}>
        <path className="el-vine" d={VINE_LEFT} pathLength={1} />
        {VINE_LEAVES.map(([x, y, a], i) => (
          <g key={i} transform={`rotate(${a} ${x} ${y})`}>
            <ellipse className="el-leaf" cx={x} cy={y} rx={7} ry={3.2} style={{ animationDelay: `${0.3 + i * 0.07}s` }} />
          </g>
        ))}
        {VINE_FLOWERS.map(([x, y], i) => (
          <Flower key={`f${i}`} x={x} y={y} i={i} />
        ))}
      </g>
    ))}
  </svg>
);

const Snowflake = () => (
  <svg viewBox="-10 -10 20 20" aria-hidden>
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1="0" y1="-9" x2="0" y2="9" />
        <path d="M-3 -6 L0 -3.5 L3 -6 M-3 6 L0 3.5 L3 6" />
      </g>
    ))}
  </svg>
);

/** Skolky's rune circle: two rings, a hexagram and rune marks, drawn in frost light. */
/** Rune glyphs (Elder Futhark shapes) drawn as strokes, so they never depend on a font. */
const RUNES = [
  'M0 -10 L0 10 M0 -4 L6 -9 M0 2 L6 -3', // fehu
  'M-4 10 L-4 -10 L5 -4 L5 10', // uruz
  'M0 -10 L0 10 M0 -6 L6 0 L0 6', // thurisaz
  'M-5 10 L0 -10 L5 10', // kenaz-like
  'M0 -10 L0 10 M-6 -4 L0 0 L6 -4', // algiz
  'M-5 -10 L-5 10 M-5 -10 L5 -3 L-5 4 L5 10', // berkano
  'M-6 -10 L6 10 M6 -10 L-6 10', // gebo
  'M0 -10 L0 10 M0 -10 L6 -5 L0 0', // wunjo
];
const Rune = ({ i }: { i: number }) => (
  <svg viewBox="-9 -13 18 26" aria-hidden>
    <path d={RUNES[i % RUNES.length]} />
  </svg>
);

export const RuneCircle = () => (
  <svg viewBox="-100 -100 200 200" aria-hidden>
    <circle r="96" pathLength={1} />
    <circle r="82" pathLength={1} />
    <circle r="50" pathLength={1} />
    <polygon points="0,-82 71,41 -71,41" pathLength={1} />
    <polygon points="0,82 71,-41 -71,-41" pathLength={1} />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} className="rune" d={RUNES[i % RUNES.length]} transform={`rotate(${i * 22.5}) translate(0 -89) scale(0.42)`} style={{ animationDelay: `${0.35 + i * 0.03}s` }} />
    ))}
  </svg>
);

/** A cog with `teeth` teeth, for R3-D3. */
function Gear({ teeth }: { teeth: number }) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 50 : 41;
    for (const da of [-0.11, 0.11]) pts.push(`${(Math.cos(a0 + da) * r).toFixed(1)},${(Math.sin(a0 + da) * r).toFixed(1)}`);
  }
  return (
    <svg viewBox="-52 -52 104 104" aria-hidden>
      <polygon points={pts.join(' ')} />
      <circle r="24" className="hole" />
      <circle r="10" />
    </svg>
  );
}

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
  elinda: {
    back: () => (
      <>
        <div className="el-glow" />
        <div className="el-flies">{particles(26, 'fly')}</div>
      </>
    ),
    stage: () => (
      <>
        <div className="el-pulse" />
        <div className="el-vines">
          <Vines />
        </div>
      </>
    ),
  },
  skolky: {
    back: () => (
      <>
        <div className="sk-frost" />
        <div className="sk-snow">{particles(22, 'flake', <Snowflake />)}</div>
      </>
    ),
    stage: () => (
      <>
        <div className="sk-circle">
          <RuneCircle />
        </div>
        <div className="sk-runes">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ '--i': i, '--s': rnd(i, 3), '--r': rnd(i, 4) - 0.5 } as CSSProperties}>
              <Rune i={i} />
            </span>
          ))}
        </div>
      </>
    ),
  },
  r3d3: {
    back: () => <div className="r3-grid" />,
    stage: () => (
      <>
        <div className="r3-gear big">
          <Gear teeth={14} />
        </div>
        <div className="r3-gear small">
          <Gear teeth={9} />
        </div>
        <div className="r3-plates">{particles(10, 'plate')}</div>
        <div className="r3-scan" />
        <div className="r3-hud">{t('Systems online')}</div>
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

/** How long an entrance plays (ms, before reduced-motion scaling). */
export const LEGEND_MS = 2150;

/** A short full-screen entrance when a Legendary unit is played, before it lands on the board. */
export function LegendaryEntrance() {
  const legend = useMatch((s) => s.legend);
  if (!legend) return null;
  return <LegendaryEntranceView key={legend.id} cardId={legend.cardId} enemy={legend.player === AI} />;
}

/**
 * The same entrance outside a match (a Legendary pulled from a pack, or replayed from the collection):
 * plays its sound and calls `onDone` when it has finished.
 */
export function LegendShowcase({ cardId, onDone }: { cardId: string; onDone: () => void }) {
  useEffect(() => {
    audio.play('legendaryReveal');
    const id = setTimeout(onDone, anim(LEGEND_MS));
    return () => clearTimeout(id);
  }, [cardId, onDone]);
  // Portalled to the body: a panel with a transform would otherwise trap the fixed overlay inside it.
  return createPortal(
    <div className="legend-showcase" onClick={onDone}>
      <LegendaryEntranceView cardId={cardId} enemy={false} />
    </div>,
    document.body,
  );
}

export function LegendaryEntranceView({ cardId, enemy }: { cardId: string; enemy: boolean }) {
  const card = getCardSafe(cardId);
  const theme = legendTheme(cardId);
  const extras = EXTRAS[theme] ?? {};
  const faction = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  return (
    <div
      className={`legend-entrance theme-${theme} ${enemy ? 'from-enemy' : 'from-self'}`}
      style={{ '--f1': faction.colors.primary, '--fglow': faction.colors.glow } as CSSProperties}
      role="status"
      aria-label={t('{who} played {card}', { who: enemy ? t('Opponent') : t('You'), card: card.name })}
    >
      <div className="legend-backdrop" />
      <div className="legend-sunrays" />
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
