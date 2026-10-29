import * as THREE from 'three';

/**
 * The fly-through at the start of a 3D match: the camera sweeps through the room (from a high back
 * corner, along the right wall, round behind the player's seat) and settles into the usual view of the
 * table, before the Wardens' banner. The room is the one the match shows (src/ui/lounge/decor).
 */

/** How long the flight takes (ms, before the animation speed setting). */
export const FLYBY_MS = 6500;

/** Waypoints inside the room (table units, z up; walls at x ±36, y ±30, floor at z -9, ceiling at 25). */
const PATH = [new THREE.Vector3(24, 24, 19), new THREE.Vector3(31, -4, 11), new THREE.Vector3(18, -25, 8), new THREE.Vector3(-6, -26, 13)];
/** Where it looks at first: over the table towards the far wall. */
const FIRST_LOOK = new THREE.Vector3(0, 6, 0);

const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/**
 * Moves `camera` to where the flight is at `u` (0..1). The camera arrives already placed in its usual
 * pose (placeCamera): that pose is where the flight ends, so the last frame is the usual view exactly.
 */
export function flyCamera(camera: THREE.PerspectiveCamera, u: number): void {
  const endPos = camera.position.clone();
  const dir = camera.getWorldDirection(new THREE.Vector3());
  // The usual view looks at a point on the table (z = 0).
  const endLook = endPos.clone().addScaledVector(dir, dir.z < -1e-3 ? -endPos.z / dir.z : 20);
  const s = smootherstep(Math.min(1, Math.max(0, u)));
  // Even speed along the path (by arc length), eased at both ends.
  const pos = new THREE.CatmullRomCurve3([...PATH, endPos], false, 'centripetal').getPointAt(s);
  // The gaze settles on the table a little ahead of the camera, so the last stretch is a calm glide.
  const look = FIRST_LOOK.clone().lerp(endLook, Math.min(1, s * 1.25));
  camera.position.copy(pos);
  camera.up.set(0, 0, 1);
  camera.lookAt(look);
  camera.updateMatrixWorld();
}
