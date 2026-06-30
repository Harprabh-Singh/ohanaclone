/*
 * HeroCanvas.jsx v10
 *
 * Adds `freezeCupsRef` prop: forwarded to Scene so that when the user
 * scrolls back to the top after picking a non-coffee category, the cups
 * can be held at their idle positions for one frame (no animation artifact)
 * before the reset to coffee completes.
 */

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import Scene from './Scene';

function detectQuality() {
  if (typeof navigator === 'undefined') return 'high';
  const cores  = navigator.hardwareConcurrency ?? 4;
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (mobile || cores <= 4) return 'low';
  return 'high';
}

export default function HeroCanvas({ mouse, scrollProgress, activeModelRef, freezeCupsRef }) {
  const quality = useMemo(() => detectQuality(), []);

  return (
    <Canvas
      dpr={[1, quality === 'high' ? 1.5 : 1]}
      camera={{
        position: [0, 0, 7.5],
        fov: 38,
        near: 0.05,
        far: 50,
      }}
      gl={{
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <Scene
          mouse={mouse}
          scrollProgress={scrollProgress}
          activeModelRef={activeModelRef}
          freezeCupsRef={freezeCupsRef}
        />
      </Suspense>
    </Canvas>
  );
}