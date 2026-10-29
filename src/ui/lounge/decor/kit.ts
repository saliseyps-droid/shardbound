import * as THREE from 'three';

/**
 * Shared bits for the room's decor (Lounge and the 3D table): the room's size, canvas textures,
 * materials, and the Piece every builder returns.
 */

/** The room (table scene units, z up): the floor's height, half its width and depth, the walls' height. */
export const ROOM = { floor: -9, x: 36, y: 30, wallH: 34 } as const;

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
  /** Art to hang (a card's, the campaign's…), resolved by the caller. */
  art: (key: 'crown' | 'dragon' | 'battle' | 'legend' | 'map') => string | undefined;
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

/** Square tiles with joints. */
export const tileTexture = (joint: string, tone: (r: () => number) => string, n = 4, seed = 5) =>
  canvasTexture(
    512,
    512,
    (g) => {
      const r = rng(seed);
      g.fillStyle = joint;
      g.fillRect(0, 0, 512, 512);
      const s = 512 / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          g.fillStyle = tone(r);
          g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
        }
    },
    true,
  );

/** Stone blocks in staggered courses. */
export const blockTexture = (joint: string, tone: (r: () => number) => string, seed = 9) =>
  canvasTexture(
    512,
    512,
    (g) => {
      const r = rng(seed);
      g.fillStyle = joint;
      g.fillRect(0, 0, 512, 512);
      for (let row = 0; row < 8; row++)
        for (let col = -1; col < 5; col++) {
          g.fillStyle = tone(r);
          g.fillRect(col * 128 + (row % 2) * 64 + 3, row * 64 + 3, 122, 58);
        }
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

/** Faction colours (banners, glows). */
export const FACTION_COLOR = {
  cinder: ['#c8321a', '#ffb35a'],
  thorn: ['#2f6a24', '#cfe88a'],
  brass: ['#a8742a', '#f0d08a'],
  lumen: ['#efe6c8', '#c9a24a'],
  hollow: ['#4a2278', '#cfa8ff'],
  rime: ['#2a6a9a', '#cfeeff'],
} as const;

/** Where the room's 3D models live (public/decor/<id>/model.gltf, from Poly Haven, CC0). */
export const modelUrl = (id: string) => `${import.meta.env.BASE_URL}decor/${id}/model.gltf`;

/**
 * A downloaded model as a piece: loaded in the background (nothing shows until it arrives), turned
 * from glTF's y-up to the room's z-up, scaled to `height` (or `width`), standing on z = 0 and centred.
 * `turn` spins it about z (its front faces -y at 0, as glTF models face +z).
 */
export function modelPiece(bag: Bag, id: string, size: { height?: number; width?: number }, turn = 0): THREE.Group {
  const root = new THREE.Group();
  let gone = false;
  bag.keep({ dispose: () => (gone = true) });
  void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) =>
    new GLTFLoader().load(modelUrl(id), (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = m.receiveShadow = true;
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
      model.rotation.x = Math.PI / 2;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const dim = box.getSize(new THREE.Vector3());
      const k = size.height ? size.height / dim.z : size.width ? size.width / Math.max(dim.x, dim.y) : 1;
      const holder = new THREE.Group();
      holder.add(model);
      model.position.set(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -box.min.z);
      holder.scale.setScalar(k);
      holder.rotation.z = turn;
      root.add(holder);
    }),
  );
  return root;
}
