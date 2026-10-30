import * as THREE from 'three';
import { audio } from '@/audio/audioService';
import { energyColors } from '@/ui/match/table3d/bodyRules';
import { Bag, DecorContext, animatedPiece, boxIn, mesh, modelPiece, onTop, std, type ModelFit } from './kit';
import type { Built } from './tables';
import { skin, type Skin } from './textured';
import { scanned } from './surfaces';

/**
 * Pieces with some life in them: a fire in the hearth, fish in a tank, a cat asleep in the armchair, an
 * owl, a crystal in the Warden's colour, music.
 * All models are free ones (see public/decor/CREDITS.txt); each stands with its back to its wall.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

const ext = (name: string) => `ext/${name}.glb`;

// ---------- Fire (a flipbook of flames: para, CC0) ----------

/** Flames that always face the camera (turning about the upright only): 8 × 8 frames, 24 a second. */
function flames(bag: Bag, w: number, h: number) {
  const tex = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}decor/ext/fx/fire_01.png`);
  tex.colorSpace = THREE.SRGBColorSpace;
  bag.keep(tex);
  const uniforms = { map: { value: tex }, frame: { value: 0 } };
  const mat = bag.keep(
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Turned to the camera about the room's upright (z).
          vec3 centre = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          vec3 toCam = cameraPosition - centre;
          vec3 side = normalize(vec3(-toCam.y, toCam.x, 0.0));
          vec3 world = centre + side * position.x + vec3(0.0, 0.0, 1.0) * position.y * length((modelMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform float frame;
        varying vec2 vUv;
        void main() {
          float f = floor(mod(frame, 64.0));
          vec2 cell = vec2(mod(f, 8.0), 7.0 - floor(f / 8.0));
          // The flame fills the lower part of its cell.
          vec2 uv = (cell + vec2(vUv.x, vUv.y * 0.62)) / 8.0;
          vec4 c = texture2D(map, uv);
          gl_FragColor = vec4(c.rgb * c.a * 1.6, 1.0);
        }`,
    }),
  );
  const geo = bag.keep(new THREE.PlaneGeometry(w, h));
  geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  return { mesh: m, update: (t: number) => (uniforms.frame.value = t * 24) };
}

/** The fireplace's materials: stones, the dark mortar behind them, the wooden mantel and frame, the hearth. */
const FIREPLACE_SKIN: Record<string, Skin> = {
  mat15: { tex: 'castle_wall_slates', metres: 1.4, tint: '#d8d4cc' },
  mat16: { tex: 'castle_wall_slates', metres: 1.4, tint: '#4a4644', roughness: 1.6 },
  mat17: { tex: 'castle_wall_slates', metres: 1.4, tint: '#2a2624', roughness: 1.6 },
  mat22: { tex: 'slate_floor_02', metres: 1.5, tint: '#8a8680' },
  mat19: { tex: 'dark_wooden_planks', metres: 1.2, tint: '#e8c8a0' },
  mat18: { tex: 'weathered_brown_planks', metres: 1.2, tint: '#f0d8b8' },
  mat20: { tex: 'dark_wooden_planks', metres: 1.2, tint: '#8a7a6a' },
};

/** The hearth: Nick Slough's stone fireplace (CC-BY 3.0), a fire in it and its warm, flickering light. */
const fireplace: Make = (ctx, bag) => {
  const g = new THREE.Group();
  // Its own fire is carved still (the yellow flames): an animated one burns in its place.
  // Scanned stone and wood (Poly Haven) in place of its plain colours.
  g.add(
    modelPiece(bag, ext('fireplace'), {
      height: 24,
      anchor: 'back',
      max: ctx.limit,
      tweak: (m) => (m.visible = (m.material as THREE.Material).name !== 'mat12'),
      onLoad: (m) => skin(bag, m, FIREPLACE_SKIN),
    }),
  );
  const fire = flames(bag, 6.5, 6.5);
  fire.mesh.position.set(-0.3, -4.4, 3.9);
  g.add(fire.mesh);
  const light = new THREE.PointLight(0xff8a3a, 30, 40, 1.5);
  light.position.set(0, -6, 6.5);
  light.castShadow = false;
  g.add(light);
  return {
    root: g,
    update: (t) => {
      fire.update(t);
      light.intensity = 30 * (1 + Math.sin(t * 8.3) * 0.08 + Math.sin(t * 13.1) * 0.06 + Math.sin(t * 2.7) * 0.05);
    },
  };
};

