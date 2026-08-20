import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { ArrowRight } from 'lucide-react';
import { galleryImages } from '../data/galleryImages';
import Lightbox from '../components/Lightbox';
import { useContent } from '../content/ContentContext';

/* Content store (admin-editable) with bundled fallback */
const useGalleryImages = () => {
  const ctx = useContent();
  return (ctx && Array.isArray(ctx.content?.gallery) && ctx.content.gallery.length)
    ? ctx.content.gallery
    : galleryImages;
};

gsap.registerPlugin(ScrollTrigger);

/* ─── Design tokens (shared with About / Reservations / Contact) */
const C = {
  bg: '#0B0906',
  bg2: '#121009',
  bg3: '#0E0C08',
  gold: '#B6912E',
  goldBright: '#D9B45B',
  cream: '#F2E7D0',
  muted: 'rgba(242,231,208,0.55)',
  faint: 'rgba(242,231,208,0.28)',
  hairline: 'rgba(242,231,208,0.12)',
};
const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";
const BODY = "'Work Sans', sans-serif";

const IMG = {
  hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
};

const descriptions = {
  Interior: 'Step inside our warm, carefully designed space — where every corner tells a story of comfort and character.',
  Terrace: 'Dine under the open sky on our lush terrace, where the breeze meets the aroma of fresh cuisine.',
  Food: 'From garden-fresh salads to indulgent mains — every plate crafted with passion and premium ingredients.',
};

/* Group frames into chapters, preserving the global index for the lightbox */
const buildChapters = (images) => ['Interior', 'Terrace', 'Food'].map((name, ci) => ({
  name,
  num: `0${ci + 1}`,
  desc: descriptions[name],
  items: images.map((img, index) => ({ ...img, index })).filter((img) => img.category === name),
})).filter((ch) => ch.items.length > 0);

const GoldLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />
    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: C.gold, whiteSpace: 'nowrap' }}>{children}</span>
  </div>
);

/* ═════════════════════════════════════════════════════════════
   1 · HERO — full-bleed photo, char reveal
   ═════════════════════════════════════════════════════════════ */
const HeroSection = ({ reduced }) => {
  const images = useGalleryImages();
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);
  const hintRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const splits = [];
    const ctx = gsap.context(() => {
      if (!reduced) {
        lineRefs.current.forEach((lineEl, li) => {
          if (!lineEl) return;
          const split = new SplitType(lineEl, { types: 'chars' });
          splits.push(split);
          gsap.set(split.chars, { yPercent: 115, rotateX: -45, transformPerspective: 600 });
          gsap.to(split.chars, {
            yPercent: 0, rotateX: 0,
            duration: 1.15, ease: 'expo.out',
            stagger: 0.024, delay: 0.25 + li * 0.15,
          });
        });
        gsap.fromTo('.gl-hero-fade',
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.85 }
        );
        gsap.fromTo(bgRef.current, { scale: 1.18, yPercent: 0 }, {
          scale: 1, yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
        gsap.to(contentRef.current, {
          yPercent: -12, opacity: 0.25, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
        gsap.to(hintRef.current, {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '18% top', scrub: true },
        });
      } else {
        gsap.set(bgRef.current, { scale: 1 });
      }
    }, sectionRef);
    return () => { ctx.revert(); splits.forEach(s => s.revert()); };
  }, [reduced]);

  const lineWrap = { display: 'block', overflow: 'hidden', paddingBottom: '0.1em', marginBottom: '-0.1em' };

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '100svh', minHeight: '540px', overflow: 'hidden', background: C.bg }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, willChange: 'transform', transformOrigin: 'center center' }}>
        <img src={IMG.hero} alt="Evening on the Ohana terrace" fetchpriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,9,6,0.72) 0%, rgba(11,9,6,0.18) 26%, rgba(11,9,6,0.12) 55%, rgba(11,9,6,0.82) 84%, #0B0906 100%)', pointerEvents: 'none' }} />

      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(22px, 6vw, 96px) clamp(84px, 13vh, 130px)', paddingTop: '80px', maxWidth: '1500px', margin: '0 auto', width: '100%' }}>
        <div className="gl-hero-fade" style={{ marginBottom: 'clamp(20px, 3vh, 34px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel>Gallery</GoldLabel>
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3.2rem, 15vw, 10rem)', lineHeight: 0.88, letterSpacing: '-0.03em', margin: '0 0 clamp(20px, 3vh, 32px)', color: C.cream }}>
          <span style={lineWrap}><span ref={el => { lineRefs.current[0] = el; }} style={{ display: 'inline-block' }}>Moments,</span></span>
          <span style={lineWrap}>
            <span ref={el => { lineRefs.current[1] = el; }} style={{ display: 'inline-block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, letterSpacing: '0' }}>Plated.</span>
          </span>
        </h1>

        <p className="gl-hero-fade" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.gold, margin: 0, fontFamily: BODY, opacity: reduced ? 1 : 0 }}>
          {images.length} frames · 3 rooms
        </p>
      </div>

      <div ref={hintRef} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, pointerEvents: 'none' }}>
        <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.faint, fontFamily: BODY }}>Scroll</span>
        <div style={{ position: 'relative', width: '1px', height: '56px', background: 'rgba(182,145,46,0.28)', overflow: 'hidden' }}>
          <span className="gl-hint-dot" style={{ position: 'absolute', top: 0, left: '-1.5px', width: '4px', height: '4px', borderRadius: '50%', background: C.goldBright }} />
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   2 · THE WALK — pinned chapters that pan HORIZONTALLY,
       alternating direction per room (zigzag through the space)
   ═════════════════════════════════════════════════════════════ */

