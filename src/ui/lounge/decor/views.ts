import * as THREE from 'three';
import { Bag, boxIn, loadArt, modelPiece, type DecorContext } from './kit';
import type { Built } from './tables';
import skyIsles from '@/assets/cinematics/hv_sky_isles.webp';
import valley from '@/assets/cinematics/aethra_valley.webp';

/**
 * A view through a window: a photo (or a picture from the game) that seems to lie far behind the wall.
 * Each point of the glass looks along the line from the camera through it to a plane `depth` behind
 * the wall, so the view shifts as the camera moves, as a real one would.
 */
export function viewPane(bag: Bag, url: string | undefined, w: number, h: number, depth: number, brightness = 1, arched = false): THREE.Mesh {
  const uniforms = {
    map: { value: null as THREE.Texture | null },
    depth: { value: depth },
    // How much of the far plane shows: the pane's size grown by how far away it is, so the edges stay hidden.
    far: { value: new THREE.Vector2(w * (1 + depth / 14), h * (1 + depth / 14)) },
    brightness: { value: brightness },
    size: { value: new THREE.Vector2(w, h) },
    arched: { value: arched ? 1 : 0 },
    ready: { value: 0 },
  };
  const mat = bag.keep(
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vLocal;
        varying vec3 vCam;
        void main() {
          vLocal = position;
          vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform vec2 far;
        uniform float depth;
        uniform float brightness;
        uniform float ready;
        uniform vec2 size;
        uniform float arched;
        varying vec3 vLocal;
        varying vec3 vCam;
        void main() {
          // An arched window: nothing above the round top (a half circle as wide as the pane).
          if (arched > 0.5) {
            float r = size.x / 2.0;
            float spring = size.y / 2.0 - r;
            if (vLocal.y > spring && length(vec2(vLocal.x, vLocal.y - spring)) > r) discard;
          }
          // The pane lies in x–y (z towards the room); the far plane is depth behind it.
          vec3 d = normalize(vLocal - vCam);
          float t = (-depth - vLocal.z) / min(d.z, -0.05);
          vec2 q = vLocal.xy + d.xy * t;
          vec2 uv = clamp(q / far + 0.5, 0.0, 1.0);
          vec3 c = texture2D(map, uv).rgb * brightness;
          gl_FragColor = vec4(mix(vec3(0.02, 0.02, 0.04), c, ready), 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  loadArt(url, bag, (t) => {
    uniforms.map.value = t;
    uniforms.ready.value = 1;
  });
  // Built facing -y like the other wall pieces: the plane's +z turned to -y.
  const pane = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(w, h)), mat);
  pane.rotation.x = Math.PI / 2;
  return pane;
}

/**
 * A window on the back wall (Quaternius' frames, CC0): its glass made clear, and behind it a view that
 * seems far away (viewPane). The pane takes the frame's size once the frame has loaded.
 */
export function windowPiece(frameId: string, viewUrl: (ctx: DecorContext) => string | undefined, opts: { height: number; brightness?: number; arched?: boolean }): (ctx: DecorContext, bag: Bag) => Built {
  return (ctx, bag) => {
    const g = new THREE.Group();
    // A window is deeper and may be taller than a painting: only its width is held to the slot.
    const max = ctx.limit && { ...ctx.limit, d: 8, h: 18 };
    const frame = modelPiece(bag, frameId, {
      height: opts.height,
      mount: 'wall',
      max,
      tweak: (m) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (!/glass|window/i.test(mat.name)) return;
        // The glass: a faint sheen over the view.
        m.material = bag.keep(new THREE.MeshStandardMaterial({ color: '#dfefff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.08, depthWrite: false }));
      },
      onLoad: () => {
        const box = boxIn(frame, g);
        const w = (box.max.x - box.min.x) * 0.92;
        const h = (box.max.z - box.min.z) * 0.94;
        const pane = viewPane(bag, viewUrl(ctx), w, h, 40, opts.brightness ?? 1, opts.arched);
        pane.position.set((box.min.x + box.max.x) / 2, -0.06, (box.min.z + box.max.z) / 2);
        g.add(pane);
      },
    });
    g.add(frame);
    return { root: g };
  };
}

const view = (name: string) => () => `${import.meta.env.BASE_URL}decor/views/${name}.jpg`;
const arched = 'ext/window_arched.glb';
const modern = 'ext/window_modern.glb';

/** Views: photos (Poly Haven, CC0) and two of the game's own lands. */
export const WINDOWS = {
  p_window_snow: windowPiece(arched, view('snow_town'), { height: 17, arched: true }),
  p_window_harbour: windowPiece(modern, view('harbour'), { height: 14 }),
  p_window_lake: windowPiece(arched, view('lake'), { height: 17, brightness: 1.3, arched: true }),
  p_window_isles: windowPiece(arched, () => skyIsles, { height: 17, arched: true }),
  p_window_valley: windowPiece(arched, () => valley, { height: 17, arched: true }),
};
