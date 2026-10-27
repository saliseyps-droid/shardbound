import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { buildTableScene } from './TableScene3D';
import { createBodies } from './bodies';
import { createEffects } from './effects';
import { MAT, PLANE, cameraCss, placeCamera, planeCss, type CameraState } from './tableCamera';
import '@/ui/styles/table3d.css';

interface Props {
  boardUrl: string;
  warm?: string;
  /** The on-table part of the match (hero areas, battlefield rows, draw piles), laid onto the mat. */
  children: ReactNode;
  onUnavailable: () => void;
}

export const TILT = 0.62;
/** The hand's strip at the bottom of the screen, kept free of the table. */
const BOTTOM = 0.2;
const ZOOM_MAX = 3;

/**
 * The 3D table: the WebGL room behind, and `children` (plain match DOM) laid onto the mat with the
 * same camera, so drag, drop and clicks keep working on the tilted board. Wheel or pinch zooms
 * towards the pointer, the middle button pans, a double click on the table resets the view.
 */
export default function TableView({ boardUrl, warm = '#ffb05a', children, onUnavailable }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const failRef = useRef(onUnavailable);
  failRef.current = onUnavailable;

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    let fxRenderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      fxRenderer = new THREE.WebGLRenderer({ canvas: fxCanvasRef.current!, antialias: true, alpha: true });
    } catch {
      failRef.current();
      return;
    }
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
    const effects = createEffects(table.scene);
    const bodies = createBodies(table.scene, effects);
    // Dev server only: lets a browser check fire effects on demand.
    if (import.meta.env.DEV) Object.assign(window, { __table3d: { useMatch, useSettings } });
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
    const matPoint = (cx: number, cy: number) => {
      const r = root.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
      const hit = new THREE.Vector3();
      return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -MAT.top), hit) ? hit : null;
    };
    const clampPan = () => {
      const fx = (MAT.w / 2) * (1 - 1 / target.zoom);
      const fy = (MAT.h / 2) * (1 - 1 / target.zoom);
      target.panX = Math.max(-fx, Math.min(fx, target.panX));
      target.panY = Math.max(-fy, Math.min(fy, target.panY));
    };
    const match = root.parentElement!;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.match-sidebar, .modal-backdrop, .battle-log')) return;
      e.preventDefault();
      const p = matPoint(e.clientX, e.clientY);
      const nz = Math.max(1, Math.min(ZOOM_MAX, target.zoom * Math.exp(-e.deltaY * 0.0015)));
      if (p) {
        // Keep the point under the pointer where it is.
        const k = 1 - target.zoom / nz;
        target.panX += (p.x - target.panX) * k;
        target.panY += (p.y - target.panY) * k;
      }
      target.zoom = nz;
      clampPan();
    };
    let pan: { x: number; y: number; px: number; py: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      pan = { x: e.clientX, y: e.clientY, px: target.panX, py: target.panY };
    };
    const onMove = (e: PointerEvent) => {
      const p = matPoint(e.clientX, e.clientY);
      table.setPointer(p && Math.abs(p.x) <= MAT.w / 2 && Math.abs(p.y) <= MAT.h / 2 ? { x: p.x, y: p.y } : null);
      if (!pan) return;
      const per = (2 * camera.position.distanceTo(new THREE.Vector3(target.panX, target.panY, 0)) * Math.tan((camera.fov * Math.PI) / 360)) / view.height;
      target.panX = pan.px - (e.clientX - pan.x) * per;
      target.panY = pan.py + ((e.clientY - pan.y) * per) / Math.cos(TILT);
      clampPan();
    };
    const onUp = () => (pan = null);
    const onDbl = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('[data-entity], [data-hand-uid], button, .match-sidebar')) return;
      target.zoom = 1;
      target.panX = target.panY = 0;
    };
    match.addEventListener('wheel', onWheel, { passive: false });
    match.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    match.addEventListener('dblclick', onDbl);

    const clock = new THREE.Clock();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, clock.getDelta());
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
      const m = useMatch.getState();
      bodies.update(planeRef.current!, matPoint, m.game, clock.elapsedTime);
      effects.update(planeRef.current!, matPoint, m.fx, dt);
      table.update(clock.elapsedTime, dt);
      renderer.render(table.scene, camera);
      fxRenderer.render(effects.scene, camera);
    };
    frame = requestAnimationFrame(tick);
    root.style.setProperty('--tilt', String(TILT));

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      match.removeEventListener('wheel', onWheel);
      match.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      match.removeEventListener('dblclick', onDbl);
      bodies.dispose();
      effects.dispose();
      table.dispose();
      renderer.dispose();
      fxRenderer.dispose();
    };
  }, [boardUrl, warm]);

  return (
    <div className="table3d" ref={rootRef}>
      <canvas className="table3d-canvas" ref={canvasRef} aria-hidden />
      <div className="table3d-view" ref={viewRef}>
        <div className="table3d-cam" ref={camRef}>
          <div className="table3d-plane" ref={planeRef} style={{ width: PLANE.w, height: PLANE.h }}>
            {children}
          </div>
        </div>
      </div>
      <canvas className="table3d-canvas table3d-fx" ref={fxCanvasRef} aria-hidden />
    </div>
  );
}
