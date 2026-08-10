import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCES = [
  { id: '01', title: 'Terrace\nDining',      tag: 'Signature Experience', description: 'Open skies, warm lights, evenings worth staying for. Our rooftop terrace is where Jorhat unwinds.',   image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80', accent: '#B6912E' },
  { id: '02', title: 'Coffee\nMoments',      tag: 'All Day',              description: 'Slow pours, rich aromas, and conversations that stretch past noon.',                                   image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80', accent: '#C42D78' },
  { id: '03', title: 'House\nFavourites',    tag: 'Most Ordered',         description: 'Tandoori pizza to fiery wings — the dishes guests order again and again.',                            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80', accent: '#E8742A' },
  { id: '04', title: 'Gatherings\n& Groups', tag: 'Celebrations',         description: 'The perfect backdrop for long celebrations and even longer conversations.',                            image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=1600&q=80', accent: '#B6912E' },
  { id: '05', title: 'Night\nAtmosphere',    tag: 'After Sunset',         description: 'Warm lights, cooler air, city below. The terrace transforms after dark.',                            image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1600&q=80', accent: '#C42D78' },
];

function rgb(hex) {
  if (hex === '#B6912E') return '182,145,46';
  if (hex === '#C42D78') return '196,45,120';
  return '232,116,42';
}

export default function OhanaExperience() {
  const [active, setActive] = useState(0);
  const sectionRef     = useRef(null);
  const imgCurrentRef  = useRef(null);
  const imgRevealRef   = useRef(null);
  const titleRef       = useRef(null);
  const descRef        = useRef(null);
  const tagRef         = useRef(null);
  const progressBarRef = useRef(null);
  const isAnimating    = useRef(false);
  const activeRef      = useRef(0);

  /* mobile card refs */
  const mTitleRef = useRef(null);
  const mDescRef  = useRef(null);
  const mTagRef   = useRef(null);

  const exp = EXPERIENCES[active];

  /* ── scroll entrance ── */
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const els = sectionRef.current.querySelectorAll('.oe-reveal');
      gsap.set(els, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 78%',
        once: true,
        onEnter: () => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── switch ── */
  const switchTo = useCallback((idx) => {
    if (idx === activeRef.current || isAnimating.current) return;
    isAnimating.current = true;
    activeRef.current   = idx;
    const next = EXPERIENCES[idx];

    /* prepare wipe layer */
    if (imgRevealRef.current) {
      imgRevealRef.current.style.backgroundImage = `url(${next.image})`;
      gsap.set(imgRevealRef.current, { clipPath: 'inset(0 100% 0 0)' });
    }

    /* fade out desktop text */
    const textEls = [titleRef.current, descRef.current, tagRef.current].filter(Boolean);
    gsap.to(textEls, { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in', stagger: 0.03 });

    /* fade out mobile card text */
    const mEls = [mTitleRef.current, mDescRef.current, mTagRef.current].filter(Boolean);
    gsap.to(mEls, { opacity: 0, duration: 0.2 });

    /* wipe image */
    gsap.to(imgRevealRef.current, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.9,
      ease: 'power3.inOut',
      delay: 0.12,
      onComplete: () => {
        if (imgCurrentRef.current) imgCurrentRef.current.style.backgroundImage = `url(${next.image})`;
        gsap.set(imgRevealRef.current, { clipPath: 'inset(0 100% 0 0)' });
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, { scaleX: (idx + 1) / EXPERIENCES.length, duration: 0.5, ease: 'power2.out' });
        }
        setActive(idx);
        gsap.fromTo([...textEls, ...mEls],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04,
            onComplete: () => { isAnimating.current = false; } }
        );
      },
    });
  }, []);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: '#0C0902', minHeight: '100vh' }}>

      {/* gradient blend from testimonials */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(to bottom, #050407 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 20,
      }} />

      {/* mobile-only: extra dark spacer above the sticky image (shows transition zone) */}
      <div className="oe-mobile-spacer" style={{ display: 'none' }} />

      {/* ══ LEFT — full-height image panel (desktop absolute, mobile sticky) ══ */}
      <div className="oe-img-panel" style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '58%', overflow: 'hidden',
      }}>
        <div ref={imgCurrentRef} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${exp.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div ref={imgRevealRef} style={{
          position: 'absolute', inset: 0,
          backgroundSize: 'cover', backgroundPosition: 'center',
          clipPath: 'inset(0 100% 0 0)',
        }} />
        {/* top-edge fade — blends image into section bg above it (visible on mobile) */}
        <div className="oe-img-top-fade" style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '80px',
          background: 'linear-gradient(to bottom, #0C0902 0%, transparent 100%)',
          zIndex: 5, pointerEvents: 'none',
        }} />
        {/* scrims */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to right, rgba(12,9,2,0) 38%, #0C0902 100%), linear-gradient(to top, rgba(12,9,2,0.92) 0%, rgba(12,9,2,0.05) 52%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 30% 80%, rgba(${rgb(exp.accent)},0.12) 0%, transparent 70%)`,
          transition: 'background 0.8s ease',
        }} />
        {/* watermark */}
        <div className="oe-watermark" style={{
          position: 'absolute', bottom: 'clamp(80px,12vh,140px)', right: '20px',
          fontSize: 'clamp(7rem,16vw,14rem)', fontWeight: '900',
          fontFamily: "'Archivo Black','Arial Black',sans-serif",
          color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.08em', lineHeight: 1,
          userSelect: 'none', pointerEvents: 'none', zIndex: 3,
        }}>
          {exp.id}
        </div>
        {/* desktop image content */}
        <div className="oe-img-content" style={{
          position: 'absolute', bottom: 0, left: 0, zIndex: 4,
          padding: 'clamp(28px,5vw,60px)', maxWidth: '480px',
        }}>
          <div ref={tagRef} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: `rgba(${rgb(exp.accent)},0.22)`,
            border: `1px solid rgba(${rgb(exp.accent)},0.35)`,
            // No backdropFilter — solid bg is just as legible and GPU-free
            borderRadius: '100px', padding: '5px 14px', marginBottom: '18px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: exp.accent, display: 'block' }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase', color: exp.accent }}>
              {exp.tag}
            </span>
          </div>
          <h3 ref={titleRef} style={{
            fontFamily: "'Archivo Black','Arial Black',sans-serif",
            fontSize: 'clamp(2rem,4.5vw,4rem)', fontWeight: '900', color: '#fff',
            lineHeight: 0.92, letterSpacing: '-0.03em', margin: '0 0 16px', whiteSpace: 'pre-line',
          }}>
            {exp.title}
          </h3>
          <p ref={descRef} className="oe-img-desc" style={{
            fontSize: 'clamp(12px,1.3vw,15px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0,
          }}>
            {exp.description}
          </p>
        </div>
      </div>

      {/* ══ RIGHT — editorial nav panel ══ */}
      <div className="oe-nav-panel" style={{
        position: 'relative', zIndex: 5,
        marginLeft: '55%', minHeight: '100vh', background: '#0C0902',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(100px,12vh,160px) clamp(28px,5vw,68px) clamp(60px,8vh,100px)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>

        {/* headline */}
        <div className="oe-reveal oe-desktop-head" style={{ opacity: 0, marginBottom: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '28px', height: '1.5px', background: '#B6912E' }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#B6912E' }}>
              Ohana Experience
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Archivo Black','Arial Black',sans-serif",
            fontSize: 'clamp(1.8rem,3.5vw,3.2rem)', fontWeight: '900', lineHeight: 0.92,
            letterSpacing: '-0.04em', margin: '0 0 8px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.55)' }}>Every</span><br />
            <span style={{ color: '#fff' }}>Visit</span><br />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontWeight: '400', fontFamily: 'Georgia,serif', fontSize: '0.72em', letterSpacing: 0 }}>a story.</span>
          </h2>
        </div>

        {/* progress */}
        <div className="oe-reveal oe-progress" style={{ opacity: 0, marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span style={{ fontSize: '10px', color: exp.accent, fontWeight: '700', letterSpacing: '0.1em' }}>
              {String(active + 1).padStart(2,'0')}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: '700' }}>
              {String(EXPERIENCES.length).padStart(2,'0')}
            </span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
            <div ref={progressBarRef} style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
              background: `linear-gradient(90deg, ${exp.accent}, rgba(255,255,255,0.2))`,
              transformOrigin: 'left',
              transform: `scaleX(${(active+1)/EXPERIENCES.length})`,
            }} />
          </div>
        </div>

        {/* desktop nav list */}
        <div className="oe-reveal oe-desktop-nav" style={{ opacity: 0 }}>
          {EXPERIENCES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => switchTo(idx)}
              style={{
                display: 'flex', alignItems: 'center',
                width: '100%', background: 'none', border: 'none',
                padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.055)',
                cursor: 'pointer', gap: '16px', position: 'relative', textAlign: 'left',
              }}
            >
              <div style={{
                position: 'absolute', left: '-28px', top: '50%', transform: 'translateY(-50%)',
                width: idx === active ? '18px' : '0px', height: '2px', background: item.accent,
                transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)', borderRadius: '2px',
              }} />
              <span style={{
                fontSize: '9px', fontWeight: '700',
                color: idx === active ? item.accent : 'rgba(255,255,255,0.15)',
                width: '24px', flexShrink: 0, letterSpacing: '0.12em',
                transition: 'color 0.25s ease',
              }}>{item.id}</span>
              <span style={{
                fontSize: 'clamp(0.9rem,1.5vw,1.15rem)',
                fontWeight: idx === active ? '800' : '400',
                fontFamily: idx === active ? "'Archivo Black',sans-serif" : 'inherit',
                color: idx === active ? '#fff' : 'rgba(255,255,255,0.22)',
                transition: 'all 0.25s ease', letterSpacing: idx === active ? '-0.02em' : '0', flex: 1,
              }}>{item.title.replace('\n',' ')}</span>
              <div style={{
                width: idx === active ? '50px' : '0px', height: '34px', borderRadius: '6px',
                overflow: 'hidden', flexShrink: 0,
                transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: idx === active ? 1 : 0,
                boxShadow: idx === active ? `0 4px 16px rgba(${rgb(item.accent)},0.3)` : 'none',
              }} />
              <span style={{
                fontSize: '12px', color: item.accent,
                opacity: idx === active ? 1 : 0,
                transform: idx === active ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 0.25s ease', flexShrink: 0,
              }}>→</span>
            </button>
          ))}
        </div>

        {/* ── MOBILE NAV (hidden on desktop, shown via CSS on mobile) ── */}
        <div className="oe-mobile-nav" style={{ display: 'none' }}>

          {/* eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '24px', height: '1.5px', background: '#B6912E' }} />
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#B6912E' }}>
              Ohana Experience
            </span>
          </div>

          {/* horizontal chip tabs */}
          <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto',
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            marginBottom: '20px', paddingBottom: '2px',
          }}>
            {EXPERIENCES.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => switchTo(idx)}
                style={{
                  flexShrink: 0,
                  background: idx === active ? exp.accent : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${idx === active ? exp.accent : 'rgba(255,255,255,0.1)'}`,
                  color: idx === active ? '#000' : 'rgba(255,255,255,0.4)',
                  borderRadius: '100px', padding: '8px 16px',
                  fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                }}
              >
                {item.title.replace('\n',' ')}
              </button>
            ))}
          </div>

          {/* active experience card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(${rgb(exp.accent)},0.22)`,
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: exp.accent }} />
              <span ref={mTagRef} style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.25em', textTransform: 'uppercase', color: exp.accent }}>
                {exp.tag}
              </span>
            </div>
            <p ref={mTitleRef} style={{
              fontSize: '15px', fontWeight: '800', color: '#fff',
              margin: '0 0 8px', fontFamily: "'Archivo Black',sans-serif", letterSpacing: '-0.02em',
            }}>
              {exp.title.replace('\n',' ')}
            </p>
            <p ref={mDescRef} style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 18px',
            }}>
              {exp.description}
            </p>
            {/* prev / next */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                {String(active+1).padStart(2,'0')} / {String(EXPERIENCES.length).padStart(2,'0')}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => switchTo(Math.max(0, active - 1))}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%', width: '32px', height: '32px',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >←</button>
                <button
                  onClick={() => switchTo(Math.min(EXPERIENCES.length - 1, active + 1))}
                  style={{
                    background: exp.accent, border: 'none',
                    borderRadius: '50%', width: '32px', height: '32px',
                    color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >→</button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="oe-reveal" style={{ opacity: 0, marginTop: '40px' }}>
          <a
            href="/about"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              border: '1px solid rgba(182,145,46,0.4)', color: '#B6912E',
              textDecoration: 'none', padding: '11px 24px', borderRadius: '100px',
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.28em',
              textTransform: 'uppercase', transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B6912E'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B6912E'; }}
          >
            Discover Ohana
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: '1px solid currentColor', fontSize: '10px' }}>→</span>
          </a>
        </div>

      </div>

      <style>{`
        /* ─── MOBILE (≤ 768px) ─── */
        @media (max-width: 768px) {

          .oe-img-panel {
            position: sticky !important;
            top: 0 !important;
            left: 0 !important; right: 0 !important; bottom: auto !important;
            width: 100% !important;
            height: 56vw !important;
            min-height: 200px !important;
            max-height: 320px !important;
            margin-top: 24px !important;   /* reduced gap */
            z-index: 8 !important;
            overflow: hidden !important;
          }

          /* dark spacer that fills the gap above the sticky image */
          .oe-mobile-spacer {
            display: block !important;
            height: 24px !important;
            background: #0C0902 !important;
          }

          /* top-fade always visible on mobile */
          .oe-img-top-fade { display: block !important; }

          /* full-bleed: remove right-edge fade, keep bottom scrim only */
          .oe-img-panel > div:nth-child(4) {
            background: linear-gradient(to top, rgba(12,9,2,0.9) 0%, rgba(12,9,2,0.05) 55%, transparent 100%) !important;
          }

          /* image overlay text — only show tag + title, hide desc */
          .oe-img-content { padding: 14px 18px !important; }
          .oe-img-content h3 { font-size: 1.5rem !important; margin-bottom: 0 !important; }
          .oe-img-desc { display: none !important; }

          /* watermark hidden on mobile */
          .oe-watermark { display: none !important; }

          /* nav panel stacks below sticky image */
          .oe-nav-panel {
            margin-left: 0 !important;
            min-height: unset !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
            padding: 28px 20px 52px !important;
          }

          /* hide desktop-only elements */
          .oe-desktop-head { display: none !important; }
          .oe-desktop-nav  { display: none !important; }
          .oe-progress     { display: none !important; }

          /* show mobile nav */
          .oe-mobile-nav { display: block !important; }

          /* hide scrollbar on tab strip */
          .oe-mobile-nav > div:nth-child(2)::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </section>
  );
}
