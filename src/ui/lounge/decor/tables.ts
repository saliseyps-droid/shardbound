import { MAT, MAT_ART } from '@/ui/match/table3d/tableCamera';
import * as THREE from 'three';
import { Bag, DecorContext, canvasTexture, mesh, plankTexture, rng, roundedRect, std, woodTexture } from './kit';

/** The tables: a top (the mat lies on it at z ≈ 0), an apron and four legs down to the floor (z = -9). */

export interface Built {
  root: THREE.Object3D;
  update?(t: number, dt: number): void;
  /** Clicked in the Lounge (a pet to stroke, darts to throw…): the point hit, in the room. */
  click?(at: THREE.Vector3): void;
  /** The music it plays in the Lounge now (a jukebox), or null. */
  track?(): string | null;
}

const TD = 0.7;
/** Today's turned leg (radius, depth below the top). */
const TURNED: [number, number][] = [[0.42, 0], [0.42, 0.5], [0.3, 0.8], [0.36, 1.4], [0.24, 2.4], [0.3, 4.8], [0.2, 6.4], [0.34, 7.2], [0.34, 7.8], [0, 7.8]];

function lathe(pts: [number, number][], scale = 1) {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * scale, -y)), 24);
  g.rotateX(Math.PI / 2);
  return g;
}

interface Body {
  top: THREE.Material;
  edge: THREE.Material;
  leg: THREE.Material;
  apron?: THREE.Material;
  legs?: [number, number][] | ((bag: Bag) => THREE.BufferGeometry);
}

/** The common shape: a rounded slab, an apron below it, four legs. */
function body(ctx: DecorContext, bag: Bag, b: Body) {
  const g = new THREE.Group();
  const TW = ctx.tableW;
  const TH = ctx.tableH;
  const top = mesh(new THREE.ExtrudeGeometry(roundedRect(TW, TH, 0.5), { depth: TD, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.14, bevelSegments: 4 }), [b.top, b.edge], bag);
  top.position.z = -TD - 0.12;
  const apron = mesh(new THREE.BoxGeometry(TW - 1.6, TH - 1.6, 0.9), b.apron ?? b.leg, bag, [0, 0, -TD - 0.55]);
  g.add(top, apron);
  const legGeo = typeof b.legs === 'function' ? b.legs(bag) : bag.keep(lathe(b.legs ?? TURNED));
  const legs: THREE.Mesh[] = [];
  for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const l = new THREE.Mesh(legGeo, b.leg);
    l.castShadow = true;
    l.position.set(x * (TW / 2 - 1.1), y * (TH / 2 - 1.1), -TD - 0.2);
    g.add(l);
    legs.push(l);
  }
  return { g, TW, TH, legs };
}

/** A material for the top: `map` repeats over the shape's own units (the top is about 20 × 12.6). */
const topMat = (bag: Bag, map: THREE.Texture, repeat: [number, number], p: THREE.MeshStandardMaterialParameters = {}) => {
  map.repeat.set(...repeat);
  return std(bag, { map, roughness: 0.62, metalness: 0.02, ...p });
};
const edgeMat = (bag: Bag, map: THREE.Texture, p: THREE.MeshStandardMaterialParameters = {}) => {
  map.repeat.set(0.08, 1.2);
  return std(bag, { map, roughness: 0.7, ...p });
};

export function tavern(ctx: DecorContext, bag: Bag): Built {
  const { g } = body(ctx, bag, {
    top: topMat(bag, bag.keep(plankTexture([92, 60, 36])), [1 / 12, 1 / 8]),
    edge: edgeMat(bag, bag.keep(woodTexture('#4a2f1b', '25,12,4'))),
    leg: std(bag, { map: bag.keep(woodTexture('#3a2414', '15,8,3')), roughness: 0.7 }),
  });
  return { root: g };
}

