/*
 * Hero.jsx v17
 *
 * CHANGES FROM v16 — background composition moved out of Three.js:
 *
 * Renders the new <BackgroundComposition /> component (plain CSS-
 * positioned <img> elements for pizza/burger/cake/fries + 12 atmosphere
 * particles) as a sibling of the 3D canvas, right after it in the DOM.
 * The component is self-gating (only visible at <700px via Hero.css —
 * see that file's .oh5-bg-composition rule), so no conditional render
 * logic is needed here.
 *
 * Also writes a new `--oh5-bg-opacity` CSS custom property on the hero
 * root every scroll tick, using the SAME textOpacity value already
 * computed for the text layer's fade (Section 1 of onUpdate below) —
 * this replicates the old Three.js scatterMode's "pre-scroll only"
 * visibility (it used to disappear once scrollProgress passed
 * RESET_THRESHOLD) without needing a second threshold computation: the
 * text layer was already fading out over the same 0→TEXT_FADE_END
 * window, so reusing that value keeps the background composition's
 * fade in lockstep with the headline's fade by construction, not by
 * two independently-tuned thresholds that could drift apart.
 *
 * The Three.js canvas (HeroCanvas → Scene) now renders ONLY the coffee
 * cup (cup5, via MainCupImage/ActiveCupImage) — see SatelliteCups.jsx
 * v17's header for what moved out of the 3D scene and why.
 *
 * ============================================================
 * (Everything below this point is preserved from v16.)
 * ============================================================
 *
 * SCROLL REDESIGN — new interaction model:
 *
 *   SCROLL DOWN:
 *     0.00 → 0.32  text layer fades out
 *     0.28 → 0.62  menu panel slides in from right
 *     0.38 → 0.72  menu title letters animate in
 *     0.50 → 0.80  category cards stagger in
 *     (cup rises upward — handled in MainCupImage/ActiveCupImage)
 *
 *   SCROLL UP (back to top):
 *     Everything reverses (scrub is bi-directional).
 *     If a non-coffee category was active when scrolling up:
 *       - activeModel resets to 'coffee' instantly (no cup animation)
 *       - all cups snap to idle positions
 *       - `hasPickedNonCoffee` flag clears so next scroll-down is clean
 *
 * REMOVED: hard-wall snap jump (the 10%→100% auto-scroll that was
 * causing the "freaking out" jank). The scroll is now a pure scrub
 * with no programmatic jumps — the user has full bidirectional control.
 *
 * scrollProgress drives both the CSS layer and the Three.js canvas via
 * the shared ref. The 3D cup animation (rise on scroll-down) lives in
 * MainCupImage.jsx and ActiveCupImage.jsx.
 */

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin, ChefHat, Users, Heart, Star } from 'lucide-react';
import HeroCanvas from './HeroCanvas';
import BackgroundComposition from './BackgroundComposition';
import useMouseParallax from './useMouseParallax';
import SplitText from './SplitText';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

/*
 * CATEGORIES — single shared source for BOTH the desktop/scroll menu-
 * panel cards (previously MENU_CATS) and the mobile pre-scroll category
 * row (previously CAT_BAR). These were two independent arrays with two
 * different id vocabularies that were never reconciled — MENU_CATS'
 * ids drove the real, working handleCatClick → cup-swap behavior;
 * CAT_BAR was purely decorative (no id, no onClick) and used a
 * different naming scheme (Burgers/Pizzas/Cakes/Snacks vs. Pizza/
 * Desserts/Bites) that didn't match what handleCatClick expected.
 *
 * Merged into one array so the two surfaces can never drift apart
 * again — both .map() over CATEGORIES now, both wired to the same
 * handleCatClick. ids match cupConfig.js's CATEGORY_TO_CUP keys
 * exactly (see that file's v8 header for the full asset-relabel
 * rationale: cup2 is actually a burger, cup4 is actually fries — not
 * 'pasta'/'drinks' as the old MENU_CATS ids implied).
 *
 * 'pasta' and 'drinks' have no real photographed dish among the
 * current assets — both point to placeholder crops (cup6a/cup6b) in
 * cupConfig.js. desc copy below is written generically enough not to
 * overpromise a specific dish for those two until real art exists.
 */
