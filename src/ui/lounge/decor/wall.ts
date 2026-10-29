import * as THREE from 'three';
import { Bag, DecorContext, ROOM, flame, loadArt, mesh, modelPiece, std, woodTexture } from './kit';
import type { Built } from './tables';

/**
 * What hangs on the walls: the big painting (back wall), posters and banners (side walls), and the
 * pair of lights. A wall piece is built facing -y (into the room from the back wall) with its centre
 * at the origin; the room turns and places it on its wall.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A framed picture: `w` × `h`, a frame of `frameMat`, the canvas showing `art` (or a drawn texture). */
function framed(bag: Bag, w: number, h: number, frameMat: THREE.Material, face: THREE.MeshStandardMaterial, border = 0.6) {
  const g = new THREE.Group();
  const pic = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(w, h)), face);
  pic.rotation.x = Math.PI / 2;
  pic.position.y = -0.18;
  const bar = (bw: number, bh: number, x: number, z: number) => g.add(mesh(new THREE.BoxGeometry(bw, 0.5, bh), frameMat, bag, [x, -0.22, z]));
  bar(w + border * 2, border, 0, h / 2 + border / 2);
  bar(w + border * 2, border, 0, -h / 2 - border / 2);
  bar(border, h, -w / 2 - border / 2, 0);
  bar(border, h, w / 2 + border / 2, 0);
  g.add(pic);
  return g;
}

const gilt = (bag: Bag) => std(bag, { color: '#c9a24a', metalness: 0.85, roughness: 0.3 });
const woodFrame = (bag: Bag) => std(bag, { map: bag.keep(woodTexture('#4a2f1b', '25,12,4', 201)), roughness: 0.7 });

/** A painting that shows a picture from the game once it has loaded (dark until then). */
function artPainting(_ctx: DecorContext, bag: Bag, url: string | undefined, w: number, h: number, frame: THREE.Material): Built {
  const face = std(bag, { color: '#2a2230', roughness: 0.7 });
  loadArt(url, bag, (t) => {
    // Cover the canvas: crop the picture to the frame's shape.
    const img = t.image as { width: number; height: number };
    const a = img.width / img.height;
    const want = w / h;
    if (a > want) {
      t.repeat.set(want / a, 1);
      t.offset.set((1 - want / a) / 2, 0);
    } else {
      t.repeat.set(1, a / want);
      t.offset.set(0, (1 - a / want) / 2);
    }
    face.map = t;
    face.color.set('#ffffff');
    face.needsUpdate = true;
  });
  return { root: framed(bag, w, h, frame, face) };
}

export const PAINTINGS: Record<string, Make> = {
  p_crown: (ctx, bag) => artPainting(ctx, bag, ctx.art('crown'), 17, 10.5, gilt(bag)),
  p_dragon: (ctx, bag) => artPainting(ctx, bag, ctx.art('dragon'), 17, 10.5, gilt(bag)),
  p_battle: (ctx, bag) => artPainting(ctx, bag, ctx.art('battle'), 18, 9, woodFrame(bag)),
  p_warden: (ctx, bag) => artPainting(ctx, bag, ctx.portraitUrl, 9, 12, gilt(bag)),
  p_aether: (ctx, bag) => artPainting(ctx, bag, ctx.art('aether'), 17, 10, gilt(bag)),
  p_heaven: (ctx, bag) => artPainting(ctx, bag, ctx.art('heaven'), 17, 10, gilt(bag)),
  p_throne: (ctx, bag) => artPainting(ctx, bag, ctx.art('throne'), 17, 10, woodFrame(bag)),
  p_inn: (ctx, bag) => artPainting(ctx, bag, ctx.art('inn'), 16, 10, woodFrame(bag)),
  p_chapel: (ctx, bag) => artPainting(ctx, bag, ctx.art('chapel'), 17, 10, gilt(bag)),
  p_cathedral: (ctx, bag) => artPainting(ctx, bag, ctx.art('cathedral'), 12, 12, woodFrame(bag)),
  p_glade: (ctx, bag) => artPainting(ctx, bag, ctx.art('glade'), 17, 10, woodFrame(bag)),
};

/** The alchemist's bottles in bright colours: each bottle (by where it stands along the shelf) its own. */
const BOTTLE_COLORS = ['#e8102a', '#10c83a', '#1050ff', '#ffb000', '#9a10e8', '#00c8c0', '#ff5a00', '#e810b0'];
function brightBottles(m: THREE.Mesh) {
  const mat = m.material as THREE.MeshStandardMaterial;
  if (!mat.name?.includes('Props')) return;
  const pos = m.geometry.getAttribute('position') as THREE.BufferAttribute;
  m.geometry.computeBoundingBox();
  const box = m.geometry.boundingBox!;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const k = Math.min(BOTTLE_COLORS.length - 1, Math.floor(((pos.getX(i) - box.min.x) / (box.max.x - box.min.x || 1)) * BOTTLE_COLORS.length));
    c.set(BOTTLE_COLORS[k]);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  m.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const glass = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0 });
  glass.name = mat.name;
  m.material = glass;
}

