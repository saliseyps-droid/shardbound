import * as THREE from 'three';

/**
 * The fly-through at the start of a 3D match: the camera circles the room from up near its walls,
 * looking across at what stands in it (the back wall's painting and furniture, the side walls, the
 * door), then comes down over the player's shoulder into the usual view of the table, before the
 * Wardens' banner. The room is the one the match shows (src/ui/lounge/decor).
 */

/** How long the flight takes (ms, before the animation speed setting). */
export const FLYBY_MS = 8000;

/** Where the camera passes (table units, z up; walls at x ±36, y ±30, floor at z -9, ceiling at 25). */
const PATH = [
  new THREE.Vector3(-30, -24, 20),
  new THREE.Vector3(-30, 10, 18),
  new THREE.Vector3(-6, 25, 17),
  new THREE.Vector3(28, 12, 17),
  new THREE.Vector3(24, -22, 18),
];
/** What it looks at meanwhile: the back wall, the right wall, the door, the left wall, then the table. */
const LOOKS = [
  new THREE.Vector3(12, 26, 3),
  new THREE.Vector3(32, 6, 6),
  new THREE.Vector3(4, -28, 6),
  new THREE.Vector3(-32, -4, 6),
  new THREE.Vector3(0, 2, 0),
];
/** A wide lens to take in the room, narrowing to the match's own as it lands. */
const WIDE_FOV = 58;

const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/**
 * Moves `camera` to where the flight is at `u` (0..1). The camera arrives already placed in its usual
 * pose (placeCamera): that pose is where the flight ends, so the last frame is the usual view exactly.
 */
export function flyCamera(camera: THREE.PerspectiveCamera, u: number): void {
  const endPos = camera.position.clone();
  const endFov = camera.fov;
  const dir = camera.getWorldDirection(new THREE.Vector3());
  // The usual view looks at a point on the table (z = 0).
  const endLook = endPos.clone().addScaledVector(dir, dir.z < -1e-3 ? -endPos.z / dir.z : 20);
  const s = smootherstep(Math.min(1, Math.max(0, u)));
  // Even speed along the path (by arc length), eased at both ends; the gaze follows its own path.
  const pos = new THREE.CatmullRomCurve3([...PATH, endPos], false, 'centripetal').getPointAt(s);
  const look = new THREE.CatmullRomCurve3([...LOOKS, endLook], false, 'centripetal').getPoint(s);
  camera.position.copy(pos);
  camera.up.set(0, 0, 1);
  camera.lookAt(look);
  // Wide for most of the flight, then narrowing to the match's lens over the last stretch.
  const k = smootherstep(Math.min(1, Math.max(0, (s - 0.65) / 0.35)));
  camera.fov = WIDE_FOV + (endFov - WIDE_FOV) * k;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
