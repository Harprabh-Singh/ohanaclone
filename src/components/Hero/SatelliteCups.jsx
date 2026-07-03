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