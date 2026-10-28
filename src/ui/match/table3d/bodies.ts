import * as THREE from 'three';
import type { GameState } from '@/engine/types';
import { useMatch } from '@/state/matchStore';
import { MAT, PLANE, TILT } from './tableCamera';
import { approach, cardsDrawn, coverUv, energyColors, isEnemyUnit, ownerOf, pileCards, riseShift } from './bodyRules';
import { arcHeight } from './effectRules';
import type { Effects } from './effects';
import { makeGem, numberTexture, rectGlowTexture, unitFace } from './cardFaces';
import type { AbilityIconKind } from '@/ui/components/AbilityIcon';

/**
 * The 3D bodies on the table (WebGL), following the match DOM laid onto the mat: a thick card for
 * every unit (its whole art on top, a gold bevelled edge), a plinth under each Warden, real piles
 * of card backs for the decks and cut crystals for the energy. The DOM keeps everything that
 * carries information (stats, keyword icons with their tooltips, statuses, effects) and stays the
 * hit target; these only add the bodies under it.
 */
export interface Bodies {
  /** `toScreen`: a world point to screen px (the camera's projection). */
  update(plane: HTMLElement, toMat: (x: number, y: number) => THREE.Vector3 | null, game: GameState | null, t: number, toScreen: (v: THREE.Vector3) => { x: number; y: number }): void;
  /** Where the unit with this entity key last stood (kept a few seconds after it leaves the table). */
  lastAt(key: string): THREE.Vector3 | undefined;
  dispose(): void;
}

const PX = MAT.w / PLANE.w; // world units per plane pixel
const CT = 0.06; // card thickness
const FLOAT = 0.3; // how high the cards float above the table (the mockup's)

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const a = w / 2;
  const b = h / 2;
  s.moveTo(-a + r, -b);
  s.lineTo(a - r, -b);
  s.quadraticCurveTo(a, -b, a, -b + r);
  s.lineTo(a, b - r);
  s.quadraticCurveTo(a, b, a - r, b);
  s.lineTo(-a + r, b);
  s.quadraticCurveTo(-a, b, -a, b - r);
  s.lineTo(-a, -b + r);
  s.quadraticCurveTo(-a, -b, -a + r, -b);
  return s;
}

/** A pointy-top hexagon w×h, like the Warden's portrait. */
function hexShape(w: number, h: number): THREE.Shape {
  const s = new THREE.Shape();
  const pts = [[0, h / 2], [w / 2, h / 4], [w / 2, -h / 4], [0, -h / 2], [-w / 2, -h / 4], [-w / 2, h / 4]];
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, srgb = false) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const percent = (v: string | undefined, fallback: number) => {
  const n = parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
};

