import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categoryData } from '../data/menuData';
import FlipBook from '../components/FlipBook';
import { useContent } from '../content/ContentContext';
import { defaultMenuStats } from '../content/defaults';

gsap.registerPlugin(ScrollTrigger);

/* ─── Accent palette — cycles through 5 restaurant-toned colors ─── */
const PALETTE = ['#B6912E', '#C42D78', '#E8742A', '#D42020', '#6B8F6B'];
const accent = (i) => PALETTE[i % PALETTE.length];

/* ─────────────────────────────────────────────────────────────────
   THE INDEX — chapter data for the table-of-contents nav.
   flip/side targets copied verbatim from the previous nav bar;
   `page` is the printed menu page number shown in the TOC
   (flipbook spread N shows menu pages 2N-1 | 2N).
───────────────────────────────────────────────────────────────── */
const INDEX_CHAPTERS = [
  {
    num: '01', short: 'Breakfast', lead: 'Breakfast &', accentWord: 'Brunch',
    items: [
      { name: 'All Day Breakfast Combos', page: 2, flip: 1, side: 'right' },
      { name: 'Sandwiches',               page: 3, flip: 2, side: 'left'  },
      { name: 'Omelettes',                page: 3, flip: 2, side: 'left'  },
      { name: 'Add Ons',                  page: 1, flip: 1, side: 'left'  },
      { name: 'Soups',                    page: 1, flip: 1, side: 'left'  },
    ],
  },
  {
    num: '02', short: 'Starters', lead: 'Starters &', accentWord: 'Sharing',
    items: [
      { name: 'Salads',                                page: 4, flip: 2, side: 'right' },
      { name: 'Appetizer — Veg',                       page: 4, flip: 2, side: 'right' },
      { name: 'Appetizer — Non-Veg',                   page: 5, flip: 3, side: 'left'  },
      { name: 'Hawker Style Steamed Dumplings',        page: 6, flip: 3, side: 'right' },
      { name: 'Hot Dogs — The American Comfort Snack', page: 6, flip: 3, side: 'right' },
    ],
  },
  {
    num: '03', short: 'Mains', lead: 'Mains &', accentWord: 'More',
    items: [
      { name: 'Pasta & Spaghetti', page: 7,  flip: 4, side: 'left'  },
      { name: 'Mains',             page: 10, flip: 5, side: 'right' },
      { name: 'Pizza',             page: 8,  flip: 4, side: 'right' },
      { name: 'Steaks',            page: 9,  flip: 5, side: 'left'  },
      { name: 'Dessert',           page: 9,  flip: 5, side: 'left'  },
    ],
  },
  {
    num: '04', short: 'Beverages', lead: '', accentWord: 'Beverages',
    items: [
      { name: 'Mojito & Coolers',        page: 11, flip: 6, side: 'left'  },
      { name: 'Shakes',                  page: 11, flip: 6, side: 'left'  },
      { name: 'Juices',                  page: 12, flip: 6, side: 'right' },
      { name: 'Ohana Summer Selections', page: 12, flip: 6, side: 'right' },
      { name: 'Others',                  page: 12, flip: 6, side: 'right' },
      { name: 'Hot Brews',               page: 13, flip: 7, side: 'left'  },
      { name: 'Cold Brews',              page: 13, flip: 7, side: 'left'  },
      { name: 'Tea',                     page: 13, flip: 7, side: 'left'  },
    ],
  },
];

