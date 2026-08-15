import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

/* ─────────────────────────────────────────────────────────────────
   OHANA MENU FLIP BOOK  v4  — faithful to the reference SCSS

   Architecture (matches reference code):
   ─ ALL pages stacked on the RIGHT half of the book
   ─ Each page has a front face (right-page content)
            and a back  face (left-page content, rotateY(180deg))
   ─ transform-origin: 0 50%  (spine = left edge of each page)
   ─ Flipped → rotateY(-180deg) — page swings to LEFT, back face shows
   ─ z-index: unflipped pages: top-most first; flipped pages: latest on top
   ─ Only the CURRENTLY ANIMATING page gets the CSS transition
     → React transition fires because the SAME element changes its transform value

   Page stack (index 0 = top of stack):
     0: front=Cover        back=menu3
     1: front=menu1        back=menu2
     2: front=menu4        back=menu5
     3: front=menu6        back=menu7
     4: front=menu8        back=menu9
     5: front=menu10       back=menu11
     6: front=menu12       back=menu13
───────────────────────────────────────────────────────────────── */

const PAGES = [
  { front: '/menu-pages/cover.jpg',  back: '/menu-pages/menu3.png'  },
  { front: '/menu-pages/menu1.png',  back: '/menu-pages/menu2.png'  },
  { front: '/menu-pages/menu4.png',  back: '/menu-pages/menu5.png'  },
  { front: '/menu-pages/menu6.png',  back: '/menu-pages/menu7.png'  },
  { front: '/menu-pages/menu8.png',  back: '/menu-pages/menu9.png'  },
  { front: '/menu-pages/menu10.png', back: '/menu-pages/menu11.png' },
  { front: '/menu-pages/menu12.png', back: '/menu-pages/menu13.png' },
];
const N = PAGES.length; // 4 pages → can be flipped 0-4 times

/* ────── Page content ────── */
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
        fontFamily: "Georgia, serif",
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

function DarkPage() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0C0600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.6rem, 2vw, 0.9rem)', color: 'rgba(182,145,46,0.07)', letterSpacing: '0.5em', textTransform: 'uppercase' }}>Ohana</span>
    </div>
  );
}

function MenuImage({ src, side }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0C0600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
      {/* Spine-edge shadow */}
      {side === 'right' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '18px', background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />}
      {side === 'left'  && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '18px', background: 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />}
    </div>
  );
}

function PageFace({ content, side }) {
  if (content === 'cover') return <CoverPage />;
  if (content === 'dark')  return <DarkPage />;
  return <MenuImage src={content} side={side} />;
}

