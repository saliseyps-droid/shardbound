import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { useMatch, AI } from '@/state/matchStore';
import { cardArtUri } from '@/ui/components/cardArt';
import { dragonElement, legendTheme, type LegendTheme } from './legendEntrance';
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

/** A dragon in flight, seen from below: its shadow sweeps over the table. */
const DragonSilhouette = () => (
  <svg viewBox="0 0 200 100" aria-hidden>
    <path d="M14 54 L30 47 L44 49 L62 45 L52 18 L72 33 L78 4 L92 31 L104 0 L110 34 L130 12 L124 46 L150 50 L176 55 L198 47 L184 60 L150 61 L122 63 L102 72 L82 63 L58 59 L40 61 L24 59 Z" />
  </svg>
);

/**
 * A dragon's bat wing in fine line work (root on the right, at the shoulder): tapering bones for the
 * arm and five curved fingers, a scalloped membrane edge, faint veins fanning through the membrane,
 * small spines along the arm and a hooked claw at the wrist.
 */
type Pt = [number, number];
const f1 = (n: number) => n.toFixed(1);
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Point `t` along the quadratic curve a → (control c) → b. */
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => lerp(lerp(a, c, t), lerp(c, b, t), t);
/** The control point that bows the segment a → b sideways by `bend`. */
function bow(a: Pt, b: Pt, bend: number): Pt {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
}
/** A bone along a quadratic curve as a closed outline, `w0` wide at the start tapering to `w1`. */
function taperedBone(a: Pt, c: Pt, b: Pt, w0: number, w1: number): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = quad(a, c, b, t);
    const q = quad(a, c, b, Math.min(1, t + 0.01));
    const p0 = quad(a, c, b, Math.max(0, t - 0.01));
    const dx = q[0] - p0[0];
    const dy = q[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    // A slight swelling at the knuckle (a third of the way) before the taper.
    const w = (w0 + (w1 - w0) * t) * (1 + 0.35 * Math.exp(-((t - 0.36) ** 2) / 0.004)) / 2;
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  }
  const pts = [...left, ...right.reverse()];
  return `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(' L')} Z`;
}

const SHOULDER: Pt = [198, 100];
const ELBOW_C: Pt = [180, 30];
const WRIST: Pt = [130, 20];
// Swept up and out: the leading finger reaches highest.
const TIPS: Pt[] = [
  [14, -6],
  [0, 34],
  [8, 76],
  [40, 112],
  [90, 136],
];
const BODY: Pt = [178, 128];
/** How far each finger bows (alternating slightly for a natural fan). */
const FINGER_BOW = [7, 5, 3, 2, 1];

/** Short spines standing off one side of the curve a → c → b, at the given points along it. */
function spinesAlong(a: Pt, c: Pt, b: Pt, at: number[], height: number, side = 1): string {
  let d = '';
  for (const t of at) {
    const p = quad(a, c, b, t);
    const q = quad(a, c, b, t + 0.03);
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (dy / len) * side;
    const ny = (-dx / len) * side;
    const h = height * (1 - t * 0.5);
    d += `M${f1(p[0] - dx * 0.7)} ${f1(p[1] - dy * 0.7)} Q${f1(p[0] + nx * h * 0.4)} ${f1(p[1] + ny * h * 0.4)} ${f1(p[0] + nx * h + dx * 1.2)} ${f1(p[1] + ny * h + dy * 1.2)} L${f1(p[0] + dx)} ${f1(p[1] + dy)} Z `;
  }
  return d;
}

