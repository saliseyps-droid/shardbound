import * as THREE from 'three';
import { Bag, DecorContext, PER_METRE, canvasTexture, marbleTexture, mesh, plankTexture, rng, roundedRect, std, woodTexture } from './kit';
import { scanned } from './surfaces';

/** The tables: a top (the mat lies on it at z ≈ 0), an apron and four legs down to the floor (z = -9). */

export interface Built {
  root: THREE.Object3D;
  update?(t: number, dt: number): void;
}

const TD = 0.7;
/** Today's turned leg (radius, depth below the top). */
const TURNED: [number, number][] = [[0.42, 0], [0.42, 0.5], [0.3, 0.8], [0.36, 1.4], [0.24, 2.4], [0.3, 4.8], [0.2, 6.4], [0.34, 7.2], [0.34, 7.8], [0, 7.8]];
const COLUMN: [number, number][] = [[0.55, 0], [0.55, 0.35], [0.36, 0.5], [0.36, 7.1], [0.55, 7.3], [0.55, 7.8], [0, 7.8]];
const LION: [number, number][] = [[0.5, 0], [0.5, 0.4], [0.32, 0.7], [0.44, 1.6], [0.26, 3], [0.34, 5], [0.22, 6.2], [0.5, 7.0], [0.62, 7.6], [0.5, 7.8], [0, 7.8]];

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

export function darkOak(ctx: DecorContext, bag: Bag): Built {
  const brass = std(bag, { color: '#c89a3a', metalness: 0.85, roughness: 0.3 });
  const { g, TW, TH } = body(ctx, bag, {
    top: topMat(bag, bag.keep(plankTexture([44, 30, 22], 5, 21)), [1 / 12, 1 / 8], { roughness: 0.45 }),
    edge: edgeMat(bag, bag.keep(woodTexture('#24160e', '8,4,2', 21)), { roughness: 0.5 }),
    leg: std(bag, { map: bag.keep(woodTexture('#1e120a', '6,3,1', 22)), roughness: 0.55 }),
  });
  // Brass corner caps over the rim.
  const cap = bag.keep(new THREE.BoxGeometry(1.2, 1.2, 0.16));
  for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const c = new THREE.Mesh(cap, brass);
    c.position.set(x * (TW / 2 - 0.45), y * (TH / 2 - 0.45), 0.02);
    g.add(c);
  }
  return { root: g };
}

export function marble(ctx: DecorContext, bag: Bag): Built {
  const tex = bag.keep(marbleTexture('#ece6dc', '#b8b0a4', '#c9a24a'));
  const { g } = body(ctx, bag, {
    top: topMat(bag, tex, [1 / 10, 1 / 10], { roughness: 0.25, metalness: 0.05 }),
    edge: std(bag, { map: bag.keep(marbleTexture('#e4ddd2', '#b0a89c', undefined, 12)), roughness: 0.3 }),
    leg: std(bag, { color: '#e8e2d8', roughness: 0.35 }),
    apron: std(bag, { color: '#c9a24a', metalness: 0.8, roughness: 0.3 }),
    legs: COLUMN,
  });
  return { root: g };
}

