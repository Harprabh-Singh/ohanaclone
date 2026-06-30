/*
 * ActiveCupImage.jsx v5
 *
 * CHANGES FROM v4:
 *
 * - Accepts a new `t2Ref` prop (0 at viewport width >=700px, ramps to 1
 *   at width<=300px — see useResponsiveScale.js header). Passed as the
 *   second argument to resolveCupGeometry(cfg, tRef.current,
 *   t2Ref.current), same change as SatelliteCups.jsx v14 — keeps the
 *   active/centerpiece cup's geometry continuing to scale/tighten below
 *   the old 700px floor instead of freezing there.
 *
 * CHANGES FROM v3 (carried forward into v4):
 *
 * - Accepts a new `tRef` prop (0 = desktop, 1 = mobile). Each frame,
 *   calls resolveCupGeometry(cfg, tRef.current) from cupConfig.js to
 *   get the viewport-interpolated idlePos/width/height, instead of
 *   reading cfg.idlePos/width/height raw.
 *
 * - Same geometry-rebuild-on-threshold approach as SatelliteCups.jsx
 *   (see that file's header comment for the full rationale): position
 *   is a cheap imperative .set() every frame, but width/height changes
 *   require swapping the PlaneGeometry instance, which is only done
 *   when the resolved size has drifted past GEOMETRY_EPSILON since the
 *   last rebuild — not unconditionally every frame.
 *
 * Rise curve, fade-in, and freeze-consumption behavior are otherwise
 * unchanged from v3 — those are independent of t and continue to apply
 * on top of whatever idlePos the current viewport width resolves to.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry } from 'three';
import { resolveCupGeometry } from './cupConfig';

const RISE_AMOUNT = 0.30;   // how many units the active cup rises at p=1
const FADE_IN_END = 0.35;   // fully opaque by this scroll progress

// Only rebuild plane geometry if width/height drifted by more than this
// since the last rebuild — avoids per-frame geometry churn while a
// continuous resize is in progress.
const GEOMETRY_EPSILON = 0.01;

export default function ActiveCupImage({ cfg, texture, scrollProgress, tRef, tMidRef, t2Ref }) {
  const groupRef = useRef(null);
  const matRef   = useRef(null);
  const meshRef  = useRef(null);
  const lastSize = useRef({ width: cfg.width, height: cfg.height });
  const baseOpacity = cfg.opacity ?? 1;

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;
    const p = scrollProgress.current;
    const t    = tRef?.current    ?? 0;
    const tMid = tMidRef?.current ?? 0;
    const t2   = t2Ref?.current   ?? 0;
    const geo = resolveCupGeometry(cfg, t, t2, tMid);

    // Rise curve
    const scrollT = Math.min(p / 0.78, 1.0);
    const easedT  = 1 - Math.pow(1 - scrollT, 2);

    // Y rises gently — X/Z stay at idle (interpolated desktop↔mobile)
    groupRef.current.position.set(
      geo.idlePos[0],
      geo.idlePos[1] + easedT * RISE_AMOUNT,
      geo.idlePos[2],
    );

    // Fade in as menu appears
    const fadeIn = Math.min(p / FADE_IN_END, 1.0);
    matRef.current.opacity = texture ? baseOpacity * fadeIn : 0;

    // Size: rebuild geometry only when it's actually drifted enough to
    // matter (see file header) — avoids per-frame reallocation.
    if (meshRef.current) {
      const dw = Math.abs(geo.width  - lastSize.current.width);
      const dh = Math.abs(geo.height - lastSize.current.height);
      if (dw > GEOMETRY_EPSILON || dh > GEOMETRY_EPSILON) {
        meshRef.current.geometry.dispose();
        meshRef.current.geometry = new PlaneGeometry(geo.width, geo.height);
        lastSize.current = { width: geo.width, height: geo.height };
      }
    }
  });

  return (
    <group ref={groupRef} position={cfg.idlePos}>
      <mesh ref={meshRef} rotation={cfg.rotation} renderOrder={cfg.renderOrder ?? 0}>
        <planeGeometry args={[cfg.width, cfg.height]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture ?? null}
          transparent
          opacity={texture ? baseOpacity : 0}
          alphaTest={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}