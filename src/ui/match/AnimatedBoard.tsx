import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { GameState } from '@/engine/types';
import { HUMAN } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { usingTouch } from '@/ui/inputMode';
import { BOARD_FX, type BoardFx, type ParticleKind } from './boardFx';
import logoUrl from '@/assets/logo.webp';
import '@/ui/styles/animatedBoard.css';

const glowModules = import.meta.glob('../../assets/boards/fx/*-glow.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
/** Each mat's glow layer (tools/board_glow.py), by mat name. */
export const BOARD_GLOWS: Record<string, string> = Object.fromEntries(Object.entries(glowModules).map(([path, url]) => [path.match(/([^/]+)-glow\.webp$/)![1], url]));
const smokeModules = import.meta.glob('../../assets/boards/fx/*-smoke.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
/** The painted smoke of a mat, alone (tools/board_glow.py), by mat name. */
const BOARD_SMOKE: Record<string, string> = Object.fromEntries(Object.entries(smokeModules).map(([path, url]) => [path.match(/([^/]+)-smoke\.webp$/)![1], url]));

/** The mats' size: the layer is laid out on a mat the way `background-size: cover` shows it. */
const MAT_W = 3200;
const MAT_H = 1823;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  /** Phase for sways, blinks and spins. */
  seed: number;
  alt: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** A point on the mat's edges, in 0..1: never the middle of the table where the cards lie. */
function rimPoint(): { x: number; y: number } {
  const r = Math.random();
  if (r < 0.45) return { x: rand(0.12, 0.88), y: rand(0.86, 0.96) };
  if (r < 0.65) return { x: rand(0.12, 0.88), y: rand(0.04, 0.14) };
  return { x: Math.random() < 0.5 ? rand(0.05, 0.13) : rand(0.87, 0.95), y: rand(0.15, 0.9) };
}

/** A new particle of this kind, drifting the way it does. */
function spawn(kind: ParticleKind, fx: BoardFx): Particle {
  const base = { age: 0, seed: Math.random() * 6.28, alt: Math.random() < 0.4 };
  switch (kind) {
    case 'embers':
      return { ...base, ...rimPoint(), vx: rand(-0.005, 0.005), vy: -rand(0.02, 0.055), life: rand(1.6, 3.8), size: rand(0.8, 2.4) };
    case 'motes':
      return { ...base, ...rimPoint(), vx: rand(-0.008, 0.008), vy: rand(-0.012, 0.004), life: rand(2.5, 5), size: rand(0.8, 2) };
    case 'dust':
      return { ...base, x: rand(0.03, 0.97), y: rand(0.05, 0.95), vx: rand(-0.004, 0.004), vy: rand(-0.004, 0.002), life: rand(4, 8), size: rand(0.5, 1.3) };
    case 'snow':
      return { ...base, x: rand(-0.05, 1.05), y: -0.03, vx: rand(-0.006, 0.006), vy: rand(0.03, 0.07), life: rand(14, 30), size: rand(0.7, 2.2) };
    case 'leaves':
      return { ...base, x: rand(0, 1), y: -0.05, vx: rand(0.002, 0.012), vy: rand(0.025, 0.045), life: rand(25, 45), size: rand(7, 11) };
    case 'fireflies':
      return { ...base, x: rand(0.04, 0.96), y: rand(0.06, 0.94), vx: 0, vy: 0, life: rand(5, 10), size: rand(0.6, 1.1) };
    case 'stars':
      return { ...base, x: rand(0.03, 0.97), y: rand(0.05, 0.95), vx: 0, vy: 0, life: rand(1.5, 3.5), size: rand(0.8, 2) };
    case 'steam': {
      const f = fx.particles.from ?? { x: 50, y: 50 };
      return { ...base, x: f.x / 100 + rand(-0.025, 0.025), y: f.y / 100 + rand(-0.02, 0.02), vx: rand(0.008, 0.02), vy: -rand(0.006, 0.016), life: rand(5, 7.5), size: rand(16, 26) };
    }
  }
}

interface Wisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  seed: number;
}

/** A wisp of smoke rising from one of the places where the mat has painted smoke, drifting away from the table. */
function wisp(at: [number, number]): Wisp {
  const x = at[0] / 100 + rand(-0.02, 0.02);
  const y = at[1] / 100 + rand(-0.02, 0.02);
  const away = Math.atan2(y - 0.5, x - 0.5);
  const v = rand(0.009, 0.021);
  return { x, y, vx: Math.cos(away) * v, vy: Math.sin(away) * v - rand(0.006, 0.015), age: 0, life: rand(4.5, 7.5), size: rand(0.035, 0.07), seed: Math.random() * 6.28 };
}

function drawWisp(ctx: CanvasRenderingContext2D, w: Wisp, px: number, py: number, r: number, color: string) {
  const t = w.age / w.life;
  const alpha = 0.22 * Math.sin(Math.PI * t);
  const rr = r * (0.7 + t * 0.9);
  // A stretched, turning puff reads as a curl of smoke rather than a ball.
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(w.seed + w.age * 0.22);
  ctx.scale(1.8, 0.75);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
  g.addColorStop(0, `rgba(${color}, ${alpha})`);
  g.addColorStop(0.5, `rgba(${color}, ${alpha * 0.45})`);
  g.addColorStop(1, `rgba(${color}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2);
  ctx.restore();
}

/** Falling and drifting kinds stay until they leave the mat; the rest live out their life. */
const FALLS: ParticleKind[] = ['snow', 'leaves'];

function draw(ctx: CanvasRenderingContext2D, p: Particle, kind: ParticleKind, px: number, py: number, r: number, color: string, alt: string | undefined) {
  const t = p.age / p.life;
  const c = p.alt && alt ? alt : color;
  if (kind === 'embers' || kind === 'motes' || kind === 'dust') {
    const alpha = (kind === 'dust' ? 0.45 : 1) * Math.min(1, t * 5) * (1 - t);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    g.addColorStop(0, `rgba(255, 245, 220, ${alpha})`);
    g.addColorStop(0.3, `rgba(${c}, ${alpha * 0.75})`);
    g.addColorStop(1, `rgba(${c}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(px - r * 3, py - r * 3, r * 6, r * 6);
    return;
  }
  if (kind === 'stars') {
    // A four-pointed glint that flashes in and out.
    const alpha = Math.sin(Math.PI * t) ** 2;
    const len = r * 4 * (0.6 + 0.4 * alpha);
    ctx.strokeStyle = `rgba(${c}, ${alpha})`;
    ctx.lineWidth = Math.max(1, r * 0.35);
    ctx.beginPath();
    ctx.moveTo(px - len, py);
    ctx.lineTo(px + len, py);
    ctx.moveTo(px, py - len);
    ctx.lineTo(px, py + len);
    ctx.stroke();
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
    g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    g.addColorStop(1, `rgba(${c}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(px - r * 2, py - r * 2, r * 4, r * 4);
    return;
  }
  if (kind === 'fireflies') {
    // Blink a few times over its life.
    const alpha = Math.min(1, t * 4, (1 - t) * 4) * (0.6 + 0.4 * Math.max(0, Math.sin(p.age * 2.2 + p.seed)));
    // A tiny bright point in a small halo.
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.5);
    g.addColorStop(0, `rgba(255, 255, 230, ${alpha})`);
    g.addColorStop(0.2, `rgba(245, 255, 180, ${alpha})`);
    g.addColorStop(0.45, `rgba(${c}, ${alpha * 0.4})`);
    g.addColorStop(1, `rgba(${c}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(px - r * 3.5, py - r * 3.5, r * 7, r * 7);
    return;
  }
  if (kind === 'snow') {
    ctx.fillStyle = `rgba(${c}, ${0.75 * Math.min(1, p.age)})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (kind === 'leaves') {
    // A leaf tumbling: its width swings as it turns.
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(px, py);
    ctx.rotate(p.seed + p.age * 0.9);
    ctx.scale(Math.abs(Math.sin(p.age * 1.7 + p.seed)) * 0.8 + 0.2, 1);
    const a = 0.85 * Math.min(1, p.age);
    ctx.fillStyle = `rgba(${c}, ${a})`;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.75, 0, 0, r);
    ctx.quadraticCurveTo(-r * 0.75, 0, 0, -r);
    ctx.fill();
    // Its midrib.
    ctx.strokeStyle = `rgba(30, 20, 10, ${a * 0.45})`;
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(0, r * 1.15);
    ctx.stroke();
    ctx.restore();
    return;
  }
  // steam: a soft puff that widens and fades (laid over, not added, so the puffs never pile up into white).
  const alpha = 0.13 * Math.sin(Math.PI * t);
  const rr = r * (0.6 + t * 2.2);
  const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
  g.addColorStop(0, `rgba(${c}, ${alpha})`);
  g.addColorStop(1, `rgba(${c}, 0)`);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = g;
  ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
  ctx.restore();
}

/**
 * Your turn begins: the Shardbound emblem rises in the middle of the board, the same on every mat. Two rune
 * rings draw themselves and turn against each other while the emblem forms out of its glow, then it all fades.
 */
function TurnEmblem() {
  return (
    <span className="ab-turn">
      <svg className="ab-turn-rings" viewBox="0 0 200 200">
        <circle className="ab-ring-outer" cx="100" cy="100" r="92" pathLength="100" />
        <circle className="ab-ring-ticks" cx="100" cy="100" r="84" pathLength="100" />
        <circle className="ab-ring-inner" cx="100" cy="100" r="74" pathLength="100" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} className="ab-ring-rune" d="M100 4 l5 9 -5 9 -5 -9z" transform={`rotate(${a} 100 100)`} />
        ))}
      </svg>
      <img className="ab-turn-logo" src={logoUrl} alt="" draggable={false} />
    </span>
  );
}

/**
 * A mat that comes alive (src/ui/match/boardFx.ts): its glow breathes, its lights flicker and particles
 * drift over it. When your turn begins, the Shardbound emblem rises in the middle of it.
 */
export function AnimatedBoard({ board, game }: { board: string; game?: GameState }) {
  const fx = BOARD_FX[board];
  const glowUrl = BOARD_GLOWS[board];
  const reduced = useSettings((s) => s.reducedMotion);
  const lowPower = useSettings((s) => s.performanceMode);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const myTurnKey = game && game.activePlayer === HUMAN && game.phase === 'MAIN' ? game.turn : null;

  // The mat as `cover` shows it, so the lights sit on the painting.
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      // Layout size, not getBoundingClientRect: the match intro and the final blow scale the board.
      const width = host.clientWidth;
      const height = host.clientHeight;
      const s = Math.max(width / MAT_W, height / MAT_H);
      setStage({ x: (width - MAT_W * s) / 2, y: (height - MAT_H * s) / 2, w: MAT_W * s, h: MAT_H * s });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Particles: a small canvas at 30 fps; requestAnimationFrame already rests while the tab is hidden.
  const particles = useRef<Particle[]>([]);
  useEffect(() => {
    if (reduced || !fx) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const kind = fx.particles.kind;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const base = Math.max(3, Math.round(fx.particles.count * (lowPower ? 0.35 : usingTouch() ? 0.6 : 1)));
    const falls = FALLS.includes(kind);
    // Falling kinds start already spread over the mat instead of all at the top.
    particles.current = falls ? Array.from({ length: base }, () => ({ ...spawn(kind, fx), y: rand(0, 1), age: 1 })) : [];
    const smoke = fx.smoke;
    const wantWisps = smoke ? Math.round(smoke.at.length * (lowPower ? 0.4 : usingTouch() ? 0.6 : 1)) : 0;
    // Smoke starts already drifting, at every age.
    const wisps: Wisp[] = smoke ? Array.from({ length: wantWisps }, () => {
      const w = wisp(smoke.at[Math.floor(Math.random() * smoke.at.length)]);
      w.age = rand(0, w.life);
      return w;
    }) : [];
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (acc < 1 / 30) return;
      const step = acc;
      acc = 0;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const st = stageRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!st) return;
      if (smoke) {
        while (wisps.length < wantWisps) wisps.push(wisp(smoke.at[Math.floor(Math.random() * smoke.at.length)]));
        ctx.globalCompositeOperation = 'source-over';
        for (let i = wisps.length - 1; i >= 0; i--) {
          const w = wisps[i];
          w.age += step;
          if (w.age >= w.life) {
            wisps.splice(i, 1);
            continue;
          }
          w.x += w.vx * step;
          w.y += w.vy * step;
          drawWisp(ctx, w, (st.x + w.x * st.w) * dpr, (st.y + w.y * st.h) * dpr, w.size * st.w * dpr, smoke.color);
        }
      }
      const list = particles.current;
      for (let i = list.length; i < base; i++) if (Math.random() < (falls ? 0.05 : 0.15)) list.push(spawn(kind, fx));
      ctx.globalCompositeOperation = 'lighter';
      const scale = dpr * (st.w / 1600 + 0.6);
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.age += step;
        if (p.age >= p.life || (falls && p.y > 1.05)) {
          list.splice(i, 1);
          continue;
        }
        if (kind === 'fireflies') {
          // Wander along a slow, wavy path.
          p.x += Math.sin(p.age * 0.7 + p.seed) * 0.012 * step;
          p.y += Math.cos(p.age * 0.5 + p.seed * 1.3) * 0.01 * step;
        } else {
          const sway = falls ? Math.sin(p.age * 1.3 + p.seed) * 0.012 : Math.sin(p.age * 2.4 + p.seed) * 0.004;
          p.x += (p.vx + sway) * step;
          p.y += p.vy * step;
        }
        draw(ctx, p, kind, (st.x + p.x * st.w) * dpr, (st.y + p.y * st.h) * dpr, p.size * scale, fx.particles.color, fx.particles.alt);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced, lowPower, fx]);

  if (!fx) return null;
  const glowStyle = {
    '--ab-min': fx.glow?.min ?? 0.2,
    '--ab-max': fx.glow?.max ?? 0.6,
    '--ab-period': `${fx.glow?.period ?? 6}s`,
    '--ab-strength': fx.glow?.strength ?? 1,
  } as CSSProperties;
  return (
    <div ref={hostRef} className={`animated-board ${reduced ? 'is-still' : ''}`} style={{ ...glowStyle, '--ab-color': fx.color } as CSSProperties} aria-hidden>
      {stage && (
        <div className="ab-stage" style={{ left: stage.x, top: stage.y, width: stage.w, height: stage.h }}>
          {glowUrl && <img className="ab-glow" src={glowUrl} alt="" draggable={false} />}
          {glowUrl && <img className="ab-glow ab-haze" src={glowUrl} alt="" draggable={false} />}
          {BOARD_SMOKE[board] && (
            <span className="ab-smoke">
              <img src={BOARD_SMOKE[board]} alt="" draggable={false} />
              <img src={BOARD_SMOKE[board]} alt="" draggable={false} />
            </span>
          )}
          {fx.rays && (
            <span className="ab-rays">
              <i />
              <i />
              <i />
            </span>
          )}
          {fx.mist && (
            <span className="ab-mist" style={{ '--mist': fx.mist } as CSSProperties}>
              <i />
              <i />
            </span>
          )}
          {fx.lamps?.map((l, i) => (
            <span key={i} className={`ab-lamp ab-lamp-${l.kind}`} style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.size}%`, '--i': i } as CSSProperties} />
          ))}
        </div>
      )}
      <canvas ref={canvasRef} className="ab-embers" />
      {myTurnKey !== null && !reduced && <TurnEmblem key={myTurnKey} />}
    </div>
  );
}
