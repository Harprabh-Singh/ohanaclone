import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────── DATA ─────────────────── */
const DISHES = [
  {
    id: 0,
    name: 'Tandoori Chicken Sausage Pizza',
    short: 'PIZZA',
    tagline: 'Tandoor meets Naples.',
    sub: 'Smoky. Spiced. Dangerous.',
    price: 320,
    tag: 'SIGNATURE',
    accent: '#E8742A',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=90',
    imgPos: 'right',
  },
  {
    id: 1,
    name: 'Dragon Fiery Chicken Wings',
    short: 'WINGS',
    tagline: 'Crackling skin.',
    sub: 'Volcanic heat. The kind you crave tomorrow.',
    price: 280,
    tag: 'MOST ORDERED',
    accent: '#D42020',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1400&q=90',
    imgPos: 'left',
  },
  {
    id: 2,
    name: 'Ohana Chunky Shake',
    short: 'SHAKE',
    tagline: 'Thick. Cold.',
    sub: 'Devastating. Three words. No more needed.',
    price: 180,
    tag: 'CHEF PICK',
    accent: '#C42D78',
    image: 'https://images.unsplash.com/photo-1553787499-6f9133242796?auto=format&fit=crop&w=1400&q=90',
    imgPos: 'right',
  },
  {
    id: 3,
    name: 'Grilled Chicken Club Sandwich',
    short: 'SANDWICH',
    tagline: 'Triple-decker.',
    sub: 'Pressed to perfection. Layered with intent.',
    price: 220,
    tag: 'CHEF PICK',
    accent: '#B6912E',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1400&q=90',
    imgPos: 'left',
  },
  {
    id: 4,
    name: 'Death By Chocolate Brownie',
    short: 'BROWNIE',
    tagline: 'With vanilla ice cream.',
    sub: 'Criminal. You already know.',
    price: 160,
    tag: 'FAN FAVOURITE',
    accent: '#7B3F00',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=90',
    imgPos: 'right',
  },
];

const TOTAL = DISHES.length;

/* ─────────────────── ANIMATED PRICE ─────────────────── */
function PriceCounter({ value, color }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    if (!ref.current || prev.current === value) { prev.current = value; return; }
    const start = prev.current, end = value, dur = 420, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      if (ref.current) ref.current.textContent = '₹' + Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick);
      else { if (ref.current) ref.current.textContent = '₹' + end; prev.current = end; }
    };
    requestAnimationFrame(tick);
    prev.current = value;
  }, [value]);
  return <span ref={ref} style={{ color }}>₹{value}</span>;
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '180,145,46';
}

