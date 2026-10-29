import * as THREE from 'three';
import { Bag, DecorContext, canvasTexture, mesh, plankTexture, rng, std, woodTexture } from './kit';
import { scanned } from './surfaces';
import type { Built } from './tables';

/**
 * Tables of other shapes: an oval card table, an octagon, a long hexagon, a stone altar and a trestle
 * table. Each top still holds the whole board and both small things on the table (at
 * x ≈ ±11): the shapes are sized from the ordinary table's (ctx.tableW × ctx.tableH, about 26 × 12.6).
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const TD = 0.7;
/** The top's underside, where legs and pedestals start. */
const UNDER = -TD - 0.2;

/** A stadium: a rectangle with round ends, w × h. */
function stadium(w: number, h: number) {
  const r = h / 2;
  const c = w / 2 - r;
  const s = new THREE.Shape();
  s.moveTo(-c, -r);
  s.lineTo(c, -r);
  s.absarc(c, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-c, r);
  s.absarc(-c, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  return s;
}

const polygon = (pts: [number, number][]) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));

/** A rectangle with its corners cut off (c deep). */
const octagon = (w: number, h: number, c: number) => {
  const a = w / 2;
  const b = h / 2;
  return polygon([[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]]);
};

/** A long hexagon: flat along the long sides, pointed at the ends. */
const hexagon = (w: number, h: number, point: number) => {
  const a = w / 2;
  const b = h / 2;
  return polygon([[-a + point, -b], [a - point, -b], [a, 0], [a - point, b], [-a + point, b], [-a, 0]]);
};

/** The same outline, shrunk towards the middle (by `by` on every side, roughly). */
function inset(shape: THREE.Shape, w: number, h: number, by: number) {
  const kx = (w - 2 * by) / w;
  const ky = (h - 2 * by) / h;
  return new THREE.Shape(shape.getPoints(48).map((p) => new THREE.Vector2(p.x * kx, p.y * ky)));
}

/** A closed curve along the outline at height z (for a rail). */
const outlineCurve = (shape: THREE.Shape, z: number) =>
  new THREE.CatmullRomCurve3(shape.getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, z)), true, 'centripetal');

/** The top (its upper face at z ≈ 0) and, unless `apron` is null, a skirt beneath it. */
function top(bag: Bag, shape: THREE.Shape, w: number, h: number, face: THREE.Material, edge: THREE.Material, apron: THREE.Material | null, thick = TD) {
  const g = new THREE.Group();
  const t = mesh(new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.14, bevelSegments: 4, curveSegments: 48 }), [face, edge], bag);
  t.position.z = -thick - 0.12;
  g.add(t);
  if (apron) g.add(mesh(new THREE.ExtrudeGeometry(inset(shape, w, h, 0.9), { depth: 0.9, bevelEnabled: false, curveSegments: 48 }), apron, bag, [0, 0, -thick - 1.05]));
  return g;
}

/** A lathe turned about z, hanging down from the top's underside: [radius, depth below it]. */
function turned(bag: Bag, pts: [number, number][], segments = 32) {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, -y)), segments);
  g.rotateX(Math.PI / 2);
  return bag.keep(g);
}

function placeAll(g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, at: [number, number][]) {
  for (const [x, y] of at) {
    const l = new THREE.Mesh(geo, mat);
    l.castShadow = l.receiveShadow = true;
    l.position.set(x, y, UNDER);
    g.add(l);
  }
}

/** A tapered square leg of a given thickness, down to the floor. */
function squareLeg(bag: Bag, w: number, foot = w * 0.7) {
  const geo = new THREE.CylinderGeometry(foot / Math.SQRT2, w / Math.SQRT2, 8.1, 4, 1);
  geo.rotateY(Math.PI / 4);
  geo.rotateX(Math.PI / 2);
  geo.translate(0, 0, -4.05);
  return bag.keep(geo);
}

/** A pedestal: a thick turned column on a wide foot. */
const PEDESTAL: [number, number][] = [[1.5, 0], [1.5, 0.3], [0.9, 0.7], [0.7, 1.6], [0.95, 3.6], [0.6, 5.6], [1.1, 6.9], [2.8, 7.7], [2.9, 8.1], [0, 8.1]];

