import * as THREE from 'three';
import { MAT, MAT_ART } from '@/ui/match/table3d/tableCamera';
import type { RoomInfo } from '@/domain/lounge';

/**
 * Shared bits for the room's decor (Lounge and the 3D table): the room's size, canvas textures,
 * materials, and the Piece every builder returns.
 */

/** The room (table scene units, z up): the floor's height, half its width and depth, the walls' height. */
export const ROOM = { floor: -9, x: 36, y: 30, wallH: 34 } as const;

/**
 * The tabletop: the board (mat) plus a rim, wider at the sides so the small things beside the board
 * (trinkets) have room. The board itself keeps its size.
 */
export const TABLE_SIZE = { w: MAT.w * MAT_ART + 8.6, h: MAT.h * MAT_ART + 2.6 };
/** Where the trinkets stand: halfway between the board's edge and the table's. */
export const TRINKET_X = (MAT.w * MAT_ART) / 2 + (TABLE_SIZE.w - MAT.w * MAT_ART) / 4;

/** One built piece of decor: its objects, a per-frame animation, and what to free. */
export interface Piece {
  root: THREE.Object3D;
  update?(t: number, dt: number): void;
  dispose(): void;
}

/** What builders may need beyond the slot: the table's size (from the mat), art the player owns. */
export interface DecorContext {
  /** The tabletop's size (the mat plus a rim). */
  tableW: number;
  tableH: number;
  /** The player's (or host's) Warden portrait, for the portrait painting. */
  portraitUrl?: string;
  /** The room owner's faction (the Warden's), for pieces that glow in its colour. */
  faction?: string;
  /** What the room shows of its owner: their wins. */
  info?: RoomInfo;
  /** Art to hang (a card's, the campaign's…), resolved by the caller. */
  art: (key: string) => string | undefined;
  /** The most room the slot gives (width along its wall, depth out of it, height): bigger pieces shrink. */
  limit?: Limit;
  /** The slot is the mirror of its pair (the table's right side): turns go the other way. */
  mirror?: boolean;
}

/** A size in room units: width (x), depth (y), height (z), in the piece's own frame. */
export interface Limit {
  w: number;
  d: number;
  h: number;
}

/** Collects what a builder makes so a Piece can free it all at once. */
export class Bag {
  private items: { dispose(): void }[] = [];
  keep<T extends { dispose(): void }>(x: T): T {
    this.items.push(x);
    return x;
  }
  dispose() {
    this.items.forEach((d) => d.dispose());
    this.items = [];
  }
}

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat = false): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** A seeded random (the same room looks the same every time it is built). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/** Wood grain along the texture. */
export const woodTexture = (base: string, dark: string, seed = 7) =>
  canvasTexture(
    1024,
    256,
    (g) => {
      const r = rng(seed);
      g.fillStyle = base;
      g.fillRect(0, 0, 1024, 256);
      for (let i = 0; i < 160; i++) {
        const y = r() * 256;
        g.strokeStyle = `rgba(${dark},${0.08 + r() * 0.22})`;
        g.lineWidth = 0.6 + r() * 2.4;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (r() - 0.5) * 2);
        g.stroke();
      }
    },
    true,
  );

/** Planks of wood: rgb of the boards, their count, the seams between them. */
export const plankTexture = (rgb: [number, number, number], planks = 6, seed = 3) =>
  canvasTexture(
    1024,
    1024,
    (g) => {
      const r = rng(seed);
      const ph = 1024 / planks;
      for (let p = 0; p < planks; p++) {
        const y0 = p * ph;
        const v = 0.85 + r() * 0.3;
        g.fillStyle = `rgb(${Math.round(rgb[0] * v)},${Math.round(rgb[1] * v)},${Math.round(rgb[2] * v)})`;
        g.fillRect(0, y0, 1024, ph);
        for (let i = 0; i < 40; i++) {
          const y = y0 + r() * ph;
          g.strokeStyle = `rgba(30,16,6,${0.06 + r() * 0.16})`;
          g.lineWidth = 0.6 + r() * 2;
          g.beginPath();
          g.moveTo(0, y);
          for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i + p) * 2.5);
          g.stroke();
        }
        for (let k = 0; k < 1 + Math.floor(r() * 2); k++) {
          const x = r() * 1024;
          const y = y0 + ph * (0.3 + r() * 0.4);
          for (let q = 3; q > 0; q--) {
            g.strokeStyle = `rgba(30,16,6,${0.25 + q * 0.08})`;
            g.lineWidth = 2;
            g.beginPath();
            g.ellipse(x, y, 10 * q, 4 * q, 0, 0, Math.PI * 2);
            g.stroke();
          }
        }
        g.fillStyle = 'rgba(20,10,4,.85)';
        g.fillRect(0, y0 + ph - 3, 1024, 3);
      }
    },
    true,
  );

