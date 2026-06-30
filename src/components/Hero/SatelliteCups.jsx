/*
 * SatelliteCups.jsx v17
 *
 * CHANGES FROM v16 — moved to plain HTML/CSS background composition:
 *
 * scatterMode (the pre-scroll mobile "all four dishes + 12 particles
 * visible at once as ambient background" layout) is REMOVED from this
 * file entirely. That composition now lives in BackgroundComposition.jsx
 * as plain <img> elements positioned by CSS, not Three.js meshes — see
 * that file's header for the full rationale (no animation was ever
 * attached to these items beyond sitting at a fixed scatter position,
 * so paying for texture-load Suspense + canvas draw calls + per-frame
 * geometry-rebuild bookkeeping bought nothing).
 *
 * Concretely removed: the `scatterMode` prop, the `Particle` component,
 * the `particleTextures` useLoader call and its import of
 * PARTICLE_CONFIGS/resolveParticleGeometry, and the cup6/cup5 scatter-
 * mode filter branch in the default export. cup1-4's
 * `mobileScatterPos`/`mobileScatterWidth`/`mobileScatterHeight`/
 * `mobileScatterOpacity` fields in cupConfig.js are no longer READ by
 * this file (or any Three.js code) — they're now dead in the Three.js
 * sense, but were deliberately left in cupConfig.js rather than deleted,
 * since BackgroundComposition.jsx's hand-converted CSS positions were
 * derived directly from those exact values (see that file's "COORDINATE
 * CONVERSION" header comment) — removing the source numbers would orphan
 * the comment trail explaining where the CSS values came from.
 *
 * EVERYTHING ELSE in this file is UNCHANGED from v16: the desktop
 * satellite display (cup1-6 + cup6a/cup6b at their normal idlePos,
 * tRef/tMidRef/t2Ref-interpolated) and the post-scroll mobile single-
 * active-satellite behavior (whichever cup the active category maps to,
 * shown via the existing geometry-rebuild-on-threshold SatelliteCup
 * component) both still work exactly as before — neither of those was
 * ever part of scatterMode, so neither needed to change.
 *
 * ============================================================
 * (Everything below this point is preserved from v16, MINUS the
 * scatterMode/Particle additions described above.)
 * ============================================================
 *
 * CHANGES FROM V14 — V15 (cup-satellite scatter-mode plumbing,
 * RETAINED FOR HISTORY ONLY — scatterMode itself no longer exists in
 * this file as of v17 above; this section explains how the desktop/
 * post-scroll single-satellite system this file STILL uses came to be
 * separate from the (now-removed) scatter system in the first place):
 *
 * - Accepts a new `scatterMode` prop (boolean). When true, this
 *   overrides EVERYTHING below it: the four non-coffee, non-cup6 dish
 *   cups (cup1-cup4) render simultaneously at their `mobileScatterPos`
 *   positions from cupConfig.js (via resolveScatterGeometry()), instead
 *   of the single-active-satellite tRef/tMidRef/t2Ref blend. cup5 is
 *   excluded from the scatter render entirely — MainCupImage owns the
 *   centerpiece in scatter mode exactly as it does everywhere else, so
 *   there's never a duplicate coffee cup on screen.
 *
 *   This is for the pre-scroll mobile hero (see Hero.jsx/Hero.css):
 *   the four dish satellites + 12 atmosphere particles floating as
 *   ambient background around the headline + main cup, rather than the
 *   post-scroll "one satellite stands in for the active category"
 *   behavior. The two modes are mutually exclusive in practice —
 *   scatterMode is only ever true pre-scroll, when no category is
 *   active yet — so there's no frame where both position systems are
 *   trying to drive the same cup.
 *
 *   Opacity also bypasses the scroll-driven SAT_FADE_START/END fade in
 *   scatter mode: that fade exists to dismiss satellites as the menu
 *   panel takes over post-scroll, which doesn't apply pre-scroll.
 *   Instead each cup uses its own flat `mobileScatterOpacity`.
 *
 * CHANGES FROM v13 (carried forward into v14):
 *
 * - Accepts a new `t2Ref` prop (0 at viewport width >=700px, ramps to 1
 *   at width<=300px — see useResponsiveScale.js header). Forwarded to
 *   each SatelliteCup and passed as the second argument to
 *   resolveCupGeometry(cfg, tRef.current, t2Ref.current), so the
 *   cluster keeps tightening/scaling down continuously as the viewport
 *   shrinks past the old 700px floor instead of freezing at its 700px
 *   geometry. See cupConfig.js's resolveCupGeometry header for how the
 *   two blend factors compose.
 *
 * CHANGES FROM v12 (carried forward into v13):
 *
 * - Accepts a new `tRef` prop (0 = desktop, 1 = mobile), forwarded down
 *   to each SatelliteCup. Each frame, instead of reading cfg.idlePos /
 *   cfg.width / cfg.height directly, calls resolveCupGeometry(cfg,
 *   tRef.current) from cupConfig.js to get the viewport-interpolated
 *   position/size for that frame.
 *
 * - Geometry (planeGeometry width/height) can't be mutated after the
 *   mesh is created in three.js — args passed to <planeGeometry> only
 *   apply at construction. So unlike position (which is a simple
 *   imperative .set() in useFrame, same as before), width/height now
 *   need a geometry *replacement* when they change meaningfully. Doing
 *   that every frame for a continuous blend would constantly rebuild
 *   geometry — wasteful and the kind of thing that causes a visible
 *   stutter on slower devices.
 *
 *   Fix: read the resolved width/height each frame, but only call
 *   mesh.geometry.dispose() + reassign a new PlaneGeometry when the
 *   resolved size has changed by more than a small epsilon since the
 *   last frame (not on every frame regardless of delta). Resize events
 *   are inherently infrequent/coalesced already (useResponsiveScale
 *   only updates tRef once per rAF during an active resize, and is
 *   static the rest of the time), so this still feels continuous to
 *   the user while avoiding constant reallocation when t isn't
 *   actually changing (the overwhelmingly common case — most frames,
 *   nobody is resizing the window).
 *
 * Position interpolation (no geometry rebuild needed) and opacity/fade
 * logic are otherwise unchanged from v12.
 */
import { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, SRGBColorSpace, PlaneGeometry } from 'three';
import { CUP_CONFIGS, resolveCupGeometry } from './cupConfig';

// Satellites fade out between these scroll progress values
const SAT_FADE_START = 0.22;
const SAT_FADE_END   = 0.52;

// Only rebuild plane geometry if width/height drifted by more than this
// since the last rebuild — avoids per-frame geometry churn while a
// continuous resize is in progress.
const GEOMETRY_EPSILON = 0.01;

function SatelliteCup({ cfg, scrollProgress, texture, hidden, tRef, tMidRef, t2Ref }) {
  const matRef   = useRef(null);
  const groupRef = useRef(null);
  const meshRef  = useRef(null);
  const lastSize = useRef({ width: cfg.width, height: cfg.height });
  const baseOpacity = cfg.opacity ?? 1;

  useFrame(() => {
    const p = scrollProgress.current;
    const t   = tRef?.current    ?? 0;
    const tMid = tMidRef?.current ?? 0;
    const t2 = t2Ref?.current   ?? 0;
    const geo = resolveCupGeometry(cfg, t, t2, tMid);

    // Opacity: full → 0 between SAT_FADE_START and SAT_FADE_END
    if (matRef.current) {
      const fadeT   = Math.max(0, Math.min((p - SAT_FADE_START) / (SAT_FADE_END - SAT_FADE_START), 1));
      const opacity = hidden ? 0 : baseOpacity * (1 - fadeT);
      matRef.current.opacity = opacity;
    }

    // Position: always idle (interpolated desktop↔mobile) — no scatter
    if (groupRef.current) {
      groupRef.current.position.set(geo.idlePos[0], geo.idlePos[1], geo.idlePos[2]);
    }

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
          map={texture}
          transparent
          opacity={baseOpacity}
          alphaTest={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/*
 * Particle component and the scatterMode-driven `visibleConfigs` filter
 * that used to live here were REMOVED in v17 — see the file header for
 * the full rationale. The pre-scroll mobile background composition
 * (pizza/burger/cake/fries + 12 atmosphere particles) is now rendered
 * by BackgroundComposition.jsx as plain CSS-positioned <img> elements,
 * not by this file. SatelliteCups now ALWAYS renders the full
 * CUP_CONFIGS list (desktop satellite display + the post-scroll mobile
 * single-active-satellite swap) — there is no longer a scatter-specific
 * code path to branch into here.
 */
export default function SatelliteCups({ scrollProgress, activeCupId, onTexturesReady, tRef, tMidRef, t2Ref }) {
  const textures = useLoader(TextureLoader, CUP_CONFIGS.map((s) => s.url));

  textures.forEach((t) => {
    if (t.colorSpace !== SRGBColorSpace) t.colorSpace = SRGBColorSpace;
  });

  useEffect(() => {
    if (!onTexturesReady) return;
    const map = {};
    CUP_CONFIGS.forEach((cfg, i) => { map[cfg.id] = textures[i]; });
    onTexturesReady(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {CUP_CONFIGS.map((cfg, i) => (
        <SatelliteCup
          key={cfg.id}
          cfg={cfg}
          scrollProgress={scrollProgress}
          texture={textures[i]}
          hidden={cfg.id === activeCupId}
          tRef={tRef}
          tMidRef={tMidRef}
          t2Ref={t2Ref}
        />
      ))}
    </>
  );
}