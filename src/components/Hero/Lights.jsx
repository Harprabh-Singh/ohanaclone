/*
 * Lights.jsx v9
 *
 * STRIPPED: every visible mesh in the scene (MainCupImage,
 * SatelliteCups) uses meshBasicMaterial, which is unlit and ignores
 * scene lights entirely. The previous 13 lights — including a
 * directional light casting a 2048x2048 shadow map — were computing
 * real per-frame cost (and GPU shadow-pass cost, while `shadows` was
 * still on Canvas) for zero visible effect, since nothing in the
 * scene can receive light or shadow right now.
 *
 * Left empty on purpose rather than deleted/unmounted, so it's a
 * one-line job to bring lighting back if real lit 3D geometry
 * (meshStandardMaterial, etc.) returns to the scene later.
 */
export default function Lights() {
  return null;
}