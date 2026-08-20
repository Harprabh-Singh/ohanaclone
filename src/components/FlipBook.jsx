import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useContent } from '../content/ContentContext';

/* ─────────────────────────────────────────────────────────────────
   OHANA MENU FLIP BOOK  v5

   Page mapping (flipped = how many pages have been turned):
     flipped=0 → right: cover.jpg
     flipped=1 → left: menu1.png  | right: menu2.png
     flipped=2 → left: menu3.png  | right: menu4.png
     flipped=3 → left: menu5.png  | right: menu6.png
     flipped=4 → left: menu7.png  | right: menu8.png
     flipped=5 → left: menu9.png  | right: menu10.png
     flipped=6 → left: menu11.png | right: menu12.png
     flipped=7 → left: menu13.png | right: (empty)
───────────────────────────────────────────────────────────────── */

/* Pair a flat page list [p0, p1, p2, …] into spreads [{front, back}, …] */
const pairPages = (flat) => {
  const arr = [];
  for (let i = 0; i < flat.length; i += 2) {
    arr.push({ front: flat[i], back: flat[i + 1] || flat[i] });
  }
  return arr;
};

/* Bundled fallback spreads — cover + menu1…menu13 (admin can replace each) */
const DEFAULT_PAGES = pairPages([
  '/menu-pages/cover.jpg',
  ...Array.from({ length: 13 }, (_, i) => `/menu-pages/menu${i + 1}.png`),
]);

/* ────── Sub-components ────── */
function CoverPage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(155deg, #140B03 0%, #1E1106 55%, #100800 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '28%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(182,145,46,0.28) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ width: '30px', height: '1px', background: '#B6912E' }} />
        <span style={{ fontSize: '7px', letterSpacing: '0.5em', color: '#B6912E', fontWeight: '700', textTransform: 'uppercase' }}>
          Cafe Kitchen &amp; Terraces
        </span>
        <div style={{ width: '30px', height: '1px', background: '#B6912E' }} />
      </div>
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: 'clamp(2rem, 6vw, 4.5rem)',
        fontWeight: '700', color: '#FFF8EC',
        letterSpacing: '0.2em',
        textShadow: '0 0 50px rgba(182,145,46,0.5)',
        marginBottom: '4px',
      }}>OHANA</div>
      <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, transparent, #B6912E, transparent)', margin: '12px auto 18px' }} />
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.75rem, 2.5vw, 1.3rem)', color: 'rgba(255,248,236,0.6)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Food Menu
      </div>
      <div style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.8rem)', color: '#B6912E', letterSpacing: '0.38em', textTransform: 'uppercase', fontWeight: '700' }}>
        11 AM – 10 PM
      </div>
      <div style={{ position: 'absolute', bottom: '20px', textAlign: 'center' }}>
        <div style={{ width: '28px', height: '1px', background: 'rgba(182,145,46,0.3)', margin: '0 auto 8px' }} />
        <span style={{ fontSize: '7px', letterSpacing: '0.25em', color: 'rgba(255,248,236,0.2)', textTransform: 'uppercase' }}>
          Above KFC · Gar-Ali · Jorhat
        </span>
      </div>
      {/* Left spine shadow */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20px', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

function MenuImage({ src, side }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0C0600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
      {side === 'right' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '18px', background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />}
      {side === 'left'  && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '18px', background: 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />}
    </div>
  );
}

function PageFace({ content, side }) {
  if (content === 'cover') return <CoverPage />;
  return <MenuImage src={content} side={side} />;
}

