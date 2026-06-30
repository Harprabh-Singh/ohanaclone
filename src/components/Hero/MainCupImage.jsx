/*
 * MainCupImage.jsx v5
 *
 * CHANGES FROM v4:
 *
 * - Accepts a new `t2Ref` prop (0 at viewport width >=700px, ramps to 1
 *   at width<=300px — see useResponsiveScale.js header). Adds a second
 *   set of SMALL-mobile counterparts (IDLE_Y_SMALL/IDLE_SCALE_SMALL/
 *   RISEN_Y_SMALL/RISEN_SCALE_SMALL/MESH_OFFSET_X_SMALL) and a second
 *   lerp pass applied on top of the existing desktop↔mobile blend, same
 *   two-stage approach as cupConfig.js's resolveCupGeometry v5 (stage 1
 *   desktop→mobile by t, stage 2 mobile→small-mobile by t2). Needed for
 *   the same reason as cupConfig.js's smallMobile* fields: below 700px
 *   the geometry was frozen at its 700px-tuned mobile values even as
 *   the canvas box kept shrinking down to ~300px, so cup5 (rendered
 *   here whenever 'coffee' is the active category) started looking
 *   oversized/cramped relative to its shrinking letterbox.
 *
 * - Small-mobile scale keeps cup5 centered, same X=0 contract as mobile
 *   (matches cupConfig.js's cup5 smallMobileIdlePos staying at X≈-0.10,
 *   converted to MainCupImage's group-position-X=0 + meshOffsetX
 *   shape — see the MUST-stay-in-sync comment block below).
 *
 * CHANGES FROM v3 (carried forward into v4):
 *
 * - Accepts a new `tRef` prop (0 = desktop, 1 = mobile — same contract
 *   as cupConfig.js's resolveCupGeometry). MainCupImage doesn't read
 *   from cupConfig.js at all (its geometry is its own inline constants:
 *   IDLE_Y/IDLE_SCALE/RISEN_Y/RISEN_SCALE/meshOffsetX/width/height), so
 *   it needs its own mobile counterparts and its own lerp, mirroring
 *   the pattern in resolveCupGeometry() rather than calling it directly
 *   (different shape: this component has Y/scale, not idlePos/width/
 *   height as a tuple).
 *
 * - Mobile values keep cup5 centered (matches cupConfig.js's cup5
 *   mobileIdlePos staying at X=0 — these two MUST stay in sync per the
 *   comment in cupConfig.js, since cup5 swaps between being rendered by
 *   MainCupImage (coffee) and as a satellite (non-coffee categories)).
 *   Mobile scale is reduced to roughly match cup5's mobileWidth/
 *   mobileHeight ratio in cupConfig.js (~62% of desktop).
 *
 * - meshOffsetX (the 0.44 X-offset baked into the mesh's local position,
 *   not the group) also needs to shrink on mobile — at full desktop
 *   offset combined with the smaller mobile scale, the offset would
 *   look disproportionately large relative to the cup. Scaling it down
 *   with the same t keeps the cup's optical center consistent between
 *   desktop and mobile.
 *
 * - All interpolation happens once per frame inside useFrame by reading
 *   tRef.current (a live ref, not React state) — no re-render needed on
 *   resize, consistent with how scrollProgress is already read.
 *
 * Everything else (freeze handling, rise curve, idle float bob) is
 * unchanged from v3 — t only affects the SIZE/POSITION constants being
 * interpolated *into*, not the animation curve shape itself.
 */

import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, SRGBColorSpace, MathUtils } from 'three';

import cup5Url from './models/satellites/cup5.png';

const CUP5_ASPECT = 445 / 523;
const ROTATION    = [0, 0, -0.15];

// Idle resting position — desktop
const IDLE_Y     = -1.87;
const IDLE_SCALE = 3.2;

// Risen (fully scrolled) position — desktop
const RISEN_Y     = 0.50;
const RISEN_SCALE = 3.55;

// Mesh-local X offset (desktop) — see comment above re: scaling this
// down on mobile to keep optical center consistent.
const MESH_OFFSET_X = 0.44;

// --- Mobile counterparts ---
// Keep these in sync with cupConfig.js's cup5.mobileIdlePos /
// mobileWidth / mobileHeight (cup5 must look the same whether it's
// being rendered here or as a satellite after a category switch).
// cupConfig.js's cup5 mobile scale is ~62% of desktop (width 2.03/3.28,
// height 2.39/3.856) — mirrored here via MOBILE_SCALE_FACTOR.
const MOBILE_SCALE_FACTOR = 0.62;

const IDLE_Y_MOBILE      = -0.55; // re-centered for the new <700px layout
                                   // where the canvas zone sits in the
                                   // MIDDLE of the screen (between the
                                   // headline above and paragraph/CTAs
                                   // below — see Hero.css's restructured
                                   // <700px block), not bottom-anchored
                                   // like the old single-zone layout was
