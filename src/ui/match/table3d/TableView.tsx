import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { BOARD_FX } from '../boardFx';
import { BOARD_GLOWS, BOARD_SEA, BOARD_SMOKE } from '../AnimatedBoard';
import { buildTableScene } from './TableScene3D';
import { createBoardLife } from './boardLife';
import { createFpsWatch } from './fpsWatch';
import { createBodies } from './bodies';
import { createEffects } from './effects';
import { pinchZoom, zoomsTable } from './tableInput';
import { MAT, PLANE, TILT, cameraCss, placeCamera, planeCss, type CameraState } from './tableCamera';
import '@/ui/styles/table3d.css';

interface Props {
  boardUrl: string;
  /** The mat's key (boardFx.ts), for its particles and lights in 3D. */
  board?: string;
  warm?: string;
  /** The on-table part of the match (hero areas, battlefield rows, draw piles), laid onto the mat. */
  children: ReactNode;
  onUnavailable: () => void;
  /** The table stays slow even at lower quality (fpsWatch.ts): offer the 2D board. */
  onSlow?: () => void;
}

/** The hand's strip at the bottom of the screen, kept free of the table. */
const BOTTOM = 0.2;
const ZOOM_MAX = 3;

/**
 * The 3D table: the WebGL room behind, and `children` (plain match DOM) laid onto the mat with the
 * same camera, so drag, drop and clicks keep working on the tilted board. Wheel or pinch zooms
 * towards the pointer, the middle button (or a drag with Space held) pans, a double click on the
 * table resets the view.
 */