const CATEGORIES = [
  { id: 'coffee',  name: 'Coffee',  emoji: '☕', icon: '☕', desc: 'Single origin & blends', sub: 'Hand-Brewed'     },
  { id: 'burgers', name: 'Burgers', emoji: '🍔', icon: '🍔', desc: 'Juicy, flame-grilled',    sub: 'Juicy & Bold'    },
  { id: 'pizzas',  name: 'Pizzas',  emoji: '🍕', icon: '🍕', desc: 'Wood-fired, Neapolitan',  sub: 'Wood-Fired'      },
  { id: 'pasta',   name: 'Pasta',   emoji: '🍝', icon: '🍝', desc: 'Italian comfort',         sub: 'Italian Comfort' },
  { id: 'cakes',   name: 'Cakes',   emoji: '🎂', icon: '🎂', desc: 'Patisserie & classic',    sub: 'Sweet Moments'   },
  { id: 'drinks',  name: 'Drinks',  emoji: '🥤', icon: '🥤', desc: 'Fresh & fun',             sub: 'Fresh & Fun'     },
  { id: 'snacks',  name: 'Snacks',  emoji: '🍟', icon: '🍟', desc: 'Bite & share',            sub: 'Bite & Share'    },
];

// ── Scroll timing constants ────────────────────────────────
const TEXT_FADE_END   = 0.32;
const PANEL_IN_START  = 0.30;
const PANEL_IN_END    = 0.62;
const TITLE_IN_START  = 0.38;
const TITLE_IN_END    = 0.72;
const CARDS_IN_START  = 0.50;
const CARDS_IN_END    = 0.80;

// Threshold below which we consider the user "back at the top"
// and trigger the non-coffee reset.
const RESET_THRESHOLD = 0.08;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuad  = (t) => 1 - Math.pow(1 - t, 2);
const remap = (p, start, end) =>
  Math.max(0, Math.min((p - start) / (end - start), 1));

