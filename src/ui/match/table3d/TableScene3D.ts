import * as THREE from 'three';
import { MAT, MAT_ART } from './tableCamera';
import { sanitizeRoom } from '@/data/lounge';
import type { RoomInfo } from '@/domain/lounge';
import { buildRoomDecor, decorArt, type RoomDecor } from '@/ui/lounge/decor/roomDecor';
import { TABLE_SIZE } from '@/ui/lounge/decor/kit';

/**
 * The room around the 3D table (WebGL): the player's (or host's) room from the Lounge, the match's
 * board lying on the table as a mat with relief (a normal map from the image's brightness), a hanging
 * lantern and two flickering candles (no light follows the pointer: its glare on the board made the
 * cards and the painting harder to read). The camera is owned by
 * TableView; this only builds and animates the scene.
 */
export interface TableScene {
  scene: THREE.Scene;
  /** The mat mesh (for picking the point under the pointer). */
  mat: THREE.Mesh;
  /** The room's decor (the Lounge swaps single pieces in it). */
  decor: RoomDecor;
  update(t: number, dt: number): void;
  dispose(): void;
}



/** Normal maps already made, by board image (making one takes a moment; every 2D→3D switch would redo it). */
const normalCache = new Map<string, HTMLCanvasElement>();


/** Bright = raised, dark = sunken: a normal map from the board image, so its carving catches the light. */
function normalMapFrom(img: HTMLImageElement): HTMLCanvasElement {
  const w = 1600;
  const h = Math.round((w * img.height) / img.width);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.filter = 'blur(1.2px)';
  g.drawImage(img, 0, 0, w, h);
  const src = g.getImageData(0, 0, w, h).data;
  const out = g.createImageData(w, h);
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
  const at = (x: number, y: number) => L[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const dy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const nx = -dx * 2.2;
      const ny = dy * 2.2;
      const l = Math.hypot(nx, ny, 1);
      const o = (y * w + x) * 4;
      out.data[o] = (nx / l / 2 + 0.5) * 255;
      out.data[o + 1] = (ny / l / 2 + 0.5) * 255;
      out.data[o + 2] = (1 / l / 2 + 0.5) * 255;
      out.data[o + 3] = 255;
    }
  g.filter = 'none';
  g.putImageData(out, 0, 0);
  return c;
}

/** The room owner beyond the layout: their faction (pieces glowing in its colour) and what the room shows of them. */
export interface RoomOwner {
  faction?: string;
  info?: RoomInfo;
}

export function buildTableScene(boardUrl: string, warm: string, room?: unknown, portraitUrl?: string, owner: RoomOwner = {}): TableScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0c0910');
  // Far enough that the room stays visible when zoomed out to see it.
  scene.fog = new THREE.Fog('#0c0910', 45, 150);
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // Lights: the mockup's (bright enough to read the board).
  scene.add(new THREE.HemisphereLight(0xfff2dd, 0x2a2030, 1.1));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.2);
  key.position.set(-5, -6, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, near: 1, far: 60 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const lantern = new THREE.PointLight(0xffc27a, 45, 40, 1.6);
  lantern.position.set(1.5, 0.5, 12);
  scene.add(lantern);
  const candles = [[-0.42, 0.38], [0.43, 0.36]].map(([x, y]) => {
    const l = new THREE.PointLight(warm, 0, 16, 1.5);
    l.position.set(x * MAT.w, y * MAT.h, 2.4);
    scene.add(l);
    return l;
  });

  // The room and its furniture: the table, floor, walls, rug, lights… from the room layout (Lounge).
  const W = MAT.w * MAT_ART;
  const H = MAT.h * MAT_ART;
  const decor = buildRoomDecor(scene, sanitizeRoom(room), { tableW: TABLE_SIZE.w, tableH: TABLE_SIZE.h, portraitUrl, faction: owner.faction, info: owner.info, art: decorArt });

  // The mat: the board image with its relief, a thin dark edge.
  const matMat = keep(new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.05 }));
  const edge = keep(new THREE.MeshStandardMaterial({ color: '#1a1220', roughness: 0.95 }));
  const mat = new THREE.Mesh(keep(new THREE.BoxGeometry(W, H, 0.1)), [edge, edge, edge, edge, matMat, edge]);
  mat.position.z = MAT.top - 0.05;
  mat.receiveShadow = true;
  scene.add(mat);
  let disposed = false;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // The table may have closed while the picture loaded.
    if (disposed) return;
    const t = keep(new THREE.Texture(img));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    t.needsUpdate = true;
    matMat.map = t;
    let normals = normalCache.get(boardUrl);
    if (!normals) {
      normals = normalMapFrom(img);
      if (normalCache.size >= 3) normalCache.delete(normalCache.keys().next().value!);
      normalCache.set(boardUrl, normals);
    }
    matMat.normalMap = keep(new THREE.CanvasTexture(normals));
    matMat.normalScale.setScalar(1.4);
    matMat.needsUpdate = true;
  };
  img.src = boardUrl;

  return {
    scene,
    mat,
    decor,
    update(t, dt) {
      decor.update(t, dt);
      candles.forEach((l, i) => (l.intensity = 9 + Math.sin(t * 11 + i * 3) * 1.4 + Math.sin(t * 23 + i) * 1 + Math.sin(t * 3.1 + i * 2) * 1.8));
    },
    dispose: () => {
      disposed = true;
      img.onload = null;
      disposables.forEach((d) => d.dispose());
      decor.dispose();
      key.shadow.dispose();
    },
  };
}
