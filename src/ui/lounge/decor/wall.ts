import * as THREE from 'three';
import { Bag, DecorContext, FACTION_COLOR, ROOM, canvasTexture, flame, glow, loadArt, mesh, rng, std, woodTexture } from './kit';
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
  p_map: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(1024, 640, (g) => {
        const r = rng(211);
        g.fillStyle = '#d8c090';
        g.fillRect(0, 0, 1024, 640);
        for (let i = 0; i < 300; i++) {
          g.fillStyle = `rgba(120,90,40,${r() * 0.08})`;
          g.fillRect(r() * 1024, r() * 640, 40, 20);
        }
        // Islands.
        for (let k = 0; k < 4; k++) {
          const cx = 160 + k * 230 + r() * 40;
          const cy = 200 + r() * 260;
          g.fillStyle = ['#9ab070', '#b0a070', '#8aa868', '#a8b880'][k];
          g.strokeStyle = '#5a4020';
          g.lineWidth = 3;
          g.beginPath();
          for (let i = 0; i <= 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            const rr = 70 + r() * 50;
            g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7);
          }
          g.closePath();
          g.fill();
          g.stroke();
        }
        // A compass rose and a dotted route.
        g.strokeStyle = '#7a2a1a';
        g.setLineDash([10, 10]);
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(120, 520);
        g.bezierCurveTo(380, 300, 640, 560, 900, 160);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = '#5a4020';
        g.translate(900, 520);
        for (let i = 0; i < 4; i++) {
          g.rotate(Math.PI / 2);
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(12, 12);
          g.lineTo(0, 60);
          g.lineTo(-12, 12);
          g.fill();
        }
      }),
    );
    return { root: framed(bag, 16, 10, woodFrame(bag), std(bag, { map, roughness: 0.9 })) };
  },
  p_crown: (ctx, bag) => artPainting(ctx, bag, ctx.art('crown'), 17, 10.5, gilt(bag)),
  p_dragon: (ctx, bag) => artPainting(ctx, bag, ctx.art('dragon'), 17, 10.5, gilt(bag)),
  p_battle: (ctx, bag) => artPainting(ctx, bag, ctx.art('battle'), 20, 9, woodFrame(bag)),
  p_warden: (ctx, bag) => artPainting(ctx, bag, ctx.portraitUrl, 9, 12, gilt(bag)),
};

/** A cloth banner on a rod: faction colours, a border, an emblem; it sways a little. */
function banner(bag: Bag, [base, trim]: readonly [string, string], emblem: (g: CanvasRenderingContext2D) => void): Built {
  const map = bag.keep(
    canvasTexture(256, 512, (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 256, 512);
      g.fillStyle = 'rgba(0,0,0,.18)';
      for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 12, 512);
      g.strokeStyle = trim;
      g.lineWidth = 12;
      g.strokeRect(14, 14, 228, 440);
      g.save();
      g.translate(128, 220);
      g.fillStyle = trim;
      g.strokeStyle = trim;
      emblem(g);
      g.restore();
      // The swallowtail cut at the foot.
      g.globalCompositeOperation = 'destination-out';
      g.beginPath();
      g.moveTo(0, 512);
      g.lineTo(128, 440);
      g.lineTo(256, 512);
      g.fill();
    }),
  );
  const geo = bag.keep(new THREE.PlaneGeometry(6, 12, 8, 12));
  const base0 = (geo.getAttribute('position').array as Float32Array).slice();
  const cloth = new THREE.Mesh(geo, std(bag, { map, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }));
  cloth.rotation.x = Math.PI / 2;
  cloth.position.y = -0.4;
  const rod = mesh(new THREE.CylinderGeometry(0.15, 0.15, 7.4, 8), std(bag, { color: '#3a2a1a', metalness: 0.5, roughness: 0.5 }), bag, [0, -0.4, 6]);
  rod.rotation.z = Math.PI / 2;
  const g = new THREE.Group();
  g.add(cloth, rod);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  return {
    root: g,
    update: (t) => {
      for (let i = 0; i < pos.count; i++) {
        const y = base0[i * 3 + 1];
        const hang = (6 - y) / 12; // 0 at the rod, 1 at the foot
        pos.setZ(i, Math.sin(t * 1.3 + y * 0.5) * 0.25 * hang);
      }
      pos.needsUpdate = true;
    },
  };
}

