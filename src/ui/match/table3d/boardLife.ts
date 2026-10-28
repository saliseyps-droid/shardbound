import * as THREE from 'three';
import type { BoardFx, BoardParticles } from '../boardFx';
import { MAT } from './tableCamera';
import { lampToWorld, particleMotion, rgb } from './boardLifeRules';

/**
 * The animated board's life in 3D (boardFx.ts): its particles move in the air over the mat (embers
 * and steam rise, snow and leaves fall onto it, dust and fireflies hover, glints flash on it) and its
 * painted flames and candles become real lights that fall on the cards. Its glow and painted smoke
 * (black-backed masks the flat board screens over the mat) shine additively on the 3D mat; the lamps,
 * rays and mist stay with AnimatedBoard, laid onto the table with the rest of the DOM.
 */
export interface BoardLife {
  update(t: number, dt: number): void;
  dispose(): void;
}

interface P { x: number; y: number; z: number; vx: number; vy: number; vz: number; age: number; life: number; seed: number; alt: boolean }

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,.6)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function system(scene: THREE.Scene, cfg: BoardParticles, dot: THREE.Texture, lowPower: boolean) {
  const motion = particleMotion(cfg.kind);
  // The 3D table shows the mat smaller than the flat board, so a few more particles read the same.
  const count = Math.max(4, Math.round(cfg.count * (lowPower ? 0.4 : 1.2)));
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // World-unit sizes (Points shrink with distance: at the table's distance 0.1 is about two pixels).
  const size = cfg.kind === 'leaves' ? 0.7 : cfg.kind === 'steam' ? 2.6 : cfg.kind === 'fireflies' ? 0.5 : cfg.kind === 'snow' ? 0.36 : cfg.kind === 'stars' ? 0.6 : 0.32;
  const mat = new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: cfg.kind === 'leaves' || cfg.kind === 'steam' ? THREE.NormalBlending : THREE.AdditiveBlending, toneMapped: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  const c1 = rgb(cfg.color);
  const c2 = cfg.alt ? rgb(cfg.alt) : c1;
  const strength = cfg.strength ?? 1;
  const from = cfg.from ? lampToWorld(cfg.from.x, cfg.from.y) : null;
  const glints = cfg.at?.map(([x, y]) => lampToWorld(x, y));

  const spawn = (fresh: boolean): P => {
    const p: P = { x: rand(-MAT.w / 2, MAT.w / 2), y: rand(-MAT.h / 2, MAT.h / 2), z: MAT.top, vx: 0, vy: 0, vz: 0, age: 0, life: rand(4, 9), seed: Math.random() * 100, alt: Math.random() < 0.4 };
    if (motion === 'rise') {
      if (from) {
        p.x = from.x + rand(-0.15, 0.15);
        p.y = from.y + rand(-0.15, 0.15);
        p.vz = rand(0.25, 0.45);
        p.life = rand(3, 5);
      } else {
        // Embers die out a hand or two above the table.
        p.vz = rand(0.3, 0.7);
        p.life = rand(2.5, 4.5);
      }
      p.vx = rand(-0.08, 0.08);
      p.vy = rand(-0.08, 0.08);
    } else if (motion === 'fall') {
      p.z = fresh ? rand(MAT.top, 4) : 4;
      p.vz = cfg.kind === 'leaves' ? rand(-0.35, -0.2) : rand(-0.5, -0.3);
      p.vx = rand(0.02, 0.12);
      p.life = 30;
    } else if (motion === 'glint') {
      const g = glints?.[Math.floor(Math.random() * glints.length)];
      if (g) {
        p.x = g.x;
        p.y = g.y;
      }
      p.z = MAT.top + 0.05;
      p.life = rand(0.8, 1.8);
    } else {
      p.z = rand(MAT.top + 0.2, cfg.kind === 'fireflies' ? 1.6 : 2.6);
      p.life = rand(6, 12);
    }
    if (fresh && motion !== 'fall') p.age = rand(0, p.life);
    return p;
  };
  const list = Array.from({ length: count }, () => spawn(true));

  return {
    update(t: number, dt: number) {
      for (let i = 0; i < list.length; i++) {
        let p = list[i];
        p.age += dt;
        if (motion === 'hover') {
          // A slow, wavy wander.
          p.x += Math.sin(p.age * 0.6 + p.seed) * 0.12 * dt;
          p.y += Math.cos(p.age * 0.45 + p.seed * 1.3) * 0.1 * dt;
          p.z += Math.sin(p.age * 0.8 + p.seed * 0.7) * 0.05 * dt;
        } else {
          const sway = motion === 'fall' ? Math.sin(p.age * 1.3 + p.seed) * 0.15 : Math.sin(p.age * 2 + p.seed) * 0.05;
          p.x += (p.vx + sway) * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
        }
        if (p.age >= p.life || (motion === 'fall' && p.z <= MAT.top + 0.02)) p = list[i] = spawn(false);
        // Fade in and out over each life; fireflies pulse, glints flash once.
        const k = p.age / p.life;
        let a = Math.min(1, k * 5, (1 - k) * 4);
        if (cfg.kind === 'fireflies') a *= 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2 + p.seed));
        if (motion === 'glint') a = Math.sin(k * Math.PI) ** 3;
        if (cfg.kind === 'steam') a *= 0.25;
        a *= strength * (motion === 'rise' && !from ? 1.4 : 1);
        const c = p.alt ? c2 : c1;
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        col[i * 3] = c[0] * a;
        col[i * 3 + 1] = c[1] * a;
        col[i * 3 + 2] = c[2] * a;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
    dispose() {
      scene.remove(points);
      geo.dispose();
      mat.dispose();
    },
  };
}

