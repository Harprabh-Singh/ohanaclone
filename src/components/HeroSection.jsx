import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const rng = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5; return x - Math.floor(x); };

/* ── IMAGES — Unsplash direct links ─────────────────────────────── */
const BG_IMAGE = 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=2400&q=85&auto=format&fit=crop';

const CARDS = [
  {
    label: 'Signature', dish: 'Tandoori Pizza', desc: 'Wood-fired crust, tandoor-kissed toppings',
    price: '₹320', accent: '#e8523a',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop',
  },
  {
    label: "Chef's Pick", dish: 'Dragon Wings', desc: 'Fiery sriracha glaze, blue cheese dip',
    price: '₹240', accent: '#c42d78',
    img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80&auto=format&fit=crop',
  },
  {
    label: 'Fan Fav', dish: 'Chunky Shake', desc: '500ml Belgian chocolate bliss',
    price: '₹180', accent: '#b6912e',
    img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80&auto=format&fit=crop',
  },
  {
    label: 'New', dish: 'Berry Cheesecake', desc: 'Seasonal berries, cream cheese',
    price: '₹220', accent: '#8b5cf6',
    img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80&auto=format&fit=crop',
  },
  {
    label: 'Morning', dish: 'Cold Brew', desc: '18-hour steep, single origin beans',
    price: '₹120', accent: '#0ea5e9',
    img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80&auto=format&fit=crop',
  },
];

/* ── Clock ──────────────────────────────────────────────────────── */
function ClockPill() {
  const [time, setTime] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tick = () => {
      const n = new Date(), h = n.getHours(), m = n.getMinutes().toString().padStart(2, '0');
      setTime(`${(h % 12) || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`);
      setOpen(h >= 11 && h < 22);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '7px 16px 7px 10px', borderRadius: '999px',
      background: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: open ? '#4aad6e' : 'rgba(255,255,255,0.25)',
        boxShadow: open ? '0 0 10px rgba(74,173,110,0.9)' : 'none',
        animation: open ? 'hz-dot-pulse 2s ease-in-out infinite' : 'none',
      }} />
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{time}</span>
      <span style={{ fontSize: '0.57rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontWeight: 600 }}>
        {open ? "We're open" : 'Opens 11 AM'}
      </span>
    </div>
  );
}

