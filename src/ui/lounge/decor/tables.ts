import * as THREE from 'three';
import { Bag, DecorContext, canvasTexture, mesh, plankTexture, rng, roundedRect, std, woodTexture } from './kit';

/** The tables: a top (the mat lies on it at z ≈ 0), an apron and four legs down to the floor (z = -9). */

export interface Built {
  root: THREE.Object3D;
  update?(t: number, dt: number): void;
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

/** Black lacquer on steel, an LED strip around the edge that lights the floor beneath. */
export function neonTable(ctx: DecorContext, bag: Bag): Built {
  const lacquer = std(bag, { color: '#0e0e12', roughness: 0.12, metalness: 0.3 });
  const { g, TW, TH } = body(ctx, bag, { top: lacquer, edge: lacquer, leg: blackSteel(bag), legs: steelLegs });
  // The strip: a glowing line just under the top's edge, all the way round.
  const a = TW / 2 + 0.16;
  const b = TH / 2 + 0.16;
  const path = new THREE.CurvePath<THREE.Vector3>();
  const corners = [[-a, -b], [a, -b], [a, b], [-a, b], [-a, -b]];
  for (let i = 1; i < corners.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(corners[i - 1][0], corners[i - 1][1], -0.55), new THREE.Vector3(corners[i][0], corners[i][1], -0.55)));
  const strip = new THREE.Mesh(bag.keep(new THREE.TubeGeometry(path, 64, 0.07, 6, true)), bag.keep(new THREE.MeshBasicMaterial({ color: '#6ae8ff', toneMapped: false })));
  g.add(strip);
  for (const x of [-TW / 4, TW / 4]) {
    const l = new THREE.PointLight('#3ad8ff', 6, 16, 1.8);
    l.position.set(x, 0, -4);
    g.add(l);
  }
  return { root: g };
}

export const TABLES: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  t_neon: neonTable,
  t_tavern: tavern,
  t_cinder: cinder,
  t_hollow: hollow,
};

export { mergeGeometries };