function NavBtn({ onClick, disabled, direction }) {
  const [hov, setHov] = useState(false);
  const isNext = direction === 'next';
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        border: `1px solid ${disabled ? 'rgba(182,145,46,0.15)' : hov ? '#B6912E' : 'rgba(182,145,46,0.6)'}`,
        background: disabled ? 'transparent' : hov ? '#B6912E' : 'rgba(182,145,46,0.05)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: hov && !disabled ? '0 0 15px rgba(182,145,46,0.3)' : 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={disabled ? 'rgba(182,145,46,0.3)' : hov ? '#120A03' : '#B6912E'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: hov && !disabled ? `translateX(${isNext ? 3 : -3}px)` : 'translateX(0)', transition: 'transform 0.3s ease' }}
      >
        {isNext ? <path d="M5 12h14M12 5l7 7-7 7" /> : <path d="M19 12H5M12 19l-7-7 7-7" />}
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN FLIPBOOK COMPONENT
───────────────────────────────────────────────────────────────── */
const FlipBook = forwardRef(({ onPageChange }, ref) => {
  const [flipped, setFlipped] = useState(0);
  const [animIdx, setAnimIdx] = useState(-1);
  const busy = useRef(false);
  const DURATION = 700;

  // Use refs for values needed inside async closures (avoid stale state)
  const flippedRef = useRef(0);
  const isMobileRef = useRef(false);
  const scrollRef = useRef(null);
  const touchStartX = useRef(null);

  // Sync flippedRef with state
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  /* Pages from the content store (admin-editable) with bundled fallback */
  const contentCtx = useContent();
  const flatPages = (contentCtx && Array.isArray(contentCtx.content?.menuPages) && contentCtx.content.menuPages.length >= 2)
    ? contentCtx.content.menuPages
    : null;
  const PAGES = useMemo(() => (flatPages ? pairPages(flatPages) : DEFAULT_PAGES), [flatPages]);
  const N = PAGES.length;
  const nRef = useRef(N); nRef.current = N;

  /* Clamp the flip state if the book shrank after an admin edit */
  useEffect(() => {
    if (flippedRef.current > N) {
      flippedRef.current = N;
      setFlipped(N);
    }
  }, [N]);

  // Notify parent of the current spread index (0..N) whenever it settles.
  // Fires once per flip step; consumers that care only about the final
  // landing page should debounce this callback.
  const onPageChangeRef = useRef(onPageChange);
  useEffect(() => { onPageChangeRef.current = onPageChange; }, [onPageChange]);
  useEffect(() => { if (onPageChangeRef.current) onPageChangeRef.current(flipped); }, [flipped]);

  // Mobile detection using ref so it's always current inside closures
  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth <= 768; };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // isMobile state for render-time decisions
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Snap helpers ── */
  const snapLeft  = () => { if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); };
  const snapRight = () => { if (scrollRef.current) scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' }); };

  /* ── Initial mobile position ──
     On mobile the book is 170vw wide and the browser starts the scroll
     container at left:0 — the BLANK left half. Snap instantly (behavior:
     'auto', so no motion at all — safe for reduced-motion users) to the
     right half so the cover is the first thing a mobile visitor sees.
     Runs once on mount; desktop layout is untouched. */
  useEffect(() => {
    if (isMobileRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'auto' });
    }
  }, []);

  /* ── Single step flip ── */
  const doFlipStep = (direction, onDone) => {
    busy.current = true;
    const pageIdx = direction > 0 ? flippedRef.current : flippedRef.current - 1;
    setAnimIdx(pageIdx);
    flippedRef.current += direction;
    setFlipped(flippedRef.current);
    setTimeout(() => {
      setAnimIdx(-1);
      busy.current = false;
      if (onDone) onDone();
    }, DURATION + 80);
  };

  /* ── goNext / goPrev ── */
  const goNext = () => {
    if (busy.current || flippedRef.current >= nRef.current) return;
    doFlipStep(1, () => { if (isMobileRef.current) snapLeft(); });
  };
  const goPrev = () => {
    if (busy.current || flippedRef.current <= 0) return;
    doFlipStep(-1, () => { if (isMobileRef.current) snapRight(); });
  };

  /* ── External goToPage (exposed via ref) ── */
  useImperativeHandle(ref, () => ({
    goToPage: (targetIndex, side = 'left') => {
      if (busy.current) return;
      const clamped = Math.max(0, Math.min(targetIndex, nRef.current));
      const current = flippedRef.current;
      if (clamped === current) {
        // Already on the right spread — just pan
        if (isMobileRef.current) side === 'right' ? snapRight() : snapLeft();
        return;
      }
      const direction  = clamped > current ? 1 : -1;
      const totalSteps = Math.abs(clamped - current);
      let step = 0;

      const next = () => {
        if (step >= totalSteps) {
          // All done — pan mobile
          if (isMobileRef.current) {
            // Small delay so the last flip renders before panning
            setTimeout(() => { side === 'right' ? snapRight() : snapLeft(); }, 80);
          }
          return;
        }
        doFlipStep(direction, () => {
          step++;
          if (step < totalSteps) setTimeout(next, 80);
          else next(); // call once more to trigger the pan
        });
      };
      next();
    },
  }));

  /* ── Keyboard ── */
  const handleKey = (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  };

  /* ── Touch ── */
  const onTouchStart = (e) => {
    if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (!isMobileRef.current) {
      if (Math.abs(dx) > 50) dx > 0 ? goNext() : goPrev();
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (dx < -50 && scrollLeft <= 8)               goPrev();
    else if (dx > 50 && scrollLeft >= maxScroll - 8) goNext();
  };

  /* ── Styles ── */
  const scrollContainerStyle = isMobile
    ? { width: '100%', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }
    : { width: '100%', maxWidth: '1400px' };

  const bookStyle = {
    position: 'relative',
    width: isMobile ? '170vw' : '100%',
    aspectRatio: '1.55 / 1',
    maxHeight: isMobile ? '85vh' : '76vh',
    minHeight: '300px',
    perspective: '2400px',
    perspectiveOrigin: '50% 50%',
    boxShadow: '0 60px 120px -16px rgba(0,0,0,0.95), 0 0 0 1px rgba(182,145,46,0.09)',
    borderRadius: '3px',
    background: '#0C0600',
  };

  return (
    <div tabIndex={0} onKeyDown={handleKey} style={{ outline: 'none', width: '100%' }}>
      <div style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(182,145,46,0.09) 0%, #070501 55%, #050305 100%)',
        padding: 'clamp(48px, 8vh, 110px) clamp(20px, 4vw, 48px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px',
      }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '1px', background: '#B6912E' }} />
          <span style={{ fontSize: '8px', fontWeight: '800', letterSpacing: '0.55em', textTransform: 'uppercase', color: '#B6912E' }}>
            The Full Menu
          </span>
          <div style={{ width: '36px', height: '1px', background: '#B6912E' }} />
        </div>

        {/* Scroll / pan container */}
        <div ref={scrollRef} style={scrollContainerStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {isMobile && <style>{`div::-webkit-scrollbar{display:none}`}</style>}

          {/* Book */}
          <div style={bookStyle}>
            {/* Mobile snap targets */}
            {isMobile && (
              <>
                <div style={{ position: 'absolute', left: 0,    top: 0, width: '50%', height: '100%', scrollSnapAlign: 'start', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, width: '50%', height: '100%', scrollSnapAlign: 'start', pointerEvents: 'none' }} />
              </>
            )}

            {/* Static backgrounds */}
            <div style={{ position: 'absolute', left: 0,  top: 0, width: '50%', height: '100%', background: '#0C0600', zIndex: 0 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: '#0C0600', zIndex: 0 }} />

            {/* Pages */}
            {PAGES.map((page, i) => {
              const isFlipped   = i < flipped;
              const isAnimating = i === animIdx;
              let zIndex;
              if (isAnimating)    zIndex = 100;
              else if (isFlipped) zIndex = i + 1;
              else                zIndex = (N - i) + N;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute', left: '50%', top: 0,
                    width: '50%', height: '100%',
                    transformOrigin: '0 50%',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                    transition: isAnimating ? `transform ${DURATION}ms cubic-bezier(0.645, 0.045, 0.355, 1.000)` : 'none',
                    zIndex, willChange: 'transform',
                  }}
                >
                  {/* Front face (right page) */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
                    <PageFace content={page.front} side="right" />
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(to left, rgba(0,0,0,0.18), transparent)', pointerEvents: 'none' }} />
                  </div>
                  {/* Back face (left page) */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <PageFace content={page.back} side="left" />
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)', pointerEvents: 'none' }} />
                  </div>
                </div>
              );
            })}

            {/* Centre spine */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: '3px', transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent 5%, rgba(182,145,46,0.5) 25%, rgba(182,145,46,0.5) 75%, transparent 95%)',
              zIndex: 200, pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px',
          background: 'rgba(12, 6, 0, 0.6)', backdropFilter: 'blur(10px)',
          padding: '12px 24px', borderRadius: '100px',
          border: '1px solid rgba(182,145,46,0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <NavBtn onClick={goPrev} disabled={flipped === 0} direction="prev" />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '0 10px' }}>
            {Array.from({ length: N + 1 }).map((_, i) => (
              <div key={i} style={{
                width: i === flipped ? '24px' : '6px',
                height: '6px', borderRadius: '3px',
                background: i === flipped ? '#B6912E' : 'rgba(182,145,46,0.35)',
                transition: 'all 0.4s ease',
                boxShadow: i === flipped ? '0 0 8px rgba(182,145,46,0.4)' : 'none',
              }} />
            ))}
          </div>
          <NavBtn onClick={goNext} disabled={flipped >= N} direction="next" />
        </div>

        {/* Hint */}
        <p style={{ fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: '600' }}>
          {isMobile ? 'Swipe at page edge · Use arrows' : 'Arrows · Swipe · Keyboard ←→'}
        </p>
      </div>
    </div>
  );
});

export default FlipBook;