export function createBodies(scene: THREE.Scene, effects: Effects): Bodies {
  const owned: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (owned.push(x), x);
  // One texture per picture (from the browser cache, as the DOM already shows it); null until loaded.
  const loader = new THREE.TextureLoader();
  const images = new Map<string, { tex: THREE.Texture; ready: boolean }>();
  const image = (url: string) => {
    let e = images.get(url);
    if (!e) {
      const entry = { tex: keep(loader.load(url, () => (entry.ready = true))), ready: false };
      entry.tex.colorSpace = THREE.SRGBColorSpace;
      entry.tex.anisotropy = 8;
      images.set(url, (e = entry));
    }
    return e.ready ? e.tex : null;
  };

  const gold = keep(new THREE.MeshStandardMaterial({ color: 0xd9a63a, metalness: 0.95, roughness: 0.28 }));
  const darkGold = keep(new THREE.MeshStandardMaterial({ color: 0x8a6526, metalness: 0.9, roughness: 0.38 }));
  const backMat = keep(new THREE.MeshStandardMaterial({ color: 0x1a1430, roughness: 0.6 }));
  const shadowTex = keep(
    canvasTexture(128, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(0,0,0,.65)');
      r.addColorStop(0.6, 'rgba(0,0,0,.28)');
      r.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
  );
  // A thin glowing ring (white; tinted by the material).
  const ringGlow = keep(
    canvasTexture(128, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(255,255,255,0)');
      r.addColorStop(0.5, 'rgba(255,255,255,0)');
      r.addColorStop(0.66, 'rgba(255,255,255,1)');
      r.addColorStop(0.78, 'rgba(255,255,255,.45)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
  );
  const glowTex = keep(
    canvasTexture(64, (g, s) => {
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.35, 'rgba(255,255,255,.35)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
    }),
  );
  // The default card back (no purchased design): deep violet, a gold border and a crystal.
  const defaultBack = keep(
    canvasTexture(
      256,
      (g, s) => {
        g.fillStyle = '#241a44';
        g.fillRect(0, 0, s, s);
        g.strokeStyle = '#c9963a';
        g.lineWidth = s * 0.05;
        g.strokeRect(s * 0.06, s * 0.06, s * 0.88, s * 0.88);
        g.fillStyle = '#e8b04b';
        g.beginPath();
        g.moveTo(s / 2, s * 0.28);
        g.lineTo(s * 0.64, s / 2);
        g.lineTo(s / 2, s * 0.72);
        g.lineTo(s * 0.36, s / 2);
        g.closePath();
        g.fill();
      },
      true,
    ),
  );

  // ---- Units: a card per unit element, reused while that element stays on the table.
  type Gem = ReturnType<typeof makeGem>;
  interface UnitBody {
    g: THREE.Group;
    face: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
    atk: Gem;
    hp: Gem;
    ring: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    enemy: boolean;
    shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    w: number;
    h: number;
    art: string;
    lift: number;
    /** 1 → 0 while a just-summoned card drops onto the table. */
    drop: number;
    /** Its own beat for the float. */
    phase: number;
    /** Plane px the unit's DOM is moved to stay on the risen card. */
    shift: { dx: number; dy: number };
    key: string;
    at: THREE.Vector3;
    seen: boolean;
  }
  const units = new Map<HTMLElement, UnitBody>();
  // Last positions by entity key; a killing hit's effect arrives with the unit already gone.
  const lastSeen = new Map<string, { at: THREE.Vector3; t: number }>();
  const ringTex = keep(rectGlowTexture());
  const dropUnit = (u: UnitBody) => {
    scene.remove(u.g, u.shadow, u.ring);
    u.ring.geometry.dispose();
    u.ring.material.dispose();
    for (const gm of [u.atk, u.hp]) {
      (gm.gem.material as THREE.Material).dispose();
      gm.num.material.dispose();
    }
    u.g.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    u.face.material.map?.dispose();
    u.face.material.dispose();
    u.shadow.geometry.dispose();
    u.shadow.material.dispose();
  };
  const makeUnit = (w: number, h: number, enemy: boolean): UnitBody => {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roundedRect(w, h, Math.min(w, h) * 0.07), { depth: CT, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.022, bevelSegments: 3 }),
      [backMat, enemy ? darkGold : gold],
    );
    slab.castShadow = true;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), new THREE.MeshPhysicalMaterial({ roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.5, transparent: true, color: 0x2a2244 }));
    face.position.z = CT + 0.021;
    g.add(slab, face);
    // Raised stat gems in the bottom corners, their numbers drawn with depth (as in the mockup).
    const k = w / 1.45;
    const atk = makeGem('atk', k);
    const hp = makeGem('hp', k);
    atk.gem.position.set(-w / 2 + 0.05 * k, -h / 2 + 0.02 * k, CT + 0.09 * k);
    hp.gem.position.set(w / 2 - 0.05 * k, -h / 2 + 0.02 * k, CT + 0.09 * k);
    for (const gm of [atk, hp]) {
      gm.num.position.copy(gm.gem.position).add(new THREE.Vector3(0, 0, 0.3 * k));
      g.add(gm.gem, gm.num);
    }
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.7, h * 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.62, h * 1.45), new THREE.MeshBasicMaterial({ map: ringTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
    scene.add(shadow, ring, g);
    return { g, face, atk, hp, ring, enemy, shadow, w, h, art: '', lift: 0, drop: 0, phase: Math.random() * 6, shift: { dx: 0, dy: 0 }, key: '', at: new THREE.Vector3(), seen: true };
  };

  // ---- Wardens: a raised gold hexagon with the portrait on top (the DOM keeps Health, frame effects
  // and the hit target, moved up onto it).
  interface HeroBody { plinth: THREE.Mesh; face: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>; w: number; h: number; art: string; shift: { dx: number; dy: number } }
  const heroes = new Map<string, HeroBody>();
  const HERO_D = 0.07; // a thin gold frame lying on the table, as in the mockup
  const dropHero = (b: HeroBody) => {
    scene.remove(b.plinth, b.face);
    b.plinth.geometry.dispose();
    b.face.geometry.dispose();
    b.face.material.map?.dispose();
    b.face.material.dispose();
  };
  const makeHero = (w: number, h: number): HeroBody => {
    const plinth = new THREE.Mesh(new THREE.ExtrudeGeometry(hexShape(w * 1.03, h * 1.03), { depth: HERO_D, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }), [backMat, gold]);
    plinth.castShadow = true;
    // The portrait: a hexagon a little inside the gold rim, its UVs spanning the hexagon's box.
    const geo = new THREE.ShapeGeometry(hexShape(w * 0.985, h * 0.985));
    const uv = geo.attributes.uv;
    const pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (w * 0.985) + 0.5, pos.getY(i) / (h * 0.985) + 0.5);
    const face = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2a2244, roughness: 0.55 }));
    scene.add(plinth, face);
    return { plinth, face, w, h, art: '', shift: { dx: 0, dy: 0 } };
  };

  // ---- Warden abilities: gold-rimmed tokens (hexagonal when active, round when passive).
  interface Token { m: THREE.Mesh; top: THREE.MeshStandardMaterial; halo: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; passive: boolean; w: number; lift: number; shift: { dx: number; dy: number }; seen: boolean }
  const tokens = new Map<HTMLElement, Token>();
  const TOKEN_D = 0.1;
  const dropToken = (k: Token) => {
    scene.remove(k.m, k.halo);
    k.m.geometry.dispose();
    k.top.dispose();
    k.halo.geometry.dispose();
    k.halo.material.dispose();
  };
  const makeToken = (w: number, h: number, passive: boolean): Token => {
    const shape = passive ? new THREE.Shape().absarc(0, 0, w / 2, 0, Math.PI * 2, false) : hexShape(w, h);
    const top = new THREE.MeshStandardMaterial({ color: 0x3d3564, roughness: 0.5, metalness: 0.2 });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: TOKEN_D, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24 }), [top, gold]);
    m.castShadow = true;
    // A bright ring lying on the table round a usable ability, pulsing so it can't be missed (flat, so it
    // never cuts through the token).
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringGlow, color: '#4dff88', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, toneMapped: false }));
    halo.renderOrder = 1;
    scene.add(m, halo);
    return { m, top, halo, passive, w, lift: 0, shift: { dx: 0, dy: 0 }, seen: true };
  };

  // ---- Card piles.
  interface Pile { g: THREE.Group; n: number; url: string; w: number; face: THREE.Texture }
  const deckCounts = new Map<string, { deck: number; hand: number }>();
  const piles = new Map<string, Pile>();
  const dropPile = (p: Pile) => {
    scene.remove(p.g);
    p.g.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material[4].dispose();
    });
  };

  // ---- The opponent's hand: card backs fanned in the air over the far edge (as in the mockup).
  const foe: THREE.Mesh[] = [];
  let foeFace: THREE.Texture | null = null;
  const foeGeo = keep(new THREE.BoxGeometry(1.45 * 0.52, 1.45 * 1.4 * 0.52, 0.035));
  const foeMats = new Map<THREE.Texture, THREE.MeshStandardMaterial>();
  const foeBack = (face: THREE.Texture) => {
    let m = foeMats.get(face);
    // A little light of their own: the lamps are behind them as seen from your seat.
    if (!m) foeMats.set(face, (m = keep(new THREE.MeshStandardMaterial({ map: face, roughness: 0.5, emissive: 0xffffff, emissiveMap: face, emissiveIntensity: 0.08 }))));
    return m;
  };

  // ---- Energy crystals: tall cut crystals in gold sockets.
  const crystalGeo = keep(new THREE.LatheGeometry([[0, -0.02], [0.1, 0.06], [0.12, 0.32], [0.07, 0.48], [0, 0.56]].map(([r, y]) => new THREE.Vector2(r, y)), 6));
  crystalGeo.rotateX(Math.PI / 2);
  const socketGeo = keep(new THREE.CylinderGeometry(0.15, 0.19, 0.08, 6));
  socketGeo.rotateX(Math.PI / 2);
  interface Crystal { g: THREE.Group; gem: THREE.Mesh<THREE.LatheGeometry, THREE.MeshPhysicalMaterial>; halo: THREE.Sprite; seen: boolean }
  const crystals = new Map<HTMLElement, Crystal>();
  const dropCrystal = (c: Crystal) => {
    scene.remove(c.g);
    c.gem.material.dispose();
    c.halo.material.dispose();
  };
  const makeCrystal = (): Crystal => {
    const g = new THREE.Group();
    const socket = new THREE.Mesh(socketGeo, gold);
    socket.position.z = 0.04;
    socket.castShadow = true;
    const gem = new THREE.Mesh(crystalGeo, new THREE.MeshPhysicalMaterial({ roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.95, toneMapped: false }));
    gem.position.z = 0.06;
    gem.castShadow = true;
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
    halo.scale.set(0.7, 0.7, 1);
    halo.position.z = 0.32;
    g.add(socket, gem, halo);
    scene.add(g);
    return { g, gem, halo, seen: true };
  };

  const centre = (el: Element, toMat: (x: number, y: number) => THREE.Vector3 | null) => {
    const r = el.getBoundingClientRect();
    return toMat(r.left + r.width / 2, r.top + r.height / 2);
  };

  // The WAAPI lunge matchStore plays on an attacking unit (CSS animations are CSSAnimation): its progress.
  const lungeProgress = (el: HTMLElement) => {
    const a = el.getAnimations().find((x) => !('animationName' in x));
    const d = Number(a?.effect?.getTiming().duration);
    return a && d ? Number(a.currentTime) / d : 0;
  };
  let last = 0;

  return {
    update(plane, toMat, game, t, toScreen) {
      // The mat point a raised world point appears over: DOM moved there sits on the raised object.
      const seenAt = (v: THREE.Vector3) => {
        const s = toScreen(v);
        return toMat(s.x, s.y);
      };
      const dt = Math.min(0.05, last ? t - last : 0);
      last = t;
      // Units (a dying unit's ghost keeps its flat DOM art for the death animation, so no body).
      for (const u of units.values()) u.seen = false;
      plane.querySelectorAll<HTMLElement>('.unit:not(.is-dying)').forEach((el) => {
        const p = centre(el, toMat);
        if (!p) return;
        const w = el.offsetWidth * PX;
        const h = el.offsetHeight * PX;
        let b = units.get(el);
        if (!b || Math.abs(b.w - w) > 1e-3 || Math.abs(b.h - h) > 1e-3) {
          if (b) dropUnit(b);
          const fresh = !b;
          b = makeUnit(w, h, isEnemyUnit(el));
          if (fresh && el.classList.contains('is-summoned')) b.drop = 1;
          units.set(el, b);
        }
        b.seen = true;
        b.key = el.dataset.entity ?? b.key;
        // The face (mockup): the whole art in a gold frame, the ability icons along its foot.
        const img = el.querySelector<HTMLImageElement>('.unit-art');
        const icons = [...el.querySelectorAll<SVGElement>('.badge-icon')].map((x) => x.dataset.kind as AbilityIconKind);
        const faceKey = `${img?.src ?? ''}|${icons.join(',')}`;
        const loaded = img?.src && faceKey !== b.art ? image(img.src) : null;
        if (img && loaded) {
          b.art = faceKey;
          const pos = getComputedStyle(img).objectPosition.split(' ');
          b.face.material.map?.dispose();
          b.face.material.map = unitFace(loaded.image as HTMLImageElement, { enemy: b.enemy, icons, fx: percent(pos[0], 50), fy: percent(pos[1], 40) });
          b.face.material.color.set(0xffffff);
          b.face.material.needsUpdate = true;
        }
        // Stats from the DOM (current values; buffed green, hurt pale red).
        const stat = (gm: Gem, sel: string) => {
          const s2 = el.querySelector<HTMLElement>(sel);
          const v = s2?.textContent?.trim() ?? '';
          const c = s2?.classList.contains('up') ? '#7ef29a' : s2?.classList.contains('down') ? '#ffb4a8' : '#ffffff';
          if (v !== gm.value || c !== gm.color) {
            gm.value = v;
            gm.color = c;
            gm.num.material.map = numberTexture(v, c);
            gm.num.material.needsUpdate = true;
          }
        };
        stat(b.atk, '.unit-atk');
        stat(b.hp, '.unit-hp');
        const m = b.face.material;
        const corrupt = el.classList.contains('is-corrupt');
        m.color.set(corrupt ? '#c9a2ff' : el.classList.contains('is-silenced') ? '#8a8a8a' : '#ffffff');
        m.opacity = el.classList.contains('has-ambush') ? 0.55 : 1;
        const up = el.matches(':hover') || el.classList.contains('is-selected') ? 1 : 0;
        b.lift = approach(b.lift, up, dt, 12);
        b.drop = Math.max(0, b.drop - dt * 2.2);
        // As in the mockup: the cards float above the table leaning towards you, breathing a little; the
        // one pointed at comes up and stands taller. The DOM follows the float, not the pointing lift
        // (moving the hit target with it would make the hover flicker).
        const bob = Math.sin(t * 1.3 + b.phase) * 0.012;
        const rise = FLOAT + bob + b.drop * b.drop * 1.4 + arcHeight(lungeProgress(el));
        const z = MAT.top + rise + b.lift * 0.45;
        // The DOM on the card (stats, icons, the ready glow) rises with it: moved up the mat by as much as
        // the lift shows; its rect already includes last frame's move, so take that back out first.
        p.x -= b.shift.dx * PX;
        p.y += b.shift.dy * PX;
        const shift = riseShift(p, seenAt(new THREE.Vector3(p.x, p.y, MAT.top + rise)));
        // Only what was written counts as the shift (else a small, unwritten change would make the card
        // drift from its DOM while the camera moves).
        if (Math.abs(shift.dx - b.shift.dx) + Math.abs(shift.dy - b.shift.dy) > 0.05) {
          el.style.translate = shift.dx || shift.dy ? `${shift.dx.toFixed(2)}px ${shift.dy.toFixed(2)}px` : '';
          b.shift = shift;
        }
        b.g.position.set(p.x, p.y, z);
        b.g.rotation.x = TILT * 0.5 + b.lift * 0.25;
        b.at.set(p.x, p.y, z);
        if (b.key) lastSeen.set(b.key, { at: b.at.clone(), t });
        b.shadow.position.set(p.x + b.lift * 0.3 * (b.w / 1.45), p.y + b.lift * 0.3 * (b.w / 1.45), MAT.top + 0.004);
        b.shadow.material.opacity = 1 - b.lift * 0.45;
        // The ring: ready to attack (green), chosen (cyan), a valid target (red).
        const ring = el.classList.contains('is-targetable') ? '#ff6b5a' : el.classList.contains('is-selected') ? '#5fe1ff' : el.classList.contains('is-ready') ? '#1fd65a' : '';
        b.ring.material.color.set(ring || '#ffffff');
        b.ring.material.opacity = ring ? 0.7 + Math.sin(t * 3) * 0.3 : 0;
        b.ring.position.copy(b.g.position);
        b.ring.rotation.copy(b.g.rotation);
        b.ring.translateZ(CT + 0.03);
        b.shadow.scale.setScalar(1 + b.lift * 0.35);
      });
      // Units that died (the store keeps their ghosts for the death animation) shatter; others just go.
      const dead = new Set(useMatch.getState().ghosts.map((g) => `u:${g.unit.uid}`));
      for (const [k, s] of lastSeen) if (t - s.t > 5) lastSeen.delete(k);
      for (const [k, u] of units)
        if (!u.seen) {
          if (dead.has(u.key)) effects.shatter(u.face.material.map, u.w, u.h, u.at);
          dropUnit(u);
          units.delete(k);
        }

      // Wardens: the portrait on a raised plinth; the DOM on it (Health, glows) moved up onto its top.
      const raise = (el: HTMLElement, p: THREE.Vector3, height: number, shift: { dx: number; dy: number }) => {
        p.x -= shift.dx * PX;
        p.y += shift.dy * PX;
        const next = riseShift(p, seenAt(new THREE.Vector3(p.x, p.y, MAT.top + height)));
        // Returns the shift actually written (see the units above).
        if (Math.abs(next.dx - shift.dx) + Math.abs(next.dy - shift.dy) <= 0.05) return shift;
        el.style.translate = `${next.dx.toFixed(2)}px ${next.dy.toFixed(2)}px`;
        return next;
      };
      const heroSeen = new Set<string>();
      plane.querySelectorAll<HTMLElement>('[data-entity^="h:"]').forEach((el) => {
        const key = el.dataset.entity!;
        const p = centre(el, toMat);
        if (!p) return;
        heroSeen.add(key);
        const w = el.offsetWidth * PX;
        const h = el.offsetHeight * PX;
        let b = heroes.get(key);
        if (!b || Math.abs(b.w - w) > 1e-3 || Math.abs(b.h - h) > 1e-3) {
          if (b) dropHero(b);
          b = makeHero(w, h);
          heroes.set(key, b);
        }
        const img = el.querySelector<HTMLImageElement>('img');
        const art = img?.src ?? '';
        const loaded = art && art !== b.art ? image(art) : null;
        if (loaded) {
          b.art = art;
          const map = loaded.clone();
          const uv = coverUv(loaded.image.width, loaded.image.height, w, h, 50, 35);
          map.repeat.set(uv.repeatX, uv.repeatY);
          map.offset.set(uv.offsetX, uv.offsetY);
          map.needsUpdate = true;
          b.face.material.map?.dispose();
          b.face.material.map = map;
          b.face.material.color.set(0xffffff);
          b.face.material.needsUpdate = true;
        }
        // A purchased frame wraps the Warden: it rises with it.
        b.shift = raise(el.closest<HTMLElement>('.framed-slot') ?? el, p, HERO_D + 0.035, b.shift);
        b.plinth.position.set(p.x, p.y, MAT.top);
        b.face.position.set(p.x, p.y, MAT.top + HERO_D + 0.032);
        // The Final Blow shatters the Warden's portrait: its plinth goes with it.
        b.plinth.visible = b.face.visible = !el.classList.contains('is-shattering');
      });
      // A Warden that left the table (a co-op ally fallen) takes its plinth along.
      for (const [k, b] of heroes)
        if (!heroSeen.has(k)) {
          dropHero(b);
          heroes.delete(k);
        }

      // Warden abilities: tokens under the DOM icons, lit when usable.
      for (const k of tokens.values()) k.seen = false;
      plane.querySelectorAll<HTMLElement>('.hero-power').forEach((el) => {
        const p = centre(el, toMat);
        if (!p) return;
        const passive = el.classList.contains('is-passive');
        const w = el.offsetWidth * PX;
        let k = tokens.get(el);
        if (!k || k.passive !== passive || Math.abs(k.w - w) > 1e-3) {
          if (k) dropToken(k);
          k = makeToken(w, el.offsetHeight * PX, passive);
          tokens.set(el, k);
        }
        k.seen = true;
        const tint = getComputedStyle(el.closest('.hero-abilities') ?? el).getPropertyValue('--ability-tint').trim() || '#e8b04b';
        const usable = el.classList.contains('is-usable');
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
        k.top.color.set(usable ? '#5e4614' : passive ? '#2e2648' : '#3d3564');
        k.top.emissive.set(usable ? tint : '#000000');
        // Bright enough to catch the eye, not so bright the icon on it washes out.
        k.top.emissiveIntensity = usable ? 0.2 + pulse * 0.2 : 0;
        k.top.transparent = el.classList.contains('is-used');
        k.top.opacity = k.top.transparent ? 0.5 : 1;
        // A usable ability rises a little off the table and glows.
        k.lift = approach(k.lift, usable ? 1 : 0, dt, 8);
        const z = MAT.top + k.lift * 0.06;
        k.shift = raise(el, p, z - MAT.top + TOKEN_D + 0.02, k.shift);
        k.m.position.set(p.x, p.y, z);
        k.halo.material.opacity = usable ? 0.75 + pulse * 0.25 : 0;
        k.halo.scale.setScalar(w * (1.55 + pulse * 0.12));
        k.halo.position.set(p.x, p.y, MAT.top + 0.006);
      });
      for (const [el, k] of tokens)
        if (!k.seen) {
          dropToken(k);
          tokens.delete(el);
        }

      // Card piles: a stack of real card backs, thinner as the deck runs down.
      plane.querySelectorAll<HTMLElement>('[data-draw-pile]').forEach((el) => {
        const key = el.dataset.drawPile!;
        const p = centre(el.querySelector('.draw-pile-stack') ?? el, toMat);
        if (!p) return;
        const count = game?.players[Number(key)]?.deck.length ?? 0;
        const n = pileCards(count);
        const src = el.querySelector<HTMLImageElement>('.card-back-img')?.src;
        const backTex = src ? image(src) : null;
        // The default back until the design's picture has loaded (then the pile is rebuilt with it).
        const url = backTex ? src! : '';
        const w = percent(getComputedStyle(el).getPropertyValue('--pile-w'), 80) * PX;
        let pile = piles.get(key);
        if (!pile || pile.n !== n || pile.url !== url || Math.abs(pile.w - w) > 1e-3) {
          if (pile) dropPile(pile);
          const g = new THREE.Group();
          const face = backTex ?? defaultBack;
          for (let i = 0; i < n; i++) {
            const c = new THREE.Mesh(new THREE.BoxGeometry(w, w * 1.4, 0.035), [gold, gold, gold, gold, new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 }), backMat]);
            c.castShadow = true;
            // A small, stable jitter so the pile looks stacked by hand.
            c.position.set(Math.sin(i * 12.9898) * 0.012, Math.sin(i * 78.233) * 0.012, 0.02 + i * 0.045);
            c.rotation.z = Math.sin(i * 4.1) * 0.02;
            g.add(c);
          }
          scene.add(g);
          pile = { g, n, url, w, face };
          piles.set(key, pile);
        }
        pile.g.position.set(p.x, p.y, MAT.top);
        // Lift the DOM count onto the top card (the cards stack from 0.02 in 0.045 steps, 0.035 thick).
        const top = n ? 0.02 + (n - 1) * 0.045 + 0.035 : 0;
        const s = riseShift(p, seenAt(new THREE.Vector3(p.x, p.y, MAT.top + top)));
        const rise = `${(-s.dy).toFixed(1)}px`;
        const side = `${s.dx.toFixed(1)}px`;
        if (el.style.getPropertyValue('--pile-rise') !== rise) el.style.setProperty('--pile-rise', rise);
        if (el.style.getPropertyValue('--pile-side') !== side) el.style.setProperty('--pile-side', side);
        // Cards drawn: their backs fly off the pile towards the owner's hand, one after another.
        const now = { deck: count, hand: game?.players[Number(key)]?.hand.length ?? 0 };
        const before = deckCounts.get(key);
        deckCounts.set(key, now);
        const drawn = before ? cardsDrawn(before, now) : 0;
        if (drawn > 0) {
          const handEl = document.querySelector(key === '0' ? '.match .self-screen .hand' : '.table3d-plane .enemy-hand');
          const r = handEl?.getBoundingClientRect();
          const to = r && toMat(r.left + r.width / 2, r.top + r.height / 2);
          if (to) for (let i = 0; i < drawn; i++) effects.flyCard(pile.face, w, new THREE.Vector3(p.x, p.y, MAT.top + 0.06 + n * 0.045), to.clone().setZ(MAT.top + (key === '0' ? 1.5 : 0.3)), i * 0.14);
        }
      });

      // The opponent's hand, in the air: one back per card they hold.
      const foeCount = game?.players[1]?.hand.length ?? 0;
      const face = piles.get('1')?.face ?? defaultBack;
      if (foe.length !== foeCount || face !== foeFace) {
        foe.forEach((m) => scene.remove(m));
        foe.length = 0;
        foeFace = face;
        for (let i = 0; i < foeCount; i++) {
          const m = new THREE.Mesh(foeGeo, [gold, gold, gold, gold, foeBack(face), backMat]);
          m.castShadow = true;
          scene.add(m);
          foe.push(m);
        }
      }
      foe.forEach((m, i) => {
        const k = i - (foe.length - 1) / 2;
        // Their backs (the +z face, tipped towards you) show; the fan turns a half turn so it reads from their side.
        // Held up at the far edge as the opponent holds them: standing, their backs towards you, leaning
        // a little away (towards their holder), fanned.
        m.position.set(k * 0.5, MAT.h / 2 + 0.02 + Math.abs(k) * 0.03, MAT.top + 0.3 - Math.abs(k) * 0.03 + Math.sin(t * 1.1 + i) * 0.01);
        m.rotation.set(0.7, 0, -k * 0.09, 'ZXY');
      });

      // Energy crystals, one per DOM crystal, in the owner's faction colours.
      for (const c of crystals.values()) c.seen = false;
      plane.querySelectorAll<HTMLElement>('.energy .crystal').forEach((el, i) => {
        const p = centre(el, toMat);
        if (!p) return;
        let c = crystals.get(el);
        if (!c) {
          c = makeCrystal();
          crystals.set(el, c);
        }
        c.seen = true;
        const [tint, deep] = energyColors(game?.players[ownerOf(el)]?.hero.faction);
        const lit = el.classList.contains('full');
        const m = c.gem.material;
        const pulse = Math.sin(t * 2.2 + i);
        m.color.set(lit ? tint : '#1c1a24');
        m.emissive.set(lit ? deep : '#000000');
        m.emissiveIntensity = lit ? 0.55 + pulse * 0.12 : 0;
        m.opacity = lit ? 0.95 : 0.8;
        c.halo.material.color.set(deep);
        c.halo.material.opacity = lit ? 0.3 + pulse * 0.08 : 0;
        c.gem.rotation.z = t * 0.35 + i;
        c.g.position.set(p.x, p.y, MAT.top);
        // Sized to the DOM crystal's slot (its width plus the gap): a socket a little narrower than the slot.
        c.g.scale.setScalar(Math.max(0.4, ((el.offsetWidth + 6) * PX) / 0.42));
      });
      for (const [k, c] of crystals)
        if (!c.seen) {
          dropCrystal(c);
          crystals.delete(k);
        }
    },
    lastAt: (key) => lastSeen.get(key)?.at,
    dispose() {
      units.forEach(dropUnit);
      piles.forEach(dropPile);
      heroes.forEach(dropHero);
      tokens.forEach(dropToken);
      crystals.forEach(dropCrystal);
      foe.forEach((m) => scene.remove(m));
      owned.forEach((o) => o.dispose());
    },
  };
}
