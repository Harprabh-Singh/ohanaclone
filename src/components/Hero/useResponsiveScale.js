/*
 * useResponsiveScale.js v3
 *
 * CHANGES FROM v2:
 *
 * The cup geometry now needs a dedicated third blend for the 600–700px
 * band. The previous setup only had desktop→mobile (t) and then a
 * smaller-phone ramp (t2), so the 600–700px range collapsed into the
 * same 700px-tuned mobile values. This adds a mid-mobile tier that
 * ramps from 0 at 700px to 1 at 600px so the cups can be tuned for that
 * band explicitly before the existing mobile→small-mobile blend takes
 * over below 600px.
 */
import { useEffect, useRef, useState } from 'react';

const DESKTOP_MIN = 1000; // t = 0 at and above this width
const MOBILE_MAX  = 700;  // t = 1 at and below this width (desktop↔mobile blend ends here)
const MID_MIN      = 600;  // tMid = 1 at and below this width (mid-mobile band ends here)
const SMALL_MIN    = 300;  // t2 = 1 at and below this width (mobile↔small-mobile blend ends here)

export function computeT(width) {
  if (width >= DESKTOP_MIN) return 0;
  if (width <= MOBILE_MAX) return 1;
  return (DESKTOP_MIN - width) / (DESKTOP_MIN - MOBILE_MAX);
}

// Mid-mobile blend: 0 at/above 700px, ramps linearly to 1 at/below 600px.
// This gives the 600–700px band its own geometry tier before the
// existing small-mobile blend continues below 600px.
export function computeTMid(width) {
  if (width >= MOBILE_MAX) return 0;
  if (width <= MID_MIN) return 1;
  return (MOBILE_MAX - width) / (MOBILE_MAX - MID_MIN);
}

// Small-mobile blend: 0 at/above 700px, ramps linearly to 1 at/below 300px.
// Applied on top of the mid-mobile tier once the viewport is already below 700px.
export function computeT2(width) {
  if (width >= MOBILE_MAX) return 0;
  if (width <= SMALL_MIN) return 1;
  return (MOBILE_MAX - width) / (MOBILE_MAX - SMALL_MIN);
}

export default function useResponsiveScale() {
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : DESKTOP_MIN;

  const tRef    = useRef(computeT(initialWidth));
  const tMidRef = useRef(computeTMid(initialWidth));
  const t2Ref   = useRef(computeT2(initialWidth));
  const [t, setT]       = useState(tRef.current);
  const [tMid, setTMid] = useState(tMidRef.current);
  const [t2, setT2]     = useState(t2Ref.current);
  const rafId = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const update = () => {
      rafId.current = null;
      const width = window.innerWidth;
      const nextT    = computeT(width);
      const nextTMid = computeTMid(width);
      const nextT2   = computeT2(width);
      tRef.current    = nextT;
      tMidRef.current = nextTMid;
      t2Ref.current   = nextT2;
      setT(nextT);
      setTMid(nextTMid);
      setT2(nextT2);
    };

    const onResize = () => {
      // Coalesce: only one computation per animation frame, no matter
      // how many resize events fire in between.
      if (rafId.current != null) return;
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener('resize', onResize, { passive: true });
    // Also handle orientation change explicitly — some mobile browsers
    // don't fire `resize` reliably on rotation alone.
    window.addEventListener('orientationchange', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { t, tRef, tMid, tMidRef, t2, t2Ref };
}