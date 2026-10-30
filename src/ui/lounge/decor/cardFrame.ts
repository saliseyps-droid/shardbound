import * as THREE from 'three';
import { getCard } from '@/data/cards';
import { cardArtUri } from '@/ui/components/cardArt';
import { Bag, DecorContext, loadArt, modelPiece } from './kit';
import type { Built } from './tables';

/**
 * A card from the player's collection in a gilt frame (Poly Haven's fancy_picture_frame_02, CC0): its
 * picture on the frame's canvas, and over it a holographic sheen that slides as the camera moves.
 */

/** The frame's canvas in its own units (metres), measured from the model. */
const CANVAS = { w: 0.5, h: 0.6 };

function holo(bag: Bag) {
  return bag.keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vTurn;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vec3 n = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
          // How the camera stands to the side of the card: the sheen follows it.
          vec3 toCam = normalize(cameraPosition - world.xyz);
          vTurn = dot(cross(n, vec3(0.0, 0.0, 1.0)), toCam);
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      fragmentShader: /* glsl */ `
        uniform float time;
        varying vec2 vUv;
        varying float vTurn;
        vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
        void main() {
          float band = vUv.x * 1.3 + vUv.y * 0.9 + vTurn * 2.2 + time * 0.05;
          float stripe = pow(0.5 + 0.5 * sin(band * 9.0), 6.0);
          vec3 c = hue(fract(band * 0.8)) * (0.025 + stripe * 0.16);
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
}

export function cardFrame(ctx: DecorContext, bag: Bag): Built {
  const card = ctx.info?.cardId ? getCard(ctx.info.cardId) : undefined;
  const g = new THREE.Group();
  let canvas: THREE.MeshStandardMaterial | null = null;
  let art: THREE.Texture | null = null;
  const show = () => {
    if (!canvas || !art) return;
    // Cover the canvas with the picture (cropped to its shape).
    const img = art.image as { width: number; height: number };
    const a = img.width / img.height;
    const want = CANVAS.w / CANVAS.h;
    if (a > want) art.repeat.set(want / a, 1), art.offset.set((1 - want / a) / 2, 0);
    else art.repeat.set(1, a / want), art.offset.set(0, (1 - a / want) / 2);
    // glTF lays its pictures the other way up from the loader's.
    art.flipY = false;
    art.needsUpdate = true;
    canvas.map = art;
    canvas.normalMap = null;
    canvas.roughness = 0.35;
    canvas.color.set('#ffffff');
    canvas.needsUpdate = true;
  };
  const frame = modelPiece(bag, 'fancy_picture_frame_02', {
    scale: 1.55,
    mount: 'wall',
    max: ctx.limit,
    tweak: (m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!mat.name.endsWith('_canvas')) return;
      canvas = mat;
      show();
      // The sheen: a copy of the canvas just in front of it.
      const sheen = new THREE.Mesh(m.geometry, holo(bag));
      sheen.position.z = 0.001;
      sheen.renderOrder = 2;
      m.add(sheen);
    },
  });
  g.add(frame);
  // A small picture light above it, so the card shows on a dark wall.
  const lamp = new THREE.PointLight(0xffe6c0, 6, 14, 1.8);
  lamp.position.set(0, -3.5, 6);
  g.add(lamp);
  loadArt(card ? cardArtUri(card) : undefined, bag, (t) => {
    art = t;
    show();
  });
  const sheens: THREE.ShaderMaterial[] = [];
  return {
    root: g,
    update: (t) => {
      if (!sheens.length) g.traverse((o) => (o as THREE.Mesh).material instanceof THREE.ShaderMaterial && sheens.push((o as THREE.Mesh).material as THREE.ShaderMaterial));
      for (const s of sheens) s.uniforms.time.value = t;
    },
  };
}