/** Green baize: fine noise over a deep green. */
const baize = (bag: Bag, color: string) =>
  bag.keep(
    canvasTexture(
      512,
      512,
      (x, w, h) => {
        x.fillStyle = color;
        x.fillRect(0, 0, w, h);
        const r = rng(17);
        for (let i = 0; i < 9000; i++) {
          x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.06)';
          x.fillRect(r() * w, r() * h, 1.5, 1.5);
        }
      },
      true,
    ),
  );

/** The card table: an oval of green baize inside a padded black rail, on two pedestals. */
const poker: Make = (ctx, bag) => {
  const w = ctx.tableW + 3;
  const h = ctx.tableH + 3;
  const shape = stadium(w, h);
  const felt = baize(bag, '#1f5a34');
  felt.repeat.set(1 / 6, 1 / 6);
  const wood = std(bag, { map: bag.keep(woodTexture('#3a2414', '15,8,3')), roughness: 0.55 });
  const g = top(bag, shape, w, h, std(bag, { map: felt, roughness: 0.95 }), wood, wood);
  const rail = new THREE.Mesh(bag.keep(new THREE.TubeGeometry(outlineCurve(inset(shape, w, h, 0.55), 0.12), 200, 0.55, 12, true)), std(bag, { color: '#141214', roughness: 0.42 }));
  rail.castShadow = true;
  g.add(rail);
  // A thin brass line inside the rail.
  g.add(new THREE.Mesh(bag.keep(new THREE.TubeGeometry(outlineCurve(inset(shape, w, h, 1.35), 0.02), 200, 0.06, 6, true)), std(bag, { color: '#c8a050', metalness: 0.5, roughness: 0.3 })));
  const c = w / 2 - h / 2;
  placeAll(g, turned(bag, PEDESTAL), wood, [[-c, 0], [c, 0]]);
  return { root: g };
};

/** White marble cut into an octagon, a brass band round it, four slim brass legs. */
const octagonTable: Make = (ctx, bag) => {
  const w = ctx.tableW + 1;
  const h = ctx.tableH + 1.6;
  const brass = std(bag, { color: '#b8903e', metalness: 0.5, roughness: 0.28 });
  const marble = scanned(bag, 'marble_01', 1 / 18, 1 / 18, { roughness: 0.25 });
  const g = top(bag, octagon(w, h, 3.4), w, h, marble, brass, brass, 0.6);
  placeAll(g, squareLeg(bag, 0.6, 0.35), brass, [[-w / 2 + 3, -h / 2 + 1.6], [w / 2 - 3, -h / 2 + 1.6], [w / 2 - 3, h / 2 - 1.6], [-w / 2 + 3, h / 2 - 1.6]]);
  return { root: g };
};

/** Dark slate, a long hexagon with gold runes along its edge that glow faintly; stone block legs. */
const runeTable: Make = (ctx, bag) => {
  const w = ctx.tableW + 6;
  const h = ctx.tableH + 1.4;
  const point = 5;
  const shape = hexagon(w, h, point);
  const draw = (glowOnly: boolean) =>
    canvasTexture(2048, 1024, (x, cw, ch) => {
      x.fillStyle = glowOnly ? '#000' : '#26262c';
      x.fillRect(0, 0, cw, ch);
      if (!glowOnly) {
        const r = rng(5);
        for (let i = 0; i < 3000; i++) {
          x.fillStyle = `rgba(255,255,255,${r() * 0.03})`;
          x.fillRect(r() * cw, r() * ch, 2 + r() * 8, 1 + r() * 3);
        }
      }
      // Runes in a band just inside the edge: small strokes along the outline.
      const sx = cw / w;
      const sy = ch / h;
      // Evenly along the whole outline: the path is closed back to its first corner first.
      const ring = inset(shape, w, h, 1.1).getPoints();
      const inner = new THREE.Path([...ring, ring[0]]).getSpacedPoints(96);
      const r2 = rng(9);
      x.strokeStyle = glowOnly ? '#ffffff' : '#c8a050';
      x.lineWidth = 3;
      x.lineCap = 'round';
      for (const p of inner) {
        const cx = (p.x + w / 2) * sx;
        const cy = (h / 2 - p.y) * sy;
        x.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = r2() * Math.PI * 2;
          const l = 10 + r2() * 12;
          x.moveTo(cx, cy);
          x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l);
        }
        x.stroke();
      }
    });
  const color = bag.keep(draw(false));
  const glowMap = bag.keep(draw(true));
  for (const t of [color, glowMap]) {
    t.repeat.set(1 / w, 1 / h);
    t.offset.set(0.5, 0.5);
  }
  const face = std(bag, { map: color, emissiveMap: glowMap, emissive: '#ffb84a', emissiveIntensity: 0.5, roughness: 0.55 });
  const stone = scanned(bag, 'slate_floor_02', 1 / 24, 1 / 24, {}, '#6a6a72');
  const g = top(bag, shape, w, h, face, stone, null, 0.9);
  const block = bag.keep(new THREE.BoxGeometry(2.2, h - 3, 8.1));
  block.translate(0, 0, -4.05);
  placeAll(g, block, stone, [[-w / 2 + point + 1.5, 0], [w / 2 - point - 1.5, 0]]);
  return { root: g, update: (t) => (face.emissiveIntensity = 0.45 + Math.sin(t * 1.3) * 0.15) };
};

