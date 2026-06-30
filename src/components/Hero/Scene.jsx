/*
 * Scene.jsx v21
 *
 * CHANGES FROM v20 — scatterMode removed:
 *
 * SatelliteCups.jsx v17 no longer accepts or uses a `scatterMode` prop
 * (the pre-scroll mobile "dishes + particles as background" composition
 * moved to BackgroundComposition.jsx as plain CSS-positioned <img>
 * elements — see that file's header). `SatelliteCupsWrapper` below no
 * longer computes scatterMode, no longer holds it in state, and no
 * longer passes it down. `SCATTER_RESET_THRESHOLD` is removed along
 * with it — it had no other purpose.
 *
 * Everything else in this file — the shared tRef/tMidRef/t2Ref from
 * useResponsiveScale(), the activeCupId tracking, CenterpieceRenderer's
 * coffee/category-swap logic — is unchanged from v20, since none of
 * that was ever part of the scatter system.
 *
 * ============================================================
 * (Everything below this point is preserved from v20.)
 * ============================================================
 *
 * CHANGES FROM v19:
 *
 * - SatelliteCupsWrapper now also computes `scatterMode` each frame:
 *   true when the viewport is at/below the 700px mobile floor (tRef.
 *   current >= 1 — desktop never scatters) AND scrollProgress is still
 *   near zero (pre-scroll, no category picked yet). Stored in state the
 *   same way activeCupId already is, so it only triggers a re-render
 *   when the boolean actually flips, not every frame. Threaded down to
 *   SatelliteCups, which uses it to switch from the single-active-
 *   satellite layout to the always-visible mobile scatter layout (see
 *   SatelliteCups.jsx v15 / cupConfig.js's resolveScatterGeometry).
 *
 *   SCATTER_RESET_THRESHOLD intentionally matches Hero.jsx's own
 *   RESET_THRESHOLD (0.08) — both exist to answer "are we still
 *   effectively at the top," so keeping them equal means the satellite
 *   scatter layer disappears at the same scroll position where Hero.jsx
 *   would also be triggering its own back-to-coffee reset, rather than
 *   the two thresholds drifting apart and creating a window where one
 *   system thinks we're "at the top" and the other doesn't.
 *
 * CHANGES FROM v18 (carried forward into v19):
 *
 * - useResponsiveScale() now also returns t2Ref (the mobile↔small-mobile
 *   blend factor for the 700px→300px range — see useResponsiveScale.js
 *   header for the full rationale). t2Ref is threaded down alongside
 *   tRef to the same three consumers (MainCupImage, SatelliteCups,
 *   ActiveCupImage), same lockstep rationale as tRef below — computed
 *   once here so all three read the same t2 on the same resize tick.
 *
 * CHANGES FROM v17 (carried forward into v18):
 *
 * - Added useResponsiveScale(): computes a single shared tRef (0 =
 *   desktop, 1 = mobile geometry blend) once at the Scene level, then
 *   passes tRef down to MainCupImage, SatelliteCupsWrapper/SatelliteCups,
 *   and CenterpieceRenderer/ActiveCupImage. Computing it once here
 *   (rather than each consumer calling the hook independently) means
 *   all three stay in lockstep on the same resize tick — no risk of
 *   e.g. the main cup and satellites reading slightly different t
 *   values one rAF apart.
 *
 * - tRef (not the plain `t` number) is what gets threaded through,
 *   since all three consumers read it inside useFrame and a ref avoids
 *   re-render churn / stale closures there. The plain `t` value isn't
 *   needed anywhere in this tree right now, so it's left unused.
 *
 * Everything else carried over unchanged from v17.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, useState, Suspense, useCallback } from 'react';
import { Environment } from '@react-three/drei';
import CameraRig from './CameraRig';
import Lights from './Lights';
import MainCupImage from './MainCupImage';
import ActiveCupImage from './ActiveCupImage';
import SatelliteCups from './SatelliteCups';
import useResponsiveScale from './useResponsiveScale';
import { CATEGORY_TO_CUP, CUP_CONFIG_BY_ID } from './cupConfig';

export default function Scene({ mouse, scrollProgress, activeModelRef, freezeCupsRef }) {
  const activeCupIdRef = useRef('cup5');
  const textureMapRef  = useRef({});        // id → THREE.Texture
  const { tRef, tMidRef, t2Ref } = useResponsiveScale(); // tRef: 0=desktop,1=mobile (floors at 700px)
                                                         // tMidRef: 0 at 700px, 1 at 600px (mid-mobile 600–700px band)
                                                         // t2Ref: 0 at 700px, 1 at 300px (mobile→small-mobile)

  const handleTexturesReady = useCallback((map) => {
    textureMapRef.current = map;
  }, []);

  return (
    <>
      <Environment preset="apartment" />
      <Lights />
      <CameraRig mouse={mouse} scrollProgress={scrollProgress} />

      {/* SatelliteCups suspends once on load (TextureLoader), then
          fires onTexturesReady with the full id→texture map. */}
      <Suspense fallback={null}>
        <SatelliteCupsWrapper
          scrollProgress={scrollProgress}
          activeCupIdRef={activeCupIdRef}
          onTexturesReady={handleTexturesReady}
          tRef={tRef}
          tMidRef={tMidRef}
          t2Ref={t2Ref}
        />
      </Suspense>

      {/* CenterpieceRenderer does NOT suspend — ActiveCupImage gets its
          texture passed as a prop, so no useLoader inside it. */}
      <CenterpieceRenderer
        scrollProgress={scrollProgress}
        activeModelRef={activeModelRef}
        activeCupIdRef={activeCupIdRef}
        textureMapRef={textureMapRef}
        freezeCupsRef={freezeCupsRef}
        tRef={tRef}
        tMidRef={tMidRef}
        t2Ref={t2Ref}
      />
    </>
  );
}