/* ────── Nav button ────── */
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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hov && !disabled ? '0 0 15px rgba(182,145,46,0.3)' : 'none',
      }}
    >
      <svg 
        width="20" height="20" viewBox="0 0 24 24" fill="none" 
        stroke={disabled ? 'rgba(182,145,46,0.3)' : hov ? '#120A03' : '#B6912E'} 
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{
          transform: hov && !disabled ? `translateX(${isNext ? 3 : -3}px)` : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isNext ? (
          <path d="M5 12h14M12 5l7 7-7 7" />
        ) : (
          <path d="M19 12H5M12 19l-7-7 7-7" />
        )}
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────── */
const FlipBook = forwardRef((props, ref) => {
  const [flipped, setFlipped] = useState(0);
  const [animIdx, setAnimIdx] = useState(-1);
  const busy = useRef(false);
  const DURATION = 700; // slightly faster per-page for rapid sequential flips

  // Mirror flipped into a ref so async callbacks always see the latest value
  const flippedRef = useRef(0);
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  useImperativeHandle(ref, () => ({
    goToPage: (targetIndex) => {
      if (busy.current) return;
      const clampedTarget = Math.max(0, Math.min(targetIndex, N));
      const current = flippedRef.current;
      if (clampedTarget === current) return;

      const direction = clampedTarget > current ? 1 : -1;
      const numSteps = Math.abs(clampedTarget - current);
      let step = 0;

      const doOneFlip = () => {
        if (step >= numSteps) return;
        busy.current = true;

        // pageToAnimate: when going forward, animate current page; backward, animate current-1
        const pageToAnimate = direction > 0 ? flippedRef.current : flippedRef.current - 1;
        setAnimIdx(pageToAnimate);
        const nextFlipped = flippedRef.current + direction;
        flippedRef.current = nextFlipped;
        setFlipped(nextFlipped);

        step++;

        setTimeout(() => {
          setAnimIdx(-1);
          busy.current = false;
          if (step < numSteps) {
            // Brief gap between flips so each turn is visible
            setTimeout(doOneFlip, 80);
          }
        }, DURATION + 80);
      };

      doOneFlip();
    },
  }));


  // Mobile detection
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll container ref for mobile panning
  const scrollRef = useRef(null);

  const snapToLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const snapToRight = () => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
    }
  };

  const goNext = () => {
    if (busy.current || flipped >= N) return;
    busy.current = true;
    setAnimIdx(flipped);
    setFlipped(f => f + 1);
    setTimeout(() => {
      setAnimIdx(-1);
      busy.current = false;
      // Snap to left page AFTER the flip animation finishes
      if (isMobile) snapToLeft();
    }, DURATION + 80);
  };

  const goPrev = () => {
    if (busy.current || flipped <= 0) return;
    busy.current = true;
    const idx = flipped - 1;
    setAnimIdx(idx);
    setFlipped(f => f - 1);
    setTimeout(() => {
      setAnimIdx(-1);
      busy.current = false;
      // Snap to right page AFTER the flip animation finishes
      if (isMobile) snapToRight();
    }, DURATION + 80);
  };

  /* Keyboard */
  const handleKey = (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  };

  /* Touch */
  const touchStartX = useRef(null);

  const onTouchStart = (e) => {
    if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX;
  };


  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX; // positive = swiped left
    touchStartX.current = null;

    if (!isMobile) {
      // Desktop: any swipe flips
      if (Math.abs(dx) > 50) dx > 0 ? goNext() : goPrev();
      return;
    }

    // Mobile: only flip when at the scroll edges
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (dx < -50 && scrollLeft <= 8) {
      // Swiped right while seeing left page → prev spread
      goPrev();
    } else if (dx > 50 && scrollLeft >= maxScroll - 8) {
      // Swiped left while seeing right page → next spread
      goNext();
    }
    // Otherwise native scroll takes over between the two pages
  };

  /* Styles */
  const scrollContainerStyle = isMobile
    ? {
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }
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

        {/* ── SCROLL CONTAINER (doubles as panning layer on mobile) ── */}
        <div
          ref={scrollRef}
          style={scrollContainerStyle}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Hide webkit scrollbar */}
          {isMobile && <style>{`div::-webkit-scrollbar{display:none}`}</style>}

          {/* ── BOOK ── */}
          <div style={bookStyle}>

            {/* Mobile scroll-snap targets.
                Each is an absolutely-positioned inline item covering one half.
                scrollSnapAlign works when the BOOK itself is the scroll content
                and the snap container is the scrollRef div. */}
            {isMobile && (
              <>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', scrollSnapAlign: 'start', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, width: '50%', height: '100%', scrollSnapAlign: 'start', pointerEvents: 'none' }} />
              </>
            )}

            {/* Static dark backgrounds */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: '#0C0600', zIndex: 0 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: '#0C0600', zIndex: 0 }} />

            {/* ── PAGES ── */}
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
                    position: 'absolute',
                    left: '50%', top: 0,
                    width: '50%', height: '100%',
                    transformOrigin: '0 50%',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                    transition: isAnimating
                      ? `transform ${DURATION}ms cubic-bezier(0.645, 0.045, 0.355, 1.000)`
                      : 'none',
                    zIndex,
                    willChange: 'transform',
                  }}
                >
                  {/* FRONT FACE */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}>
                    <PageFace content={page.front} side="right" />
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(to left, rgba(0,0,0,0.18), transparent)', pointerEvents: 'none' }} />
                  </div>

                  {/* BACK FACE */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}>
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

        {/* ── NAVIGATION ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px',
          background: 'rgba(12, 6, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '12px 24px',
          borderRadius: '100px',
          border: '1px solid rgba(182,145,46,0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <NavBtn onClick={goPrev} disabled={flipped === 0} direction="prev" />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '0 10px' }}>
            {Array.from({ length: N + 1 }).map((_, i) => (
              <div key={i} style={{
                width: i === flipped ? '24px' : '6px',
                height: '6px', borderRadius: '3px',
                background: i === flipped ? '#B6912E' : 'rgba(182,145,46,0.35)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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


