import * as THREE from 'three';
import type { GameState } from '@/engine/types';
import { useMatch } from '@/state/matchStore';
import { MAT, PLANE } from './tableCamera';
import { coverUv, energyColors, pileCards, riseShift } from './bodyRules';
import { arcHeight } from './effectRules';
import type { Effects } from './effects';

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
  interface UnitBody {
    g: THREE.Group;
    face: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
    shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    w: number;
    h: number;
    art: string;
    lift: number;
    /** 1 → 0 while a just-summoned card drops onto the table. */
    drop: number;
    /** Plane px the unit's DOM is moved to stay on the risen card. */
    shift: { dx: number; dy: number };
    key: string;
    at: THREE.Vector3;
    seen: boolean;
  }
  const units = new Map<HTMLElement, UnitBody>();
  // Last positions by entity key; a killing hit's effect arrives with the unit already gone.
  const lastSeen = new Map<string, { at: THREE.Vector3; t: number }>();
  const dropUnit = (u: UnitBody) => {
    scene.remove(u.g, u.shadow);
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
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.05, h - 0.05), new THREE.MeshPhysicalMaterial({ roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.25, transparent: true }));
    face.position.z = CT + 0.019;
    g.add(slab, face);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.7, h * 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    scene.add(shadow, g);
    return { g, face, shadow, w, h, art: '', lift: 0, drop: 0, shift: { dx: 0, dy: 0 }, key: '', at: new THREE.Vector3(), seen: true };
  };

  // ---- Warden plinths.
  const heroes = new Map<string, THREE.Mesh>();

  // ---- Card piles.
  interface Pile { g: THREE.Group; n: number; url: string; w: number; face: THREE.Texture }
  const deckCounts = new Map<string, number>();
  const piles = new Map<string, Pile>();
  const dropPile = (p: Pile) => {
    scene.remove(p.g);
    p.g.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material[4].dispose();
    });
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
          b = makeUnit(w, h, !!el.closest('.enemy-side'));
          if (fresh && el.classList.contains('is-summoned')) b.drop = 1;
          units.set(el, b);
        }
        b.seen = true;
        b.key = el.dataset.entity ?? b.key;
        const img = el.querySelector<HTMLImageElement>('.unit-art');
        const art = img?.src ?? '';
        const loaded = art && art !== b.art ? image(art) : null;
        if (img && loaded) {
          b.art = art;
          const map = loaded.clone();
          const pos = getComputedStyle(img).objectPosition.split(' ');
          const uv = coverUv(loaded.image.width, loaded.image.height, w, h, percent(pos[0], 50), percent(pos[1], 50));
          map.repeat.set(uv.repeatX, uv.repeatY);
          map.offset.set(uv.offsetX, uv.offsetY);
          map.needsUpdate = true;
          b.face.material.map?.dispose();
          b.face.material.map = map;
          b.face.material.needsUpdate = true;
        }
        const m = b.face.material;
        const corrupt = el.classList.contains('is-corrupt');
        m.color.set(corrupt ? '#c9a2ff' : el.classList.contains('is-silenced') ? '#8a8a8a' : '#ffffff');
        m.opacity = el.classList.contains('has-ambush') ? 0.55 : 1;
        const up = el.matches(':hover') || el.classList.contains('is-selected') ? 1 : 0;
        b.lift += (up - b.lift) * 0.2;
        b.drop = Math.max(0, b.drop - dt * 2.2);
        const rise = b.lift * 0.16 + b.drop * b.drop * 1.4 + arcHeight(lungeProgress(el));
        const z = MAT.top + 0.01 + rise;
        // The DOM on the card (stats, icons, the ready glow) rises with it: moved up the mat by as much as
        // the lift shows; its rect already includes last frame's move, so take that back out first.
        p.x -= b.shift.dx * PX;
        p.y += b.shift.dy * PX;
        const shift = rise > 0.002 ? riseShift(p, seenAt(new THREE.Vector3(p.x, p.y, z))) : { dx: 0, dy: 0 };
        if (Math.abs(shift.dx - b.shift.dx) + Math.abs(shift.dy - b.shift.dy) > 0.05) el.style.translate = shift.dx || shift.dy ? `${shift.dx.toFixed(2)}px ${shift.dy.toFixed(2)}px` : '';
        b.shift = shift;
        b.g.position.set(p.x, p.y, z);
        b.at.set(p.x, p.y, z);
        if (b.key) lastSeen.set(b.key, { at: b.at.clone(), t });
        b.shadow.position.set(p.x + b.lift * 0.08, p.y + b.lift * 0.08, MAT.top + 0.004);
        b.shadow.scale.setScalar(1 + b.lift * 0.15);
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

      // Warden plinths: a bevelled hexagon a little larger than the portrait.
      plane.querySelectorAll<HTMLElement>('[data-entity^="h:"]').forEach((el) => {
        const key = el.dataset.entity!;
        const p = centre(el, toMat);
        if (!p) return;
        const w = el.offsetWidth * PX * 1.1;
        const h = el.offsetHeight * PX * 1.1;
        let m = heroes.get(key);
        if (!m || Math.abs(m.userData.w - w) > 1e-3) {
          if (m) {
            scene.remove(m);
            m.geometry.dispose();
          }
          m = new THREE.Mesh(new THREE.ExtrudeGeometry(hexShape(w, h), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), [backMat, gold]);
          m.userData.w = w;
          m.castShadow = true;
          scene.add(m);
          heroes.set(key, m);
        }
        m.position.set(p.x, p.y, MAT.top);
        // The Final Blow shatters the Warden's portrait: its plinth goes with it.
        m.visible = !el.classList.contains('is-shattering');
      });

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
        // A card drawn: its back flies off the pile towards the owner's hand.
        const before = deckCounts.get(key);
        deckCounts.set(key, count);
        if (before !== undefined && count < before && n > 0) {
          const handEl = document.querySelector(key === '0' ? '.match .self-screen .hand' : '.table3d-plane .enemy-hand');
          const r = handEl?.getBoundingClientRect();
          const to = r && toMat(r.left + r.width / 2, r.top + r.height / 2);
          if (to) effects.flyCard(pile.face, w, new THREE.Vector3(p.x, p.y, MAT.top + 0.06 + n * 0.045), to.setZ(MAT.top + (key === '0' ? 1.5 : 0.3)));
        }
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
        const side = el.closest('.self-side') ? 0 : 1;
        const [tint, deep] = energyColors(game?.players[side]?.hero.faction);
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
        c.g.scale.setScalar(Math.max(0.4, ((el.offsetWidth + 4) * PX) / 0.42));
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
      heroes.forEach((m) => m.geometry.dispose());
      crystals.forEach(dropCrystal);
      owned.forEach((o) => o.dispose());
    },
  };
}
