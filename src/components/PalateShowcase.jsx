import { useEffect, useRef, useState, useCallback } from 'react';
import './PalateShowcase.css';

const categories = [
  {
    key: 'breakfast',
    title: 'Breakfast',
    sub: 'Morning Rituals',
    copy: 'Golden mornings built around coffee steam, citrus light, and the first flavorful bite.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1400&auto=format&fit=crop&q=85',
    color: '#e8a838',
    colorDark: '#7a4e0a',
  },
  {
    key: 'appetizers',
    title: 'Appetizers',
    sub: 'First Impressions',
    copy: 'Shared plates that arrive with artful detail and the perfect opening note.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1400&auto=format&fit=crop&q=85',
    color: '#4aad6e',
    colorDark: '#1a5c34',
  },
  {
    key: 'burgers',
    title: 'Burgers',
    sub: 'Elevated Classics',
    copy: 'Layered texture, smoke, and chemistry in every bite — a modern classic perfected.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=85',
    color: '#e8622a',
    colorDark: '#7a2a08',
  },
  {
    key: 'pizza',
    title: 'Pizza',
    sub: 'Wood-Fired Soul',
    copy: 'Thin crust, molten cheese, and a basil-flecked edge made for slow evenings.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1400&auto=format&fit=crop&q=85',
    color: '#e84a2a',
    colorDark: '#7a1a08',
  },
  {
    key: 'pasta',
    title: 'Pasta',
    sub: 'Comfort Elevated',
    copy: 'Glossy ribbons, rich sauce, and a touch of unexpected spice. Comfort from the fork up.',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1400&auto=format&fit=crop&q=85',
    color: '#e8c42a',
    colorDark: '#7a5c08',
  },
  {
    key: 'beverages',
    title: 'Beverages',
    sub: 'Liquid Craft',
    copy: 'Bright pours designed to refresh, delight, and carry the same premium finish.',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1400&auto=format&fit=crop&q=85',
    color: '#2a8ce8',
    colorDark: '#0a3a7a',
  },
  {
    key: 'desserts',
    title: 'Desserts',
    sub: 'Sweet Finale',
    copy: 'Soft finishes, berry brightness, and chocolate whispers that close the story beautifully.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1400&auto=format&fit=crop&q=85',
    color: '#c42d78',
    colorDark: '#6a0a38',
  },
];

const N = categories.length;
const CARD_ANGLE = 360 / N;