function SatelliteCupsWrapper({ scrollProgress, activeCupIdRef, onTexturesReady, tRef, tMidRef, t2Ref }) {
  const [activeCupId, setActiveCupId] = useState('cup5');

  useFrame(() => {
    if (activeCupIdRef.current !== activeCupId) {
      setActiveCupId(activeCupIdRef.current);
    }
  });

  return (
    <SatelliteCups
      scrollProgress={scrollProgress}
      activeCupId={activeCupId}
      onTexturesReady={onTexturesReady}
      tRef={tRef}
      tMidRef={tMidRef}
      t2Ref={t2Ref}
    />
  );
}

function CenterpieceRenderer({ scrollProgress, activeModelRef, activeCupIdRef, textureMapRef, freezeCupsRef, tRef, tMidRef, t2Ref }) {
  const [modelId, setModelId] = useState('coffee');
  const lastModel = useRef('coffee');

  useFrame(() => {
    const current = activeModelRef?.current ?? 'coffee';
    if (current !== lastModel.current) {
      lastModel.current = current;
      setModelId(current);
      activeCupIdRef.current = CATEGORY_TO_CUP[current] ?? 'cup5';
    }
  });

  if (modelId === 'coffee') {
    return <MainCupImage scrollProgress={scrollProgress} freezeCupsRef={freezeCupsRef} tRef={tRef} tMidRef={tMidRef} t2Ref={t2Ref} />;
  }

  const cupId  = CATEGORY_TO_CUP[modelId];
  const cupCfg = cupId ? CUP_CONFIG_BY_ID[cupId] : null;
  const texture = cupId ? textureMapRef.current[cupId] : null;

  if (!cupCfg) {
    return <MainCupImage scrollProgress={scrollProgress} freezeCupsRef={freezeCupsRef} tRef={tRef} tMidRef={tMidRef} t2Ref={t2Ref} />;
  }

  // texture may be null if onTexturesReady hasn't fired yet —
  // ActiveCupImage handles that gracefully (renders invisible).
  return (
    <ActiveCupImage
      cfg={cupCfg}
      texture={texture}
      scrollProgress={scrollProgress}
      tRef={tRef}
      tMidRef={tMidRef}
      t2Ref={t2Ref}
    />
  );
}