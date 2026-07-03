/*
 * BackgroundComposition.jsx v1
 *
 * NEW FILE — replaces the Three.js scatter-mode rendering of cup1-4
 * (pizza/burger/cake/fries) and the 12 PARTICLE_CONFIGS atmosphere
 * pieces with plain <img> elements, absolutely positioned by CSS.
 *
 * WHY THIS EXISTS:
 * The coffee cup (cup5) is the only element that genuinely needs to be
 * a 3D animation — it has its own GSAP-driven scroll rise/scale/dock
 * behavior in MainCupImage.jsx/ActiveCupImage.jsx. Pizza/burger/cake/
 * fries/particles never had any animation of their own beyond sitting
 * in fixed scatter positions pre-scroll (see SatelliteCups.jsx's old
 * `scatterMode` branch) — they were paying the cost of being Three.js
 * meshes (texture loading through Suspense, per-frame geometry-rebuild-
 * on-threshold logic, sharing the canvas's GPU/draw-call budget with
 * the cup) for zero animation benefit. Moving them to plain <img> tags
 * means: no texture loading/Suspense wait before they're visible, no
 * canvas draw-call cost, ordinary CSS z-index layering against the text
 * (precise, doesn't need camera-frustum math to reason about what's
 * "in front of" what), and no risk of competing with cup5's own
 * frustum/perspective math for screen space.
 *
 * Three.js's canvas (HeroCanvas.jsx → Scene.jsx) now renders ONLY
 * cup5 — MainCupImage for the coffee centerpiece, or ActiveCupImage
 * for whichever category was clicked. SatelliteCups.jsx's scatterMode
 * prop/rendering and the cup1-4 CUP_CONFIGS scatter fields and the
 * entire particleConfig.js module are no longer read by the 3D scene;
 * this component is now their only consumer (see header notes in
 * SatelliteCups.jsx for what was removed there).
 *
 * COORDINATE CONVERSION (Three.js world units → CSS %/vh):
 * The values below were NOT re-eyeballed — they're a direct, derived
 * conversion of the exact same hand-designed composition that was
 * already verified against the camera frustum in particleConfig.js v2
 * and cupConfig.js's mobileScatterPos fields. The conversion: the
 * camera's frustum half-height at world-z=0 is
 * `(cameraZ - planeZ) * tan(fov/2)` ≈ 2.582 units (fov=38°, cameraZ=
 * 7.5 — see CameraRig.jsx/HeroCanvas.jsx). That maps to 50% of
 * viewport height in CSS terms, used as a single, consistent
 * world-unit→vh conversion factor for x, y, width, and height alike
 * (so aspect ratios and relative spacing are preserved exactly, not
 * re-derived per-axis):
 *
 *   left%  = 50 + (worldX / 2.582) * 50
 *   top%   = 50 - (worldY / 2.582) * 50   (Three.js +Y is up, CSS top grows down)
 *   width  = (worldWidth  / (2 * 2.582)) * 100,  in vh units
 *   height = (worldHeight / (2 * 2.582)) * 100,  in vh units
 *
 * This intentionally ignores each item's individual Z depth (the
 * conversion uses the z=0 frustum slice as a flat reference plane) —
 * a flat 2D composition doesn't have real per-item perspective the way
 * the Three.js version did, so Z no longer changes apparent scale.
 * Instead, Z is repurposed as a z-index/blur hint only (see
 * `--oh5-depth` below): items that were further from the camera
 * (more negative Z) now render with a touch of CSS blur and sit at a
 * lower z-index than items that were closer (positive Z) — a crude
 * but real stand-in for the depth-of-field effect the original brief
 * asked for, which is now actually achievable cheaply in CSS in a way
 * it wasn't in the previous Three.js/meshBasicMaterial setup (see
 * Lights.jsx — meshBasicMaterial is unlit/unblurred by design, real
 * blur there would've needed a post-process pass; here it's one CSS
 * filter property per <img>).
 *
 * ONLY RENDERED ON MOBILE (<700px), matching the prior scatterMode
 * gating: desktop's category-swap satellite system (cupConfig.js's
 * desktop idlePos/scatterPos, ActiveCupImage) and the pre-scroll-only
 * condition are unchanged and still live entirely in Three.js — this
 * component doesn't touch that path at all. Visibility is handled in
 * Hero.css via the same <700px breakpoint + a scroll-progress-driven
 * opacity fade (see Hero.jsx's onUpdate, which now also writes
 * `--oh5-bg-opacity` alongside the existing text/panel fades) so the
 * composition disappears once the user scrolls into the menu, exactly
 * matching the old scatterMode's pre-scroll-only behavior.
 */

import cup1Url from './models/satellites/cup1.png';
import cup2Url from './models/satellites/cup2.png';
import cup3Url from './models/satellites/cup3.png';
import cup4Url from './models/satellites/cup4.png';

import p01Url from './models/satellites/particles/p01.png';
import p02Url from './models/satellites/particles/p02.png';
import p03Url from './models/satellites/particles/p03.png';
import p04Url from './models/satellites/particles/p04.png';
import p05Url from './models/satellites/particles/p05.png';
import p06Url from './models/satellites/particles/p06.png';
import p07Url from './models/satellites/particles/p07.png';
import p08Url from './models/satellites/particles/p08.png';
import p09Url from './models/satellites/particles/p09.png';
import p10Url from './models/satellites/particles/p10.png';
import p11Url from './models/satellites/particles/p11.png';
import p12Url from './models/satellites/particles/p12.png';

