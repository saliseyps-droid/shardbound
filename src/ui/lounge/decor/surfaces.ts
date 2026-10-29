import * as THREE from 'three';
import { Bag, DecorContext, PER_METRE, ROOM, std } from './kit';
import type { Built } from './tables';

/**
 * The big surfaces: the floor, the four walls (one piece for all), the rug under the table. Their
 * textures are scanned materials from Poly Haven (CC0, public/decor/tex/<id>/: colour, normal and
 * roughness), laid at their real size: `metres` is how much of the world one copy of the texture shows.
 */

const texUrl = (id: string, map: 'diff' | 'nor' | 'rough') => `${import.meta.env.BASE_URL}decor/tex/${id}/${map}.jpg`;
const loader = new THREE.TextureLoader();

/** A material with a Poly Haven texture set, repeated `rx` × `ry` times; it shows once the maps load. */
/** `tint` multiplies the colour map (a darker or coloured version of the same material). */
export function scanned(bag: Bag, id: string, rx: number, ry: number, p: THREE.MeshStandardMaterialParameters = {}, tint = '#ffffff') {
  const mat = std(bag, { color: '#3a3238', roughness: 1, ...p });
  const load = (map: 'diff' | 'nor' | 'rough', apply: (t: THREE.Texture) => void) =>
    loader.load(texUrl(id, map), (t) => {
      bag.keep(t);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.anisotropy = 8;
      apply(t);
      mat.needsUpdate = true;
    });
  load('diff', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    mat.map = t;
    mat.color.set(tint);
  });
  load('nor', (t) => (mat.normalMap = t));
  load('rough', (t) => (mat.roughnessMap = t));
  return mat;
}

// ---------- Floors: a 160 × 160 plane at the floor's height (fog hides its far edge). ----------

const FLOOR = 160;
const floor = (id: string, metres: number, p?: THREE.MeshStandardMaterialParameters, tint?: string) => (_c: DecorContext, bag: Bag): Built => {
  const n = FLOOR / (metres * PER_METRE);
  const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(FLOOR, FLOOR)), scanned(bag, id, n, n, p, tint));
  m.position.z = ROOM.floor;
  m.receiveShadow = true;
  return { root: m };
};

export const FLOORS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  f_planks: floor('old_wooden_floor_02', 2.03),
  f_terracotta: floor('terracotta_floor_tiles', 2.08),
  f_slate: floor('slate_floor_02', 2),
  f_dark_planks: floor('dark_wooden_planks', 2),
  f_marble: floor('marble_01', 1.5),
  f_checker: floor('floor_tiles_06', 3),
  // Black and grey: the same tiles, the light squares toned down.
  f_dark_checker: floor('floor_tiles_06', 3, { roughness: 0.6 }, '#5a5a60'),
};

// ---------- Walls: four planes standing on the floor, facing in. ----------

const walls = (id: string, metres: number, tint?: string) => (_c: DecorContext, bag: Bag): Built => {
  const g = new THREE.Group();
  const H = ROOM.wallH;
  const tile = metres * PER_METRE;
  const one = (len: number, x: number, y: number, rot: number) => {
    const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(len, H)), scanned(bag, id, len / tile, H / tile, {}, tint));
    m.rotation.set(Math.PI / 2, rot, 0);
    m.position.set(x, y, ROOM.floor + H / 2);
    m.receiveShadow = true;
    g.add(m);
  };
  one(ROOM.x * 2, 0, ROOM.y, 0);
  one(ROOM.x * 2, 0, -ROOM.y, Math.PI);
  one(ROOM.y * 2, ROOM.x, 0, -Math.PI / 2);
  one(ROOM.y * 2, -ROOM.x, 0, Math.PI / 2);
  return { root: g };
};

/**
 * Panelled walls: one material up to a rail, another above it, and a wooden rail between them (the
 * strips face into the room, like the walls, so they hide with them when the camera is outside).
 */
const panelled = (lower: [string, number, string?], upper: [string, number, string?], rail = '#3a2618') => (_c: DecorContext, bag: Bag): Built => {
  const g = new THREE.Group();
  const H = ROOM.wallH;
  const low = 12;
  const railMat = scanned(bag, 'weathered_brown_planks', 1, 1, { roughness: 0.7 }, rail);
  const one = (len: number, x: number, y: number, rot: number) => {
    const side = new THREE.Group();
    side.rotation.set(Math.PI / 2, rot, 0);
    side.position.set(x, y, ROOM.floor);
    const band = ([id, metres, tint]: [string, number, string?], h: number, z: number) => {
      const tile = metres * PER_METRE;
      const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(len, h)), scanned(bag, id, len / tile, h / tile, {}, tint));
      m.position.y = z + h / 2;
      m.receiveShadow = true;
      side.add(m);
    };
    band(lower, low, 0);
    band(upper, H - low, low);
    const r = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(len, 1.1)), railMat);
    r.position.set(0, low, 0.25);
    side.add(r);
    g.add(side);
  };
  one(ROOM.x * 2, 0, ROOM.y, 0);
  one(ROOM.x * 2, 0, -ROOM.y, Math.PI);
  one(ROOM.y * 2, ROOM.x, 0, -Math.PI / 2);
  one(ROOM.y * 2, -ROOM.x, 0, Math.PI / 2);
  return { root: g };
};

