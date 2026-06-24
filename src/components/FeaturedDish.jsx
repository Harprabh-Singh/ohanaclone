import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeaturedDish = ({ dish }) => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -40, scale: 0.96 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!dish) return null;

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', left: '-80px', top: '50%',
          transform: 'translateY(-50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', right: '0', top: '20%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Main grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'center',
      }}
        className="featured-dish-grid"
      >
        {/* LEFT — Image */}
        <div ref={imageRef} style={{ position: 'relative' }}>
          <div
            className="featured-image-wrapper"
            style={{
              borderRadius: '32px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 0 0 1px rgba(212,175,55,0.15), 0 40px 100px rgba(0,0,0,0.55), 0 0 80px rgba(236,72,153,0.12)',
              transition: 'box-shadow 600ms ease',
              aspectRatio: '4/3',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.3), 0 60px 120px rgba(0,0,0,0.65), 0 0 120px rgba(236,72,153,0.22)';
              e.currentTarget.querySelector('img').style.transform = 'scale(1.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.15), 0 40px 100px rgba(0,0,0,0.55), 0 0 80px rgba(236,72,153,0.12)';
              e.currentTarget.querySelector('img').style.transform = 'scale(1)';
            }}
          >
            <img
              src={dish.image}
              alt={dish.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 600ms ease-out',
              }}
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800';
              }}
            />
            {/* Bottom vignette */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
              background: 'linear-gradient(to top, rgba(8,38,32,0.7), transparent)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* RIGHT — Content */}
        <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(236,72,153,0.06))',
            border: '1px solid rgba(236,72,153,0.35)',
            backdropFilter: 'blur(12px)',
            borderRadius: '100px',
            padding: '6px 14px',
            fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.14em', color: '#f472b6',
            textTransform: 'uppercase',
            marginBottom: '22px',
            width: 'fit-content',
          }}>
            🔥 MOST ORDERED THIS WEEK
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: '900',
            color: '#FFFFFF',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 14px 0',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            {dish.name}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            margin: '0 0 24px 0',
          }}>
            {dish.description}
          </p>

          {/* Price */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              fontWeight: '900',
              color: '#f472b6',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>₹{dish.price}</span>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              marginLeft: '10px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>per serving</span>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
            border: '1px solid rgba(212,175,55,0.22)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: '#D4AF37', fontSize: '14px' }}>★</span>
              ))}
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '700', margin: 0 }}>
                Customer Favourite
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '3px 0 0 0' }}>
                Ordered 120+ times this month
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/menu')}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: 'white',
                border: 'none',
                padding: '15px 32px',
                borderRadius: '100px',
                fontWeight: '700',
                fontSize: '13px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 30px rgba(236,72,153,0.35)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(236,72,153,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(236,72,153,0.35)';
              }}
            >
              View Menu
            </button>
            <button
              onClick={() => navigate('/reservations')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
                padding: '15px 32px',
                borderRadius: '100px',
                fontWeight: '700',
                fontSize: '13px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.75)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Reserve Table
            </button>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .featured-dish-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedDish;