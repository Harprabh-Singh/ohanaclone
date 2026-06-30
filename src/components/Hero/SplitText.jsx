/*
 * SplitText.jsx
 *
 * Splits a word into individual letter <span>s, each carrying a
 * `--oh4-li` (letter index, normalized 0→1 across the word) custom
 * property. Hero.css uses that index together with the global
 * `--oh3-mx` mouse-position variable (already maintained by
 * useMouseParallax on the hero root) to compute a per-letter depth via
 * `calc()` — letters positioned near the cursor's current horizontal
 * lean get more translateZ/rotateY than letters far from it.
 *
 * WHY CSS calc() AND NOT JS PER-FRAME STYLE WRITES:
 * useMouseParallax already writes --oh3-mx/--oh3-my every animation
 * frame on the .oh4-hero root. CSS custom properties cascade, so every
 * letter span automatically re-reads the updated value with zero extra
 * JS work per letter — adding a rAF loop that walks N letter DOM nodes
 * every frame would duplicate work the parallax hook is already doing
 * for the 3D camera. The only thing this component needs to contribute
 * is the per-letter index so the CSS math has something to offset by.
 *
 * Each rendered letter is wrapped in two nested spans:
 *   .oh4-split-outer  — clips overflow during the entrance/exit animation
 *   .oh4-split-inner  — receives the actual transform (translateZ etc.)
 * matching the existing GSAP yPercent entrance pattern in Hero.jsx, which
 * already animates .oh4-word/.oh4-word-outline via yPercent — splitting
 * into letters means that same entrance now needs to stagger per letter
 * rather than per word; Hero.jsx's GSAP timeline is updated accordingly.
 */

export default function SplitText({ text, className = '' }) {
  const letters = Array.from(text);
  const count = letters.length;

  return (
    <span className={`oh4-split-word ${className}`} aria-label={text}>
      {letters.map((ch, i) => (
        <span
          key={i}
          className="oh4-split-outer"
          aria-hidden="true"
          style={{ '--oh4-li': count > 1 ? i / (count - 1) : 0.5 }}
        >
          <span className="oh4-split-inner">
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        </span>
      ))}
    </span>
  );
}