/** The mat's masks (AnimatedBoard's BOARD_GLOWS / BOARD_SMOKE / BOARD_SEA). */
export interface BoardMasks { glow?: string; smoke?: string; sea?: string }

export function createBoardLife(scene: THREE.Scene, fx: BoardFx | undefined, masks: BoardMasks, lowPower: boolean): BoardLife {
  if (!fx) return { update() {}, dispose() {} };
  const dot = dotTexture();
  // Additive layers just over the mat; each breathes on its own beat.
  const loader = new THREE.TextureLoader();
  const layers: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; opacity: (t: number) => number; drift?: number }[] = [];
  const layer = (url: string, z: number, opacity: (t: number) => number, drift?: number) => {
    const map = loader.load(url);
    map.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(MAT.w, MAT.h), new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    mesh.position.z = MAT.top + z;
    scene.add(mesh);
    layers.push({ mesh, opacity, drift });
  };
  const wave = (t: number, period: number, lo: number, hi: number, phase = 0) => lo + (hi - lo) * (0.5 - 0.5 * Math.cos(((t + phase) / period) * Math.PI * 2));
  if (masks.glow) {
    const g = fx.glow ?? {};
    const k = 0.85 * (g.strength ?? 1);
    layer(masks.glow, 0.004, (t) => k * wave(t, g.period ?? 6, g.min ?? 0.2, g.max ?? 0.6));
  }
  for (const url of [masks.smoke, masks.sea]) {
    if (!url) continue;
    // Two copies drifting against each other, fading in and out in turn (like .ab-smoke's two images).
    // About half the flat board's opacity: adding light is much stronger than screening it.
    layer(url, 0.005, (t) => 0.55 * wave(t, 7.5, 0.15, 0.75), 0.012);
    layer(url, 0.006, (t) => 0.55 * wave(t, 9, 0.1, 0.7, 4.5), -0.016);
  }
  const systems = [fx.particles, ...(fx.more ? [fx.more] : [])].map((cfg) => system(scene, cfg, dot, lowPower));
  // Flames and candles light the table; at most four lights (the strongest), so the scene stays fast.
  const [r, g, b] = rgb(fx.color);
  const lamps = (fx.lamps ?? []).filter((l) => l.kind === 'flame' || l.kind === 'candle').slice(0, 4);
  const lights = lamps.map((l, i) => {
    const at = lampToWorld(l.x, l.y);
    const candle = l.kind === 'candle';
    const light = new THREE.PointLight(new THREE.Color(r, g, b), 0, candle ? 18 : 4, 1.6);
    light.position.set(at.x, at.y, candle ? 4 : 0.6);
    scene.add(light);
    return { light, base: candle ? 6 : 3, i };
  });
  return {
    update(t, dt) {
      for (const s of systems) s.update(t, dt);
      for (const L of layers) {
        L.mesh.material.opacity = L.opacity(t);
        if (L.drift) {
          // Drift and swell inside the texture, so the layer never leaves the mat.
          const k = Math.sin(t * 0.7) * L.drift;
          const zoom = 1 + Math.abs(k) * 2.5;
          const map = L.mesh.material.map;
          if (map) {
            map.repeat.set(1 / zoom, 1 / zoom);
            map.offset.set((1 - 1 / zoom) / 2 - k, (1 - 1 / zoom) / 2 - k * 0.8);
          }
        }
      }
      for (const { light, base, i } of lights) light.intensity = base * (0.85 + Math.sin(t * 9 + i * 2) * 0.08 + Math.sin(t * 21 + i) * 0.06);
    },
    dispose() {
      systems.forEach((s) => s.dispose());
      lights.forEach(({ light }) => scene.remove(light));
      for (const L of layers) {
        scene.remove(L.mesh);
        L.mesh.geometry.dispose();
        L.mesh.material.map?.dispose();
        L.mesh.material.dispose();
      }
      dot.dispose();
    },
  };
}