/** Marble: a pale ground with soft veins (and optional gold ones). */
export const marbleTexture = (base: string, vein: string, gold?: string, seed = 11) =>
  canvasTexture(
    512,
    512,
    (g) => {
      const r = rng(seed);
      g.fillStyle = base;
      g.fillRect(0, 0, 512, 512);
      const veins = (color: string, n: number, w: number) => {
        for (let i = 0; i < n; i++) {
          g.strokeStyle = color;
          g.globalAlpha = 0.25 + r() * 0.5;
          g.lineWidth = w * (0.5 + r());
          g.beginPath();
          let x = r() * 512;
          let y = 0;
          g.moveTo(x, y);
          while (y < 512) {
            x += (r() - 0.5) * 40;
            y += 10 + r() * 30;
            g.lineTo(x, y);
          }
          g.stroke();
        }
        g.globalAlpha = 1;
      };
      veins(vein, 14, 1.6);
      if (gold) veins(gold, 4, 2.4);
    },
    true,
  );

/**
 * A standard material. The room has no environment map to reflect, so fully metallic surfaces would
 * render black: metalness is capped, keeping some of the lights' colour on brass, steel and gold.
 */
export const std = (bag: Bag, p: THREE.MeshStandardMaterialParameters) =>
  bag.keep(new THREE.MeshStandardMaterial({ roughness: 0.8, ...p, metalness: Math.min(p.metalness ?? 0, 0.5) }));
export const glow = (bag: Bag, color: THREE.ColorRepresentation, opacity = 1) =>
  bag.keep(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false }));

/** A mesh that casts and takes shadows. */
export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], bag: Bag, at?: [number, number, number]): THREE.Mesh {
  const m = new THREE.Mesh(bag.keep(geo), mat);
  m.castShadow = m.receiveShadow = true;
  if (at) m.position.set(...at);
  return m;
}

/** A flickering point light (a flame): its base intensity and how it wavers. */
export function flame(light: THREE.PointLight, base: number, seed: number) {
  return (t: number) => (light.intensity = base * (1 + Math.sin(t * 9 + seed * 4) * 0.1 + Math.sin(t * 17 + seed) * 0.07));
}

/** Loads a picture into a texture (async; the material shows it once loaded). */
export function loadArt(url: string | undefined, bag: Bag, onLoad: (t: THREE.Texture) => void) {
  if (!url) return;
  new THREE.TextureLoader().load(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    bag.keep(t);
    onLoad(t);
  });
}

/** A rounded rectangle shape centred on 0. */
export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const a = w / 2;
  const b = h / 2;
  s.moveTo(-a + r, -b);
  s.lineTo(a - r, -b);
  s.quadraticCurveTo(a, -b, a, -b + r);
  s.lineTo(a, b - r);
  s.quadraticCurveTo(a, b, a - r, b);
  s.lineTo(-a + r, b);
  s.quadraticCurveTo(-a, b, -a, b - r);
  s.lineTo(-a, -b + r);
  s.quadraticCurveTo(-a, -b, -a + r, -b);
  return s;
}

/**
 * Where the room's 3D models live, all CC0: public/decor/<id>/model.gltf (Poly Haven),
 * decor/qk/<Name>.gltf (Quaternius Fantasy Props), decor/arcade/<name>.glb (Kenney Mini Arcade).
 */
export const modelUrl = (id: string) => `${import.meta.env.BASE_URL}decor/${id.includes('/') ? (id.endsWith('.glb') ? id : `${id}.gltf`) : `${id}/model.gltf`}`;

/** Room units per metre: the table stands 9 high, about 75 cm, so 12 to the metre. Models keep their real size. */
export const PER_METRE = 12;

export interface ModelFit {
  /** A multiple of the model's real size (most stay 1, so they match the table). */
  scale?: number;
  /** Or a fixed height in room units. */
  height?: number;
  /** Turn about z (the model's front faces -y at 0, glTF models face +z). */
  turn?: number;
  /** floor: stands on z = 0; wall: its back on y = 0, centred on z = 0; hang: its top at z = 0. */
  mount?: 'floor' | 'wall' | 'hang';
  /** On the floor: centred, or its back on y = 0 (standing against a wall). */
  anchor?: 'center' | 'back';
  /** The most room it may take: a bigger piece shrinks to fit. */
  max?: Limit;
  /** A change to each of its meshes once loaded (a colour, a material). */
  tweak?: (m: THREE.Mesh) => void;
  /** The loaded model (glTF's own scene, with its named parts and animations), once placed. */
  onLoad?: (model: THREE.Object3D, gltf: { animations: THREE.AnimationClip[] }) => void;
}

/**
 * A downloaded model as a piece: loaded in the background (nothing shows until it arrives), turned
 * from glTF's y-up to the room's z-up, at its real size, centred, and set by `mount`.
 */
