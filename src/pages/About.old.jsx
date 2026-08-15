import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { Sparkles, Users, HeartHandshake, Flame, ArrowRight, Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';

gsap.registerPlugin(ScrollTrigger);

const GOLD = '#B6912E';
const MAGENTA = '#C42D78';

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = '', duration = 2, color = '#FFFFFF' }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;
    const num = parseFloat(value);
    const isDecimal = String(value).includes('.');
    const obj = { val: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        hasAnimated.current = true;
        gsap.to(obj, {
          val: num, duration, ease: 'power2.out',
          onUpdate: () => {
            if (el) el.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix;
          }
        });
      },
    });
    return () => trigger.kill();
  }, [value, suffix, duration]);
  return <span ref={ref} style={{ color }}>0{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const sectionRef = useRef(null);
  const img1Ref = useRef(null);
  const img2Ref = useRef(null);
  const img3Ref = useRef(null);
  const textRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(img1Ref.current, { y: -120, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to(img2Ref.current, { y: -180, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.4 } });
      gsap.to(img3Ref.current, { y: -90, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.9 } });
      const els = textRef.current.querySelectorAll('.ab-hero-reveal');
      gsap.set(els, { opacity: 0, y: 50 });
      gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.3 });
      if (headlineRef.current) {
        const split = new SplitType(headlineRef.current, { types: 'chars' });
        gsap.set(split.chars, { opacity: 0, y: 80, rotateX: -40 });
        gsap.to(split.chars, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.015, delay: 0.2 });
        return () => split.revert();
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="ab-hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#0A0800', paddingTop: '80px' }}>
      <div className="ab-glow-gold" style={{ position: 'absolute', top: '-15%', right: '-10%', width: '900px', height: '900px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(182,145,46,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div className="ab-glow-magenta" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(196,45,120,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(8rem, 28vw, 26rem)', fontFamily: "'Archivo Black', 'Arial Black', sans-serif", fontWeight: '900', color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.035)', letterSpacing: '-0.06em', lineHeight: 0.85, userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap' }}>ABOUT</div>
      <div ref={img1Ref} className="ab-float-img" style={{ position: 'absolute', top: '18%', right: '5%', width: 'clamp(140px, 18vw, 280px)', height: 'clamp(180px, 24vw, 360px)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)', zIndex: 2, willChange: 'transform', opacity: 0.7 }}>
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80" alt="Terrace dining" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div ref={img2Ref} className="ab-float-img" style={{ position: 'absolute', bottom: '12%', left: '8%', width: 'clamp(120px, 15vw, 240px)', height: 'clamp(150px, 20vw, 300px)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)', zIndex: 2, willChange: 'transform', opacity: 0.6 }}>
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" alt="Food plate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div ref={img3Ref} className="ab-float-img" style={{ position: 'absolute', top: '55%', right: '18%', width: 'clamp(100px, 12vw, 200px)', height: 'clamp(100px, 12vw, 200px)', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)', zIndex: 2, willChange: 'transform', opacity: 0.5 }}>
        <img src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=400&q=80" alt="Night atmosphere" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div ref={textRef} style={{ position: 'relative', zIndex: 5, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: 'clamp(60px, 12vh, 140px) clamp(24px, 8vw, 100px)' }}>
        <div className="ab-hero-reveal" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', opacity: 0 }}>
          <div style={{ width: '48px', height: '2px', background: GOLD }} />
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.6em', textTransform: 'uppercase', color: GOLD }}>Our Story</span>
        </div>
        <h1 ref={headlineRef} className="ab-hero-headline" style={{ fontFamily: "'Archivo Black', 'Arial Black', sans-serif", fontSize: 'clamp(3.5rem, 12vw, 11rem)', fontWeight: '900', lineHeight: 0.85, letterSpacing: '-0.05em', margin: '0 0 40px', perspective: '1000px' }}>
          <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.85)' }}>Ohana.</span><br />
          <span style={{ color: '#FFFFFF' }}>Family</span>{' '}
          <span style={{ color: 'transparent', WebkitTextStroke: `2px ${GOLD}`, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '0.72em', letterSpacing: '-0.01em' }}>in</span><br />
          <span style={{ color: '#FFFFFF' }}>Every Bite.</span>
        </h1>
        <p className="ab-hero-reveal" style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '560px', margin: '0 0 48px', fontFamily: 'Georgia, serif', fontStyle: 'italic', opacity: 0 }}>
          Above KFC, Gar-Ali — a terrace kitchen where strangers become regulars, and every plate carries the warmth of home.
        </p>
        <div className="ab-hero-reveal" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', opacity: 0 }}>
          <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: GOLD, color: '#000', textDecoration: 'none', padding: '16px 36px', borderRadius: '100px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 12px 40px rgba(182,145,46,0.35)', transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(182,145,46,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(182,145,46,0.35)'; }}>
            Explore Menu <ArrowRight size={16} />
          </Link>
          <Link to="/reservations" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '16px 36px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
            Reserve a Table
          </Link>
        </div>
      </div>
      <div className="ab-scroll-hint" style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', pointerEvents: 'none', zIndex: 5 }}>
        <span style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>Scroll to explore</span>
        <div style={{ width: '1px', height: '44px', background: `linear-gradient(to bottom, ${GOLD}88, transparent)`, animation: 'abPulse 2.1s ease-in-out infinite' }} />
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   JOURNEY SECTION — SVG draw-on-scroll timeline
   ═══════════════════════════════════════════════════════════════ */
const JourneySection = () => {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const itemsRef = useRef([]);

  const milestones = [
    { year: '2022', label: 'The Beginning', desc: 'Opened above KFC, Gar-Ali with a dream: a terrace kitchen where every guest feels like family.' },
    { year: '2023', label: 'Loved by Many', desc: '1,000+ guests served. 4.8★ average rating. The word spread — Ohana was becoming Jorhat\'s favourite.' },
    { year: '2024', label: 'Bigger & Bolder', desc: 'New menu items, expanded terrace, longer hours. From tropical breakfasts to midnight munchies.' },
    { year: 'Now', label: 'The Family Grows', desc: '2,000+ regulars and counting. Every plate still carries the warmth of that first day.' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // SVG line draw-on-scroll
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%', end: 'bottom 65%', scrub: 1 },
        });
      }
      // Milestone cards stagger in
      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 30 },
          { opacity: 1, x: 0, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: '#07060A', padding: '140px 0', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '20%', right: '-15%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,45,120,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: GOLD }}>Our Journey</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
          <h2 style={{ fontFamily: "'Archivo Black', 'Arial Black', sans-serif", fontSize: 'clamp(2.8rem, 8vw, 7rem)', fontWeight: '900', lineHeight: 0.92, letterSpacing: '-0.04em', margin: 0 }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>From</span>{' '}
            <span style={{ color: '#FFFFFF' }}>Dream</span><br />
            <span style={{ color: '#FFFFFF' }}>To </span>
            <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${GOLD}`, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '0.75em' }}>Reality.</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="ab-timeline-wrap" style={{ position: 'relative' }}>
          {/* SVG vertical line */}
          <svg className="ab-timeline-svg" style={{ position: 'absolute', left: '28px', top: '8px', height: 'calc(100% - 16px)', width: '4px', overflow: 'visible' }}>
            <line ref={pathRef} x1="2" y1="0" x2="2" y2="100%" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px, 8vh, 80px)' }}>
            {milestones.map((m, i) => (
              <div
                key={i}
                ref={el => { itemsRef.current[i] = el; }}
                className="ab-journey-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  gap: 'clamp(16px, 3vw, 32px)',
                  alignItems: 'start',
                }}
              >
                {/* Node */}
                <div className="ab-journey-node" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: i === 3 ? MAGENTA : GOLD,
                    border: '3px solid #07060A',
                    boxShadow: `0 0 25px ${i === 3 ? MAGENTA : GOLD}55`,
                    zIndex: 2, flexShrink: 0,
                  }} />
                </div>

                {/* Content card */}
                <div className="ab-journey-content" style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: 'clamp(20px, 3vw, 32px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Accent line */}
                  <div style={{
                    position: 'absolute', top: 0, left: '24px',
                    width: '36px', height: '2px',
                    background: i % 2 === 0 ? GOLD : MAGENTA, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: "'Archivo Black', sans-serif",
                    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                    fontWeight: '900', color: GOLD,
                    margin: '4px 0 6px', letterSpacing: '-0.03em',
                  }}>{m.year}</p>
                  <p style={{
                    fontSize: '12px', fontWeight: '800',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#FFFFFF', margin: '0 0 10px',
                  }}>{m.label}</p>
                  <p style={{
                    fontSize: 'clamp(13px, 1.4vw, 15px)',
                    color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0,
                    maxWidth: '520px',
                  }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PHILOSOPHY SECTION — 4 value cards with 3D tilt
   ═══════════════════════════════════════════════════════════════ */
const PhilosophySection = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const cardsRef = useRef([]);

  const values = [
    { icon: <HeartHandshake size={28} />, title: 'Ohana Spirit', desc: 'Family isn\'t just our name — it\'s how we treat every guest who walks through our door.', color: GOLD },
    { icon: <Sparkles size={28} />, title: 'Farm to Table', desc: 'Local ingredients, global flavours. We source fresh, cook with passion, and serve with pride.', color: '#6B8F6B' },
    { icon: <Users size={28} />, title: 'Terrace Living', desc: 'Open sky, warm breeze, golden hour glow. Our terrace is where memories are made.', color: '#E8742A' },
    { icon: <Flame size={28} />, title: 'Midnight Munchies', desc: 'Late night cravings? We\'ve got you covered until 10 PM with our full menu.', color: MAGENTA },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    let splitInstance = null;
    const ctx = gsap.context(() => {
      // SplitType headline
      if (headlineRef.current) {
        splitInstance = new SplitType(headlineRef.current, { types: 'words' });
        gsap.set(splitInstance.words, { opacity: 0, y: 60, rotateX: -40 });
        gsap.to(splitInstance.words, {
          opacity: 1, y: 0, rotateX: 0,
          duration: 1, ease: 'expo.out', stagger: 0.08,
          scrollTrigger: { trigger: headlineRef.current, start: 'top 80%', once: true },
        });
      }
      // Cards stagger
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 80, scale: 0.95 });
        gsap.to(card, {
          opacity: 1, y: 0, scale: 1,
          duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          delay: i * 0.12,
        });
      });
    }, sectionRef);
    return () => {
      ctx.revert();
      if (splitInstance) splitInstance.revert();
    };
  }, []);

  const handleMouseMove = (e, idx) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.02)`;
  };

  const handleMouseLeave = (idx) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: '#0A0800', padding: '140px 0', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,145,46,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: GOLD }}>What We Believe</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
          <h2 ref={headlineRef} style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(2.8rem, 8vw, 7rem)',
            fontWeight: '900', lineHeight: 0.92, letterSpacing: '-0.04em', margin: 0,
            perspective: '1000px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>Built On</span><br />
            <span style={{ color: '#FFFFFF' }}>Four </span>
            <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${MAGENTA}`, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '0.75em' }}>Pillars.</span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="ab-philo-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {values.map((v, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el; }}
              onMouseMove={e => handleMouseMove(e, i)}
              onMouseLeave={() => handleMouseLeave(i)}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: 'clamp(28px, 3vw, 40px)',
                transition: 'transform 0.15s ease, box-shadow 0.3s ease',
                cursor: 'default',
                willChange: 'transform',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent top bar */}
              <div style={{ position: 'absolute', top: 0, left: '28px', width: '32px', height: '2px', background: v.color, borderRadius: '2px' }} />
              {/* Icon */}
              <div style={{ color: v.color, marginBottom: '20px', marginTop: '4px' }}>{v.icon}</div>
              {/* Title */}
              <h3 style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                fontWeight: '900', color: '#FFFFFF',
                letterSpacing: '-0.02em', margin: '0 0 12px',
              }}>{v.title}</h3>
              {/* Desc */}
              <p style={{
                fontSize: 'clamp(13px, 1.3vw, 15px)',
                color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0,
              }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HORIZON GALLERY — Pinned horizontal scroll with parallax
   ═══════════════════════════════════════════════════════════════ */
const HorizonGallery = () => {
  const sectionRef = useRef(null);
  const stripRef = useRef(null);

  const images = [
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', label: 'Terrace Evenings' },
    { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', label: 'Plated Perfection' },
    { src: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80', label: 'Night Lights' },
    { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', label: 'Morning Brew' },
    { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', label: 'Craft Cocktails' },
    { src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', label: 'Sweet Endings' },
  ];

  useEffect(() => {
    if (!sectionRef.current || !stripRef.current) return;
    const ctx = gsap.context(() => {
      const strip = stripRef.current;
      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal scroll
      mm.add('(min-width: 769px)', () => {
        const scrollWidth = strip.scrollWidth - window.innerWidth;
        gsap.to(strip, {
          x: -scrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${scrollWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
        // Inner parallax
        const inners = strip.querySelectorAll('.horizon-img-inner');
        inners.forEach((img) => {
          gsap.fromTo(img,
            { x: '-12%' },
            { x: '12%', ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: () => `+=${scrollWidth}`, scrub: 1 } }
          );
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="ab-horizon-section" style={{
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
      background: '#050407',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Section label */}
      <div style={{
        position: 'absolute', top: '40px', left: 'clamp(24px, 6vw, 80px)',
        zIndex: 3, display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ width: '32px', height: '1.5px', background: GOLD }} />
        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: GOLD }}>Through Our Lens</span>
      </div>

      <div ref={stripRef} className="ab-horizon-strip" style={{
        display: 'flex',
        gap: '24px',
        height: '70vh',
        alignItems: 'center',
        padding: '0 10vw',
        willChange: 'transform',
      }}>
        {images.map((img, i) => (
          <div key={i} className="ab-horizon-card" style={{
            flexShrink: 0,
            width: 'clamp(280px, 32vw, 460px)',
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
          }}>
            {/* Inner image with parallax */}
            <div className="horizon-img-inner" style={{
              position: 'absolute',
              inset: '-15%',
              width: '130%',
              height: '130%',
              background: `url(${img.src}) center/cover`,
            }} />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(5,4,7,0.9) 0%, rgba(5,4,7,0.2) 50%, transparent 100%)',
              zIndex: 1, pointerEvents: 'none',
            }} />
            {/* Label */}
            <div style={{ position: 'absolute', bottom: '28px', left: '28px', zIndex: 2 }}>
              <p style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                fontWeight: '900', color: '#FFFFFF',
                letterSpacing: '-0.02em', margin: 0,
              }}>{img.label}</p>
              <p style={{
                fontSize: '10px', fontWeight: '700',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: GOLD, margin: '6px 0 0',
              }}>{String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SPACE SECTION — Full-bleed parallax background
   ═══════════════════════════════════════════════════════════════ */
const SpaceSection = () => {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Parallax background
      gsap.fromTo(bgRef.current,
        { y: '-12%' },
        { y: '12%', ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 } }
      );
      // Content reveal
      const els = contentRef.current.querySelectorAll('.space-reveal');
      gsap.set(els, { opacity: 0, y: 50 });
      gsap.to(els, {
        opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: contentRef.current, start: 'top 75%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      minHeight: '80vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Parallax background image */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: '-15%',
        background: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80) center/cover',
      }} />
      {/* Gradient scrims */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #050407 0%, rgba(5,4,7,0.65) 30%, rgba(5,4,7,0.65) 70%, #050407 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '700px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(182,145,46,0.08) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '680px', padding: 'clamp(80px, 12vh, 140px) clamp(24px, 6vw, 60px)' }}>
        <div className="space-reveal" style={{ opacity: 0, marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.55em', textTransform: 'uppercase', color: GOLD }}>The Space</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
        </div>

        <h2 className="space-reveal" style={{
          opacity: 0,
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
          fontWeight: '900', lineHeight: 0.95,
          letterSpacing: '-0.04em', margin: '0 0 28px',
        }}>
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>A Terrace</span><br />
          <span style={{ color: '#FFFFFF' }}>Above </span>
          <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${GOLD}`, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '0.8em' }}>the Rest.</span>
        </h2>

        <p className="space-reveal" style={{
          opacity: 0,
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
          margin: '0 auto 36px', fontFamily: 'Georgia, serif', fontStyle: 'italic',
        }}>
          The open-air terrace at Gar-Ali isn't just seating — it's where Jorhat's evenings unfold. Warm lighting, gentle breeze, and the clink of glasses under a canopy of stars.
        </p>

        <div className="space-reveal" style={{ opacity: 0, display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { num: '40+', label: 'Seats' },
            { num: '360°', label: 'Sky View' },
            { num: '5PM', label: 'Golden Hour' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                fontWeight: '900', color: '#FFFFFF',
                letterSpacing: '-0.03em', margin: 0,
              }}>{s.num}</p>
              <p style={{
                fontSize: '9px', fontWeight: '700',
                letterSpacing: '0.25em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', margin: '4px 0 0',
              }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STATS SECTION — 6 animated counter cards
   ═══════════════════════════════════════════════════════════════ */
const StatsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const stats = [
    { value: '2000', suffix: '+', label: 'Happy Guests', color: GOLD },
    { value: '4.8', suffix: '★', label: 'Average Rating', color: GOLD },
    { value: '130', suffix: '+', label: 'Menu Items', color: MAGENTA },
    { value: '3', suffix: 'yr', label: 'In Jorhat', color: MAGENTA },
    { value: '8', suffix: '', label: 'Categories', color: '#E8742A' },
    { value: '7', suffix: '/wk', label: 'Days Open', color: '#E8742A' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 60, scale: 0.92 });
        gsap.to(card, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          delay: i * 0.08,
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: '#0A0800', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,45,120,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: GOLD }}>By The Numbers</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="ab-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el; }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: 'clamp(24px, 3vw, 36px)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent dot */}
              <div style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '6px', height: '6px', borderRadius: '50%', background: s.color,
              }} />
              <p style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '900', letterSpacing: '-0.03em',
                margin: '0 0 8px', lineHeight: 1,
              }}>
                <AnimatedCounter value={s.value} suffix={s.suffix} color={s.color} />
              </p>
              <p style={{
                fontSize: '10px', fontWeight: '700',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', margin: 0,
              }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VOICES SECTION — 3 testimonial cards
   ═══════════════════════════════════════════════════════════════ */
const VoicesSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const selected = testimonials.slice(0, 3);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 60 });
        gsap.to(card, {
          opacity: 1, y: 0, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          delay: i * 0.15,
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: '#07060A', padding: '140px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,145,46,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: GOLD }}>Guest Voices</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
          <h2 style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
            fontWeight: '900', lineHeight: 0.95,
            letterSpacing: '-0.04em', margin: 0,
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>What They</span><br />
            <span style={{ color: '#FFFFFF' }}>Say </span>
            <span style={{ color: 'transparent', WebkitTextStroke: `1.5px ${MAGENTA}`, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '400', fontSize: '0.8em' }}>About Us.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="ab-voices-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {selected.map((t, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el; }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: 'clamp(28px, 3vw, 40px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Giant quote */}
              <div style={{
                position: 'absolute', top: '16px', left: '20px',
                fontSize: '5rem', lineHeight: 1, fontFamily: 'Georgia, serif',
                color: 'rgba(182,145,46,0.12)', fontWeight: '900',
                pointerEvents: 'none', userSelect: 'none',
              }}>"</div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '18px', paddingTop: '8px' }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} style={{ color: GOLD, fontSize: '13px' }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p style={{
                fontSize: 'clamp(14px, 1.4vw, 16px)',
                lineHeight: 1.75, color: 'rgba(255,255,255,0.75)',
                margin: '0 0 24px', fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
              }}>"{t.quote}"</p>

              {/* Divider */}
              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${GOLD}, ${MAGENTA})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '900', color: '#fff', flexShrink: 0,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{
                    fontSize: '12px', fontWeight: '800', color: '#FFFFFF',
                    margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{t.name}</p>
                  <p style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                    margin: '2px 0 0', letterSpacing: '0.04em',
                  }}>Verified Guest</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CTA FINALE — Massive typography reservation CTA
   ═══════════════════════════════════════════════════════════════ */
