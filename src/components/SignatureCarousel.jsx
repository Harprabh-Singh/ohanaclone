import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const socialTags = [
  { icon: '🔥', label: 'Most Ordered' },
  { icon: '⭐', label: 'Chef Favourite' },
  { icon: '🥤', label: 'Best Seller' },
  { icon: '🌶', label: 'Signature Spice' },
  { icon: '🍫', label: 'Customer Favourite' },
  { icon: '★', label: 'Weekend Hit' },
];

const CARD_WIDTH = 300;
const CARD_GAP = 20;
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;
const AUTO_SPEED = 0.55; // px per frame

const SignatureCarousel = ({ items = [] }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const isDragging = useRef(false);
  const velRef = useRef(0);
  const lastDragX = useRef(0);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const pauseTimer = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Triple the items so we always have content on both sides
  const loopItems = [...items, ...items, ...items];
  const totalW = items.length * CARD_STRIDE;

  // Set initial offset to the middle copy so we can scroll either way
  useEffect(() => {
    xRef.current = totalW; // start at second copy
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-xRef.current}px)`;
    }
  }, [totalW]);

  // Scroll reveal for the section wrapper
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Main animation loop
  useEffect(() => {
    const tick = () => {
      if (!trackRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      // Auto-scroll when not paused/dragging
      if (!isDragging.current && !pausedRef.current) {
        xRef.current += AUTO_SPEED;
      }

      // Momentum decay after drag release
      if (!isDragging.current && Math.abs(velRef.current) > 0.1) {
        xRef.current += velRef.current;
        velRef.current *= 0.94;
      }

      // Infinite loop: clamp into middle copy range
      if (xRef.current >= totalW * 2) xRef.current -= totalW;
      if (xRef.current < totalW) xRef.current += totalW;

      trackRef.current.style.transform = `translateX(${-xRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [totalW]);

  // Pause auto-scroll temporarily after drag ends
  const temporaryPause = (ms = 1800) => {
    clearTimeout(pauseTimer.current);
    pausedRef.current = true;
    pauseTimer.current = setTimeout(() => { pausedRef.current = false; }, ms);
  };

  // Mouse drag
  const onMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartOffset.current = xRef.current;
    velRef.current = 0;
    lastDragX.current = e.clientX;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - lastDragX.current;
      velRef.current = -delta * 1.2;
      xRef.current = dragStartOffset.current - (e.clientX - dragStartX.current) * 1.2;
      lastDragX.current = e.clientX;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      temporaryPause(1800);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Touch drag
  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartOffset.current = xRef.current;
    lastDragX.current = e.touches[0].clientX;
    velRef.current = 0;
    pausedRef.current = true;
  };

  const onTouchMove = (e) => {
    const delta = e.touches[0].clientX - lastDragX.current;
    velRef.current = -delta * 1.2;
    xRef.current = dragStartOffset.current - (e.touches[0].clientX - dragStartX.current) * 1.2;
    lastDragX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    temporaryPause(1800);
  };

  return (
    <div ref={sectionRef} style={{ opacity: 0 }}>
      {/* Constrained width — clipping handled by parent */}
      <div
        style={{
          position: 'relative',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { if (!isDragging.current) pausedRef.current = false; }}
      >
        {/* The infinite track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            width: `${loopItems.length * CARD_STRIDE}px`,
            willChange: 'transform',
            paddingTop: '8px',
            paddingBottom: '16px',
          }}
        >
          {loopItems.map((item, idx) => {
            const realIdx = idx % items.length;
            const tag = socialTags[realIdx % socialTags.length];
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  flexShrink: 0,
                  width: `${CARD_WIDTH}px`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.055)',
                  border: `1px solid ${isHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isHovered
                    ? '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(196,45,120,0.15)'
                    : '0 16px 48px rgba(0,0,0,0.32)',
                  transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
                  transition: 'transform 420ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 420ms ease, border-color 300ms ease',
                  cursor: 'pointer',
                }}
              >
                {/* Image area */}
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    draggable={false}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                      transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                      transition: 'transform 600ms cubic-bezier(0.25,0.46,0.45,0.94)',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'; }}
                  />

                  {/* Bottom vignette */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                    background: 'linear-gradient(to top, rgba(6,24,20,0.92), transparent)',
                    pointerEvents: 'none',
                  }} />

                  {/* Price — top right */}
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'rgba(6,20,16,0.82)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(244,114,182,0.25)',
                    borderRadius: '100px',
                    padding: '5px 13px',
                    fontSize: '13px', fontWeight: '800',
                    color: '#f472b6',
                    letterSpacing: '-0.01em',
                    pointerEvents: 'none',
                    transition: 'border-color 300ms ease',
                  }}>
                    ₹{item.price}
                  </div>

                  {/* Badge — top left */}
                  {item.badge && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: 'rgba(6,20,16,0.75)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '100px',
                      padding: '4px 10px',
                      fontSize: '10px', fontWeight: '700',
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: '0.04em',
                      pointerEvents: 'none',
                    }}>
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '16px 18px 20px' }}>
                  <h4 style={{
                    fontSize: '15px', fontWeight: '800',
                    color: '#FFFFFF', margin: '0 0 5px 0',
                    lineHeight: 1.25, letterSpacing: '-0.01em',
                    pointerEvents: 'none',
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.45)',
                    margin: '0 0 13px 0', lineHeight: 1.55,
                    pointerEvents: 'none',
                  }}>
                    {item.description}
                  </p>

                  {/* Tag pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 11px', borderRadius: '100px',
                    background: isHovered ? 'rgba(212,175,55,0.16)' : 'rgba(212,175,55,0.08)',
                    border: `1px solid ${isHovered ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.15)'}`,
                    fontSize: '11px', fontWeight: '600',
                    color: isHovered ? 'rgba(212,175,55,1)' : 'rgba(212,175,55,0.75)',
                    letterSpacing: '0.03em',
                    transition: 'all 300ms ease',
                    pointerEvents: 'none',
                  }}>
                    {tag.icon} {tag.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle scroll hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', marginTop: '20px',
      }}>
        <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
        <span style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '600',
        }}>
          Drag to explore
        </span>
        <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
      </div>
    </div>
  );
};

export default SignatureCarousel;