const IDLE_SCALE_MOBILE  = IDLE_SCALE * MOBILE_SCALE_FACTOR;   // ≈ 1.984

const RISEN_Y_MOBILE     = 0.35;  // rises up from the new, higher resting
                                   // point — proportionally similar travel
                                   // distance to before, just shifted to
                                   // match the re-centered idle position
const RISEN_SCALE_MOBILE = RISEN_SCALE * MOBILE_SCALE_FACTOR;  // ≈ 2.201

const MESH_OFFSET_X_MOBILE = MESH_OFFSET_X * MOBILE_SCALE_FACTOR; // ≈ 0.273

// --- Mid-mobile counterparts (600–700px band) ---
// Keep these in sync with cupConfig.js's cup5 midMobile values so the
// centerpiece cup preserves the same optical size whether it renders
// here or as a satellite after a category switch.
const MID_SCALE_FACTOR = 0.83;

const IDLE_Y_MID_MOBILE      = -0.48;
const IDLE_SCALE_MID_MOBILE  = IDLE_SCALE * MID_SCALE_FACTOR;

const RISEN_Y_MID_MOBILE     = 0.34;
const RISEN_SCALE_MID_MOBILE = RISEN_SCALE * MID_SCALE_FACTOR;

const MESH_OFFSET_X_MID_MOBILE = MESH_OFFSET_X * MID_SCALE_FACTOR;

// --- Small-mobile counterparts (700px → 300px range) ---
// Keep IDLE_SCALE/RISEN_SCALE_SMALL roughly matching cupConfig.js's
// cup5 smallMobileWidth/smallMobileHeight ratio (~48% of desktop) —
// same MUST-stay-in-sync rule as the mobile pair above, since cup5
// swaps between MainCupImage (coffee) and SatelliteCup (other
// categories) and must look the same size/position either way.
const SMALL_SCALE_FACTOR = 0.48;

// Same re-centering rationale as IDLE_Y_MOBILE above — the canvas zone
// stays roughly mid-screen across all sub-700px tiers (see Hero.css),
// just claiming a slightly larger height share as the screen narrows
const IDLE_Y_SMALL      = -0.45;
const IDLE_SCALE_SMALL  = IDLE_SCALE * SMALL_SCALE_FACTOR;   // ≈ 1.536

const RISEN_Y_SMALL      = 0.25;  // proportionally similar rise to
                                   // RISEN_Y_MOBILE, scaled down slightly
                                   // for the smaller small-mobile cup
const RISEN_SCALE_SMALL  = RISEN_SCALE * SMALL_SCALE_FACTOR; // ≈ 1.704

const MESH_OFFSET_X_SMALL = MESH_OFFSET_X * SMALL_SCALE_FACTOR; // ≈ 0.211

