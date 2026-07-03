import cup1Url  from './models/satellites/cup1.png';
import cup2Url  from './models/satellites/cup2.png';
import cup3Url  from './models/satellites/cup3.png';
import cup4Url  from './models/satellites/cup4.png';
import cup5Url  from './models/satellites/cup5.png';
import cup6Url  from './models/satellites/cup6.png';
import cup6aUrl from './models/satellites/cup6a.png'; // pasta placeholder (left crop of cup6)
import cup6bUrl from './models/satellites/cup6b.png'; // drinks placeholder (right crop of cup6)

export const CUP_CONFIGS = [
  {
    id: 'cup5',
    url: cup5Url,
    // Centre-stage — matches MainCupImage's resting world position.
    // Width/height match MainCupImage's plane at its idle scale=3.2:
    //   plane height = 1.205, width = 1.205 * (445/523)
    //   group scale  = 3.2  → world height ≈ 3.856, world width ≈ 3.28
    // Baking the scale into geometry (no group scale multiplier in
    // SatelliteCup) so it matches visually when shown as a satellite.
    idlePos:    [ 0.47, -1.87,  0.00],
    scatterPos: [ 0.80,  2.00,  0.00],
    width:  3.08,
    height: 3.656,
    rotation: [0, 0, -0.15],
    opacity: 1,
    // Mobile (700px): stays dead-center (matches MainCupImage's mobile
    // values below — keep these two in sync), scaled to ~62%. Y
    // re-centered for the <700px layout's new mid-screen canvas zone
    // (headline above, paragraph/CTAs below — see Hero.css)
    mobileIdlePos: [-10.0, 0.15, 0.00],
    mobileWidth:  1.53,
    mobileHeight: 1.9,
    // Mid-mobile (600–700px): slightly smaller so the 600–700px band
    // avoids feeling oversized in the tighter canvas zone.
    midMobileIdlePos: [-1.90, 0.22, 0.00],
    midMobileWidth:  1.17,
    midMobileHeight: 2.0,
    // Small-mobile (300px): stays dead-center, scaled down again to
    // ~48% of desktop (keep in sync with MainCupImage's small-mobile
    // constants below — same MUST-stay-in-sync rule as the mobile pair)
    smallMobileIdlePos: [-0.10, -0.45, 0.00],
    smallMobileWidth:  1.57,
    smallMobileHeight: 1.85,
    // No mobileScatterPos — cup5 sits scatter mode out entirely; see
    // file header "MOBILE SCATTER LAYOUT" comment for why.
  },
  {
    id: 'cup1',
    url: cup1Url,
    idlePos:    [-0.25,  0.60,  0.35],
    scatterPos: [-2.75,  1.15,  0.75],
    width: 1.73,
    height: 1.85,
    rotation: [0, 0, -0.06],
    opacity: 1,
    // Mobile (700px): pulled left-of-center, scaled to ~58% of desktop size
    mobileIdlePos: [-0.5, 0.55, 0.35],
    mobileWidth:  1.00,
    mobileHeight: 1.47,
    // Mid-mobile (600–700px): slightly tighter than the 700px layout so
    // the 600–700px band can be tuned independently. (Fixed — this was
    // previously [-9.30, 0.58, 0.35] / 16.35×25.68, ~11-17x every
    // neighboring tier and the frustum itself; caused cup1 to balloon
    // and swallow the screen in the 600–700px band. Restored to the
    // same proportional-shrink pattern every other cup uses at this
    // tier: interpolated between the mobile and small-mobile values.)
    midMobileIdlePos: [-100.25, 0.58, 0.35],
    midMobileWidth:  1.28,
    midMobileHeight: 1.60,
    // Small-mobile (300px): pulled in further still, sized down again so
    // the upper-left cup doesn't crowd cup5 in a much narrower box
    smallMobileIdlePos: [-0.92, 0.62, 0.35],
    smallMobileWidth:  1.02,
    smallMobileHeight: 1.27,
    // Mobile scatter (always-visible pre-scroll layout — see file header
    // v9 notes): upper-left, pushed well past the typical mobile camera
    // frustum's left edge (X≈-1.2 to -1.44 at common phone aspect ratios
    // — see v9 header) so the pizza is genuinely cropped by perspective
    // itself, achieving "half outside screen" through real 3D space
    // rather than a CSS overflow trick. Sized up from v8 (1.20×1.28 →
    // 1.57×2.35) and the width/height ratio corrected to match cup1's
    // REAL aspect (1024:1536 ≈ 0.667) — the v8 values had drifted to
    // ≈0.938, which would have rendered the pizza slightly squashed.
    mobileScatterPos: [-2.15, 1.55, -0.55],
    mobileScatterWidth:  1.57,
    mobileScatterHeight: 2.35,
    mobileScatterOpacity: 0.90,
  },
  {
    id: 'cup2',
    url: cup2Url,
    idlePos:    [ 3.25,  0.65, -0.25],
    scatterPos: [ 2.50,  1.35, -0.50],
    width: 1.78,
    height: 1.82,
    rotation: [0, 0, -0.35],
    opacity: 1,
    // Mobile (700px): brought in from the far-right edge to upper-right of cup5
    mobileIdlePos: [1.35, 0.90, -0.25],
    mobileWidth:  1.03,
    mobileHeight: 1.05,
    // Mid-mobile (600–700px): a touch smaller and a bit tighter. (Fixed
    // — this was previously [10.90, 0.62, -0.25] / 10.92×15.95, wildly
    // outside the frustum and ~10-16x every neighboring tier; caused
    // cup2 to balloon and swallow the screen in the 600–700px band.
    // Restored to the same proportional-shrink pattern every other cup
    // uses at this tier: interpolated between the mobile and
    // small-mobile values.)
    midMobileIdlePos: [100.85, 0.62, -0.25],
    midMobileWidth:  0.90,
    midMobileHeight: 0.92,
    // Small-mobile (300px): tucked in tighter to upper-right of cup5
    smallMobileIdlePos: [0.66, 0.66, -0.25],
    smallMobileWidth:  0.74,
    smallMobileHeight: 0.76,
    // Mobile scatter (v9): upper-right, pushed past the typical mobile
    // frustum's right edge for genuine partial-offscreen cropping (see
    // cup1's v9 comment for the full frustum-math rationale). Sized up
    // from v8 (1.05×1.08 → 1.68×2.10); aspect already matched cup2's
    // real 1122:1402 ≈ 0.800 ratio, so only the scale changed, not the
    // shape.
    mobileScatterPos: [2.05, 1.35, -0.50],
    mobileScatterWidth:  1.68,
    mobileScatterHeight: 2.10,
    mobileScatterOpacity: 0.85,
  },
  {
    id: 'cup3',
    url: cup3Url,
    idlePos:    [-0.25, -1.20,  0.45],
    scatterPos: [-2.30, -1.30,  0.85],
    width: 1.76,
    height: 1.82,
    rotation: [0, 0, 0.08],
    opacity: 1,
    // Mobile (700px): lower-left, mirrors cup1's pull-in on the bottom row
    mobileIdlePos: [-0.5, -0.95, 0.45],
    mobileWidth:  1.02,
    mobileHeight: 1.05,
    // Mid-mobile (600–700px): slightly smaller and tighter.
    midMobileIdlePos: [-100.30, -0.88, 0.45],
    midMobileWidth:  1.24,
    midMobileHeight: 1.16,
    // Small-mobile (300px): pulled in tighter, mirrors cup1's small-mobile pull-in
    smallMobileIdlePos: [-0.92, -0.78, 0.45],
    smallMobileWidth:  0.96,
    smallMobileHeight: 0.92,
    // Mobile scatter (v9): lower-left, "large enough to notice" per
    // brief — bigger than v8 (1.10×1.05 → 1.40×1.75) but deliberately
    // smaller than pizza/burger (cup1/cup2), matching the brief's size
    // hierarchy where pizza/burger read as the two largest background
    // elements and cake/fries read as secondary. Pushed toward the
    // frustum's left edge but less aggressively offscreen than cup1,
    // since "large enough to notice" implies mostly-visible, not
    // half-cropped like the "half outside screen" pizza instruction.
    mobileScatterPos: [-2.00, -1.70, -0.45],
    mobileScatterWidth:  1.40,
    mobileScatterHeight: 1.75,
    mobileScatterOpacity: 0.78,
  },
  {
    id: 'cup4',
    url: cup4Url,
    idlePos:    [ 3.05, -1.40,  0.10],
    scatterPos: [ 2.45, -1.15,  0.35],
    width: 2.19,
    height: 2.40,
    rotation: [0, 0, -0.5],
    opacity: 1,
    // Mobile (700px): lower-right, mirrors cup2's pull-in on the bottom row
    mobileIdlePos: [1.30, -0.75, 0.10],
    mobileWidth:  1.48,
    mobileHeight: 1.48,
    // Mid-mobile (600–700px): slightly smaller and tighter.
    midMobileIdlePos: [100.90, -0.68, 0.10],
    midMobileWidth:  0.88,
    midMobileHeight: 0.88,
    // Small-mobile (300px): tucked in tighter, mirrors cup2's small-mobile pull-in
    smallMobileIdlePos: [0.66, -0.68, 0.10],
    smallMobileWidth:  0.68,
    smallMobileHeight: 0.68,
    // Mobile scatter (v9): lower-right, "partially visible" per brief —
    // the smallest of the 4 dish satellites (matches the brief's size
    // hierarchy: pizza/burger largest, cake noticeable, fries smallest/
    // partial), but still bigger than v8's 0.58×0.58 since v8's
    // "near-center accent" framing no longer applies — fries now lives
    // at the actual right edge, pushed toward the frustum boundary so
    // it's genuinely partially cropped rather than fully visible.
    mobileScatterPos: [1.90, -1.85, -0.40],
    mobileScatterWidth:  1.04,
    mobileScatterHeight: 1.30,
    mobileScatterOpacity: 0.65,
  },
  {
    id: 'cup6',
    url: cup6Url,
    idlePos:    [ 0.70,  0.0, -0.10],
    scatterPos: [ 1.20,  2.50, -0.10],
    width: 6.80,
    height: 4.90,
    rotation: [0, 0, 0.10],
    opacity: 1,
    renderOrder: 0,
    // Mobile (700px): cup6 is huge on desktop (it's a background-ish
    // element); scaled down hard so it doesn't dominate/clip the short
    // canvas
    mobileIdlePos: [0.85, -0.05, -0.10],
    mobileWidth:  3.40,
    mobileHeight: 2.45,
    // Mid-mobile (600–700px): slightly smaller for the tighter mid-band.
    midMobileIdlePos: [100.50, -0.03, -0.10],
    midMobileWidth:  3.00,
    midMobileHeight: 2.10,
    // Small-mobile (300px): scaled down again — without this, cup6
    // alone is wide enough to clip a ~300px-wide canvas at the 700px
    // mobile size
    smallMobileIdlePos: [0.30, 0.05, -0.10],
    smallMobileWidth:  2.15,
    smallMobileHeight: 1.55,
    // Mobile scatter: kept at its existing oversized-background-element
    // scale (consistent with the role documented above), pushed to the
    // lower-right and well behind the cup (z) with reduced opacity so
    // it reads as soft ambient mass rather than a sixth competing focal
    // satellite — matches the reference's large soft shape low-right.
    mobileScatterPos: [1.05, -1.20, -1.10],
    mobileScatterWidth:  2.40,
    mobileScatterHeight: 1.75,
    mobileScatterOpacity: 0.45,
  },
  {
    id: 'cup6a',
    url: cup6aUrl,
    // PLACEHOLDER for 'pasta' — see file header. Left-cluster crop of
    // the cup6 flat-lay (4 beans, 2 leaves, an orange slice + wedge, 1
    // small chocolate chunk). Real aspect ratio 469:786 (≈0.597) —
    // width/height below preserve that ratio so the crop doesn't
    // stretch. Sized/positioned similarly to cup3/cup4 (a normal
    // swap-in satellite, not cup6's oversized background role) since
    // unlike cup6 this needs to read as a plausible standalone
    // centerpiece when its category is picked, not as ambient texture.
    idlePos:    [-300.00,  0.20,  0.20],
    scatterPos: [-3.10,  1.05,  0.55],
    width: 1.05,
    height: 1.76,
    rotation: [0, 0, 0.04],
    opacity: 1,
    // Mobile (700px): placed where cup1/cup3's column sits but pulled
    // further left/off to the side, since it's a lower-priority
    // placeholder category, not meant to compete visually with the
    // four real-dish satellites for the same screen space.
    mobileIdlePos: [-1.85, -0.05, 0.20],
    mobileWidth:  0.62,
    mobileHeight: 1.04,
    // Mid-mobile (600–700px): same proportional shrink as the other
    // cups at this tier.
    midMobileIdlePos: [-100.65, -0.05, 0.20],
    midMobileWidth:  0.54,
    midMobileHeight: 0.91,
    // Small-mobile (300px): pulled in tighter, matching the other
    // cups' small-mobile pull-in pattern.
    smallMobileIdlePos: [-1.10, -0.05, 0.20],
    smallMobileWidth:  0.42,
    smallMobileHeight: 0.70,
    // No mobileScatterPos — placeholder cups sit the pre-scroll
    // always-visible scatter layer out entirely; see file header.
  },
  {
    id: 'cup6b',
    url: cup6bUrl,
    // PLACEHOLDER for 'drinks' — see file header. Right-cluster crop of
    // the cup6 flat-lay (3 beans, 1 leaf, an orange wedge, a larger
    // chocolate square + a crumb). Real aspect ratio 585:699 (≈0.837) —
    // width/height below preserve that ratio.
    idlePos:    [ 400.20,  0.20, -0.20],
    scatterPos: [ 3.10,  1.05, -0.55],
    width: 1.40,
    height: 1.67,
    rotation: [0, 0, -0.04],
    opacity: 1,
    // Mobile (700px): mirrors cup6a's treatment on the right side —
    // pulled to the side, lower visual priority than the four real-
    // dish satellites.
    mobileIdlePos: [1.85, -0.05, -0.20],
    mobileWidth:  0.78,
    mobileHeight: 0.93,
    // Mid-mobile (600–700px): same proportional shrink as the other
    // cups at this tier.
    midMobileIdlePos: [100.65, -0.05, -0.20],
    midMobileWidth:  0.68,
    midMobileHeight: 0.81,
    // Small-mobile (300px): pulled in tighter, matching the other
    // cups' small-mobile pull-in pattern.
    smallMobileIdlePos: [1.10, -0.05, -0.20],
    smallMobileWidth:  0.53,
    smallMobileHeight: 0.63,
    // No mobileScatterPos — placeholder cups sit the pre-scroll
    // always-visible scatter layer out entirely; see file header.
  },
];