/* ─────────────────── MAIN ─────────────────── */
export default function HouseFavourites() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const wrapRef        = useRef(null);
  const stickyRef      = useRef(null);
  const imgRef         = useRef(null);
  const bgWordRef      = useRef(null);
  const taglineRef     = useRef(null);
  const subRef         = useRef(null);
  const priceValRef    = useRef(null);
  const mobilePriceRef = useRef(null);
  const indexRef       = useRef(null);
  const tagRef         = useRef(null);
  const nameRef        = useRef(null);
  const ctaRef         = useRef(null);
  const progressRef    = useRef(null);
  const rafRef         = useRef(null);
  const mouseRef       = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });
  const activeRef      = useRef(0);
  const isMobileRef    = useRef(false);
  const hasEnteredRef  = useRef(false);
  const tlRef          = useRef(null);
  // For debounced scroll snap on mobile
  const snapTimerRef   = useRef(null);
  const lastProgressRef= useRef(0);

  const d = DISHES[active];

  useEffect(() => {
    DISHES.forEach(dish => { const i = new window.Image(); i.src = dish.image; });
    isMobileRef.current = window.innerWidth < 768;
  }, []);

  useEffect(() => {
    const onResize = () => { isMobileRef.current = window.innerWidth < 768; };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ─────── DISH TRANSITION (no out-animation, clean in) ─────── */
  const triggerDishTransition = useCallback((idx) => {
    if (idx === activeRef.current) return;
    activeRef.current = idx;

    const dish = DISHES[idx];
    const isMobile = isMobileRef.current;
    const priceEl = isMobile ? mobilePriceRef.current : priceValRef.current;

    const allTextEls = [
      nameRef.current, tagRef.current, taglineRef.current,
      subRef.current, ctaRef.current,
    ].filter(Boolean);

    // Kill any running animation immediately
    if (tlRef.current) tlRef.current.kill();

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Instantly zero everything — no out animation
    tl.set([imgRef.current, bgWordRef.current, ...allTextEls, priceEl].filter(Boolean), { opacity: 0 });
    tl.set([...allTextEls, priceEl].filter(Boolean), { y: 16 });
    tl.set(bgWordRef.current, { x: isMobile ? 0 : 20 });

    // Swap React state at time 0
    tl.call(() => { setActive(idx); }, [], 0);

    // Small pause for React to re-render (image src swap)
    tl.set({}, {}, '+=0.055');

    // Set image start state
    tl.set(imgRef.current, {
      x: isMobile ? 0 : (dish.imgPos === 'right' ? '28px' : '-28px'),
      y: isMobile ? '14px' : '0px',
      scale: 0.97,
      filter: 'blur(10px)',
    });

    // Image in
    tl.to(imgRef.current, {
      opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)',
      duration: 0.82, ease: 'expo.out',
    });

    // Text cascade in
    tl.to(bgWordRef.current,  { opacity: 1, x: 0, duration: 0.78, ease: 'expo.out' }, '<0.04');
    tl.to(nameRef.current,    { opacity: 1, y: 0, duration: 0.68, ease: 'expo.out' }, '<0.06');
    tl.to(tagRef.current,     { opacity: 1, y: 0, duration: 0.52, ease: 'expo.out' }, '<0.04');
    tl.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.60, ease: 'expo.out' }, '<0.04');
    tl.to(subRef.current,     { opacity: 1, y: 0, duration: 0.52, ease: 'expo.out' }, '<0.04');
    tl.to(priceEl,            { opacity: 1, y: 0, duration: 0.58, ease: 'expo.out' }, '<0.05');
    tl.to(ctaRef.current,     { opacity: 1, y: 0, duration: 0.52, ease: 'expo.out' }, '<0.04');
  }, []);

  /* ─────── SCROLL TRIGGER ─────── */
  useEffect(() => {
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !sticky) return;

    // Exact height: TOTAL viewports. pinSpacing:false = no injected spacer.
    wrap.style.height = `${TOTAL * 100}vh`;

    const resolveSnap = (progress) => {
      // Deadzone at edges so dish changes don't fire during pin engage/release
      const inner = Math.max(0, Math.min(1, (progress - 0.03) / 0.94));
      return Math.max(0, Math.min(TOTAL - 1, Math.round(inner * (TOTAL - 1))));
    };

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      pin: sticky,
      pinSpacing: false,
      anticipatePin: 1,
      onUpdate: self => {
        const p = self.progress;
        lastProgressRef.current = p;

        // Progress bar always live
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${p})`;
        }

        if (isMobileRef.current) {
          // MOBILE: debounce — wait for scroll to settle before switching dish
          // This prevents the mid-scroll snap jank entirely
          clearTimeout(snapTimerRef.current);
          snapTimerRef.current = setTimeout(() => {
            const snap = resolveSnap(lastProgressRef.current);
            triggerDishTransition(snap);
          }, 120); // wait 120ms after scroll stops
        } else {
          // DESKTOP: immediate, feels snappy with mouse scroll
          const snap = resolveSnap(p);
          triggerDishTransition(snap);
        }
      },
    });

    return () => {
      st.kill();
      clearTimeout(snapTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────── ENTRANCE ANIMATION ─────── */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const allEls = [
      bgWordRef.current, imgRef.current, taglineRef.current,
      subRef.current, priceValRef.current, mobilePriceRef.current,
      indexRef.current, tagRef.current, nameRef.current, ctaRef.current,
    ].filter(Boolean);

    gsap.set(allEls, { opacity: 0 });
    gsap.set([nameRef.current, tagRef.current, taglineRef.current,
              subRef.current, ctaRef.current, mobilePriceRef.current], { y: 24 });
    gsap.set(imgRef.current, { y: 16, scale: 0.97, filter: 'blur(8px)' });
    gsap.set(bgWordRef.current, { x: 26 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          if (hasEnteredRef.current) return;
          hasEnteredRef.current = true;
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          tl.to(bgWordRef.current,      { opacity: 1, x: 0, duration: 1.3 }, 0)
            .to(imgRef.current,         { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.05 }, 0.08)
            .to(nameRef.current,        { opacity: 1, y: 0, duration: 0.88 }, 0.16)
            .to(tagRef.current,         { opacity: 1, y: 0, duration: 0.68 }, 0.24)
            .to(taglineRef.current,     { opacity: 1, y: 0, duration: 0.78 }, 0.30)
            .to(subRef.current,         { opacity: 1, y: 0, duration: 0.68 }, 0.38)
            .to(priceValRef.current,    { opacity: 1, y: 0, duration: 0.78 }, 0.44)
            .to(mobilePriceRef.current, { opacity: 1, y: 0, duration: 0.78 }, 0.44)
            .to(indexRef.current,       { opacity: 1, duration: 0.58 }, 0.52)
            .to(ctaRef.current,         { opacity: 1, y: 0, duration: 0.68 }, 0.56);
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  /* ─────── RESET y AFTER ACTIVE FLIP ─────── */
  useEffect(() => {
    const els = [
      taglineRef.current, subRef.current, ctaRef.current,
      tagRef.current, nameRef.current, priceValRef.current, mobilePriceRef.current,
    ];
    gsap.set(els.filter(Boolean), { y: 16 });
  }, [active]);

  /* ─────── MOUSE PARALLAX (desktop only) ─────── */
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const LERP = 0.055;

    const onMove = e => {
      if (isMobileRef.current) return;
      const r = sticky.getBoundingClientRect();
      mouseRef.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseRef.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { mouseRef.current.tx = 0; mouseRef.current.ty = 0; };
    sticky.addEventListener('mousemove', onMove, { passive: true });
    sticky.addEventListener('mouseleave', onLeave, { passive: true });

    const tick = () => {
      const m = mouseRef.current;
      m.cx += (m.tx - m.cx) * LERP;
      m.cy += (m.ty - m.cy) * LERP;
      if (!isMobileRef.current) {
        if (imgRef.current) {
          imgRef.current.style.transform =
            `perspective(1800px) rotateX(${-m.cy * 5}deg) rotateY(${m.cx * 8}deg) translateX(${m.cx * 10}px) translateY(${m.cy * 6}px)`;
        }
        if (bgWordRef.current) {
          bgWordRef.current.style.transform =
            `translateX(${m.cx * -18}px) translateY(${m.cy * -8}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      sticky.removeEventListener('mousemove', onMove);
      sticky.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const isRight = d.imgPos === 'right';

  return (
    <div ref={wrapRef} style={{ position: 'relative', zIndex: 0 }}>

      {/* STICKY CANVAS — z-index 0 so next sections scroll on top */}
      <div ref={stickyRef} style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        zIndex: 0,
        background: 'linear-gradient(160deg, #020D0A 0%, #010A07 60%, #02100D 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* PROGRESS BAR */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '2px', background: 'rgba(255,255,255,0.04)', zIndex: 15,
        }}>
          <div ref={progressRef} style={{
            height: '100%',
            background: `linear-gradient(90deg, #C42D78, ${d.accent})`,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            willChange: 'transform',
            transition: 'background 0.6s ease',
          }} />
        </div>

        {/* AMBIENT GLOW */}
        <div style={{
          position: 'absolute', left: '50%', top: '30%',
          width: 'min(80vw, 600px)', height: 'min(80vw, 600px)',
          transform: 'translateX(-50%)', borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(${hexToRgb(d.accent)},0.12) 0%, transparent 70%)`,
          filter: 'blur(70px)', pointerEvents: 'none', zIndex: 1,
          transition: 'background 1s ease',
        }} />

        {/* BG WORD */}
        <div ref={bgWordRef} aria-hidden style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(5rem, 22vw, 18rem)', fontWeight: '900',
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.05)',
          letterSpacing: '-0.04em', lineHeight: 0.85,
          userSelect: 'none', pointerEvents: 'none', zIndex: 2,
          whiteSpace: 'nowrap', willChange: 'transform, opacity', opacity: 0,
        }}>{d.short}</div>

        {/* SECTION LABEL */}
        <div style={{
          position: 'absolute', top: '20px', left: 'clamp(20px, 5vw, 72px)',
          zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ width: '24px', height: '1px', background: '#B6912E' }} />
          <span style={{
            fontSize: '9px', fontWeight: '800', letterSpacing: '0.5em',
            textTransform: 'uppercase', color: '#B6912E',
          }}>House Favourites</span>
        </div>

        {/* VERTICAL INDEX — desktop */}
        <div ref={indexRef} className="hf-desktop-only" style={{
          position: 'absolute', left: '20px', top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center center', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '10px', opacity: 0,
        }}>
          <span style={{
            fontSize: '10px', fontWeight: '700', letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>{String(active + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}</span>
          <div style={{
            width: '36px', height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.25))',
          }} />
        </div>

        {/* MAIN STAGE */}
        <div className="hf-stage" style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'hidden' }}>

          {/* IMAGE */}
          <div className="hf-img-wrap" style={{ flexShrink: 0, position: 'relative', zIndex: 5 }}>
            <div style={{ position: 'relative' }}>
              <img
                ref={imgRef}
                src={d.image}
                alt={d.name}
                draggable={false}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400'; }}
                style={{
                  display: 'block', width: '100%', objectFit: 'cover', borderRadius: '8px',
                  filter: 'brightness(0.93) contrast(1.07) saturate(1.12)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.5) 88%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.5) 88%, transparent 100%)',
                  userSelect: 'none', opacity: 0,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 100px rgba(0,0,0,0.75), 0 0 60px ${d.accent}1A`,
                  transition: 'box-shadow 0.9s ease',
                  willChange: 'transform, opacity, filter',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '8px', pointerEvents: 'none', zIndex: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
              }} />
              <div style={{
                position: 'absolute', bottom: '-24px', left: '15%', right: '15%', height: '50px',
                background: `radial-gradient(ellipse, ${d.accent}44 0%, transparent 72%)`,
                filter: 'blur(20px)', pointerEvents: 'none', transition: 'background 0.7s ease',
              }} />
            </div>
          </div>

          {/* TEXT */}
          <div className="hf-text-wrap" style={{ zIndex: 6, flexShrink: 0 }}>

            <div ref={tagRef} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              marginBottom: '14px', opacity: 0, alignSelf: 'flex-start',
            }}>
              <span style={{ display: 'block', width: '24px', height: '1px', background: d.accent, transition: 'background 0.5s' }} />
              <span style={{
                fontSize: '8px', fontWeight: '800', letterSpacing: '0.4em',
                textTransform: 'uppercase', color: d.accent, transition: 'color 0.5s',
              }}>{d.tag}</span>
            </div>

            <h2 ref={nameRef} style={{
              fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
              fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
              fontWeight: '900', color: '#FFFFFF',
              lineHeight: 1.06, letterSpacing: '-0.03em',
              margin: '0 0 14px', opacity: 0,
            }}>{d.name}</h2>

            <div style={{
              width: '100%', height: '1px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)',
              marginBottom: '13px',
            }} />

            <p ref={taglineRef} style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: '700',
              color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 7px',
              fontStyle: 'italic', letterSpacing: '-0.01em', opacity: 0,
            }}>{d.tagline}</p>

            <p ref={subRef} style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.32)',
              lineHeight: 1.7, margin: '0 0 18px', opacity: 0,
            }}>{d.sub}</p>

            {/* Mobile price — inline */}
            <div ref={mobilePriceRef} className="hf-mobile-price" style={{ marginBottom: '20px', opacity: 0 }}>
              <span style={{
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginRight: '10px',
              }}>from</span>
              <span style={{
                fontSize: 'clamp(1.4rem, 6vw, 2.2rem)', fontWeight: '900',
                fontFamily: "'Archivo Black', sans-serif",
                color: d.accent, letterSpacing: '-0.03em',
                textShadow: `0 0 30px ${d.accent}55`,
                transition: 'color 0.5s ease, text-shadow 0.5s ease',
              }}>
                <PriceCounter value={d.price} color={d.accent} />
              </span>
            </div>

            <div ref={ctaRef} style={{ opacity: 0 }}>
              <CTAButton onClick={() => navigate('/menu')} accent={d.accent} />
            </div>
          </div>
        </div>

        {/* DESKTOP VERTICAL PRICE */}
        <div ref={priceValRef} className="hf-desktop-only" style={{
          position: 'absolute', right: '18px', top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'center center', zIndex: 10,
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px',
          opacity: 0, pointerEvents: 'none',
        }}>
          <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <span style={{
            fontSize: '9px', fontWeight: '700', letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>from</span>
          <span style={{
            fontSize: 'clamp(1.2rem, 2vw, 2rem)', fontWeight: '900',
            fontFamily: "'Archivo Black', sans-serif",
            color: d.accent, letterSpacing: '-0.02em',
            textShadow: `0 0 30px ${d.accent}55`,
            transition: 'color 0.5s ease, text-shadow 0.5s ease',
          }}>
            <PriceCounter value={d.price} color={d.accent} />
          </span>
        </div>

        {/* DISH NAV */}
        <nav style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 0 18px',
        }}>
          {DISHES.map((dish, idx) => (
            <DishTab
              key={dish.id}
              label={dish.short}
              isActive={idx === active}
              accent={dish.accent}
              onClick={() => {
                const wrap = wrapRef.current;
                if (!wrap) return;
                const rect = wrap.getBoundingClientRect();
                const wrapTop = window.scrollY + rect.top;
                const scrollRange = TOTAL * window.innerHeight;
                const target = wrapTop + (0.03 + (idx / (TOTAL - 1)) * 0.94) * scrollRange;
                window.scrollTo({ top: target, behavior: 'smooth' });
              }}
            />
          ))}
        </nav>

        {/* SCROLL HINT */}
        <div style={{
          position: 'absolute', bottom: '20px', right: 'clamp(16px, 5vw, 72px)',
          zIndex: 10, display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', gap: '6px', pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '8px', fontWeight: '700', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.12)',
          }}>scroll</span>
          <div style={{
            width: '1px', height: '22px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)',
            animation: 'hfPulse 2.2s ease-in-out infinite',
          }} />
        </div>

        <style>{`
          @keyframes hfPulse {
            0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
            50% { opacity: 1; transform: scaleY(1); }
          }

          /* ── MOBILE (default) ── */
          .hf-stage {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            /* top padding accounts for nav bar + section label */
            padding: 40px 20px 20px;
            gap: 0;
            /* Prevent content overflowing the sticky 100vh */
            justify-content: center;
          }
          .hf-img-wrap {
            width: 100%;
            margin-bottom: 18px;
          }
          .hf-img-wrap img {
            width: 100%;
            /* Shorter ratio on mobile so text has room below */
            aspect-ratio: 3 / 2;
            max-height: 38vh;
            object-fit: cover;
            border-radius: 10px;
          }
          .hf-text-wrap {
            width: 100%;
            display: flex;
            flex-direction: column;
          }
          .hf-mobile-price { display: inline-flex !important; align-items: baseline; }
          .hf-desktop-only { display: none !important; }

          /* ── DESKTOP ── */
          @media (min-width: 768px) {
            .hf-stage {
              flex-direction: row;
              padding: 0 clamp(40px, 8vw, 100px);
              justify-content: center;
              align-items: center;
              gap: clamp(24px, 4vw, 60px);
            }
            .hf-img-wrap {
              flex: 1;
              max-width: 620px;
              margin-bottom: 0;
            }
            .hf-img-wrap img {
              width: 100%;
              aspect-ratio: 4 / 3;
              max-height: none;
              border-radius: 6px;
            }
            .hf-text-wrap {
              width: clamp(240px, 28vw, 400px);
            }
            .hf-mobile-price { display: none !important; }
            .hf-desktop-only { display: flex !important; }
          }
        `}</style>

        {/* Layout flip per dish on desktop */}
        <style>{`
          @media (min-width: 768px) {
            .hf-img-wrap  { order: ${isRight ? 2 : 1}; }
            .hf-text-wrap { order: ${isRight ? 1 : 2}; }
          }
        `}</style>

      </div>
    </div>
  );
}