/** A model hung on the wall: its back to the wall, centred on the slot, no bigger than the slot allows. */
const onWall = (id: string, fit: { scale?: number; turn?: number; tweak?: (m: THREE.Mesh) => void }): Make => (ctx, bag) => ({ root: modelPiece(bag, id, { ...fit, mount: 'wall', max: ctx.limit }) });

export const POSTERS: Record<string, Make> = {
  po_abandoneer: (ctx, bag) => artPainting(ctx, bag, ctx.art('abandoneer'), 7, 9.8, woodFrame(bag)),
  // Wall pieces from Poly Haven (CC0): a knight's shield, hunting trophies, a mirror.
  po_shield: onWall('kite_shield', { scale: 1 }),
  po_dartboard: onWall('dartboard', { scale: 1.6 }),
  po_estoc: onWall('antique_estoc', { scale: 0.75 }),
  po_mace: onWall('ornate_medieval_mace', { scale: 1.5 }),
  // Fantasy (Quaternius).
  po_alchemy: onWall('qk/Shelf_Small_Bottles', { scale: 1.2, tweak: brightBottles }),
  po_shield_wood: onWall('qk/Shield_Wooden', { scale: 1.3 }),
  po_sword: onWall('qk/Sword_Bronze', { scale: 1 }),
  po_legend: (ctx, bag) => artPainting(ctx, bag, ctx.art('legend'), 7, 9.8, gilt(bag)),
};

// ---------- Lights: a pair on the side walls (both the same piece). ----------

/** Where the two lights hang (world), facing into the room. */
export const LIGHT_SPOTS: { at: THREE.Vector3; face: number }[] = [
  { at: new THREE.Vector3(-ROOM.x, 0, 8), face: Math.PI / 2 },
  { at: new THREE.Vector3(ROOM.x, 0, 8), face: -Math.PI / 2 },
];

/** One light's look, built facing -y at the wall; returns its light so the pair can flicker. */
type OneLight = (bag: Bag, seed: number) => { g: THREE.Group; light: THREE.PointLight; base: number; update?: (t: number) => void };

const iron = (bag: Bag) => std(bag, { color: '#3a2a1a', metalness: 0.6, roughness: 0.5 });

const LIGHT_LOOKS: Record<string, OneLight> = {
  // Lanterns (Poly Haven, CC0) hanging from an iron bracket on the wall.
  l_lantern: (bag) => hungLantern(bag, 'Lantern_01', 3, 0xffc27a, 26),
  l_wooden_lantern: (bag) => hungLantern(bag, 'wooden_lantern_01', 2.2, 0xffb86a, 26),
  // Quaternius: a lantern on its own bracket, an iron torch.
  l_wall_lantern: (bag) => fixedLight(bag, 'qk/Lantern_Wall', 0.7, 0xffc27a, 26, -2.5, 0),
  l_iron_torch: (bag) => fixedLight(bag, 'qk/Torch_Metal', 1.2, 0xffa64a, 30, -1.8, 3.5),
  l_sconce: (bag) => fixedLight(bag, 'industrial_wall_sconce', 2.6, 0xffe2b0, 26, -2.5, -1.5),
};

/** A light that comes with its own wall fixing: the model on the wall, its flame `out` from it, `up` high. */
function fixedLight(bag: Bag, id: string, scale: number, color: number, base: number, out: number, up: number) {
  const g = new THREE.Group();
  const m = modelPiece(bag, id, { scale, mount: 'wall' });
  const light = new THREE.PointLight(color, base, 45, 1.6);
  light.position.set(0, out, up);
  g.add(m, light);
  return { g, light, base };
}

function hungLantern(bag: Bag, id: string, scale: number, color: number, base: number) {
  const g = new THREE.Group();
  const arm = mesh(new THREE.BoxGeometry(0.18, 3.7, 0.18), iron(bag), bag, [0, -1.85, 2.6]);
  const hook = mesh(new THREE.BoxGeometry(0.12, 0.12, 0.8), iron(bag), bag, [0, -3.6, 2.2]);
  const m = modelPiece(bag, id, { scale, mount: 'hang' });
  m.position.set(0, -3.6, 1.9);
  const light = new THREE.PointLight(color, base, 45, 1.6);
  light.position.set(0, -4.2, 0.5);
  g.add(arm, hook, m, light);
  return { g, light, base };
}

const LIGHT_PIECES = LIGHT_LOOKS;

export const LIGHTS: Record<string, Make> = Object.fromEntries(
  Object.entries(LIGHT_PIECES).map(([id, look]) => [
    id,
    (_c: DecorContext, bag: Bag): Built => {
      const root = new THREE.Group();
      const parts = LIGHT_SPOTS.map((s, i) => {
        const l = look(bag, i * 3.1);
        l.g.position.copy(s.at);
        l.g.rotation.z = s.face;
        root.add(l.g);
        return { ...l, flick: flame(l.light, l.base, i) };
      });
      return {
        root,
        update: (t) =>
          parts.forEach((p) => {
            p.flick(t);
            p.update?.(t);
          }),
      };
    },
  ]),
);
