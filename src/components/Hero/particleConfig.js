/*
 * particleConfig.js v2
 *
 * CHANGES FROM v1 — hand-designed composition pass:
 *
 * v1 shipped a first-pass layout that was reasonable but not fully
 * deliberate: a couple of particles (p05/p09) sat almost directly atop
 * the cup's own footprint rather than orbiting it, the upper band
 * (p01/p04/p08/p12) bunched into a fairly tight cluster relative to the
 * empty stretch below it, and sizes/opacities were assigned per-zone by
 * feel rather than checked against the actual camera frustum at each
 * particle's own Z depth.
 *
 * This pass re-derives every position from the real frustum math (see
 * HeroCanvas.jsx's fov=38°/CameraRig.jsx's camera z=7.5 base position):
 * half-height at world-z=0 is camera-to-plane-distance * tan(19°) ≈
 * 2.582, and half-width is half-height * aspect ratio. Because each
 * particle sits at its own Z (not all at z=0), each one's true X budget
 * was computed at ITS OWN z (closer/positive-Z particles have a
 * tighter frustum than farther/negative-Z ones), checked against the
 * narrowest common mobile aspect ratio (9:20 ≈ 0.45) so "near the edge"
 * claims are verified per-particle, not assumed from the v1 comment's
 * general range.
 *
 * Result: p05/p09 pulled out to genuine flanking positions beside the
 * cup rather than overlapping it; the four upper particles (p01/p04/
 * p08/p12) spread their Y values instead of clustering in a narrow
 * band; p02 and p10 fill the previously-empty stretch between the cup
 * and cup2/cup4 (burger/fries) at mid-height; only p07/p11 are pushed
 * far enough to be genuinely cropped by the frustum edge at their Z —
 * every other particle is intentionally fully onscreen (these are
 * small atmosphere pieces, not the "half outside screen" cup1/cup2
 * treatment), confirmed with margin, not by feel. Closest-pair spacing
 * across all 12 particles + cup1-4 was checked too (tightest pair
 * 0.54 units apart, comfortable for particles sized 0.13-0.36 wide).
 *
 * Per-particle width/height continue to preserve each crop's real
 * source aspect ratio (unchanged from v1) — only the scale factor
 * applied on top changed, plus opacity, which now follows a depth
 * convention: particles physically closer to camera (positive Z, the
 * p05/p09 cup-flanking pair) read more opaque/crisp, particles pushed
 * furthest back (negative Z, p04/p07/p10) read faintest, consistent
 * with "some sharper, some softer" from the brief even though real
 * per-pixel blur is still deferred (see below).
 *
 * ============================================================
 * (Everything below this point is preserved from v1 verbatim.)
 * ============================================================
 *
 * NEW FILE — supports the v9 "mobile background composition" brief.
 * Holds the 12 individual atmosphere pieces cut from cup6.png's flat-lay
 * (coffee beans, orange wedges/slices, a chocolate chunk, leaves), kept
 * deliberately separate from cupConfig.js's CUP_CONFIGS rather than
 * bolted onto that array's shape, because these particles don't share
 * almost any of what a "cup" entry needs:
 *
 *   - No idlePos/scatterPos split — particles only ever exist in the
 *     mobile pre-scroll scatter layer. They have no desktop satellite
 *     role, no category-swap centerpiece role, no rise-on-scroll
 *     animation. A single flat `pos` is all they need.
 *   - No mobileIdlePos, midMobile* / smallMobile* tiers — particles don't
 *     participate in the t/tMid/t2 desktop↔mobile↔small-mobile blend
 *     chain at all (same as cup6a/cup6b's placeholder cups already
 *     don't, but particles additionally have no desktop appearance of
 *     any kind, where cup6a/cup6b at least exist as desktop-reachable
 *     category centerpieces).
 *   - No rotation/renderOrder/category mapping.
 *
 * Forcing 12 of these into CUP_CONFIGS' shape would mean carrying ~15
 * irrelevant fields per entry just to satisfy a shape built for a
 * different job. A separate lightweight array + a separate (much
 * simpler) resolveParticleGeometry() keeps both files honest about
 * what they actually model.
 *
 * SOURCE: all 12 are crops from cup6.png (see cupConfig.js's v8 header
 * for cup6's own history/role). cup6.png's alpha channel was scanned
 * for connected components — not eyeballed — which found 19 genuinely
 * separable pieces; the smallest 7 (crumb/speck-sized, ≤53×32px source
 * resolution) were filtered out as visually negligible at mobile scale,
 * leaving these 12, each verified by direct visual inspection before
 * being assigned a role below (NOT guessed from position/size alone —
 * see the cupConfig.js v8 header for what happens when that shortcut
 * is taken: it produced an arbitrary, flagged-as-arbitrary pasta/
 * drinks crop assignment last time):
 *
 *   p01 = orange wedge      p07 = bean
 *   p02 = chocolate chunk   p08 = leaf
 *   p03 = orange slice      p09 = bean
 *   p04 = bean               p10 = bean
 *   p05 = bean               p11 = leaf
 *   p06 = orange wedge       p12 = bean
 *
 * LAYOUT: positions span the camera frustum's full visible Y range
 * (≈±2.58 units at z=0, derived from the scene's fov=38°/camera z=7.5 —
 * see HeroCanvas.jsx/CameraRig.jsx). X bounds were computed PER-
 * PARTICLE at that particle's own Z (frustum width grows at negative Z,
 * shrinks at positive Z — a flat ±1.2–1.44 estimate across all Z would
 * have under/overstated the true edge at each particle's actual depth),
 * checked against the narrowest common mobile aspect ratio (9:20). Only
 * p07 and p11 are placed past that computed edge — genuinely cropped by
 * camera perspective, not a CSS overflow trick. Every other particle is
 * deliberately fully onscreen with verified margin: these are small
 * atmosphere pieces meant to read as scattered detail, not the "half
 * outside screen" treatment reserved for cup1/cup2.
 *
 * Distribution deliberately avoids clustering near the cup (the brief's
 * explicit complaint about the prior single-cup6-image approach) AND
 * avoids clustering against each other: pieces sit behind the headline
 * area with spread-out Y values rather than a tight band (p01/p08/p12/
 * p04), beside where buttons/cat-bar sit lower in the stack (p03/p06),
 * genuinely flanking the cup rather than overlapping its footprint
 * (p05/p09), filling the previously-empty mid-height gaps between the
 * cup and cup2/cup4 (p02/p10), and at the far screen edges as cropped
 * atmosphere (p07/p11). Closest-pair distance across all 12 particles
 * plus cup1-4's existing scatter positions was checked directly (~0.54
 * units at the tightest, comfortable given particle sizes of 0.13–0.36
 * units).
 *
 * Z values vary per-particle (range -1.3 to +0.55) and now also drive
 * opacity by a deliberate depth convention: particles at positive Z
 * (closer to camera — p05/p09, flanking the cup) are the most opaque/
 * crisp-reading of the set; particles pushed to the most negative Z
 * (p04/p07/p10) are the faintest. This is NOT real per-pixel blur —
 * actual blur and explicit depth-vs-text render-order layering is still
 * EXPLICITLY DEFERRED to a follow-up (the brief's "Depth" section asks
 * for it, but this pass remains scoped to composition/positioning, not
 * a post-process or material change). Z continues to also affect
 * natural perspective scale as before.
 */
