import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionReveal from '../components/SectionReveal';
import HeroSection from '../components/HeroSection';
import SignatureCarousel from '../components/SignatureCarousel';
import PalateShowcase from '../components/PalateShowcase';
import FeaturedDish from '../components/FeaturedDish';
import OhanaExperience from '../components/OhanaExperience';
import { testimonials } from '../data/testimonials';

gsap.registerPlugin(ScrollTrigger);

const signatureDishes = [
  { name: 'Dragon Fiery Chicken Wings', description: "The kind of heat you'll crave again tomorrow", price: 280, badge: '🌶 Spicy', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800' },
  { name: 'Tandoori Chicken Sausage Pizza', description: 'Tandoor meets Naples, Ohana style', price: 320, badge: '★ Ohana Special', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' },
  { name: 'Ohana Chunky Shake', description: 'Thick, cold, devastating', price: 180, image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800' },
  { name: 'Grilled Chicken Club Sandwich', description: 'Triple-decker done properly', price: 220, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800' },
  { name: 'Veg Momos (8 pcs)', description: 'Steamed or fried. Both right answers.', price: 140, badge: '🌶 Spicy', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
  { name: 'Death By Chocolate Brownie', description: 'With vanilla ice cream. You know what to do.', price: 160, image: 'https://images.unsplash.com/photo-1527515637460-70b57f533338?w=800' },
];

// ─── STORY SECTION ───────────────────────────────────────────────
const StorySection = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([imgRef.current, contentRef.current], { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(imgRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
          gsap.to(contentRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.18 });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      background: '#FAF7F1',
      padding: '120px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background decoration */}
      <div style={{
        position: 'absolute', right: '-100px', top: '50%', transform: 'translateY(-50%)',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,45,120,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 64px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }} className="story-grid">

          {/* LEFT — Image stack */}
          <div ref={imgRef} style={{ position: 'relative', opacity: 0 }}>
            {/* Main image */}
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              aspectRatio: '4/5',
              boxShadow: '0 40px 100px rgba(10,46,42,0.16), 0 8px 24px rgba(10,46,42,0.08)',
              position: 'relative',
            }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
                alt="Ohana dining"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Subtle warm overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,46,42,0.35) 0%, transparent 50%)',
              }} />
            </div>

            {/* Floating stat card */}
            <div style={{
              position: 'absolute',
              bottom: '-24px', right: '-28px',
              background: '#0A2E2A',
              borderRadius: '18px',
              padding: '22px 28px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
              border: '1px solid rgba(255,255,255,0.06)',
              minWidth: '170px',
            }}>
              <p style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>
                4.8<span style={{ fontSize: '1.2rem', color: '#B6912E', marginLeft: '4px' }}>★</span>
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '6px 0 0 0', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>
                200+ Happy Guests
              </p>
            </div>

            {/* Small accent image */}
            <div style={{
              position: 'absolute',
              top: '-20px', left: '-24px',
              width: '130px', height: '130px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              border: '3px solid #FAF7F1',
            }}>
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80"
                alt="Coffee"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* RIGHT — Content */}
          <div ref={contentRef} style={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '1.5px', background: '#C42D78' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#C42D78' }}>
                Our Story
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
              fontWeight: '900',
              color: '#0A2E2A',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              margin: '0 0 28px 0',
              fontFamily: "'Archivo Black', sans-serif",
            }}>
              More Than A Meal.<br />
              <span style={{ color: '#C42D78' }}>It's A Feeling.</span>
            </h2>

            <p style={{ fontSize: '16px', color: '#5A5A5A', lineHeight: 1.85, margin: '0 0 18px 0' }}>
              Ohana means family, and every plate we send out is served with the same warmth. The terrace above Gar-Ali is designed for long evenings, conversation, and the golden-hour glow.
            </p>
            <p style={{ fontSize: '16px', color: '#5A5A5A', lineHeight: 1.85, margin: '0 0 36px 0' }}>
              From tropical breakfasts to late-night dinner plates, our kitchen blends global comfort flavours with local ingredients, all in a space that feels intimate and elevated.
            </p>

            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px', marginBottom: '40px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(10,46,42,0.1)',
            }}>
              {[
                { num: '2K+', label: 'Guests Served' },
                { num: '4.8★', label: 'Avg. Rating' },
                { num: '3yr', label: 'In Jorhat' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0A2E2A', margin: 0, letterSpacing: '-0.03em' }}>{s.num}</p>
                  <p style={{ fontSize: '12px', color: '#9A9A9A', margin: '4px 0 0 0', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#0A2E2A',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '14px 28px',
                borderRadius: '100px',
                fontSize: '13px', fontWeight: '700',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 28px rgba(10,46,42,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C42D78'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(196,45,120,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0A2E2A'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(10,46,42,0.2)'; }}
            >
              Read Our Story <span style={{ fontSize: '16px' }}>→</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
};

// ─── TESTIMONIALS SECTION ─────────────────────────────────────────
const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const quoteRef = useRef(null);
  const authorRef = useRef(null);
  const sectionRef = useRef(null);

  const items = testimonials?.length ? testimonials : [
    { quote: "Came for lunch, stayed for the mojito. The dragon wings are not for the faint-hearted.", author: "Priya M.", visit: "Regular since 2023" },
    { quote: "The terrace at golden hour is something else. Best date night spot in Jorhat, no contest.", author: "Rahul D.", visit: "Visited twice this month" },
    { quote: "Tandoori pizza sounds weird until you try it. Now I can't stop thinking about it.", author: "Sneha K.", visit: "First visit → now a regular" },
    { quote: "Ohana feels like someone's home — warm, unhurried, and the food just keeps coming.", author: "Arjun B.", visit: "Group booking" },
    { quote: "The brownie with ice cream is criminal. I've ordered it four times in a row.", author: "Meera T.", visit: "Weekend regular" },
  ];

  const changeSlide = (idx) => {
    if (idx === active) return;
    gsap.to([quoteRef.current, authorRef.current], {
      opacity: 0, y: -12, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        setActive(idx);
        gsap.fromTo([quoteRef.current, authorRef.current],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.08 }
        );
      },
    });
  };

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % items.length;
        if (quoteRef.current && authorRef.current) {
          gsap.to([quoteRef.current, authorRef.current], {
            opacity: 0, y: -10, duration: 0.2, ease: 'power2.in',
            onComplete: () => {
              gsap.fromTo([quoteRef.current, authorRef.current],
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.07 }
              );
            },
          });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length]);

  // Scroll reveal
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(sectionRef.current.querySelectorAll('.t-reveal'), { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(sectionRef.current.querySelectorAll('.t-reveal'), {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const item = items[active];

  return (
    <section ref={sectionRef} style={{
      background: '#0A2329',
      padding: '120px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(196,45,120,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 64px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="t-reveal" style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.6)' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.36em', textTransform: 'uppercase', color: '#B6912E' }}>
              Guest Reviews
            </span>
            <div style={{ width: '36px', height: '1.5px', background: 'rgba(182,145,46,0.6)' }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: '900', color: '#FFFFFF',
            lineHeight: 1, margin: '0 0 16px 0',
            letterSpacing: '-0.03em',
            fontFamily: "'Archivo Black', sans-serif",
          }}>
            Regulars Say It Best.
          </h2>
          {/* Filled stars */}
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '16px' }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ color: '#B6912E', fontSize: '20px' }}>★</span>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '600' }}>
            4.8 out of 5 · 200+ visits
          </p>
        </div>

        {/* Quote block */}
        <div className="t-reveal" style={{ position: 'relative', marginBottom: '56px' }}>
          {/* Large opening quote mark */}
          <div style={{
            position: 'absolute', top: '-40px', left: '-20px',
            fontSize: '10rem', fontWeight: '900',
            color: 'rgba(196,45,120,0.1)',
            lineHeight: 1, fontFamily: 'Georgia, serif',
            pointerEvents: 'none', userSelect: 'none',
          }}>"</div>

          <blockquote
            ref={quoteRef}
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.6,
              textAlign: 'center',
              margin: '0',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: '400',
              padding: '0 40px',
              position: 'relative', zIndex: 1,
            }}
          >
            "{item.quote}"
          </blockquote>
        </div>

        {/* Author */}
        <div ref={authorRef} style={{ textAlign: 'center', marginBottom: '56px' }}>
          {/* Divider line */}
          <div style={{
            width: '40px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(196,45,120,0.6), transparent)',
            margin: '0 auto 20px',
          }} />
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {item.author}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.08em' }}>
            {item.visit || 'Verified Guest'}
          </p>
        </div>

        {/* Dots */}
        <div className="t-reveal" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i)}
              style={{
                width: i === active ? '28px' : '8px',
                height: '8px',
                borderRadius: '100px',
                background: i === active ? '#C42D78' : 'rgba(255,255,255,0.18)',
                border: 'none', padding: 0, cursor: 'pointer',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>

        {/* Bottom stat cards */}
        <div className="t-reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px', marginTop: '72px',
        }}>
          {[
            { num: '200+', label: 'Happy Guests', sub: 'and growing every week' },
            { num: '4.8★', label: 'Average Rating', sub: 'across all platforms' },
            { num: '3yrs', label: 'Serving Jorhat', sub: 'above Gar-Ali since 2022' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '28px 24px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.03em' }}>{s.num}</p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0' }}>{s.label}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, letterSpacing: '0.04em' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HOME ────────────────────────────────────────────────────────
const Home = () => {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />
      <PalateShowcase />

      {/* House Favourites */}
      <SectionReveal>
        <section className="bg-teal-mid py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-16 flex flex-col gap-4">
              <p className="uppercase tracking-[0.22em] text-sm text-gold">House Favourites</p>
              <h2 className="section-heading text-4xl font-black leading-tight md:text-5xl">
                The Dishes People Ask For By Name.
              </h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
                From signature pizzas to legendary wings, these are the dishes our guests return for again and again.
              </p>
            </div>
            <FeaturedDish dish={signatureDishes[1]} />
            <div className="mt-24">
              <SignatureCarousel items={signatureDishes} />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Our Story */}
      <StorySection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Ohana Experience */}
      <OhanaExperience />

      {/* Contact */}
      <SectionReveal>
        <section className="bg-teal-mid py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <MapPin className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Address</p>
                <p className="mt-3 text-sm text-white/80">Above KFC, Gar-Ali, Jorhat, Assam</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <Clock className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Hours</p>
                <p className="mt-3 text-sm text-white/80">Mon–Sun · 11:00 AM – 10:00 PM</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <Phone className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Quick Contact</p>
                <p className="mt-3 text-sm text-white/80">Tap to call or message us on WhatsApp</p>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-magenta hover:text-magenta">
                Get Full Details →
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
};

export default Home;