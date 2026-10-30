import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DECOR, SLOTS, SLOT_KIND, SLOT_NAME, type RoomLayout, type SlotId } from '@/data/lounge';
import { buildTableScene, type RoomOwner, type TableScene } from '@/ui/match/table3d/TableScene3D';
import { audio } from '@/audio/audioService';
import { ROOM } from './decor/kit';
import { SLOT_ANCHOR, SLOT_PLACE } from './decor/roomDecor';
import { createLookControls } from './lookControls';
import { t } from '@/i18n';
import { usingTouch } from '@/ui/inputMode';

interface Props {
  boardUrl: string;
  /** The room as shown (the saved one, or with a piece being tried on). */
  room: RoomLayout;
  portraitUrl?: string;
  /** The owner's faction and what the room shows of them (trophies, the framed card…). */
  owner?: RoomOwner;
  selected: SlotId | null;
  onPick: (slot: SlotId) => void;
  onUnavailable: () => void;
}

/** Where the camera may go: inside the walls, above the floor, below the ceiling. */
const BOUNDS = { x: ROOM.x - 3, y: ROOM.y - 3, zMin: ROOM.floor + 2, zMax: ROOM.floor + ROOM.wallH - 3 };
const HOME = { pos: new THREE.Vector3(0, -26, 19), target: new THREE.Vector3(0, 8, -1) };

/**
 * The Lounge in 3D: the same room and table as in matches, a free camera to walk and look around
 * (lookControls.ts) and a numbered marker on every slot.
 */
