import * as THREE from 'three';
import { MAT } from './tableCamera';
import { cssMove, planeToMat } from './bodyRules';

/**
 * A diagnostic for the 3D table on devices we cannot run here (iPhone Safari), on with `?debug3d` in
 * the address: a grid of magenta DOM dots on the plane with a green WebGL ring at the same mat point
 * each (they coincide when the browser draws the plane where WebGL thinks it lies), and a panel with
 * where the browser measures a few pieces against where the plane's layout puts them.
 */
export const debug3dOn = () => typeof location !== 'undefined' && /[?&]debug3d\b/.test(location.search);

export function createDebug3d(scene: THREE.Scene, plane: HTMLElement) {
  const dots: HTMLElement[] = [];
  const group = new THREE.Group();
  const ringGeo = new THREE.RingGeometry(0.09, 0.14, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#30ff60', depthTest: false, transparent: true });
  for (const fx of [0.05, 0.25, 0.5, 0.75, 0.95])
    for (const fy of [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95]) {
      const x = fx * plane.offsetWidth;
      const y = fy * plane.offsetHeight;
      const d = document.createElement('div');
      d.className = 'debug3d-dot';
      d.style.cssText = `position:absolute;left:${x - 6}px;top:${y - 6}px;width:12px;height:12px;border-radius:50%;background:#ff20d0;z-index:999;pointer-events:none`;
      plane.appendChild(d);
      dots.push(d);
      const p = planeToMat(x, y, plane.offsetWidth, plane.offsetHeight);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(p.x, p.y, MAT.top + 0.003);
      ring.renderOrder = 999;
      group.add(ring);
    }
  scene.add(group);

  const panel = document.createElement('pre');
  panel.style.cssText = 'position:fixed;left:50%;bottom:2px;transform:translateX(-50%);z-index:9999;margin:0;padding:4px 6px;font:10px/1.25 monospace;color:#fff;background:rgba(0,0,0,.8);pointer-events:none;white-space:pre';
  document.body.appendChild(panel);

  const laid = (el: HTMLElement) => {
    let x = el.offsetWidth / 2;
    let y = el.offsetHeight / 2;
    for (let a: HTMLElement | null = el; a && a !== plane; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const m = cssMove(cs.transform, cs.translate);
      x += m.x;
      y += m.y;
    }
    for (let o: HTMLElement | null = el; o && o !== plane; o = o.offsetParent as HTMLElement | null) {
      x += o.offsetLeft + (o.offsetParent?.clientLeft ?? 0);
      y += o.offsetTop + (o.offsetParent?.clientTop ?? 0);
    }
    return { x, y };
  };
  const f = (n: number) => n.toFixed(1);
  let next = 0;
  return {
    update(t: number, toScreen: (v: THREE.Vector3) => { x: number; y: number }) {
      if (t < next) return;
      next = t + 0.5;
      const lines: string[] = [];
      const vv = window.visualViewport;
      lines.push(`win ${innerWidth}x${innerHeight} dpr ${devicePixelRatio} vv ${vv ? `${f(vv.width)}x${f(vv.height)} @${f(vv.offsetLeft)},${f(vv.offsetTop)} s${vv.scale.toFixed(2)}` : '-'} scroll ${f(scrollX)},${f(scrollY)}`);
      const pick: [string, string][] = [
        ['me', '.self-side [data-entity^="h:"]'],
        ['meSlot', '.self-side .framed-slot'],
        ['mePow', '.self-side .hero-power'],
        ['meCry', '.self-side .energy .crystal'],
        ['meNum', '.self-side .energy-count'],
        ['foe', '.enemy-side [data-entity^="h:"]'],
        ['unit', '.unit'],
        ['dot', '.debug3d-dot'],
      ];
      for (const [name, sel] of pick) {
        const el = plane.querySelector<HTMLElement>(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const l = laid(el);
        const p = planeToMat(l.x, l.y, plane.offsetWidth, plane.offsetHeight);
        const s = toScreen(new THREE.Vector3(p.x, p.y, MAT.top));
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        lines.push(`${name.padEnd(6)} rect ${f(cx)},${f(cy)} ${f(r.width)}x${f(r.height)}  gl ${f(s.x)},${f(s.y)}  d ${f(cx - s.x)},${f(cy - s.y)}  lay ${f(l.x)},${f(l.y)} ${el.offsetWidth}x${el.offsetHeight}`);
      }
      panel.textContent = lines.join('\n');
    },
    dispose() {
      dots.forEach((d) => d.remove());
      panel.remove();
      scene.remove(group);
      ringGeo.dispose();
      ringMat.dispose();
    },
  };
}