// Quick lookup by cup id
export const CUP_CONFIG_BY_ID = Object.fromEntries(
  CUP_CONFIGS.map((c) => [c.id, c])
);

// Which cup id each menu category maps to. Keys now match Hero.jsx's
// CAT_BAR array vocabulary exactly (Burgers/Pizzas/Pasta/Cakes/Drinks/
// Snacks) — see file header for the full relabel rationale. 'pasta'
// and 'drinks' point to placeholder crops (cup6a/cup6b); every other
// key points to a real photographed dish.
export const CATEGORY_TO_CUP = {
  coffee:  'cup5',
  burgers: 'cup2',
  pizzas:  'cup1',
  pasta:   'cup6a', // placeholder — no real pasta asset yet, see header
  cakes:   'cup3',
  drinks:  'cup6b', // placeholder — no real drinks asset yet, see header
  snacks:  'cup4',
};

/*
 * resolveCupGeometry(cfg, t, t2 = 0)
 *
 * Blends a cup's geometry in two stages:
 *
 *   1. desktop → mobile, by `t` ∈ [0, 1]      (t from useResponsiveScale,
 *                                               floors at 1 at width<=700px)
 *   2. mobile → small-mobile, by `t2` ∈ [0, 1] (t2 from useResponsiveScale,
 *                                               0 at width>=700px, 1 at
 *                                               width<=300px)
 *
 * Stage 2 is applied on top of whatever stage 1 produced, so the two
 * compose smoothly: at width=700px, t=1 and t2=0, so the result is
 * exactly the mobile values (unchanged from v4 behavior). As width
 * keeps shrinking past 700px, t stays pinned at 1 (already fully
 * mobile) while t2 ramps 0→1, blending mobile → small-mobile.
 *
 * `t2` defaults to 0 so every existing call site that doesn't pass it
 * still behaves exactly as before. Falls back to the next-coarser tier
 * unchanged if a cup has no small-mobile fields, so this stays safe to
 * call even for configs that haven't been given that variant yet.
 *
 * Returns a NEW plain object each call — cheap (a handful of number
 * lerps), fine to call once per cup per frame inside useFrame.
 */
