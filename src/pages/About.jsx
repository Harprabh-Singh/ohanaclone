import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { ArrowRight } from 'lucide-react';
import { testimonials } from '../data/testimonials';

gsap.registerPlugin(ScrollTrigger);

/* ─── Design tokens ─────────────────────────────────────────── */
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
  space: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  cta: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80',
};

/* ─── Shared bits ───────────────────────────────────────────── */
const GoldLabel = ({ children, center = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: center ? 'center' : 'flex-start' }}>
    <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />
    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: C.gold, whiteSpace: 'nowrap' }}>{children}</span>
    {center && <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />}
  </div>
);

function AnimatedCounter({ value, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;
    const num = parseFloat(value);
    const obj = { val: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        hasAnimated.current = true;
        gsap.to(obj, {
          val: num, duration, ease: 'power2.out',
          onUpdate: () => { if (el) el.textContent = Math.round(obj.val) + suffix; },
        });
      },
    });
    return () => trigger.kill();
  }, [value, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

const pillGold = {
  display: 'inline-flex', alignItems: 'center', gap: '10px',
  background: C.gold, color: '#0B0906', textDecoration: 'none',
  padding: '16px 34px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
  fontFamily: BODY, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
};
const pillGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '10px',
  background: 'transparent', border: `1px solid ${C.hairline}`,
  color: C.muted, textDecoration: 'none',
  padding: '16px 34px', borderRadius: '100px',
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
  fontFamily: BODY, transition: 'border-color 0.3s ease, color 0.3s ease',
};

/* ═════════════════════════════════════════════════════════════
   1 · HERO — full-bleed cinematic photo, char reveal
   ═════════════════════════════════════════════════════════════ */
const HeroSection = ({ reduced }) => {
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
        // Char reveal per line
        lineRefs.current.forEach((lineEl, li) => {
          if (!lineEl) return;
          const split = new SplitType(lineEl, { types: 'chars' });
          splits.push(split);
          gsap.set(split.chars, { yPercent: 115, rotateX: -45, transformPerspective: 600 });
          gsap.to(split.chars, {
            yPercent: 0, rotateX: 0,
            duration: 1.15, ease: 'expo.out',
            stagger: 0.022, delay: 0.25 + li * 0.14,
          });
        });
        // Sub / CTA reveal
        gsap.fromTo('.ab-hero-fade',
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.9 }
        );
        // Scroll scrubs — background zooms OUT, content drifts up
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
    <section ref={sectionRef} style={{ position: 'relative', height: '100svh', minHeight: '560px', overflow: 'hidden', background: C.bg }}>
      {/* Full-bleed photo */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, willChange: 'transform', transformOrigin: 'center center' }}>
        <img src={IMG.hero} alt="Warm terrace evening at Ohana" fetchpriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      {/* Scrims — top for navbar, heavy bottom fade into page bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,9,6,0.72) 0%, rgba(11,9,6,0.18) 26%, rgba(11,9,6,0.12) 55%, rgba(11,9,6,0.82) 84%, #0B0906 100%)', pointerEvents: 'none' }} />

      {/* Content */}
      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(22px, 6vw, 96px) clamp(84px, 13vh, 130px)', paddingTop: '80px', maxWidth: '1500px', margin: '0 auto', width: '100%' }}>
        <div className="ab-hero-fade" style={{ marginBottom: 'clamp(20px, 3vh, 34px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel>Our Story — Gar-Ali, Jorhat</GoldLabel>
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3.2rem, 15vw, 10rem)', lineHeight: 0.88, letterSpacing: '-0.03em', margin: '0 0 clamp(22px, 3.5vh, 38px)', color: C.cream }}>
          <span style={lineWrap}><span ref={el => { lineRefs.current[0] = el; }} style={{ display: 'inline-block' }}>OHANA.</span></span>
          <span style={lineWrap}>
            <span ref={el => { lineRefs.current[1] = el; }} style={{ display: 'inline-block' }}>
              Family{' '}
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.56em', letterSpacing: '0' }}>in</span>
            </span>
          </span>
          <span style={lineWrap}><span ref={el => { lineRefs.current[2] = el; }} style={{ display: 'inline-block' }}>Every Bite.</span></span>
        </h1>

        <p className="ab-hero-fade" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)', color: 'rgba(242,231,208,0.7)', lineHeight: 1.55, maxWidth: '540px', margin: '0 0 clamp(28px, 4vh, 42px)', opacity: reduced ? 1 : 0 }}>
          Above KFC, Gar-Ali — a terrace kitchen where strangers become regulars, and every plate carries the warmth of home.
        </p>

        <div className="ab-hero-fade" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', opacity: reduced ? 1 : 0 }}>
          <Link to="/menu" style={pillGold}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            Explore Menu <ArrowRight size={15} />
          </Link>
          <Link to="/reservations" style={pillGhost}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,231,208,0.45)'; e.currentTarget.style.color = C.cream; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.hairline; e.currentTarget.style.color = C.muted; }}>
            Reserve a Table
          </Link>
        </div>
      </div>

      {/* Scroll hint — vertical line with traveling light dot */}
      <div ref={hintRef} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, pointerEvents: 'none' }}>
        <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.faint, fontFamily: BODY }}>Scroll</span>
        <div style={{ position: 'relative', width: '1px', height: '56px', background: 'rgba(182,145,46,0.28)', overflow: 'hidden' }}>
          <span className="ab-hint-dot" style={{ position: 'absolute', top: 0, left: '-1.5px', width: '4px', height: '4px', borderRadius: '50%', background: C.goldBright }} />
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   2 · MANIFESTO — scroll-lit words
   ═════════════════════════════════════════════════════════════ */
const ManifestoSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const paraRef = useRef(null);

  const segments = [
    { t: 'Ohana means ' }, { t: 'family. ', serif: true },
    { t: 'Family means ' }, { t: 'nobody gets left behind. ', serif: true },
    { t: "Above Gar-Ali's bustle, we built a terrace where Jorhat slows down — where breakfast runs " },
    { t: 'tropical, ', serif: true }, { t: 'evenings run ' }, { t: 'golden, ', serif: true },
    { t: 'and strangers leave as ' }, { t: 'regulars.', serif: true },
  ];

  useEffect(() => {
    if (!sectionRef.current || !paraRef.current) return;
    let split = null;
    const ctx = gsap.context(() => {
      if (reduced) return; // static: words fully visible
      split = new SplitType(paraRef.current, { types: 'words' });
      gsap.set(split.words, { opacity: 0.12 });
      gsap.to(split.words, {
        opacity: 1, ease: 'none', duration: 1, stagger: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
      gsap.fromTo('.ab-manifesto-label',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.ab-manifesto-label', start: 'top 90%', once: true } }
      );
    }, sectionRef);
    return () => { ctx.revert(); if (split) split.revert(); };
  }, [reduced]);

  const inner = (
    <div style={{ maxWidth: 'min(920px, 90vw)', margin: '0 auto', textAlign: 'center' }}>
      <div className="ab-manifesto-label" style={{ marginBottom: 'clamp(28px, 5vh, 44px)', opacity: reduced ? 1 : 0 }}>
        <GoldLabel center>The Manifesto</GoldLabel>
      </div>
      <p ref={paraRef} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 'clamp(1.6rem, 6.5vw, 3.4rem)', lineHeight: 1.28, letterSpacing: '-0.015em', color: C.cream, margin: 0 }}>
        {segments.map((s, i) => (
          <span key={i} style={s.serif ? { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '1.06em' } : undefined}>{s.t}</span>
        ))}
      </p>
    </div>
  );

  if (reduced) {
    return (
      <section ref={sectionRef} style={{ background: C.bg2, padding: '100px 0' }}>
        {inner}
      </section>
    );
  }
  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '230vh', background: C.bg2 }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {inner}
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   3 · JOURNEY — pinned scrollytelling chapters
   ═════════════════════════════════════════════════════════════ */