export function royal(ctx: DecorContext, bag: Bag): Built {
  const velvet = bag.keep(
    canvasTexture(512, 512, (x) => {
      x.fillStyle = '#6a0c16';
      x.fillRect(0, 0, 512, 512);
      x.strokeStyle = '#d9aa3a';
      x.lineWidth = 6;
      x.strokeRect(14, 14, 484, 484);
      x.lineWidth = 2;
      x.strokeRect(30, 30, 452, 452);
      // Fleurs at the corners of the inlay.
      x.fillStyle = '#d9aa3a';
      for (const [cx, cy] of [[30, 30], [482, 30], [482, 482], [30, 482]]) {
        x.beginPath();
        x.arc(cx, cy, 9, 0, Math.PI * 2);
        x.fill();
      }
    }),
  );
  velvet.repeat.set(1 / ctx.tableW, 1 / ctx.tableH);
  velvet.offset.set(0.5, 0.5);
  const gold = std(bag, { color: '#d9aa3a', metalness: 0.9, roughness: 0.28 });
  const { g } = body(ctx, bag, {
    top: std(bag, { map: velvet, roughness: 0.9 }),
    edge: gold,
    leg: std(bag, { map: bag.keep(woodTexture('#5a2a14', '30,10,4', 31)), roughness: 0.45 }),
    apron: gold,
    legs: LION,
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

/** Living roots: the legs are twisted root tubes; moss creeps over the rim. */
export function thorn(ctx: DecorContext, bag: Bag): Built {
  const bark = std(bag, { map: bag.keep(woodTexture('#4a3218', '20,12,4', 51)), roughness: 0.9 });
  const moss = bag.keep(
    canvasTexture(
      256,
      256,
      (x) => {
        const r = rng(52);
        x.fillStyle = '#3a5a20';
        x.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 600; i++) {
          x.fillStyle = `rgba(${90 + r() * 60},${130 + r() * 60},${40 + r() * 30},.5)`;
          x.beginPath();
          x.arc(r() * 256, r() * 256, 1 + r() * 3, 0, Math.PI * 2);
          x.fill();
        }
      },
      true,
    ),
  );
  moss.repeat.set(0.5, 0.5);
  const { g } = body(ctx, bag, {
    top: topMat(bag, bag.keep(plankTexture([84, 62, 34], 7, 53)), [1 / 12, 1 / 8], { roughness: 0.8 }),
    edge: std(bag, { map: moss, roughness: 1 }),
    leg: bark,
    legs: (b) => {
      // Three roots twisting round each other, flaring at the foot.
      const geos: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 3; k++) {
        const pts = Array.from({ length: 12 }, (_, i) => {
          const d = i / 11;
          const a = k * ((Math.PI * 2) / 3) + d * 3.2;
          const rr = 0.18 + (d > 0.8 ? (d - 0.8) * 4 : 0);
          return new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, -d * 7.8);
        });
        geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.17, 6));
      }
      return b.keep(mergeGeometries(geos));
    },
  });
  return { root: g };
}

/** Brass plates with rivets; gears turn on the long sides. */
export function brass(ctx: DecorContext, bag: Bag): Built {
  const plate = bag.keep(
    canvasTexture(
      512,
      512,
      (x) => {
        x.fillStyle = '#a8742a';
        x.fillRect(0, 0, 512, 512);
        x.strokeStyle = 'rgba(60,36,10,.8)';
        x.lineWidth = 4;
        for (let i = 0; i <= 512; i += 128) {
          x.beginPath();
          x.moveTo(i, 0);
          x.lineTo(i, 512);
          x.moveTo(0, i);
          x.lineTo(512, i);
          x.stroke();
        }
        x.fillStyle = '#f0d08a';
        for (let i = 0; i < 512; i += 128)
          for (let j = 0; j < 512; j += 128)
            for (const [dx, dy] of [[12, 12], [116, 12], [12, 116], [116, 116]]) {
              x.beginPath();
              x.arc(i + dx, j + dy, 5, 0, Math.PI * 2);
              x.fill();
            }
      },
      true,
    ),
  );
  const metal = std(bag, { color: '#8a5a20', metalness: 0.9, roughness: 0.35 });
  const { g, TW, TH } = body(ctx, bag, {
    top: topMat(bag, plate, [1 / 6, 1 / 6], { metalness: 0.75, roughness: 0.35 }),
    edge: metal,
    leg: metal,
    legs: (b) => {
      const geo = b.keep(new THREE.CylinderGeometry(0.32, 0.42, 7.8, 8));
      geo.rotateX(Math.PI / 2);
      geo.translate(0, 0, -3.9);
      return geo;
    },
  });
  const gearMat = std(bag, { color: '#d0a050', metalness: 0.95, roughness: 0.25 });
  const gears: THREE.Mesh[] = [];
  const gearGeo = (r: number) => {
    const s = new THREE.Shape();
    const teeth = Math.round(r * 10);
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const rr = i % 2 ? r : r * 1.18;
      if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const geo = bag.keep(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false }));
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  for (const side of [-1, 1])
    for (const [x, r] of [[-TW * 0.25, 0.9], [-TW * 0.25 + 1.6, 0.6], [TW * 0.2, 1.1]] as [number, number][]) {
      const m = new THREE.Mesh(gearGeo(r), gearMat);
      m.position.set(x, side * (TH / 2 - 0.75), -1.35);
      m.userData.speed = (r === 0.6 ? -1.5 : 1) * side;
      g.add(m);
      gears.push(m);
    }
  return { root: g, update: (t) => gears.forEach((m) => (m.rotation.y = t * 0.6 * m.userData.speed)) };
}

