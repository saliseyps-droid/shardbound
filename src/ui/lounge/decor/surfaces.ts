import * as THREE from 'three';
import { Bag, DecorContext, ROOM, blockTexture, canvasTexture, marbleTexture, plankTexture, rng, std, tileTexture } from './kit';
import type { Built } from './tables';

/** The big surfaces: the floor, the four walls (one piece for all), the rug under the table. */

// ---------- Floors: a 160 × 160 plane at the floor's height (fog hides its far edge). ----------

const floorPlane = (bag: Bag, mat: THREE.Material) => {
  const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(160, 160)), mat);
  m.position.z = ROOM.floor;
  m.receiveShadow = true;
  return m;
};
const repeat = (t: THREE.Texture, n: number) => (t.repeat.set(n, n), t);

const FLOORS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  f_stone: (_c, bag) => {
    const t = repeat(bag.keep(tileTexture('#2b2530', (r) => { const v = 34 + r() * 14; return `rgb(${v},${v - 4},${v + 4})`; })), 10);
    return { root: floorPlane(bag, std(bag, { map: t, roughness: 0.95 })) };
  },
  f_planks: (_c, bag) => {
    const t = repeat(bag.keep(plankTexture([96, 62, 38], 8, 101)), 7);
    t.rotation = Math.PI / 2;
    return { root: floorPlane(bag, std(bag, { map: t, roughness: 0.75 })) };
  },
  f_checker: (_c, bag) => {
    const t = repeat(
      bag.keep(
        canvasTexture(
          512,
          512,
          (g) => {
            for (let i = 0; i < 2; i++)
              for (let j = 0; j < 2; j++) {
                g.fillStyle = (i + j) % 2 ? '#16141c' : '#e6e0d6';
                g.fillRect(i * 256, j * 256, 256, 256);
              }
            const r = rng(102);
            g.globalAlpha = 0.25;
            for (let i = 0; i < 30; i++) {
              g.strokeStyle = r() > 0.5 ? '#9a948a' : '#3a3644';
              g.beginPath();
              g.moveTo(r() * 512, r() * 512);
              g.lineTo(r() * 512, r() * 512);
              g.stroke();
            }
          },
          true,
        ),
      ),
      26,
    );
    return { root: floorPlane(bag, std(bag, { map: t, roughness: 0.18, metalness: 0.05 })) };
  },
  f_moss: (_c, bag) => {
    const t = repeat(
      bag.keep(
        canvasTexture(
          512,
          512,
          (g) => {
            const r = rng(103);
            g.fillStyle = '#2e4a1c';
            g.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 1600; i++) {
              g.fillStyle = `rgba(${60 + r() * 50},${90 + r() * 60},${30 + r() * 20},.45)`;
              g.beginPath();
              g.arc(r() * 512, r() * 512, 2 + r() * 6, 0, Math.PI * 2);
              g.fill();
            }
            g.strokeStyle = '#4a3218';
            g.lineCap = 'round';
            for (let i = 0; i < 9; i++) {
              g.lineWidth = 4 + r() * 6;
              g.beginPath();
              let x = r() * 512;
              let y = r() * 512;
              g.moveTo(x, y);
              for (let k = 0; k < 6; k++) g.lineTo((x += (r() - 0.5) * 120), (y += (r() - 0.5) * 120));
              g.stroke();
            }
            for (let i = 0; i < 60; i++) {
              g.fillStyle = ['#e8d06a', '#e88aa8', '#f4f0e0'][i % 3];
              g.beginPath();
              g.arc(r() * 512, r() * 512, 2.5, 0, Math.PI * 2);
              g.fill();
            }
          },
          true,
        ),
      ),
      8,
    );
    return { root: floorPlane(bag, std(bag, { map: t, roughness: 1 })) };
  },
  f_ice: (_c, bag) => {
    const t = repeat(
      bag.keep(
        canvasTexture(
          512,
          512,
          (g) => {
            const r = rng(104);
            const gr = g.createRadialGradient(256, 256, 40, 256, 256, 360);
            gr.addColorStop(0, '#5a9ac8');
            gr.addColorStop(1, '#244a72');
            g.fillStyle = gr;
            g.fillRect(0, 0, 512, 512);
            g.strokeStyle = 'rgba(230,248,255,.55)';
            for (let i = 0; i < 26; i++) {
              g.lineWidth = 0.6 + r() * 1.6;
              g.beginPath();
              let x = r() * 512;
              let y = r() * 512;
              g.moveTo(x, y);
              for (let k = 0; k < 4; k++) g.lineTo((x += (r() - 0.5) * 140), (y += (r() - 0.5) * 140));
              g.stroke();
            }
          },
          true,
        ),
      ),
      6,
    );
    return { root: floorPlane(bag, std(bag, { map: t, roughness: 0.06, metalness: 0.15 })) };
  },
  f_lava: (_c, bag) => {
    const t = repeat(bag.keep(tileTexture('#ff5a10', (r) => { const v = 26 + r() * 12; return `rgb(${v + 4},${v},${v})`; }, 4, 105)), 10);
    const e = repeat(bag.keep(tileTexture('#ff7a20', () => '#000', 4, 105)), 10);
    const m = std(bag, { map: t, emissiveMap: e, emissive: '#ff5a10', emissiveIntensity: 1.4, roughness: 0.85 });
    return { root: floorPlane(bag, m), update: (time) => (m.emissiveIntensity = 1.2 + Math.sin(time * 1.3) * 0.4) };
  },
};