/** A stone altar: a thick slab on a solid carved plinth and a step, no legs. */
const altar: Make = (ctx, bag) => {
  const w = ctx.tableW + 0.6;
  const h = ctx.tableH + 0.6;
  const stone = scanned(bag, 'large_sandstone_blocks_01', 1 / 36, 1 / 36, {}, '#8a8070');
  const slab = scanned(bag, 'large_sandstone_blocks_01', 1 / 36, 1 / 36, { roughness: 0.7 }, '#a89a84');
  const g = top(bag, polygon([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]), w, h, slab, stone, null, 1.3);
  const plinthH = 9 - 1.5 - 1.2;
  g.add(mesh(new THREE.BoxGeometry(w - 4, h - 3, plinthH), stone, bag, [0, 0, -1.5 - plinthH / 2]));
  g.add(mesh(new THREE.BoxGeometry(w - 1.6, h - 1, 1.2), stone, bag, [0, 0, -9 + 0.6]));
  // A carved panel on the long sides: a sunken frame with a gold sigil.
  const sigil = bag.keep(
    canvasTexture(512, 256, (x, cw, ch) => {
      x.fillStyle = '#5a5244';
      x.fillRect(0, 0, cw, ch);
      x.strokeStyle = '#2a2620';
      x.lineWidth = 10;
      x.strokeRect(14, 14, cw - 28, ch - 28);
      x.strokeStyle = '#c8a050';
      x.lineWidth = 6;
      x.beginPath();
      x.arc(cw / 2, ch / 2, ch * 0.28, 0, Math.PI * 2);
      x.moveTo(cw / 2, ch * 0.12);
      x.lineTo(cw / 2, ch * 0.88);
      x.moveTo(cw / 2 - ch * 0.36, ch / 2);
      x.lineTo(cw / 2 + ch * 0.36, ch / 2);
      x.stroke();
    }),
  );
  const panel = std(bag, { map: sigil, roughness: 0.8, emissive: '#3a2a08', emissiveIntensity: 0.3 });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(w - 9, plinthH - 1.6)), panel);
    p.rotation.set(Math.PI / 2, s < 0 ? 0 : Math.PI, 0);
    p.position.set(0, s * ((h - 3) / 2 + 0.02), -1.5 - plinthH / 2);
    g.add(p);
  }
  return { root: g };
};

/** A worn trestle table: thick planks on two crossed trestles at either end. */
const trestle: Make = (ctx, bag) => {
  const w = ctx.tableW + 1;
  const h = ctx.tableH;
  const planks = std(bag, { map: bag.keep(plankTexture([84, 56, 34], 5, 33)), roughness: 0.75 });
  planks.map!.repeat.set(1 / 12, 1 / 8);
  const wood = std(bag, { map: bag.keep(woodTexture('#3a2414', '15,8,3')), roughness: 0.75 });
  const g = top(bag, polygon([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]), w, h, planks, wood, null, 1);
  const beam = bag.keep(new THREE.BoxGeometry(0.9, 0.9, 10.2));
  for (const x of [-w / 2 + 3.2, w / 2 - 3.2]) {
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(beam, wood);
      b.castShadow = true;
      b.position.set(x, 0, -5.2);
      b.rotation.x = s * 0.62;
      g.add(b);
    }
  }
  // A stretcher between the trestles, low down.
  g.add(mesh(new THREE.BoxGeometry(w - 6.4, 0.8, 0.8), wood, bag, [0, 0, -6.2]));
  return { root: g };
};

export const SHAPED_TABLES: Record<string, Make> = {
  t_poker: poker,
  t_octagon: octagonTable,
  t_rune: runeTable,
  t_altar: altar,
  t_trestle: trestle,
};
