import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    id: '01',
    title: 'Terrace Dining',
    tag: 'Signature Experience',
    description: 'Open skies, warm lights, and evenings worth staying for. Our rooftop terrace is where Jorhat unwinds.',
    stats: ['Open-air seating', 'Sunset views', 'Groups welcome'],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: '02',
    title: 'Coffee Moments',
    tag: 'All Day',
    description: 'Slow pours, rich aromas, and conversations that stretch past noon.',
    stats: ['Single-origin', 'Cold brew & espresso', 'All-day menu'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: '03',
    title: 'House Favourites',
    tag: 'Most Ordered',
    description: 'The dishes guests order again and again. Tandoori pizza to fiery wings — these are the ones.',
    stats: ['120+ orders/month', 'Signature recipes', 'Chef curated'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: '04',
    title: 'Friends & Gatherings',
    tag: 'Celebrations',
    description: 'The perfect backdrop for long celebrations and even longer conversations.',
    stats: ['Group reservations', 'Private bookings', 'Custom menus'],
    image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: '05',
    title: 'Night Atmosphere',
    tag: 'After Sunset',
    description: 'The terrace transforms after dark. Warm lights, cooler air, city below.',
    stats: ['Open till 10 PM', 'Evening specials', 'Mood lighting'],
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: '06',
    title: 'Live Moments',
    tag: 'Every Visit',
    description: 'Every visit becomes part of the story. The food, the view, the people.',
    stats: ['Weekend highlights', 'Guest stories', 'Memorable evenings'],
    image: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1600&q=80',
  },
];

// Separate nav item component to keep hover state clean
const NavItem = ({ item, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const show = isActive || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '20px 0',
        paddingLeft: isActive ? '16px' : '0',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
        gap: '20px',
        position: 'relative',
        transition: 'padding-left 0.3s ease',
      }}
    >
      {/* Active left bar */}
      <div style={{
        position: 'absolute', left: 0, top: '50%',
        transform: 'translateY(-50%)',
        width: isActive ? '3px' : '0px',
        height: isActive ? '55%' : '0%',
        background: '#C42D78',
        borderRadius: '2px',
        transition: 'all 0.35s ease',
      }} />

      {/* Number */}
      <span style={{
        fontSize: '12px', fontWeight: '700',
        color: isActive ? '#C42D78' : 'rgba(255,255,255,0.2)',
        width: '36px', flexShrink: 0,
        transition: 'color 0.3s ease',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.06em',
      }}>
        {item.id}
      </span>

      {/* Title */}
      <span style={{
        fontSize: 'clamp(1rem, 1.8vw, 1.35rem)',
        fontWeight: '700',
        color: isActive ? '#FFFFFF' : show ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)',
        transition: 'color 0.3s ease',
        letterSpacing: '-0.01em',
        flex: 1,
      }}>
        {item.title}
      </span>

      {/* Arrow */}
      <span style={{
        fontSize: '15px', color: '#C42D78',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}>→</span>
    </div>
  );
};