/* ── 3D Carousel ────────────────────────────────────────────────── */
function DishCarousel({ stageHeight = 420, cardWidth = 320, isMobile = false }) {
  const [active, setActive] = useState(0);
  const autoRef = useRef(null);
  const dragStart = useRef(null);

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActive(a => (a + 1) % CARDS.length), 3500);
  }, []);

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, []);

  const go = (dir) => {
    setActive(a => (a + dir + CARDS.length) % CARDS.length);
    startAuto();
  };

  const cardStyle = (i) => {
    const total = CARDS.length;
    let offset = i - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const abs = Math.abs(offset);
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${cardWidth}px`,
      marginLeft: `${-cardWidth / 2}px`,
      marginTop: '-210px',
      borderRadius: '24px',
      overflow: 'hidden',
      background: '#0c1f18',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: offset === 0
        ? '0 40px 100px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06) inset'
        : '0 24px 70px rgba(0,0,0,0.5)',
      transform: `translateX(${offset * 72}px) translateZ(${-abs * 100}px) rotateY(${offset * -20}deg) scale(${1 - abs * 0.1})`,
      zIndex: 10 - abs,
      opacity: abs > 2 ? 0 : Math.max(0, 1 - abs * 0.35),
      pointerEvents: offset === 0 ? 'auto' : 'none',
      transition: 'all 0.68s cubic-bezier(0.34,1.15,0.64,1)',
      cursor: offset === 0 ? 'default' : 'pointer',
    };
  };

  const card = CARDS[active];
  const arrowOffset = cardWidth / 2 + 24;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* 3D Stage */}
      <div
        style={{
          width: '100%', height: `${stageHeight}px`, position: 'relative',
          perspective: '900px', perspectiveOrigin: '50% 50%',
        }}
        onMouseDown={e => { dragStart.current = e.clientX; }}
        onMouseUp={e => {
          if (dragStart.current === null) return;
          const diff = e.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
        }}
        onMouseLeave={() => { dragStart.current = null; }}
        onTouchStart={e => { dragStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (dragStart.current === null) return;
          const diff = e.changedTouches[0].clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
        }}
      >
        {CARDS.map((c, i) => (
          <div key={i} style={cardStyle(i)} onClick={() => { if (i !== active) { setActive(i); startAuto(); } }}>
            {/* Image */}
            <div style={{ height: isMobile ? '240px' : '500px', overflow: 'hidden', position: 'relative' }}>
              <img src={c.img} alt={c.dish}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,31,24,0.92) 0%, transparent 55%)' }} />
              <span style={{
                position: 'absolute', top: 12, right: 12, padding: '4px 12px',
                borderRadius: '999px', fontSize: '0.6rem', fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
                background: c.accent,
              }}>{c.label}</span>
            </div>
            {/* Info */}
            <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{c.dish}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>{c.desc}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c.accent, marginTop: 4 }}>{c.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      <button onClick={() => go(-1)} style={{
        position: 'absolute', left: `calc(50% - ${arrowOffset}px)`, top: '50%', transform: 'translate(-50%, -50%)',
        width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,45,120,0.3)'; e.currentTarget.style.borderColor = 'rgba(196,45,120,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
      >←</button>
      <button onClick={() => go(1)} style={{
        position: 'absolute', right: `calc(50% - ${arrowOffset}px)`, top: '50%', transform: 'translate(50%, -50%)',
        width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,45,120,0.3)'; e.currentTarget.style.borderColor = 'rgba(196,45,120,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
      >→</button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22 }}>
        {CARDS.map((c, i) => (
          <button key={i}
            onClick={() => { setActive(i); startAuto(); }}
            style={{
              width: i === active ? 28 : 8, height: 8, borderRadius: '999px',
              border: 'none', padding: 0, cursor: 'pointer',
              background: i === active ? card.accent : 'rgba(255,255,255,0.2)',
              transition: 'all 0.35s ease',
            }}
            aria-label={`Dish ${i + 1}`}
          />
        ))}
      </div>

      {/* Ambient glow behind stage */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 420, height: 420,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${card.accent}22 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.6s ease',
        animation: 'hz-glow-pulse 3.5s ease-in-out infinite alternate',
      }} />
    </div>
  );
}

/* ══ MAIN ══════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const rootRef  = useRef(null);
  const leftRef  = useRef(null);
  const rightRef = useRef(null);
  const l1Ref    = useRef(null);
  const l2Ref    = useRef(null);
  const l3Ref    = useRef(null);
  const eyeRef   = useRef(null);
  const subRef   = useRef(null);
  const btnsRef  = useRef(null);
  const statsRef = useRef(null);
  const clockRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const mouse    = useRef({ nx: 0, ny: 0 });
  const lerp     = useRef({ x: 0, y: 0 });
  const rafRef   = useRef(null);

  useEffect(() => {
    const els = [l1Ref, l2Ref, l3Ref].map(r => r.current);
    const fades = [eyeRef, subRef, btnsRef, statsRef, clockRef].map(r => r.current);
    gsap.set(els, { y: '108%', opacity: 0 });
    gsap.set(fades, { opacity: 0, y: 18 });
    gsap.set(rightRef.current, { opacity: 0, x: 50 });

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(clockRef.current,  { opacity: 1, y: 0, duration: 0.7 }, 0.2)
      .to(rightRef.current,  { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, 0.2)
      .to(eyeRef.current,    { opacity: 1, y: 0, duration: 0.8 }, 0.5)
      .to(l1Ref.current,     { y: '0%', opacity: 1, duration: 1.0 }, 0.62)
      .to(l2Ref.current,     { y: '0%', opacity: 1, duration: 1.0 }, 0.76)
      .to(l3Ref.current,     { y: '0%', opacity: 1, duration: 1.0 }, 0.9)
      .to(subRef.current,    { opacity: 1, y: 0, duration: 0.8 }, 1.08)
      .to(btnsRef.current,   { opacity: 1, y: 0, duration: 0.8 }, 1.2)
      .to(statsRef.current,  { opacity: 1, y: 0, duration: 0.8 }, 1.3);

    ScrollTrigger.create({
      trigger: rootRef.current, start: 'top top', end: '+=55%', scrub: 0.9,
      onUpdate: (self) => {
        gsap.set(leftRef.current,  { y: -self.progress * 60 });
        gsap.set(rightRef.current, { y: -self.progress * 30 });
      },
    });
    return () => { tl.kill(); ScrollTrigger.getAll().forEach(s => s.kill()); };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = '(max-width: 900px)';
    const mql = window.matchMedia(query);
    const update = (e) => setIsMobile(e.matches);
    update(mql);
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
    } else {
      mql.addListener(update);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', update);
      } else {
        mql.removeListener(update);
      }
    };
  }, []);

  /* Mouse parallax */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      mouse.current.nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.current.ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    root.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      lerp.current.x += (mouse.current.nx - lerp.current.x) * 0.055;
      lerp.current.y += (mouse.current.ny - lerp.current.y) * 0.055;
      if (leftRef.current)
        leftRef.current.style.setProperty('--mx', `${lerp.current.x * -7}px`);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); root.removeEventListener('mousemove', onMove); };
  }, []);

  return (
    <section ref={rootRef} style={{
      position: 'relative', width: '100%', minHeight: isMobile ? 'auto' : 'calc(100svh - 96px)',
      background: '#060e0b', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      paddingTop: 28,
      paddingBottom: isMobile ? 24 : 36,
      fontFamily: 'inherit',
    }}>
      <style>{`
        @keyframes hz-dot-pulse { 
          0%,100% { box-shadow: 0 0 5px rgba(74,173,110,0.5); }
          50%      { box-shadow: 0 0 16px rgba(74,173,110,1); }
        }
        @keyframes hz-scroll-slide {
          0%   { transform: translateY(-100%); opacity: 0; }
          18%  { opacity: 1; }
          78%  { opacity: 0.6; }
          100% { transform: translateY(280%); opacity: 0; }
        }
        @keyframes hz-glow-pulse {
          from { opacity: 0.7; transform: translate(-50%,-50%) scale(0.95); }
          to   { opacity: 1;   transform: translate(-50%,-50%) scale(1.1); }
        }
        @keyframes hz-bg-in {
          from { transform: scale(1.12); filter: brightness(0.15) saturate(0.4); }
          to   { transform: scale(1.0);  filter: brightness(0.38) saturate(0.65); }
        }
        .hz-left-inner {
          transform: translate(var(--mx, 0px), 0px);
          transition: transform 0.1s linear;
        }
      `}</style>

      {/* ── BACKGROUND ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <img
          src={BG_IMAGE}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: 'center 35%', display: 'block',
            animation: 'hz-bg-in 2s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        />
        {/* Left gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(6,14,11,0.98) 0%, rgba(6,14,11,0.85) 25%, rgba(6,14,11,0.5) 50%, rgba(6,14,11,0.1) 70%, transparent 85%)',
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #060e0b 0%, rgba(6,14,11,0.6) 28%, transparent 60%)',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 110% 80% at 60% 30%, transparent 30%, rgba(6,14,11,0.65) 80%, rgba(6,14,11,0.9) 100%)',
        }} />
        {/* Subtle pink tint top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
          background: 'radial-gradient(ellipse 60% 50% at 70% 10%, rgba(196,45,120,0.07) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }} />
      </div>

      {/* ── CLOCK ── */}
      <div ref={clockRef} style={{
        position: 'absolute',
        top: isMobile ? 98 : 84,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        opacity: 0,
      }}>
        <ClockPill />
      </div>

      {/* ── MAIN SPLIT GRID ── */}
      <div style={{
        position: 'relative', zIndex: 30,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(400px, 460px)',
        gridTemplateRows: isMobile ? 'auto auto auto' : 'auto auto',
        gridTemplateAreas: isMobile ? '"left" "right" "bottom"' : '"left right" "bottom right"',
        alignItems: isMobile ? 'flex-start' : 'start',
        rowGap: isMobile ? '1rem' : 0,
        minHeight: isMobile ? 'auto' : 'calc(100svh - 84px)',
        padding: isMobile ? '70px 0 80px' : '70px 0 90px',
      }}>
        {/* LEFT TOP */}
        <div ref={leftRef} style={{ gridArea: 'left', padding: isMobile ? '0 5vw' : '0 4vw 0 7vw', textAlign: isMobile ? 'center' : 'left', maxWidth: isMobile ? '100%' : 1160, marginTop: isMobile ? '70px' : '105px' }}>
          <div className="hz-left-inner">
            {/* Eyebrow */}
            <div ref={eyeRef} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '1.5rem', opacity: 0 }}>
              <span style={{
                fontSize: '0.61rem', fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#c42d78',
                border: '1px solid rgba(196,45,120,0.4)', padding: '4px 10px',
                borderRadius: '999px', background: 'rgba(196,45,120,0.1)',
              }}>Jorhat, Assam</span>
              <span style={{ display: 'block', width: 20, height: 1, background: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.61rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.26)', fontWeight: 600 }}>
                Café · Kitchen · Terraces
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ margin: isMobile ? '0 0 1.7rem' : '0 0 2.4rem', lineHeight: isMobile ? 1.0 : 1.06, display: 'flex', flexDirection: 'column' }}
              aria-label="Where every plate tells a story">

              <span style={{ display: 'block', overflow: 'visible', paddingBottom: isMobile ? '0.02em' : '0.05em' }}>
                <span ref={l1Ref} style={{
                  display: 'block',
                  fontSize: isMobile ? 'clamp(2.8rem,6vw,7rem)' : 'clamp(3.4rem,5.8vw,8rem)',
                  fontWeight: 900, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.86)',
                  letterSpacing: '-0.044em',
                }}>Where every</span>
              </span>

              <span style={{ display: 'block', overflow: 'visible', paddingBottom: isMobile ? '0.02em' : '0.05em' }}>
                <span ref={l2Ref} style={{
                  display: 'block',
                  fontSize: isMobile ? 'clamp(3rem,6.5vw,8rem)' : 'clamp(3.9rem,6.8vw,9rem)',
                  fontWeight: 900, textTransform: 'uppercase',
                  color: '#fff', letterSpacing: '-0.044em',
                }}>
                  plate
                </span>
              </span>

              <span style={{ display: 'block', overflow: 'visible', paddingBottom: 0 }}>
                <span ref={l3Ref} style={{
                  display: 'block',
                  fontSize: isMobile ? 'clamp(1.8rem,4vw,5.4rem)' : 'clamp(2.8rem,5.2vw,6.2rem)',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '-0.03em',
                  marginTop: 0,
                  marginLeft: 0,
                }}>tells a story.</span>
              </span>
            </h1>
 
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: isMobile ? '1.5rem' : '2rem' }}>
              <span style={{ display: 'block', width: 40, height: 1.5, background: '#c42d78', flexShrink: 0 }} />
              <span style={{ display: 'block', width: 160, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }} />
            </div>

            {/* Sub */}
            <p ref={subRef} style={{
              fontSize: isMobile ? 'clamp(0.83rem,1.1vw,0.96rem)' : 'clamp(0.85rem,1.15vw,0.98rem)', lineHeight: isMobile ? 1.9 : 2.0,
              color: 'rgba(255,255,255,0.4)', margin: '0 0 2rem', maxWidth: isMobile ? '100%' : 360, opacity: 0,
            }}>
              A candlelit terrace above Gar‑Ali — where Assam's finest flavours meet unhurried evenings and good company.
            </p>

          </div>
        </div>

        {/* RIGHT */}
        <div ref={rightRef} style={{ gridArea: 'right', padding: isMobile ? '1.5rem 5vw 0' : '-50px 2vw 0 0', opacity: 0, justifySelf: isMobile ? 'center' : 'start', width: isMobile ? '100%' : 'auto' }}>
          <DishCarousel stageHeight={isMobile ? 420 : 760} cardWidth={isMobile ? 300 : 400} isMobile={isMobile} />
        </div>

        {/* LEFT BOTTOM */}
        <div style={{
          gridArea: 'bottom',
          padding: isMobile ? '0 5vw 0' : '0 4vw 0 7vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: '1.6rem',
        }}>
          <div ref={btnsRef} style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.8rem', flexWrap: 'wrap', marginBottom: isMobile ? 0 : '2rem', opacity: 0 }}>
            <Link to="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
              borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '1rem 2rem', textDecoration: 'none',
              background: '#c42d78', color: '#fff',
              boxShadow: '0 8px 28px rgba(196,45,120,0.42)',
              transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 42px rgba(196,45,120,0.62)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(196,45,120,0.42)'; }}
            >
              Reserve a Table <span style={{ display: 'inline-block', transition: 'transform 0.25s' }}>→</span>
            </Link>
            <Link to="/menu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.65rem',
              borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '1rem 2rem', textDecoration: 'none',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.78)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.28s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,45,120,0.45)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(196,45,120,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.78)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = ''; }}
            >
              View Full Menu
            </Link>
          </div>

          <div ref={statsRef} style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', opacity: 0, gap: isMobile ? '1.8rem' : 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            {[
              { val: '★ 4.8', lbl: '200+ reviews' },
              { val: '11 AM', lbl: 'Opens daily' },
              { val: '3 Yrs', lbl: 'In Jorhat' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3, padding: `0 ${i === 0 ? '1.3rem 0 0' : '1.3rem'}`, textAlign: isMobile ? 'center' : 'left' }}>
                <strong style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{s.val}</strong>
                <span style={{ fontSize: '0.57rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>{s.lbl}</span>
                {i < 2 && !isMobile && <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 1, height: '1.8rem', background: 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SCROLL CUE ── */}
      <div style={{ position: 'absolute', right: '4.5vw', bottom: '7vh', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 1.5, height: 50, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '38%', background: 'linear-gradient(to bottom, #c42d78, transparent)', borderRadius: 999, animation: 'hz-scroll-slide 2.2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
        </div>
        <span style={{ fontSize: '0.53rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontWeight: 600, writingMode: 'vertical-rl' }}>Scroll</span>
      </div>

    </section>
  );
}