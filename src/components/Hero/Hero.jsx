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

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import cupImg from './ui/cup.png';
import dishesImg from './ui/dishes.png';
import { useContent } from '../../content/ContentContext';
import { defaultShowcase } from '../../content/defaults';
import { categoryBookMap } from '../../data/menuData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowRight, MapPin, ChefHat, Users, Heart, Star } from 'lucide-react';
import useMouseParallax from './useMouseParallax';
import SplitText from './SplitText';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
/* CATEGORIES — built from the editable content store (see /admin → Home
   Page → Hero showcase). Each slot points at a menu category; the item
   count and "from ₹" price are computed live from the menu data, and the
   deep-link target comes from categoryBookMap — so the admin only picks
   a subheading and everything else stays in sync automatically. The
   first slot (coffee) is the scroll-animation anchor and stays fixed. */
const priceOf = (p) => {
  if (typeof p === 'number') return p;
  const m = String(p).match(/\d+/);
  return m ? Number(m[0]) : Infinity;
};
const computeStats = (items, slug) => {
  const list = items.filter((it) => it.category === slug);
  if (!list.length) return ['0 items', '—'];
  const min = Math.min(...list.map((it) => priceOf(it.price)));
  return [`${list.length} item${list.length === 1 ? '' : 's'}`, `from ₹${min}`];
};
const buildCategories = (content) => {
  const showcase = (content && Array.isArray(content.showcase) && content.showcase.length)
    ? content.showcase : defaultShowcase;
  const items = (content && content.menu && content.menu.items) || [];
  return showcase.map((slot) => ({
    id: slot.id,
    name: slot.name,
    img: slot.img,
    desc: slot.desc,
    mob: slot.mob || { w: 100, h: 118, x: 0, y: 0 },
    stats: slot.categorySlug ? computeStats(items, slot.categorySlug) : (slot.stats || ['', '']),
    book: slot.categorySlug
      ? (categoryBookMap[slot.categorySlug] || { flip: 1, side: 'left' })
      : { flip: 7, side: 'left' },
  }));
};

/* Deep-link to the /menu flipbook: /menu?flip=N&side=left|right lands the
   book on the matching spread. `book` targets mirror The Index ledger on
   /menu exactly (coffee→Hot Brews, drinks→Mojito & Coolers, burgers→Hot
   Dogs, pizzas→Pizza, pasta→Pasta & Spaghetti, cakes→Dessert, snacks→
   Appetizers), so both hero surfaces share one contract. */
const menuBookUrl = (cat) => `/menu?flip=${cat.book.flip}&side=${cat.book.side}`;

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