// ---------- The aquarium (Quaternius' fish, CC0) ----------

const FISH = ['goldfish', 'clownfish', 'tang', 'koi', 'yellow_tang', 'butterfly_fish'];

/** The tank's back: deep water fading to dark at the bottom, so the tank glows from inside. */
let deepTex: THREE.Texture | null = null;
const deepWater = () =>
  (deepTex ??= (() => {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createLinearGradient(0, 0, 0, 256);
    r.addColorStop(0, '#2a9ad8');
    r.addColorStop(0.55, '#0c4a80');
    r.addColorStop(1, '#04182c');
    g.fillStyle = r;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })());

/** A bubble: a bright ring with a clear middle. */
let bubbleTex: THREE.Texture | null = null;
const bubbleTexture = () =>
  (bubbleTex ??= (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(32, 32, 10, 32, 32, 30);
    r.addColorStop(0, 'rgba(255,255,255,0.15)');
    r.addColorStop(0.8, 'rgba(255,255,255,0.9)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.beginPath();
    g.arc(32, 32, 30, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })());

/**
 * The aquarium on a carved console (Poly Haven): coral gravel, rocks, weed and corals, an air stone
 * sending up bubbles, a lit lid, and fish (Quaternius, CC0) on their own loops, with a little school
 * of tetras among them.
 */
const aquarium: Make = (ctx, bag) => {
  const tank = new THREE.Group();
  const W = 12;
  const D = 4;
  const H = 7;
  const glass = std(bag, { color: '#d8f0ff', roughness: 0.03, transparent: true, opacity: 0.1, depthWrite: false });
  const water = std(bag, { color: '#4ab8f0', roughness: 0.1, transparent: true, opacity: 0.1, depthWrite: false, emissive: '#06304a' });
  const rim = std(bag, { color: '#14110e', roughness: 0.45, metalness: 0.35 });
  const gravel = scanned(bag, 'coral_gravel', 2.5, 1.1, { roughness: 1 }, '#d8ccb8');
  tank.add(mesh(new THREE.BoxGeometry(W, D, H), glass, bag, [0, 0, H / 2]));
  const vol = mesh(new THREE.BoxGeometry(W - 0.2, D - 0.2, H - 0.9), water, bag, [0, 0, (H - 0.9) / 2]);
  vol.castShadow = false;
  tank.add(vol);
  const back = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(W - 0.3, H - 0.6)), bag.keep(new THREE.MeshBasicMaterial({ map: deepWater(), toneMapped: false })));
  back.rotation.x = Math.PI / 2;
  back.position.set(0, D / 2 - 0.15, (H - 0.6) / 2);
  tank.add(back);
  tank.add(mesh(new THREE.BoxGeometry(W - 0.2, D - 0.2, 0.8), gravel, bag, [0, 0, 0.4]));
  // A dark frame: lid, base and the four corner posts.
  tank.add(mesh(new THREE.BoxGeometry(W + 0.3, D + 0.3, 0.45), rim, bag, [0, 0, H + 0.22]));
  tank.add(mesh(new THREE.BoxGeometry(W + 0.3, D + 0.3, 0.3), rim, bag, [0, 0, 0.15]));
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tank.add(mesh(new THREE.BoxGeometry(0.22, 0.22, H), rim, bag, [(x * W) / 2, (y * D) / 2, H / 2]));
  // The bottom: rocks, weed and corals.
  const put = (id: string, fit: ModelFit, x: number, y: number) => {
    const p = modelPiece(bag, id, fit);
    p.position.set(x, y, 0.8);
    tank.add(p);
  };
  put(ext('rock_a_quaternius'), { height: 2 }, -3.8, 0.8);
  put(ext('rock_b_quaternius'), { height: 1.5, turn: 1 }, 3.2, 0.7);
  put(ext('rock_a_quaternius'), { height: 1, turn: 2.4 }, 0.8, -1);
  put(ext('seaweed_mohabins'), { height: 5.6 }, -2.4, 1.1);
  put(ext('seaweed_mohabins'), { height: 4.4, turn: 2 }, 4.8, 1.1);
  put(ext('seaweed_mohabins'), { height: 3.2, turn: 4 }, -4.9, 0);
  put(ext('seaweed_mohabins'), { height: 4.8, turn: 1 }, 1.8, 1.2);
  put(ext('coral_reef_set_minipoly'), { height: 2, max: { w: 8, d: 1.6, h: 2 } }, 0.4, 0.8);
  // Bubbles from an air stone in the corner, wobbling as they rise.
  const n = 26;
  const pos = new Float32Array(n * 3);
  const bgeo = bag.keep(new THREE.BufferGeometry());
  bgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const bubbles = new THREE.Points(bgeo, bag.keep(new THREE.PointsMaterial({ map: bubbleTexture(), color: '#e8f8ff', size: 0.4, transparent: true, opacity: 0.85, depthWrite: false })));
  bubbles.frustumCulled = false;
  tank.add(bubbles);
  // The lid's light, and a cool glow out of the front.
  const lamp = new THREE.PointLight(0x9ae0ff, 14, 16, 1.4);
  lamp.position.set(0, -0.5, H - 0.5);
  tank.add(lamp);
  const spill = new THREE.PointLight(0x3aa8ff, 6, 14, 1.8);
  spill.position.set(0, -D, H / 2);
  tank.add(spill);
  // The fish, each on its own loop through the water.
  const fish = FISH.map((id, i) => {
    const a = animatedPiece(bag, ext(id), { height: 1.2 + (i % 3) * 0.25 }, 'Swimming_Normal');
    const holder = new THREE.Group();
    holder.add(a.root);
    tank.add(holder);
    return { a, holder, speed: 0.25 + (i % 4) * 0.07, phase: i * 1.7, z: 2.2 + (i % 3) * 1.5, ry: i % 2 ? 0.8 : -0.8, rx: 1, small: false };
  });
  // A school of tetras, close together, on a quicker loop of their own.
  for (let i = 0; i < 7; i++) {
    const a = animatedPiece(bag, ext('tetra'), { height: 0.55 }, 'Swimming_Fast');
    const holder = new THREE.Group();
    holder.add(a.root);
    tank.add(holder);
    fish.push({ a, holder, speed: 0.55, phase: 2 + i * 0.09, z: 4.4 + (i % 3) * 0.35, ry: ((i % 4) - 1.5) * 0.35, rx: 0.8, small: true });
  }
  const root = onTop(bag, 'ClassicConsole_01', { anchor: 'back', max: ctx.limit, height: 10 }, tank);
  return {
    root,
    update: (t, dt) => {
      for (const f of fish) {
        // An oval through the tank; the fish faces where it swims (a model faces -y once stood up).
        const k = t * f.speed + f.phase;
        const ax = (W / 2 - 1.6) * f.rx;
        const ay = (D / 2 - 1.1) * 0.8;
        f.holder.position.set(Math.cos(k) * ax, Math.sin(k) * ay + f.ry * 0.3, f.z + Math.sin(k * 2.3) * (f.small ? 0.2 : 0.5));
        f.holder.rotation.z = Math.atan2(Math.cos(k) * ay, -Math.sin(k) * ax) + Math.PI / 2;
        f.a.update(dt);
      }
      for (let i = 0; i < n; i++) {
        const k = (t * 0.45 + i / n) % 1;
        pos.set([W / 2 - 1.2 + Math.sin(t * 5 + i * 2.1) * 0.15, D / 2 - 1 + Math.cos(t * 4 + i) * 0.12, 0.9 + k * (H - 1.4)], i * 3);
      }
      bgeo.attributes.position.needsUpdate = true;
      lamp.intensity = 14 * (0.95 + Math.sin(t * 1.7) * 0.05);
    },
  };
};

