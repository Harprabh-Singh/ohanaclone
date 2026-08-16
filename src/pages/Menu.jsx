import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categoryData } from '../data/menuData';
import FlipBook from '../components/FlipBook';

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
function PlateCard({ item, index }) {
  const [hov, setHov] = useState(false);
  const a = accent(index);

  return (
    <Link
      to={`/menu/${item.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        // Mobile: 75vw wide, 55vh tall. Desktop: 38vw wide, 75vh tall.
        width: 'clamp(220px, 75vw, 550px)',
        height: 'clamp(320px, 55vh, 850px)',
        flexShrink: 0, position: 'relative', overflow: 'hidden',
        margin: '0 clamp(8px, 2vw, 30px)', borderRadius: '20px', textDecoration: 'none',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        cursor: 'pointer',
        willChange: 'transform',
      }}
    >
      {/* Background Image — no CSS filter to avoid repaint on scroll */}
      <div style={{
        position: 'absolute', inset: -20,
        background: `url(${item.image}) center/cover`,
        transform: hov ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 1.2s cubic-bezier(0.2,0.8,0.2,1)',
        willChange: 'transform',
        zIndex: 0,
      }} />
      {/* Dark overlay — lighter so images breathe */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#000',
        opacity: hov ? 0.2 : 0.38,
        transition: 'opacity 0.8s ease',
        zIndex: 0,
      }} />

      {/* Gradient Overlay for Text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.88) 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Huge Ghost Number */}
      <div aria-hidden style={{
        position: 'absolute', top: '30px', right: '30px',
        fontSize: 'clamp(6rem, 15vw, 14rem)', lineHeight: 0.8,
        fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
        color: 'transparent', WebkitTextStroke: `1.5px ${hov ? a : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.6s ease', zIndex: 1, pointerEvents: 'none',
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2, padding: 'clamp(24px, 4vw, 56px)',
        transform: hov ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
        }}>
          <div style={{ width: '32px', height: '2px', background: a, transition: 'background 0.4s ease' }} />
          <span style={{
            fontSize: '10px', fontWeight: '800', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: a, transition: 'color 0.4s ease',
          }}>
            Category
          </span>
        </div>

        <h3 style={{
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
          fontWeight: '900', color: '#FFFFFF',
          letterSpacing: '-0.04em', lineHeight: 0.9,
          margin: '0 0 20px', textShadow: '0 10px 40px rgba(0,0,0,0.8)',
        }}>
          {item.name}
        </h3>

        <p style={{
          fontSize: 'clamp(14px, 1.4vw, 18px)',
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6,
          margin: '0 0 32px', maxWidth: '90%',
        }}>
          {item.tagline}
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '16px 32px', borderRadius: '100px',
          background: hov ? a : 'rgba(255,255,255,0.06)',
          color: hov ? '#000' : '#FFF', border: `1px solid ${hov ? a : 'rgba(255,255,255,0.1)'}`,
          fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase',
          transition: 'all 0.4s ease',
        }}>
          View Menu
          <span style={{ transform: hov ? 'translateX(6px)' : 'translateX(0)', transition: 'transform 0.4s ease' }}>→</span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MENU PAGE