export default function MainCupImage({ scrollProgress, freezeCupsRef, tRef, tMidRef, t2Ref }) {
  const texture = useLoader(TextureLoader, cup5Url);
  if (texture.colorSpace !== SRGBColorSpace) texture.colorSpace = SRGBColorSpace;

  // Resolve the CORRECT idle Y/scale for the current viewport right at
  // mount time (not the raw desktop IDLE_Y/IDLE_SCALE constants). Without
  // this, currentY/currentSc/the initial <group> position all started at
  // the desktop value regardless of actual screen size — on mobile, the
  // lerp toward the real (much higher/smaller) mobile idle position took
  // several frames to catch up, which read as the cup "moving up then
  // snapping to its real starting position" on every fresh scroll-start
  // (initial page load, or returning to this section after scrolling
  // away and back). Resolving once here means the very first rendered
  // frame is already correct — no catch-up lerp needed.
  const resolveInitialIdle = () => {
    const t    = tRef?.current    ?? 0;
    const tMid = tMidRef?.current ?? 0;
    const t2   = t2Ref?.current   ?? 0;
    let y     = MathUtils.lerp(IDLE_Y,     IDLE_Y_MOBILE,     t);
    let scale = MathUtils.lerp(IDLE_SCALE, IDLE_SCALE_MOBILE, t);
    if (tMid) {
      y     = MathUtils.lerp(y,     IDLE_Y_MID_MOBILE,     tMid);
      scale = MathUtils.lerp(scale, IDLE_SCALE_MID_MOBILE, tMid);
    }
    if (t2) {
      y     = MathUtils.lerp(y,     IDLE_Y_SMALL,     t2);
      scale = MathUtils.lerp(scale, IDLE_SCALE_SMALL, t2);
    }
    return { y, scale };
  };

  const groupRef   = useRef(null);
  const meshRef    = useRef(null);
  const initialIdle = useRef(resolveInitialIdle());
  const currentY   = useRef(initialIdle.current.y);
  const currentSc  = useRef(initialIdle.current.scale);

  useFrame(() => {
    if (!groupRef.current) return;

    const t    = tRef?.current    ?? 0;
    const tMid = tMidRef?.current ?? 0;
    const t2   = t2Ref?.current   ?? 0;

    // Stage 1: desktop → mobile (floors at width<=700px)
    let idleY       = MathUtils.lerp(IDLE_Y,          IDLE_Y_MOBILE,        t);
    let idleScale   = MathUtils.lerp(IDLE_SCALE,       IDLE_SCALE_MOBILE,    t);
    let risenY      = MathUtils.lerp(RISEN_Y,          RISEN_Y_MOBILE,       t);
    let risenScale  = MathUtils.lerp(RISEN_SCALE,      RISEN_SCALE_MOBILE,   t);
    let meshOffsetX = MathUtils.lerp(MESH_OFFSET_X,    MESH_OFFSET_X_MOBILE, t);

    // Stage 2: mobile → mid-mobile (600–700px band)
    if (tMid) {
      idleY       = MathUtils.lerp(idleY,       IDLE_Y_MID_MOBILE,        tMid);
      idleScale   = MathUtils.lerp(idleScale,   IDLE_SCALE_MID_MOBILE,    tMid);
      risenY      = MathUtils.lerp(risenY,      RISEN_Y_MID_MOBILE,       tMid);
      risenScale  = MathUtils.lerp(risenScale,  RISEN_SCALE_MID_MOBILE,   tMid);
      meshOffsetX = MathUtils.lerp(meshOffsetX, MESH_OFFSET_X_MID_MOBILE, tMid);
    }

    // Stage 3: mid-mobile → small-mobile (0 at width>=700px, 1 at width<=300px)
    if (t2) {
      idleY       = MathUtils.lerp(idleY,       IDLE_Y_SMALL,            t2);
      idleScale   = MathUtils.lerp(idleScale,   IDLE_SCALE_SMALL,        t2);
      risenY      = MathUtils.lerp(risenY,      RISEN_Y_SMALL,           t2);
      risenScale  = MathUtils.lerp(risenScale,  RISEN_SCALE_SMALL,       t2);
      meshOffsetX = MathUtils.lerp(meshOffsetX, MESH_OFFSET_X_SMALL,     t2);
    }

    if (meshRef.current) {
      meshRef.current.position.x = meshOffsetX;
    }

    // Consume freeze signal — snap to idle, no lerp
    if (freezeCupsRef?.current) {
      freezeCupsRef.current = false;
      currentY.current  = idleY;
      currentSc.current = idleScale;
      groupRef.current.position.x = 0;
      groupRef.current.position.y = idleY;
      groupRef.current.scale.setScalar(idleScale);
      return;
    }

    const p = scrollProgress.current;
    const clock = performance.now() / 1000; // clock in seconds

    // Rise curve: 0 → 1 over the FULL scroll range (0 → 1). Previously
    // this clamped at p/0.78, meaning the cup reached its fully-risen
    // pose at 78% scroll and then sat motionless for the remaining 22%
    // — that dead zone read as an abrupt stop/snap once scroll passed
    // ~78%. Now the ease-out-quad curve runs across the entire scroll
    // range, so motion keeps gently settling all the way to 100%
    // instead of hitting a hard plateau partway through.
    const scrollT = p;
    const easedT  = 1 - Math.pow(1 - scrollT, 2); // ease-out-quad

    const targetY  = MathUtils.lerp(idleY,  risenY,  easedT);
    const targetSc = MathUtils.lerp(idleScale, risenScale, easedT);

    // Smooth follow (same lerp factor as before)
    currentY.current  = MathUtils.lerp(currentY.current,  targetY,  0.06);
    currentSc.current = MathUtils.lerp(currentSc.current, targetSc, 0.06);

    // X stays centered — no dock-to-left
    groupRef.current.position.x = 0;
    groupRef.current.position.y = currentY.current;
    groupRef.current.scale.setScalar(currentSc.current);

    // Idle float bob: fades out as scroll increases (same as before)
    const floatAmp = 1 - Math.min(p / 0.35, 1);
    groupRef.current.position.y = currentY.current + Math.sin(clock * 0.5) * 0.04 * floatAmp;
  });

  const height = 1.205;
  const width  = height * CUP5_ASPECT;

  return (
    <group ref={groupRef} position={[0, initialIdle.current.y, 0]} scale={initialIdle.current.scale}>
      <mesh ref={meshRef} position={[MESH_OFFSET_X, height / 2, 0]} rotation={ROTATION}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}