// ---------- Walls: four planes standing on the floor, facing in. ----------

interface WallLook {
  map: THREE.Texture;
  /** World units one copy of the texture spans. */
  tile: number;
  mat?: THREE.MeshStandardMaterialParameters;
  emissive?: { map: THREE.Texture; color: string; intensity: number };
}

function walls(bag: Bag, look: WallLook): THREE.Group {
  const g = new THREE.Group();
  const H = ROOM.wallH;
  const one = (len: number, x: number, y: number, rot: number) => {
    const map = bag.keep(look.map.clone());
    map.needsUpdate = true;
    map.repeat.set(len / look.tile, H / look.tile);
    const p: THREE.MeshStandardMaterialParameters = { map, roughness: 0.95, ...look.mat };
    if (look.emissive) {
      const em = bag.keep(look.emissive.map.clone());
      em.needsUpdate = true;
      em.repeat.copy(map.repeat);
      Object.assign(p, { emissiveMap: em, emissive: look.emissive.color, emissiveIntensity: look.emissive.intensity });
    }
    const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(len, H)), std(bag, p));
    m.rotation.set(Math.PI / 2, rot, 0);
    m.position.set(x, y, ROOM.floor + H / 2);
    m.receiveShadow = true;
    g.add(m);
  };
  one(ROOM.x * 2, 0, ROOM.y, 0);
  one(ROOM.x * 2, 0, -ROOM.y, Math.PI);
  one(ROOM.y * 2, ROOM.x, 0, -Math.PI / 2);
  one(ROOM.y * 2, -ROOM.x, 0, Math.PI / 2);
  return g;
}

