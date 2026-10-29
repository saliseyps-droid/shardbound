import * as THREE from 'three';
import { Bag, DecorContext, canvasTexture, glow, mesh, rng, std, woodTexture } from './kit';
import type { Built } from './tables';
import { mergeGeometries } from './tables';

/**
 * Furniture: built standing on z = 0, its front facing -y, within about 6 × 6 and 14 high; the room
 * stands it in a slot on the floor, turned towards the table.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

const oak = (bag: Bag, seed = 301) => std(bag, { map: bag.keep(woodTexture('#5a3a20', '25,12,4', seed)), roughness: 0.75 });
const ironM = (bag: Bag) => std(bag, { color: '#3a3438', metalness: 0.7, roughness: 0.45 });
const gold = (bag: Bag) => std(bag, { color: '#d9aa3a', metalness: 0.9, roughness: 0.25 });
const stone = (bag: Bag, color = '#9a948a') => std(bag, { color, roughness: 0.85 });
const up = (g: THREE.BufferGeometry) => g.rotateX(Math.PI / 2);

function barrel(bag: Bag, mat: THREE.Material, band: THREE.Material) {
  const g = new THREE.Group();
  const pts = Array.from({ length: 9 }, (_, i) => {
    const y = (i / 8) * 3.6;
    return new THREE.Vector2(1.2 + Math.sin((i / 8) * Math.PI) * 0.25, y);
  });
  const body = mesh(up(new THREE.LatheGeometry(pts, 20)), mat, bag);
  const cap = mesh(new THREE.CircleGeometry(1.2, 20), mat, bag, [0, 0, 3.6]);
  g.add(body, cap);
  for (const z of [0.5, 3.1]) g.add(mesh(new THREE.TorusGeometry(1.36, 0.06, 6, 24), band, bag, [0, 0, z]));
  return g;
}

export const FURNITURE: Record<string, Make> = {
  fu_barrels: (_c, bag) => {
    const g = new THREE.Group();
    const w = oak(bag, 302);
    const band = ironM(bag);
    for (const [x, y, z] of [[-1.3, 0, 0], [1.3, 0.2, 0], [0, 0.1, 3.6]]) {
      const b = barrel(bag, w, band);
      b.position.set(x, y, z);
      g.add(b);
    }
    return { root: g };
  },
  fu_plant: (_c, bag) => {
    const g = new THREE.Group();
    g.add(mesh(up(new THREE.CylinderGeometry(1.5, 1.1, 2.4, 16)), std(bag, { color: '#a85a3a', roughness: 0.9 }), bag, [0, 0, 1.2]));
    const leaf = std(bag, { color: '#3a7a2a', roughness: 0.7, side: THREE.DoubleSide });
    const r = rng(311);
    const leaves: THREE.Mesh[] = [];
    for (let i = 0; i < 14; i++) {
      const l = mesh(new THREE.SphereGeometry(1, 8, 6), leaf, bag, [0, 0, 2.4]);
      const a = (i / 14) * Math.PI * 2;
      l.scale.set(0.35, 0.12, 2.4 + r() * 1.5);
      l.position.set(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 4.2 + r());
      l.rotation.set(Math.sin(a) * 0.6, -Math.cos(a) * 0.6, 0);
      g.add(l);
      leaves.push(l);
    }
    return { root: g, update: (t) => leaves.forEach((l, i) => (l.rotation.z = Math.sin(t * 0.8 + i) * 0.05)) };
  },
  fu_bookshelf: (_c, bag) => {
    const g = new THREE.Group();
    const w = oak(bag, 303);
    const W = 6;
    const D = 2;
    const H = 13;
    g.add(mesh(new THREE.BoxGeometry(W, 0.3, H), w, bag, [0, D / 2, H / 2]));
    for (const x of [-W / 2, W / 2]) g.add(mesh(new THREE.BoxGeometry(0.3, D, H), w, bag, [x, 0, H / 2]));
    const r = rng(304);
    const colors = ['#7a2a1a', '#2a4a6a', '#8a6a2a', '#3a5a2a', '#5a2a4a', '#a8865a'];
    const mats = colors.map((c) => std(bag, { color: c, roughness: 0.8 }));
    const book = bag.keep(new THREE.BoxGeometry(1, 1, 1));
    for (let s = 0; s < 5; s++) {
      const z = 0.3 + s * 2.6;
      g.add(mesh(new THREE.BoxGeometry(W, D, 0.25), w, bag, [0, 0, z]));
      let x = -W / 2 + 0.3;
      while (x < W / 2 - 0.6) {
        const bw = 0.25 + r() * 0.3;
        const bh = 1.4 + r() * 0.8;
        const b = new THREE.Mesh(book, mats[Math.floor(r() * mats.length)]);
        b.scale.set(bw, D * 0.8, bh);
        b.position.set(x + bw / 2, 0, z + 0.12 + bh / 2);
        if (r() < 0.08) b.rotation.y = 0.25;
        b.castShadow = true;
        g.add(b);
        x += bw + 0.02;
      }
    }
    g.add(mesh(new THREE.BoxGeometry(W, D, 0.3), w, bag, [0, 0, H]));
    return { root: g };
  },
  fu_globe: (_c, bag) => {
    const g = new THREE.Group();
    const w = oak(bag, 305);
    g.add(mesh(up(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 20)), w, bag, [0, 0, 0.2]));
    g.add(mesh(up(new THREE.CylinderGeometry(0.2, 0.3, 4, 10)), w, bag, [0, 0, 2.2]));
    const map = bag.keep(
      canvasTexture(512, 256, (x) => {
        const r = rng(306);
        x.fillStyle = '#3a6a9a';
        x.fillRect(0, 0, 512, 256);
        x.fillStyle = '#c8b07a';
        for (let i = 0; i < 9; i++) {
          x.beginPath();
          const cx = r() * 512;
          const cy = 40 + r() * 176;
          for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * Math.PI * 2;
            const rr = 20 + r() * 30;
            x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7);
          }
          x.fill();
        }
      }),
    );
    const ball = mesh(new THREE.SphereGeometry(2.2, 32, 20), std(bag, { map, roughness: 0.5 }), bag);
    const tilt = new THREE.Group();
    tilt.position.set(0, 0, 6.4);
    tilt.rotation.y = 0.4;
    ball.rotation.x = Math.PI / 2;
    tilt.add(ball);
    const ring = mesh(new THREE.TorusGeometry(2.45, 0.08, 6, 40), gold(bag), bag);
    ring.rotation.y = Math.PI / 2;
    tilt.add(ring);
    g.add(tilt);
    return { root: g, update: (t) => (ball.rotation.y = t * 0.25) };
  },
  fu_chest: (_c, bag) => {
    const g = new THREE.Group();
    const w = oak(bag, 307);
    const band = gold(bag);
    g.add(mesh(new THREE.BoxGeometry(5, 3, 2.6), w, bag, [0, 0, 1.3]));
    for (const x of [-1.8, 1.8]) g.add(mesh(new THREE.BoxGeometry(0.3, 3.1, 2.7), band, bag, [x, 0, 1.3]));
    const lid = new THREE.Group();
    lid.position.set(0, 1.5, 2.6);
    const lidBox = mesh(new THREE.CylinderGeometry(1.5, 1.5, 5, 16, 1, false, 0, Math.PI), w, bag, [0, -1.5, 0]);
    lidBox.rotation.z = Math.PI / 2;
    lid.add(lidBox);
    lid.rotation.x = -0.9;
    g.add(lid);
    const coins = new THREE.Mesh(bag.keep(new THREE.BoxGeometry(4.6, 2.6, 0.3)), glow(bag, '#ffd27a'));
    coins.position.set(0, 0, 2.5);
    const light = new THREE.PointLight(0xffd27a, 10, 10, 1.6);
    light.position.set(0, -0.5, 4);
    g.add(coins, light);
    return { root: g, update: (t) => (light.intensity = 9 + Math.sin(t * 2) * 2) };
  },
  fu_armor: (_c, bag) => {
    const g = new THREE.Group();
    const steel = std(bag, { color: '#a8b0b8', metalness: 0.9, roughness: 0.3 });
    const w = oak(bag, 308);
    g.add(mesh(new THREE.BoxGeometry(3, 2.4, 0.4), w, bag, [0, 0, 0.2]));
    g.add(mesh(up(new THREE.CylinderGeometry(0.15, 0.15, 9, 8)), w, bag, [0, 0.3, 4.6]));
    // Legs, body, shoulders, helmet.
    for (const x of [-0.5, 0.5]) g.add(mesh(up(new THREE.CylinderGeometry(0.32, 0.26, 3.4, 10)), steel, bag, [x, 0, 2.3]));
    g.add(mesh(up(new THREE.CylinderGeometry(1.1, 0.8, 3, 14)), steel, bag, [0, 0, 5.4]));
    for (const x of [-1.25, 1.25]) g.add(mesh(new THREE.SphereGeometry(0.55, 12, 8), steel, bag, [x, 0, 6.7]));
    for (const x of [-1.35, 1.35]) g.add(mesh(up(new THREE.CylinderGeometry(0.26, 0.22, 2.6, 10)), steel, bag, [x, 0, 5.4]));
    const helm = mesh(new THREE.SphereGeometry(0.75, 16, 12), steel, bag, [0, 0, 7.8]);
    helm.scale.set(1, 1, 1.2);
    g.add(helm, mesh(new THREE.BoxGeometry(0.9, 0.1, 0.12), std(bag, { color: '#111' }), bag, [0, -0.74, 7.8]));
    // A shield leaning on the stand, a sword beside it.
    const shield = mesh(up(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 24)), std(bag, { color: '#7a1a1a', roughness: 0.6 }), bag, [1.9, -0.7, 1.6]);
    shield.rotation.set(0.2, 0, 0.2);
    g.add(shield);
    const sword = mesh(new THREE.BoxGeometry(0.2, 0.05, 4.4), steel, bag, [-1.9, -0.6, 2.4]);
    sword.rotation.y = 0.15;
    g.add(sword, mesh(new THREE.BoxGeometry(1.2, 0.2, 0.2), gold(bag), bag, [-1.75, -0.6, 3.6]));
    return { root: g };
  },
  fu_trophy: (_c, bag) => {
    const g = new THREE.Group();
    const w = oak(bag, 309);
    g.add(mesh(new THREE.BoxGeometry(5, 2.4, 1.2), w, bag, [0, 0, 0.6]));
    g.add(mesh(new THREE.BoxGeometry(5, 2.4, 0.4), w, bag, [0, 0, 10.2]));
    const glass = new THREE.Mesh(bag.keep(new THREE.BoxGeometry(4.8, 2.2, 9)), std(bag, { color: '#bfe0f0', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1, depthWrite: false }));
    glass.position.z = 5.7;
    const shelf = bag.keep(new THREE.BoxGeometry(4.6, 2, 0.15));
    const cups: THREE.Object3D[] = [];
    for (const z of [1.2, 4.2, 7.2]) {
      const s = new THREE.Mesh(shelf, w);
      s.position.z = z;
      g.add(s);
      for (const x of [-1.4, 0, 1.4]) {
        const cup = mesh(up(new THREE.LatheGeometry([[0, 0], [0.5, 0], [0.15, 0.3], [0.15, 1], [0.7, 1.4], [0.6, 2.2], [0, 2.2]].map(([a, b]) => new THREE.Vector2(a, b)), 16)), gold(bag), bag, [x, 0, z + 0.08]);
        cup.scale.setScalar(0.8 + ((x + 2) % 1) * 0.2);
        g.add(cup);
        cups.push(cup);
      }
    }
    g.add(glass);
    return { root: g };
  },
  fu_statue: (_c, bag) => {
    const g = new THREE.Group();
    const s = stone(bag);
    g.add(mesh(new THREE.BoxGeometry(4, 4, 2), stone(bag, '#7a746a'), bag, [0, 0, 1]));
    // A cloaked figure: a cone robe, a head, a raised sword.
    g.add(mesh(up(new THREE.ConeGeometry(1.6, 7, 12)), s, bag, [0, 0, 5.5]));
    g.add(mesh(new THREE.SphereGeometry(0.75, 14, 10), s, bag, [0, 0, 9.6]));
    const arm = mesh(up(new THREE.CylinderGeometry(0.25, 0.25, 3, 8)), s, bag, [0.9, 0, 9.4]);
    arm.rotation.y = -0.4;
    g.add(arm);
    g.add(mesh(new THREE.BoxGeometry(0.25, 0.12, 4.5), s, bag, [1.6, 0, 12.6]));
    return { root: g };
  },
  fu_dragon_skull: (_c, bag) => {
    const g = new THREE.Group();
    const bone = std(bag, { color: '#e2d8c4', roughness: 0.7 });
    g.add(mesh(new THREE.BoxGeometry(5, 4, 3), stone(bag, '#5a5450'), bag, [0, 0, 1.5]));
    const skull = mesh(new THREE.SphereGeometry(1.8, 16, 12), bone, bag, [0, 0.5, 4.8]);
    skull.scale.set(1, 1.2, 0.9);
    const snout = mesh(new THREE.BoxGeometry(1.8, 2.8, 1.2), bone, bag, [0, -1.6, 4.4]);
    const jaw = mesh(new THREE.BoxGeometry(1.6, 2.6, 0.4), bone, bag, [0, -1.4, 3.4]);
    g.add(skull, snout, jaw);
    const eye = std(bag, { color: '#110808', roughness: 1 });
    for (const x of [-0.8, 0.8]) g.add(mesh(new THREE.SphereGeometry(0.4, 10, 8), eye, bag, [x, -0.7, 5.3]));
    for (const x of [-1, 1]) {
      const horn = mesh(new THREE.ConeGeometry(0.45, 4, 10), bone, bag, [x * 1.3, 1.6, 6.3]);
      horn.rotation.set(-0.9, 0, x * 0.4);
      g.add(horn);
    }
    for (let i = 0; i < 5; i++) {
      const tooth = mesh(new THREE.ConeGeometry(0.12, 0.6, 6), bone, bag, [-0.6 + i * 0.3, -2.8, 3.7]);
      tooth.rotation.x = Math.PI;
      g.add(tooth);
    }
    return { root: g };
  },
  fu_anvil: (_c, bag) => {
    const g = new THREE.Group();
    const m = ironM(bag);
    g.add(mesh(new THREE.BoxGeometry(2, 2, 2.2), oak(bag, 310), bag, [0, 0, 1.1]));
    g.add(mesh(new THREE.BoxGeometry(1.2, 1, 1), m, bag, [0, 0, 2.7]));
    g.add(mesh(new THREE.BoxGeometry(3.2, 1.3, 0.8), m, bag, [0, 0, 3.6]));
    const horn = mesh(new THREE.ConeGeometry(0.6, 1.6, 10), m, bag, [-2.2, 0, 3.6]);
    horn.rotation.z = Math.PI / 2;
    g.add(horn);
    // The forge: a stone box of glowing coals with sparks of light.
    g.add(mesh(new THREE.BoxGeometry(3, 2.6, 2), stone(bag, '#4a4440'), bag, [0, 2.6, 1]));
    const coals = new THREE.Mesh(bag.keep(new THREE.BoxGeometry(2.6, 2.2, 0.3)), glow(bag, '#ff6a1a'));
    coals.position.set(0, 2.6, 2.05);
    const light = new THREE.PointLight(0xff6a1a, 14, 14, 1.6);
    light.position.set(0, 2, 3.5);
    g.add(coals, light);
    return { root: g, update: (t) => (light.intensity = 12 + Math.sin(t * 7) * 2 + Math.sin(t * 13) * 1.5) };
  },
  fu_tree: (_c, bag) => {
    const g = new THREE.Group();
    const bark = std(bag, { map: bag.keep(woodTexture('#4a3218', '20,12,4', 312)), roughness: 0.9 });
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.6, 0.3, 3), new THREE.Vector3(-0.4, -0.2, 6), new THREE.Vector3(0.3, 0, 8.5)];
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.55, 8), bark, bag));
    const leaf = std(bag, { color: '#4a8a2a', roughness: 0.8 });
    const r = rng(313);
    const crowns: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const c = mesh(new THREE.IcosahedronGeometry(1.8 + r(), 1), leaf, bag, [(r() - 0.5) * 3.4, (r() - 0.5) * 3.4, 8.5 + r() * 2.5]);
      g.add(c);
      crowns.push(c);
    }
    const fallMat = std(bag, { color: '#a8c84a', side: THREE.DoubleSide });
    const falling = Array.from({ length: 6 }, (_, i) => {
      const l = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(0.4, 0.25)), fallMat);
      l.userData.seed = i * 1.7;
      g.add(l);
      return l;
    });
    return {
      root: g,
      update: (t) => {
        crowns.forEach((c, i) => (c.rotation.z = Math.sin(t * 0.5 + i) * 0.04));
        falling.forEach((l) => {
          const k = ((t * 0.12 + l.userData.seed) % 1 + 1) % 1;
          l.position.set(Math.sin(l.userData.seed * 3) * 2.5 + Math.sin(t + l.userData.seed) * 0.6, Math.cos(l.userData.seed * 5) * 2.5, 9 - k * 9);
          l.rotation.set(t * 2 + l.userData.seed, t, 0);
        });
      },
    };
  },
  fu_golem: (_c, bag) => {
    const g = new THREE.Group();
    const brass = std(bag, { color: '#a8742a', metalness: 0.85, roughness: 0.35 });
    const dark = std(bag, { color: '#5a3a14', metalness: 0.8, roughness: 0.4 });
    for (const x of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(1.3, 1.6, 4.2), dark, bag, [x, 0, 2.1]));
    g.add(mesh(new THREE.BoxGeometry(4.6, 3, 4.4), brass, bag, [0, 0, 6.4]));
    for (const x of [-3, 3]) {
      g.add(mesh(new THREE.SphereGeometry(1, 12, 8), dark, bag, [x, 0, 8.2]));
      g.add(mesh(new THREE.BoxGeometry(1.1, 1.3, 4.6), brass, bag, [x * 1.05, 0, 5.4]));
    }
    g.add(mesh(new THREE.BoxGeometry(2.2, 2.2, 1.8), brass, bag, [0, 0, 9.6]));
    const eyeMat = glow(bag, '#7ae0ff');
    for (const x of [-0.5, 0.5]) {
      const e = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.22, 10, 8)), eyeMat);
      e.position.set(x, -1.1, 9.8);
      g.add(e);
    }
    // Rivets down the chest.
    const rivet = bag.keep(new THREE.SphereGeometry(0.12, 6, 4));
    for (let i = 0; i < 4; i++)
      for (const x of [-1.6, 1.6]) {
        const m = new THREE.Mesh(rivet, dark);
        m.position.set(x, -1.52, 4.8 + i * 1.1);
        g.add(m);
      }
    return {
      root: g,
      update: (t) => {
        // Now and then the eyes flicker awake.
        const k = (t % 7) / 7;
        eyeMat.opacity = k > 0.9 ? 0.4 + Math.abs(Math.sin(t * 30)) * 0.6 : 0.85;
        eyeMat.transparent = true;
      },
    };
  },
  fu_altar: (_c, bag) => {
    const g = new THREE.Group();
    const s = stone(bag, '#e6dfcc');
    g.add(mesh(new THREE.BoxGeometry(5, 3, 3.6), s, bag, [0, 0, 1.8]));
    g.add(mesh(new THREE.BoxGeometry(5.6, 3.6, 0.4), gold(bag), bag, [0, 0, 3.8]));
    g.add(mesh(up(new THREE.CylinderGeometry(0.6, 0.8, 0.5, 16)), gold(bag), bag, [0, 0, 4.25]));
    const beam = new THREE.Mesh(bag.keep(new THREE.CylinderGeometry(1.4, 2.2, 20, 20, 1, true)), bag.keep(new THREE.MeshBasicMaterial({ color: '#fff2c0', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })));
    beam.rotation.x = Math.PI / 2;
    beam.position.z = 14;
    const orb = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.5, 14, 10)), glow(bag, '#fff6d0'));
    orb.position.z = 5.2;
    const light = new THREE.PointLight(0xfff0c0, 12, 14, 1.6);
    light.position.set(0, -1, 6);
    g.add(beam, orb, light);
    return { root: g, update: (t) => (orb.position.z = 5.2 + Math.sin(t * 1.4) * 0.25) };
  },
  fu_harp: (_c, bag) => {
    const g = new THREE.Group();
    const frameMat = std(bag, { color: '#c8a24a', metalness: 0.8, roughness: 0.3 });
    g.add(mesh(new THREE.BoxGeometry(2.6, 1.4, 0.6), oak(bag, 314), bag, [0, 0, 0.3]));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.1, 0, 0.6), new THREE.Vector3(-1.3, 0, 5), new THREE.Vector3(-0.2, 0, 8.4), new THREE.Vector3(1.4, 0, 7.4), new THREE.Vector3(1.1, 0, 0.6)]);
    g.add(mesh(new THREE.TubeGeometry(curve, 40, 0.2, 8), frameMat, bag));
    const strMat = bag.keep(new THREE.MeshBasicMaterial({ color: '#cfa8ff', toneMapped: false }));
    const strings: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const x = -0.9 + i * 0.27;
      const top = 7.8 - Math.abs(x - 0.2) * 1.4;
      const s = new THREE.Mesh(bag.keep(new THREE.CylinderGeometry(0.025, 0.025, top - 0.6, 4)), strMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(x, 0, 0.6 + (top - 0.6) / 2);
      g.add(s);
      strings.push(s);
    }
    const light = new THREE.PointLight(0xb08aff, 6, 10, 1.6);
    light.position.set(0, -1.5, 4);
    g.add(light);
    return {
      root: g,
      // The unseen hand: one string after another trembles and lights up.
      update: (t) =>
        strings.forEach((s, i) => {
          const k = Math.max(0, 1 - Math.abs(((t * 1.6) % 10) - i - 1));
          s.position.y = Math.sin(t * 60 + i) * 0.04 * k;
          s.scale.x = s.scale.z = 1 + k * 1.5;
        }),
    };
  },
  fu_ice_statue: (_c, bag) => {
    const g = new THREE.Group();
    const ice = std(bag, { color: '#bfe8ff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75, emissive: '#3a7ab0', emissiveIntensity: 0.35 });
    g.add(mesh(new THREE.BoxGeometry(3.6, 3.6, 1.2), stone(bag, '#8aa8c0'), bag, [0, 0, 0.6]));
    // A rearing ice serpent: a tube spiralling up, a head on top.
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = i * 0.9;
      return new THREE.Vector3(Math.cos(a) * (1.2 - i * 0.08), Math.sin(a) * (1.2 - i * 0.08), 1.2 + i * 0.95);
    });
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.55, 10), ice, bag));
    const head = mesh(new THREE.ConeGeometry(0.7, 2, 8), ice, bag, [pts[9].x, pts[9].y - 0.6, pts[9].z + 0.4]);
    head.rotation.x = Math.PI / 2 + 0.6;
    g.add(head);
    const shards = mergeGeometries(
      Array.from({ length: 6 }, (_, i) => {
        const c = new THREE.ConeGeometry(0.3, 1.6, 5);
        c.rotateX(Math.PI / 2);
        c.translate(Math.cos(i) * 1.5, Math.sin(i) * 1.5, 2);
        return c;
      }),
    );
    g.add(mesh(shards, ice, bag));
    return { root: g };
  },
};
