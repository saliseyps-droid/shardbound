import * as THREE from 'three';
import { Bag, PER_METRE } from './kit';
import { scanned } from './surfaces';

/**
 * Real materials on flat-coloured models: a model's plain colours (by material name) swapped for scanned
 * Poly Haven textures (public/decor/tex), laid on by box projection at their real size, so a low-poly
 * piece gets stone that looks like stone and wood like wood.
 */

export interface Skin {
  /** Poly Haven texture id (public/decor/tex/<id>). */
  tex: string;
  /** How much of the world one copy of the texture covers (metres). */
  metres: number;
  /** Multiplies the colour map (lighter or darker parts of the same piece). */
  tint?: string;
  roughness?: number;
}

/**
 * Gives every face UVs from the plane it mostly faces (x–y, x–z or y–z), in room units divided by
 * `size`, using the mesh's own scale in the piece so the texture keeps its real size.
 */
export function boxUv(mesh: THREE.Mesh, size: number) {
  const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const s = mesh.getWorldScale(new THREE.Vector3());
  const uv = new Float32Array(pos.count * 2);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i + 2 < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i).multiply(s);
    b.fromBufferAttribute(pos, i + 1).multiply(s);
    c.fromBufferAttribute(pos, i + 2).multiply(s);
    n.subVectors(c, b).cross(b.clone().sub(a));
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    [a, b, c].forEach((p, k) => {
      const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
      uv[(i + k) * 2] = u / size;
      uv[(i + k) * 2 + 1] = v / size;
    });
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (geo !== mesh.geometry) mesh.geometry = geo;
}

/** The model's materials named in `skins` become scanned ones (call from a ModelFit's onLoad). */
export function skin(bag: Bag, model: THREE.Object3D, skins: Record<string, Skin>) {
  const made = new Map<string, THREE.Material>();
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const name = (m.material as THREE.Material).name;
    const k = skins[name];
    if (!k) return;
    boxUv(m, k.metres * PER_METRE);
    bag.keep(m.geometry);
    if (!made.has(name)) made.set(name, scanned(bag, k.tex, 1, 1, { roughness: k.roughness ?? 0.9 }, k.tint));
    m.material = made.get(name)!;
  });
}