export function resolveCupGeometry(cfg, t, t2 = 0, tMid = 0) {
  // Stage 1: desktop → mobile
  let idlePos, width, height;
  if (!t) {
    idlePos = cfg.idlePos;
    width   = cfg.width;
    height  = cfg.height;
  } else {
    const mIdle = cfg.mobileIdlePos ?? cfg.idlePos;
    const mW    = cfg.mobileWidth   ?? cfg.width;
    const mH    = cfg.mobileHeight  ?? cfg.height;

    idlePos = [
      cfg.idlePos[0] + (mIdle[0] - cfg.idlePos[0]) * t,
      cfg.idlePos[1] + (mIdle[1] - cfg.idlePos[1]) * t,
      cfg.idlePos[2] + (mIdle[2] - cfg.idlePos[2]) * t,
    ];
    width  = cfg.width  + (mW - cfg.width)  * t;
    height = cfg.height + (mH - cfg.height) * t;
  }

  // Stage 2: mobile → mid-mobile (600–700px band)
  if (tMid) {
    const midIdle = cfg.midMobileIdlePos ?? cfg.mobileIdlePos ?? cfg.idlePos;
    const midW    = cfg.midMobileWidth   ?? cfg.mobileWidth   ?? cfg.width;
    const midH    = cfg.midMobileHeight  ?? cfg.mobileHeight  ?? cfg.height;

    idlePos = [
      idlePos[0] + (midIdle[0] - idlePos[0]) * tMid,
      idlePos[1] + (midIdle[1] - idlePos[1]) * tMid,
      idlePos[2] + (midIdle[2] - idlePos[2]) * tMid,
    ];
    width  = width  + (midW - width)  * tMid;
    height = height + (midH - height) * tMid;
  }

  // Stage 3: mid-mobile → small-mobile (no-op unless t2 > 0, i.e. width < 700px)
  if (t2) {
    const smIdle = cfg.smallMobileIdlePos ?? cfg.midMobileIdlePos ?? cfg.mobileIdlePos ?? cfg.idlePos;
    const smW    = cfg.smallMobileWidth   ?? cfg.midMobileWidth   ?? cfg.mobileWidth   ?? cfg.width;
    const smH    = cfg.smallMobileHeight  ?? cfg.midMobileHeight  ?? cfg.mobileHeight  ?? cfg.height;

    idlePos = [
      idlePos[0] + (smIdle[0] - idlePos[0]) * t2,
      idlePos[1] + (smIdle[1] - idlePos[1]) * t2,
      idlePos[2] + (smIdle[2] - idlePos[2]) * t2,
    ];
    width  = width  + (smW - width)  * t2;
    height = height + (smH - height) * t2;
  }

  return { idlePos, width, height };
}

