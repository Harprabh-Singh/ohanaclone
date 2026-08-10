import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categoryData } from '../data/menuData';

gsap.registerPlugin(ScrollTrigger);

/* ─── Accent palette — cycles through 5 restaurant-toned colors ─── */
const PALETTE = ['#B6912E', '#C42D78', '#E8742A', '#D42020', '#6B8F6B'];
const accent = (i) => PALETTE[i % PALETTE.length];

/* ─────────────────────────────────────────────────────────────────
   PLATE CARD
   Used by both desktop horizontal strip and mobile 2-col grid.
   The "plate" is a circular image with a warm dark rim, simulating
   a dinner plate sitting on a dark restaurant table surface.
───────────────────────────────────────────────────────────────── */
function PlateCard({ item, index, plateSize = 220, compact = false, isMobileScroll = false }) {
  const [hov, setHov] = useState(false);
  const a = accent(index);

  let cardStyle = {};
  if (compact) {
    cardStyle = {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '28px 14px 24px', textDecoration: 'none',
      position: 'relative', cursor: 'pointer', overflow: 'hidden',
      background: hov ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
      border: `1px solid ${hov ? `${a}50` : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '18px',
      transition: 'background 0.4s ease, border-color 0.4s ease',
    };
  } else if (isMobileScroll) {
    cardStyle = {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      width: `${plateSize + 60}px`, flexShrink: 0,
      padding: '24px 20px', textDecoration: 'none', position: 'relative',
      cursor: 'pointer',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    };
  } else {
    cardStyle = {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      width: `${plateSize + 140}px`, height: '100%', flexShrink: 0,
      padding: '0 40px', textDecoration: 'none', position: 'relative',
      cursor: 'pointer',
      borderRight: '1px solid rgba(255,255,255,0.035)',
    };
  }

  return (
    <Link
      to={`/menu/${item.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={cardStyle}
    >
      {/* Ghost index number — desktop only */}
      {!compact && (
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '13rem', lineHeight: 1,
          fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.028)',
          userSelect: 'none', pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap',
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}

      {/* ── THE PLATE ── */}
      <div style={{
        position: 'relative', zIndex: 1, marginBottom: compact ? '18px' : '30px',
        transform: hov ? 'translateY(-14px)' : 'translateY(0)',
        transition: 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Cast shadow beneath the plate */}
        <div style={{
          position: 'absolute',
          bottom: hov ? '-10px' : '-18px',
          left: '50%', transform: 'translateX(-50%)',
          width: hov ? `${plateSize * 0.5}px` : `${plateSize * 0.72}px`,
          height: '18px',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)',
          filter: 'blur(10px)',
          transition: 'all 0.65s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: hov ? 0.3 : 0.75,
        }} />

        {/* Outer plate rim */}
        <div style={{
          width: `${plateSize}px`, height: `${plateSize}px`, borderRadius: '50%',
          background: 'radial-gradient(circle at 33% 28%, #FDE48C, #B6912E 48%, #755B11 100%)',
          boxShadow: hov
            ? `0 0 0 2.5px ${a}, 0 0 0 5px ${a}28, 0 52px 88px rgba(0,0,0,0.95), 0 0 55px ${a}1E`
            : `0 0 0 1px rgba(253,228,140,0.6), 0 28px 64px rgba(0,0,0,0.88), inset 0 -4px 12px rgba(0,0,0,0.3)`,
          padding: compact ? '10px' : '13px',
          transition: 'box-shadow 0.5s ease',
          flexShrink: 0,
        }}>
          {/* Inner food image */}
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.5)',
          }}>
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hov ? 'scale(1.1)' : 'scale(1)',
                filter: `brightness(${hov ? 1.05 : 0.82}) contrast(1.12) saturate(1.2)`,
                transition: 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1), filter 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── TEXT ── */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Accent rule + number */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          justifyContent: 'center', marginBottom: '10px',
        }}>
          <div style={{ width: '20px', height: '1px', background: `${a}70` }} />
          <span style={{
            fontSize: '8px', fontWeight: '800', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: a,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div style={{ width: '20px', height: '1px', background: `${a}70` }} />
        </div>

        <h3 style={{
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: compact ? 'clamp(0.9rem,4vw,1.1rem)' : 'clamp(1.1rem,2vw,1.6rem)',
          fontWeight: '900', color: '#FFFFFF',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: '0 0 7px',
        }}>
          {item.name}
        </h3>

        <p style={{
          fontSize: compact ? '9px' : '10px',
          color: 'rgba(255,255,255,0.28)',
          fontStyle: 'italic', lineHeight: 1.55,
          margin: '0',
        }}>
          {item.tagline}
        </p>

        {/* Explore CTA — desktop only */}
        {!compact && (
          <div style={{
            marginTop: '16px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '8px', fontWeight: '800', letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: hov ? a : 'rgba(255,255,255,0.18)',
            transition: 'color 0.35s ease',
          }}>
            Explore
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%',
              border: `1px solid ${hov ? a : 'rgba(255,255,255,0.14)'}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px',
              transform: hov ? 'translateX(4px)' : 'translateX(0)',
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}>→</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MENU PAGE
───────────────────────────────────────────────────────────────── */
export default function Menu() {
  const triggerRef  = useRef(null);
  const stripRef    = useRef(null);
  const progressRef = useRef(null);
  const counterRef  = useRef(null);
  const heroRef     = useRef(null);

  /* Set page bg to dark so no white flash */
  const [plateSize, setPlateSize] = useState(280);

  useEffect(() => {
    const handleResize = () => setPlateSize(window.innerWidth <= 768 ? 180 : 280);
    handleResize(); // init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = '#0A0800';
    document.documentElement.style.backgroundColor = '#0A0800';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  /* Hero entrance animation */
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const els = heroRef.current.querySelectorAll('.mr');
      gsap.set(els, { opacity: 0, y: 44 });
      gsap.to(els, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.25,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* Horizontal scroll — all devices */
  useEffect(() => {
    const trigger = triggerRef.current;
    const strip   = stripRef.current;
    if (!trigger || !strip) return;

    const ctx = gsap.context(() => {
      gsap.to(strip, {
        x: () => -(strip.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: () => `+=${strip.scrollWidth - window.innerWidth}`,
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current)
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            if (counterRef.current)
              counterRef.current.textContent =
                String(Math.round(self.progress * (categoryData.length - 1)) + 1).padStart(2, '0');
          },
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main style={{ background: '#0A0800', color: '#FAF7F1', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        paddingTop: '80px',
        background: 'radial-gradient(circle at top right, rgba(182,145,46,0.08) 0%, #0A0800 600px, #050407 100%)',
      }}>
        {/* Ambient glows — brighter so the dark bg has warmth */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '1000px', height: '1000px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(182,145,46,0.2) 0%, transparent 60%)',
          filter: 'blur(100px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-5%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(196,45,120,0.15) 0%, transparent 60%)',
          filter: 'blur(100px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '40%',
          width: '800px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(182,145,46,0.15) 0%, transparent 70%)',
          filter: 'blur(120px)', pointerEvents: 'none', transform: 'translate(-50%,-50%)',
        }} />

        {/* Ghost BG "MENU" */}
        <div aria-hidden style={{
          position: 'absolute', bottom: '-4%', left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(7rem, 28vw, 24rem)',
          fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
          color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.025)',
          letterSpacing: '-0.06em', lineHeight: 0.85,
          userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>MENU</div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1400px', margin: '0 auto', width: '100%',
          padding: 'clamp(60px,10vh,120px) clamp(24px,8vw,100px) clamp(80px,12vh,140px)',
        }}>
          {/* Eyebrow */}
          <div className="mr" style={{
            opacity: 0, display: 'flex', alignItems: 'center',
            gap: '14px', marginBottom: '36px',
          }}>
            <div style={{ width: '36px', height: '1.5px', background: '#B6912E' }} />
            <span style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.55em',
              textTransform: 'uppercase', color: '#B6912E',
            }}>
              Ohana Kitchen &amp; Café
            </span>
          </div>

          {/* Headline */}
          <h1 className="mr" style={{
            opacity: 0,
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(3rem, 10vw, 9rem)',
            textShadow: '0 0 80px rgba(182,145,46,0.15)',
            fontWeight: '900', lineHeight: 0.88,
            letterSpacing: '-0.04em', margin: '0 0 32px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.85)' }}>What Are</span><br />
            <span style={{ color: '#FFFFFF' }}>You Feeling</span><br />
            <span style={{
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(182,145,46,0.95)',
              fontStyle: 'italic', fontFamily: 'Georgia, serif',
              fontWeight: '400', fontSize: '0.72em', letterSpacing: '-0.01em',
            }}>today?</span>
          </h1>

          {/* Subline */}
          <p className="mr" style={{
            opacity: 0, fontSize: 'clamp(14px, 1.5vw, 17px)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
            maxWidth: '520px', margin: '0 0 48px',
          }}>
            17 categories. Everything from sunrise eggs to midnight desserts —
            served above Gar-Ali with the warmth Ohana is known for.
          </p>

          {/* CTAs */}
          <div className="mr" style={{ opacity: 0, display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '52px' }}>
            <Link to="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#B6912E', color: '#000', textDecoration: 'none',
              padding: '14px 32px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.22em',
              textTransform: 'uppercase',
              boxShadow: '0 12px 40px rgba(182,145,46,0.35)',
            }}>
              Reserve a Table
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.15)', fontSize: '11px',
              }}>→</span>
            </Link>
            <a href="#menu-gallery" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(255,255,255,0.18)', color: '#FFFFFF',
              textDecoration: 'none', padding: '14px 32px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '800', letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}>
              Browse Menu ↓
            </a>
          </div>

          {/* Stats strip */}
          <div className="mr" style={{
            opacity: 0, display: 'flex', gap: 'clamp(24px,5vw,64px)',
            borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '36px', flexWrap: 'wrap',
          }}>
            {[
              { n: '17',      l: 'Categories' },
              { n: '80+',     l: 'Dishes' },
              { n: '4.8★',    l: 'Avg Rating' },
              { n: 'Daily',   l: 'Open 11AM–10PM' },
            ].map(s => (
              <div key={s.l}>
                <div style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: 'clamp(1.4rem, 3vw, 2.8rem)',
                  fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.04em',
                }}>{s.n}</div>
                <div style={{
                  fontSize: '9px', fontWeight: '700', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginTop: '4px',
                }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint arrow */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '8px', fontWeight: '700', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
          }}>Scroll to Browse</span>
          <div style={{
            width: '1px', height: '44px',
            background: 'linear-gradient(to bottom, rgba(182,145,46,0.6), transparent)',
            animation: 'menuPulse 2.1s ease-in-out infinite',
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DESKTOP — HORIZONTAL SCROLL GALLERY
          Pinned via GSAP ScrollTrigger. Hidden on mobile.
      ══════════════════════════════════════════════ */}
      <div id="menu-gallery" ref={triggerRef} style={{ display: 'block' }}>
        <div style={{
          height: '100vh', width: '100%', overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(182,145,46,0.15) 0%, #0A0800 60%, #080509 100%)',
          display: 'flex', flexDirection: 'column', position: 'relative',
        }}>
          {/* Warm center glow in the gallery */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '100vw', height: '80vh', pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse, rgba(182,145,46,0.2) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }} />
          {/* Progress bar */}
          <div style={{
            height: '2px', background: 'rgba(255,255,255,0.04)',
            flexShrink: 0, position: 'relative',
          }}>
            <div ref={progressRef} style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, #B6912E, #C42D78, #E8742A)',
              transformOrigin: 'left', transform: 'scaleX(0)',
              willChange: 'transform',
            }} />
          </div>

          {/* Top label bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px clamp(40px, 5vw, 80px)',
            flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.035)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '28px', height: '1px', background: '#B6912E' }} />
              <span style={{
                fontSize: '8px', fontWeight: '800', letterSpacing: '0.5em',
                textTransform: 'uppercase', color: '#B6912E',
              }}>
                Menu — Scroll to Explore
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span ref={counterRef} style={{
                fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Archivo Black', sans-serif",
              }}>01</span>
              <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{
                fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.15)',
                fontFamily: "'Archivo Black', sans-serif",
              }}>17</span>
            </div>
          </div>

          {/* Scrolling strip */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div ref={stripRef} style={{
              display: 'flex', height: '100%', alignItems: 'center',
              willChange: 'transform',
            }}>
              {categoryData.map((item, i) => (
                <PlateCard key={item.slug} item={item} index={i} plateSize={plateSize} />
              ))}
            </div>
          </div>

          {/* Bottom-right drag hint */}
          <div style={{
            position: 'absolute', bottom: '28px', right: '48px',
            display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: '8px', fontWeight: '700', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)',
            }}>drag to explore</span>
            <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.14)' }}>→</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════ */}
      <section style={{
        background: '#07050A',
        padding: 'clamp(80px,12vh,140px) clamp(24px,8vw,100px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '700px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(182,145,46,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '14px', marginBottom: '28px',
          }}>
            <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.5)' }} />
            <span style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.5em',
              textTransform: 'uppercase', color: '#B6912E',
            }}>Come Experience It</span>
            <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.5)' }} />
          </div>
          <h2 style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(2.4rem, 7vw, 6rem)', fontWeight: '900',
            lineHeight: 0.9, letterSpacing: '-0.04em',
            color: '#FFFFFF', margin: '0 0 24px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.65)' }}>Above KFC,</span><br />
            <span style={{ color: '#FFFFFF' }}>Gar-Ali.</span>
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.4vw, 16px)',
            color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
            margin: '0 auto 44px', maxWidth: '440px',
          }}>
            Open every day, 11 AM to 10 PM. Walk in or reserve ahead for the terrace seats.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#B6912E', color: '#000', textDecoration: 'none',
              padding: '16px 36px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.22em',
              textTransform: 'uppercase',
              boxShadow: '0 14px 44px rgba(182,145,46,0.35)',
            }}>
              Reserve a Table
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.15)', fontSize: '12px',
              }}>→</span>
            </Link>
            <Link to="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              padding: '16px 36px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '800', letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}>
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes menuPulse {
          0%, 100% { opacity: 0.25; transform: scaleY(0.7); }
          50%       { opacity: 1;   transform: scaleY(1); }
        }
      `}</style>
    </main>
  );
}