const OhanaExperience = () => {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const statsRef = useRef(null);
  const tagRef = useRef(null);
  const bigNumRef = useRef(null);
  const headerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  // Scroll reveal
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([headerRef.current, leftColRef.current, rightColRef.current], { opacity: 0, y: 48 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
          gsap.to(leftColRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.15 });
          gsap.to(rightColRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.28 });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const changeExperience = useCallback((idx) => {
    if (idx === active || transitioning) return;
    setTransitioning(true);

    const contentEls = [tagRef.current, titleRef.current, descRef.current, statsRef.current].filter(Boolean);

    gsap.to(contentEls, { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in', stagger: 0.025 });
    gsap.to(imgRef.current, { opacity: 0, scale: 1.04, duration: 0.32, ease: 'power2.in' });
    gsap.to(bigNumRef.current, { opacity: 0, duration: 0.18 });

    setTimeout(() => {
      setActive(idx);
      setTransitioning(false);
      gsap.fromTo(imgRef.current, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' });
      gsap.fromTo(contentEls, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 });
      gsap.fromTo(bigNumRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    }, 280);
  }, [active, transitioning]);

  const exp = experiences[active];

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#0A2329',
        position: 'relative',
        overflow: 'hidden',
        padding: '0',
      }}
    >
      {/* Blurred ambient background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${exp.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(70px) brightness(0.15) saturate(0.5)',
        transform: 'scale(1.12)',
        transition: 'background-image 0.5s ease',
      }} />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(8,30,28,0.97) 0%, rgba(10,38,36,0.92) 100%)',
      }} />

      {/* Magenta glow */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-80px', zIndex: 1,
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,45,120,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      {/* Gold glow */}
      <div style={{
        position: 'absolute', bottom: '0', left: '40%', zIndex: 1,
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(182,145,46,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto', padding: '100px 64px' }}>

        {/* ── HEADER ── */}
        <div ref={headerRef} style={{ marginBottom: '64px', opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
            <div style={{ width: '36px', height: '1.5px', background: '#B6912E', opacity: 0.8 }} />
            <span style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.38em',
              textTransform: 'uppercase', color: '#B6912E',
            }}>Ohana Experience</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: '900', lineHeight: 1,
              color: '#FFFFFF',
              letterSpacing: '-0.03em', margin: 0,
              fontFamily: "'Archivo Black', sans-serif",
            }}>
              The Ohana<br />
              <span style={{
                color: 'rgba(255,255,255,0.28)',
                fontStyle: 'italic', fontWeight: '300',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}>Experience</span>
            </h2>
            <p style={{
              fontSize: '15px', color: 'rgba(255,255,255,0.4)',
              maxWidth: '280px', lineHeight: 1.75, margin: 0, textAlign: 'right',
            }}>
              Good food.<br />Great company.<br />Better evenings.
            </p>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div
          className="exp-main-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '52px', alignItems: 'stretch' }}
        >
          {/* LEFT — IMAGE */}
          <div ref={leftColRef} style={{ opacity: 0 }}>
            <div style={{
              position: 'relative',
              height: '660px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 60px 140px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
            }}>
              <img
                ref={imgRef}
                src={exp.image}
                alt={exp.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600'; }}
              />

              {/* Bottom gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(5,15,14,0.95) 0%, rgba(5,15,14,0.45) 48%, rgba(5,15,14,0.0) 100%)',
                pointerEvents: 'none',
              }} />

              {/* Ghost number */}
              <div ref={bigNumRef} style={{
                position: 'absolute', top: '16px', right: '22px',
                fontSize: '10rem', fontWeight: '900', lineHeight: 1,
                color: 'rgba(255,255,255,0.04)',
                fontFamily: "'Archivo Black', sans-serif",
                letterSpacing: '-0.06em',
                pointerEvents: 'none', userSelect: 'none',
              }}>
                {exp.id}
              </div>

              {/* Content */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 32px 36px' }}>
                {/* Tag */}
                <div ref={tagRef} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(196,45,120,0.18)',
                  border: '1px solid rgba(196,45,120,0.35)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '100px', padding: '5px 12px',
                  fontSize: '10px', fontWeight: '700',
                  letterSpacing: '0.14em', color: '#f472b6',
                  textTransform: 'uppercase', marginBottom: '14px',
                }}>
                  {exp.tag}
                </div>

                {/* Title */}
                <h3 ref={titleRef} style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                  fontWeight: '900', color: '#FFFFFF',
                  lineHeight: 1.05, margin: '0 0 10px 0',
                  letterSpacing: '-0.025em',
                  fontFamily: "'Archivo Black', sans-serif",
                }}>
                  {exp.title}
                </h3>

                {/* Description */}
                <p ref={descRef} style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.65, margin: '0 0 18px 0', maxWidth: '370px',
                }}>
                  {exp.description}
                </p>

                {/* Stats */}
                <div ref={statsRef} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {exp.stats.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500',
                    }}>
                      <span style={{ color: '#B6912E', fontSize: '8px' }}>✦</span> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — NAVIGATOR */}
          <div ref={rightColRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0 }}>
            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
              <span style={{ fontSize: '12px', color: '#C42D78', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
                {String(active + 1).padStart(2, '0')}
              </span>
              {/* Progress bar */}
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${((active + 1) / experiences.length) * 100}%`,
                  background: 'linear-gradient(90deg, #C42D78, rgba(196,45,120,0.3))',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
                {String(experiences.length).padStart(2, '0')}
              </span>
            </div>

            {/* Nav list */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {experiences.map((item, idx) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={idx === active}
                  onClick={() => changeExperience(idx)}
                />
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: '40px' }}>
              <a
                href="/about"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  fontSize: '11px', fontWeight: '700',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                Discover Ohana
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '30px', height: '30px', borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '13px', transition: 'border-color 0.25s ease',
                }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .exp-main-grid {
            grid-template-columns: 1fr !important;
          }
          .exp-main-grid > div:first-child > div {
            height: 480px !important;
          }
        }
        @media (max-width: 520px) {
          .exp-main-grid > div:first-child > div {
            height: 360px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default OhanaExperience;