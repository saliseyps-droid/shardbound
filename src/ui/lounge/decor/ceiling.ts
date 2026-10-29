import * as THREE from 'three';
import { Bag, DecorContext, FACTION_COLOR, ROOM, glow, mesh, modelPiece, std } from './kit';
import type { Built } from './tables';

/**
 * Hung from the ceiling over the table: high enough (z ≈ 19) to stay above the match camera's view of
 * the board, low enough to be seen when looking around the room.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const CEIL = ROOM.floor + ROOM.wallH;
const HANG = 19;

const chain = (bag: Bag, x: number, y: number, from: number, to: number) => {
  const c = mesh(new THREE.CylinderGeometry(0.06, 0.06, from - to, 5), std(bag, { color: '#2a2428', metalness: 0.7, roughness: 0.5 }), bag, [x, y, (from + to) / 2]);
  c.rotation.x = Math.PI / 2;
  return c;
};

export const CEILINGS: Record<string, Make> = {
  c_lantern: (_c, bag) => {
    const g = new THREE.Group();
    g.add(chain(bag, 0, 0, CEIL, HANG + 1.4));
    const iron = std(bag, { color: '#2a1e14', metalness: 0.6, roughness: 0.5 });
    const roof = mesh(new THREE.ConeGeometry(1.1, 0.9, 6), iron, bag, [0, 0, HANG + 1.1]);
    roof.rotation.x = Math.PI / 2;
    const glass = new THREE.Mesh(bag.keep(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 6)), glow(bag, '#ffd27a', 0.9));
    glass.rotation.x = Math.PI / 2;
    glass.position.z = HANG;
    const base = mesh(new THREE.CylinderGeometry(0.95, 0.7, 0.3, 6), iron, bag, [0, 0, HANG - 1]);
    base.rotation.x = Math.PI / 2;
    const light = new THREE.PointLight(0xffc27a, 30, 40, 1.6);
    light.position.set(0, 0, HANG - 1.5);
    g.add(roof, glass, base, light);
    return { root: g, update: (t) => (g.rotation.z = Math.sin(t * 0.6) * 0.05) };
  },
  c_chandelier: (_c, bag) => {
    // A downloaded chandelier (Poly Haven, CC0), on a chain from the ceiling, with a warm light.
    const g = new THREE.Group();
    const m = modelPiece(bag, 'Chandelier_01', { width: 7 });
    m.position.z = HANG - 2;
    const light = new THREE.PointLight(0xffc27a, 34, 44, 1.6);
    light.position.set(0, 0, HANG - 1);
    g.add(m, chain(bag, 0, 0, CEIL, HANG + 2), light);
    return { root: g, update: (t) => (light.intensity = 34 * (1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 17) * 0.04)) };
  },
  c_chandelier_drawn: (_c, bag) => {
    const g = new THREE.Group();
    const iron = std(bag, { color: '#2a2428', metalness: 0.7, roughness: 0.45 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const c = chain(bag, Math.cos(a) * 1.8, Math.sin(a) * 1.8, CEIL, HANG);
      g.add(c);
    }
    g.add(mesh(new THREE.TorusGeometry(3.4, 0.16, 8, 40), iron, bag, [0, 0, HANG]));
    const flames: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const x = Math.cos(a) * 3.4;
      const y = Math.sin(a) * 3.4;
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 8).rotateX(Math.PI / 2), std(bag, { color: '#efe6d0' }), bag, [x, y, HANG + 0.5]));
      const f = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.13, 6, 5)), glow(bag, '#ffb35a'));
      f.scale.set(1, 1, 1.8);
      f.position.set(x, y, HANG + 1.05);
      g.add(f);
      flames.push(f);
    }
    const light = new THREE.PointLight(0xffc27a, 34, 44, 1.6);
    light.position.set(0, 0, HANG);
    g.add(light);
    return { root: g, update: (t) => (light.intensity = 34 * (1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 17) * 0.04)) };
  },
  c_banners: (_c, bag) => {
    const g = new THREE.Group();
    const colors = Object.values(FACTION_COLOR);
    const rod = mesh(new THREE.CylinderGeometry(0.12, 0.12, 30, 8), std(bag, { color: '#3a2a1a', metalness: 0.5, roughness: 0.5 }), bag, [0, 6, HANG + 3]);
    rod.rotation.z = Math.PI / 2;
    g.add(rod, chain(bag, -14, 6, CEIL, HANG + 3), chain(bag, 14, 6, CEIL, HANG + 3));
    const cloths = colors.map(([base, trim], i) => {
      const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(3, 6)), std(bag, { color: base, side: THREE.DoubleSide, roughness: 0.9, emissive: trim, emissiveIntensity: 0.05 }));
      m.rotation.x = Math.PI / 2;
      m.position.set(-12.5 + i * 5, 6, HANG);
      g.add(m);
      return m;
    });
    return { root: g, update: (t) => cloths.forEach((c, i) => (c.rotation.y = Math.sin(t * 0.9 + i) * 0.06)) };
  },
  c_orb: (_c, bag) => {
    const g = new THREE.Group();
    const orb = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(1.2, 24, 16)), glow(bag, '#e6d8ff'));
    const halo = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(1.9, 24, 16)), bag.keep(new THREE.MeshBasicMaterial({ color: '#b08aff', transparent: true, opacity: 0.25, depthWrite: false, toneMapped: false })));
    const ring = new THREE.Group();
    const runeMat = glow(bag, '#cfa8ff');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = new THREE.Mesh(bag.keep(new THREE.BoxGeometry(0.5, 0.12, 0.7)), runeMat);
      r.position.set(Math.cos(a) * 3, Math.sin(a) * 3, 0);
      r.rotation.z = a;
      ring.add(r);
    }
    const light = new THREE.PointLight(0xc8a8ff, 30, 40, 1.6);
    g.add(orb, halo, ring, light);
    g.position.z = HANG;
    return {
      root: g,
      update: (t) => {
        g.position.z = HANG + Math.sin(t * 0.8) * 0.4;
        ring.rotation.z = t * 0.4;
        ring.rotation.x = Math.sin(t * 0.3) * 0.3;
        halo.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
      },
    };
  },
};