/* Caption + grade layers shared by pan frames and reduced-stack frames */
const FrameVisual = ({ item, reduced, parClass, total }) => (
  <>
    <div className={parClass} style={{ position: 'absolute', top: 0, left: '-10%', width: '120%', height: '100%' }}>
      <img src={item.src} alt={item.label} loading="lazy" decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: reduced ? 'none' : 'saturate(0.22) brightness(0.55)' }} />
      <img src={item.src} alt="" aria-hidden loading="lazy" decoding="async"
        className="gl-color"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: reduced ? 1 : 0 }} />
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,9,6,0.78) 0%, rgba(11,9,6,0.1) 36%, transparent 58%)', pointerEvents: 'none' }} />
    <figcaption style={{ position: 'absolute', left: 'clamp(14px, 3vw, 26px)', right: 'clamp(14px, 3vw, 26px)', bottom: 'clamp(12px, 2.5vw, 22px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.05rem, 3vw, 1.7rem)', letterSpacing: '-0.02em', color: C.cream }}>{item.label}</span>
      <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', color: C.goldBright, paddingBottom: '4px', whiteSpace: 'nowrap' }}>
        {String(item.index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </figcaption>
  </>
);

const PanChapter = ({ ch, ci, reduced, onOpen, total }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const counterRef = useRef(null);
  const fillRef = useRef(null);
  const lastIdx = useRef(-1);
  const reverse = ci % 2 === 1; // chapters zigzag: forward, reverse, forward
  const N = ch.items.length;

  useEffect(() => {
    if (!containerRef.current || reduced) return;
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const frames = gsap.utils.toArray(track.querySelectorAll('.gl-pan-item'));
      const colors = frames.map((f) => f.querySelector('.gl-color'));
      const scales = frames.map((f) => f.querySelector('.gl-pan-scale'));
      const maxX = () => Math.max(0, track.scrollWidth - window.innerWidth);

      /* Focus pull — frame nearest centre: full colour + scale 1 */
      const updateFocus = () => {
        const mid = window.innerWidth / 2;
        let best = 0;
        let bestD = Infinity;
        frames.forEach((f, i) => {
          const r = f.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.min(1, Math.abs(c - mid) / (window.innerWidth * 0.55));
          if (d < bestD) { bestD = d; best = i; }
          colors[i].style.opacity = String(1 - d);
          scales[i].style.transform = `scale(${1 - d * 0.06})`;
        });
        if (best !== lastIdx.current && counterRef.current) {
          lastIdx.current = best;
          counterRef.current.textContent = `${String(best + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
        }
      };

      const stBase = {
        trigger: containerRef.current, start: 'top top', end: 'bottom bottom',
        scrub: 1, invalidateOnRefresh: true,
      };

      /* The pan itself — direction alternates per chapter */
      gsap.fromTo(track,
        { x: () => (reverse ? -maxX() : 0) },
        { x: () => (reverse ? 0 : -maxX()), ease: 'none', scrollTrigger: { ...stBase, onUpdate: updateFocus } }
      );

      /* Depth — inner image counter-parallaxes against the pan */
      frames.forEach((f) => {
        gsap.fromTo(f.querySelector('.gl-pan-par'),
          { xPercent: reverse ? -8 : 8 },
          { xPercent: reverse ? 8 : -8, ease: 'none', scrollTrigger: stBase }
        );
      });

      /* Chapter progress hairline */
      gsap.fromTo(fillRef.current, { scaleX: 0 }, {
        scaleX: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: stBase,
      });

      updateFocus();
      ScrollTrigger.addEventListener('refresh', updateFocus);
      return () => ScrollTrigger.removeEventListener('refresh', updateFocus);
    }, containerRef);
    return () => ctx.revert();
  }, [reduced, reverse]);

  /* Chapter header content (shared by pan + reduced modes) */
  const header = (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <span aria-hidden style={{
        position: 'absolute', top: '-8px', right: 0,
        fontFamily: DISPLAY, fontSize: 'clamp(3.2rem, 11vw, 6.5rem)', lineHeight: 1,
        color: 'transparent', WebkitTextStroke: '1.5px rgba(182,145,46,0.3)',
        pointerEvents: 'none', userSelect: 'none',
      }}>{ch.num}</span>
      <GoldLabel>{`${ch.num} — ${ch.name}`}</GoldLabel>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.9rem, 7vw, 4rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: C.cream, margin: '14px 0 10px' }}>
        {ch.name}
      </h2>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.4vw, 1.15rem)', color: C.muted, lineHeight: 1.6, margin: 0, maxWidth: '480px' }}>
        {ch.desc}
      </p>
    </div>
  );

  /* Reduced motion — plain vertical stack, full colour */
  if (reduced) {
    return (
      <div style={{ position: 'relative', padding: 'clamp(48px, 8vh, 80px) clamp(22px, 6vw, 96px)' }}>
        <div style={{ marginBottom: 'clamp(28px, 5vh, 44px)' }}>{header}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 6vh, 64px)', maxWidth: '860px', margin: '0 auto' }}>
          {ch.items.map((item) => (
            <figure key={item.index} onClick={() => onOpen(item.index)}
              style={{ margin: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3', background: C.bg3 }}>
              <FrameVisual item={item} reduced total={total} />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="gl-walk-chapter" style={{ position: 'relative', height: `${N * 70 + 100}vh` }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
        {/* Horizontal frame track */}
        <div ref={trackRef} className="gl-pan-track">
          {ch.items.map((item) => (
            <figure key={item.index} className="gl-pan-item" onClick={() => onOpen(item.index)}
              style={{ margin: 0, flexShrink: 0, cursor: 'pointer' }}>
              <div className="gl-pan-scale" style={{ transformOrigin: 'center center' }}>
                <div className="gl-pan-frame" style={{ position: 'relative', overflow: 'hidden', background: C.bg3 }}>
                  <FrameVisual item={item} reduced={false} parClass="gl-pan-par" total={total} />
                </div>
              </div>
            </figure>
          ))}
        </div>

        {/* Chapter chrome — header (top) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, pointerEvents: 'none',
          padding: 'clamp(80px, 11vh, 104px) clamp(22px, 6vw, 96px) 28px',
          background: `linear-gradient(to bottom, ${C.bg} 55%, transparent)`,
        }}>
          {header}
        </div>

        {/* Chapter chrome — live frame counter (bottom-left) */}
        <div ref={counterRef} style={{
          position: 'absolute', bottom: 'clamp(22px, 4vh, 36px)', left: 'clamp(22px, 6vw, 96px)', zIndex: 5,
          fontFamily: BODY, fontSize: '11px', fontWeight: 700, letterSpacing: '0.4em', color: C.gold,
          pointerEvents: 'none', textShadow: '0 2px 16px rgba(11,9,6,0.9)',
        }}>
          01 / {String(N).padStart(2, '0')}
        </div>

        {/* Chapter chrome — progress hairline (bottom edge) */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: C.hairline, zIndex: 5, pointerEvents: 'none' }}>
          <div ref={fillRef} style={{ width: '100%', height: '100%', background: C.gold, transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  );
};

const WalkSection = ({ reduced, onOpen }) => {
  const sectionRef = useRef(null);
  const images = useGalleryImages();
  const chapters = useMemo(() => buildChapters(images), [images]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg }}>
      {chapters.map((ch, ci) => (
        <PanChapter key={`${ch.name}:${ch.items.length}`} ch={ch} ci={ci} reduced={reduced} onOpen={onOpen} total={images.length} />
      ))}

      <style>{`
        .gl-pan-track {
          display: flex; align-items: center;
          gap: 6vw; height: 100%;
          width: max-content;
          padding: 0 11vw;
        }
        .gl-pan-frame { width: 78vw; height: 68svh; }
        @media (min-width: 900px) {
          .gl-pan-track { gap: 4vw; padding: 0 28vw; }
          .gl-pan-frame { width: 44vw; height: 72svh; }
        }
      `}</style>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   3 · CLOSING — the rest, you'll have to taste
   ═════════════════════════════════════════════════════════════ */
const ClosingSection = ({ reduced }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo('.gl-close-reveal',
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: sectionRef.current, start: 'top 74%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg3, padding: 'clamp(88px, 13vh, 150px) 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 60px)', textAlign: 'center' }}>
        <div className="gl-close-reveal" style={{ borderTop: `1px solid ${C.hairline}`, maxWidth: '480px', margin: '0 auto clamp(32px, 5vh, 48px)', opacity: reduced ? 1 : 0 }} />
        <h2 className="gl-close-reveal" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 8vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: C.cream, margin: '0 0 clamp(28px, 4.5vh, 44px)', opacity: reduced ? 1 : 0 }}>
          The rest, you'll<br />have to{' '}
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.98em' }}>taste.</span>
        </h2>
        <div className="gl-close-reveal" style={{ opacity: reduced ? 1 : 0 }}>
          <Link to="/reservations" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: C.gold, color: '#0B0906', textDecoration: 'none',
            padding: '17px 36px', borderRadius: '100px',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontFamily: BODY, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            Reserve a Table <ArrowRight size={15} />
          </Link>
        </div>
        <p className="gl-close-reveal" style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.faint, margin: 'clamp(40px, 7vh, 60px) 0 0', fontFamily: BODY, opacity: reduced ? 1 : 0 }}>
          Gar-Ali · Jorhat, Assam — Above KFC · Open every day till 10 PM
        </p>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   GALLERY — composition + Lenis (this page only)
   ═════════════════════════════════════════════════════════════ */
const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const images = useGalleryImages();
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    document.body.style.backgroundColor = C.bg;
    document.documentElement.style.backgroundColor = C.bg;

    let instance = null;
    let rafCb = null;
    if (!reduced) {
      instance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        touchMultiplier: 2,
      });
      instance.on('scroll', ScrollTrigger.update);
      rafCb = (time) => instance.raf(time * 1000);
      gsap.ticker.add(rafCb);
      gsap.ticker.lagSmoothing(0);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener('load', refresh);
      if (rafCb) gsap.ticker.remove(rafCb);
      if (instance) instance.destroy();
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [reduced]);

  return (
    <main style={{ position: 'relative', background: C.bg, overflowX: 'clip' }}>
      <HeroSection reduced={reduced} />
      <WalkSection reduced={reduced} onOpen={setLightboxIndex} />
      <ClosingSection reduced={reduced} />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <style>{`
        @keyframes glHintDot {
          0%   { transform: translateY(0); opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }
        .gl-hint-dot { animation: glHintDot 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gl-hint-dot { animation: none !important; }
        }
      `}</style>
    </main>
  );
};

export default Gallery;