───────────────────────────────────────────────────────────────── */
export default function Menu() {
  const counterRef  = useRef(null);
  const heroRef     = useRef(null);
  const flipBookRef = useRef(null);

  const categoryToFlipMap = {
    'breakfast-brunch': 1,
    'starters': 2,
    'street-bites': 3,
    'mains-pasta': 4,
    'pizza': 4,
    'steaks-grill': 5,
    'dessert': 6,
    'beverages': 7,
  };

  /* Set page bg to dark so no white flash */

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
      const imgs = heroRef.current.querySelectorAll('.mr-img');

      gsap.set(els, { opacity: 0, y: 44 });
      gsap.set(imgs, { opacity: 0, scale: 1.15, y: 40 });

      gsap.to(els, {
        opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.3,
      });
      gsap.to(imgs, {
        opacity: 1, scale: 1, y: 0, duration: 1.8, ease: 'expo.out', stagger: 0.15,
      });

      // Subtle parallax on scroll for hero images
      imgs.forEach((img, i) => {
        gsap.to(img, {
          y: -100 * (i + 1),
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);



  return (
    <main style={{ background: '#0A0800', color: '#FAF7F1', overflowX: 'hidden', position: 'relative' }}>
      
      {/* Global Film Grain Overlay */}
      <svg style={{ display: 'none' }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
        </filter>
      </svg>
      {/* Film grain is removed — it triggers per-frame filter repaint */}

      {/* ══════════════════════════════════════════════
          HERO (MAXIMALIST)
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

        {/* Floating Culinary Layers — filter removed for scroll perf */}
        <div className="mr-img" style={{
          position: 'absolute', top: '15%', right: '-8%', width: 'clamp(300px, 45vw, 700px)', height: '70vh',
          background: 'url(https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200) center/cover',
          borderRadius: '32px', boxShadow: '0 40px 120px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 1, willChange: 'transform',
        }}>
          {/* Dark overlay instead of brightness filter */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '32px' }} />
        </div>
        <div className="mr-img" style={{
          position: 'absolute', bottom: '-15%', left: '-2%', width: 'clamp(250px, 35vw, 600px)', height: '55vh',
          background: 'url(https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200) center/cover',
          borderRadius: '32px', boxShadow: '0 40px 120px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 1, willChange: 'transform',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '32px' }} />
        </div>

        {/* Ghost BG "MENU" - Scaled up for maximalism */}
        <div aria-hidden style={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(10rem, 35vw, 32rem)',
          fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
          color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.04)',
          letterSpacing: '-0.06em', lineHeight: 0.85,
          userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0,
        }}>MENU</div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1400px', margin: '0 auto', width: '100%',
          padding: '40px clamp(24px,8vw,100px) clamp(80px,15vh,160px)',
        }}>
          {/* Eyebrow */}
          <div className="mr" style={{
            opacity: 0, display: 'flex', alignItems: 'center',
            gap: '14px', marginBottom: '36px',
          }}>
            <div style={{ width: '48px', height: '2px', background: '#B6912E' }} />
            <span style={{
              fontSize: '11px', fontWeight: '800', letterSpacing: '0.6em',
              textTransform: 'uppercase', color: '#B6912E',
            }}>The Complete Menu</span>
          </div>

          {/* Huge typography */}
          <h1 className="mr" style={{
            opacity: 0,
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(4rem, 13vw, 11rem)',
            textShadow: '0 0 120px rgba(182,145,46,0.3)',
            fontWeight: '900', lineHeight: 0.82,
            letterSpacing: '-0.05em', margin: '0 0 48px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}>What Are</span><br />
            <span style={{ color: '#FFFFFF' }}>You Feeling</span><br />
            <span style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(182,145,46,1)',
              fontStyle: 'italic', fontFamily: 'Georgia, serif',
              fontWeight: '400', fontSize: '0.8em', letterSpacing: '-0.01em',
            }}>today?</span>
          </h1>

          <p className="mr" style={{
            opacity: 0, fontSize: 'clamp(16px, 1.8vw, 22px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
            maxWidth: '640px', margin: '0 0 64px',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
          }}>
            8 categories. Everything from sunrise eggs to midnight desserts —
            served above Gar-Ali with the warmth Ohana is known for.
          </p>

          {/* CTAs */}
          <div className="mr" style={{ opacity: 0, display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '52px' }}>
            <a href="#menu-gallery" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#B6912E', color: '#000',
              textDecoration: 'none', padding: '14px 32px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.22em',
              textTransform: 'uppercase',
              boxShadow: '0 12px 40px rgba(182,145,46,0.35)',
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
              { n: '8',       l: 'Categories' },
              { n: '130+',    l: 'Dishes' },
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
          MENU FLIP BOOK
      ══════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════
          CATEGORY NAV BAR — sticky pill buttons
      ══════════════════════════════════════════════ */}
      <div id="menu-gallery" style={{ position: 'relative' }}>
        <div style={{
          position: 'sticky',
          top: '0',
          zIndex: 50,
          padding: 'clamp(14px, 2vh, 20px) clamp(16px, 4vw, 48px)',
          background: 'linear-gradient(to bottom, rgba(10,8,0,0.97) 0%, rgba(10,8,0,0.85) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(182,145,46,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '8px',
            fontWeight: '800',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(182,145,46,0.7)',
          }}>
            Browse by Category
          </span>
          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}>
            {[
              {
                name: '01 — BREAKFAST & BRUNCH',
                icon: '🍳',
                color: '#E8742A',
                items: [
                  { name: 'All Day Breakfast Combos', flip: 1, side: 'right' },
                  { name: 'Sandwiches',               flip: 2, side: 'left' },
                  { name: 'Omelettes',                flip: 2, side: 'left' },
                  { name: 'Add Ons',                  flip: 1, side: 'left' },
                  { name: 'Soups',                    flip: 1, side: 'left' }
                ]
              },
              {
                name: '02 — STARTERS & SHARING',
                icon: '🥗',
                color: '#6B8F6B',
                items: [
                  { name: 'Salads',                                    flip: 2, side: 'right' },
                  { name: 'Appetizer — Veg',                           flip: 2, side: 'right' },
                  { name: 'Appetizer — Non-Veg',                       flip: 3, side: 'left'  },
                  { name: 'Hawker Style Steamed Dumplings',            flip: 3, side: 'right' },
                  { name: 'Hot Dogs — The American Comfort Snack',     flip: 3, side: 'right' }
                ]
              },
              {
                name: '03 — MAINS & MORE',
                icon: '🍝',
                color: '#B6912E',
                items: [
                  { name: 'Pasta & Spaghetti', flip: 4, side: 'left'  },
                  { name: 'Mains',             flip: 5, side: 'right' },
                  { name: 'Pizza',             flip: 4, side: 'right' },
                  { name: 'Steaks',            flip: 5, side: 'left'  },
                  { name: 'Dessert',           flip: 5, side: 'left'  }
                ]
              },
              {
                name: '04 — BEVERAGES',
                icon: '🧋',
                color: '#C42D78',
                items: [
                  { name: 'Mojito & Coolers',         flip: 6, side: 'left'  },
                  { name: 'Shakes',                   flip: 6, side: 'left'  },
                  { name: 'Juices',                   flip: 6, side: 'right' },
                  { name: 'Ohana Summer Selections',  flip: 6, side: 'right' },
                  { name: 'Others',                   flip: 6, side: 'right' },
                  { name: 'Hot Brews',                flip: 7, side: 'left'  },
                  { name: 'Cold Brews',               flip: 7, side: 'left'  },
                  { name: 'Tea',                      flip: 7, side: 'left'  }
                ]
              }
            ].map((chapter) => {
              return (
                <div
                  key={chapter.name}
                  className="chapter-dropdown"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: '100px',
                    padding: '4px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = `rgba(${chapter.color === '#E8742A' ? '232,116,42' : chapter.color === '#B6912E' ? '182,145,46' : chapter.color === '#6B8F6B' ? '107,143,107' : '196,45,120'}, 0.4)`;
                    const menu = e.currentTarget.querySelector('.chapter-menu');
                    if (menu) {
                      menu.style.maxWidth = '1200px';
                      menu.style.opacity = '1';
                      menu.style.marginLeft = '8px';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    const menu = e.currentTarget.querySelector('.chapter-menu');
                    if (menu) {
                      menu.style.maxWidth = '0px';
                      menu.style.opacity = '0';
                      menu.style.marginLeft = '0px';
                    }
                  }}
                >
                  {/* Chapter Label */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 16px',
                    color: '#FFF',
                    fontSize: 'clamp(10px, 1.2vw, 12px)',
                    fontWeight: '800',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                  }}>
                    <span style={{ fontSize: '16px' }}>{chapter.icon}</span>
                    {chapter.name}
                  </div>

                  {/* Expanding horizontal menu */}
                  <div
                    className="chapter-menu"
                    style={{
                      display: 'flex',
                      gap: '6px',
                      maxWidth: '0px',
                      opacity: 0,
                      marginLeft: '0px',
                      transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <style>{`.chapter-menu::-webkit-scrollbar { display: none; }`}</style>
                    {chapter.items.map(item => {
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            if (flipBookRef.current) {
                              flipBookRef.current.goToPage(item.flip, item.side);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '100px',
                            background: 'rgba(0,0,0,0.4)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '9px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = chapter.color;
                            e.currentTarget.style.color = '#000';
                            e.currentTarget.style.borderColor = chapter.color;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <FlipBook ref={flipBookRef} />
      </div>


      {/* ══════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,12vh,140px) clamp(24px,8vw,100px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600) center/cover',
          filter: 'brightness(0.3) contrast(1.2) saturate(1.2)',
          zIndex: 0,
        }} />
        
        {/* Gradient overlays to blend with the dark page */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, #0A0800 0%, transparent 20%, transparent 80%, #0A0800 100%)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '800px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(182,145,46,0.25) 0%, transparent 70%)',
          // no filter:blur — static glow via background gradient only
          pointerEvents: 'none', zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '14px', marginBottom: '36px',
          }}>
            <div style={{ width: '48px', height: '2px', background: '#B6912E' }} />
            <span style={{
              fontSize: '11px', fontWeight: '800', letterSpacing: '0.6em',
              textTransform: 'uppercase', color: '#B6912E',
            }}>The Experience Awaits</span>
            <div style={{ width: '48px', height: '2px', background: '#B6912E' }} />
          </div>

          <h2 style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: '900',
            lineHeight: 0.85, letterSpacing: '-0.05em',
            margin: '0 0 40px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}>Above KFC,</span><br />
            <span style={{ color: '#FFFFFF', textShadow: '0 20px 80px rgba(0,0,0,0.9)' }}>Gar-Ali.</span>
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 20px)',
            color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            margin: '0 auto 56px', maxWidth: '540px', textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}>
            Open every day, 11 AM to 10 PM. Walk in or reserve ahead for the terrace seats.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              background: '#B6912E', color: '#000', textDecoration: 'none',
              padding: '20px 48px', borderRadius: '100px',
              fontSize: '11px', fontWeight: '900', letterSpacing: '0.25em',
              textTransform: 'uppercase',
              boxShadow: '0 20px 60px rgba(182,145,46,0.4)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}>
              Reserve a Table
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.15)', fontSize: '14px',
              }}>→</span>
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