/** A slab of blue ice, crystal legs. */
export function rime(ctx: DecorContext, bag: Bag): Built {
  const ice = bag.keep(
    canvasTexture(
      512,
      512,
      (x) => {
        const r = rng(61);
        const gr = x.createLinearGradient(0, 0, 512, 512);
        gr.addColorStop(0, '#bfe8ff');
        gr.addColorStop(0.5, '#6ab0e0');
        gr.addColorStop(1, '#3a7ab0');
        x.fillStyle = gr;
        x.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 90; i++) {
          x.strokeStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`;
          x.lineWidth = 1;
          x.beginPath();
          x.arc(r() * 512, r() * 512, 1 + r() * 5, 0, Math.PI * 2);
          x.stroke();
        }
        for (let i = 0; i < 14; i++) {
          x.strokeStyle = 'rgba(255,255,255,.35)';
          x.beginPath();
          x.moveTo(r() * 512, r() * 512);
          x.lineTo(r() * 512, r() * 512);
          x.stroke();
        }
      },
      true,
    ),
  );
  const crystal = std(bag, { color: '#a8dcff', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.85, emissive: '#2a6a9a', emissiveIntensity: 0.3 });
  const { g } = body(ctx, bag, {
    top: topMat(bag, ice, [1 / 10, 1 / 10], { roughness: 0.08, metalness: 0.1 }),
    edge: crystal,
    leg: crystal,
    apron: std(bag, { color: '#5a98c8', roughness: 0.2 }),
    legs: (b) => {
      const geo = b.keep(new THREE.CylinderGeometry(0.15, 0.7, 7.8, 5));
      geo.rotateX(Math.PI / 2);
      geo.translate(0, 0, -3.9);
      return geo;
    },
  });
  return { root: g };
}

/** White stone with golden runes that glow and fade. */
export function lumen(ctx: DecorContext, bag: Bag): Built {
  const runes = (bright: boolean) =>
    canvasTexture(
      1024,
      1024,
      (x) => {
        const r = rng(71);
        x.fillStyle = bright ? '#000' : '#e6dfcc';
        x.fillRect(0, 0, 1024, 1024);
        x.strokeStyle = bright ? '#ffd27a' : '#b8964a';
        x.lineWidth = bright ? 5 : 3;
        x.shadowColor = '#ffd27a';
        x.shadowBlur = bright ? 10 : 0;
        for (let i = 0; i < 40; i++) {
          const cx = r() * 1024;
          const cy = r() * 1024;
          x.beginPath();
          for (let k = 0; k < 4; k++) {
            const a = r() * Math.PI * 2;
            x.moveTo(cx, cy);
            x.lineTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
          }
          x.stroke();
        }
      },
      true,
    );
  const map = bag.keep(runes(false));
  const em = bag.keep(runes(true));
  map.repeat.set(1 / 12, 1 / 12);
  em.repeat.set(1 / 12, 1 / 12);
  const top = std(bag, { map, emissiveMap: em, emissive: '#ffd27a', emissiveIntensity: 0.8, roughness: 0.5 });
  const stone = std(bag, { color: '#e6dfcc', roughness: 0.6 });
  const { g } = body(ctx, bag, {
    top,
    edge: stone,
    leg: stone,
    apron: std(bag, { color: '#c9a24a', metalness: 0.8, roughness: 0.3 }),
    legs: (b) => {
      const geo = b.keep(new THREE.BoxGeometry(0.9, 0.9, 7.8));
      geo.translate(0, 0, -3.9);
      return geo;
    },
  });
  return { root: g, update: (t) => (top.emissiveIntensity = 0.6 + Math.sin(t * 1.2) * 0.4) };
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

/** A table of scanned wood (Poly Haven, CC0): the top, its edge and the legs all of `id`, at real size. */
const scannedWood = (id: string, metres: number, legs: [number, number][] = TURNED) => (ctx: DecorContext, bag: Bag): Built => {
  const r = 1 / (metres * PER_METRE);
  const { g } = body(ctx, bag, {
    top: scanned(bag, id, r, r, { roughness: 0.6 }),
    edge: scanned(bag, id, 0.08, 1.2, { roughness: 0.65 }),
    leg: scanned(bag, id, 0.3, 0.3, { roughness: 0.65 }),
    legs,
  });
  return { root: g };
};

export const TABLES: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  t_walnut: scannedWood('dark_wood', 2, LION),
  t_old_oak: scannedWood('medieval_wood', 2),
  t_tavern: tavern,
  t_dark_oak: darkOak,
  t_marble: marble,
  t_royal: royal,
  t_cinder: cinder,
  t_thorn: thorn,
  t_brass: brass,
  t_rime: rime,
  t_lumen: lumen,
  t_hollow: hollow,
};

export { mergeGeometries };
