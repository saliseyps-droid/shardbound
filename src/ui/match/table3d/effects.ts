import * as THREE from 'three';
import type { Fx } from '@/state/matchStore';
import { MAT } from './tableCamera';
import { fxAnchor, fxBurst, fxLabel } from './effectRules';

/**
 * The 3D table's effects (WebGL), driven by the match store's fx list: sparks, motes and a flash of
 * light at every hit, heal or status, the numbers floating up facing the camera, a shattering card
 * when a unit dies, a card back flying from a deck towards the hand, and a small camera shake on
 * heavy hits. Bodies (bodies.ts) call `shatter` and `flyCard`; TableView adds `shake()` to the camera.
 * Everything but the flashes lives in its own `scene`, drawn on a canvas above the table's DOM (so a
 * Warden's portrait or a card in the way never hides it); the flashes light the table itself.
 */
export interface Effects {
  scene: THREE.Scene;
  /** `lastAt`: where a unit last stood on the table (bodies.ts), for hits that killed it. */
  update(plane: HTMLElement, toMat: (x: number, y: number) => THREE.Vector3 | null, fx: Fx[], dt: number, lastAt?: (key: string) => THREE.Vector3 | undefined): void;
  shatter(map: THREE.Texture | null, w: number, h: number, at: THREE.Vector3): void;
  flyCard(map: THREE.Texture, w: number, from: THREE.Vector3, to: THREE.Vector3, delay?: number): void;
  /** The current camera shake offset (world units). */
  shake(): THREE.Vector2;
  dispose(): void;
}

const MAX = 1600;

