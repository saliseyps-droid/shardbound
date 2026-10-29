import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SLOTS, SLOT_NAME, type RoomLayout, type SlotId } from '@/data/lounge';
import { buildTableScene, type TableScene } from '@/ui/match/table3d/TableScene3D';
import { ROOM } from './decor/kit';
import { SLOT_ANCHOR } from './decor/roomDecor';
import { t } from '@/i18n';

interface Props {
  boardUrl: string;
  /** The room as shown (the saved one, or with a piece being tried on). */
  room: RoomLayout;
  portraitUrl?: string;
  selected: SlotId | null;
  onPick: (slot: SlotId) => void;
  onUnavailable: () => void;
}

/** Where the camera may go: inside the walls, above the floor, below the ceiling. */
const BOUNDS = { x: ROOM.x - 3, y: ROOM.y - 3, zMin: ROOM.floor + 2, zMax: ROOM.floor + ROOM.wallH - 3 };
const HOME = { pos: new THREE.Vector3(0, -26, 19), target: new THREE.Vector3(0, 8, -1) };

/**
 * The Lounge in 3D: the same room and table as in matches, a free camera (drag to move, right
 * button or Shift to turn, wheel or pinch to zoom, as at the 3D table) and a numbered marker on every slot.
 */
export default function LoungeView({ boardUrl, room, portraitUrl, selected, onPick, onUnavailable }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Partial<Record<SlotId, HTMLButtonElement | null>>>({});
  const tableRef = useRef<TableScene | null>(null);
  const shownRef = useRef<RoomLayout>(room);
  const focusRef = useRef<SlotId | null>(null);
  const failRef = useRef(onUnavailable);
  failRef.current = onUnavailable;
  const initial = useRef({ room, portraitUrl });

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

    const table = buildTableScene(boardUrl, '#ffb05a', initial.current.room, initial.current.portraitUrl);
    tableRef.current = table;
    shownRef.current = initial.current.room;
    // The room is seen from further away than in a match: let the fog in later.
    table.scene.fog = new THREE.Fog('#0c0910', 70, 170);
    // A soft fill, so the corners of the room can be seen while furnishing it.
    table.scene.add(new THREE.HemisphereLight(0xfff2dd, 0x3a3048, 0.9));

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
    camera.up.set(0, 0, 1);
    camera.position.copy(HOME.pos);
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(HOME.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 6;
    controls.maxDistance = 48;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.screenSpacePanning = false;
    // As at the 3D table: drag to move around the room, the right button (or Shift + drag) to turn the
    // view; on touch one finger moves, two zoom and turn.
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.update();

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

    // Easing the camera to a picked slot: it looks at the piece from the room, a little above it.
    const goal = new THREE.Vector3();
    const camGoal = new THREE.Vector3();
    let easing = 0;
    const focus = (slot: SlotId | null) => {
      if (!slot) return;
      const a = SLOT_ANCHOR[slot];
      // Pieces in the middle of the room (table, rug, floor, ceiling): the overview.
      if (Math.hypot(a.x, a.y) < 16 && slot !== 'ceiling') {
        goal.copy(HOME.target);
        camGoal.copy(HOME.pos);
      } else if (slot === 'ceiling') {
        goal.set(0, 0, 14);
        camGoal.set(0, -24, 6);
      } else {
        goal.set(a.x, a.y, slot.startsWith('furn') ? ROOM.floor + 6 : a.z - 1);
        const dir = new THREE.Vector3(-a.x, -8 - a.y, 0).normalize();
        camGoal.copy(goal).addScaledVector(dir, slot.startsWith('furn') ? 20 : 24);
        camGoal.z = goal.z + 6;
      }
      easing = 1;
    };
    focusRef.current = null;
    // The player takes the camera: stop easing it.
    controls.addEventListener('start', () => (easing = 0));

    const clamp = () => {
      const p = camera.position;
      p.set(THREE.MathUtils.clamp(p.x, -BOUNDS.x, BOUNDS.x), THREE.MathUtils.clamp(p.y, -BOUNDS.y, BOUNDS.y), THREE.MathUtils.clamp(p.z, BOUNDS.zMin, BOUNDS.zMax));
      const g = controls.target;
      g.set(THREE.MathUtils.clamp(g.x, -BOUNDS.x, BOUNDS.x), THREE.MathUtils.clamp(g.y, -BOUNDS.y, BOUNDS.y), THREE.MathUtils.clamp(g.z, ROOM.floor, BOUNDS.zMax));
    };

    const v = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.elapsedTime;
      if (easing > 0) {
        const k = Math.min(1, dt * 3.5);
        controls.target.lerp(goal, k);
        camera.position.lerp(camGoal, k);
        if (controls.target.distanceTo(goal) < 0.05 && camera.position.distanceTo(camGoal) < 0.05) easing = 0;
      }
      controls.update();
      clamp();
      table.update(time, dt);
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
    const onHome = () => {
      camera.position.copy(HOME.pos);
      controls.target.copy(HOME.target);
      easing = 0;
    };
    root.addEventListener('lounge-home', onHome);

    if (import.meta.env.DEV) Object.assign(window, { __lounge: { scene: table.scene, camera, controls, decor: table.decor } });

    return () => {
      cancelAnimationFrame(raf);
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
      <button className="btn btn-ghost lounge-home" onClick={() => rootRef.current?.dispatchEvent(new Event('lounge-home'))}>
        {t('Reset view')}
      </button>
    </div>
  );
}
