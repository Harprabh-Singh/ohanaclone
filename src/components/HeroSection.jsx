import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroParticles from './HeroParticles';
import './HeroParticles.css';
import './hero-animations.css';

const HeroSection = () => {
  const sectionRef  = useRef(null);
  const bgRef       = useRef(null);
  const imgRef      = useRef(null);
  const contentRef  = useRef(null);
  const eyebrowRef  = useRef(null);
  const headlineRef = useRef(null);
  const subRef      = useRef(null);
  const btnsRef     = useRef(null);
  const badgesRef   = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section  = sectionRef.current;
    const bg       = bgRef.current;
    const img      = imgRef.current;
    const content  = contentRef.current;
    const eyebrow  = eyebrowRef.current;
    const headline = headlineRef.current;
    const sub      = subRef.current;
    const btns     = btnsRef.current;
    const badges   = badgesRef.current;

    if (!section || !bg || !content) return;

    // Set initial states
    gsap.set([eyebrow, headline, sub, btns, badges], { opacity: 0, y: 30 });
    gsap.set(img, { scale: 1.08 });

    // Load-in timeline
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(img,      { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
      .to(eyebrow,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3)
      .to(headline, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.5)
      .to(sub,      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.75)
      .to(btns,     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.95)
      .to(badges,   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.1);

    // Scroll parallax
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=500',
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(img,     { y: p * 80 });
        gsap.set(content, { opacity: 1 - p * 1.4, y: -p * 60 });
      },
    });

    // Subtle mouse parallax
    const onMove = (e) => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const { innerWidth: W, innerHeight: H } = window;
      const x = (e.clientX / W - 0.5) * 18;
      const y = (e.clientY / H - 0.5) * 10;
      gsap.to(img,     { x: x * 0.6, y: y * 0.6, duration: 1.2, ease: 'power2.out' });
      gsap.to(content, { x: x * 0.25, y: y * 0.25, duration: 1.2, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to([img, content], { x: 0, y: 0, duration: 1, ease: 'power3.out' });
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);

    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      tl.kill();
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-root">

      {/* ── Full-bleed image ── */}
      <div ref={bgRef} className="hero-bg">
        <img
          ref={imgRef}
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2400&q=85"
          alt="Ohana terrace ambience"
          className="hero-bg__img"
        />
        {/* layered overlays for depth */}
        <div className="hero-bg__vignette" />
        <div className="hero-bg__tint" />
        <div className="hero-bg__bottom-fade" />
      </div>

      {/* ── Particles ── */}
      <HeroParticles />

      {/* ── Content ── */}
      <div ref={contentRef} className="hero-content">

        <div className="hero-content__inner">

          {/* Eyebrow */}
          <p ref={eyebrowRef} className="hero-eyebrow">
            <span className="hero-eyebrow__line" />
            Ohana Cafe Kitchen &amp; Terraces
          </p>

          {/* Headline */}
          <h1 ref={headlineRef} className="hero-headline">
            Stay&nbsp;A<br />
            Little<br />
            <em>Longer.</em>
          </h1>

          {/* Subline */}
          <p ref={subRef} className="hero-sub">
            A candlelit terrace above Gar-Ali — where every evening<br className="hero-sub__br" /> feels unhurried and every plate tells a story.
          </p>

          {/* Buttons */}
          <div ref={btnsRef} className="hero-btns">
            <Link to="/reservations" className="hero-btn hero-btn--primary">
              Reserve a Table
              <span className="hero-btn__arrow">→</span>
            </Link>
            <Link to="/menu" className="hero-btn hero-btn--ghost">
              Explore Menu
            </Link>
          </div>

          {/* Badges */}
          <div ref={badgesRef} className="hero-badges">
            <div className="hero-badge">
              <span className="hero-badge__value">★ 4.8</span>
              <span className="hero-badge__label">200+ reviews</span>
            </div>
            <div className="hero-badge__divider" />
            <div className="hero-badge">
              <span className="hero-badge__value">11 AM</span>
              <span className="hero-badge__label">Opens daily</span>
            </div>
            <div className="hero-badge__divider" />
            <div className="hero-badge">
              <span className="hero-badge__value">Gar-Ali</span>
              <span className="hero-badge__label">Jorhat, Assam</span>
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">
          <span className="hero-scroll-hint__bar" />
          <span className="hero-scroll-hint__text">Scroll</span>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;