export default function Hero() {
  const rootRef      = useRef(null);
  const textLayerRef = useRef(null);
  const statsBarRef  = useRef(null);
  const menuPanelRef = useRef(null);
  const hintRef      = useRef(null);
  const mouse        = useMouseParallax(rootRef);

  // Shared ref read by HeroCanvas → Scene → MainCupImage / ActiveCupImage
  const scrollProgress = useRef(0);

  // Which 3D model/cup the canvas shows
  const [activeModel, setActiveModel] = useState('coffee');
  const activeModelRef = useRef('coffee');

  // Tracks whether user clicked a non-coffee item while menu was visible.
  // On scroll-back-to-top this flag triggers a silent reset to coffee.
  const hasPickedNonCoffeeRef = useRef(false);

  // Signal sent down to Scene to freeze cup animation (snap to idle).
  // When true, 3D cups skip their scroll-driven movement for one frame
  // and hold idle positions. Reset to false once consumed.
  const freezeCupsRef = useRef(false);

  const handleCatClick = useCallback((id) => {
    setActiveModel(id);
    activeModelRef.current = id;
    if (id !== 'coffee') {
      hasPickedNonCoffeeRef.current = true;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ── DOM refs ──────────────────────────────────────────
    const titleLetters = root.querySelectorAll('.oh4-menu-title .oh4-split-outer');
    const eyebrow    = root.querySelector('.oh4-eyebrow');
    const headlineL1 = root.querySelector('.oh4-hl-line1');
    const headlineL2 = root.querySelector('.oh4-hl-line2');
    const headlineL3 = root.querySelector('.oh4-hl-line3');
    const para       = root.querySelector('.oh4-hero-para');
    const ctas       = root.querySelector('.oh4-hero-ctas');
    const catBar     = root.querySelector('.oh4-cat-bar');
    const stamp      = root.querySelector('.oh4-stamp');
    const flourish   = root.querySelector('.oh4-flourish');
    const hint       = hintRef.current;
    const panel      = menuPanelRef.current;
    const statsBar   = statsBarRef.current;
    const textLayer  = textLayerRef.current;
    const catCards   = panel?.querySelectorAll('.oh4-menu-cat') ?? [];

    const titleLetterEls = Array.from(titleLetters).map((el) => ({
      el,
      span: el.querySelector('.oh4-split-inner'),
    }));

    const setTextOpacity  = textLayer ? gsap.quickSetter(textLayer, 'opacity') : null;
    const setPanelOpacity = panel ? gsap.quickSetter(panel, 'opacity') : null;
    const setPanelX       = panel ? gsap.quickSetter(panel, 'x', 'px') : null;
    const setHintOpacity  = hint ? gsap.quickSetter(hint, 'opacity') : null;
    const setBgOpacity    = gsap.quickSetter(root, '--oh5-bg-opacity');

    // ── Entrance animation (page load) ───────────────────
    gsap.set(
      [eyebrow, headlineL1, headlineL2, headlineL3, para, ctas, catBar,
       stamp, flourish, hint].filter(Boolean),
      { opacity: 0, y: 18 }
    );
    gsap.set(statsBar, { opacity: 0, y: 8 });
    gsap.set(titleLetters, { yPercent: 130, opacity: 0 });
    gsap.set(panel, { opacity: 0, x: 60 });
    gsap.set(catCards, { opacity: 0, y: 20 });

    gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
      .to(eyebrow,    { opacity: 1, y: 0, duration: 0.65 }, 0.00)
      .to(headlineL1, { opacity: 1, y: 0, duration: 0.85 }, 0.12)
      .to(headlineL2, { opacity: 1, y: 0, duration: 0.85 }, 0.22)
      .to(headlineL3, { opacity: 1, y: 0, duration: 0.85 }, 0.30)
      .to(stamp,      { opacity: 1, y: 0, duration: 0.75 }, 0.28)
      .to(flourish,   { opacity: 1, y: 0, duration: 0.75 }, 0.34)
      .to(para,       { opacity: 1, y: 0, duration: 0.65 }, 0.44)
      .to(ctas,       { opacity: 1, y: 0, duration: 0.65 }, 0.52)
      .to(catBar,     { opacity: 1, y: 0, duration: 0.60 }, 0.58)
      .to(statsBar,   { opacity: 1, y: 0, duration: 0.60 }, 0.62)
      .to(hint,       { opacity: 1, y: 0, duration: 0.50 }, 0.66);

    // ── Scroll-driven animation ────────────────────────────
    // Pure scrub: NO programmatic jumps, NO snap zones.
    // User scrolls freely in both directions; everything reverses cleanly.
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: '+=240%',
      pin: true,
      pinSpacing: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        scrollProgress.current = p;

        // ── Non-coffee reset on scroll-back-to-top ────────
        // If the user scrolled back up past the reset threshold AND
        // had previously picked a non-coffee category, silently snap
        // back to coffee. The freeze signal tells the 3D scene to hold
        // cups at their idle positions for this frame (no animation).
        if (p < RESET_THRESHOLD && hasPickedNonCoffeeRef.current) {
          hasPickedNonCoffeeRef.current = false;
          freezeCupsRef.current = true;
          // React state update — batched by React, fires on next render
          setActiveModel('coffee');
          activeModelRef.current = 'coffee';
        }

        // ── 1. Text layer fades out ───────────────────────
        const textOpacity = Math.max(0, 1 - p / TEXT_FADE_END);
        if (setTextOpacity) setTextOpacity(textOpacity);

        // ── 1b. Background composition (mobile dishes/particles)
        // fades with the text layer — matches the old scatterMode's
        // pre-scroll-only visibility exactly, since both were tied to
        // "are we still near the top of the scroll." See
        // BackgroundComposition.jsx / Hero.css's .oh5-bg-composition.
        setBgOpacity(textOpacity);

        // ── 2. Stats bar fades with text layer ───────────
        if (statsBar) {
          gsap.set(statsBar, { opacity: textOpacity });
        }

        // ── 3. Menu panel crossfades in ───────────────────
        if (panel) {
          const panelT = easeOutCubic(remap(p, PANEL_IN_START, PANEL_IN_END));
          setPanelOpacity(panelT);
          setPanelX(40 * (1 - panelT));
          panel.style.pointerEvents = panelT > 0.55 ? 'auto' : 'none';
        }

        // ── 4. Menu title letters animate in ─────────────
        const titleT = easeOutCubic(remap(p, TITLE_IN_START, TITLE_IN_END));
        titleLetterEls.forEach(({ el, span }, i) => {
          const stagger = (i / Math.max(titleLetterEls.length - 1, 1)) * 0.28;
          const localT  = Math.max(0, Math.min((titleT - stagger) / (1 - stagger), 1));
          el.style.opacity = String(localT);
          if (span) {
            span.style.transform = `translateY(${(1 - localT) * 55}%) translateZ(${(1 - localT) * -28}px)`;
          }
        });

        // ── 5. Category cards stagger in ─────────────────
        const cardsWindow = CARDS_IN_END - CARDS_IN_START;
        catCards.forEach((card, i) => {
          const delay  = (i / catCards.length) * (cardsWindow * 0.45);
          const ct     = easeOutQuad(remap(p, CARDS_IN_START + delay, CARDS_IN_END));
          card.style.opacity   = String(ct);
          card.style.transform = `translateY(${14 * (1 - ct)}px)`;
        });

        // ── 6. Scroll hint ────────────────────────────────
        if (hint) {
          if (p < 0.04) {
            hint.textContent = '↓ Scroll to explore';
            setHintOpacity(textOpacity);
          } else if (p < TEXT_FADE_END) {
            hint.textContent = '↓ Keep scrolling';
            setHintOpacity(textOpacity);
          } else {
            setHintOpacity(0);
          }
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section ref={rootRef} className="oh4-hero" aria-label="Ohana Cafe Hero">

      {/* ── ATMOSPHERE ── */}
      <div className="oh4-fog"       aria-hidden="true" />
      <div className="oh4-bg-glow"   aria-hidden="true" />
      <div className="oh4-bg-circle" aria-hidden="true" />
      <div className="oh4-grain"     aria-hidden="true" />
      <div className="oh4-vignette"  aria-hidden="true" />

      {/* ── 3D CANVAS (coffee cup only — see HeroCanvas/Scene v21) ── */}
      <div className="oh4-canvas-wrap">
        <Suspense fallback={<div className="oh4-loading" />}>
          <HeroCanvas
            mouse={mouse}
            scrollProgress={scrollProgress}
            activeModelRef={activeModelRef}
            freezeCupsRef={freezeCupsRef}
          />
        </Suspense>
      </div>

      {/* ── BACKGROUND COMPOSITION (mobile-only — pizza/burger/cake/
          fries + 12 atmosphere particles as plain CSS-positioned
          images, not Three.js. See BackgroundComposition.jsx header. ── */}
      <BackgroundComposition />

      {/* ── HERO TEXT LAYER ── */}
      <div ref={textLayerRef} className="oh4-text-layer">

        <div className="oh4-left-col">
          <p className="oh4-eyebrow">
            <span className="oh4-eyebrow-rule" aria-hidden="true" />
            Good Food. Great Memories.
          </p>

          <h1 className="oh4-headline" aria-label="Made for Every Craving. Loved by All.">
            <span className="oh4-hl-line1">Made for</span>
            <span className="oh4-hl-line2">Every Craving.</span>
            <span className="oh4-hl-line3">Loved by All.</span>
          </h1>

          <p className="oh4-hero-para">
            From comforting classics to indulgent treats,<br />
            every dish is crafted with <em className="oh4-em-gold">love</em>,<br />
            served with a <em className="oh4-em-gold">smile</em>.
          </p>

          <div className="oh4-hero-ctas">
            <Link to="/menu" className="oh4-cta-gold">
              <span className="oh4-cta-icon" aria-hidden="true">🍽</span>
              Explore Menu
            </Link>
            <Link to="/reservations" className="oh4-cta-outline">
              <span className="oh4-cta-icon" aria-hidden="true">📅</span>
              Reserve a Table
            </Link>
          </div>

          <div className="oh4-cat-bar" aria-label="Menu categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`oh4-cat-item${activeModel === c.id ? ' active' : ''}`}
                onClick={() => handleCatClick(c.id)}
                aria-label={`Show ${c.name}`}
              >
                <span className="oh4-cat-icon" aria-hidden="true">{c.icon}</span>
                <span className="oh4-cat-name">{c.name}</span>
                <span className="oh4-cat-sub">{c.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="oh4-stamp" aria-hidden="true">
          <span className="oh4-stamp-word">Made</span>
          <span className="oh4-stamp-big">Fresh</span>
          <span className="oh4-stamp-word">Everyday</span>
        </div>

        <div className="oh4-flourish" aria-hidden="true">
          <span className="oh4-flourish-text">Good food</span>
          <span className="oh4-flourish-rule" />
          <span className="oh4-flourish-text">good mood</span>
        </div>

      </div>

      {/* ── STATS BAR ── */}
      <div ref={statsBarRef} className="oh4-stats-bar" aria-label="Quick facts">
        <div className="oh4-stat-item">
          <MapPin size={16} strokeWidth={1.5} className="oh4-stat-ico" aria-hidden="true" />
          <div>
            <span className="oh4-stat-label">Jorhat, Assam</span>
            <span className="oh4-stat-sub">Open Daily · 11 AM – 10 PM</span>
          </div>
        </div>
        <div className="oh4-stat-divider" aria-hidden="true" />
        <div className="oh4-stat-item">
          <ChefHat size={16} strokeWidth={1.5} className="oh4-stat-ico" aria-hidden="true" />
          <div>
            <span className="oh4-stat-label">Our Kitchen</span>
            <span className="oh4-stat-sub">Crafted with passion by real chefs</span>
          </div>
        </div>
        <div className="oh4-stat-divider" aria-hidden="true" />
        <div className="oh4-stat-item">
          <Users size={16} strokeWidth={1.5} className="oh4-stat-ico" aria-hidden="true" />
          <div>
            <span className="oh4-stat-label">Dine · Sip · Gather</span>
            <span className="oh4-stat-sub">The perfect place for every occasion</span>
          </div>
        </div>
        <div className="oh4-stat-divider" aria-hidden="true" />
        <div className="oh4-stat-item">
          <Heart size={16} strokeWidth={1.5} className="oh4-stat-ico" aria-hidden="true" />
          <div>
            <span className="oh4-stat-label">Guest Rating</span>
            <div className="oh4-stars">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} fill={s <= 4 ? '#C89B45' : 'none'} stroke="#C89B45" strokeWidth={1.5} />
              ))}
              <span className="oh4-stars-num">4.8/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MENU PANEL ── */}
      <div ref={menuPanelRef} className="oh4-menu-panel" aria-label="Menu overview">
        <div className="oh4-menu-inner">
          <div className="oh4-menu-header">
            <span className="oh4-menu-overline">Explore</span>
            <h2 className="oh4-menu-title">
              <SplitText text="Our" />
              <SplitText text="Menu" />
            </h2>
            <p className="oh4-menu-sub">
              Fresh ingredients, daily specials,<br />
              and a table with your name.
            </p>
          </div>

          <div className="oh4-menu-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`oh4-menu-cat${activeModel === cat.id ? ' active' : ''}`}
                onClick={() => handleCatClick(cat.id)}
                aria-label={`Show ${cat.name} — ${cat.desc}`}
                type="button"
              >
                <span className="oh4-menu-cat-icon" aria-hidden="true">{cat.emoji}</span>
                <span className="oh4-menu-cat-text">
                  <span className="oh4-menu-cat-name">{cat.name}</span>
                  <span className="oh4-menu-cat-desc">{cat.desc}</span>
                </span>
                <span className="oh4-menu-cat-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          <Link to="/menu" className="oh4-menu-cta">
            View Full Menu
            <ArrowRight size={13} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* ── SCROLL HINT ── */}
      <span ref={hintRef} className="oh4-scroll-hint" aria-hidden="true">
        ↓ Scroll to explore
      </span>

    </section>
  );
}