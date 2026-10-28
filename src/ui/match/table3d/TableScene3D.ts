import * as THREE from 'three';
import { MAT } from './tableCamera';

/**
 * The room around the 3D table (WebGL): a stone floor, a wooden table on turned legs, the match's
 * board lying on it as a mat with relief (a normal map from the image's brightness), a hanging
 * lantern, two flickering candles and a lamp that follows the pointer. The camera is owned by
 * TableView; this only builds and animates the scene.
 */
export interface TableScene {
  scene: THREE.Scene;
  /** The mat mesh (for picking the point under the pointer). */
  mat: THREE.Mesh;
  /** Moves the pointer lamp over a point of the mat (world units), or hides it. */
  setPointer(p: { x: number; y: number } | null): void;
  update(t: number, dt: number): void;
  dispose(): void;
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const woodTexture = (base: string, dark: string) => {
  const t = canvasTexture(1024, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 160; i++) {
      const y = Math.random() * 256;
      g.strokeStyle = `rgba(${dark},${0.08 + Math.random() * 0.22})`;
      g.lineWidth = 0.6 + Math.random() * 2.4;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (Math.random() - 0.5) * 2);
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

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

export function buildTableScene(boardUrl: string, warm: string): TableScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0c0910');
  scene.fog = new THREE.Fog('#0c0910', 24, 60);
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
  const lamp = new THREE.PointLight(0xfff0d0, 0, 10, 1.4);
  lamp.position.set(0, 0, 3);
  scene.add(lamp);
  let lampTarget: { x: number; y: number } | null = null;

  // The table: a thick rounded top, an apron, four turned legs; a stone floor below.
  const W = MAT.w;
  const H = MAT.h;
  const topWood = keep(new THREE.MeshStandardMaterial({ map: keep(woodTexture('#5a3a22', '30,16,6')), roughness: 0.62, metalness: 0.02 }));
  topWood.map!.repeat.set(0.12, 0.3);
  const TW = W + 2.6;
  const TH = H + 2.6;
  const TD = 0.7;
  const shape = new THREE.Shape();
  {
    const r = 0.5;
    const a = TW / 2;
    const b = TH / 2;
    shape.moveTo(-a + r, -b);
    shape.lineTo(a - r, -b);
    shape.quadraticCurveTo(a, -b, a, -b + r);
    shape.lineTo(a, b - r);
    shape.quadraticCurveTo(a, b, a - r, b);
    shape.lineTo(-a + r, b);
    shape.quadraticCurveTo(-a, b, -a, b - r);
    shape.lineTo(-a, -b + r);
    shape.quadraticCurveTo(-a, -b, -a + r, -b);
  }
  const top = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(shape, { depth: TD, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.14, bevelSegments: 4 })), topWood);
  top.position.z = -TD - 0.12;
  top.castShadow = top.receiveShadow = true;
  scene.add(top);
  const legWood = keep(new THREE.MeshStandardMaterial({ map: keep(woodTexture('#3a2414', '15,8,3')), roughness: 0.7 }));
  const apron = new THREE.Mesh(keep(new THREE.BoxGeometry(TW - 1.6, TH - 1.6, 0.9)), legWood);
  apron.position.z = -TD - 0.55;
  scene.add(apron);
  const legPts = [[0.42, 0], [0.42, 0.5], [0.3, 0.8], [0.36, 1.4], [0.24, 2.4], [0.3, 4.8], [0.2, 6.4], [0.34, 7.2], [0.34, 7.8], [0, 7.8]].map(([r, y]) => new THREE.Vector2(r, -y));
  const legGeo = keep(new THREE.LatheGeometry(legPts, 24));
  legGeo.rotateX(Math.PI / 2);
  for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const l = new THREE.Mesh(legGeo, legWood);
    l.position.set(x * (TW / 2 - 1.1), y * (TH / 2 - 1.1), -TD - 0.2);
    l.castShadow = true;
    scene.add(l);
  }
  const floorTex = keep(
    canvasTexture(512, 512, (g) => {
      g.fillStyle = '#2b2530';
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const v = 34 + Math.random() * 14;
          g.fillStyle = `rgb(${v},${v - 4},${v + 4})`;
          g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122);
        }
    }),
  );
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(10, 10);
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(160, 160)), keep(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 })));
  floor.position.z = -9;
  floor.receiveShadow = true;
  scene.add(floor);

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
    setPointer: (p) => (lampTarget = p),
    update(t) {
      candles.forEach((l, i) => (l.intensity = 9 + Math.sin(t * 11 + i * 3) * 1.4 + Math.sin(t * 23 + i) * 1 + Math.sin(t * 3.1 + i * 2) * 1.8));
      lamp.intensity += ((lampTarget ? 10 : 0) - lamp.intensity) * 0.1;
      if (lampTarget) lamp.position.lerp(new THREE.Vector3(lampTarget.x, lampTarget.y, 3), 0.1);
    },
    dispose: () => {
      disposed = true;
      img.onload = null;
      disposables.forEach((d) => d.dispose());
      key.shadow.dispose();
    },
  };
}
