import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Rarity } from '@/game/types';
import { CARD_PLANE_Z, RARITY_COLOR, SCENE_CAMERA, rectToWorld } from './packScene';

export type SceneStage = 'intro' | 'opening' | 'reveal' | 'summary';

interface Props {
  packArt: string;
  glow: string;
  cardBack: string | undefined;
  stage: SceneStage;
  rarities: Rarity[];
  revealed: boolean[];
  hover: boolean;
  /** The pack button (the 3D pack floats where it is). */
  packRect: () => DOMRect | null;
  /** The card slots (the cards land on them; rarity rims stay around them until revealed). */
  slotRects: () => (DOMRect | null)[];
  onReady: () => void;
  onLanded: () => void;
  onUnavailable: () => void;
}

const CW = 1.3;
const CH = CW * 1.4;
const PW = 2.3;
const CHARGE = 1.5;
const IMPLODE = 0.28;
const SPIRAL = 1.3;
const SETTLE = 0.7;
const STAGGER = 0.12;

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeIn = (x: number) => Math.pow(Math.min(1, Math.max(0, x)), 3);
const easeIO = (x: number) => {
  x = Math.min(1, Math.max(0, x));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  return new THREE.CanvasTexture(c);
}
const radial = (size: number, stops: [number, number][]) =>
  canvasTexture(size, size, (g) => {
    const h = size / 2;
    const r = g.createRadialGradient(h, h, 0, h, h, h);
    stops.forEach(([o, a]) => r.addColorStop(o, `rgba(255,255,255,${a})`));
    g.fillStyle = r;
    g.fillRect(0, 0, size, size);
  });
/** A crisp glowing rim around a card, transparent inside. */
const rimTexture = () =>
  canvasTexture(260, 340, (g) => {
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    };
    g.strokeStyle = '#fff';
    g.shadowColor = '#fff';
    for (const [blur, w, a] of [[28, 10, 0.35], [14, 6, 0.6], [4, 3, 1]]) {
      g.globalAlpha = a;
      g.shadowBlur = blur;
      g.lineWidth = w;
      rr(40, 40, 180, 260, 10);
      g.stroke();
    }
  });
/** Sun rays behind a Legendary: soft wedges fading outwards. */
const raysTexture = () =>
  canvasTexture(512, 512, (g) => {
    const h = 256;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const w = i % 2 ? 0.07 : 0.12;
      g.beginPath();
      g.moveTo(h, h);
      g.arc(h, h, h, a - w, a + w);
      g.closePath();
      g.fillStyle = `rgba(255,255,255,${i % 2 ? 0.45 : 0.85})`;
      g.fill();
    }
    g.globalCompositeOperation = 'destination-in';
    const r = g.createRadialGradient(h, h, 0, h, h, h);
    r.addColorStop(0, 'rgba(0,0,0,1)');
    r.addColorStop(0.25, 'rgba(0,0,0,.9)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 512, 512);
  });

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  life: number;
  age: number;
  drag: number;
  attract?: THREE.Vector3;
}

interface CardFx {
  holder: THREE.Group;
  card: THREE.Mesh;
  rim: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  sparks: THREE.Sprite[];
  rays: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null;
  wave: THREE.Sprite | null;
  color: THREE.Color;
  rarity: Rarity;
  fade: number;
}

/**
 * The 3D pack opening ("Kouzlo"): the pack floats, spins up drawing in sparks, implodes into a point
 * and bursts; the cards spiral out with trails in their rarity colours and land on the card slots,
 * where a glowing rim (and, for a Legendary, turning sun rays) shows each rarity until it is turned.
 */
