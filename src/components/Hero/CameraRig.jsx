/*
 * CameraRig.jsx v8
 *
 * Upgrade from v7: drives X AND Y (mouse parallax on both axes), plus a
 * subtle scroll-driven push-in on Z during the dock transition so the
 * "camera zooms, main cup shrinks, satellites scatter" feeling in the
 * brief actually reads as camera movement, not just object movement.
 *
 * Base position: [0, 0, 7.5] — matches HeroCanvas initial camera so there
 * is no pop on mount.
 *
 * Mouse range kept conservative (X: ±0.12 already proven not to clip the
 * satellite cups out of frame at the new wider orbit radii; Y: ±0.07,
 * smaller because vertical drift reads more aggressively against the
 * fixed horizon of the menu panel).
 *
 * lookAt stays [0, 0, 0] — world origin is the resting point of the main
 * cup, so the gaze target doesn't need to track the dock animation; the
 * cup moves away from a camera that holds its look direction, which is
 * exactly the "camera-relative" feel the brief asked for.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';

const LOOK = new Vector3(0, 0, 0);
const BX = 0, BY = 0, BZ = 7.5;

export default function CameraRig({ mouse, scrollProgress }) {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scrollProgress?.current ?? 0;

    // Gentle push-in during the first 60% of scroll — reinforces the
    // "camera zooms" note from the brief without fighting the cup's own
    // scale-down animation.
    const zoomT    = Math.min(p / 0.6, 1.0);
    const zoomEase = 1 - Math.pow(1 - zoomT, 2);
    const targetZ  = BZ - zoomEase * 0.65;

    camera.position.x = MathUtils.lerp(
      camera.position.x,
      BX + mouse.current.x * 0.12 + Math.sin(t * 0.07) * 0.008,
      0.025
    );
    camera.position.y = MathUtils.lerp(
      camera.position.y,
      BY + mouse.current.y * 0.07 + Math.cos(t * 0.05) * 0.006,
      0.025
    );
    camera.position.z = MathUtils.lerp(camera.position.z, targetZ, 0.04);

    camera.lookAt(LOOK);
  });

  return null;
}