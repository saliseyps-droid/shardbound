import * as THREE from 'three';
import { handFace, makeGem, numberTexture, rectGlowTexture, type HandCardData } from './cardFaces';

/**
 * Your hand on the 3D table, as in the mockup: real cards (a gold-edged slab, the full card face,
 * raised cost / Attack / Health gems) held in front of the camera and leaning back towards the
 * table; the one you point at stands up. They follow the hand's DOM cards (still there, invisible,
 * for pointing, dragging and playing), so the hand behaves exactly as before.
 */
export interface HandCards {
  update(camera: THREE.PerspectiveCamera, rootRect: DOMRect, dt: number, t: number): void;
  dispose(): void;
}

const CT = 0.035; // card thickness (world units, at the hand's distance)
const DIST = 6; // how far in front of the camera the hand is held
const LEAN = 0.5; // lean back towards the table (rad)

type Gem = ReturnType<typeof makeGem>;
interface Card {
  g: THREE.Group;
  pivot: THREE.Group;
  face: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  cost: Gem;
  atk: Gem;
  hp: Gem;
  ring: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  key: string;
  lean: number;
  seen: boolean;
}

const percent = (v: string | undefined, fallback: number) => {
  const n = parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
};

function roundedRect(w: number, h: number, r: number) {
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

/** What the DOM card shows, for drawing its face. */
function readCard(card: HTMLElement): HandCardData & { art: string; key: string } {
  const img = card.querySelector<HTMLImageElement>('.card-art');
  const pos = img ? getComputedStyle(img).objectPosition.split(' ') : [];
  const rules: { text: string; kw: boolean }[] = [];
  card.querySelector('.card-rules')?.childNodes.forEach((n) => {
    const text = n.textContent ?? '';
    if (text.trim()) rules.push({ text, kw: n instanceof HTMLElement && n.classList.contains('kw') });
  });
  const typeline = card.querySelectorAll('.card-typeline > span');
  const gem = card.querySelector('.rarity-gem');
  const data = {
    art: img?.currentSrc || img?.src || '',
    name: card.querySelector('.card-name')?.textContent?.trim() ?? '',
    type: typeline[0]?.textContent?.trim() ?? '',
    tag: card.querySelector('.card-tags')?.textContent?.trim() ?? '',
    rarity: gem ? getComputedStyle(gem).backgroundColor || '#ffa931' : '#ffa931',
    rules,
    fx: percent(pos[0], 50),
    fy: percent(pos[1], 40),
  };
  return { ...data, key: JSON.stringify(data) };
}

export function createHandCards(scene: THREE.Scene): HandCards {
  const cards = new Map<HTMLElement, Card>();
  const loader = new THREE.TextureLoader();
  const images = new Map<string, HTMLImageElement | null>();
  const image = (url: string) => {
    if (!url) return null;
    if (!images.has(url)) {
      images.set(url, null);
      loader.load(url, (t) => images.set(url, t.image as HTMLImageElement));
    }
    return images.get(url) ?? null;
  };
  const edge = new THREE.MeshStandardMaterial({ color: 0xc9952f, metalness: 0.9, roughness: 0.3 });
  const back = new THREE.MeshStandardMaterial({ color: 0x1a1430, roughness: 0.6 });
  const ringTex = rectGlowTexture();
  // A card one world unit wide; scaled to the DOM card's size each frame.
  const W = 1;
  const H = 1.4;
  const slabGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, 0.07), { depth: CT, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.018, bevelSegments: 3 });
  const faceGeo = new THREE.PlaneGeometry(W - 0.015, H - 0.015);
  const ringGeo = new THREE.PlaneGeometry(W * 1.62, H * 1.45);

  const make = (): Card => {
    const g = new THREE.Group();
    const pivot = new THREE.Group();
    const slab = new THREE.Mesh(slabGeo, [back, edge]);
    // The card hangs from its bottom edge in the pivot, so leaning tips its top away.
    slab.position.y = H / 2;
    const face = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ roughness: 0.55, color: 0x2a2244, transparent: true }));
    face.position.set(0, H / 2, CT + 0.017);
    const k = W / 1.45;
    const cost = makeGem('cost', k);
    const atk = makeGem('atk', k);
    const hp = makeGem('hp', k);
    cost.gem.position.set(-W / 2 + 0.05 * k, H - 0.05 * k, CT + 0.09 * k);
    atk.gem.position.set(-W / 2 + 0.05 * k, 0.02 * k, CT + 0.09 * k);
    hp.gem.position.set(W / 2 - 0.05 * k, 0.02 * k, CT + 0.09 * k);
    for (const gm of [cost, atk, hp]) {
      gm.num.position.copy(gm.gem.position).add(new THREE.Vector3(0, 0, 0.3 * k));
      pivot.add(gm.gem, gm.num);
    }
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: ringTex, color: '#1fd65a', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
    ring.position.set(0, H / 2, CT + 0.03);
    pivot.add(slab, face, ring);
    g.add(pivot);
    scene.add(g);
    return { g, pivot, face, cost, atk, hp, ring, key: '', lean: LEAN, seen: true };
  };
  const drop = (c: Card) => {
    scene.remove(c.g);
    c.face.material.map?.dispose();
    c.face.material.dispose();
    c.ring.material.dispose();
    for (const gm of [c.cost, c.atk, c.hp]) {
      gm.gem.geometry.dispose();
      (gm.gem.material as THREE.Material).dispose();
      gm.num.material.dispose();
    }
  };
  const setNum = (gm: Gem, el: Element | null, color = '#ffffff') => {
    const v = el?.textContent?.trim() ?? '';
    gm.gem.visible = gm.num.visible = v !== '';
    if (v !== gm.value || color !== gm.color) {
      gm.value = v;
      gm.color = color;
      gm.num.material.map = numberTexture(v || '0', color);
      gm.num.material.needsUpdate = true;
    }
  };

  const ray = new THREE.Raycaster();
  const fwd = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  const q = new THREE.Quaternion();
  const tmp = new THREE.Quaternion();

  return {
    update(camera, root, dt, t) {
      for (const c of cards.values()) c.seen = false;
      // World units per screen px at the hand's distance (the camera renders a taller image when it
      // keeps the hand's strip free, see placeCamera).
      const full = camera.view?.enabled ? camera.view.fullHeight : root.height;
      const perPx = (2 * DIST * Math.tan((camera.fov * Math.PI) / 360)) / full;
      camera.getWorldDirection(fwd);
      const hand = [...document.querySelectorAll<HTMLElement>('.match.is-3d .self-screen .hand-card')];
      hand.forEach((el, i) => {
        const cardEl = el.querySelector<HTMLElement>(':scope > .card');
        if (!cardEl) return;
        let c = cards.get(el);
        if (!c) {
          c = make();
          cards.set(el, c);
        }
        c.seen = true;
        const data = readCard(cardEl);
        const img = image(data.art);
        const key = `${data.key}|${img ? 1 : 0}`;
        if (key !== c.key) {
          c.key = key;
          c.face.material.map?.dispose();
          c.face.material.map = handFace(img, data);
          c.face.material.color.set(0xffffff);
          c.face.material.needsUpdate = true;
        }
        const costEl = cardEl.querySelector('.card-cost');
        setNum(c.cost, costEl, costEl?.classList.contains('cheaper') ? '#7ef29a' : costEl?.classList.contains('pricier') ? '#ffb4a8' : '#ffffff');
        setNum(c.atk, cardEl.querySelector('.stat-attack'));
        setNum(c.hp, cardEl.querySelector('.stat-health'));
        // Where the DOM card is: its transform's scale and turn, its box's centre.
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform);
        const scale = Math.hypot(m.a, m.b);
        const angle = Math.atan2(m.b, m.a);
        const r = el.getBoundingClientRect();
        const wPx = el.offsetWidth * scale;
        const hPx = el.offsetHeight * scale;
        // The bottom-centre of the card on screen (it leans back from there).
        const bx = r.left + r.width / 2 - (Math.sin(angle) * hPx) / 2;
        const by = r.top + r.height / 2 + (Math.cos(angle) * hPx) / 2;
        ray.setFromCamera(ndc.set(((bx - root.left) / root.width) * 2 - 1, -((by - root.top) / root.height) * 2 + 1), camera);
        // Later cards (and the one pointed at) a little nearer, so they cover the ones before.
        const up = el.matches(':hover') || el.classList.contains('is-selected');
        const d = DIST - i * 0.02 - (up ? 0.3 : 0);
        const along = d / ray.ray.direction.dot(fwd);
        c.g.position.copy(ray.ray.origin).addScaledVector(ray.ray.direction, along);
        const k = (d / DIST) * perPx;
        c.g.scale.set(wPx * k, hPx * k / 1.4, (wPx * k + hPx * k / 1.4) / 2);
        // Facing the camera, turned like the fan, leaning back unless pointed at.
        c.lean += ((up ? 0 : LEAN) - c.lean) * Math.min(1, dt * 12);
        q.copy(camera.quaternion).multiply(tmp.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle));
        c.g.quaternion.copy(q);
        c.pivot.rotation.x = -c.lean;
        const dragging = el.classList.contains('is-dragging');
        c.face.material.opacity = dragging ? 0.25 : 1;
        c.pivot.visible = el.style.visibility !== 'hidden';
        const playable = cardEl.classList.contains('is-playable');
        c.ring.material.color.set(el.classList.contains('is-selected') ? '#5fe1ff' : '#1fd65a');
        c.ring.material.opacity = playable && !dragging ? 0.55 + Math.sin(t * 3 + i) * 0.25 : el.classList.contains('is-selected') ? 0.9 : 0;
      });
      for (const [el, c] of cards)
        if (!c.seen) {
          drop(c);
          cards.delete(el);
        }
    },
    dispose() {
      cards.forEach(drop);
      slabGeo.dispose();
      faceGeo.dispose();
      ringGeo.dispose();
      edge.dispose();
      back.dispose();
      ringTex.dispose();
    },
  };
}