export default function TableView({ boardUrl, board, warm = '#ffb05a', children, onUnavailable, onSlow }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const failRef = useRef(onUnavailable);
  failRef.current = onUnavailable;
  const slowRef = useRef(onSlow);
  slowRef.current = onSlow;

  useEffect(() => {
    const root = rootRef.current!;
    // Fresh canvases for every run: a canvas whose context was released (below) can't get a new one,
    // and StrictMode runs this effect twice on the same elements.
    const canvas = document.createElement('canvas');
    const fxCanvas = document.createElement('canvas');
    canvas.className = 'table3d-canvas';
    fxCanvas.className = 'table3d-canvas table3d-fx';
    canvas.setAttribute('aria-hidden', 'true');
    fxCanvas.setAttribute('aria-hidden', 'true');
    root.insertBefore(canvas, viewRef.current);
    root.appendChild(fxCanvas);
    let renderer: THREE.WebGLRenderer | undefined;
    let fxRenderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      fxRenderer = new THREE.WebGLRenderer({ canvas: fxCanvas, antialias: true, alpha: true });
    } catch {
      renderer?.dispose();
      renderer?.forceContextLoss();
      canvas.remove();
      fxCanvas.remove();
      failRef.current();
      return;
    }
    // The browser may drop a context (too many open, a GPU reset): fall back to the 2D board.
    const lost = (e: Event) => {
      e.preventDefault();
      failRef.current();
    };
    canvas.addEventListener('webglcontextlost', lost);
    fxCanvas.addEventListener('webglcontextlost', lost);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    fxRenderer.setPixelRatio(renderer.getPixelRatio());
    fxRenderer.outputColorSpace = THREE.SRGBColorSpace;
    fxRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    fxRenderer.toneMappingExposure = 1.45;
    fxRenderer.setClearColor(0x000000, 0);
    const table = buildTableScene(boardUrl, warm);
    const life = createBoardLife(
      table.scene,
      board ? BOARD_FX[board] : undefined,
      board ? { glow: BOARD_GLOWS[board], smoke: BOARD_SMOKE[board], sea: BOARD_SEA[board] } : {},
      useSettings.getState().performanceMode,
    );
    const effects = createEffects(table.scene);
    const bodies = createBodies(table.scene, effects);
    // Dev server only: lets a browser check fire effects on demand.
    if (import.meta.env.DEV) Object.assign(window, { __table3d: { useMatch, useSettings, scene: table.scene } });
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 600);
    planeRef.current!.style.transform = planeCss();

    let view = { width: 1, height: 1 };
    const target: CameraState = { tilt: TILT, zoom: 1, panX: 0, panY: 0, bottom: BOTTOM };
    const state: CameraState = { ...target };
    const resize = () => {
      view = { width: root.clientWidth || 1, height: root.clientHeight || 1 };
      renderer.setSize(view.width, view.height, false);
      fxRenderer.setSize(view.width, view.height, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    // The point of the mat under a screen point (camera space), for zooming towards it and the lamp.
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const matPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -MAT.top);
    // The root's rect, read once per frame (the bodies ask for dozens of points).
    let rootRect = root.getBoundingClientRect();
    const matPoint = (cx: number, cy: number) => {
      const r = rootRect;
      ray.setFromCamera(ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
      const hit = new THREE.Vector3();
      return ray.ray.intersectPlane(matPlane, hit) ? hit : null;
    };
    // A world point to screen px (for DOM that sits on raised objects).
    const toScreen = (v: THREE.Vector3) => {
      const r = rootRect;
      const p = v.clone().project(camera);
      return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
    };
    const clampPan = () => {
      const fx = (MAT.w / 2) * (1 - 1 / target.zoom);
      const fy = (MAT.h / 2) * (1 - 1 / target.zoom);
      target.panX = Math.max(-fx, Math.min(fx, target.panX));
      target.panY = Math.max(-fy, Math.min(fy, target.panY));
    };
    const match = root.parentElement!;
    // Zoom to `nz`, keeping the mat point under (cx, cy) where it is.
    const zoomAt = (nz: number, cx: number, cy: number) => {
      rootRect = root.getBoundingClientRect();
      const p = matPoint(cx, cy);
      nz = Math.max(1, Math.min(ZOOM_MAX, nz));
      if (p) {
        // Keep the point under the pointer where it is.
        const k = 1 - target.zoom / nz;
        target.panX += (p.x - target.panX) * k;
        target.panY += (p.y - target.panY) * k;
      }
      target.zoom = nz;
      clampPan();
    };
    const onWheel = (e: WheelEvent) => {
      // Only over the table: other panels in the match keep scrolling.
      if (!zoomsTable(e.target as Element, match)) return;
      e.preventDefault();
      zoomAt(target.zoom * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    // Panning: the middle button, or the left one with Space held (it then doesn't pick up cards).
    let space = false;
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || typing(e.target)) return;
      space = e.type === 'keydown';
      // Keep the page from scrolling, but let Space still press a focused button or unit.
      if (space && e.target === document.body) e.preventDefault();
    };
    const onBlur = () => (space = false);
    let pan: { x: number; y: number; px: number; py: number } | null = null;
    // Two fingers on the table pinch-zoom (one still drags cards).
    const touches = new Map<number, { x: number; y: number }>();
    let pinch: { dist: number; zoom: number } | null = null;
    const spread = () => {
      const [a, b] = [...touches.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && zoomsTable(e.target as Element, match)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size === 2) {
          pinch = { dist: spread(), zoom: target.zoom };
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }
      if (e.button !== 1 && !(e.button === 0 && space)) return;
      e.preventDefault();
      e.stopPropagation();
      pan = { x: e.clientX, y: e.clientY, px: target.panX, py: target.panY };
    };
    const onMove = (e: PointerEvent) => {
      if (touches.has(e.pointerId)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && touches.size === 2) {
          const [a, b] = [...touches.values()];
          zoomAt(pinchZoom(pinch.dist, spread(), pinch.zoom), (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
      }
      const p = matPoint(e.clientX, e.clientY);
      table.setPointer(p && Math.abs(p.x) <= MAT.w / 2 && Math.abs(p.y) <= MAT.h / 2 ? { x: p.x, y: p.y } : null);
      if (!pan) return;
      const per = (2 * camera.position.distanceTo(new THREE.Vector3(target.panX, target.panY, 0)) * Math.tan((camera.fov * Math.PI) / 360)) / view.height;
      target.panX = pan.px - (e.clientX - pan.x) * per;
      target.panY = pan.py + ((e.clientY - pan.y) * per) / Math.cos(TILT);
      clampPan();
    };
    const onUp = (e: PointerEvent) => {
      pan = null;
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = null;
    };
    const onDbl = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('[data-entity], [data-hand-uid], button, .match-sidebar')) return;
      target.zoom = 1;
      target.panX = target.panY = 0;
    };
    match.addEventListener('wheel', onWheel, { passive: false });
    // Capture: a pan or pinch must start before the board picks up a card or an attacker.
    match.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', onBlur);
    match.addEventListener('dblclick', onDbl);

    const clock = new THREE.Clock();
    const fps = createFpsWatch();
    let frame = 0;
    let idle = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      // Behind the results the table only needs to look alive: a few frames a second (the overlay
      // blurs it, and blurring a canvas that redraws every frame is costly).
      if (useMatch.getState().phase === 'ended') {
        idle += clock.getDelta();
        if (idle < 0.25) return;
        idle = 0;
      }
      const raw = clock.getDelta();
      const dt = Math.min(0.05, raw);
      const verdict = fps.frame(raw);
      if (verdict === 'degrade') {
        // A slow device: no shadows, one pixel per CSS pixel.
        renderer.shadowMap.enabled = false;
        renderer.setPixelRatio(1);
        fxRenderer.setPixelRatio(1);
        table.scene.traverse((o) => {
          const m = (o as THREE.Mesh).material;
          for (const x of Array.isArray(m) ? m : m ? [m] : []) x.needsUpdate = true;
        });
        resize();
      } else if (verdict === 'offer2d') slowRef.current?.();
      const k = Math.min(1, dt * 10);
      state.zoom += (target.zoom - state.zoom) * k;
      state.panX += (target.panX - state.panX) * k;
      state.panY += (target.panY - state.panY) * k;
      placeCamera(camera, view, state);
      // Heavy hits tremble the camera (the CSS plane follows, since it is computed from the same camera).
      const shake = effects.shake();
      if (shake.x || shake.y) {
        camera.position.x += shake.x;
        camera.position.y += shake.y;
        camera.updateMatrixWorld();
      }
      const css = cameraCss(camera, view);
      viewRef.current!.style.perspective = css.perspective;
      viewRef.current!.style.perspectiveOrigin = css.origin;
      // The camera transform turns about the same point the perspective looks from.
      camRef.current!.style.transformOrigin = css.origin;
      camRef.current!.style.transform = css.transform;
      // The bodies follow the plane's DOM, so they read it after this frame's camera is written.
      rootRect = root.getBoundingClientRect();
      const m = useMatch.getState();
      bodies.update(planeRef.current!, matPoint, m.game, clock.elapsedTime, toScreen);
      effects.update(planeRef.current!, matPoint, m.fx, dt, bodies.lastAt);
      table.update(clock.elapsedTime, dt);
      life.update(clock.elapsedTime, dt);
      renderer.render(table.scene, camera);
      fxRenderer.render(effects.scene, camera);
    };
    frame = requestAnimationFrame(tick);
    root.style.setProperty('--tilt', String(TILT));

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      match.removeEventListener('wheel', onWheel);
      match.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', onBlur);
      match.removeEventListener('dblclick', onDbl);
      bodies.dispose();
      life.dispose();
      effects.dispose();
      table.dispose();
      canvas.removeEventListener('webglcontextlost', lost);
      fxCanvas.removeEventListener('webglcontextlost', lost);
      // Release the GPU contexts now (each 3D mount makes two; browsers cap the live ones).
      renderer.dispose();
      fxRenderer.dispose();
      renderer.forceContextLoss();
      fxRenderer.forceContextLoss();
      canvas.remove();
      fxCanvas.remove();
      if (import.meta.env.DEV) delete (window as { __table3d?: unknown }).__table3d;
    };
  }, [boardUrl, board, warm]);

  return (
    <div className="table3d" ref={rootRef}>
      <div className="table3d-view" ref={viewRef}>
        <div className="table3d-cam" ref={camRef}>
          <div className="table3d-plane" ref={planeRef} style={{ width: PLANE.w, height: PLANE.h }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