export const WALLS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  w_red_brick: walls('medieval_red_brick', 2),
  w_sandstone: walls('large_sandstone_blocks_01', 3),
  // Black stone: the sandstone blocks, darkened.
  w_black: walls('large_sandstone_blocks_01', 3, '#26242a'),
  w_castle: walls('castle_wall_slates', 2.5),
  w_castle_brick: walls('castle_brick_07', 2.5),
  w_carved: walls('wood_inlaid_stone_wall', 1.3),
  w_white_brick: walls('whitewashed_brick', 2),
  w_stone_tile: walls('stone_tile_wall', 2, '#c4bcae'),
  w_volcanic: walls('volcanic_rock_tiles', 1.8),
  // Panelled: planks below a rail, plaster above.
  w_tavern: panelled(['weathered_brown_planks', 1.8], ['plastered_wall_04', 3, '#bfae90']),
};

// ---------- Rugs: a woven field (a scanned fabric) inside a border, under the table. ----------

interface RugLook {
  fabric: string;
  /** How big the fabric's pattern shows (metres per copy). */
  metres: number;
  /** The border band, its gold (or other) lines, and a tint laid over the field (to deepen it). */
  band?: string;
  line?: string;
  tint?: string;
  /** Tassels along the short ends. */
  fringe?: string;
  /** An eastern medallion in the middle and ornaments in the corners: [fill, outline]. */
  medallion?: [string, string];
  /** A modern pattern drawn over the field, in these colours. */
  pattern?: { kind: 'stripes' | 'circles' | 'grid' | 'arcs'; colors: string[] };
  /** A round rug instead of a rectangle. */
  round?: boolean;
  /** Lines that glow (an emissive copy of the pattern), in this colour. */
  glow?: string;
  /** A photograph of a real rug (public/decor/rugs/<photo>.jpg, standing upright) laid as the whole rug. */
  photo?: string;
}