export default function PackScene3D(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef(props);
  live.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      live.current.onUnavailable();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    const camera = new THREE.PerspectiveCamera(SCENE_CAMERA.fov, 1, 0.1, 100);
    camera.position.set(0, SCENE_CAMERA.y, SCENE_CAMERA.z);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 6);
    scene.add(key);
    const glint = new THREE.PointLight(0xffffff, 25, 12);
    scene.add(glint);
    const coreLight = new THREE.PointLight(0xffffff, 0, 14);
    scene.add(coreLight);

    const textures: THREE.Texture[] = [];
    const keep = <T extends THREE.Texture>(t: T) => (textures.push(t), t);
    const glowTex = keep(radial(128, [[0, 1], [0.3, 0.4], [1, 0]]));
    const sparkTex = keep(radial(64, [[0, 1], [0.15, 0.9], [0.4, 0.2], [1, 0]]));
    const ringTex = keep(radial(256, [[0, 0], [0.62, 0], [0.7, 0.9], [0.78, 0.25], [1, 0]]));
    const rimTex = keep(rimTexture());
    const raysTex = keep(raysTexture());
    const additive = (map: THREE.Texture, color: THREE.ColorRepresentation, opacity: number) =>
      new THREE.SpriteMaterial({ map, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity });

    // Sparks: one Points cloud updated by hand.
    const MAXP = 700;
    const pPos = new Float32Array(MAXP * 3);
    const pCol = new Float32Array(MAXP * 3);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.32, map: sparkTex, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
    let particles: Particle[] = [];
    const emit = (p: Particle) => {
      if (particles.length < MAXP) particles.push(p);
    };

    const view = () => ({ width: window.innerWidth, height: window.innerHeight });
    const world = (r: DOMRect, z: number, camZ = SCENE_CAMERA.z) => rectToWorld(r, view(), z, camZ);
    const glow = new THREE.Color(live.current.glow);
    const white = new THREE.Color('#ffffff');

    // The pack: a foil pillow, front and back.
    const loader = new THREE.TextureLoader();
    let packG: THREE.Group | null = null;
    let packMat: THREE.MeshStandardMaterial | null = null;
    let aura: THREE.Sprite | null = null;
    let PH = PW * 1.83;
    const pillow = (side: 1 | -1) => {
      const g = new THREE.PlaneGeometry(PW, PH, 30, 60);
      const pos = g.attributes.position;
      const uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = uv.getX(i);
        const v = uv.getY(i);
        pos.setZ(i, side * 0.16 * (1 - Math.pow(2 * u - 1, 4)) * (1 - Math.pow(2 * v - 1, 6)));
      }
      g.computeVertexNormals();
      return g;
    };
    const flash = new THREE.Sprite(additive(glowTex, '#ffffff', 0));
    const ring = new THREE.Sprite(additive(ringTex, glow, 0));
    scene.add(flash, ring);

    let backMat: THREE.MeshStandardMaterial | null = null;
    const cardGeo = new THREE.BoxGeometry(CW, CH, 0.02);
    const fx: CardFx[] = [];
    const buildCards = (rarities: Rarity[]) => {
      rarities.forEach((rarity) => {
        const color = new THREE.Color(RARITY_COLOR[rarity]);
        const holder = new THREE.Group();
        holder.visible = false;
        scene.add(holder);
        const edge = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 });
        const card = new THREE.Mesh(cardGeo, [edge, edge, edge, edge, backMat!, backMat!]);
        holder.add(card);
        const rim = new THREE.Mesh(new THREE.PlaneGeometry(CW * (260 / 180), CH * (340 / 260)), new THREE.MeshBasicMaterial({ map: rimTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
        rim.position.z = 0.012;
        holder.add(rim);
        const sparks = Array.from({ length: { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 }[rarity] }, () => {
          const sp = new THREE.Sprite(additive(sparkTex, color.clone().lerp(white, 0.5), 0));
          sp.scale.set(0.38, 0.38, 1);
          holder.add(sp);
          return sp;
        });
        let rays: CardFx['rays'] = null;
        let wave: THREE.Sprite | null = null;
        if (rarity === 'LEGENDARY') {
          rays = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: raysTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
          rays.position.z = -0.3;
          holder.add(rays);
          wave = new THREE.Sprite(additive(ringTex, color, 0));
          wave.position.z = -0.05;
          holder.add(wave);
        }
        fx.push({ holder, card, rim, sparks, rays, wave, color, rarity, fade: 1 });
      });
    };

    let disposed = false;
    Promise.all([
      loader.loadAsync(live.current.packArt),
      live.current.cardBack ? loader.loadAsync(live.current.cardBack) : Promise.resolve(null),
    ])
      .then(([packTex, backTex]) => {
        if (disposed) return;
        packTex.colorSpace = THREE.SRGBColorSpace;
        textures.push(packTex);
        const img = packTex.image as { width: number; height: number };
        PH = PW * (img.height / img.width);
        packG = new THREE.Group();
        packMat = new THREE.MeshStandardMaterial({ map: packTex, alphaTest: 0.5, metalness: 0.55, roughness: 0.28, envMapIntensity: 1.1, emissive: glow, emissiveIntensity: 0 });
        packG.add(new THREE.Mesh(pillow(1), packMat));
        packG.add(new THREE.Mesh(pillow(-1), new THREE.MeshStandardMaterial({ map: packTex, alphaTest: 0.5, metalness: 0.6, roughness: 0.4, color: 0x555555, side: THREE.BackSide })));
        aura = new THREE.Sprite(additive(glowTex, glow, 0.35));
        aura.scale.set(6, 8, 1);
        aura.position.z = -0.6;
        packG.add(aura);
        scene.add(packG);
        if (backTex) {
          backTex.colorSpace = THREE.SRGBColorSpace;
          textures.push(backTex);
        }
        backMat = new THREE.MeshStandardMaterial({ map: backTex ?? null, color: backTex ? 0xffffff : 0x2a2350, metalness: 0.25, roughness: 0.45 });
        live.current.onReady();
      })
      .catch(() => !disposed && live.current.onUnavailable());

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    let openedAt = -1;
    let landedAt = -1;
    let spin = 0;
    let hover = 0;
    const packBase = new THREE.Vector3();
    let packScale = 1;
    const clock = new THREE.Clock();
    let last = 0;
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(0.05, t - last);
      last = t;
      const p = live.current;
      glint.position.set(Math.sin(t * 0.7) * 4, 2 + Math.cos(t * 0.5) * 1.5, 4);

      // The pack follows the pack button while it is shown.
      const pr = p.packRect();
      if (packG && pr && openedAt < 0) {
        const w = world(pr, 0);
        packBase.set(w.x, w.y, 0);
        packScale = w.height / PH;
      }
      if (p.stage !== 'intro' && openedAt < 0 && p.rarities.length && backMat) {
        openedAt = t;
        buildCards(p.rarities);
      }

      if (packG && openedAt < 0) {
        hover += ((p.hover ? 1 : 0) - hover) * 0.1;
        packG.position.set(packBase.x, packBase.y + Math.sin(t * 1.1) * 0.12 * packScale, 0);
        packG.rotation.set(Math.sin(t * 0.8) * 0.05, Math.sin(t * 0.55) * 0.32, 0);
        packG.scale.setScalar(packScale * (1 + hover * 0.04));
      }

      if (openedAt >= 0) {
        const k = t - openedAt;
        const slots = p.slotRects();
        const cardScale = (() => {
          const r = slots.find(Boolean);
          return r ? world(r, CARD_PLANE_Z).width / CW : 1;
        })();
        if (packG && k < CHARGE + IMPLODE) {
          // Charge: spins up, rises, draws in sparks; the camera leans in.
          const c = Math.min(1, k / CHARGE);
          spin += dt * (1 + easeIn(c) * 22);
          packG.rotation.set(packG.rotation.x * 0.9, spin, 0);
          packG.position.y = packBase.y + ease(c) * 0.5 * packScale;
          packMat!.emissiveIntensity = easeIn(c) * 1.2;
          aura!.material.opacity = 0.35 + c * 0.65;
          coreLight.color.copy(glow);
          coreLight.position.set(packBase.x, packBase.y, 1.5);
          coreLight.intensity = c * 40;
          camera.position.z = SCENE_CAMERA.z - ease(c) * 2.2;
          if (k < CHARGE) {
            for (let n = 0; n < 6; n++) {
              const a = Math.random() * Math.PI * 2;
              const r = (4 + Math.random() * 3) * packScale;
              emit({ pos: new THREE.Vector3(packBase.x + Math.cos(a) * r, packBase.y + Math.sin(a) * r, (Math.random() - 0.5) * 2), vel: new THREE.Vector3(), attract: packBase.clone(), color: Math.random() < 0.7 ? glow : white, life: 1.1, age: 0, drag: 0.96 });
            }
          } else {
            // Implode into a bright point.
            const q = easeIn((k - CHARGE) / IMPLODE);
            spin += dt * 30;
            packG.rotation.y = spin;
            packG.scale.setScalar(Math.max(0.001, packScale * (1 - q)));
            flash.position.set(packBase.x, packG.position.y, 1);
            flash.material.opacity = q;
            flash.scale.setScalar((0.5 + q * 1.5) * packScale);
          }
        }
        const kb = k - CHARGE - IMPLODE;
        if (kb >= 0 && packG?.visible) {
          // Burst.
          packG.visible = false;
          for (let n = 0; n < 260; n++) {
            const d = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, (Math.random() - 0.5) * 0.6).normalize();
            emit({ pos: new THREE.Vector3(packBase.x, packBase.y + 0.5 * packScale, 0.5), vel: d.multiplyScalar(4 + Math.random() * 9), color: Math.random() < 0.6 ? glow : white, life: 0.9 + Math.random() * 0.9, age: 0, drag: 0.94 });
          }
          ring.position.set(packBase.x, packBase.y, 0.8);
          fx.forEach((f) => (f.holder.visible = true));
        }
        if (kb >= 0) {
          flash.material.opacity = Math.max(0, 1 - kb * 2.2);
          flash.scale.setScalar(2 + kb * 14);
          ring.material.opacity = Math.max(0, 1 - kb * 1.4);
          ring.scale.setScalar(1 + kb * 16);
          coreLight.intensity = Math.max(0, 40 - kb * 50);
          camera.position.z = SCENE_CAMERA.z - 2.2 * (1 - easeIO(kb / 1.0));
          // Spiral out from the pack, then land on the slots.
          fx.forEach((f, i) => {
            const d = kb - i * STAGGER;
            const sp = Math.min(1, Math.max(0, d / SPIRAL));
            const ang = i * ((Math.PI * 2) / Math.max(1, fx.length)) + sp * Math.PI * 2.2;
            const r = ease(sp) * 2.6 * cardScale;
            const spiral = new THREE.Vector3(packBase.x + Math.cos(ang) * r * 1.3, packBase.y + 0.5 * packScale + Math.sin(ang) * r * 0.75, CARD_PLANE_Z + sp * 0.6);
            const slot = slots[i];
            const target = slot ? world(slot, CARD_PLANE_Z) : null;
            const settle = easeIO((d - SPIRAL) / SETTLE);
            const to = target ? new THREE.Vector3(target.x, target.y, CARD_PLANE_Z) : spiral;
            f.holder.position.lerpVectors(spiral, to, settle);
            f.holder.scale.setScalar(Math.max(0.01, ease(d / 0.4)) * cardScale);
            f.holder.rotation.set(0, (1 - settle) * Math.sin(sp * Math.PI * 3) * 0.6, (1 - settle) * (ang + Math.PI / 2) * 0.25);
            f.rim.material.opacity = settle * (f.rarity === 'COMMON' ? 0.35 : 1);
            if (d > 0 && settle < 1) {
              for (let n = 0; n < 4; n++) emit({ pos: f.holder.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, -0.1)), vel: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0), color: f.color, life: 0.7, age: 0, drag: 0.985 });
            }
          });
          const landed = kb > STAGGER * (fx.length - 1) + SPIRAL + SETTLE;
          if (landed && landedAt < 0) {
            landedAt = t;
            camera.position.z = SCENE_CAMERA.z;
            fx.forEach((f) => (f.card.visible = false)); // the real cards take over from here
            p.onLanded();
          }
        }
      }

      // After landing: the rarity rims follow their slots until each card is turned.
      if (landedAt >= 0) {
        const kd = t - landedAt;
        const slots = p.slotRects();
        fx.forEach((f, i) => {
          const r = slots[i];
          if (r) {
            const w = world(r, CARD_PLANE_Z);
            f.holder.position.set(w.x, w.y, CARD_PLANE_Z);
            // Width and height apart: the rim narrows with the card as it is turned.
            f.holder.scale.set(w.width / CW, w.height / CH, w.height / CH);
            f.holder.rotation.set(0, 0, 0);
          }
          f.fade = Math.max(0, f.fade - (p.revealed[i] ? dt * 2.5 : 0));
          f.holder.visible = f.fade > 0 && !!r;
          if (!f.holder.visible) return;
          f.rim.material.opacity = f.fade * (f.rarity === 'COMMON' ? 0.35 : 0.85 + Math.sin(t * 2.4 + i) * 0.15);
          f.sparks.forEach((sp, n) => {
            const u = (t * { COMMON: 0, RARE: 0.07, EPIC: 0.085, LEGENDARY: 0.1 }[f.rarity] + n / f.sparks.length) % 1;
            const w = CW + 0.08;
            const h = CH + 0.08;
            const dd = u * 2 * (w + h);
            const [x, y] = dd < w ? [-w / 2 + dd, h / 2] : dd < w + h ? [w / 2, h / 2 - (dd - w)] : dd < 2 * w + h ? [w / 2 - (dd - w - h), -h / 2] : [-w / 2, -h / 2 + (dd - 2 * w - h)];
            sp.position.set(x, y, 0.03);
            sp.material.opacity = Math.min(1, kd * 2) * f.fade;
            if (Math.random() < 0.7 * f.fade) emit({ pos: f.holder.localToWorld(sp.position.clone()), vel: new THREE.Vector3(), color: f.color, life: 0.45, age: 0, drag: 0.985 });
          });
          const s = f.holder.scale.y;
          if (f.rarity === 'EPIC' && Math.random() < 0.5 * f.fade) {
            emit({ pos: f.holder.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * CW * s, (-CH / 2) * s, 0)), vel: new THREE.Vector3(0, (0.5 + Math.random() * 0.6) * s, 0), color: f.color, life: 1.3, age: 0, drag: 0.995 });
          }
          if (f.rays && f.wave) {
            f.rays.rotation.z = t * 0.25;
            f.rays.material.opacity = f.fade * Math.min(0.75, kd * 0.8) * (0.85 + Math.sin(t * 2) * 0.15);
            const wk = (kd % 2.6) / 1.3;
            f.wave.material.opacity = f.fade * (wk < 1 ? (1 - wk) * 0.8 : 0);
            f.wave.scale.setScalar(1.5 + wk * 5);
            for (let n = 0; n < 2; n++) {
              if (Math.random() > f.fade) continue;
              const a = t * 0.55 + n * Math.PI + Math.random() * 0.3;
              emit({ pos: f.holder.position.clone().add(new THREE.Vector3(Math.cos(a) * 1.25 * s, Math.sin(a) * 1.45 * s, 0.25)), vel: new THREE.Vector3(-Math.sin(a) * 0.12, Math.cos(a) * 0.12 + 0.1, 0).multiplyScalar(s), color: Math.random() < 0.5 ? f.color : new THREE.Color('#fff2c4'), life: 0.9, age: 0, drag: 0.985 });
            }
          }
        });
      }

      // Particles.
      particles = particles.filter((q) => (q.age += dt) < q.life);
      particles.forEach((q, i) => {
        if (q.attract) {
          const d = q.attract.clone().sub(q.pos);
          q.vel.addScaledVector(d, dt * 3.2).addScaledVector(new THREE.Vector3(-d.y, d.x, 0), -dt * 1.8);
        }
        q.vel.multiplyScalar(q.drag);
        q.pos.addScaledVector(q.vel, dt);
        const f = Math.sin(Math.PI * Math.min(1, q.age / q.life));
        pPos.set([q.pos.x, q.pos.y, q.pos.z], i * 3);
        pCol.set([q.color.r * f, q.color.g * f, q.color.b * f], i * 3);
      });
      pGeo.setDrawRange(0, particles.length);
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Sprite || o instanceof THREE.Points) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material) => m.dispose());
        }
      });
      textures.forEach((tx) => tx.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
    // The scene is built once per pack; everything else is read live from `live.current`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="pack-scene-3d" aria-hidden />;
}
