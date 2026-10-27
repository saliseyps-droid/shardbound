import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  art: string;
  color: string;
  glow: string;
  onUnavailable: () => void;
}

const R = 2.45;
const CAM_Z = 12.5;
const FOV = 35;

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeIn = (x: number) => Math.pow(Math.min(1, Math.max(0, x)), 3);

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  return new THREE.CanvasTexture(c);
}
const radial = (size: number, stops: [number, string][]) =>
  canvasTexture(size, size, (g) => {
    const h = size / 2;
    const r = g.createRadialGradient(h, h, 0, h, h, h);
    stops.forEach(([o, c]) => r.addColorStop(o, c));
    g.fillStyle = r;
    g.fillRect(0, 0, size, size);
  });

/**
 * The Portal entrance (3D part): a round window opens on the Legendary's art, framed in gold with
 * swirling energy in its faction's colours; the camera eases into it, then it closes like an iris.
 * The darkening and the name are drawn by the page around it (LegendaryEntranceView).
 */
export default function LegendPortal3D({ art, color, glow, onUnavailable }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const failRef = useRef(onUnavailable);
  failRef.current = onUnavailable;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      failRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-3, 4, 6);
    scene.add(key);

    const textures: THREE.Texture[] = [];
    const keep = <T extends THREE.Texture>(t: T) => (textures.push(t), t);
    const glowTex = keep(radial(128, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]));
    const sparkTex = keep(radial(64, [[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']]));
    const edgeTex = keep(radial(256, [[0, 'rgba(0,0,0,0)'], [0.47, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.85)']]));
    const swirlTex = keep(
      canvasTexture(512, 512, (g) => {
        g.translate(256, 256);
        g.lineCap = 'round';
        for (let i = 0; i < 70; i++) {
          const r = 190 + Math.random() * 60;
          const a = Math.random() * Math.PI * 2;
          g.strokeStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.6})`;
          g.lineWidth = 1 + Math.random() * 5;
          g.beginPath();
          g.arc(0, 0, r, a, a + 0.3 + Math.random() * 0.9);
          g.stroke();
        }
      }),
    );

    const c = new THREE.Color(color);
    const gl = new THREE.Color(glow);
    const portal = new THREE.Group();
    portal.visible = false;
    scene.add(portal);
    const artMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    portal.add(new THREE.Mesh(new THREE.CircleGeometry(R, 96), artMat));
    const edge = new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshBasicMaterial({ map: edgeTex, transparent: true, depthWrite: false }));
    edge.position.z = 0.01;
    portal.add(edge);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.09, 12, 128), new THREE.MeshStandardMaterial({ color: 0xffd27a, metalness: 1, roughness: 0.25, emissive: 0x8a5a10, emissiveIntensity: 0.6 }));
    rim.position.z = 0.05;
    portal.add(rim);
    const swirl = (col: THREE.Color, scale: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.7, R * 2.7), new THREE.MeshBasicMaterial({ map: swirlTex, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      m.position.z = 0.06;
      m.scale.setScalar(scale);
      portal.add(m);
      return m;
    };
    const swirlA = swirl(c, 1);
    const swirlB = swirl(gl, 1.08);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.set(R * 4.6, R * 4.6, 1);
    halo.position.z = -0.2;
    portal.add(halo);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    scene.add(flash);

    let artTex: THREE.Texture | null = null;
    new THREE.TextureLoader().load(art, (tx) => {
      tx.colorSpace = THREE.SRGBColorSpace;
      textures.push(tx);
      artTex = tx;
      artMat.map = tx;
      artMat.color.set(0xffffff);
      artMat.needsUpdate = true;
    });

    // Motes drawn into the portal while it is open, and a few left over when it closes.
    const MAXP = 500;
    const pPos = new Float32Array(MAXP * 3);
    const pCol = new Float32Array(MAXP * 3);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.22, map: sparkTex, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
    interface Mote { pos: THREE.Vector3; vel: THREE.Vector3; age: number; life: number; color: THREE.Color; drag: number; attract?: boolean }
    let motes: Mote[] = [];
    const white = new THREE.Color('#ffffff');
    const gold = new THREE.Color('#ffd27a');

    let fit = 1;
    let centerY = 0.55;
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
      fit = Math.min(visH * 0.52, visH * camera.aspect * 0.7) / (2 * R) / 1.12;
      centerY = visH * 0.07;
    };
    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();
    let last = 0;
    let closed = false;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const k = clock.getElapsedTime();
      const dt = Math.min(0.05, k - last);
      last = k;
      // 0.35 - 1.1: it tears open.  1.1 - 2.9: we look into it.  2.9 - 3.3: it closes like an iris.
      const open = ease((k - 0.35) / 0.75);
      const close = easeIn((k - 2.9) / 0.4);
      portal.visible = k > 0.35 && close < 1;
      portal.scale.setScalar(Math.max(0.001, open * (1 - close)) * fit * (1 + Math.sin(k * 3) * 0.006));
      portal.position.set(0, centerY, 0);
      if (artTex) {
        const look = Math.max(0, k - 0.35);
        artTex.repeat.set(1 - look * 0.045, 0.8 - look * 0.036);
        artTex.offset.set(Math.sin(look * 0.4) * 0.015 + look * 0.0225, 0.14 + look * 0.01);
      }
      swirlA.rotation.z = -k * 0.9;
      swirlB.rotation.z = k * 0.6;
      swirlA.material.opacity = 0.9 + close * 0.6;
      swirlB.material.opacity = 0.6 + Math.sin(k * 4) * 0.2;
      halo.material.opacity = 0.55 + Math.sin(k * 2) * 0.1;
      camera.position.z = CAM_Z - ease((k - 0.9) / 2) * 0.9 * (1 - close);
      if (portal.visible) {
        for (let n = 0; n < 4; n++) {
          const a = Math.random() * Math.PI * 2;
          const r = 6 + Math.random() * 3;
          if (motes.length < MAXP) motes.push({ pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.6 + centerY, -1), vel: new THREE.Vector3(), age: 0, life: 1.4, color: Math.random() < 0.6 ? gl : white, drag: 0.97, attract: true });
        }
      }
      if (close >= 1 && !closed) {
        closed = true;
        flash.position.set(0, centerY, 0.3);
        for (let n = 0; n < 70 && motes.length < MAXP; n++) {
          const a = Math.random() * Math.PI * 2;
          motes.push({ pos: new THREE.Vector3(0, centerY, 0), vel: new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(1 + Math.random() * 2.5), age: 0, life: 1.4, color: Math.random() < 0.5 ? gold : gl, drag: 0.96 });
        }
      }
      if (closed) {
        const ki = k - 3.3;
        flash.material.opacity = Math.max(0, 0.8 - ki * 2.4);
        flash.scale.setScalar(1 + ki * 5);
      }
      motes = motes.filter((m) => (m.age += dt) < m.life);
      motes.forEach((m, i) => {
        if (m.attract) {
          const d = new THREE.Vector3(0, centerY, 0).sub(m.pos);
          m.vel.addScaledVector(d, dt * 2.6).add(new THREE.Vector3(-d.y, d.x, 0).multiplyScalar(dt * 1.2));
        }
        m.vel.multiplyScalar(m.drag);
        m.pos.addScaledVector(m.vel, dt);
        const f = Math.sin(Math.PI * Math.min(1, m.age / m.life));
        pPos.set([m.pos.x, m.pos.y, m.pos.z], i * 3);
        pCol.set([m.color.r * f, m.color.g * f, m.color.b * f], i * 3);
      });
      pGeo.setDrawRange(0, motes.length);
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.color.needsUpdate = true;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Sprite || o instanceof THREE.Points) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material) => m.dispose());
        }
      });
      textures.forEach((tx) => tx.dispose());
      renderer.dispose();
    };
  }, [art, color, glow]);

  return <canvas ref={canvasRef} className="lp-canvas" aria-hidden />;
}