const emblems = {
  flame: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(0, -70);
    g.bezierCurveTo(50, -10, 40, 50, 0, 60);
    g.bezierCurveTo(-40, 50, -50, -10, 0, -70);
    g.fill();
  },
  leaf: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.ellipse(0, 0, 34, 70, 0.4, 0, Math.PI * 2);
    g.fill();
  },
  gear: (g: CanvasRenderingContext2D) => {
    g.lineWidth = 18;
    g.beginPath();
    g.arc(0, 0, 44, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      g.rotate(Math.PI / 4);
      g.fillRect(-10, -72, 20, 24);
    }
  },
  sun: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 8;
    for (let i = 0; i < 12; i++) {
      g.rotate(Math.PI / 6);
      g.beginPath();
      g.moveTo(0, 40);
      g.lineTo(0, 70);
      g.stroke();
    }
  },
  eye: (g: CanvasRenderingContext2D) => {
    g.lineWidth = 10;
    g.beginPath();
    g.ellipse(0, 0, 64, 34, 0, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(0, 0, 18, 0, Math.PI * 2);
    g.fill();
  },
  snow: (g: CanvasRenderingContext2D) => {
    g.lineWidth = 10;
    for (let i = 0; i < 3; i++) {
      g.rotate(Math.PI / 3);
      g.beginPath();
      g.moveTo(0, -70);
      g.lineTo(0, 70);
      g.stroke();
    }
  },
};

export const POSTERS: Record<string, Make> = {
  po_wanted: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(384, 512, (g) => {
        const r = rng(221);
        g.fillStyle = '#d8c08a';
        g.fillRect(0, 0, 384, 512);
        for (let i = 0; i < 200; i++) {
          g.fillStyle = `rgba(110,80,30,${r() * 0.1})`;
          g.fillRect(r() * 384, r() * 512, 30, 14);
        }
        g.fillStyle = '#3a2410';
        g.textAlign = 'center';
        g.font = 'bold 64px serif';
        g.fillText('WANTED', 192, 84);
        g.strokeStyle = '#3a2410';
        g.lineWidth = 4;
        g.strokeRect(72, 112, 240, 220);
        // A rough face.
        g.beginPath();
        g.arc(192, 210, 60, 0, Math.PI * 2);
        g.moveTo(130, 330);
        g.quadraticCurveTo(192, 260, 254, 330);
        g.stroke();
        g.font = 'bold 40px serif';
        g.fillText('1000 GOLD', 192, 400);
        g.font = '24px serif';
        g.fillText('dead or alive', 192, 440);
      }),
    );
    return { root: framed(bag, 7, 9.3, std(bag, { color: '#3a2a1a' }), std(bag, { map, roughness: 0.95 }), 0.15) };
  },
  po_legend: (ctx, bag) => artPainting(ctx, bag, ctx.art('legend'), 7, 9.8, gilt(bag)),
  po_cinder: (_c, bag) => banner(bag, FACTION_COLOR.cinder, emblems.flame),
  po_thorn: (_c, bag) => banner(bag, FACTION_COLOR.thorn, emblems.leaf),
  po_brass: (_c, bag) => banner(bag, FACTION_COLOR.brass, emblems.gear),
  po_lumen: (_c, bag) => banner(bag, FACTION_COLOR.lumen, emblems.sun),
  po_hollow: (_c, bag) => banner(bag, FACTION_COLOR.hollow, emblems.eye),
  po_rime: (_c, bag) => banner(bag, FACTION_COLOR.rime, emblems.snow),
};

// ---------- Lights: a pair on the side walls (both the same piece). ----------

/** Where the two lights hang (world), facing into the room. */
export const LIGHT_SPOTS: { at: THREE.Vector3; face: number }[] = [
  { at: new THREE.Vector3(-ROOM.x, -6, 8), face: Math.PI / 2 },
  { at: new THREE.Vector3(ROOM.x, -6, 8), face: -Math.PI / 2 },
];

/** One light's look, built facing -y at the wall; returns its light so the pair can flicker. */
type OneLight = (bag: Bag, seed: number) => { g: THREE.Group; light: THREE.PointLight; base: number; update?: (t: number) => void };

const iron = (bag: Bag) => std(bag, { color: '#3a2a1a', metalness: 0.6, roughness: 0.5 });
const fire = (bag: Bag) => glow(bag, '#ffb35a');