export default function LoungeView({ boardUrl, room, portraitUrl, owner, selected, onPick, onUnavailable }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Partial<Record<SlotId, HTMLButtonElement | null>>>({});
  const tableRef = useRef<TableScene | null>(null);
  const shownRef = useRef<RoomLayout>(room);
  const focusRef = useRef<SlotId | null>(null);
  const failRef = useRef(onUnavailable);
  failRef.current = onUnavailable;
  const initial = useRef({ room, portraitUrl, owner });

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = document.createElement('canvas');
    canvas.className = 'lounge-canvas';
    root.prepend(canvas);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      canvas.remove();
      failRef.current();
      return;
    }
    const lost = (e: Event) => {
      e.preventDefault();
      failRef.current();
    };
    canvas.addEventListener('webglcontextlost', lost);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const table = buildTableScene(boardUrl, '#ffb05a', initial.current.room, initial.current.portraitUrl, initial.current.owner);
    tableRef.current = table;
    shownRef.current = initial.current.room;
    // The room is seen from further away than in a match: let the fog in later.
    table.scene.fog = new THREE.Fog('#0c0910', 70, 170);
    // A soft fill, so the corners of the room can be seen while furnishing it.
    table.scene.add(new THREE.HemisphereLight(0xfff2dd, 0x3a3048, 0.9));

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    camera.up.set(0, 0, 1);
    const controls = createLookControls(canvas, camera, BOUNDS);
    controls.view(HOME.pos, HOME.target);

    const resize = () => {
      const w = root.clientWidth || 1;
      const h = root.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // A picked slot: the camera walks to a spot in the room and looks at the piece, a little from above.
    const focus = (slot: SlotId | null) => {
      if (!slot) return;
      const a = SLOT_ANCHOR[slot];
      if (slot === 'roof') return controls.view(new THREE.Vector3(0, -24, 2), new THREE.Vector3(0, 4, 24), true);
      if (slot === 'ceiling') return controls.view(new THREE.Vector3(0, -22, 4), new THREE.Vector3(0, 0, 16), true);
      // Pieces in the middle of the room (the table and what is on it, the rug, the floor) and what fills its air: the overview.
      if (slot === 'ambience' || Math.hypot(a.x, a.y) < 16) return controls.view(HOME.pos, HOME.target, true);
      const at = new THREE.Vector3(a.x, a.y, slot.startsWith('furn') ? ROOM.floor + 10 : a.z - 1);
      const from = at.clone().addScaledVector(new THREE.Vector3(-a.x, -8 - a.y, 0).normalize(), slot.startsWith('furn') ? 22 : 24);
      from.z = at.z + 6;
      controls.view(from, at, true);
    };
    focusRef.current = null;

    // Pieces that answer a click (a pet, darts, a jukebox): a click is a press and release without moving.
    const ray = new THREE.Raycaster();
    const aim = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      return ray.intersectObjects(table.decor.clickable(), true).find((h) => h.object.visible) ?? null;
    };
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY, t: performance.now() });
    const onUp = (e: PointerEvent) => {
      const d = down;
      down = null;
      if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 500) return;
      const hit = aim(e);
      if (hit) table.decor.click(hit.object, hit.point);
    };
    const onHover = (e: PointerEvent) => {
      if (e.buttons || e.pointerType !== 'mouse') return;
      canvas.style.cursor = aim(e) ? 'pointer' : '';
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointermove', onHover);

    // Music a piece plays (a jukebox): follows the piece's track; stops when it goes.
    let playing: { url: string; stop: () => void } | null = null;
    const music = () => {
      const want = table.decor.track();
      if (want === (playing?.url ?? null)) return;
      if (want && !audio.ready) return;
      playing?.stop();
      playing = want ? { url: want, stop: audio.playTrack(want, 0, { fadeIn: 1 }) } : null;
    };

    const v = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.elapsedTime;
      controls.update(dt);
      table.update(time, dt);
      table.decor.cull(camera.position);
      music();
      renderer.render(table.scene, camera);
      const w = root.clientWidth;
      const h = root.clientHeight;
      for (const slot of SLOTS) {
        const el = markerRefs.current[slot];
        if (!el) continue;
        v.copy(SLOT_ANCHOR[slot]).project(camera);
        const visible = v.z < 1 && v.z > -1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
        el.style.visibility = visible ? 'visible' : 'hidden';
        if (visible) el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
      }
    };
    frame();

    const onFocus = (e: Event) => focus((e as CustomEvent<SlotId>).detail);
    root.addEventListener('lounge-focus', onFocus);
    const onHome = () => controls.view(HOME.pos, HOME.target, true);
    root.addEventListener('lounge-home', onHome);

    if (import.meta.env.DEV) Object.assign(window, { __lounge: { scene: table.scene, camera, controls, decor: table.decor, DECOR, SLOT_KIND, SLOT_PLACE, THREE, renderer } });

    return () => {
      cancelAnimationFrame(raf);
      playing?.stop();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onHover);
      ro.disconnect();
      root.removeEventListener('lounge-focus', onFocus);
      root.removeEventListener('lounge-home', onHome);
      controls.dispose();
      table.dispose();
      tableRef.current = null;
      // Releasing the context on purpose is not a failure.
      canvas.removeEventListener('webglcontextlost', lost);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      if (import.meta.env.DEV) delete (window as { __lounge?: unknown }).__lounge;
    };
  }, [boardUrl]);

  // The owner changed (another framed card, another faction): the pieces are built again.
  const ownerKey = JSON.stringify(owner ?? null);
  const shownOwner = useRef(ownerKey);
  useEffect(() => {
    const table = tableRef.current;
    if (!table || shownOwner.current === ownerKey) return;
    shownOwner.current = ownerKey;
    table.decor.setOwner({ faction: owner?.faction, info: owner?.info });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerKey]);

  // Pieces changed (placed, bought, tried on): rebuild just those slots.
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    for (const slot of SLOTS) if (shownRef.current[slot] !== room[slot]) table.decor.set(slot, room[slot]);
    shownRef.current = room;
  }, [room]);

  // A picked slot: the camera turns to it.
  useEffect(() => {
    if (!selected || focusRef.current === selected) return;
    focusRef.current = selected;
    rootRef.current?.dispatchEvent(new CustomEvent('lounge-focus', { detail: selected }));
  }, [selected]);

  return (
    <div className="lounge-view" ref={rootRef}>
      <div className="lounge-markers">
        {SLOTS.map((slot, i) => (
          <button
            key={slot}
            ref={(el) => {
              markerRefs.current[slot] = el;
            }}
            className={`lounge-marker ${selected === slot ? 'is-selected' : ''}`}
            onClick={() => onPick(slot)}
            aria-pressed={selected === slot}
          >
            <b>{i + 1}</b>
            <span>{t(SLOT_NAME[slot])}</span>
          </button>
        ))}
      </div>
      <div className="lounge-hud">
        <button className="btn btn-ghost btn-sm" onClick={() => rootRef.current?.dispatchEvent(new Event('lounge-home'))}>
          {t('Reset view')}
        </button>
        <span className="lounge-help">{usingTouch() ? t('One finger: move · two fingers: look around · pinch: step closer') : t('Drag: move · right button or Shift: look around · wheel: step closer · WASD / arrows: walk')}</span>
      </div>
    </div>
  );
}
