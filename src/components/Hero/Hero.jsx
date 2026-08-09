/*
 * Hero.jsx v17
 *
 * CHANGES FROM v16 — background composition moved out of Three.js:
 *
 * Renders the new  component (plain CSS-
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
import cupImg from './ui/cup.png';
import dishesImg from './ui/dishes.png';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin, ChefHat, Users, Heart, Star } from 'lucide-react';
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
  { id: 'coffee',  name: 'COFFEE',  emoji: '☕', desc: 'Single origin & blends' },
  { id: 'burgers', name: 'BURGERS', emoji: '🍔', desc: 'Juicy, flame-grilled' },
  { id: 'pizzas',  name: 'PIZZAS',  emoji: '🍕', desc: 'Wood-fired perfection' },
  { id: 'pasta',   name: 'PASTA',   emoji: '🍝', desc: 'Italian classics done right' },
  { id: 'cakes',   name: 'CAKES',   emoji: '🎂', desc: 'Handcrafted indulgence' },
  { id: 'drinks',  name: 'DRINKS',  emoji: '🥤', desc: 'Refreshing & revitalizing' },
  { id: 'snacks',  name: 'SNACKS',  emoji: '🍟', desc: 'Bites to keep you going' },
];

// ── Scroll timing constants ────────────────────────────────
const TEXT_FADE_END = 0.32;
const PANEL_IN_START = 0.30;
const PANEL_IN_END = 0.62;
const TITLE_IN_START = 0.38;
const TITLE_IN_END = 0.72;
const CARDS_IN_START = 0.50;
const CARDS_IN_END = 0.80;

// Threshold below which we consider the user "back at the top"
// and trigger the non-coffee reset.
const RESET_THRESHOLD = 0.08;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuad = (t) => 1 - Math.pow(1 - t, 2);
const remap = (p, start, end) =>
  Math.max(0, Math.min((p - start) / (end - start), 1));

const CatIcons = {
  coffee: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" /></svg>,
  burgers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 11a8 8 0 0 1 16 0H4z" /><path d="M4 15h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2z" /><path d="M4 13h16" /></svg>,
  pizzas: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l8 18H4L12 2z" /><path d="M11 12h.01M14 16h.01M10 16h.01" /><path d="M4 20h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /></svg>,
  pasta: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 14a8 8 0 0 0 16 0H4z" /><path d="M12 6s-2 3 0 5 0 3 0 3M8 6s-2 3 0 5 0 3 0 3M16 6s-2 3 0 5 0 3 0 3" /></svg>,
  cakes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 14v6h12v-6" /><path d="M6 14l6-6 6 6M12 4v4" /></svg>,
  drinks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 8l1 14h8l1-14" /><path d="M6 8h12" /><path d="M12 8V2" /><path d="M12 2h3" /></svg>,
  snacks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 12l2 10h8l2-10" /><path d="M8 12V4M12 12V3M16 12V5" /></svg>,
};

export default function Hero() {
  const rootRef = useRef(null);
  const textLayerRef = useRef(null);
  const mobileCupRef = useRef(null);
  const mobileFadeTopRef = useRef(null);
  const mobileDishesRef = useRef(null);
  const mobileFadeBottomRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const desktopLeftRef = useRef(null);
  const desktopRightRef = useRef(null);
    const desktopCupRef = useRef(null);
    const desktopFadeImagesRef = useRef(null);
  const statsBarRef = useRef(null);
  const menuPanelRef = useRef(null);
  const hintRef = useRef(null);
  const mouse = useMouseParallax(rootRef);

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
    const eyebrow = root.querySelector('.oh4-eyebrow');
    const headlineL1 = root.querySelector('.oh4-hl-line1');
    const headlineL2 = root.querySelector('.oh4-hl-line2');
    const headlineL3 = root.querySelector('.oh4-hl-line3');
    const para = root.querySelector('.oh4-hero-para');
    const ctas = root.querySelector('.oh4-hero-ctas');
    // Ensure both <html> and <body> carry the `has-hero` marker while
    // the hero is mounted so overscroll/viewport bounce reveals the
    // correct dark background instead of white.
    document.documentElement.classList.add('has-hero');
    document.body.classList.add('has-hero');
    const catBar = root.querySelector('.oh4-cat-bar');
    const stamp = root.querySelector('.oh4-stamp');
    const flourish = root.querySelector('.oh4-flourish');
    const hint = hintRef.current;
    const panel = menuPanelRef.current;
    const statsBar = statsBarRef.current;
    const textLayer = textLayerRef.current;
    const catCards = panel?.querySelectorAll('.oh4-menu-cat') ?? [];
    const canvasWrap = root.querySelector('.oh4-canvas-wrap');

    const titleLetterEls = Array.from(titleLetters).map((el) => ({
      el,
      span: el.querySelector('.oh4-split-inner'),
    }));

    const setTextOpacity = textLayer ? gsap.quickSetter(textLayer, 'opacity') : null;
    const setDesktopLeftOpacity = desktopLeftRef.current ? gsap.quickSetter(desktopLeftRef.current, 'opacity') : null;
    const setPanelOpacity = panel ? gsap.quickSetter(panel, 'opacity') : null;
    const setPanelX = panel ? gsap.quickSetter(panel, 'x', 'px') : null;
    const setHintOpacity = hint ? gsap.quickSetter(hint, 'opacity') : null;
    const setBgOpacity = gsap.quickSetter(root, '--oh5-bg-opacity');
    
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
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.65 }, 0.00)
      .to(headlineL1, { opacity: 1, y: 0, duration: 0.85 }, 0.12)
      .to(headlineL2, { opacity: 1, y: 0, duration: 0.85 }, 0.22)
      .to(headlineL3, { opacity: 1, y: 0, duration: 0.85 }, 0.30)
      .to(stamp, { opacity: 1, y: 0, duration: 0.75 }, 0.28)
      .to(flourish, { opacity: 1, y: 0, duration: 0.75 }, 0.34)
      .to(para, { opacity: 1, y: 0, duration: 0.65 }, 0.44)
      .to(ctas, { opacity: 1, y: 0, duration: 0.65 }, 0.52)
      .to(catBar, { opacity: 1, y: 0, duration: 0.60 }, 0.58)
      .to(statsBar, { opacity: 1, y: 0, duration: 0.60 }, 0.62)
      .to(hint, { opacity: 1, y: 0, duration: 0.50 }, 0.66);

    // ── Scroll-driven animation ────────────────────────────
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => window.innerWidth > 700 ? '+=400%' : '+=240%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
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
        
        if (window.innerWidth > 700) {
          // On desktop, only fade out the left column text
          if (setDesktopLeftOpacity) setDesktopLeftOpacity(textOpacity);
          if (setTextOpacity) setTextOpacity(1); // Ensure main layer stays visible
          
          // Animate the right column (cup & dishes) to slide leftwards
          if (desktopFadeImagesRef.current) {
            gsap.set(desktopFadeImagesRef.current, { opacity: textOpacity });
          }
          if (desktopCupRef.current) {
            const slideProgress = Math.min(1, Math.max(0, p / 0.5));
            // Move cup to the left using pixels to prevent vw layout thrashing
            const scale = 1 + (0.3 * slideProgress);
            const moveDist = window.innerWidth * 0.58; 
            gsap.set(desktopCupRef.current, { x: -slideProgress * moveDist, scale: scale });
          }
        } else {
          // On mobile, fade out the whole layer
          if (setTextOpacity) setTextOpacity(textOpacity);
        }

        // ── 1b. Background composition (mobile dishes/particles)
        // fades with the text layer — matches the old scatterMode's
        // pre-scroll-only visibility exactly, since both were tied to
        // "are we still near the top of the scroll." See
        // BackgroundComposition.jsx / Hero.css's .oh5-bg-composition.
        setBgOpacity(textOpacity);

        // ── 1c. Mobile cup animation ──────────────────────
        if (mobileCupRef.current) {
          const cp = Math.min(p, 0.9) / 0.9;
          const riseY = cp * -35; // -30vh (lower than before)
          const scale = 2 + (0.15 * cp); // Keep it big
          mobileCupRef.current.style.transform = `translate(0px, ${riseY}vh) scale(${scale})`;
        }

        // ── 1d. Mobile layers fade out ────────────────────
        if (mobileFadeTopRef.current) mobileFadeTopRef.current.style.opacity = textOpacity;
        if (mobileDishesRef.current) mobileDishesRef.current.style.opacity = textOpacity;
        if (mobileFadeBottomRef.current) mobileFadeBottomRef.current.style.opacity = textOpacity;

        // ── 1e. Mobile menu layer fades in ────────────────
        if (mobileMenuRef.current) {
          const menuOp = Math.max(0, Math.min(1, (p - 0.4) / 0.4));
          mobileMenuRef.current.style.opacity = menuOp;
          mobileMenuRef.current.style.pointerEvents = menuOp > 0.5 ? 'auto' : 'none';
          mobileMenuRef.current.style.transform = `translateY(${(1 - menuOp) * 40}px)`;
        }

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
          const localT = Math.max(0, Math.min((titleT - stagger) / (1 - stagger), 1));
          el.style.opacity = String(localT);
          if (span) {
            span.style.transform = `translateY(${(1 - localT) * 55}%) translateZ(${(1 - localT) * -28}px)`;
          }
        });

        // ── 5. Category cards stagger in ─────────────────
        const cardsWindow = CARDS_IN_END - CARDS_IN_START;
        catCards.forEach((card, i) => {
          const delay = (i / catCards.length) * (cardsWindow * 0.45);
          const ct = easeOutQuad(remap(p, CARDS_IN_START + delay, CARDS_IN_END));
          card.style.opacity = String(ct);
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
      document.body.classList.remove('has-hero');
      document.documentElement.classList.remove('has-hero');
    };
  }, []);

  return (
    <section ref={rootRef} className="oh4-hero" aria-label="Ohana Cafe Hero">

      {/* ── ATMOSPHERE ── */}
      <div className="oh4-fog" aria-hidden="true" />
      <div className="oh4-bg-glow" aria-hidden="true" />
      <div className="oh4-bg-circle" aria-hidden="true" />
      <div className="oh4-grain" aria-hidden="true" />
      <div className="oh4-vignette" aria-hidden="true" />

      

      {/* ── BACKGROUND COMPOSITION (mobile-only — pizza/burger/cake/
          fries + 12 atmosphere particles as plain CSS-positioned
          images, not Three.js. See BackgroundComposition.jsx header. ── */}
      

      {/* ── MOBILE REDESIGN LAYER (< 700px) ── */}
      <div className="oh4-mobile-redesign-layer mobile-only-block" aria-hidden="true">
        <div ref={mobileFadeTopRef} className="oh4-mobile-headline">
          <div className="oh4-mobile-hl-top">
            <span className="oh4-mobile-hl-eat">Eat</span>
            <span className="oh4-mobile-hl-like">like</span>
          </div>
          <div className="oh4-mobile-hl-bottom">family.</div>
        </div>
        <div className="oh4-mobile-dishes-wrap" style={{ position: 'relative', width: 'min(100%, 45vh)', maxWidth: '500px', margin: 'clamp(10px, 5vh, 50px) auto 0' }}>
          {/* Tweak dishes transform here if needed */}
          <img
            ref={mobileDishesRef}
            src={dishesImg}
            alt="Dishes"
            className="oh4-mobile-dishes"
            style={{ width: '100%', transform: 'translate(0px, 0px) scale(1.2)', marginTop: 0 }}
          />
          {/* Tweak top/left/width here to position the cup over the dishes */}
          <img
            ref={mobileCupRef}
            src={cupImg}
            alt="Main Cup"
            className="oh4-mobile-main-cup"
            style={{
              position: 'absolute',
              width: '40%',
              top: '35%',
              left: '35.5%',
              transform: 'translate(0px, 0px) scale(2)',
              transformOrigin: 'center center',
              zIndex: 10
            }}
          />
        </div>

        <div ref={mobileFadeBottomRef} className="oh4-mobile-buttons">
          <Link to="/menu" className="oh4-btn-explore">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '18px', height: '18px' }} className="oh4-btn-icon">
              <circle cx="12" cy="12" r="10" />
              <polygon points="15 9 13.5 13.5 9 15 10.5 10.5 15 9" />
            </svg>
            EXPLORE MENU
          </Link>
          <Link to="/reservations" className="oh4-btn-reserve">
            RESERVE TABLE
          </Link>
        </div>

        {/* MOBILE MENU LAYER (< 700px) */}
        <div ref={mobileMenuRef} className="oh4-mobile-menu-layer" aria-hidden="true" style={{ opacity: 0, pointerEvents: 'none', transform: 'translateY(40px)' }}>
          <div className="oh4-mobile-menu-header">
            <div className="oh4-mobile-menu-subtitle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eebb4d" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Fresh ingredients, daily specials.
            </div>
            <h2 className="oh4-mobile-menu-title">
              Our Menu
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eebb4d" strokeWidth="1.2" className="oh4-leaf-icon">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              </svg>
              <div className="oh4-mobile-menu-underline" />
            </h2>
          </div>

          <div className="oh4-mobile-menu-grid">
            {CATEGORIES.map((cat) => (
              <Link to={`/menu#${cat.id}`} key={cat.id} className={`oh4-mobile-cat-card ${cat.id === 'snacks' ? 'full-width' : ''}`} style={{ textDecoration: 'none' }}>
                <div className="oh4-mobile-cat-icon-wrap">
                  {CatIcons[cat.id] || <span style={{ fontSize: '20px' }}>{cat.emoji}</span>}
                </div>
                <div className="oh4-mobile-cat-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                </div>
                <ArrowRight className="oh4-mobile-cat-arrow" size={16} />
              </Link>
            ))}
          </div>

          <Link to="/menu" className="oh4-mobile-btn-full">
            VIEW FULL MENU <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* ── HERO TEXT LAYER ── */}
      <div ref={textLayerRef} className="oh4-text-layer">

        <div ref={desktopLeftRef} className="oh4-desktop-left">
          <div className="oh4-desktop-headline-wrap">
            <h1 className="oh4-desktop-headline">
              <div className="oh4-dhl-eat">Eat</div>
              <div className="oh4-dhl-like">like</div>
              <div className="oh4-dhl-family">family.</div>
            </h1>
            <p className="oh4-desktop-para">
              Good food brings us together.<br/>
              At Ohana, every dish is <span className="oh4-dhl-highlight">crafted with love</span><br/>
              and served to make you feel at home.
            </p>
            <div className="oh4-desktop-buttons">
              <Link to="/menu" className="oh4-dbtn-explore">
                Explore Menu <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Link>
              <Link to="/reservations" className="oh4-dbtn-reserve">
                Reserve Table <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
          </div>
          
          <div className="oh4-desktop-stats">
            <div className="oh4-dstat">
              <span className="oh4-dstat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24F33" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              <div className="oh4-dstat-text">
                <strong>8+</strong>
                <span>YEARS OPEN</span>
              </div>
            </div>
            <div className="oh4-dstat-sep" />
            <div className="oh4-dstat">
              <span className="oh4-dstat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24F33" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
              <div className="oh4-dstat-text">
                <strong>4.8</strong>
                <span>GUEST RATING</span>
              </div>
            </div>
            <div className="oh4-dstat-sep" />
            <div className="oh4-dstat">
              <span className="oh4-dstat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24F33" strokeWidth="1.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
              </span>
              <div className="oh4-dstat-text">
                <strong>120</strong>
                <span>DISHES</span>
              </div>
            </div>
            <div className="oh4-dstat-sep" />
            <div className="oh4-dstat">
              <span className="oh4-dstat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24F33" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <div className="oh4-dstat-text">
                <strong>10K+</strong>
                <span>HAPPY GUESTS</span>
              </div>
            </div>
          </div>
        </div>
        
        <div ref={desktopRightRef} className="oh4-desktop-right">
          <div className="oh4-desktop-image-comp">
            <div ref={desktopFadeImagesRef} style={{position: 'absolute', inset: 0, zIndex: 1}}>
              <img src={dishesImg} alt="Dishes" className="oh4-dimg-dishes" />
              



            </div>

            <div ref={desktopCupRef} style={{position: 'absolute', inset: 0, zIndex: 2}}>
              <img src={cupImg} alt="Coffee Cup" className="oh4-dimg-cup" style={{zIndex: 'auto'}} />
            </div>
          </div>
        </div>

      </div>

      {/* ── MENU PANEL (DESKTOP) ── */}
      <div ref={menuPanelRef} className="oh4-menu-panel oh4-desktop-menu-redesign" aria-label="Menu overview">

        {/* Left Side: Accommodates the translated Cup */}
        <div className="oh4-mp-left">
          <div className="oh4-mp-decorations">
            {/* Dashed oval arc around cup */}
            <svg className="oh4-mp-gold-arc" viewBox="0 0 200 300" fill="none">
              <ellipse cx="100" cy="150" rx="88" ry="135" stroke="#eebb4d" strokeWidth="1" strokeDasharray="7 7" />
            </svg>
          </div>
        </div>

        {/* Right Side: Menu Grid — mirrors mobile layout */}
        <div className="oh4-mp-right">
          <div className="oh4-dmp-header">
            <div className="oh4-dmp-subtitle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eebb4d" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Fresh ingredients, daily specials.
            </div>
            <h2 className="oh4-dmp-title">
              Our Menu
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#eebb4d" strokeWidth="1.2" className="oh4-leaf-icon">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              </svg>
              <div className="oh4-dmp-underline" />
            </h2>
          </div>

          <div className="oh4-dmp-grid">
            {CATEGORIES.map((cat) => (
              <Link
                to={`/menu#${cat.id}`}
                key={cat.id}
                className={`oh4-dmp-card${cat.id === 'snacks' ? ' full-width' : ''}${activeModel === cat.id ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
                onClick={() => handleCatClick(cat.id)}
              >
                <div className="oh4-dmp-icon-wrap">
                  {CatIcons[cat.id] || <span style={{ fontSize: '22px' }}>{cat.emoji}</span>}
                </div>
                <div className="oh4-dmp-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                </div>
                <ArrowRight className="oh4-dmp-arrow" size={18} />
              </Link>
            ))}
          </div>

          <Link to="/menu" className="oh4-dmp-btn-full">
            VIEW FULL MENU <ArrowRight size={20} />
          </Link>

          <div className="oh4-mp-footer-row">
            <div className="oh4-mp-footer-center">Good food brings us together.</div>
            <div className="oh4-mp-socials">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLL HINT ── */}
      <span ref={hintRef} className="oh4-scroll-hint" aria-hidden="true">
        ↓ Scroll to explore
      </span>

    </section>
  );
}