/** Obsidian with lava in its cracks: an emissive map that breathes. */
export function cinder(ctx: DecorContext, bag: Bag): Built {
  const r = rng(41);
  const cracks: [number, number][][] = Array.from({ length: 22 }, () => {
    let x = r() * 1024;
    let y = r() * 1024;
    return Array.from({ length: 6 }, () => [(x += (r() - 0.5) * 160), (y += (r() - 0.5) * 160)] as [number, number]);
  });
  const draw = (color: string, w: number, base?: string) =>
    canvasTexture(
      1024,
      1024,
      (x) => {
        x.fillStyle = base ?? '#000';
        x.fillRect(0, 0, 1024, 1024);
        if (base) {
          for (let i = 0; i < 400; i++) {
            x.fillStyle = `rgba(255,255,255,${r() * 0.04})`;
            x.fillRect(r() * 1024, r() * 1024, 20 + r() * 40, 2 + r() * 6);
          }
        }
        x.strokeStyle = color;
        x.lineWidth = w;
        x.lineJoin = 'round';
        x.shadowColor = color;
        x.shadowBlur = base ? 0 : 12;
        for (const c of cracks) {
          x.beginPath();
          c.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
          x.stroke();
        }
      },
      true,
    );
  const color = bag.keep(draw('#2a0a04', 6, '#141012'));
  const emit = bag.keep(draw('#ff7a20', 4));
  color.repeat.set(1 / 12, 1 / 12);
  emit.repeat.set(1 / 12, 1 / 12);
  const top = std(bag, { map: color, emissiveMap: emit, emissive: '#ff5a10', emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.2 });
  const rock = std(bag, { color: '#1a1416', roughness: 0.6, emissive: '#3a0c02', emissiveIntensity: 0.4 });
  const { g } = body(ctx, bag, {
    top,
    edge: rock,
    leg: rock,
    legs: (b) => {
      const geo = b.keep(new THREE.CylinderGeometry(0.75, 0.55, 7.8, 6));
      geo.rotateX(Math.PI / 2);
      geo.translate(0, 0, -3.9);
      return geo;
    },
  });
  return { root: g, update: (t) => (top.emissiveIntensity = 1.0 + Math.sin(t * 1.6) * 0.35) };
}

/** Pale bones for legs, a violet glow beneath. */
export function hollow(ctx: DecorContext, bag: Bag): Built {
  const bone = std(bag, { color: '#d8d0c0', roughness: 0.6 });
  const { g } = body(ctx, bag, {
    top: topMat(bag, bag.keep(plankTexture([40, 30, 44], 6, 81)), [1 / 12, 1 / 8], { roughness: 0.7 }),
    edge: bone,
    leg: bone,
    apron: std(bag, { color: '#2a1838', roughness: 0.8 }),
    legs: (b) => {
      const shaft = new THREE.CylinderGeometry(0.22, 0.22, 6.8, 10);
      shaft.rotateX(Math.PI / 2);
      shaft.translate(0, 0, -3.9);
      const knobs = [-0.4, -7.4].flatMap((z) =>
        [-0.2, 0.2].map((x) => {
          const s = new THREE.SphereGeometry(0.34, 12, 8);
          s.translate(x, 0, z);
          return s;
        }),
      );
      return b.keep(mergeGeometries([shaft, ...knobs]));
    },
  });
  const light = new THREE.PointLight('#a060ff', 14, 14, 1.6);
  light.position.set(0, 0, -3);
  g.add(light);
  return { root: g, update: (t) => (light.intensity = 12 + Math.sin(t * 2.2) * 4) };
}

/** Joins plain geometries (same attributes) into one, so a leg is one draw. */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  const out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv']) {
    const arrays = parts.map((p) => p.getAttribute(name) as THREE.BufferAttribute);
    const size = arrays[0].itemSize;
    const data = new Float32Array(arrays.reduce((n, a) => n + a.count * size, 0));
    let o = 0;
    for (const a of arrays) {
      data.set(a.array as Float32Array, o);
      o += a.count * size;
    }
    out.setAttribute(name, new THREE.BufferAttribute(data, size));
  }
  geos.forEach((g) => g.dispose());
  parts.forEach((p) => p.dispose());
  return out;
}

/** Slim square legs of black steel (modern tables). */
const steelLegs = (b: Bag) => {
  const geo = b.keep(new THREE.BoxGeometry(0.42, 0.42, 7.8));
  geo.translate(0, 0, -3.9);
  return geo;
};
const blackSteel = (bag: Bag) => std(bag, { color: '#16161a', metalness: 0.5, roughness: 0.35 });

/** A closed path along a rounded rectangle (w × h, corner r) at height z. */
const loopCurve = (w: number, h: number, r: number, z: number) =>
  new THREE.CatmullRomCurve3(roundedRect(w, h, r).getPoints(24).map((p) => new THREE.Vector3(p.x, p.y, z)), true, 'centripetal');

