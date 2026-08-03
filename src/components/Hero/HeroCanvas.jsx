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
  if (typeof navigator === 'undefined') return 'medium';
  const cores  = navigator.hardwareConcurrency ?? 4;
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;

  if (mobile || cores <= 4 || lowMemory) return 'low';
  return 'high';
}

export default function HeroCanvas({ mouse, scrollProgress, activeModelRef, freezeCupsRef }) {
  const quality = useMemo(() => detectQuality(), []);
  const dpr = quality === 'high' ? [1, 1.25] : [1, 1];
  const antialias = quality === 'high';

  return (
    <Canvas
      dpr={dpr}
      camera={{
        position: [0, 0, 7.5],
        fov: 38,
        near: 0.05,
        far: 50,
      }}
      gl={{
        antialias,
        alpha: true,
        powerPreference: quality === 'high' ? 'high-performance' : 'default',
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