/* ── Dish tab ── */
function DishTab({ label, isActive, accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-pressed={isActive}
      style={{
        background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
        padding: 'clamp(8px, 2vw, 12px) clamp(10px, 3vw, 22px)',
        position: 'relative',
        fontSize: 'clamp(8px, 2vw, 10px)',
        fontWeight: isActive ? '800' : '500',
        letterSpacing: isActive ? '0.25em' : '0.1em',
        textTransform: 'uppercase',
        color: isActive ? '#FFFFFF' : hov ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)',
        transition: 'color 0.3s ease, letter-spacing 0.3s ease',
      }}
    >
      {label}
      <span style={{
        position: 'absolute', bottom: '5px', left: '50%',
        transform: `translateX(-50%) scaleX(${isActive ? 1 : 0})`,
        width: '70%', height: '1px', background: accent,
        boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
        display: 'block', transformOrigin: 'center',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.5s, box-shadow 0.5s',
      }} />
    </button>
  );
}

/* ── CTA button ── */
function CTAButton({ onClick, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: '100px',
        padding: 'clamp(11px, 2vw, 14px) clamp(22px, 4vw, 32px)',
        fontSize: 'clamp(9px, 2vw, 10px)', fontWeight: '700',
        letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FFFFFF',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
        transition: 'all 0.38s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 10px 36px rgba(0,0,0,0.4)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <span style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s ease', borderRadius: '100px',
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>View Full Menu</span>
      <span style={{
        position: 'relative', zIndex: 1, display: 'inline-block',
        transform: hov ? 'translateX(5px)' : 'translateX(0)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>→</span>
    </button>
  );
}