export function modelPiece(bag: Bag, id: string, fit: ModelFit = {}): THREE.Group {
  const root = new THREE.Group();
  let gone = false;
  bag.keep({ dispose: () => (gone = true) });
  // A model that cannot be loaded (offline, or no browser at all in tests) is simply left out.
  const missing = () => {};
  void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) =>
    new GLTFLoader().load(modelUrl(id), (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = m.receiveShadow = true;
        fit.tweak?.(m);
        bag.keep(m.geometry);
        for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
          const s = mat as THREE.MeshStandardMaterial;
          // No environment to reflect: full metal would render black (as std() above).
          if (s.metalness !== undefined) s.metalness = Math.min(s.metalness, 0.5);
          for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) if (s[k]) bag.keep(s[k]!);
          bag.keep(s);
        }
      });
      if (gone) {
        bag.dispose();
        return;
      }
      // y-up to z-up, then the turn about z: measured together, so width, depth and the back are the
      // ones the room sees.
      model.rotation.x = Math.PI / 2;
      const turned = new THREE.Group();
      turned.rotation.z = fit.turn ?? 0;
      turned.add(model);
      turned.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(turned);
      const dim = box.getSize(new THREE.Vector3());
      let k = fit.height ? fit.height / dim.z : PER_METRE * (fit.scale ?? 1);
      if (fit.max) k = Math.min(k, fit.max.w / dim.x, fit.max.d / dim.y, fit.max.h / dim.z);
      const mount = fit.mount ?? 'floor';
      const back = mount === 'wall' || fit.anchor === 'back';
      turned.position.set(
        -(box.min.x + box.max.x) / 2,
        back ? -box.max.y : -(box.min.y + box.max.y) / 2,
        mount === 'floor' ? -box.min.z : mount === 'hang' ? -box.max.z : -(box.min.z + box.max.z) / 2,
      );
      const holder = new THREE.Group();
      holder.add(turned);
      holder.scale.setScalar(k);
      root.add(holder);
      fit.onLoad?.(model, gltf);
    }, undefined, missing),
  ).catch(missing);
  return root;
}

/** A model that moves by its own animations (glTF clips): `play` picks a clip by (part of) its name. */
export interface Animated {
  root: THREE.Group;
  /** Plays a clip, fading from the one before; `once` plays it through and goes back to the idle clip. */
  play(name: string, once?: boolean): void;
  update(dt: number): void;
  /** The loaded model (null until it arrives). */
  model(): THREE.Object3D | null;
}

export function animatedPiece(bag: Bag, id: string, fit: ModelFit, idle: string): Animated {
  let mixer: THREE.AnimationMixer | null = null;
  let clips: THREE.AnimationClip[] = [];
  let current: THREE.AnimationAction | null = null;
  let loaded: THREE.Object3D | null = null;
  const find = (name: string) => clips.find((c) => c.name.split('|').pop() === name) ?? clips.find((c) => c.name.includes(name));
  const play = (name: string, once = false) => {
    const clip = mixer && find(name);
    if (!mixer || !clip) return;
    const next = mixer.clipAction(clip);
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    if (current && current !== next) next.crossFadeFrom(current, 0.3, false);
    next.play();
    current = next;
  };
  const root = modelPiece(bag, id, {
    ...fit,
    onLoad: (m, gltf) => {
      loaded = m;
      mixer = new THREE.AnimationMixer(m);
      clips = gltf.animations;
      // A clip played once goes back to the idle one.
      mixer.addEventListener('finished', () => play(idle));
      // Each copy starts at its own point of the clip, so a school of fish does not swim in step.
      play(idle);
      if (current) current.time = Math.random() * (current.getClip().duration || 1);
      fit.onLoad?.(m, gltf);
    },
  });
  bag.keep({ dispose: () => mixer?.stopAllAction() });
  return { root, play, update: (dt) => mixer?.update(dt), model: () => loaded };
}

/** The box an object takes in another's frame (e.g. a loaded model inside its piece). */
export function boxIn(obj: THREE.Object3D, frame: THREE.Object3D): THREE.Box3 {
  frame.updateWorldMatrix(true, true);
  const inv = frame.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.computeBoundingBox();
    box.union(m.geometry.boundingBox!.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)));
  });
  return box;
}

/**
 * A piece standing on top of a model (a gramophone on a cabinet): `top` is raised to the base's top once
 * the base has loaded, in the middle of its top, moved `shift` along y (+ towards the wall).
 */
export function onTop(bag: Bag, baseId: string, fit: ModelFit, top: THREE.Object3D, shift = 0): THREE.Group {
  const g = new THREE.Group();
  top.visible = false;
  const base = modelPiece(bag, baseId, {
    ...fit,
    onLoad: (m, gltf) => {
      const box = boxIn(base, g);
      top.position.set((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2 + shift, box.max.z);
      top.visible = true;
      fit.onLoad?.(m, gltf);
    },
  });
  g.add(base, top);
  return g;
}