/*
 * Each entry: left/top in % (viewport-relative, see conversion above),
 * width/height in vh units (a CSS string, not a number, since these
 * are written straight into inline style), opacity, and `depth` — the
 * original Three.js Z value, kept only as a blur/z-index hint (see
 * file header). alt text is descriptive but the whole layer is
 * aria-hidden at the wrapper level (this is decorative background
 * imagery, not informational content — see the wrapper's aria-hidden
 * below), so alt is belt-and-suspenders for any tooling that inspects
 * DOM content regardless of aria-hidden.
 */
const DISH_ITEMS = [
  { id: 'cup1', url: cup1Url, alt: 'Pizza',  left: 80.37,  top: 19.99, width: 30.40, height: 45.50, opacity: 0.90, depth: -0.55 },
  { id: 'cup2', url: cup2Url, alt: 'Burger', left: 89.69, top: 23.86, width: 32.53, height: 40.66, opacity: 0.85, depth: -0.50 },
  { id: 'cup3', url: cup3Url, alt: 'Cake',   left: 11.28, top: 82.91, width: 27.11, height: 33.88, opacity: 0.78, depth: -0.45 },
  { id: 'cup4', url: cup4Url, alt: 'Fries',  left: 86.79, top: 85.82, width: 20.14, height: 25.17, opacity: 0.65, depth: -0.40 },
];

const PARTICLE_ITEMS = [
  { id: 'p01', url: p01Url, alt: '', left: 36.45, top:  9.34, width: 6.91, height: 6.80, opacity: 0.50, depth: -0.85 },
  { id: 'p08', url: p08Url, alt: '', left: 60.65, top:  7.40, width: 4.03, height: 4.26, opacity: 0.55, depth: -0.55 },
  { id: 'p12', url: p12Url, alt: '', left: 50.97, top:  3.53, width: 2.75, height: 2.67, opacity: 0.50, depth: -0.30 },
  { id: 'p04', url: p04Url, alt: '', left: 72.27, top: 12.25, width: 3.49, height: 3.31, opacity: 0.42, depth: -1.15 },
  { id: 'p07', url: p07Url, alt: '', left: 23.86, top: 29.67, width: 3.29, height: 3.00, opacity: 0.38, depth: -1.30 },
  { id: 'p02', url: p02Url, alt: '', left: 72.27, top: 41.29, width: 6.68, height: 6.62, opacity: 0.48, depth: -0.65 },
  { id: 'p05', url: p05Url, alt: '', left: 66.46, top: 55.81, width: 3.83, height: 3.60, opacity: 0.62, depth:  0.55 },
  { id: 'p09', url: p09Url, alt: '', left: 34.51, top: 51.94, width: 2.79, height: 3.25, opacity: 0.58, depth:  0.50 },
  { id: 'p03', url: p03Url, alt: '', left: 39.35, top: 70.33, width: 5.54, height: 5.17, opacity: 0.45, depth: -0.70 },
  { id: 'p06', url: p06Url, alt: '', left: 61.62, top: 72.27, width: 5.96, height: 5.54, opacity: 0.48, depth: -0.80 },
  { id: 'p10', url: p10Url, alt: '', left: 75.17, top: 62.58, width: 2.58, height: 2.79, opacity: 0.38, depth: -1.05 },
  { id: 'p11', url: p11Url, alt: '', left: 21.93, top: 60.65, width: 4.88, height: 3.81, opacity: 0.40, depth: -1.20 },
];

/*
 * blurFor(depth) — small, deliberately subtle CSS blur for items
 * pushed furthest from the camera in the original composition. Capped
 * low (max ~1.1px) because these are already small images; visible
 * blur on a 3-7vh image reads as "broken image" rather than "soft
 * depth of field" past a very small radius. Items at/above depth=0
 * (the two closest particles, p05/p09) get zero blur — they were the
 * "sharpest" items in the original Z-depth design intent.
 */
function blurFor(depth) {
  if (depth >= 0) return 0;
  const t = Math.min(-depth / 1.3, 1); // 0 (near) → 1 (furthest, depth=-1.3)
  return +(t * 1.1).toFixed(2);
}

// `data-id` on the <img> (added for the 600–700px layout pass) lets
// Hero.css target individual dish items with breakpoint-scoped
// overrides (e.g. repositioning cup1-4 for a tighter/looser frame
// around the cup at a specific width) without touching the shared
// left/top/width/height numbers above, which still drive every other
// sub-700px tier.
function BgImage({ item }) {
  const blur = blurFor(item.depth);
  const left = `var(--oh4-edit-image-${item.id}-left, ${item.left}%)`;
  const top = `var(--oh4-edit-image-${item.id}-top, ${item.top}%)`;
  const width = `var(--oh4-edit-image-${item.id}-width, ${item.width}vh)`;
  const height = `var(--oh4-edit-image-${item.id}-height, ${item.height}vh)`;

  return (
    <img
      src={item.url}
      alt={item.alt}
      className="oh5-bg-item"
      data-id={item.id}
      style={{
        left,
        top,
        width,
        height,
        opacity: item.opacity,
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        zIndex: Math.round((item.depth + 1.5) * 10), // more negative depth → lower z-index
      }}
      draggable={false}
      loading="lazy"
    />
  );
}

export default function BackgroundComposition() {
  return (
    <div className="oh5-bg-composition" aria-hidden="true">
      {DISH_ITEMS.map((item) => (
        <BgImage key={item.id} item={item} />
      ))}
      {PARTICLE_ITEMS.map((item) => (
        <BgImage key={item.id} item={item} />
      ))}
    </div>
  );
}