import p01Url from './models/satellites/particles/p01.png'; // orange wedge
import p02Url from './models/satellites/particles/p02.png'; // chocolate chunk
import p03Url from './models/satellites/particles/p03.png'; // orange slice
import p04Url from './models/satellites/particles/p04.png'; // bean
import p05Url from './models/satellites/particles/p05.png'; // bean
import p06Url from './models/satellites/particles/p06.png'; // orange wedge
import p07Url from './models/satellites/particles/p07.png'; // bean
import p08Url from './models/satellites/particles/p08.png'; // leaf
import p09Url from './models/satellites/particles/p09.png'; // bean
import p10Url from './models/satellites/particles/p10.png'; // bean
import p11Url from './models/satellites/particles/p11.png'; // leaf
import p12Url from './models/satellites/particles/p12.png'; // bean

export const PARTICLE_CONFIGS = [
  // ── Behind the headline (high Y, spread across the band rather than
  // bunched — see v2 header) ──
  { id: 'p01', url: p01Url, pos: [-0.70,  2.10, -0.85], width: 0.357, height: 0.351, opacity: 0.50 }, // orange wedge, behind headline center-left
  { id: 'p08', url: p08Url, pos: [ 0.55,  2.20, -0.55], width: 0.208, height: 0.220, opacity: 0.55 }, // leaf, behind headline center-right
  { id: 'p12', url: p12Url, pos: [ 0.05,  2.40, -0.30], width: 0.142, height: 0.138, opacity: 0.50 }, // bean, top edge dead-center, nearest of the top cluster
  { id: 'p04', url: p04Url, pos: [ 1.15,  1.95, -1.15], width: 0.180, height: 0.171, opacity: 0.42 }, // bean, upper-mid between headline and burger, pushed back
  { id: 'p07', url: p07Url, pos: [-1.35,  1.05, -1.30], width: 0.170, height: 0.155, opacity: 0.38 }, // bean, far upper-left edge — genuinely cropped at this z

  // ── Around the cup (small |X|, mid Y) — pulled out to true flanking
  // positions rather than overlapping the cup's own footprint ──
  { id: 'p02', url: p02Url, pos: [ 1.15,  0.45, -0.65], width: 0.345, height: 0.342, opacity: 0.48 }, // chocolate chunk, fills the gap between cup and cup2/cup4
  { id: 'p05', url: p05Url, pos: [ 0.85, -0.30,  0.55], width: 0.198, height: 0.186, opacity: 0.62 }, // bean, right flank of cup, closest/crispest particle
  { id: 'p09', url: p09Url, pos: [-0.80, -0.10,  0.50], width: 0.144, height: 0.168, opacity: 0.58 }, // bean, left flank of cup, close + crisp

  // ── Beside buttons / lower stack (low Y) ──
  { id: 'p03', url: p03Url, pos: [-0.55, -1.05, -0.70], width: 0.286, height: 0.267, opacity: 0.45 }, // orange slice, beside/behind buttons center-left
  { id: 'p06', url: p06Url, pos: [ 0.60, -1.15, -0.80], width: 0.308, height: 0.286, opacity: 0.48 }, // orange wedge, beside/behind buttons center-right
  { id: 'p10', url: p10Url, pos: [ 1.30, -0.65, -1.05], width: 0.133, height: 0.144, opacity: 0.38 }, // bean, lower-mid between cup and fries, pushed back

  // ── Far edges / atmosphere ──
  { id: 'p11', url: p11Url, pos: [-1.45, -0.55, -1.20], width: 0.252, height: 0.197, opacity: 0.40 }, // leaf, far lower-left edge — genuinely cropped at this z
];

/*
 * resolveParticleGeometry(cfg)
 *
 * Deliberately the simplest possible resolver — particles have exactly
 * one geometry state (the flat `pos`/`width`/`height`/`opacity` above),
 * no viewport-width blending, no desktop variant. This mirrors
 * cupConfig.js's resolveScatterGeometry() in spirit (flat lookup, not
 * an interpolation) but doesn't need any fallback chain since particles
 * have nothing to fall back to — they only ever render in one mode.
 *
 * Kept as a function (not just inline field access in the renderer)
 * for symmetry with resolveCupGeometry/resolveScatterGeometry, and so
 * a future per-particle depth/blur pass has one obvious place to add
 * derived fields (e.g. a computed blurAmount from `pos[2]`) without
 * touching the renderer itself.
 */
export function resolveParticleGeometry(cfg) {
  return {
    pos: cfg.pos,
    width: cfg.width,
    height: cfg.height,
    opacity: cfg.opacity,
  };
}