const WALLS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  w_stone: (_c, bag) => ({ root: walls(bag, { map: bag.keep(blockTexture('#211a22', (r) => { const v = 44 + r() * 18; return `rgb(${v},${v - 6},${v - 2})`; })), tile: 8 }) }),
  w_timber: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(
        512,
        512,
        (g) => {
          const r = rng(111);
          g.fillStyle = '#d6c8a8';
          g.fillRect(0, 0, 512, 512);
          for (let i = 0; i < 300; i++) {
            g.fillStyle = `rgba(120,100,70,${r() * 0.08})`;
            g.fillRect(r() * 512, r() * 512, 20 + r() * 40, 10 + r() * 30);
          }
          g.fillStyle = '#3a2414';
          g.fillRect(0, 0, 512, 28);
          g.fillRect(0, 484, 512, 28);
          g.fillRect(0, 0, 28, 512);
          g.fillRect(242, 0, 28, 512);
          g.lineWidth = 24;
          g.strokeStyle = '#3a2414';
          g.beginPath();
          g.moveTo(28, 484);
          g.lineTo(242, 28);
          g.moveTo(270, 28);
          g.lineTo(512, 484);
          g.stroke();
        },
        true,
      ),
    );
    return { root: walls(bag, { map, tile: 12 }) };
  },
  w_wallpaper: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(
        256,
        256,
        (g) => {
          g.fillStyle = '#16362a';
          g.fillRect(0, 0, 256, 256);
          g.strokeStyle = '#b8923e';
          g.lineWidth = 2;
          for (const [cx, cy] of [[64, 64], [192, 192]]) {
            g.beginPath();
            g.ellipse(cx, cy, 26, 40, 0, 0, Math.PI * 2);
            g.stroke();
            g.beginPath();
            g.moveTo(cx, cy - 40);
            g.lineTo(cx, cy + 40);
            g.moveTo(cx - 26, cy);
            g.lineTo(cx + 26, cy);
            g.stroke();
          }
          g.fillStyle = '#b8923e';
          for (const [cx, cy] of [[192, 64], [64, 192]]) {
            g.beginPath();
            g.arc(cx, cy, 4, 0, Math.PI * 2);
            g.fill();
          }
        },
        true,
      ),
    );
    return { root: walls(bag, { map, tile: 5, mat: { roughness: 0.7 } }) };
  },
  w_library: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(
        512,
        512,
        (g) => {
          const r = rng(113);
          g.fillStyle = '#2a1a0e';
          g.fillRect(0, 0, 512, 512);
          const shelf = 128;
          for (let s = 0; s < 4; s++) {
            const y0 = s * shelf;
            let x = 6;
            while (x < 506) {
              const w = 8 + r() * 14;
              const h = shelf * (0.6 + r() * 0.3);
              const c = ['#7a2a1a', '#2a4a6a', '#8a6a2a', '#3a5a2a', '#5a2a4a', '#a8865a'][Math.floor(r() * 6)];
              g.fillStyle = c;
              g.fillRect(x, y0 + shelf - 14 - h, w - 1.5, h);
              g.fillStyle = 'rgba(255,220,140,.35)';
              g.fillRect(x + 2, y0 + shelf - 14 - h + 8, w - 5, 2);
              x += w;
              if (r() < 0.06) x += 20;
            }
            g.fillStyle = '#4a2f1b';
            g.fillRect(0, y0 + shelf - 14, 512, 14);
          }
          g.fillStyle = '#3a2414';
          g.fillRect(0, 0, 8, 512);
          g.fillRect(504, 0, 8, 512);
        },
        true,
      ),
    );
    return { root: walls(bag, { map, tile: 10, mat: { roughness: 0.85 } }) };
  },
  w_crystal: (_c, bag) => {
    const draw = (bright: boolean) =>
      canvasTexture(
        512,
        512,
        (g) => {
          const r = rng(114);
          g.fillStyle = bright ? '#000' : '#1c1a26';
          g.fillRect(0, 0, 512, 512);
          if (!bright)
            for (let i = 0; i < 200; i++) {
              g.fillStyle = `rgba(255,255,255,${r() * 0.05})`;
              g.fillRect(r() * 512, r() * 512, 30 + r() * 60, 10 + r() * 30);
            }
          for (let i = 0; i < 14; i++) {
            const x = r() * 512;
            const y = r() * 512;
            const h = 30 + r() * 60;
            const c = r() > 0.5 ? '#7ae0ff' : '#b08aff';
            g.fillStyle = bright ? c : c + '88';
            g.beginPath();
            g.moveTo(x, y - h);
            g.lineTo(x + h * 0.25, y);
            g.lineTo(x, y + h * 0.2);
            g.lineTo(x - h * 0.25, y);
            g.closePath();
            g.fill();
          }
        },
        true,
      );
    const map = bag.keep(draw(false));
    const em = bag.keep(draw(true));
    return { root: walls(bag, { map, tile: 12, emissive: { map: em, color: '#ffffff', intensity: 0.9 } }) };
  },
  w_brass: (_c, bag) => {
    const map = bag.keep(
      canvasTexture(
        512,
        512,
        (g) => {
          g.fillStyle = '#6a4418';
          g.fillRect(0, 0, 512, 512);
          g.fillStyle = '#8a5a20';
          for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(i * 256 + 8, j * 256 + 8, 240, 240);
          g.fillStyle = '#e8c07a';
          for (let i = 0; i < 2; i++)
            for (let j = 0; j < 2; j++)
              for (const [dx, dy] of [[20, 20], [236, 20], [20, 236], [236, 236]]) {
                g.beginPath();
                g.arc(i * 256 + dx, j * 256 + dy, 6, 0, Math.PI * 2);
                g.fill();
              }
          // A pipe across, and a gauge.
          g.fillStyle = '#a8742a';
          g.fillRect(0, 120, 512, 22);
          g.fillStyle = '#efe6c8';
          g.beginPath();
          g.arc(380, 360, 34, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = '#3a2410';
          g.lineWidth = 4;
          g.stroke();
          g.beginPath();
          g.moveTo(380, 360);
          g.lineTo(400, 338);
          g.stroke();
        },
        true,
      ),
    );
    return { root: walls(bag, { map, tile: 18, mat: { metalness: 0.6, roughness: 0.45 } }) };
  },
  w_void: (_c, bag) => {
    const draw = (bright: boolean) =>
      canvasTexture(
        1024,
        1024,
        (g) => {
          const r = rng(116);
          g.fillStyle = '#000';
          g.fillRect(0, 0, 1024, 1024);
          for (let i = 0; i < 5; i++) {
            const gr = g.createRadialGradient(r() * 1024, r() * 1024, 0, 512, 512, 400);
            const c = r() > 0.5 ? '120,50,170' : '50,40,140';
            gr.addColorStop(0, `rgba(${c},${bright ? 0.5 : 0.25})`);
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr;
            g.fillRect(0, 0, 1024, 1024);
          }
          for (let i = 0; i < 500; i++) {
            g.fillStyle = `rgba(255,255,255,${bright ? r() : r() * 0.4})`;
            g.fillRect(r() * 1024, r() * 1024, 1.5, 1.5);
          }
        },
        true,
      );
    const map = bag.keep(draw(false));
    const em = bag.keep(draw(true));
    return { root: walls(bag, { map, tile: 24, emissive: { map: em, color: '#ffffff', intensity: 1 } }) };
  },
};