const JourneySection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const layerRefs = useRef([]);
  const bgRefs = useRef([]);
  const numRefs = useRef([]);
  const fillRef = useRef(null);
  const counterRef = useRef(null);
  const activeRef = useRef(0);

  const chapters = [
    { year: '2022', label: 'The Beginning', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80', desc: 'Opened above KFC, Gar-Ali with a dream: a terrace kitchen where every guest feels like family.' },
    { year: '2023', label: 'Loved by Many', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80', desc: "1,000+ guests served. 4.8★ average rating. The word spread — Ohana was becoming Jorhat's favourite." },
    { year: '2024', label: 'Bigger & Bolder', img: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1600&q=80', desc: 'New menu items, expanded terrace, longer hours. From tropical breakfasts to midnight munchies.' },
    { year: 'Now', label: 'The Family Grows', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80', desc: '2,000+ regulars and counting. Every plate still carries the warmth of that first day.' },
  ];
  const N = chapters.length;

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return; // stacked static chapters
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(N - 1, Math.floor(self.progress * N));
            if (idx !== activeRef.current && counterRef.current) {
              activeRef.current = idx;
              counterRef.current.textContent = `0${idx + 1} — 0${N}`;
            }
          },
        },
      });
      chapters.forEach((_, i) => {
        // background slow zoom while active
        tl.fromTo(bgRefs.current[i], { scale: 1.12 }, { scale: 1, duration: 1 }, i);
        // numeral parallax at its own rate
        tl.fromTo(numRefs.current[i], { yPercent: 14 }, { yPercent: -14, duration: 1 }, i);
        // incoming layer rises
        if (i > 0) tl.fromTo(layerRefs.current[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45 }, i);
        // outgoing layer drifts up + fades
        if (i < N - 1) tl.to(layerRefs.current[i], { opacity: 0, y: -40, duration: 0.45 }, i + 1);
      });
      // progress rail
      gsap.fromTo(fillRef.current, { scaleY: 0 }, {
        scaleY: 1, ease: 'none', transformOrigin: 'top center',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced, N]);

  const chapterBlock = (ch, i) => (
    <div
      key={ch.year}
      ref={el => { layerRefs.current[i] = el; }}
      style={reduced
        ? { position: 'relative', minHeight: '92svh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }
        : { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', opacity: i === 0 ? 1 : 0 }}
    >
      {/* Chapter photo */}
      <div ref={el => { bgRefs.current[i] = el; }} style={{ position: 'absolute', inset: 0 }}>
        <img src={ch.img} alt={ch.label} loading="lazy" decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,9,6,0.62) 0%, rgba(11,9,6,0.3) 42%, rgba(11,9,6,0.86) 82%, #0B0906 100%)', pointerEvents: 'none' }} />

      {/* Giant numeral / serif "Now" */}
      <div ref={el => { numRefs.current[i] = el; }} aria-hidden
        style={{ position: 'absolute', right: 'clamp(8px, 4vw, 60px)', top: '16%', pointerEvents: 'none', userSelect: 'none', lineHeight: 0.8 }}>
        {ch.year === 'Now' ? (
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: 'clamp(5rem, 26vw, 15rem)', opacity: 0.9 }}>Now</span>
        ) : (
          <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(6rem, 34vw, 18rem)', color: 'transparent', WebkitTextStroke: '1.5px rgba(242,231,208,0.3)', letterSpacing: '-0.05em' }}>{ch.year}</span>
        )}
      </div>

      {/* Copy */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(22px, 6vw, 96px) clamp(72px, 12vh, 120px)', maxWidth: '720px' }}>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.4vw, 1.35rem)', color: C.goldBright, margin: '0 0 10px' }}>
          {String(i + 1).padStart(2, '0')} · {ch.year}
        </p>
        <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 8.5vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: C.cream, margin: '0 0 16px' }}>{ch.label}</h3>
        <p style={{ fontSize: 'clamp(0.9rem, 2.6vw, 1.05rem)', color: C.muted, lineHeight: 1.7, margin: 0, maxWidth: '480px', fontFamily: BODY }}>{ch.desc}</p>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section ref={sectionRef} style={{ position: 'relative', background: C.bg }}>
        <div style={{ padding: '72px clamp(22px, 6vw, 96px) 40px' }}><GoldLabel>The Journey</GoldLabel></div>
        {chapters.map(chapterBlock)}
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: `${N * 100}vh`, background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
        {/* Section label */}
        <div style={{ position: 'absolute', top: 'clamp(88px, 12vh, 110px)', left: 'clamp(22px, 6vw, 96px)', zIndex: 6 }}>
          <GoldLabel>The Journey</GoldLabel>
        </div>
        {/* Chapter counter */}
        <div ref={counterRef} style={{ position: 'absolute', top: 'clamp(88px, 12vh, 110px)', right: 'clamp(22px, 6vw, 96px)', zIndex: 6, fontFamily: BODY, fontSize: '11px', fontWeight: 700, letterSpacing: '0.35em', color: C.gold }}>
          01 — 0{N}
        </div>
        {/* Progress rail */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: C.hairline, zIndex: 6 }}>
          <div ref={fillRef} style={{ width: '100%', height: '100%', background: C.gold, transform: 'scaleY(0)' }} />
        </div>
        {chapters.map(chapterBlock)}
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   4 · PILLARS — editorial numbered list with sticky index
   ═════════════════════════════════════════════════════════════ */
const PillarsSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const counterNumRef = useRef(null);
  const activeRef = useRef(-1);

  const pillars = [
    { title: <>Ohana <em>Spirit</em></>, desc: "Family isn't just our name — it's how we treat every guest who walks through our door." },
    { title: <>Farm to <em>Table</em></>, desc: 'Local ingredients, global flavours. We source fresh, cook with passion, and serve with pride.' },
    { title: <>Terrace <em>Living</em></>, desc: 'Open sky, warm breeze, golden hour glow. Our terrace is where memories are made.' },
    { title: <>Midnight <em>Munchies</em></>, desc: "Late night cravings? We've got you covered until 10 PM with our full menu." },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray('.ab-pillar-row');
      rows.forEach((row, i) => {
        if (!reduced) {
          gsap.fromTo(row,
            { opacity: 0, y: 70 },
            { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 82%', once: true } }
          );
        }
      });
      // Sticky index: the active row = the LAST row whose top has passed the
      // 40% reading line. One section-level trigger instead of per-row bands —
      // the old per-row onToggle bands skipped 01 and 04 on tall desktop
      // viewports because two bands could hand off in a single scroll frame.
      const updateCounter = () => {
        const line = window.innerHeight * 0.4;
        let idx = 0;
        rows.forEach((row, i) => { if (row.getBoundingClientRect().top <= line) idx = i; });
        if (activeRef.current !== idx && counterNumRef.current) {
          activeRef.current = idx;
          counterNumRef.current.textContent = `0${idx + 1}`;
          if (!reduced) gsap.fromTo(counterNumRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
        }
      };
      ScrollTrigger.create({
        trigger: sectionRef.current, start: 'top bottom', end: 'bottom top',
        onUpdate: updateCounter, onToggle: updateCounter, onRefresh: updateCounter,
      });
      updateCounter();
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg2, padding: 'clamp(72px, 10vh, 120px) 0 clamp(80px, 12vh, 130px)' }}>
      <div className="ab-pillars-grid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 96px)' }}>
        {/* Sticky index */}
        <div className="ab-pillars-side">
          <GoldLabel>What We Believe</GoldLabel>
          <div style={{ marginTop: 'clamp(10px, 2vh, 24px)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span ref={counterNumRef} style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.6rem, 9vw, 6.5rem)', lineHeight: 1, color: C.cream, letterSpacing: '-0.03em' }}>01</span>
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 3vw, 2rem)', color: C.goldBright }}>/ 04</span>
          </div>
        </div>

        {/* Rows */}
        <div>
          {pillars.map((p, i) => (
            <div key={i} className="ab-pillar-row"
              style={{
                position: 'relative',
                borderTop: `1px solid ${C.hairline}`,
                padding: 'clamp(44px, 8vh, 90px) 0',
                textAlign: i % 2 === 1 ? 'right' : 'left',
                opacity: reduced ? 1 : 0,
              }}>
              {/* Outlined index numeral */}
              <span aria-hidden style={{
                position: 'absolute', top: 'clamp(18px, 4vh, 40px)',
                [i % 2 === 1 ? 'left' : 'right']: 0,
                fontFamily: DISPLAY, fontSize: 'clamp(4.5rem, 15vw, 9rem)', lineHeight: 1,
                color: 'transparent', WebkitTextStroke: '1.5px rgba(242,231,208,0.22)',
                pointerEvents: 'none', userSelect: 'none',
              }}>{String(i + 1).padStart(2, '0')}</span>

              <h3 style={{
                position: 'relative', zIndex: 1,
                fontFamily: DISPLAY, fontSize: 'clamp(2rem, 8vw, 4.5rem)', lineHeight: 0.95,
                letterSpacing: '-0.03em', color: C.cream, margin: '0 0 18px',
              }}>
                {p.title}
              </h3>
              <p style={{
                fontSize: 'clamp(0.9rem, 2.4vw, 1.05rem)', color: C.muted, lineHeight: 1.7,
                margin: 0, maxWidth: '460px', fontFamily: BODY,
                [i % 2 === 1 ? 'marginLeft' : 'marginRight']: 'auto',
              }}>{p.desc}</p>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.hairline}` }} />
        </div>
      </div>
      <style>{`
        .ab-pillars-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        .ab-pillars-side { position: sticky; top: 76px; z-index: 5; padding: 14px 0 18px; background: linear-gradient(to bottom, ${C.bg2} 72%, transparent); }
        @media (min-width: 900px) {
          .ab-pillars-grid { grid-template-columns: minmax(260px, 360px) 1fr; gap: clamp(48px, 7vw, 120px); }
          .ab-pillars-side { top: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; background: none; padding: 0; }
        }
        .ab-pillar-row em { font-family: ${SERIF}; font-style: italic; font-weight: 400; color: ${C.goldBright}; font-size: 1.04em; }
      `}</style>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   5 · GALLERY — asymmetric staggered editorial scroll
   ═════════════════════════════════════════════════════════════ */
const GallerySection = ({ reduced }) => {
  const sectionRef = useRef(null);

  const items = [
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', label: 'Terrace Evenings', w: '74%', align: 'left', ratio: '4 / 3' },
    { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', label: 'Plated Perfection', w: '88%', align: 'right', ratio: '16 / 10' },
    { src: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80', label: 'Night Lights', w: '62%', align: 'left', ratio: '3 / 4' },
    { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', label: 'Morning Brew', w: '82%', align: 'right', ratio: '4 / 3' },
    { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', label: 'Craft Cocktails', w: '68%', align: 'left', ratio: '1 / 1' },
    { src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', label: 'Sweet Endings', w: '86%', align: 'right', ratio: '16 / 10' },
  ];

  useEffect(() => {
    if (!sectionRef.current || reduced) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ isMobile: '(max-width: 768px)', isDesktop: '(min-width: 769px)' }, (mctx) => {
        const range = mctx.conditions.isMobile ? 5 : 8;
        gsap.utils.toArray('.ab-gal-item').forEach((fig) => {
          const img = fig.querySelector('.ab-gal-img');
          // inner parallax
          gsap.fromTo(img, { yPercent: -range }, {
            yPercent: range, ease: 'none',
            scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
          // clip + fade entrance
          gsap.fromTo(fig,
            { opacity: 0, y: 60, clipPath: 'inset(10% 4% 10% 4%)' },
            { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 86%', once: true } }
          );
        });
      });
      return () => mm.revert();
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg, padding: 'clamp(72px, 10vh, 120px) 0 clamp(80px, 12vh, 130px)' }}>
      {/* Sticky label */}
      <div style={{ position: 'sticky', top: '84px', zIndex: 6, padding: '0 clamp(22px, 6vw, 96px)', marginBottom: 'clamp(28px, 5vh, 48px)', pointerEvents: 'none' }}>
        <div style={{ display: 'inline-block', textShadow: '0 2px 22px rgba(11,9,6,0.95), 0 0 8px rgba(11,9,6,0.9)' }}>
          <GoldLabel>Through Our Lens</GoldLabel>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(48px, 9vh, 110px)' }}>
        {items.map((it, i) => (
          <figure key={it.label} className="ab-gal-item"
            style={{
              width: it.w, margin: 0,
              [it.align === 'right' ? 'marginLeft' : 'marginRight']: 'auto',
              opacity: reduced ? 1 : 0,
            }}>
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: it.ratio, background: C.bg3 }}>
              <img className="ab-gal-img" src={it.src} alt={it.label} loading="lazy" decoding="async"
                style={{ position: 'absolute', left: 0, top: '-9%', width: '100%', height: '118%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,9,6,0.78) 0%, rgba(11,9,6,0.12) 38%, transparent 60%)', pointerEvents: 'none' }} />
              {/* Caption overlapping bottom corner */}
              <figcaption style={{ position: 'absolute', left: 'clamp(14px, 3vw, 28px)', bottom: 'clamp(12px, 2.5vw, 24px)', right: 'clamp(14px, 3vw, 28px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.15rem, 3.4vw, 1.9rem)', letterSpacing: '-0.02em', color: C.cream }}>{it.label}</span>
                <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', color: C.goldBright, paddingBottom: '4px' }}>
                  {String(i + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
                </span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   6 · SPACE & STATS — full-bleed parallax interlude
   ═════════════════════════════════════════════════════════════ */
const SpaceSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.fromTo(bgRef.current, { yPercent: -12 }, {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
        gsap.fromTo('.ab-space-reveal',
          { opacity: 0, y: 46 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.ab-space-content', start: 'top 74%', once: true } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  const stats = [
    { value: '40', suffix: '+', label: 'Seats' },
    { value: '360', suffix: '°', label: 'Sky View' },
    { value: '5', suffix: 'PM', label: 'Golden Hour' },
  ];

  return (
    <section ref={sectionRef} style={{ position: 'relative', minHeight: '92svh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: C.bg }}>
      {/* Parallax background */}
      <div ref={bgRef} style={{ position: 'absolute', inset: '-15%', willChange: reduced ? 'auto' : 'transform' }}>
        <img src={IMG.space} alt="The Ohana terrace space" loading="lazy" decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0B0906 0%, rgba(11,9,6,0.62) 28%, rgba(11,9,6,0.62) 72%, #0B0906 100%)', pointerEvents: 'none' }} />

      <div className="ab-space-content" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '760px', padding: 'clamp(88px, 13vh, 150px) clamp(22px, 6vw, 60px)' }}>
        <div className="ab-space-reveal" style={{ marginBottom: 'clamp(22px, 3.5vh, 32px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel center>The Space</GoldLabel>
        </div>
        <h2 className="ab-space-reveal" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.3rem, 8.5vw, 5.2rem)', lineHeight: 0.95, letterSpacing: '-0.035em', color: C.cream, margin: '0 0 24px', opacity: reduced ? 1 : 0 }}>
          A Terrace Above<br />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.94em' }}>the Rest.</span>
        </h2>
        <p className="ab-space-reveal" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.4vw, 1.25rem)', color: 'rgba(242,231,208,0.65)', lineHeight: 1.7, margin: '0 auto clamp(36px, 6vh, 56px)', maxWidth: '540px', opacity: reduced ? 1 : 0 }}>
          The open-air terrace at Gar-Ali isn't just seating — it's where Jorhat's evenings unfold. Warm lighting, gentle breeze, and the clink of glasses under a canopy of stars.
        </p>

        <div className="ab-space-reveal" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', opacity: reduced ? 1 : 0 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 clamp(18px, 4vw, 40px)', borderLeft: i === 0 ? 'none' : `1px solid ${C.hairline}` }}>
              <p style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.7rem, 5vw, 2.6rem)', color: C.cream, letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.gold, margin: '8px 0 0', fontFamily: BODY }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   7 · TESTIMONIALS — sticky quote crossfade
   ═════════════════════════════════════════════════════════════ */
const VoicesSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const quoteRefs = useRef([]);
  const indexRef = useRef(null);
  const activeRef = useRef(0);

  const quotes = testimonials.slice(0, 5);
  const N = quotes.length;

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(N - 1, Math.floor(self.progress * N));
            if (idx !== activeRef.current && indexRef.current) {
              activeRef.current = idx;
              indexRef.current.textContent = `0${idx + 1}/0${N}`;
            }
          },
        },
      });
      quotes.forEach((_, i) => {
        if (i > 0) tl.fromTo(quoteRefs.current[i], { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.4 }, i);
        if (i < N - 1) tl.to(quoteRefs.current[i], { opacity: 0, y: -30, duration: 0.4 }, i + 1);
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced, N]);

  const quoteBlock = (t, i) => (
    <div key={i} ref={el => { quoteRefs.current[i] = el; }}
      style={reduced
        ? { position: 'relative', padding: '40px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.hairline}` }
        : { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 clamp(22px, 6vw, 60px)', opacity: i === 0 ? 1 : 0 }}>
      <span aria-hidden style={{ fontFamily: SERIF, fontSize: 'clamp(3rem, 9vw, 5rem)', lineHeight: 0.5, color: C.gold, marginBottom: 'clamp(18px, 3vh, 30px)' }}>&ldquo;</span>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.4rem, 5.5vw, 2.6rem)', lineHeight: 1.35, color: C.cream, margin: '0 0 clamp(20px, 3.5vh, 32px)', maxWidth: '820px' }}>
        {t.quote}
      </p>
      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.gold, margin: 0, fontFamily: BODY }}>{t.name}</p>
    </div>
  );

  if (reduced) {
    return (
      <section ref={sectionRef} style={{ background: C.bg3, padding: '88px clamp(22px, 6vw, 96px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}><GoldLabel center>What They Say</GoldLabel></div>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>{quotes.map(quoteBlock)}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: `${(N + 1) * 60}vh`, background: C.bg3 }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 'clamp(88px, 13vh, 120px)', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}>
          <GoldLabel center>What They Say</GoldLabel>
        </div>
        <div ref={indexRef} style={{ position: 'absolute', bottom: 'clamp(36px, 7vh, 64px)', left: 0, right: 0, textAlign: 'center', zIndex: 6, fontFamily: BODY, fontSize: '10px', fontWeight: 700, letterSpacing: '0.4em', color: C.faint }}>
          01/0{N}
        </div>
        {quotes.map(quoteBlock)}
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   8 · CTA — closing full-bleed
   ═════════════════════════════════════════════════════════════ */
const CTAFinale = ({ reduced }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo('.ab-cta-reveal',
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', minHeight: '96svh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: C.bg }}>
      {/* Ken Burns background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img src={IMG.cta} alt="Cocktails at golden hour" loading="lazy" decoding="async"
          className={reduced ? undefined : 'ab-kenburns'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0B0906 0%, rgba(11,9,6,0.55) 30%, rgba(11,9,6,0.6) 70%, #0B0906 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(90px, 14vh, 160px) clamp(22px, 6vw, 60px) clamp(64px, 10vh, 110px)', width: '100%' }}>
        <div className="ab-cta-reveal" style={{ marginBottom: 'clamp(22px, 3.5vh, 32px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel center>Reservations</GoldLabel>
        </div>
        <h2 className="ab-cta-reveal" style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 13vw, 9rem)', lineHeight: 0.88, letterSpacing: '-0.035em', color: C.cream, margin: '0 0 clamp(24px, 4vh, 40px)', opacity: reduced ? 1 : 0 }}>
          Join<br />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.94em' }}>the Family.</span>
        </h2>
        <p className="ab-cta-reveal" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.4vw, 1.3rem)', color: 'rgba(242,231,208,0.65)', lineHeight: 1.6, margin: '0 auto clamp(32px, 5vh, 48px)', maxWidth: '460px', opacity: reduced ? 1 : 0 }}>
          Walk in anytime. Reserve for the terrace. Either way, you're Ohana now.
        </p>
        <div className="ab-cta-reveal" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', opacity: reduced ? 1 : 0 }}>
          <Link to="/reservations" style={pillGold}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            Reserve a Table <ArrowRight size={15} />
          </Link>
          <Link to="/menu" style={pillGhost}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,231,208,0.45)'; e.currentTarget.style.color = C.cream; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.hairline; e.currentTarget.style.color = C.muted; }}>
            Browse Menu
          </Link>
        </div>

        {/* Footer strip */}
        <div className="ab-cta-reveal" style={{ marginTop: 'clamp(56px, 9vh, 90px)', opacity: reduced ? 1 : 0 }}>
          <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto', borderTop: `1px solid ${C.hairline}`, paddingTop: '20px' }}>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.faint, margin: 0, fontFamily: BODY }}>
              Gar-Ali · Jorhat, Assam — Above KFC · Open every day till 10 PM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   ABOUT — composition + Lenis smooth scroll (this page only)
   ═════════════════════════════════════════════════════════════ */
const About = () => {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    document.body.style.backgroundColor = C.bg;
    document.documentElement.style.backgroundColor = C.bg;

    let lenis = null;
    let rafCb = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        touchMultiplier: 2,
      });
      lenis.on('scroll', ScrollTrigger.update);
      rafCb = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(rafCb);
      gsap.ticker.lagSmoothing(0);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener('load', refresh);
      if (rafCb) gsap.ticker.remove(rafCb);
      if (lenis) lenis.destroy();
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [reduced]);

  return (
    <main style={{ position: 'relative', background: C.bg, overflowX: 'clip' }}>
      <HeroSection reduced={reduced} />
      <ManifestoSection reduced={reduced} />
      <JourneySection reduced={reduced} />
      <PillarsSection reduced={reduced} />
      <GallerySection reduced={reduced} />
      <SpaceSection reduced={reduced} />
      <VoicesSection reduced={reduced} />
      <CTAFinale reduced={reduced} />

      <style>{`
        @keyframes abHintDot {
          0%   { transform: translateY(0); opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }
        .ab-hint-dot { animation: abHintDot 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes abKenBurns {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
        .ab-kenburns { animation: abKenBurns 22s ease-in-out infinite alternate; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .ab-hint-dot, .ab-kenburns { animation: none !important; }
        }
      `}</style>
    </main>
  );
};

export default About;