/** Draws a modern pattern over the rug's field (white, for the glowing copy). */
function drawPattern(g: CanvasRenderingContext2D, w: number, h: number, p: NonNullable<RugLook['pattern']>, glow = false) {
  const c = (i: number) => (glow ? '#ffffff' : p.colors[i % p.colors.length]);
  g.lineCap = 'round';
  if (p.kind === 'stripes') {
    const n = 7;
    for (let i = 0; i < n; i++) {
      g.fillStyle = c(i);
      g.globalAlpha = glow ? 1 : 0.85;
      g.fillRect(((i + 0.5) * w) / n - w * 0.025, 0, w * 0.05, h);
    }
  } else if (p.kind === 'circles') {
    for (let i = 4; i > 0; i--) {
      g.strokeStyle = c(i);
      g.lineWidth = w * 0.035;
      g.beginPath();
      g.arc(w / 2, h / 2, (Math.min(w, h) * 0.47 * i) / 4, 0, Math.PI * 2);
      g.stroke();
    }
  } else if (p.kind === 'grid') {
    g.lineWidth = glow ? 4 : 6;
    let k = 0;
    for (let x = w / 8; x < w - 1; x += w / 8) {
      g.strokeStyle = c(k++);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = h / 5; y < h - 1; y += h / 5) {
      g.strokeStyle = c(k++);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
  } else {
    for (let i = 0; i < 5; i++) {
      g.strokeStyle = c(i);
      g.lineWidth = w * 0.04;
      g.beginPath();
      g.arc(0, h, w * (0.25 + i * 0.15), -Math.PI / 2, 0);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}

/** A stepped diamond medallion: rings of diamonds, filled and outlined. */
function medallion(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, [fill, line]: [string, string]) {
  for (let k = 0; k < 4; k++) {
    const f = 1 - k * 0.24;
    g.beginPath();
    g.moveTo(cx, cy - ry * f);
    g.lineTo(cx + rx * f, cy);
    g.lineTo(cx, cy + ry * f);
    g.lineTo(cx - rx * f, cy);
    g.closePath();
    g.fillStyle = k % 2 ? fill : 'rgba(0,0,0,.25)';
    g.fill();
    g.strokeStyle = line;
    g.lineWidth = k ? 2 : 4;
    g.stroke();
  }
  g.fillStyle = line;
  g.beginPath();
  g.arc(cx, cy, Math.min(rx, ry) * 0.08, 0, Math.PI * 2);
  g.fill();
}

const rug = (look: RugLook) => (ctx: DecorContext, bag: Bag): Built => {
  const W = look.round ? ctx.tableW + 9 : ctx.tableW + 11.4;
  const H = look.round ? ctx.tableW + 9 : ctx.tableH + 9.4;
  const mat = std(bag, { color: '#2e0e12', roughness: 1 });
  const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(W, H)), mat);
  m.position.z = ROOM.floor + 0.02;
  m.receiveShadow = true;
  // The colour: the fabric tiled over a canvas the rug's shape, the border drawn over it.
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const px = 1024;
    const c = document.createElement('canvas');
    c.width = px;
    c.height = Math.round((px * H) / W);
    const g = c.getContext('2d');
    if (!g) return;
    const tile = look.metres * PER_METRE * (px / W);
    const pat = look.photo ? null : g.createPattern(img, 'repeat');
    if (look.photo) {
      // The photograph stands upright: turned a quarter to lie along the rug.
      g.save();
      g.translate(c.width / 2, c.height / 2);
      g.rotate(Math.PI / 2);
      g.drawImage(img, -c.height / 2, -c.width / 2, c.height, c.width);
      g.restore();
    }
    if (pat) {
      pat.setTransform(new DOMMatrix().scale(tile / img.width, tile / img.height));
      g.fillStyle = pat;
      g.fillRect(0, 0, c.width, c.height);
    }
    if (look.tint) {
      g.fillStyle = look.tint;
      g.fillRect(0, 0, c.width, c.height);
    }
    const fr = look.fringe ? 18 : 0;
    if (look.pattern) drawPattern(g, c.width, c.height, look.pattern);
    if (look.round) {
      // Cut the round shape: outside is transparent, and alphaTest drops it.
      g.globalCompositeOperation = 'destination-in';
      g.beginPath();
      g.ellipse(c.width / 2, c.height / 2, c.width / 2 - 2, c.height / 2 - 2, 0, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    if (look.medallion) {
      const w = c.width;
      const h = c.height;
      medallion(g, w / 2, h / 2, w * 0.2, h * 0.3, look.medallion);
      for (const [x, y] of [[0.17, 0.2], [0.83, 0.2], [0.17, 0.8], [0.83, 0.8]]) medallion(g, w * x, h * y, w * 0.06, h * 0.09, look.medallion);
    }
    if (look.band) {
      const b = 0.06 * c.width;
      g.lineWidth = b;
      g.strokeStyle = look.band;
      g.strokeRect(fr + b / 2, b / 2, c.width - 2 * fr - b, c.height - b);
      if (look.line) {
        g.strokeStyle = look.line;
        g.lineWidth = 5;
        g.strokeRect(fr + b * 0.25, b * 0.25, c.width - 2 * fr - b * 0.5, c.height - b * 0.5);
        g.lineWidth = 3;
        g.strokeRect(fr + b * 1.15, b * 1.15, c.width - 2 * fr - b * 2.3, c.height - b * 2.3);
      }
    }
    if (look.fringe) {
      g.clearRect(0, 0, fr, c.height);
      g.clearRect(c.width - fr, 0, fr, c.height);
      g.fillStyle = look.fringe;
      for (let y = 4; y < c.height; y += 9) {
        g.fillRect(0, y, fr, 3);
        g.fillRect(c.width - fr, y, fr, 3);
      }
    }
    const t = bag.keep(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    mat.map = t;
    mat.color.set('#ffffff');
    if (look.fringe || look.round) mat.alphaTest = 0.5;
    if (look.glow && look.pattern) {
      const e = document.createElement('canvas');
      e.width = c.width;
      e.height = c.height;
      const eg = e.getContext('2d');
      if (eg) {
        eg.fillStyle = '#000';
        eg.fillRect(0, 0, e.width, e.height);
        drawPattern(eg, e.width, e.height, look.pattern, true);
        mat.emissiveMap = bag.keep(new THREE.CanvasTexture(e));
        mat.emissive.set(look.glow);
        mat.emissiveIntensity = 1.6;
      }
    }
    mat.needsUpdate = true;
  };
  img.src = look.photo ? `${import.meta.env.BASE_URL}decor/rugs/${look.photo}.jpg` : texUrl(look.fabric, 'diff');
  bag.keep({ dispose: () => (img.onload = null) });
  // The weave: the fabric's normal map at the same size.
  loader.load(texUrl(look.fabric, 'nor'), (t) => {
    bag.keep(t);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(W / (look.metres * PER_METRE), H / (look.metres * PER_METRE));
    mat.normalMap = t;
    mat.normalScale.setScalar(0.6);
    mat.needsUpdate = true;
  });
  return { root: m };
};

export const RUGS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  r_shag: rug({ fabric: 'polar_fleece', metres: 1, round: true }),
  r_round: rug({ fabric: 'knitted_fleece', metres: 0.8, round: true, pattern: { kind: 'circles', colors: ['#e8dcc0', '#c86a3a', '#2a4a5a', '#e8b04b'] } }),
  r_corduroy: rug({ fabric: 'ribbed_corduroy', metres: 0.8, pattern: { kind: 'arcs', colors: ['#e8d8b0', '#c8643a', '#2a3a2a'] } }),
  // An old Chinese rug, photographed (The Metropolitan Museum of Art, public domain), on a woollen weave.
  r_chinese: rug({ fabric: 'knitted_fleece', metres: 0.5, photo: 'chinese', fringe: '#d8ccb0' }),
};
