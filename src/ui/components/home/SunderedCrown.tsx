import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { crownMaskSvg } from './crownConfig';

interface Props {
  crystal: string;
  band: string;
  /** 'still' draws one frame and stops (performance mode, reduced motion). */
  motion: 'live' | 'still';
}

const MASK = `url("data:image/svg+xml,${encodeURIComponent(crownMaskSvg())}")`;

function glowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** The Sundered Crown: crystal points on a broken band, a glowing core, and shards drifting off. */
function buildCrown(scene: THREE.Scene, glow: THREE.Texture) {
  const shard = new THREE.OctahedronGeometry(1, 0);
  const crystal = new THREE.MeshPhysicalMaterial({ roughness: 0.12, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92, flatShading: true, emissiveIntensity: 0.35 });
  const band = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.8, flatShading: true, emissiveIntensity: 0.25 });
  const crown = new THREE.Group();
  crown.scale.setScalar(0.95);
  scene.add(crown);

  const R = 1.55;
  for (const y of [-0.05, 0.22]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 6, 48, Math.PI * 2 - 0.55), band);
    ring.rotation.set(Math.PI / 2, 0, 0.4);
    ring.position.y = y;
    crown.add(ring);
  }
  // Tall and short points in turn; one is missing and two have broken loose from the band.
  const N = 10;
  const loose: THREE.Mesh[] = [];
  for (let i = 1; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.67;
    const h = i % 2 === 0 ? 0.95 : 0.62;
    const isLoose = i === 1 || i === N - 1;
    const r = R + (isLoose ? 0.35 : 0);
    const m = new THREE.Mesh(shard, crystal);
    m.scale.set(0.2, h, 0.2);
    m.position.set(Math.cos(a) * r, 0.3 + h * 0.75 + (isLoose ? 0.25 : 0), Math.sin(a) * r);
    m.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22);
    m.userData = { baseY: m.position.y, phase: i };
    crown.add(m);
    if (isLoose) loose.push(m);
  }
  const core = new THREE.Mesh(shard, crystal);
  core.scale.set(0.42, 1.05, 0.42);
  core.position.y = 0.55;
  crown.add(core);
  const sprite = (opacity: number) => new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  const coreGlow = sprite(0.85);
  coreGlow.scale.set(3.2, 3.2, 1);
  coreGlow.position.y = 0.55;
  crown.add(coreGlow);
  const halo = sprite(0.35);
  halo.scale.set(7, 5, 1);
  halo.position.y = 0.4;
  crown.add(halo);

  interface Flake { mesh: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshPhysicalMaterial>; glow: THREE.Sprite; v: THREE.Vector3; spin: THREE.Vector3; t: number; life: number }
  const flakes: Flake[] = [];
  const spawn = (f: Flake) => {
    const a = Math.random() * Math.PI * 2;
    f.mesh.position.set(Math.cos(a) * R, 0.3 + Math.random() * 1.1, Math.sin(a) * R);
    const out = 0.25 + Math.random() * 0.35;
    f.v.set(Math.cos(a) * out, 0.15 + Math.random() * 0.35, Math.sin(a) * out);
    f.spin.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    const s = 0.07 + Math.random() * 0.08;
    f.mesh.scale.set(s, s * 2.2, s);
    f.life = 3 + Math.random() * 2.5;
    f.t = 0;
  };
  for (let i = 0; i < 26; i++) {
    const mesh = new THREE.Mesh(shard, crystal.clone());
    const g = sprite(0);
    g.scale.set(0.45, 0.45, 1);
    mesh.add(g);
    crown.add(mesh);
    const f: Flake = { mesh, glow: g, v: new THREE.Vector3(), spin: new THREE.Vector3(), t: 0, life: 1 };
    spawn(f);
    f.t = -Math.random() * 5;
    mesh.visible = false;
    flakes.push(f);
  }

  const setColors = (crystalHex: string, bandHex: string, rim: THREE.PointLight, under: THREE.PointLight) => {
    const c = new THREE.Color(crystalHex);
    const b = new THREE.Color(bandHex);
    crystal.color.copy(c).lerp(new THREE.Color(0xffffff), 0.45);
    crystal.emissive.copy(c);
    band.color.copy(b);
    band.emissive.copy(b).multiplyScalar(0.6);
    coreGlow.material.color.copy(c);
    halo.material.color.copy(c);
    rim.color.copy(c);
    under.color.copy(b);
    for (const f of flakes) {
      f.mesh.material.color.copy(crystal.color);
      f.mesh.material.emissive.copy(c);
      f.glow.material.color.copy(c);
    }
  };

  const update = (t: number, dt: number) => {
    crown.rotation.y = t * 0.18;
    crown.rotation.x = 0.32 + Math.sin(t * 0.4) * 0.04;
    crown.position.y = Math.sin(t * 0.8) * 0.08 - 0.42;
    core.rotation.y = -t * 0.6;
    crystal.emissiveIntensity = 0.32 + Math.sin(t * 1.6) * 0.08;
    coreGlow.material.opacity = 0.7 + Math.sin(t * 1.6) * 0.15;
    for (const m of loose) {
      m.position.y = m.userData.baseY + Math.sin(t * 1.1 + m.userData.phase) * 0.08;
      m.rotation.y = Math.sin(t * 0.7 + m.userData.phase) * 0.3;
    }
    for (const f of flakes) {
      f.t += dt;
      if (f.t < 0) continue;
      if (f.t > f.life) {
        spawn(f);
        continue;
      }
      f.mesh.visible = true;
      f.mesh.position.addScaledVector(f.v, dt);
      f.mesh.rotation.x += f.spin.x * dt;
      f.mesh.rotation.y += f.spin.y * dt;
      f.mesh.rotation.z += f.spin.z * dt;
      const k = f.t / f.life;
      const alpha = Math.min(1, k * 5) * (1 - k);
      f.mesh.material.opacity = alpha * 0.95;
      f.glow.material.opacity = alpha * 0.8;
    }
  };
  return { setColors, update };
}

/** The 3D crown behind the Play hexagon (Three.js is loaded with this component only). */
export default function SunderedCrown({ crystal, band, motion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<((c: string, b: string) => void) | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return; // No WebGL: Home simply shows the Play button without the crown.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.6, 9);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x221a40, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xffffff, 30, 20);
    rim.position.set(-3, 1, -3);
    scene.add(rim);
    const under = new THREE.PointLight(0xffffff, 18, 12);
    under.position.set(0, -2.5, 2);
    scene.add(under);
    const glow = glowTexture();
    const crown = buildCrown(scene, glow);

    const render = () => renderer.render(scene, camera);
    colorsRef.current = (c, b) => {
      crown.setColors(c, b, rim, under);
      if (motion === 'still') render();
    };
    colorsRef.current(crystal, band);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (motion === 'still') render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let frame = 0;
    if (motion === 'live') {
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        crown.update(now / 1000, dt);
        render();
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    } else {
      crown.update(4, 0);
      render();
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      colorsRef.current = undefined;
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      glow.dispose();
      renderer.dispose();
    };
    // Colours are applied through colorsRef below; only the motion mode rebuilds the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion]);

  useEffect(() => {
    colorsRef.current?.(crystal, band);
  }, [crystal, band]);

  return <canvas ref={canvasRef} className="sundered-crown" style={{ maskImage: MASK, WebkitMaskImage: MASK }} aria-hidden />;
}