interface Particle { p: THREE.Vector3; v: THREE.Vector3; c: THREE.Color; life: number; max: number; grav: number }
/** `wait`: seconds before it starts (hidden until then), so several drawn cards fly one after another. */
interface Piece { m: THREE.Mesh; v: THREE.Vector3; spin: THREE.Vector3; life: number; max: number; grav: number; fadeFrom: number; wait?: number }

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.3, 'rgba(255,255,255,.5)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function labelTexture(text: string, color: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.font = '800 92px "Cinzel", "Georgia", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 12;
  g.strokeStyle = 'rgba(10,6,16,.9)';
  g.strokeText(text, 128, 68);
  g.fillStyle = color;
  g.fillText(text, 128, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const LABEL_COLOR: Partial<Record<Fx['kind'], string>> = { damage: '#ff6b5a', heal: '#7ef29a', armor: '#d8e2f0', buff: '#ffd36a' };

export function createEffects(table: THREE.Scene): Effects {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff2dd, 0x2a2030, 1.4));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2);
  sun.position.set(-5, -6, 12);
  scene.add(sun);
  const glow = glowTexture();

  // Particles: one additive point cloud; a particle fades by darkening its colour.
  const pos = new Float32Array(MAX * 3);
  const col = new Float32Array(MAX * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.3, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  points.frustumCulled = false;
  points.renderOrder = 5;
  scene.add(points);
  const particles: Particle[] = [];

  // Flashes: a few point lights kept in the scene (adding lights would recompile every material).
  const lights = Array.from({ length: 4 }, () => {
    const l = new THREE.PointLight(0xffffff, 0, 5, 1.6);
    table.add(l);
    return { l, life: 0 };
  });
  let nextLight = 0;
  const flash = (at: THREE.Vector3, color: string, strength: number) => {
    const f = lights[nextLight++ % lights.length];
    f.l.color.set(color);
    f.l.position.set(at.x, at.y, at.z + 0.8);
    f.l.userData.peak = strength;
    f.life = 1;
  };

  const labels: { s: THREE.Sprite; life: number; base: THREE.Vector3 }[] = [];
  const pieces: Piece[] = [];
  const shakeOff = new THREE.Vector2();
  let shakeAmt = 0;
  let shakeT = 0;
  const seen = new Set<number>();

  const spawn = (at: THREE.Vector3, kind: Fx['kind'], amount: number | undefined, onHero: boolean, spread: number, label = true) => {
    const b = fxBurst(kind, amount, onHero);
    const c1 = new THREE.Color(b.color);
    const c2 = new THREE.Color(b.accent);
    for (let i = 0; i < b.count && particles.length < MAX; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = new THREE.Vector3();
      const p = at.clone();
      if (b.motion === 'burst') {
        const s = 1.2 + Math.random() * 2.2;
        v.set(Math.cos(a) * s, Math.sin(a) * s, 1 + Math.random() * 2.5);
      } else if (b.motion === 'rise') {
        p.x += (Math.random() - 0.5) * spread;
        p.y += (Math.random() - 0.5) * spread;
        v.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0.6 + Math.random() * 0.9);
      } else {
        const s = 1.4 + Math.random() * 0.6;
        p.z = MAT.top + 0.03;
        v.set(Math.cos(a) * s, Math.sin(a) * s, 0.1 + Math.random() * 0.3);
      }
      const max = b.motion === 'rise' ? 1 + Math.random() * 0.7 : 0.7 + Math.random() * 0.6;
      particles.push({ p, v, c: (Math.random() < 0.3 ? c2 : c1).clone(), life: max, max, grav: b.motion === 'burst' ? -7 : b.motion === 'rise' ? 0.3 : -0.5 });
    }
    flash(at, b.color, kind === 'damage' ? 6 + Math.min(10, (amount ?? 0) * 1.5) : 4);
    if (b.shake > shakeAmt) {
      shakeAmt = b.shake;
      shakeT = 0;
    }
    const text = label ? fxLabel(kind, amount) : '';
    if (text) {
      const mat = new THREE.SpriteMaterial({ map: labelTexture(text, LABEL_COLOR[kind] ?? '#ffffff'), transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
      const s = new THREE.Sprite(mat);
      s.scale.set(1.5, 0.75, 1);
      s.renderOrder = 10;
      scene.add(s);
      labels.push({ s, life: 1.2, base: at.clone() });
    }
  };

  // A shard's edges and back: gold rim, the violet of a card back.
  const rim = new THREE.MeshStandardMaterial({ color: 0xd9a63a, metalness: 0.9, roughness: 0.3, transparent: true });
  const back = new THREE.MeshStandardMaterial({ color: 0x2a1d4a, roughness: 0.6, transparent: true });
  const matsOf = (m: THREE.Mesh) => [...new Set(Array.isArray(m.material) ? m.material : [m.material])] as THREE.MeshStandardMaterial[];
  const dropPiece = (pc: Piece) => {
    scene.remove(pc.m);
    pc.m.geometry.dispose();
    for (const m of matsOf(pc.m)) {
      m.map?.dispose();
      m.dispose();
    }
  };

  return {
    update(plane, toMat, fx, dt, lastAt) {
      // New effects in the store: a burst where their target stands.
      for (const f of fx) {
        if (seen.has(f.id)) continue;
        seen.add(f.id);
        const el = plane.querySelector<HTMLElement>(`[data-entity="${f.target}"]`);
        const r = el?.getBoundingClientRect();
        const at = fxAnchor(r ? toMat(r.left + r.width / 2, r.top + r.height / 2) : null, lastAt?.(f.target)?.clone());
        if (!at) continue;
        at.z = MAT.top + 0.3;
        spawn(at, f.kind, f.amount, f.target.startsWith('h:'), ((el?.offsetWidth ?? 150) / 1600) * MAT.w * 0.8);
      }
      if (seen.size > 400) for (const id of [...seen].slice(0, 200)) seen.delete(id);

      // Particles.
      let n = 0;
      for (let i = particles.length - 1; i >= 0; i--) {
        const q = particles[i];
        q.life -= dt;
        if (q.life <= 0) {
          // Swap-remove: order doesn't matter, and splicing a long list every frame is slow.
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        q.v.z += q.grav * dt;
        q.v.multiplyScalar(1 - dt * 1.2);
        q.p.addScaledVector(q.v, dt);
        if (q.p.z < MAT.top + 0.02) {
          q.p.z = MAT.top + 0.02;
          q.v.z *= -0.3;
        }
      }
      for (const q of particles) {
        const k = q.life / q.max;
        pos[n * 3] = q.p.x;
        pos[n * 3 + 1] = q.p.y;
        pos[n * 3 + 2] = q.p.z;
        col[n * 3] = q.c.r * k * 2.4;
        col[n * 3 + 1] = q.c.g * k * 2.4;
        col[n * 3 + 2] = q.c.b * k * 2.4;
        n++;
      }
      geo.setDrawRange(0, n);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      for (const f of lights) {
        f.life = Math.max(0, f.life - dt * 2.6);
        f.l.intensity = (f.l.userData.peak ?? 0) * f.life * f.life;
      }

      for (let i = labels.length - 1; i >= 0; i--) {
        const L = labels[i];
        L.life -= dt;
        const age = 1.2 - L.life;
        L.s.position.set(L.base.x, L.base.y, L.base.z + 0.5 + age * 0.55);
        const pop = Math.min(1, age * 8);
        L.s.scale.set(1.5 * pop, 0.75 * pop, 1);
        (L.s.material as THREE.SpriteMaterial).opacity = Math.min(1, L.life * 2.5);
        if (L.life <= 0) {
          scene.remove(L.s);
          (L.s.material as THREE.SpriteMaterial).map?.dispose();
          L.s.material.dispose();
          labels.splice(i, 1);
        }
      }

      for (let i = pieces.length - 1; i >= 0; i--) {
        const pc = pieces[i];
        if (pc.wait) {
          pc.wait = Math.max(0, pc.wait - dt);
          pc.m.visible = pc.wait === 0;
          continue;
        }
        pc.life -= dt;
        pc.v.z += pc.grav * dt;
        pc.m.position.addScaledVector(pc.v, dt);
        pc.m.rotation.x += pc.spin.x * dt;
        pc.m.rotation.y += pc.spin.y * dt;
        pc.m.rotation.z += pc.spin.z * dt;
        const fade = Math.min(1, pc.life / pc.fadeFrom);
        for (const m of matsOf(pc.m)) m.opacity = fade;
        if (pc.life <= 0) {
          dropPiece(pc);
          pieces.splice(i, 1);
        }
      }

      // Shake: a quick decaying tremble.
      shakeT += dt;
      shakeAmt = Math.max(0, shakeAmt - dt * 2.2);
      const s = shakeAmt * shakeAmt * 0.09;
      shakeOff.set(Math.sin(shakeT * 61) * s, Math.cos(shakeT * 53) * s);
    },

    shatter(map, w, h, at) {
      // The card breaks into a 3×4 grid of pieces that fly apart, tumble and fade.
      const cols = 3;
      const rows = 4;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          const pw = w / cols;
          const ph = h / rows;
          let tex: THREE.Texture | null = null;
          if (map) {
            tex = map.clone();
            tex.repeat.set(map.repeat.x / cols, map.repeat.y / rows);
            tex.offset.set(map.offset.x + (map.repeat.x * i) / cols, map.offset.y + (map.repeat.y * j) / rows);
            tex.needsUpdate = true;
          }
          // Each shard gets its own edge/back materials, so it can fade on its own.
          const face = new THREE.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : 0x3a2a50, roughness: 0.5, transparent: true });
          const edge = rim.clone();
          const m = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.96, ph * 0.96, 0.05), [edge, edge, edge, edge, face, back.clone()]);
          const cx = (i + 0.5) / cols - 0.5;
          const cy = (j + 0.5) / rows - 0.5;
          m.position.set(at.x + cx * w, at.y + cy * h, at.z + 0.05);
          m.castShadow = true;
          scene.add(m);
          const out = new THREE.Vector3(cx, cy, 0).normalize().multiplyScalar(1.2 + Math.random() * 1.4);
          pieces.push({ m, v: new THREE.Vector3(out.x, out.y, 1.6 + Math.random() * 1.6), spin: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6), life: 1, max: 1, grav: -7, fadeFrom: 0.5 });
        }
      spawn(at, 'shield', undefined, false, w, false);
    },

    flyCard(map, w, from, to, delay = 0) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, w * 1.4, 0.035), new THREE.MeshStandardMaterial({ map: map.clone(), roughness: 0.5, transparent: true }));
      m.position.copy(from);
      m.castShadow = true;
      scene.add(m);
      const t = 0.55;
      // A lob: reaches the target in time t; the extra lift cancels the gravity (−12) over t.
      const v = to.clone().sub(from).divideScalar(t);
      v.z += 6 * t;
      m.visible = delay === 0;
      pieces.push({ m, v, spin: new THREE.Vector3(-1.2, 0, (Math.random() - 0.5) * 1.5), life: t, max: t, grav: -12, fadeFrom: 0.2, wait: delay });
    },

    scene,
    shake: () => shakeOff,

    dispose() {
      [...pieces].forEach(dropPiece);
      rim.dispose();
      back.dispose();
      labels.forEach((L) => ((L.s.material as THREE.SpriteMaterial).map?.dispose(), L.s.material.dispose()));
      geo.dispose();
      (points.material as THREE.Material).dispose();
      glow.dispose();
    },
  };
}