export default function PalateShowcase() {
  const sectionRef    = useRef(null);
  const carouselRef   = useRef(null);
  const rafRef        = useRef(null);
  const currentAngle  = useRef(0);   // current rendered angle
  const targetAngle   = useRef(0);   // angle we're easing toward
  const isDragging    = useRef(false);
  const dragStart     = useRef(0);
  const dragAngleStart= useRef(0);
  const lastVelocity  = useRef(0);
  const lastDragX     = useRef(0);
  const autoSpin      = useRef(true);
  const autoTimer     = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Which card index is front-facing based on angle
  const angleToIdx = (angle) => {
    const norm = (((-angle % 360) + 360) % 360);
    return Math.round(norm / CARD_ANGLE) % N;
  };

  // Intersection observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isVisible) return;

    const tick = () => {
      // Auto-spin slowly
      if (autoSpin.current && !isDragging.current) {
        targetAngle.current -= 0.018;
      }

      // Apply momentum after drag release
      if (!isDragging.current && Math.abs(lastVelocity.current) > 0.01) {
        targetAngle.current += lastVelocity.current;
        lastVelocity.current *= 0.94;
      }

      // Ease current toward target
      currentAngle.current += (targetAngle.current - currentAngle.current) * 0.07;

      // Apply to carousel
      const el = carouselRef.current;
      if (el) {
        el.style.transform = `rotateY(${currentAngle.current}deg)`;
      }

      // Update active card
      const idx = angleToIdx(currentAngle.current);
      setActiveIdx(idx);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible]);

  const resumeAuto = useCallback(() => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => { autoSpin.current = true; }, 3000);
  }, []);

  // Drag / touch
  const onPointerDown = useCallback((e) => {
    isDragging.current   = true;
    autoSpin.current     = false;
    dragStart.current    = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragAngleStart.current = targetAngle.current;
    lastDragX.current    = dragStart.current;
    lastVelocity.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const delta = x - dragStart.current;
    targetAngle.current = dragAngleStart.current + delta * 0.28;
    lastVelocity.current = (x - lastDragX.current) * 0.28;
    lastDragX.current = x;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    resumeAuto();
  }, [resumeAuto]);

  const goTo = useCallback((idx) => {
    autoSpin.current = false;
    // Rotate to bring idx to front
    const current = (((-currentAngle.current % 360) + 360) % 360);
    const target  = idx * CARD_ANGLE;
    let diff = target - current;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    targetAngle.current = currentAngle.current - diff;
    resumeAuto();
  }, [resumeAuto]);

  const activeCat = categories[activeIdx];

  return (
    <section ref={sectionRef} className="ps-root">

      {/* Ambient background that changes with active category */}
      <div
        className="ps-ambient"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${activeCat.colorDark}55 0%, transparent 70%)` }}
      />

      {/* Noise grain */}
      <div className="ps-grain" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="ps-header">
        <span className="ps-header__eye">Ohana Cafe Kitchen &amp; Terraces</span>
        <h2 className="ps-header__title">
          <span className="ps-header__title-plain">Our</span>
          <span className="ps-header__title-accent" style={{ color: activeCat.color }}>
            {activeCat.title}
          </span>
        </h2>
        <p className="ps-header__sub" style={{ color: activeCat.color }}>{activeCat.sub}</p>
      </header>

      {/* ── 3-D carousel stage ── */}
      <div
        className="ps-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={carouselRef}
          className="ps-carousel"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {categories.map((cat, i) => {
            const angle   = i * CARD_ANGLE;
            const isActive = i === activeIdx;
            return (
              <div
                key={cat.key}
                className={`ps-card${isActive ? ' ps-card--active' : ''}`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(var(--carousel-radius, var(--card-translate-z, 430px)))`,
                  '--accent': cat.color,
                  '--card-translate-z': '430px',
                }}
                onClick={() => goTo(i)}
              >
                {/* Card image */}
                <div className="ps-card__img-wrap">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="ps-card__img"
                    loading="lazy"
                  />
                  <div className="ps-card__img-scrim" />
                </div>

                {/* Card content */}
                <div className="ps-card__content">
                  <span className="ps-card__sub">{cat.sub}</span>
                  <h3 className="ps-card__title">{cat.title}</h3>
                  <div className="ps-card__line" style={{ background: cat.color }} />
                </div>

                {/* Active glow border */}
                <div className="ps-card__glow" style={{ boxShadow: `0 0 0 1.5px ${cat.color}66, 0 0 60px ${cat.color}22` }} />
              </div>
            );
          })}
        </div>

        {/* Floor reflection plane */}
        <div className="ps-floor" />
      </div>

      {/* ── Active category description ── */}
      <div className="ps-desc">
        <p className="ps-desc__copy" key={activeCat.key}>{activeCat.copy}</p>
        <button className="ps-desc__btn" type="button" style={{ '--accent': activeCat.color }}>
          <span>Explore {activeCat.title}</span>
          <span className="ps-desc__btn-arrow">→</span>
        </button>
      </div>

      {/* ── Dot nav ── */}
      <nav className="ps-dots" aria-label="Menu categories">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            className={`ps-dot${i === activeIdx ? ' ps-dot--active' : ''}`}
            style={{ '--accent': cat.color }}
            onClick={() => goTo(i)}
            aria-label={cat.title}
            title={cat.title}
          />
        ))}
      </nav>

      {/* ── Drag hint ── */}
      <p className="ps-drag-hint" aria-hidden="true">
        <span className="ps-drag-hint__icon">⟵</span>
        drag to rotate
        <span className="ps-drag-hint__icon">⟶</span>
      </p>
    </section>
  );
}