// ---------- Pets ----------

/** A cat asleep in the armchair (Hiroyuki Kajiwara's "cat loaf", CC-BY 3.0): it breathes; a stroke makes it purr and stretch. */
const catInChair: Make = (ctx, bag) => {
  const g = new THREE.Group();
  const cat = new THREE.Group();
  const body = modelPiece(bag, ext('cat_dingus'), { height: 2.9, turn: 0.3 });
  cat.add(body);
  cat.visible = false;
  const chair = modelPiece(bag, 'ArmChair_01', {
    anchor: 'back',
    max: ctx.limit,
    onLoad: () => {
      // On the seat cushion: a little under half the chair's height, towards its front.
      const box = boxIn(chair, g);
      cat.position.set((box.min.x + box.max.x) / 2, box.min.y + (box.max.y - box.min.y) * 0.42, box.max.z * 0.44);
      cat.visible = true;
    },
  });
  g.add(chair, cat);
  let stroked = -10;
  return {
    root: g,
    click: () => {
      stroked = performance.now() / 1000;
      audio.play('heal');
    },
    update: (t) => {
      const since = performance.now() / 1000 - stroked;
      const stretch = since < 1.2 ? Math.sin((since / 1.2) * Math.PI) : 0;
      body.scale.set(1 + stretch * 0.12, 1 - stretch * 0.04, 1 + Math.sin(t * 1.6) * 0.03 + stretch * 0.05);
    },
  };
};