/** A glowing tube: a bright core and a wider, faint halo around it (a little bloom without post-processing). */
function neonTube(bag: Bag, curve: THREE.Curve<THREE.Vector3>, radius: number, core: THREE.Material, halo: THREE.Material, closed = true) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(bag.keep(new THREE.TubeGeometry(curve, 220, radius, 8, closed)), core));
  g.add(new THREE.Mesh(bag.keep(new THREE.TubeGeometry(curve, 220, radius * 3.2, 8, closed)), halo));
  return g;
}

/**
 * The neon table: black lacquer with a faint grid, a pink neon line framing the board, cyan strips
 * along both edges of the top, pink strips down the legs, and a cyan glow on the floor beneath. The
 * light breathes softly.
 */
export function neonTable(ctx: DecorContext, bag: Bag): Built {
  const grid = bag.keep(
    canvasTexture(
      256,
      256,
      (x) => {
        x.fillStyle = '#07070b';
        x.fillRect(0, 0, 256, 256);
        x.strokeStyle = 'rgba(120, 90, 255, 0.18)';
        x.lineWidth = 2;
        for (let i = 0; i <= 256; i += 64) {
          x.beginPath();
          x.moveTo(i, 0);
          x.lineTo(i, 256);
          x.moveTo(0, i);
          x.lineTo(256, i);
          x.stroke();
        }
      },
      true,
    ),
  );
  grid.repeat.set(1 / 3, 1 / 3);
  const lacquer = std(bag, { map: grid, color: '#ffffff', roughness: 0.08, metalness: 0.35 });
  const edge = std(bag, { color: '#09090d', roughness: 0.1, metalness: 0.4 });
  const { g, TW, TH, legs } = body(ctx, bag, { top: lacquer, edge, leg: blackSteel(bag), legs: steelLegs });
  const core = (c: string) => bag.keep(new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
  const halo = (c: string) => bag.keep(new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const cyanCore = core('#5ae6ff');
  const cyanHalo = halo('#2ac8ff');
  const pinkCore = core('#ff4ab8');
  const pinkHalo = halo('#ff2aa0');
  // Cyan strips along the top's upper and lower edges.
  g.add(neonTube(bag, loopCurve(TW + 0.4, TH + 0.4, 0.62, -0.06), 0.09, cyanCore, cyanHalo));
  g.add(neonTube(bag, loopCurve(TW + 0.4, TH + 0.4, 0.62, -0.88), 0.09, cyanCore, cyanHalo));
  // A pink line framing the board, on the top.
  g.add(neonTube(bag, loopCurve(MAT.w * MAT_ART + 1.1, MAT.h * MAT_ART + 1.1, 0.4, 0.05), 0.065, pinkCore, pinkHalo));
  // Pink strips down the outer corner of each leg (the legs are 0.42 square).
  for (const l of legs) {
    const sx = Math.sign(l.position.x);
    const sy = Math.sign(l.position.y);
    const x = l.position.x + sx * 0.3;
    const y = l.position.y + sy * 0.3;
    g.add(neonTube(bag, new THREE.LineCurve3(new THREE.Vector3(x, y, -1.2), new THREE.Vector3(x, y, -8.5)), 0.07, pinkCore, pinkHalo, false));
  }
  // A cyan glow on the floor beneath.
  const glowTex = bag.keep(
    canvasTexture(256, 256, (x) => {
      const r = x.createRadialGradient(128, 128, 10, 128, 128, 128);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.5, 'rgba(255,255,255,0.45)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = r;
      x.fillRect(0, 0, 256, 256);
    }),
  );
  const glowMat = bag.keep(new THREE.MeshBasicMaterial({ map: glowTex, color: '#2ac8ff', transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const glow = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(TW + 12, TH + 14)), glowMat);
  glow.position.z = -8.85;
  g.add(glow);
  const lights = [-TW / 4, TW / 4].map((x) => {
    const l = new THREE.PointLight('#2ac8ff', 6, 18, 1.8);
    l.position.set(x, 0, -4.5);
    g.add(l);
    return l;
  });
  return {
    root: g,
    update: (t) => {
      // The light breathes; the frame on the top a little out of step with the edges.
      const k = 0.85 + Math.sin(t * 1.4) * 0.15;
      cyanHalo.opacity = 0.22 * k;
      pinkHalo.opacity = 0.22 * (0.85 + Math.sin(t * 1.4 + 1.6) * 0.15);
      glowMat.opacity = 0.38 * k;
      lights.forEach((l) => (l.intensity = 6 * k));
    },
  };
}

export const TABLES: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  t_neon: neonTable,
  t_tavern: tavern,
  t_cinder: cinder,
  t_hollow: hollow,
};

export { mergeGeometries };