// ---------- Rugs: under the table, a little bigger than it. ----------

function rug(ctx: DecorContext, bag: Bag, map: THREE.Texture, p: THREE.MeshStandardMaterialParameters = {}, size = 1) {
  const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry((ctx.tableW + 11.4) * size, (ctx.tableH + 9.4) * size)), std(bag, { map, roughness: 1, ...p }));
  m.position.z = ROOM.floor + 0.02;
  m.receiveShadow = true;
  return m;
}

const RUGS: Record<string, (ctx: DecorContext, bag: Bag) => Built> = {
  r_wine: (ctx, bag) => ({
    root: rug(
      ctx,
      bag,
      bag.keep(
        canvasTexture(512, 512, (g) => {
          g.fillStyle = '#2e0e12';
          g.fillRect(0, 0, 512, 512);
          g.strokeStyle = '#6e5124';
          g.lineWidth = 8;
          g.strokeRect(22, 22, 468, 468);
          g.lineWidth = 3;
          g.strokeRect(44, 44, 424, 424);
          g.fillStyle = '#3a1418';
          g.fillRect(58, 58, 396, 396);
        }),
      ),
    ),
  }),
  r_persian: (ctx, bag) => ({
    root: rug(
      ctx,
      bag,
      bag.keep(
        canvasTexture(512, 512, (g) => {
          g.fillStyle = '#7a1a1a';
          g.fillRect(0, 0, 512, 512);
          g.fillStyle = '#1a2a5a';
          g.fillRect(30, 30, 452, 452);
          g.fillStyle = '#8a2420';
          g.fillRect(60, 60, 392, 392);
          g.strokeStyle = '#d8b46a';
          g.lineWidth = 3;
          for (let i = 0; i < 6; i++) {
            g.beginPath();
            g.ellipse(256, 256, 40 + i * 28, 24 + i * 22, 0, 0, Math.PI * 2);
            g.stroke();
          }
          g.fillStyle = '#d8b46a';
          for (let i = 34; i < 480; i += 18) {
            g.beginPath();
            g.arc(i, 45, 4, 0, Math.PI * 2);
            g.arc(i, 467, 4, 0, Math.PI * 2);
            g.fill();
          }
          // Tassels along the short ends.
          g.fillStyle = '#e8dcc0';
          for (let i = 0; i < 512; i += 10) {
            g.fillRect(i, 0, 3, 14);
            g.fillRect(i, 498, 3, 14);
          }
        }),
      ),
    ),
  }),
  r_bear: (ctx, bag) => {
    // A pelt: a ragged outline cut out of the plane by alpha.
    const map = bag.keep(
      canvasTexture(512, 512, (g) => {
        const r = rng(121);
        g.translate(256, 256);
        g.fillStyle = '#5a3c26';
        g.beginPath();
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * Math.PI * 2;
          const leg = Math.abs(Math.sin(a * 2)) > 0.92 ? 1.25 : 1;
          const rr = (190 + r() * 16) * leg;
          g.lineTo(Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.85);
        }
        g.fill();
        for (let i = 0; i < 1400; i++) {
          g.strokeStyle = `rgba(${40 + r() * 40},${26 + r() * 20},${14 + r() * 10},.6)`;
          const a = r() * Math.PI * 2;
          const d = r() * 180;
          const x = Math.cos(a) * d;
          const y = Math.sin(a) * d * 0.75;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + (r() - 0.5) * 8, y + 6 + r() * 6);
          g.stroke();
        }
        // The head towards the player.
        g.fillStyle = '#4a3020';
        g.beginPath();
        g.ellipse(0, 210, 46, 40, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#111';
        g.beginPath();
        g.arc(-16, 214, 5, 0, Math.PI * 2);
        g.arc(16, 214, 5, 0, Math.PI * 2);
        g.arc(0, 238, 7, 0, Math.PI * 2);
        g.fill();
      }),
    );
    map.flipY = true;
    const m = rug(ctx, bag, map, { transparent: true, alphaTest: 0.5 }, 0.85);
    m.rotation.z = Math.PI;
    return { root: m };
  },
  r_runic: (ctx, bag) => {
    const draw = (bright: boolean) =>
      canvasTexture(512, 512, (g) => {
        g.fillStyle = bright ? '#000' : '#140c20';
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = bright ? '#b08aff' : '#4a3270';
        g.lineWidth = 4;
        g.shadowColor = '#b08aff';
        g.shadowBlur = bright ? 10 : 0;
        for (const rr of [200, 160]) {
          g.beginPath();
          g.arc(256, 256, rr, 0, Math.PI * 2);
          g.stroke();
        }
        const r = rng(122);
        g.font = '28px serif';
        g.fillStyle = bright ? '#d8c4ff' : '#6a5290';
        g.textAlign = 'center';
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          g.save();
          g.translate(256 + Math.cos(a) * 180, 256 + Math.sin(a) * 180);
          g.rotate(a + Math.PI / 2);
          g.fillText('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒ'[Math.floor(r() * 18)], 0, 9);
          g.restore();
        }
      });
    const em = bag.keep(draw(true));
    const m = rug(ctx, bag, bag.keep(draw(false)), { emissiveMap: em, emissive: '#ffffff', emissiveIntensity: 1 });
    const mat = m.material as THREE.MeshStandardMaterial;
    return { root: m, update: (t) => (mat.emissiveIntensity = 0.7 + Math.sin(t * 1.4) * 0.3) };
  },
  r_starmap: (ctx, bag) => {
    const draw = (bright: boolean) =>
      canvasTexture(512, 512, (g) => {
        const r = rng(123);
        g.fillStyle = bright ? '#000' : '#0c1030';
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = bright ? 'rgba(160,190,255,.5)' : '#c9a24a';
        g.lineWidth = bright ? 1 : 5;
        g.strokeRect(14, 14, 484, 484);
        const stars = Array.from({ length: 40 }, () => [r() * 480 + 16, r() * 480 + 16] as [number, number]);
        g.strokeStyle = bright ? 'rgba(160,190,255,.45)' : 'rgba(120,140,200,.4)';
        g.lineWidth = 1;
        for (let i = 0; i < 28; i += 4) {
          g.beginPath();
          stars.slice(i, i + 4).forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
        }
        for (const [x, y] of stars) {
          g.fillStyle = bright ? '#fff' : '#cfd8ff';
          g.beginPath();
          g.arc(x, y, 2 + r() * 2, 0, Math.PI * 2);
          g.fill();
        }
      });
    const em = bag.keep(draw(true));
    const m = rug(ctx, bag, bag.keep(draw(false)), { emissiveMap: em, emissive: '#ffffff', emissiveIntensity: 1 });
    const mat = m.material as THREE.MeshStandardMaterial;
    return { root: m, update: (t) => (mat.emissiveIntensity = 0.8 + Math.sin(t * 3.1) * 0.25 + Math.sin(t * 7.3) * 0.1) };
  },
  r_ember: (ctx, bag) => {
    const draw = (bright: boolean) =>
      canvasTexture(512, 512, (g) => {
        const r = rng(124);
        g.fillStyle = bright ? '#000' : '#1a0c08';
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = bright ? '#ff7a20' : '#5a1a08';
        g.lineWidth = 6;
        g.strokeRect(18, 18, 476, 476);
        for (let i = 0; i < 140; i++) {
          g.fillStyle = bright ? `rgba(255,${120 + r() * 100},40,${r()})` : '#3a1408';
          g.beginPath();
          g.arc(r() * 512, r() * 512, 1 + r() * 3, 0, Math.PI * 2);
          g.fill();
        }
      });
    const em = bag.keep(draw(true));
    const m = rug(ctx, bag, bag.keep(draw(false)), { emissiveMap: em, emissive: '#ffffff', emissiveIntensity: 1 });
    const mat = m.material as THREE.MeshStandardMaterial;
    em.wrapS = em.wrapT = THREE.RepeatWrapping;
    return { root: m, update: (t) => { mat.emissiveIntensity = 0.8 + Math.sin(t * 5) * 0.2; em.offset.y = -t * 0.01; } };
  },
  r_frost: (ctx, bag) => ({
    root: rug(
      ctx,
      bag,
      bag.keep(
        canvasTexture(512, 512, (g) => {
          g.fillStyle = '#cfe6f4';
          g.fillRect(0, 0, 512, 512);
          g.strokeStyle = '#6aa0c8';
          g.lineWidth = 3;
          g.translate(256, 256);
          for (let k = 0; k < 6; k++) {
            g.rotate(Math.PI / 3);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(0, 200);
            for (let b = 40; b < 200; b += 40) {
              g.moveTo(0, b);
              g.lineTo(26, b + 26);
              g.moveTo(0, b);
              g.lineTo(-26, b + 26);
            }
            g.stroke();
          }
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.strokeStyle = '#8ab8d8';
          g.lineWidth = 8;
          g.strokeRect(16, 16, 480, 480);
        }),
      ),
      { roughness: 0.6 },
    ),
  }),
};

export { FLOORS, WALLS, RUGS, marbleTexture };
