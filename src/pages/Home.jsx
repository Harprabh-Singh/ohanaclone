import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/HeroSection';
import PalateShowcase from '../components/PalateShowcase';
import HouseFavourites from '../components/Housefavourites';
import OhanaExperience from '../components/OhanaExperience';
import { testimonials } from '../data/testimonials';

gsap.registerPlugin(ScrollTrigger);

// ─── STORY SECTION (redesigned) ──────────────────────────────────
const StorySection = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const imgRef     = useRef(null);
  const bodyRef    = useRef(null);
  const pillsRef   = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([headRef.current, imgRef.current, bodyRef.current, pillsRef.current], { opacity: 0, y: 48 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          tl.to(headRef.current,  { opacity: 1, y: 0, duration: 1.1 }, 0)
            .to(imgRef.current,   { opacity: 1, y: 0, duration: 1.0 }, 0.12)
            .to(bodyRef.current,  { opacity: 1, y: 0, duration: 0.9 }, 0.22)
            .to(pillsRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.34);
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const MILESTONES = [
    { year: '2022', label: 'Founded', desc: 'Opened above Gar-Ali, Jorhat' },
    { year: '2023', label: 'Loved', desc: '1,000+ guests. 4.8★ avg.' },
    { year: '2024', label: 'Expanded', desc: 'New menu, bigger terrace' },
    { year: 'Now',  label: 'Family', desc: '2K+ regulars & counting' },
  ];

  return (
    <section ref={sectionRef} className="story-section" style={{
      background: '#07060A',
      padding: '120px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient blend from HouseFavourites (#020D0A) into StorySection */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '100px',
        background: 'linear-gradient(to bottom, #020D0A 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', left: '-200px', top: '20%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(182,145,46,0.07) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: '-180px', bottom: '10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,45,120,0.07) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(24px, 6vw, 80px)', position: 'relative', zIndex: 1 }}>

        {/* Oversize header */}
        <div ref={headRef} style={{ marginBottom: '72px', opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '1.5px', background: '#B6912E' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#B6912E' }}>Our Story</span>
          </div>
          <h2 className="story-headline" style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(3rem, 9vw, 8rem)',
            fontWeight: '900', lineHeight: 0.92,
            letterSpacing: '-0.04em', margin: 0,
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.85)',
          }}>
            More Than<br />
            <span style={{
              WebkitTextStroke: '0px',
              color: '#FFFFFF',
            }}>A Meal.</span>
          </h2>
        </div>

        {/* Two-column grid */}
        <div className="story-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'start',
          marginBottom: '80px',
        }}>

          {/* LEFT — full-bleed image with overlaid quote */}
          <div ref={imgRef} style={{ position: 'relative', opacity: 0 }}>
            <div className="story-img-wrap" style={{
              borderRadius: '20px', overflow: 'hidden',
              aspectRatio: '3/4',
              boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
              position: 'relative',
            }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
                alt="Ohana dining"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.75) saturate(1.1)' }}
              />
              {/* Gradient scrim */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,6,10,0.95) 0%, rgba(7,6,10,0.3) 50%, transparent 100%)' }} />
              {/* Overlaid italic quote */}
              <div style={{
                position: 'absolute', bottom: '28px', left: '28px', right: '28px',
              }}>
                <p style={{
                  fontFamily: 'Georgia, serif', fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  color: 'rgba(255,255,255,0.9)', lineHeight: 1.55, margin: '0 0 12px',
                }}>
                  "Ohana means family — and every plate we serve carries that warmth."
                </p>
                <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B6912E', fontWeight: '700' }}>
                  — The Ohana Kitchen
                </span>
              </div>
            </div>

            {/* Accent stat badge */}
            <div className="story-stat-badge" style={{
              position: 'absolute', top: '24px', right: '-16px',
              background: 'rgba(182,145,46,0.12)', border: '1px solid rgba(182,145,46,0.35)',
              backdropFilter: 'blur(12px)', borderRadius: '14px',
              padding: '14px 20px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '1.8rem', fontWeight: '900', color: '#B6912E', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>4.8<span style={{ fontSize: '1rem' }}>★</span></p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '5px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rating</p>
            </div>
          </div>

          {/* RIGHT — narrative + stats */}
          <div ref={bodyRef} style={{ opacity: 0 }}>
            <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, margin: '0 0 20px' }}>
              We opened Ohana above Gar-Ali with one belief: good food should feel like coming home. The terrace, the golden-hour glow, the menu — all of it built for long evenings and even longer conversations.
            </p>
            <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, margin: '0 0 40px' }}>
              From tropical breakfasts to late-night dinner plates, our kitchen blends global comfort flavours with local ingredients — served in a space that feels intimate and elevated.
            </p>

            {/* Stats row */}
            <div className="story-stats-row" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: '20px', marginBottom: '44px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[
                { num: '2K+', label: 'Guests' },
                { num: '4.8★', label: 'Rating' },
                { num: '3yr', label: 'In Jorhat' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em', fontFamily: "'Archivo Black', sans-serif" }}>{s.num}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '5px 0 0', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'transparent',
                border: '1px solid rgba(182,145,46,0.55)',
                color: '#B6912E', textDecoration: 'none',
                padding: '14px 30px', borderRadius: '100px',
                fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#B6912E'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B6912E'; }}
            >
              Read Our Story <span style={{ fontSize: '16px' }}>→</span>
            </Link>
          </div>
        </div>

        {/* Timeline pills */}
        <div ref={pillsRef} className="story-pills" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', opacity: 0,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '52px',
        }}>
          {MILESTONES.map((m, i) => (
            <div key={i} className="story-pill" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '24px 22px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Accent line top */}
              <div style={{
                position: 'absolute', top: 0, left: '22px',
                width: '36px', height: '2px',
                background: i % 2 === 0 ? '#B6912E' : '#C42D78',
                borderRadius: '2px',
              }} />
              <p style={{ fontSize: '1.6rem', fontWeight: '900', color: i % 2 === 0 ? '#B6912E' : '#C42D78', margin: '8px 0 4px', letterSpacing: '-0.03em', fontFamily: "'Archivo Black', sans-serif" }}>{m.year}</p>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{m.label}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 700px) {
          .story-section { padding: 80px 0 60px !important; }
          .story-img-wrap { aspect-ratio: 4/3 !important; }
          .story-stat-badge { display: none !important; }
          .story-headline { font-size: clamp(2.2rem, 11vw, 3.5rem) !important; }
          .story-grid { margin-bottom: 40px !important; }
          .story-stats-row { margin-bottom: 28px !important; }
          .story-pills { grid-template-columns: 1fr 1fr !important; gap: 10px !important; padding-top: 24px !important; border-top: none !important; }
          .story-pill { padding: 16px 14px !important; }
          .story-body-text { margin-bottom: 24px !important; }
        }
      `}</style>
    </section>
  );
};


// ─── TESTIMONIALS SECTION (redesigned — dual infinite marquee) ────
const REVIEWS = [
  { quote: "Came for lunch, stayed for the mojito. Dragon wings are not for the faint-hearted.", author: "Priya M.", visit: "Regular since 2023", rating: 5 },
  { quote: "The terrace at golden hour is something else. Best date spot in Jorhat, no contest.", author: "Rahul D.", visit: "Visited twice this month", rating: 5 },
  { quote: "Tandoori pizza sounds weird until you try it. Now I can't stop thinking about it.", author: "Sneha K.", visit: "First visit → now a regular", rating: 5 },
  { quote: "Ohana feels like someone's home — warm, unhurried, and the food just keeps coming.", author: "Arjun B.", visit: "Group booking", rating: 5 },
  { quote: "The brownie with ice cream is criminal. I've ordered it four times in a row.", author: "Meera T.", visit: "Weekend regular", rating: 5 },
  { quote: "Every single dish has a story. The kind of place you want to bring everyone you love.", author: "Kavya R.", visit: "Birthday dinner", rating: 5 },
  { quote: "Staff remembered my name on my second visit. That's Ohana — family, literally.", author: "Dev S.", visit: "Monthly regular", rating: 5 },
  { quote: "The shake alone is worth the trip. Everything else is just bonus.", author: "Nisha P.", visit: "Takeaway regular", rating: 5 },
];

function ReviewCard({ review, onMouseMove, onMouseLeave }) {
  const cardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.04)`;
    cardRef.current.style.boxShadow = `${-x * 20}px ${-y * 20}px 60px rgba(0,0,0,0.5), 0 0 40px rgba(182,145,46,0.08)`;
  };
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    cardRef.current.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        flexShrink: 0,
        width: 'clamp(280px, 36vw, 420px)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '28px 28px 24px',
        position: 'relative',
        cursor: 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        willChange: 'transform',
      }}
    >
      {/* Giant quote mark */}
      <div style={{
        position: 'absolute', top: '16px', left: '20px',
        fontSize: '5rem', lineHeight: 1, fontFamily: 'Georgia, serif',
        color: 'rgba(182,145,46,0.15)', fontWeight: '900',
        pointerEvents: 'none', userSelect: 'none',
      }}>"</div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '18px', paddingTop: '8px' }}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <span key={i} style={{ color: '#B6912E', fontSize: '13px' }}>★</span>
        ))}
      </div>

      {/* Quote */}
      <p style={{
        fontSize: '14px', lineHeight: 1.75,
        color: 'rgba(255,255,255,0.8)',
        margin: '0 0 20px',
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
      }}>"{review.quote}"</p>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: `linear-gradient(135deg, #B6912E, #C42D78)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '900', color: '#fff', flexShrink: 0,
        }}>
          {review.author[0]}
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{review.author}</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', letterSpacing: '0.04em' }}>{review.visit}</p>
        </div>
      </div>
    </div>
  );
}

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);

  // Double the array for seamless loop
  const row1 = [...REVIEWS, ...REVIEWS];
  const row2 = [...REVIEWS.slice(4), ...REVIEWS.slice(0, 4), ...REVIEWS.slice(4), ...REVIEWS.slice(0, 4)];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(headRef.current, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.to(headRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      background: '#050407',
      padding: '120px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient blend from StorySection */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '100px',
        background: 'linear-gradient(to bottom, #07060A 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)',
        width: '800px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(196,45,120,0.06) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div ref={headRef} style={{ textAlign: 'center', padding: '0 clamp(24px,6vw,80px)', marginBottom: '72px', opacity: 0, position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.6)' }} />
          <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#B6912E' }}>Guest Reviews</span>
          <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.6)' }} />
        </div>

        <h2 style={{
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: 'clamp(2.8rem, 8vw, 7rem)',
          fontWeight: '900', lineHeight: 0.92,
          letterSpacing: '-0.04em', margin: '0 0 24px',
        }}>
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>Regulars</span>{' '}
          <span style={{ color: '#FFFFFF' }}>Say</span><br />
          <span style={{ color: '#FFFFFF' }}>It Best.</span>
        </h2>

        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#B6912E', fontSize: '18px' }}>★</span>)}
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
          4.8 out of 5 · 200+ verified visits
        </p>
      </div>

      {/* MARQUEE ROWS */}
      <div style={{ position: 'relative', zIndex: 3 }}>

        {/* Edge fade masks */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(to right, #050407 0%, transparent 8%, transparent 92%, #050407 100%)',
        }} />

        {/* Row 1 — scrolls left */}
        <div style={{ overflow: 'hidden', marginBottom: '20px' }}>
          <div className="tr-row tr-left" style={{
            display: 'flex', gap: '20px', width: 'max-content',
            animation: 'tr-scroll-left 40s linear infinite',
          }}>
            {row1.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div style={{ overflow: 'hidden' }}>
          <div className="tr-row tr-right" style={{
            display: 'flex', gap: '20px', width: 'max-content',
            animation: 'tr-scroll-right 48s linear infinite',
          }}>
            {row2.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
        </div>
      </div>



      <style>{`
        @keyframes tr-scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tr-scroll-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .tr-row:hover { animation-play-state: paused !important; }

        @media (max-width: 700px) {
          .tr-left  { animation-duration: 28s !important; }
          .tr-right { animation-duration: 34s !important; }
        }
      `}</style>
    </section>
  );
};

// ─── CONTACT FINALE SECTION ──────────────────────────────────────
const ContactSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const els = sectionRef.current.querySelectorAll('.cs-reveal');
      gsap.set(els, { opacity: 0, y: 50 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const INFO = [
    {
      icon: '📍',
      label: 'Find Us',
      value: 'Above KFC, Gar-Ali',
      sub: 'Jorhat, Assam',
      href: 'https://maps.google.com',
      cta: 'Open in Maps →',
      accent: '#B6912E',
    },
    {
      icon: '🕐',
      label: 'Hours',
      value: '11 AM – 10 PM',
      sub: 'Monday to Sunday',
      href: null,
      cta: 'Always open for you',
      accent: '#C42D78',
    },
    {
      icon: '📲',
      label: 'Call or WhatsApp',
      value: 'Tap to Connect',
      sub: 'Fast replies guaranteed',
      href: 'tel:+91',
      cta: 'Message Us →',
      accent: '#B6912E',
    },
  ];

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      background: '#07050A',
      overflow: 'hidden',
      padding: '0 0 0 0',
    }}>

      {/* Gradient blend from OhanaExperience (#0C0902) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(to bottom, #0C0902 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 5,
      }} />

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(182,145,46,0.07) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-200px',
        width: '700px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(196,45,120,0.06) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── CINEMATIC CTA HERO ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'clamp(120px,16vh,180px) clamp(24px,8vw,100px) clamp(80px,10vh,120px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="cs-reveal" style={{ opacity: 0, marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '1.5px', background: '#B6912E' }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.55em', textTransform: 'uppercase', color: '#B6912E' }}>
              Come Visit
            </span>
            <div style={{ width: '40px', height: '1.5px', background: '#B6912E' }} />
          </div>
        </div>

        <h2 className="cs-reveal" style={{
          opacity: 0,
          fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
          fontSize: 'clamp(3rem, 11vw, 10rem)',
          fontWeight: '900', lineHeight: 0.88,
          letterSpacing: '-0.04em', margin: '0 0 32px',
        }}>
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.65)' }}>Let's</span>{' '}
          <span style={{ color: '#FFFFFF' }}>Meet</span><br />
          <span style={{ color: '#FFFFFF' }}>Over</span>{' '}
          <span style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.65)',
            fontStyle: 'italic', fontWeight: '400',
            fontFamily: 'Georgia, serif',
            fontSize: '0.75em', letterSpacing: '-0.01em',
          }}>good food.</span>
        </h2>

        <p className="cs-reveal" style={{
          opacity: 0,
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          color: 'rgba(255,255,255,0.38)',
          lineHeight: 1.75, margin: '0 auto 52px',
          maxWidth: '480px',
        }}>
          We're open every day. Swing by the terrace above Gar-Ali and let the food do the talking.
        </p>

        <div className="cs-reveal" style={{ opacity: 0, display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/reservations"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#B6912E', color: '#000', textDecoration: 'none',
              padding: '16px 36px', borderRadius: '100px',
              fontSize: '11px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 40px rgba(182,145,46,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(182,145,46,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(182,145,46,0.35)'; }}
          >
            Reserve a Table
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.15)', fontSize: '12px' }}>→</span>
          </Link>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              padding: '16px 36px', borderRadius: '100px',
              fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            Get Full Details
          </Link>
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div className="cs-info-grid" style={{
        position: 'relative', zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        {INFO.map((info, i) => (
          <div
            key={i}
            className="cs-reveal cs-info-card"
            style={{
              opacity: 0,
              padding: 'clamp(36px,5vh,56px) clamp(24px,5vw,60px)',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              cursor: info.href ? 'pointer' : 'default',
              transition: 'background 0.3s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onClick={() => info.href && window.open(info.href, '_blank')}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Accent top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 'clamp(24px,5vw,60px)',
              width: '32px', height: '2px',
              background: info.accent, borderRadius: '2px',
            }} />

            <p style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: info.accent,
              margin: '0 0 16px',
            }}>{info.label}</p>

            <p style={{
              fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
              fontSize: 'clamp(1.2rem, 2.5vw, 1.9rem)',
              fontWeight: '900', color: '#FFFFFF',
              letterSpacing: '-0.02em', margin: '0 0 4px', lineHeight: 1.1,
            }}>{info.value}</p>

            <p style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.35)',
              margin: '0 0 24px', lineHeight: 1.5,
            }}>{info.sub}</p>

            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: info.href ? info.accent : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.1em',
            }}>{info.cta}</span>
          </div>
        ))}
      </div>

      {/* ── BOTTOM MARK ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(24px,4vh,40px) clamp(24px,8vw,100px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', margin: 0, letterSpacing: '0.1em' }}>
          © 2024 Ohana Kitchen & Café · Jorhat, Assam
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Menu', 'Gallery', 'About', 'Contact'].map(l => (
            <Link
              key={l}
              to={`/${l.toLowerCase()}`}
              style={{
                fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
                textDecoration: 'none', transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .cs-info-card {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          }
          .cs-info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

// ─── SECTION BRIDGE — dark-to-light transition strip ─────────────
// Bridge removed — StorySection is now dark, no light transition needed

// ─── HOME ────────────────────────────────────────────────────────
const Home = () => {
  return (
    <main className="relative overflow-hidden">
      {/* 1. Hero — above-the-fold statement */}
      <HeroSection />

      {/* Thin teal rule to close the hero */}
      <div style={{ width: '100%', height: '1px', background: '#0A2E2A', display: 'block' }} />

      {/* 2. Palate Showcase — quick category browse */}
      <PalateShowcase />

      {/* 3. House Favourites — the cinematic dish spotlight (dark section) */}
      <HouseFavourites />

      {/* 4. Smooth gradient bridge from dark → cream */}
      {/* 5. Our Story — brand narrative */}
      <StorySection />

      {/* 6. Testimonials — social proof on near-black */}
      <TestimonialsSection />

      {/* 7. Ohana Experience — atmosphere / vibe section */}
      <OhanaExperience />

      {/* 8. Contact + Info finale */}
      <ContactSection />
    </main>
  );
};

export default Home;