import * as THREE from 'three';
import { audio } from '@/audio/audioService';
import { energyColors } from '@/ui/match/table3d/bodyRules';
import type { Trophy } from '@/domain/lounge';
import { Bag, DecorContext, animatedPiece, boxIn, mesh, modelPiece, onTop, std, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Pieces with some life in them: a fire in the hearth, fish in a tank, a cat asleep in the armchair, a
 * dragon whelp over its hoard, an owl, a crystal in the Warden's colour, the player's trophies, music.
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

/** The hearth: Nick Slough's stone fireplace (CC-BY 3.0), a fire in it and its warm, flickering light. */
const fireplace: Make = (ctx, bag) => {
  const g = new THREE.Group();
  // Its own fire is carved still (the yellow flames): an animated one burns in its place.
  g.add(modelPiece(bag, ext('fireplace'), { height: 24, anchor: 'back', max: ctx.limit, tweak: (m) => (m.visible = (m.material as THREE.Material).name !== 'mat12') }));
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

const aquarium: Make = (ctx, bag) => {
  const tank = new THREE.Group();
  const W = 13;
  const D = 5.6;
  const H = 7.5;
  const glass = std(bag, { color: '#cfe8ff', roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false });
  const water = std(bag, { color: '#3aa0d8', roughness: 0.2, transparent: true, opacity: 0.16, depthWrite: false, emissive: '#0a3a5a' });
  const rim = std(bag, { color: '#16130f', roughness: 0.5, metalness: 0.3 });
  const sand = std(bag, { color: '#9a875f', roughness: 1 });
  tank.add(mesh(new THREE.BoxGeometry(W, D, H), glass, bag, [0, 0, H / 2]));
  const vol = mesh(new THREE.BoxGeometry(W - 0.2, D - 0.2, H - 0.9), water, bag, [0, 0, (H - 0.9) / 2]);
  vol.castShadow = false;
  tank.add(vol);
  tank.add(mesh(new THREE.BoxGeometry(W - 0.2, D - 0.2, 0.7), sand, bag, [0, 0, 0.35]));
  tank.add(mesh(new THREE.BoxGeometry(W + 0.3, D + 0.3, 0.35), rim, bag, [0, 0, H + 0.17]));
  tank.add(mesh(new THREE.BoxGeometry(W + 0.3, D + 0.3, 0.35), rim, bag, [0, 0, 0.17]));
  // The bottom: rocks, a strand or two of weed, corals.
  const put = (id: string, fit: ModelFit, x: number, y: number) => {
    const p = modelPiece(bag, id, fit);
    p.position.set(x, y, 0.7);
    tank.add(p);
  };
  put(ext('rock_a_quaternius'), { height: 1.8 }, -4, 1);
  put(ext('rock_b_quaternius'), { height: 1.3, turn: 1 }, 3.6, 0.8);
  put(ext('seaweed_mohabins'), { height: 5.5 }, -2.2, 1.3);
  put(ext('seaweed_mohabins'), { height: 4.2, turn: 2 }, 5, 1.4);
  put(ext('coral_reef_set_minipoly'), { height: 1.4, max: { w: 7, d: 2, h: 1.4 } }, 0.6, 1.4);
  // A light in the lid.
  const lamp = new THREE.PointLight(0x7ad0ff, 8, 16, 1.6);
  lamp.position.set(0, -1, H + 1);
  tank.add(lamp);
  // The fish, each on its own loop through the water.
  const fish = FISH.map((id, i) => {
    const a = animatedPiece(bag, ext(id), { height: 1.2 + (i % 3) * 0.25 }, 'Swimming_Normal');
    const holder = new THREE.Group();
    holder.add(a.root);
    tank.add(holder);
    return { a, holder, speed: 0.25 + (i % 4) * 0.07, phase: i * 1.7, z: 2 + (i % 3) * 1.6, ry: (i % 2 ? 0.8 : -0.8) };
  });
  const root = onTop(bag, 'painted_wooden_cabinet', { anchor: 'back', max: ctx.limit, scale: 0.85 }, tank);
  return {
    root,
    update: (t, dt) => {
      for (const f of fish) {
        // An oval through the tank; the fish faces where it swims (a model faces -y once stood up).
        const k = t * f.speed + f.phase;
        const x = Math.cos(k) * (W / 2 - 1.6);
        const y = Math.sin(k) * (D / 2 - 1.1) * 0.8 + f.ry * 0.3;
        f.holder.position.set(x, y, f.z + Math.sin(k * 2.3) * 0.5);
        f.holder.rotation.z = Math.atan2(Math.cos(k) * (D / 2 - 1.1) * 0.8, -Math.sin(k) * (W / 2 - 1.6)) + Math.PI / 2;
        f.a.update(dt);
      }
    },
  };
};

// ---------- Pets ----------

/** A cat asleep in the armchair (Hiroyuki Kajiwara's "cat loaf", CC-BY 3.0): it breathes; a stroke makes it purr and stretch. */
const catInChair: Make = (ctx, bag) => {
  const g = new THREE.Group();
  const cat = new THREE.Group();
  const body = modelPiece(bag, ext('cat_dingus'), { height: 2.6, turn: -0.5 });
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

/** A dragon whelp (Quaternius, CC0) hovering over a heap of gold; a click makes it nod. */
const dragon: Make = (ctx, bag) => {
  const g = new THREE.Group();
  const hoard = modelPiece(bag, 'qk/Coin_Pile_2', { scale: 2.6, anchor: 'back' });
  hoard.position.y = -3;
  g.add(hoard);
  const whelp = animatedPiece(bag, ext('dragon'), { height: 9, turn: 0 }, 'Flying_Idle');
  const fly = new THREE.Group();
  fly.add(whelp.root);
  fly.position.set(0, -6, 6);
  g.add(fly);
  const glow = new THREE.PointLight(0xffb040, 6, 14, 1.7);
  glow.position.set(0, -6, 3);
  g.add(glow);
  void ctx;
  return {
    root: g,
    click: () => {
      whelp.play('Yes', true);
      audio.play('spell');
    },
    update: (t, dt) => {
      fly.position.z = 7 + Math.sin(t * 1.4) * 0.8;
      fly.rotation.z = Math.sin(t * 0.4) * 0.35;
      whelp.update(dt);
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

// ---------- Trophies ----------

const TIER_COLOR: Record<Trophy['tier'], string> = { 1: '#b5713a', 2: '#c8ccd4', 3: '#f2c240' };
/** Which cup stands for which trophy. */
const TROPHY_MODEL: Record<Trophy['id'], string> = { wins: 'trophy', streak: 'trophy', tournament: 'chalice', ladder: 'crown', achievements: 'trophy', packs: 'chalice' };

/** The player's trophies (CreativeTrio's cup, Quaternius' chalice and crown, CC0) on a glazed cabinet (Poly Haven). */
const trophies: Make = (ctx, bag) => {
  const shelf = new THREE.Group();
  const won = ctx.info?.trophies ?? [];
  won.slice(0, 6).forEach((tr, i) => {
    const metal = std(bag, { color: TIER_COLOR[tr.tier], metalness: 0.5, roughness: 0.25 });
    const cup = modelPiece(bag, ext(TROPHY_MODEL[tr.id]), { height: tr.id === 'ladder' ? 1.6 : 2.6 + tr.tier * 0.3, tweak: (m) => (m.material = metal) });
    const n = Math.min(6, won.length);
    cup.position.x = (i - (n - 1) / 2) * 2.4;
    shelf.add(cup);
  });
  // A small lamp over the counter, so the metal shines.
  const lamp = new THREE.PointLight(0xfff0d0, 7, 14, 1.6);
  lamp.position.set(0, -3, 5);
  shelf.add(lamp);
  const root = onTop(bag, 'vintage_cabinet_01', { anchor: 'back', max: ctx.limit }, shelf);
  // The cups stand on the counter in front of the glazed top, not on the very top.
  let placed = false;
  return {
    root,
    update: () => {
      if (placed || !shelf.visible) return;
      placed = true;
      const box = boxIn(root.children[0], root);
      shelf.position.z = box.min.z + (box.max.z - box.min.z) * 0.415;
      shelf.position.y = box.min.y + 1.6;
    },
  };
};

// ---------- Music ----------

const music = (name: string) => `${import.meta.env.BASE_URL}music/${name}`;
/** Tavern tunes (RandomMind, yd: CC0) and a lofi loop (omfgdude, edit qubodup: CC0). */
const TAVERN = [music('tavern_old_tower_inn_randommind.mp3'), music('tavern_bards_tale_randommind.mp3'), music('tavern_yd.ogg')];
const LOFI = [music('lofi_chill_loop_omfgdude_qubodup.ogg')];

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

/** A brass gramophone (Don Carson, CC-BY 3.0) on a painted cabinet (Poly Haven). */
const gramophone: Make = (ctx, bag) => {
  const horn = modelPiece(bag, ext('gramophone'), { height: 8, turn: 0.5 });
  const root = onTop(bag, 'painted_wooden_cabinet', { anchor: 'back', max: ctx.limit, scale: 0.85 }, horn);
  return { root, ...player(TAVERN) };
};

/** A little radio (Quaternius, CC0) for the table: a lofi loop. */
const radio: Make = (ctx, bag) => {
  const turn = 0.5 * (ctx.mirror ? -1 : 1);
  return { root: modelPiece(bag, ext('radio'), { height: 2.6, turn, max: ctx.limit }), ...player(LOFI) };
};

export const LIVING: Record<string, Make> = {
  fu_fireplace: fireplace,
  fu_aquarium: aquarium,
  fu_cat: catInChair,
  fu_dragon: dragon,
  fu_owl: owl,
  fu_crystal: crystal,
  fu_trophies: trophies,
  fu_gramophone: gramophone,
  tr_radio: radio,
};