export default function Hero() {
  /* Editable showcase categories from the content store (falls back to
     the bundled defaults outside the provider / before hydration). */
  const contentCtx = useContent();
  const CATEGORIES = useMemo(
    () => buildCategories(contentCtx ? contentCtx.content : null),
    [contentCtx ? contentCtx.content : null]
  );
  const CATEGORIESRef = useRef(CATEGORIES);
  CATEGORIESRef.current = CATEGORIES;

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

  // ── THE REEL (desktop) — cursor-follow dish preview ──────
  // reelPreviewApiRef is populated by the effect below; row hover
  // handlers call into it without re-rendering React.
  const reelPreviewRef = useRef(null);
  const reelPreviewApiRef = useRef({ show: () => {}, hide: () => {}, swap: () => {} });

  const handleReelEnter = useCallback((cat) => {
    handleCatClick(cat.id);
    reelPreviewApiRef.current.swap(cat.img);
    reelPreviewApiRef.current.show();
  }, [handleCatClick]);

  // ── MOBILE DISH STAGE — full-screen swipeable pager, rebuilt on the
  // phone's OWN scroller: the track lives in a native overflow-x container
  // with scroll-snap, so the dish follows the finger 1:1, glides with real
  // momentum, and settles gently onto the next slide. No custom drag math,
  // no velocity thresholds, no snap-back jumps. Active slide, ghost-word
  // parallax and the coffee-cup handoff are all derived from scrollLeft.
  // Tap (no scroll) still navigates via the Link — browsers suppress the
  // click automatically after a real scroll gesture.
  const [mIdx, setMIdx] = useState(0);
  const mIdxRef = useRef(0);
  const mStageRef = useRef(null);
  const mScrollerRef = useRef(null);
  const mTrackRef = useRef(null);
  const mGhostRef = useRef(null);
  const mScrollRaf = useRef(0);

  // Slide step = 76% of the stage width. Slides are 76% wide, centered by
  // the track's 12% side padding, so scrollLeft of slide i is exactly
  // i * step — this is what makes snap-centering and index math agree.
  const slideStep = () => (mStageRef.current?.clientWidth ?? 1) * 0.76;

  const goToIdx = useCallback((i) => {
    const clamped = Math.max(0, Math.min(CATEGORIESRef.current.length - 1, i));
    mScrollerRef.current?.scrollTo({ left: clamped * slideStep(), behavior: 'smooth' });
  }, []);

  const onStageScroll = () => {
    if (mScrollRaf.current) return;
    mScrollRaf.current = requestAnimationFrame(() => {
      mScrollRaf.current = 0;
      const sc = mScrollerRef.current;
      if (!sc) return;
      const step = slideStep();
      const idx = Math.max(0, Math.min(CATEGORIESRef.current.length - 1, Math.round(sc.scrollLeft / step)));
      if (idx !== mIdxRef.current) {
        mIdxRef.current = idx;
        setMIdx(idx);
      }
      // Ghost word trails at 35% of the offset from the active slide —
      // the halfway jump is masked by the word-change animation.
      if (mGhostRef.current) {
        mGhostRef.current.style.transform = `translateX(${-(sc.scrollLeft - idx * step) * 0.35}px)`;
      }
      // The docked coffee cup hands off continuously over the first
      // half-slide of scroll, and fades back in as coffee returns.
      if (mobileCupRef.current) {
        mobileCupRef.current.style.opacity = String(Math.max(0, 1 - sc.scrollLeft / (step * 0.5)));
      }
    });
  };

  // Ref to prevent multiple snap animations firing simultaneously
  const isSnappingRef = useRef(false);
  // Ref to track previous scroll progress for threshold detection
  const prevProgressRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ── Mobile scroll normalization ────────────────────────
    // On mobile, the browser's native scroll can fire BEFORE GSAP has
    // finished establishing the pin, causing the hero to visually jump
    // upward then snap back. normalizeScroll takes over scroll handling
    // from the browser on touch devices so GSAP is always in control.
    const isMobileDevice = window.innerWidth <= 700;
    // We explicitly DO NOT use GSAP normalizeScroll here.
    // Hijacking native touch scrolling into the main JS thread is the #1 cause
    // of scroll lag on mobile devices. We rely on native scrolling and CSS pinning.

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
    let normalizer = null;
    let normalizerOn = false;
    if (isMobileDevice) {
      // Kill rubber-band / elastic overscroll — prevents the whole page
      // from bouncing up before the pin registers
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.overscrollBehavior = 'none';
      // GSAP takes ownership of the scroll axis on touch
      normalizer = ScrollTrigger.normalizeScroll({ allowNestedScroll: true, lockAxis: false });
      normalizerOn = true;
    }
    
    const catBar = root.querySelector('.oh4-cat-bar');
    const stamp = root.querySelector('.oh4-stamp');
    const flourish = root.querySelector('.oh4-flourish');
    const hint = hintRef.current;
    const panel = menuPanelRef.current;
    const statsBar = statsBarRef.current;
    const textLayer = textLayerRef.current;
    const catCards = panel?.querySelectorAll('.oh4-reel-row') ?? [];
    const canvasWrap = root.querySelector('.oh4-canvas-wrap');

    // ── Cup docking target ────────────────────────────────
    // The SAME hero cup element travels into the dish stage's coffee
    // slot as scroll progresses — no hide-and-replace. Deltas are
    // computed from transform-free layout geometry (offsetParent
    // chain) once per refresh, so the per-tick scroll handler never
    // triggers getBoundingClientRect reflows.
    const cupDelta = { x: 0, y: -window.innerHeight * 0.35, scale: 2.15 };
    const measureCupTarget = () => {
      const cup = mobileCupRef.current;
      const stage = mStageRef.current;
      if (!cup || !stage || window.innerWidth > 700) return;
      const centerOf = (el) => {
        let x = 0, y = 0, n = el;
        while (n && n !== root) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent;
        }
        return {
          cx: x + el.offsetWidth / 2,
          cy: y + el.offsetHeight / 2,
          w: el.offsetWidth,
          h: el.offsetHeight,
        };
      };
      const c = centerOf(cup);
      const s = centerOf(stage);
      if (!c.h || !s.h) return; // image not decoded yet — keep fallback
      cupDelta.x = s.cx - c.cx;
      cupDelta.y = s.cy - c.cy;
      cupDelta.scale = Math.min((s.h * 1.14) / c.h, (s.w * 0.76 * 1.1) / c.w);
    };
    measureCupTarget();
    // The cup's measured height depends on its intrinsic aspect ratio — if
    // we measure before the image decodes, we silently keep the rough
    // fallback and the cup docks too high (the "sometimes wrong, fine after
    // refresh" race). Re-measure as soon as the images actually load.
    [mobileCupRef.current, mobileDishesRef.current].forEach((img) => {
      if (img && !(img.complete && img.naturalWidth)) {
        img.addEventListener('load', measureCupTarget, { once: true });
      }
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureCupTarget).catch(() => {});
    }
    // The cup is purely visual — never intercept taps on the stage.
    if (mobileCupRef.current) mobileCupRef.current.style.pointerEvents = 'none';

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
    gsap.set(titleLetters, { opacity: 0 });
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
    const isMobile = window.innerWidth <= 700;

    // Helper: smoothly animate window scroll to a target Y position.
    // While animating, native wheel/touch events are suppressed so the
    // user's momentum cannot compete with the programmatic scroll.
    const smoothScrollTo = (targetY, duration = 2.4) => {
      if (isSnappingRef.current) return;
      isSnappingRef.current = true;

      // Block native scroll so trackpad inertia / mouse-wheel can't fight us
      const preventScroll = (e) => { e.preventDefault(); };
      document.addEventListener('wheel',     preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });

      gsap.to(window, {
        scrollTo: { y: targetY, autoKill: false },
        duration,
        ease: 'power1.inOut',
        onComplete: () => {
          document.removeEventListener('wheel',     preventScroll);
          document.removeEventListener('touchmove', preventScroll);
          // Brief grace period before allowing another snap
          setTimeout(() => { isSnappingRef.current = false; }, 400);
        },
      });
    };

    // We need the ScrollTrigger instance to compute target scroll positions
    let st;
    st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => window.innerWidth > 700 ? '+=400%' : '+=160%',
      pin: true,
      pinSpacing: true,
      scrub: isMobile ? 0.4 : 1,  // tighter on mobile = silky, no perceptible lag
      anticipatePin: 1,           // prevents a flash/jump when the pin fires
      onRefresh: measureCupTarget, // re-measure the cup's docking target
      onUpdate: (self) => {
        const p = self.progress;
        const prevP = prevProgressRef.current;
        prevProgressRef.current = p;
        scrollProgress.current = p;

        // ── Park normalizeScroll while the menu owns the screen ──
        // With the menu fully open, the normalizer's touchmove
        // interception fights the dish-stage drag (page micro-scrolls
        // during a swipe = the "snapping" jank). Disabled here, the
        // stage's own axis lock handles vertical scrolls manually.
        if (normalizer) {
          if (p > 0.9 && normalizerOn) {
            normalizer.disable();
            normalizerOn = false;
          } else if (p < 0.85 && !normalizerOn) {
            normalizer.enable();
            normalizerOn = true;
          }
        }

        // ── Auto-snap: forbidden zone enforcement ────────
        // Any scroll into the middle zone glides to the nearest resting
        // state (menu fully open / hero fully closed) — same behavior on
        // desktop and mobile, so nobody has to manually crank through the
        // pin range.
        if (!isSnappingRef.current && p > 0.05 && p < 0.95) {
          const scrollStart = self.start;
          const scrollEnd   = self.end;
          const totalRange  = scrollEnd - scrollStart;

          if (self.direction === 1) {
            // Scrolling DOWN — snap to 95% (menu panel)
            smoothScrollTo(scrollStart + totalRange * 0.95);
          } else {
            // Scrolling UP — snap back to absolute top (0%)
            smoothScrollTo(scrollStart);
          }
        }

        // ── Return the dish stage to coffee on scroll-up intent ──
        // If the user paged to another dish (cup stepped aside) and
        // starts scrolling up from the menu, slide the stage back to
        // coffee and fade the cup back in FIRST — so by the time the
        // cup travels home it's already the coffee dish again, with
        // no sudden reappearance mid-journey.
        if (self.direction === -1 && p > 0.85 && mIdxRef.current !== 0) {
          goToIdx(0);
        }

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

        // ── Dish-stage reset on scroll-back-to-top ────────
        // If the user paged away from coffee and then scrolls back to
        // the hero, snap the stage back to coffee and bring the cup
        // home so the next scroll-down starts clean.
        if (p < RESET_THRESHOLD && mIdxRef.current !== 0) {
          mIdxRef.current = 0;
          setMIdx(0);
          mScrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' });
          if (mGhostRef.current) mGhostRef.current.style.transform = '';
          if (mobileCupRef.current) mobileCupRef.current.style.opacity = '1';
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

        // ── 1c. Mobile cup TRAVELS into the menu stage ────
        // Same element, straight-line dock from its hero position
        // to the stage's coffee slot (measured in cupDelta).
        if (mobileCupRef.current) {
          const cp = Math.min(p, 0.9) / 0.9;
          const x = cupDelta.x * cp;
          const y = cupDelta.y * cp;
          const scale = 2 + (cupDelta.scale - 2) * cp;
          mobileCupRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
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
          // Once the menu owns the screen, lift the docked cup above
          // the stage layer so it reads as the coffee dish itself.
          if (mobileCupRef.current) {
            mobileCupRef.current.style.zIndex = menuOp > 0.5 ? '30' : '10';
          }
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
      if (normalizer) normalizer.kill();
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      document.body.classList.remove('has-hero');
      document.documentElement.classList.remove('has-hero');
    };
  }, []);

  // ── THE REEL: floating dish preview that trails the cursor ──
  // rAF lerp loop writes transform on the OUTER wrapper only; GSAP owns
  // opacity/scale on the INNER wrapper (show/hide) and on the <img>
  // (crossfade swap) so the three never fight over the same property.
  useEffect(() => {
    const panel = menuPanelRef.current;
    const preview = reelPreviewRef.current;
    if (!panel || !preview) return;
    const inner = preview.querySelector('.oh4-reel-preview-inner');
    const img = preview.querySelector('img');
    if (!inner || !img) return;

    const pos = { x: 0, y: 0, tx: 0, ty: 0, rot: 0 };
    let raf = null;
    let running = false;

    const tick = () => {
      const dx = pos.tx - pos.x;
      pos.x += dx * 0.12;
      pos.y += (pos.ty - pos.y) * 0.12;
      const targetRot = Math.max(-8, Math.min(8, dx * 0.12));
      pos.rot += (targetRot - pos.rot) * 0.08;
      preview.style.transform =
        `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -62%) rotate(${pos.rot}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = panel.getBoundingClientRect();
      pos.tx = e.clientX - r.left;
      pos.ty = e.clientY - r.top;
      if (!running) {
        pos.x = pos.tx;
        pos.y = pos.ty;
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    reelPreviewApiRef.current = {
      show: () => {
        gsap.to(inner, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
      },
      hide: () => {
        gsap.to(inner, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
      },
      swap: (src) => {
        if (img.dataset.cur === src) return;
        img.dataset.cur = src;
        gsap.timeline()
          .to(img, { opacity: 0, scale: 0.9, duration: 0.14, ease: 'power2.in',
            onComplete: () => { img.src = src; } })
          .to(img, { opacity: 1, scale: 1, duration: 0.38, ease: 'expo.out' });
      },
    };

    const rowsWrap = panel.querySelector('.oh4-reel-rows');
    const onLeave = () => reelPreviewApiRef.current.hide();
    panel.addEventListener('mousemove', onMove);
    if (rowsWrap) rowsWrap.addEventListener('mouseleave', onLeave);

    return () => {
      panel.removeEventListener('mousemove', onMove);
      if (rowsWrap) rowsWrap.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the mobile stage centered on the active slide across resizes —
  // the step width changes with the viewport, so re-apply scrollLeft.
  useEffect(() => {
    const onResize = () => {
      mScrollerRef.current?.scrollTo({ left: mIdxRef.current * slideStep(), behavior: 'auto' });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="oh4-mstage-header">
            <span className="oh4-reel-eyebrow">Fresh ingredients · Daily specials</span>
            <h2 className="oh4-menu-title oh4-mreel-title">
              <SplitText text="Our" className="oh4-reel-title-solid" />
              <SplitText text="Menu" className="oh4-reel-title-italic" />
            </h2>
          </div>

          {/* Full-screen dish stage — swipe left/right to travel between
              categories. The coffee slide is an EMPTY docking slot: the
              actual hero cup travels here on scroll (see 1c/cupDelta)
              and parks in this space, so the cup you watched rise is
              the same element sitting in the menu — no replacement. */}
          <div ref={mStageRef} className="oh4-mstage">
            <div className="oh4-mstage-glow" aria-hidden="true" />

            {/* Editorial ruler — frames the stage like a printed index */}
            <div className="oh4-mstage-ruler" aria-hidden="true">
              <span>Menu index</span>
              <span>{String(CATEGORIES.length).padStart(2, '0')} sections</span>
            </div>

            {/* Giant outlined category word bleeding behind the dish —
                parallaxes at 35% of the scroll offset */}
            <div ref={mGhostRef} className="oh4-mstage-ghost" aria-hidden="true">
              <span key={mIdx} className="oh4-mstage-ghost-word">
                {CATEGORIES[mIdx].name}
              </span>
            </div>

            {/* The native scroller — the ONLY moving part. momentum +
                snap come straight from the phone's own scroll engine. */}
            <div
              ref={mScrollerRef}
              className="oh4-mstage-scroll"
              onScroll={onStageScroll}
            >
              <div ref={mTrackRef} className="oh4-mstage-track">
                {CATEGORIES.map((cat, i) => (
                  <Link
                    to={menuBookUrl(cat)}
                    key={cat.id}
                    className={`oh4-mstage-slide${i === mIdx ? ' on' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    {cat.id === 'coffee' ? (
                      <span className="oh4-mstage-cup-slot" aria-hidden="true" />
                    ) : (
                      /* Position wrapper carries the admin-tuned x/y shift so it
                         never fights the img's float animation; w/h size the dish
                         box relative to the slide (/admin → Home Page). */
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', height: '100%',
                        transform: `translate(${cat.mob.x || 0}%, ${cat.mob.y || 0}%)`,
                      }}>
                        <img
                          src={cat.img} alt={cat.name} draggable="false"
                          style={{ width: `${cat.mob.w || 100}%`, height: `${cat.mob.h || 118}%`, maxWidth: 'none' }}
                        />
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Editorial meta — the huge name overlaps the dish's lower
              edge (negative margin), then a hairline ledger row carries
              the facts: position / item count / price floor. */}
          <div className="oh4-mstage-meta" key={mIdx}>
            <h3 className="oh4-mstage-name">{CATEGORIES[mIdx].name}</h3>
            <p className="oh4-mstage-tag">{CATEGORIES[mIdx].desc}</p>
          </div>

          <div className="oh4-mstage-ledger">
            <span>{String(mIdx + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}</span>
            <span className="oh4-mstage-ledger-gold">{CATEGORIES[mIdx].stats[0]}</span>
            <span>{CATEGORIES[mIdx].stats[1]}</span>
          </div>

          <div className="oh4-mstage-progress">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                type="button"
                className={`oh4-mstage-seg${i === mIdx ? ' on' : ''}`}
                onClick={() => goToIdx(i)}
                aria-label={`Go to ${cat.name}`}
              />
            ))}
          </div>

          <span className="oh4-mstage-hint">Swipe · Tap the dish to open its page</span>

          <Link to="/menu" className="oh4-reel-full oh4-mreel-full">
            <span>View full menu</span>
            <ArrowRight size={14} />
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

        {/* Right Side: THE REEL — typography-led category index.
            Rows are classed .oh4-reel-row so the scroll-scrub stagger
            (section 5 of onUpdate) drives their entrance. */}
        <div className="oh4-mp-right">
          <div className="oh4-reel-header">
            <span className="oh4-reel-eyebrow">Fresh ingredients · Daily specials</span>
            <h2 className="oh4-menu-title oh4-reel-title">
              <SplitText text="Our" className="oh4-reel-title-solid" />
              <SplitText text="Menu" className="oh4-reel-title-italic" />
            </h2>
          </div>

          <div className="oh4-reel-rows">
            {CATEGORIES.map((cat, i) => (
              <Link
                to={menuBookUrl(cat)}
                key={cat.id}
                className={`oh4-reel-row${activeModel === cat.id ? ' active' : ''}`}
                onMouseEnter={() => handleReelEnter(cat)}
                onFocus={() => handleReelEnter(cat)}
              >
                <span className="oh4-reel-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="oh4-reel-name">{cat.name}</span>
                <span className="oh4-reel-tag">{cat.desc}</span>
                <span className="oh4-reel-arrow"><ArrowRight size={18} /></span>
              </Link>
            ))}
          </div>

          <Link to="/menu" className="oh4-reel-full">
            <span>View full menu</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Floating dish preview — trails the cursor over the reel,
            crossfades to whichever category row is hovered. */}
        <div ref={reelPreviewRef} className="oh4-reel-preview" aria-hidden="true">
          <div className="oh4-reel-preview-inner">
            <img src={CATEGORIES[0].img} alt="" data-cur={CATEGORIES[0].img} />
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