const CTAFinale = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const els = sectionRef.current.querySelectorAll('.cta-reveal');
      gsap.set(els, { opacity: 0, y: 50 });
      gsap.to(els, {
        opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      minHeight: '85vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050407',
      overflow: 'hidden',
    }}>
      {/* Giant ghost text */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: 'clamp(7rem, 22vw, 22rem)',
        fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
        color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.03)',
        letterSpacing: '-0.06em', whiteSpace: 'nowrap',
        pointerEvents: 'none', userSelect: 'none',
      }}>JOIN US</div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '800px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(182,145,46,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(80px, 12vh, 140px) clamp(24px, 6vw, 60px)' }}>
        <div className="cta-reveal" style={{ opacity: 0, marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.55em', textTransform: 'uppercase', color: GOLD }}>The Table Awaits</span>
            <div style={{ width: '40px', height: '1.5px', background: GOLD }} />
          </div>
        </div>

        <h2 className="cta-reveal" style={{
          opacity: 0,
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: 'clamp(3.5rem, 12vw, 11rem)',
          fontWeight: '900', lineHeight: 0.85,
          letterSpacing: '-0.05em', margin: '0 0 40px',
        }}>
          <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.8)' }}>Join the</span><br />
          <span style={{ color: '#FFFFFF' }}>Family.</span>
        </h2>

        <p className="cta-reveal" style={{
          opacity: 0,
          fontSize: 'clamp(15px, 1.8vw, 20px)',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
          maxWidth: '480px', margin: '0 auto 48px',
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
        }}>
          Walk in anytime. Reserve for the terrace. Either way, you're Ohana now.
        </p>

        <div className="cta-reveal" style={{ opacity: 0, display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/reservations" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: GOLD, color: '#000', textDecoration: 'none',
            padding: '18px 40px', borderRadius: '100px',
            fontSize: '11px', fontWeight: '900', letterSpacing: '0.22em', textTransform: 'uppercase',
            boxShadow: '0 16px 50px rgba(182,145,46,0.4)',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 24px 70px rgba(182,145,46,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(182,145,46,0.4)'; }}
          >
            Reserve a Table <ArrowRight size={16} />
          </Link>
          <Link to="/menu" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
            padding: '18px 40px', borderRadius: '100px',
            fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            Browse Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ABOUT — Main component composing all sections
   ═══════════════════════════════════════════════════════════════ */
const About = () => {
  useEffect(() => {
    document.body.style.backgroundColor = '#0A0800';
    document.documentElement.style.backgroundColor = '#0A0800';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  return (
    <main style={{ overflow: 'hidden', position: 'relative', background: '#0A0800' }}>
      <HeroSection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #0A0800 0%, #07060A 100%)', pointerEvents: 'none' }} />

      <JourneySection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #07060A 0%, #0A0800 100%)', pointerEvents: 'none' }} />

      <PhilosophySection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #0A0800 0%, #050407 100%)', pointerEvents: 'none' }} />

      <HorizonGallery />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #050407 0%, #0A0800 100%)', pointerEvents: 'none' }} />

      <SpaceSection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #0A0800 0%, #07060A 100%)', pointerEvents: 'none' }} />

      <StatsSection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #07060A 0%, #050407 100%)', pointerEvents: 'none' }} />

      <VoicesSection />

      {/* Gradient bridge */}
      <div style={{ height: '120px', background: 'linear-gradient(to bottom, #050407 0%, #050407 100%)', pointerEvents: 'none' }} />

      <CTAFinale />

      <style>{`
        @keyframes abPulse {
          0%, 100% { opacity: 0.25; transform: scaleY(0.7); }
          50% { opacity: 1; transform: scaleY(1); }
        }

        /* ─── MOBILE OVERRIDES ─── */
        @media (max-width: 768px) {
          /* Hero */
          .ab-float-img { display: none !important; }
          .ab-scroll-hint { display: none !important; }
          .ab-hero-headline { font-size: clamp(2.4rem, 10vw, 3.8rem) !important; }
          .ab-glow-gold, .ab-glow-magenta { display: none !important; }

          /* Journey */
          .ab-timeline-svg { display: none !important; }

          /* Philosophy - disable 3D tilt, simpler cards */
          .ab-philo-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }

          /* Horizon - horizontal scroll on mobile */
          .ab-horizon-section {
            height: auto !important;
            min-height: 55vh !important;
            padding: 60px 0 !important;
          }
          .ab-horizon-strip {
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 0 20px !important;
            height: 50vh !important;
          }
          .ab-horizon-strip::-webkit-scrollbar { display: none; }
          .ab-horizon-card {
            scroll-snap-align: center !important;
            width: 78vw !important;
            height: 45vh !important;
          }

          /* Stats */
          .ab-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }

          /* Voices */
          .ab-voices-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }

        @media (max-width: 480px) {
          .ab-philo-grid { grid-template-columns: 1fr !important; }
          .ab-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
};

export default About;