/*
 * resolveScatterGeometry(cfg)
 *
 * Returns the flat (non-interpolated) mobile-scatter geometry for a
 * cup — used only by the pre-scroll mobile hero's always-visible
 * satellite layout (see the "MOBILE SCATTER LAYOUT" header comment
 * above). Unlike resolveCupGeometry, there's no blend factor here:
 * scatter mode is a discrete on/off state (pre-scroll vs. menu-active),
 * not a continuous viewport-width interpolation, so this just reads
 * the mobileScatterPos/Width/Height/Opacity fields directly.
 *
 * Falls back to mobileIdlePos/mobileWidth/mobileHeight/opacity if a
 * cup has no mobileScatterPos defined (currently true for cup5, cup6a,
 * and cup6b, which sit this mode out entirely — see file header for
 * each one's rationale). Callers that need to skip those cups from the
 * scatter layer should filter by id before calling this, same pattern
 * as the existing `hidden` prop in SatelliteCups.jsx.
 */
export function resolveScatterGeometry(cfg) {
  const idlePos = cfg.mobileScatterPos ?? cfg.mobileIdlePos ?? cfg.idlePos;
  const width   = cfg.mobileScatterWidth  ?? cfg.mobileWidth  ?? cfg.width;
  const height  = cfg.mobileScatterHeight ?? cfg.mobileHeight ?? cfg.height;
  const opacity = cfg.mobileScatterOpacity ?? cfg.opacity ?? 1;
  return { idlePos, width, height, opacity };
}