/* Flipbook spread index (0 = cover … 7 = menu13) → chapter index (-1 = none) */
const PAGE_TO_CHAPTER = [-1, 0, 1, 1, 2, 2, 3, 3];

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

  /* Editable hero stats — /admin → Menu Book → Page stats */
  const contentCtx = useContent();
  const menuStats = (contentCtx && contentCtx.content && Array.isArray(contentCtx.content.menuStats) && contentCtx.content.menuStats.length)
    ? contentCtx.content.menuStats : defaultMenuStats;

  /* ── The Index (TOC nav) state ── */
  const [indexOpen, setIndexOpen]         = useState(false);
  const [activeChapter, setActiveChapter] = useState(-1);
  const [pulseTick, setPulseTick]         = useState(0);
  const pageTimer = useRef(null);

  /* ── First-visit hint ("what do I do here") ──
     visible → fading → gone; dismissed permanently on first sheet open. */
  const [hintState, setHintState] = useState('visible');
  const hintTimer = useRef(null);

  /* Desktop = wide viewport AND fine pointer (mouse/trackpad).
     matchMedia listener so the hint label text itself swaps. */
  const [isFineDesktop, setIsFineDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 900px) and (pointer: fine)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px) and (pointer: fine)');
    const fn = () => setIsFineDesktop(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const dismissHint = () => {
    setHintState(prev => {
      if (prev !== 'visible') return prev;
      hintTimer.current = setTimeout(() => setHintState('gone'), 550);
      return 'fading';
    });
  };

  const toggleIndex = () => {
    setIndexOpen(o => {
      if (!o) dismissHint(); // opening for the first time retires the hint
      return !o;
    });
  };
  useEffect(() => () => { if (hintTimer.current) clearTimeout(hintTimer.current); }, []);

  /* FlipBook reports every intermediate spread during multi-page jumps;
     debounce so the nav highlights only the chapter the reader LANDS on. */
  const handlePageChange = (p) => {
    if (pageTimer.current) clearTimeout(pageTimer.current);
    pageTimer.current = setTimeout(() => {
      const ch = PAGE_TO_CHAPTER[p] ?? -1;
      setActiveChapter(ch);
      if (ch >= 0) setPulseTick(t => t + 1); // retrigger numeral pulse
    }, 180);
  };
  useEffect(() => () => { if (pageTimer.current) clearTimeout(pageTimer.current); }, []);

  /* ── Deep-link: /menu?flip=N&side=left|right ──
     Land the flipbook on a specific spread (used by the Home hero's
     category cards). Shareable/refresh-safe; the params are consumed and
     stripped from the URL so later manual flips aren't overridden. */
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const flipParam = searchParams.get('flip');
    if (flipParam === null) return;
    const flip = parseInt(flipParam, 10);
    const side = searchParams.get('side') === 'right' ? 'right' : 'left';
    if (!Number.isInteger(flip) || flip < 1 || flip > 7) {
      setSearchParams({}, { replace: true });
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const tryJump = () => {
      if (cancelled) return;
      if (flipBookRef.current && flipBookRef.current.goToPage) {
        const gallery = document.getElementById('menu-gallery');
        if (gallery) {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          gallery.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
        flipBookRef.current.goToPage(flip, side);
        setSearchParams({}, { replace: true }); // consume the deep link
        return;
      }
      // Book not mounted yet (page transitions / hero entrance) — retry ~2s
      if (++attempts < 20) setTimeout(tryJump, 100);
      else setSearchParams({}, { replace: true });
    };
    const t = setTimeout(tryJump, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchParams, setSearchParams]);

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
            {menuStats.map(s => (
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
          THE INDEX — sticky table-of-contents nav
      ══════════════════════════════════════════════ */}
      <div id="menu-gallery" style={{ position: 'relative' }}>
        <style>{`
          /* Sticky dock: sits just below the fixed main navbar (z-50) so it
             never covers it — matches every other sticky element on the site */
          .idx-sticky { top: 52px; }
          @media (min-width: 701px) { .idx-sticky { top: 56px; } }
          .idx-sheet-grid { display: grid; grid-template-columns: 1fr; }
          @media (min-width: 900px) { .idx-sheet-grid { grid-template-columns: 1fr 1fr; } }
          .idx-row-name { transition: transform 0.35s cubic-bezier(0.2,0.8,0.2,1), color 0.35s ease; }
          .idx-row:hover .idx-row-name, .idx-row:active .idx-row-name { transform: translateX(6px); color: #D9B45B; }
          .idx-row:active .idx-row-page { color: #F2E7D0; }
          .idx-sheet::-webkit-scrollbar { width: 4px; }
          .idx-sheet::-webkit-scrollbar-thumb { background: rgba(182,145,46,0.3); }
          @keyframes idxPulse { 0% { opacity: 1; } 35% { opacity: 0.2; } 100% { opacity: 1; } }
          .idx-num-pulse { animation: idxPulse 0.7s ease; }
          @keyframes idxBarIn { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes idxTagIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
          /* Hint: one-time attention pulse 1.2s after mount */
          @keyframes idxHintAttn { 0%, 100% { opacity: 1; } 40% { opacity: 0.3; } 70% { opacity: 1; } }
          .idx-hint-attn { animation: idxHintAttn 1.4s ease 1.2s 1; }
          /* Mobile hint: touch ripple glyph (transform/opacity only) */
          .idx-ripple { position: relative; width: 16px; height: 16px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
          .idx-ripple::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #D9B45B; }
          .idx-ripple::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(217,180,91,0.75); animation: idxRipple 2s cubic-bezier(0.2,0.6,0.3,1) infinite; }
          @keyframes idxRipple { 0% { transform: scale(0.35); opacity: 0.9; } 70% { opacity: 0.15; } 100% { transform: scale(1.7); opacity: 0; } }
          /* Desktop hint: gentle down-chevron */
          .idx-chev { animation: idxChev 2.4s ease-in-out infinite; }
          @keyframes idxChev { 0%, 100% { transform: translateY(0); opacity: 0.75; } 50% { transform: translateY(3px); opacity: 1; } }
        `}</style>

        {/* Tap-outside veil — sits under the sticky bar, closes the sheet */}
        {indexOpen && (
          <div
            aria-hidden
            onClick={() => setIndexOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'transparent' }}
          />
        )}

        <div className="idx-sticky" style={{
          position: 'sticky', zIndex: 30,
          animation: 'idxBarIn 1s cubic-bezier(0.16,1,0.3,1) 0.5s both',
        }}>
          {/* ── Collapsed bar ── */}
          <div
            role="button" tabIndex={0}
            aria-expanded={indexOpen}
            aria-label={indexOpen ? 'Close menu contents' : 'Open menu contents'}
            onClick={toggleIndex}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleIndex(); } }}
            style={{
              height: '56px', display: 'flex', alignItems: 'center',
              gap: 'clamp(10px, 2.5vw, 28px)',
              padding: '0 clamp(16px, 4vw, 48px)',
              background: '#0B0906',
              borderBottom: '1px solid rgba(182,145,46,0.22)',
              cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(8px, 2.2vw, 9px)', fontWeight: 800, letterSpacing: '0.45em',
              textTransform: 'uppercase', color: '#B6912E', whiteSpace: 'nowrap',
            }}>
              The Index
            </span>
            <div style={{ flex: 1, height: '1px', minWidth: '10px', background: 'rgba(182,145,46,0.18)' }} />

            {/* First-visit hint — swaps label by device, retires after first open.
                Not focusable; the bar's aria-label carries the same meaning. */}
            {hintState !== 'gone' && (
              <span
                aria-hidden="true"
                className={hintState === 'visible' ? 'idx-hint-attn' : ''}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  opacity: hintState === 'fading' ? 0 : 1,
                  transform: hintState === 'fading' ? 'translateY(4px)' : 'translateY(0)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}
              >
                <span style={{
                  fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
                  fontSize: 'clamp(11.5px, 3vw, 14px)', color: '#D9B45B', letterSpacing: '0.03em',
                }}>
                  {isFineDesktop ? 'Click to explore the chapters' : 'Tap to open the contents'}
                </span>
                {isFineDesktop ? (
                  <svg className="idx-chev" width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
                    <path d="M1 1l4.5 4.5L10 1" stroke="#D9B45B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="idx-ripple" />
                )}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(14px, 2.5vw, 26px)' }}>
              {INDEX_CHAPTERS.map((ch, i) => {
                const isActive = i === activeChapter;
                return (
                  <span key={ch.num} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    {isActive && (
                      <span key={`tag-${pulseTick}`} style={{
                        fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
                        fontSize: '15px', color: '#D9B45B', whiteSpace: 'nowrap',
                        animation: 'idxTagIn 0.5s ease both',
                      }}>
                        {ch.short}
                      </span>
                    )}
                    <span
                      key={isActive ? `n-${pulseTick}` : `n-${i}`}
                      className={isActive && pulseTick > 0 ? 'idx-num-pulse' : ''}
                      style={{
                        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                        fontSize: '15px', lineHeight: 1,
                        color: isActive ? '#D9B45B' : 'transparent',
                        WebkitTextStroke: isActive ? 'none' : '1px rgba(242,231,208,0.3)',
                        transition: 'color 0.4s ease',
                      }}
                    >
                      {ch.num}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── Expanded sheet — unfolds down from the bar ── */}
          <div
            className="idx-sheet"
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              maxHeight: '70svh', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
              background: '#0E0C08',
              borderBottom: '1px solid rgba(182,145,46,0.35)',
              clipPath: indexOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              opacity: indexOpen ? 1 : 0,
              visibility: indexOpen ? 'visible' : 'hidden',
              transition: indexOpen
                ? 'clip-path 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease'
                : 'clip-path 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease, visibility 0s linear 0.5s',
              pointerEvents: indexOpen ? 'auto' : 'none',
            }}
          >
            <div className="idx-sheet-grid">
              {INDEX_CHAPTERS.map((ch, ci) => {
                const isActive = ci === activeChapter;
                return (
                  <div key={ch.num} style={{
                    padding: 'clamp(20px, 3vh, 32px) clamp(20px, 4vw, 44px)',
                    borderTop: '1px solid rgba(242,231,208,0.06)',
                    background: isActive ? 'rgba(182,145,46,0.045)' : 'transparent',
                    transition: 'background 0.5s ease',
                  }}>
                    {/* Chapter header */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px' }}>
                      <span style={{
                        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                        fontSize: '26px', lineHeight: 1,
                        color: isActive ? '#D9B45B' : 'transparent',
                        WebkitTextStroke: isActive ? 'none' : '1px rgba(242,231,208,0.28)',
                        transition: 'color 0.4s ease',
                      }}>
                        {ch.num}
                      </span>
                      <span style={{
                        fontFamily: "'Work Sans', sans-serif", fontWeight: 700,
                        fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: isActive ? '#F2E7D0' : 'rgba(242,231,208,0.75)',
                        transition: 'color 0.4s ease',
                      }}>
                        {ch.lead}{ch.lead ? ' ' : ''}
                        <span style={{
                          fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
                          textTransform: 'none', letterSpacing: '0.04em',
                          fontSize: '16px', color: '#D9B45B',
                        }}>
                          {ch.accentWord}
                        </span>
                      </span>
                    </div>
                    {/* Ledger rows */}
                    {ch.items.map((item) => (
                      <button
                        key={item.name}
                        className="idx-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (flipBookRef.current) flipBookRef.current.goToPage(item.flip, item.side);
                          setIndexOpen(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'baseline', gap: '12px',
                          width: '100%', minHeight: '56px',
                          background: 'none', border: 'none', padding: '0',
                          cursor: 'pointer', textAlign: 'left',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <span className="idx-row-name" style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em',
                          color: isActive ? 'rgba(242,231,208,0.95)' : 'rgba(242,231,208,0.72)',
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          flex: 1, minWidth: '20px',
                          borderBottom: '1px dotted rgba(182,145,46,0.35)',
                          transform: 'translateY(-4px)',
                        }} />
                        <span className="idx-row-page" style={{
                          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                          fontSize: '12px', letterSpacing: '0.12em', color: '#B6912E',
                          transition: 'color 0.35s ease',
                        }}>
                          {String(item.page).padStart(2, '0')}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <FlipBook ref={flipBookRef} onPageChange={handlePageChange} />
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