function buildWing() {
  const arm = taperedBone(SHOULDER, ELBOW_C, WRIST, 5.2, 2.6);
  const fingerCtl = TIPS.map((tip, i) => bow(WRIST, tip, FINGER_BOW[i]));
  const fingers = TIPS.map((tip, i) => taperedBone(WRIST, fingerCtl[i], tip, 2.4, 0.35));
  // A bright line down the middle of every bone, so they read as rounded.
  const curve = (a: Pt, c: Pt, b: Pt, t0 = 0, t1 = 1) => {
    const pts = Array.from({ length: 9 }, (_, i) => quad(a, c, b, t0 + ((t1 - t0) * i) / 8));
    return `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(' L')} `;
  };
  let highlights = curve(SHOULDER, ELBOW_C, WRIST, 0.08, 0.92);
  TIPS.forEach((tip, i) => (highlights += curve(WRIST, fingerCtl[i], tip, 0.06, 0.8)));
  // Knuckles: the wrist, the elbow and a joint a third of the way along every finger.
  const joints: Pt[] = [WRIST, quad(SHOULDER, ELBOW_C, WRIST, 0.5), ...TIPS.map((tip, i) => quad(WRIST, fingerCtl[i], tip, 0.36))];
  const knuckles = joints.map((p, i) => `M${f1(p[0] + (i < 2 ? 2.2 : 1.4))} ${f1(p[1])} a${i < 2 ? 2.2 : 1.4} ${i < 2 ? 2.2 : 1.4} 0 1 0 0.01 0 Z `).join('');
  // Little hooked claws at the fingertips, curling back along the membrane edge.
  const tipClaws = TIPS.map((tip, i) => {
    const dir = lerp(fingerCtl[i], tip, 1);
    const dx = tip[0] - fingerCtl[i][0];
    const dy = tip[1] - fingerCtl[i][1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const end: Pt = [dir[0] + ux * 4 - uy * 2.5, dir[1] + uy * 4 + ux * 2.5];
    return `M${f1(tip[0] - uy * 0.6)} ${f1(tip[1] + ux * 0.6)} Q${f1(tip[0] + ux * 3.5)} ${f1(tip[1] + uy * 3.5)} ${f1(end[0])} ${f1(end[1])} Q${f1(tip[0] + ux * 1.6)} ${f1(tip[1] + uy * 1.6)} ${f1(tip[0] + uy * 0.6)} ${f1(tip[1] - ux * 0.6)} Z `;
  }).join('');
  // Membrane edge: leading edge to the first tip, then scallops sagging towards the wrist, then the body.
  const trail = [...TIPS, BODY];
  const edgeFrom = (pull: number) => {
    const pt = (p: Pt): Pt => lerp(p, WRIST, pull);
    let d = `M${f1(pt(WRIST)[0])} ${f1(pt(WRIST)[1])} Q${f1(pt(bow(WRIST, TIPS[0], 6))[0])} ${f1(pt(bow(WRIST, TIPS[0], 6))[1])} ${f1(pt(TIPS[0])[0])} ${f1(pt(TIPS[0])[1])}`;
    for (let i = 1; i < trail.length; i++) {
      const c = pt(bow(trail[i - 1], trail[i], -16 - i * 2));
      d += ` Q${f1(c[0])} ${f1(c[1])} ${f1(pt(trail[i])[0])} ${f1(pt(trail[i])[1])}`;
    }
    return d;
  };
  const bodyC = bow(BODY, SHOULDER, -6);
  const edge = `${edgeFrom(0)} Q${f1(bodyC[0])} ${f1(bodyC[1])} ${f1(SHOULDER[0])} ${f1(SHOULDER[1])}`;
  // A fine hem just inside the edge.
  const hem = edgeFrom(0.045);
  // Veins: in each panel, cross-veins spanning from finger to finger, sagging towards the edge
  // like a web, and one fine vein running down the middle of the panel.
  let veins = '';
  for (let i = 0; i < TIPS.length; i++) {
    const nextTip = trail[i + 1];
    const nextCtl = i + 1 < TIPS.length ? fingerCtl[i + 1] : bow(WRIST, BODY, 0);
    for (const t of [0.32, 0.5, 0.68, 0.84]) {
      const a1 = quad(WRIST, fingerCtl[i], TIPS[i], t);
      const b1 = quad(WRIST, nextCtl, nextTip, t);
      const sag = bow(a1, b1, -(4 + t * 7));
      veins += `M${f1(a1[0])} ${f1(a1[1])} Q${f1(sag[0])} ${f1(sag[1])} ${f1(b1[0])} ${f1(b1[1])} `;
    }
    const midStart = lerp(quad(WRIST, fingerCtl[i], TIPS[i], 0.22), quad(WRIST, nextCtl, nextTip, 0.22), 0.5);
    const midEnd = lerp(lerp(TIPS[i], nextTip, 0.5), midStart, 0.12);
    const midC = bow(midStart, midEnd, 3);
    veins += `M${f1(midStart[0])} ${f1(midStart[1])} Q${f1(midC[0])} ${f1(midC[1])} ${f1(midEnd[0])} ${f1(midEnd[1])} `;
  }
  // Spines along the top of the arm and the first finger.
  const spines = spinesAlong(SHOULDER, ELBOW_C, WRIST, [0.18, 0.34, 0.5, 0.66, 0.82], 6) + spinesAlong(WRIST, fingerCtl[0], TIPS[0], [0.15, 0.3, 0.45, 0.6], 3.2);
  // A hooked claw at the wrist.
  const claw = `M${f1(WRIST[0] + 1.5)} ${f1(WRIST[1] - 1)} C${f1(WRIST[0] + 3)} ${f1(WRIST[1] - 10)} ${f1(WRIST[0] - 2)} ${f1(WRIST[1] - 16)} ${f1(WRIST[0] - 8)} ${f1(WRIST[1] - 15)} C${f1(WRIST[0] - 3)} ${f1(WRIST[1] - 12)} ${f1(WRIST[0] - 2)} ${f1(WRIST[1] - 6)} ${f1(WRIST[0] - 2)} ${f1(WRIST[1] - 1)} Z`;
  return { arm, fingers, edge, hem, veins, spines, claw, highlights, knuckles, tipClaws };
}
const WING = buildWing();

const DragonWing = ({ side }: { side: 'left' | 'right' }) => (
  <svg className={`dg-wing ${side}`} viewBox="-6 -14 210 160" aria-hidden>
    {/* The right wing is the left one mirrored inside its own box, so its root faces the portrait. */}
    <g transform={side === 'right' ? 'translate(198 0) scale(-1 1)' : undefined}>
      <path className="veins" d={WING.veins} />
      <path className="hem" d={WING.hem} />
      <path className="edge" d={WING.edge} />
      <path className="bone" d={WING.spines} />
      <path className="bone" d={WING.arm} />
      {WING.fingers.map((d, i) => (
        <path key={i} className="bone" d={d} />
      ))}
      <path className="bone" d={WING.tipClaws} />
      <path className="bone" d={WING.claw} />
      <path className="joint" d={WING.knuckles} />
      <path className="shine" d={WING.highlights} />
    </g>
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
  dragon: {
    back: () => (
      <>
        <div className="dg-moon" />
        <div className="dg-particles">{particles(28, 'dg-p')}</div>
      </>
    ),
    stage: () => (
      <>
        <DragonWing side="left" />
        <DragonWing side="right" />
        <div className="dg-ring" />
        <div className="dg-ring late" />
      </>
    ),
    front: () => (
      <>
        <div className="dg-shadow">
          <DragonSilhouette />
        </div>
        <div className="dg-wind">{particles(10, 'gust')}</div>
        <div className="dg-roar" />
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
      className={`legend-entrance theme-${theme} ${theme === 'dragon' ? `el-${dragonElement(cardId)}` : ''} ${enemy ? 'from-enemy' : 'from-self'}`}
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