const LIGHT_LOOKS: Record<string, OneLight> = {
  l_torch: (bag, seed) => {
    const g = new THREE.Group();
    const holder = mesh(new THREE.CylinderGeometry(0.25, 0.15, 2.2, 8), iron(bag), bag, [0, -0.6, 0]);
    holder.rotation.x = Math.PI / 2;
    const f = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.45, 12, 8)), fire(bag));
    f.scale.set(1, 1, 1.6);
    f.position.set(0, -0.6, 1.5);
    const light = new THREE.PointLight(0xffa64a, 30, 45, 1.6);
    light.position.set(0, -1.5, 2);
    g.add(holder, f, light);
    return { g, light, base: 30, update: (t) => f.scale.set(1, 1, 1.5 + Math.sin(t * 13 + seed) * 0.15) };
  },
  l_lantern: (bag) => {
    const g = new THREE.Group();
    const arm = mesh(new THREE.BoxGeometry(0.18, 2, 0.18), iron(bag), bag, [0, -1, 2.4]);
    const cage = mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 6, 1, true), std(bag, { color: '#2a1e14', metalness: 0.6, roughness: 0.5, wireframe: true }), bag, [0, -2, 1.2]);
    cage.rotation.x = Math.PI / 2;
    const glass = new THREE.Mesh(bag.keep(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 6)), glow(bag, '#ffd27a', 0.85));
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, -2, 1.2);
    const roof = mesh(new THREE.ConeGeometry(0.75, 0.6, 6), iron(bag), bag, [0, -2, 2.3]);
    roof.rotation.x = Math.PI / 2;
    const light = new THREE.PointLight(0xffc27a, 26, 45, 1.6);
    light.position.set(0, -2.5, 1.2);
    g.add(arm, cage, glass, roof, light);
    return { g, light, base: 26 };
  },
  l_candelabra: (bag) => {
    const g = new THREE.Group();
    const brass = std(bag, { color: '#b8892e', metalness: 0.85, roughness: 0.3 });
    g.add(mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), brass, bag, [0, -0.7, 0]));
    g.add(mesh(new THREE.BoxGeometry(3, 0.2, 0.2), brass, bag, [0, -1.4, 0]));
    const flames: THREE.Mesh[] = [];
    for (const x of [-1.4, 0, 1.4]) {
      g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 10).rotateX(Math.PI / 2), std(bag, { color: '#efe6d0', roughness: 0.6 }), bag, [x, -1.4, 0.65]));
      const f = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.16, 8, 6)), fire(bag));
      f.scale.set(1, 1, 1.8);
      f.position.set(x, -1.4, 1.4);
      g.add(f);
      flames.push(f);
    }
    const light = new THREE.PointLight(0xffd08a, 24, 42, 1.6);
    light.position.set(0, -2.2, 1.6);
    g.add(light);
    return { g, light, base: 24 };
  },
  l_crystal: (bag, seed) => {
    const g = new THREE.Group();
    const mat = std(bag, { color: '#7ae0ff', emissive: '#3ab8ff', emissiveIntensity: 1.4, roughness: 0.1, transparent: true, opacity: 0.9 });
    const r = rng(231 + seed);
    for (let i = 0; i < 4; i++) {
      const c = mesh(new THREE.OctahedronGeometry(0.5 + r() * 0.4, 0), mat, bag, [(r() - 0.5) * 1.4, -0.5, (r() - 0.5) * 1.2]);
      c.scale.set(0.6, 0.6, 1.6 + r());
      c.rotation.set(r(), r(), r());
      g.add(c);
    }
    const light = new THREE.PointLight(0x7ad0ff, 26, 45, 1.6);
    light.position.set(0, -2, 0.5);
    g.add(light);
    return { g, light, base: 26, update: (t) => (mat.emissiveIntensity = 1.2 + Math.sin(t * 1.5 + seed) * 0.3) };
  },
  l_brazier: (bag, seed) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.25, 1.8, 0.25), iron(bag), bag, [0, -0.9, -0.6]));
    const bowl = mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), iron(bag), bag, [0, -1.9, 0]);
    bowl.rotation.x = -Math.PI / 2;
    const f = new THREE.Mesh(bag.keep(new THREE.ConeGeometry(0.8, 2.6, 10)), glow(bag, '#ff7a20', 0.9));
    f.rotation.x = Math.PI / 2;
    f.position.set(0, -1.9, 1.3);
    const light = new THREE.PointLight(0xff8a3a, 34, 48, 1.6);
    light.position.set(0, -2.5, 2);
    g.add(bowl, f, light);
    return { g, light, base: 34, update: (t) => f.scale.set(1 + Math.sin(t * 11 + seed) * 0.08, 1, 1 + Math.sin(t * 15 + seed) * 0.15) };
  },
  l_wisp: (bag, seed) => {
    const g = new THREE.Group();
    const mat = glow(bag, '#9aff8a');
    const motes = Array.from({ length: 4 }, () => {
      const m = new THREE.Mesh(bag.keep(new THREE.SphereGeometry(0.28, 10, 8)), mat);
      g.add(m);
      return m;
    });
    const light = new THREE.PointLight(0x8aff7a, 22, 42, 1.6);
    light.position.set(0, -2, 0);
    g.add(light);
    return {
      g,
      light,
      base: 22,
      update: (t) =>
        motes.forEach((m, i) => {
          const a = t * (0.6 + i * 0.15) + i * 1.7 + seed;
          m.position.set(Math.cos(a) * 1.6, -1.8 + Math.sin(a * 1.3) * 0.6, Math.sin(a) * 1.2);
        }),
    };
  },
};

export const LIGHTS: Record<string, Make> = Object.fromEntries(
  Object.entries(LIGHT_LOOKS).map(([id, look]) => [
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
