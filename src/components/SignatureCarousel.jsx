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

const CARDS_VISIBLE = 3;

const SignatureCarousel = ({ items = [] }) => {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const trackRef = useRef(null);

  const total = items.length;
  const maxIndex = Math.max(0, total - CARDS_VISIBLE);

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, maxIndex));
    setCurrent(clamped);
  };

  // Slide the track
  useEffect(() => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.children[0]?.offsetWidth || 0;
    const gap = 24;
    gsap.to(trackRef.current, {
      x: -(current * (cardWidth + gap)),
      duration: 0.55,
      ease: 'power3.out',
    });
  }, [current]);

  // Reveal animation on scroll
  useEffect(() => {
    if (!carouselRef.current || cardRefs.current.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: carouselRef.current,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, carouselRef);

    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={carouselRef}>
      {/* Section header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '2px',
            background: 'linear-gradient(90deg, #D4AF37, transparent)',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#D4AF37',
          }}>Popular Right Now</span>
        </div>
        <h3 style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
          fontWeight: '900', color: '#FFFFFF',
          margin: '0 0 8px 0', lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}>
          What Everyone's Ordering.
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Fresh favourites from our menu.
        </p>
      </div>

      {/* Carousel viewport */}
      <div style={{ position: 'relative' }}>
        {/* Fade edges */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', zIndex: 2,
          background: 'linear-gradient(to right, #0d3b33, transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', zIndex: 2,
          background: 'linear-gradient(to left, #0d3b33, transparent)',
          pointerEvents: 'none',
        }} />

        {/* Track wrapper */}
        <div style={{ overflow: 'hidden', padding: '8px 4px 16px' }}>
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              gap: '24px',
              willChange: 'transform',
            }}
          >
            {items.map((item, idx) => {
              const tag = socialTags[idx % socialTags.length];
              return (
                <div
                  key={idx}
                  ref={el => (cardRefs.current[idx] = el)}
                  style={{
                    flexShrink: 0,
                    width: 'calc((100% - 48px) / 3)',
                    minWidth: '260px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset',
                    transition: 'transform 500ms ease, box-shadow 500ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 40px 80px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.1) inset';
                    e.currentTarget.querySelector('.card-img').style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07) inset';
                    e.currentTarget.querySelector('.card-img').style.transform = 'scale(1)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                    <img
                      className="card-img"
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                        transition: 'transform 500ms ease',
                      }}
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800';
                      }}
                    />
                    {/* Vignette */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                      background: 'linear-gradient(to top, rgba(8,32,28,0.9), transparent)',
                      pointerEvents: 'none',
                    }} />
                    {/* Price badge */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(8,28,24,0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '100px',
                      padding: '5px 13px',
                      fontSize: '13px', fontWeight: '800',
                      color: '#f472b6',
                    }}>
                      ₹{item.price}
                    </div>
                    {/* Badge (if exists) */}
                    {item.badge && (
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        background: 'rgba(8,28,24,0.75)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '100px',
                        padding: '4px 10px',
                        fontSize: '11px', fontWeight: '600',
                        color: 'rgba(255,255,255,0.85)',
                      }}>
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '18px 20px 22px' }}>
                    <h4 style={{
                      fontSize: '16px', fontWeight: '800',
                      color: '#FFFFFF', margin: '0 0 6px 0', lineHeight: 1.25,
                    }}>
                      {item.name}
                    </h4>
                    <p style={{
                      fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                      margin: '0 0 14px 0', lineHeight: 1.5,
                    }}>
                      {item.description}
                    </p>
                    {/* Tag pill */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '5px 11px', borderRadius: '100px',
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      fontSize: '11px', fontWeight: '600',
                      color: 'rgba(212,175,55,0.9)',
                      letterSpacing: '0.04em',
                    }}>
                      {tag.icon} {tag.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: current === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: current === 0 ? 'rgba(255,255,255,0.25)' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '18px',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              if (current !== 0) {
                e.currentTarget.style.background = 'rgba(236,72,153,0.22)';
                e.currentTarget.style.borderColor = 'rgba(236,72,153,0.45)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = current === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ‹
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '100px',
                  background: i === current ? '#ec4899' : 'rgba(255,255,255,0.22)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(current + 1)}
            disabled={current >= maxIndex}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: current >= maxIndex ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: current >= maxIndex ? 'rgba(255,255,255,0.25)' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current >= maxIndex ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '18px',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              if (current < maxIndex) {
                e.currentTarget.style.background = 'rgba(236,72,153,0.22)';
                e.currentTarget.style.borderColor = 'rgba(236,72,153,0.45)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = current >= maxIndex ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCarousel;