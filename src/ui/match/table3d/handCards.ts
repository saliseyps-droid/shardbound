import * as THREE from 'three';
import { handFace, makeGem, numberTexture, rectGlowTexture, type HandCardData } from './cardFaces';

/**
 * Your hand on the 3D table, as in the mockup: real cards (a gold-edged slab, the full card face,
 * raised cost / Attack / Health gems) fanned at the near edge of the table, leaning up towards you;
 * the one you point at stands up and comes forward. They follow the hand's DOM cards, laid on the
 * hand's own plane there (HAND, tableCamera.ts) and still the hit targets for pointing, dragging and
 * playing, so the hand behaves exactly as before and stays with the table as the view moves.
 */
export interface HandCards {
  update(plane: HTMLElement | null, toHand: (x: number, y: number) => THREE.Vector3 | null, handWorld: THREE.Matrix4, dt: number, t: number): void;
  dispose(): void;
}

const CT = 0.035; // card thickness (world units, at the hand's size)
const STAND = 0.35; // how much further up a card pointed at stands (rad)

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
  // A snug glow just round the card's edge (the table's ring texture leaves room for a wide halo).
  const ringGeo = new THREE.PlaneGeometry(W * 1.3, H * 1.24);

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
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: ringTex, color: '#3cff7a', blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }));
    ring.position.set(0, H / 2, CT + 0.03);
    pivot.add(slab, face, ring);
    g.add(pivot);
    scene.add(g);
    return { g, pivot, face, cost, atk, hp, ring, key: '', lean: 0, seen: true };
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

  const handQuat = new THREE.Quaternion();
  const handScale = new THREE.Vector3();
  const tmpPos = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const turn = new THREE.Quaternion();

  return {
    update(plane, toHand, handWorld, dt, t) {
      for (const c of cards.values()) c.seen = false;
      handWorld.decompose(tmpPos, handQuat, handScale);
      const perPx = handScale.x;
      const hand = plane ? [...plane.querySelectorAll<HTMLElement>('.hand-card')] : [];
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
        // Where the DOM card is on the hand's plane: its transform's scale and turn, its centre.
        const tr = getComputedStyle(el).transform;
        const m = new DOMMatrixReadOnly(tr === 'none' ? undefined : tr);
        const scale = Math.hypot(m.a, m.b);
        const angle = Math.atan2(m.b, m.a);
        const r = el.getBoundingClientRect();
        const centre = toHand(r.left + r.width / 2, r.top + r.height / 2);
        if (!centre) return;
        const w = el.offsetWidth * scale * perPx;
        const h = el.offsetHeight * scale * perPx;
        const up = el.matches(':hover') || el.classList.contains('is-selected');
        c.lean += ((up ? STAND : 0) - c.lean) * Math.min(1, dt * 12);
        // The card hangs from its bottom edge: start from the bottom-centre on the plane.
        const down = new THREE.Vector3(Math.sin(angle) * (h / 2), -Math.cos(angle) * (h / 2), 0).applyQuaternion(handQuat);
        // Later cards (and the one pointed at) a little in front, so they cover the ones before.
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(handQuat).multiplyScalar(i * 0.004 + (up ? 0.25 : 0));
        c.g.position.copy(centre).add(down).add(forward);
        c.g.quaternion.copy(handQuat).multiply(turn.setFromAxisAngle(zAxis, -angle));
        c.g.scale.set(w, h / 1.4, (w + h / 1.4) / 2);
        c.pivot.rotation.x = c.lean;
        const dragging = el.classList.contains('is-dragging');
        c.face.material.opacity = dragging ? 0.25 : 1;
        const playable = cardEl.classList.contains('is-playable');
        c.ring.material.color.set(el.classList.contains('is-selected') ? '#5fe1ff' : '#1fd65a');
        c.ring.material.opacity = playable && !dragging ? 0.45 + Math.sin(t * 2.5 + i) * 0.12 : el.classList.contains('is-selected') ? 0.8 : 0;
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