/** A great horned owl on its branch (Poly by Google, CC-BY 3.0) atop a gothic cabinet; it looks about now and then. */
const owl: Make = (ctx, bag) => {
  const bird = new THREE.Group();
  const model = modelPiece(bag, ext('owl'), { height: 7 });
  bird.add(model);
  let hoot = -10;
  const root = onTop(bag, 'GothicCabinet_01', { anchor: 'back', max: { w: 22, d: 13, h: 13 } }, bird);
  void ctx;
  return {
    root,
    click: () => {
      hoot = performance.now() / 1000;
      audio.play('hover');
    },
    update: (t) => {
      // A slow look round, held for a while at each side.
      const look = Math.sin(t * 0.35);
      bird.rotation.z = Math.sign(look) * Math.min(1, Math.abs(look) * 1.6) * 0.5;
      const since = performance.now() / 1000 - hoot;
      model.position.z = since < 0.6 ? Math.sin((since / 0.6) * Math.PI) * 0.6 : 0;
    },
  };
};

// ---------- The Warden's crystal ----------

/** A soft round glow (white; tinted by the material). */
let haloTex: THREE.Texture | null = null;
const halo = () =>
  (haloTex ??= (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,0.8)');
    r.addColorStop(0.3, 'rgba(255,255,255,0.25)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })());

/** A crystal cluster (iPoly3D, CC0) floating over a carved nightstand (Poly Haven), glowing in the room owner's colour. */
const crystal: Make = (ctx, bag) => {
  const [tint, deep] = energyColors(ctx.faction);
  const gem = std(bag, { color: tint, emissive: deep, emissiveIntensity: 1.1, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.88 });
  const float = new THREE.Group();
  float.add(modelPiece(bag, ext('crystal_cluster'), { height: 5, tweak: (m) => (m.material = gem) }));
  const glow = new THREE.Sprite(bag.keep(new THREE.SpriteMaterial({ map: halo(), color: tint, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })));
  glow.scale.setScalar(11);
  glow.position.z = 2.5;
  float.add(glow);
  const light = new THREE.PointLight(tint, 16, 26, 1.6);
  light.position.z = 3;
  float.add(light);
  const stand = new THREE.Group();
  stand.add(float);
  const root = onTop(bag, 'ClassicNightstand_01', { anchor: 'back', max: ctx.limit, scale: 1.1 }, stand);
  return {
    root,
    update: (t) => {
      float.position.z = 1.8 + Math.sin(t * 1.3) * 0.5;
      float.rotation.z = t * 0.4;
      light.intensity = 16 * (0.9 + Math.sin(t * 2.1) * 0.1);
    },
  };
};

// ---------- Music ----------

const music = (name: string) => `${import.meta.env.BASE_URL}music/${name}`;
/** Tavern tunes (RandomMind, yd: CC0). */
const TAVERN = [music('tavern_old_tower_inn_randommind.mp3'), music('tavern_bards_tale_randommind.mp3'), music('tavern_yd.ogg')];

/** A player of tunes: plays the first when placed; each click the next, and after the last, silence. */
function player(tracks: string[]) {
  let i = 0;
  return {
    click: () => {
      i = (i + 1) % (tracks.length + 1);
      audio.play('click');
    },
    track: () => tracks[i] ?? null,
  };
}

/** A brass gramophone (Don Carson, CC-BY 3.0) on a tall round side table (Poly Haven). */
const gramophone: Make = (ctx, bag) => {
  const horn = modelPiece(bag, ext('gramophone'), { height: 6, turn: 0.5 });
  const root = onTop(bag, 'side_table_tall_01', { anchor: 'back', max: ctx.limit }, horn);
  return { root, ...player(TAVERN) };
};

export const LIVING: Record<string, Make> = {
  fu_fireplace: fireplace,
  fu_aquarium: aquarium,
  fu_cat: catInChair,
  fu_owl: owl,
  fu_crystal: crystal,
  fu_gramophone: gramophone,
};
