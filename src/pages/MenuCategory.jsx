import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categoryData, menuItems } from '../data/menuData';

gsap.registerPlugin(ScrollTrigger);

/* ─── Accent palette ─── */
const PALETTE = ['#B6912E', '#C42D78', '#E8742A', '#D42020', '#6B8F6B'];
const accent = (i) => PALETTE[i % PALETTE.length];

/* ─────────────────────────────────────────────────────────────────
   BADGE CHIP
───────────────────────────────────────────────────────────────── */
function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '100px',
      fontSize: '9px', fontWeight: '800', letterSpacing: '0.22em',
      textTransform: 'uppercase', border: `1px solid ${color}33`,
      background: `${color}18`, color,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MENU ITEM ROW  — dark glass card
───────────────────────────────────────────────────────────────── */
function ItemRow({ item, index, accentColor }) {
  const [hov, setHov] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    if (!rowRef.current) return;
    gsap.fromTo(rowRef.current,
      { opacity: 0, y: 28, filter: 'blur(4px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.6, ease: 'expo.out',
        delay: (index % 8) * 0.06,
        scrollTrigger: {
          trigger: rowRef.current,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [index]);

  const priceDisplay = typeof item.price === 'number'
    ? `₹${item.price}`
    : item.price === 'MRP' ? 'MRP' : `₹${item.price}`;

  return (
    <div
      ref={rowRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '20px',
        padding: '20px 24px',
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? `${accentColor}44` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}22` : 'none',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left glow strip */}
      <div style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: '3px', height: hov ? '60%' : '0%',
        background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
        borderRadius: '4px', transition: 'height 0.4s ease',
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <h3 style={{
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: '900',
            color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em',
            lineHeight: 1.2, flex: 1,
            transition: 'color 0.3s ease',
          }}>
            {item.title}
          </h3>
        </div>

        {item.description && (
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.45)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            lineHeight: 1.5, margin: '0 0 10px', maxWidth: '540px',
          }}>
            {item.description}
          </p>
        )}

        {/* Badges row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.isOhanaSpecial && <Badge label="★ Ohana Special" color="#B6912E" />}
          {item.isNew && <Badge label="New" color="#6B8F6B" />}
          {item.isSpicy && <Badge label="🌶 Spicy" color="#E8742A" />}
          {item.containsPork && <Badge label="Contains Pork" color="#C42D78" />}
          {item.isVeg && <Badge label="Veg" color="#6B8F6B" />}
          {item.isNonVeg && <Badge label="Non-Veg" color="#C42D78" />}
          {item.priceLabel && <Badge label={item.priceLabel} color="rgba(255,255,255,0.4)" />}
        </div>
      </div>

      {/* Price */}
      <div style={{
        flexShrink: 0, textAlign: 'right',
        transform: hov ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '900',
          color: hov ? accentColor : '#FFFFFF',
          letterSpacing: '-0.03em', lineHeight: 1,
          transition: 'color 0.3s ease',
        }}>
          {priceDisplay}
        </div>
        {typeof item.price === 'string' && item.price.includes('/') && (
          <div style={{
            fontSize: '9px', color: 'rgba(255,255,255,0.3)',
            fontWeight: '700', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginTop: '4px',
          }}>Veg / Non-Veg</div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUBCATEGORY SECTION
───────────────────────────────────────────────────────────────── */
function SubcategorySection({ subcategory, items, accentColor, sectionIndex }) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current,
      { opacity: 0, x: -32 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: 'expo.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <div
      id={`section-${subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      style={{ marginBottom: '64px', scrollMarginTop: '130px' }}
    >
      {/* Section header */}
      <div ref={headerRef} style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        marginBottom: '28px', opacity: 0,
      }}>
        {/* Number */}
        <div style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '900',
          color: 'transparent', WebkitTextStroke: `1px ${accentColor}55`,
          lineHeight: 0.85, flexShrink: 0, letterSpacing: '-0.05em',
        }}>
          {String(sectionIndex + 1).padStart(2, '0')}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px',
          }}>
            <div style={{ width: '28px', height: '1px', background: accentColor, flexShrink: 0 }} />
            <h2 style={{
              fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
              fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: '900',
              color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em',
            }}>
              {subcategory}
            </h2>
          </div>
          <div style={{
            fontSize: '9px', color: 'rgba(255,255,255,0.25)',
            fontWeight: '700', letterSpacing: '0.35em', textTransform: 'uppercase',
            paddingLeft: '40px',
          }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <ItemRow key={item.title} item={item} index={i} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN MENU CATEGORY PAGE
───────────────────────────────────────────────────────────────── */
export default function MenuCategory() {
  const { category } = useParams();
  const currentCategory = categoryData.find((c) => c.slug === category) || categoryData[0];
  const accentColor = currentCategory.accent || '#B6912E';

  const [activeSubcat, setActiveSubcat] = useState(null);
  const [query, setQuery] = useState('');

  const heroRef = useRef(null);
  const tickerRef = useRef(null);

  /* Dark page bg */
  useEffect(() => {
    document.body.style.backgroundColor = '#0A0800';
    document.documentElement.style.backgroundColor = '#0A0800';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  /* All items for this category */
  const allItems = useMemo(() =>
    menuItems.filter((i) => i.category === category),
    [category]
  );

  /* Subcategories */
  const subcategories = useMemo(() =>
    [...new Set(allItems.map((i) => i.subcategory).filter(Boolean))],
    [allItems]
  );

  /* Filtered items (search) */
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter((i) =>
      i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  /* Group filtered items by subcategory */
  const groupedItems = useMemo(() => {
    return subcategories.map((sub) => ({
      subcategory: sub,
      items: filteredItems.filter((i) => i.subcategory === sub),
    })).filter((g) => g.items.length > 0);
  }, [subcategories, filteredItems]);

  /* Hero entrance */
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const els = heroRef.current.querySelectorAll('.hc-mr');
      gsap.set(els, { opacity: 0, y: 40 });
      gsap.to(els, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.2,
      });
    }, heroRef);
    return () => ctx.revert();
  }, [category]);

  /* Ticker horizontal scroll on touch (mobile swipe) */
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.pageX - ticker.offsetLeft;
      scrollLeft = ticker.scrollLeft;
      ticker.style.cursor = 'grabbing';
    };
    const onMouseLeave = () => { isDragging = false; ticker.style.cursor = 'grab'; };
    const onMouseUp = () => { isDragging = false; ticker.style.cursor = 'grab'; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - ticker.offsetLeft;
      ticker.scrollLeft = scrollLeft - (x - startX) * 1.2;
    };

    ticker.addEventListener('mousedown', onMouseDown);
    ticker.addEventListener('mouseleave', onMouseLeave);
    ticker.addEventListener('mouseup', onMouseUp);
    ticker.addEventListener('mousemove', onMouseMove);
    return () => {
      ticker.removeEventListener('mousedown', onMouseDown);
      ticker.removeEventListener('mouseleave', onMouseLeave);
      ticker.removeEventListener('mouseup', onMouseUp);
      ticker.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  /* Scroll to subcategory */
  const scrollToSection = (sub) => {
    const id = `section-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSubcat(sub);
  };

  /* Track active section via IntersectionObserver */
  useEffect(() => {
    const observers = [];
    subcategories.forEach((sub) => {
      const id = `section-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSubcat(sub); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [subcategories, category]);

  const siblingCategories = categoryData.filter((c) => c.slug !== category);

  return (
    <main style={{
      background: '#0A0800', color: '#FAF7F1',
      overflowX: 'hidden', position: 'relative',
      minHeight: '100vh',
    }}>

      {/* ══════════════════════════════════════════════
          CINEMATIC HERO
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative', overflow: 'hidden',
        height: 'clamp(500px, 70vh, 800px)',
        display: 'flex', alignItems: 'flex-end',
      }}>
        {/* Background image with dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `url(${currentCategory.image}) center/cover`,
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,8,0,0.2) 0%, rgba(10,8,0,0.5) 40%, rgba(10,8,0,0.95) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 60% 50%, ${accentColor}18 0%, transparent 65%)`,
        }} />

        {/* Breadcrumb */}
        <div style={{
          position: 'absolute', top: '100px', left: 0, right: 0,
          maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px,6vw,80px)',
        }}>
          <nav className="hc-mr" style={{
            opacity: 0, display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '9px', fontWeight: '800', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          }}>
            <Link to="/menu" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={e => e.target.style.color = accentColor}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
            >Menu</Link>
            <span>›</span>
            <span style={{ color: accentColor }}>{currentCategory.name}</span>
          </nav>
        </div>

        {/* Ghost bg text */}
        <div aria-hidden style={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(8rem, 28vw, 26rem)',
          fontFamily: "'Archivo Black', sans-serif", fontWeight: '900',
          color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.03)',
          letterSpacing: '-0.06em', lineHeight: 0.85,
          userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0,
        }}>
          {currentCategory.name.split(' ')[0].toUpperCase()}
        </div>

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1300px', width: '100%', margin: '0 auto',
          padding: '0 clamp(24px,6vw,80px) clamp(40px,6vh,80px)',
        }}>
          {/* Eyebrow */}
          <div className="hc-mr" style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '2px', background: accentColor }} />
            <span style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.5em',
              textTransform: 'uppercase', color: accentColor,
            }}>
              {currentCategory.icon} Ohana Kitchen
            </span>
          </div>

          {/* Category name */}
          <h1 className="hc-mr" style={{
            opacity: 0,
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 'clamp(3.2rem, 10vw, 8rem)',
            fontWeight: '900', color: '#FFFFFF',
            letterSpacing: '-0.05em', lineHeight: 0.85,
            margin: '0 0 20px', textShadow: `0 0 80px ${accentColor}44`,
          }}>
            {currentCategory.name}
          </h1>

          <p className="hc-mr" style={{
            opacity: 0,
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6,
            margin: '0 0 28px', maxWidth: '500px',
          }}>
            {currentCategory.tagline}
          </p>

          {/* Stats strip */}
          <div className="hc-mr" style={{
            opacity: 0, display: 'flex', gap: '32px',
            borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px',
          }}>
            {[
              { n: allItems.length, l: 'Items' },
              { n: subcategories.length, l: 'Sections' },
              { n: 'Daily', l: '11AM – 10PM' },
            ].map((s) => (
              <div key={s.l}>
                <div style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: 'clamp(1.4rem, 3vw, 2.4rem)',
                  fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.04em',
                }}>{s.n}</div>
                <div style={{
                  fontSize: '8px', fontWeight: '700', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '4px',
                }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STICKY SUBCATEGORY TICKER STRIP
      ══════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: '72px', zIndex: 50,
        background: 'rgba(10,8,0,0.92)', backdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Search bar */}
        <div style={{
          maxWidth: '1300px', margin: '0 auto',
          padding: '14px clamp(24px,6vw,80px) 10px',
          display: 'flex', alignItems: 'center', gap: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '14px', opacity: 0.4, pointerEvents: 'none',
            }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${currentCategory.name}…`}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${query ? accentColor + '55' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '100px', padding: '9px 36px 9px 36px',
                color: '#FFF', fontSize: '13px', outline: 'none',
                transition: 'border-color 0.3s ease',
                fontFamily: "'Outfit', sans-serif",
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0,
              }}>✕</button>
            )}
          </div>
          <span style={{
            fontSize: '9px', fontWeight: '700', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ticker tabs — draggable */}
        <div
          ref={tickerRef}
          style={{
            maxWidth: '1300px', margin: '0 auto',
            padding: '10px clamp(24px,6vw,80px)',
            display: 'flex', gap: '6px',
            overflowX: 'auto', cursor: 'grab',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            userSelect: 'none',
          }}
        >
          {subcategories.map((sub) => {
            const isActive = activeSubcat === sub;
            return (
              <button
                key={sub}
                onClick={() => scrollToSection(sub)}
                style={{
                  flexShrink: 0,
                  padding: '8px 20px', borderRadius: '100px',
                  border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? accentColor : 'transparent',
                  color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                  fontSize: '9px', fontWeight: '800', letterSpacing: '0.25em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 20px ${accentColor}55` : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ITEMS — grouped by subcategory
      ══════════════════════════════════════════════ */}
      <div style={{
        maxWidth: '1300px', margin: '0 auto',
        padding: '60px clamp(24px,6vw,80px) 80px',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px', height: '600px', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accentColor}10 0%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {groupedItems.length > 0 ? (
          groupedItems.map((group, i) => (
            <SubcategorySection
              key={group.subcategory}
              subcategory={group.subcategory}
              items={group.items}
              accentColor={accent(i)}
              sectionIndex={i}
            />
          ))
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍽️</div>
            <h2 style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: '2rem', color: '#FFF', marginBottom: '12px',
            }}>
              Nothing matches "{query}"
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', fontStyle: 'italic',
            }}>
              Try a different keyword or clear the search.
            </p>
            <button
              onClick={() => setQuery('')}
              style={{
                marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: accentColor, color: '#000', border: 'none',
                padding: '14px 32px', borderRadius: '100px',
                fontSize: '9px', fontWeight: '900', letterSpacing: '0.25em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Packaging note */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '32px', marginTop: '40px',
          display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.25)',
              fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Notes
            </p>
            <p style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6,
            }}>
              Packaging charges extra @Rs. 10 per container.<br />
              All dishes made-to-order — please allow 20–25 mins.<br />
              * Taxes as applicable.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge label="★ Ohana Special" color="#B6912E" />
            <Badge label="🌶 Spicy" color="#E8742A" />
            <Badge label="Contains Pork" color="#C42D78" />
            <Badge label="New" color="#6B8F6B" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          EXPLORE MORE CATEGORIES
          — Horizontal scroll strip
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '60px 0 80px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(182,145,46,0.07) 0%, transparent 60%)',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px,6vw,80px)', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '28px', height: '1px', background: accentColor }} />
              <h2 style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontWeight: '900',
                color: '#FFF', letterSpacing: '-0.03em', margin: 0,
              }}>
                Explore More
              </h2>
            </div>
            <Link to="/menu" style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: accentColor, textDecoration: 'none',
            }}>
              All Categories →
            </Link>
          </div>
        </div>

        {/* Horizontal scrolling category strip */}
        <div style={{
          display: 'flex', gap: '20px',
          padding: '0 clamp(24px,6vw,80px)',
          overflowX: 'auto', scrollbarWidth: 'none',
          paddingBottom: '12px',
        }}>
          {siblingCategories.map((cat, i) => (
            <SiblingCard key={cat.slug} cat={cat} accentColor={accent(i)} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(60px,10vh,120px) clamp(24px,6vw,80px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600) center/cover',
          filter: 'brightness(0.2)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, #0A0800 0%, transparent 20%, transparent 80%, #0A0800 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '1px', background: '#B6912E' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#B6912E' }}>
              The Experience Awaits
            </span>
            <div style={{ width: '40px', height: '1px', background: '#B6912E' }} />
          </div>

          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 'clamp(2.4rem, 8vw, 6rem)', fontWeight: '900',
            lineHeight: 0.88, letterSpacing: '-0.05em', margin: '0 0 24px',
          }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.6)' }}>Above KFC,</span><br />
            <span style={{ color: '#FFF' }}>Gar-Ali.</span>
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)', color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6,
            margin: '0 auto 40px', maxWidth: '420px',
          }}>
            Open daily, 11 AM to 10 PM. Walk in or reserve ahead for the terrace seats.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#B6912E', color: '#000', textDecoration: 'none',
              padding: '16px 40px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.22em',
              textTransform: 'uppercase', boxShadow: '0 16px 50px rgba(182,145,46,0.35)',
            }}>
              Reserve a Table →
            </Link>
            <Link to="/menu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              border: '1px solid rgba(255,255,255,0.2)', color: '#FFF',
              textDecoration: 'none', padding: '16px 40px', borderRadius: '100px',
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}>
              ← Back to Menu
            </Link>
          </div>
        </div>
      </section>

      {/* CSS */}
      <style>{`
        @keyframes tickerSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SIBLING CATEGORY CARD (horizontal strip)
───────────────────────────────────────────────────────────────── */
function SiblingCard({ cat, accentColor }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={`/menu/${cat.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0, position: 'relative', overflow: 'hidden',
        width: 'clamp(180px, 28vw, 260px)', height: 'clamp(160px, 20vh, 220px)',
        borderRadius: '20px', textDecoration: 'none',
        boxShadow: hov ? '0 20px 60px rgba(0,0,0,0.7)' : '0 8px 30px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hov ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        border: `1px solid ${hov ? accentColor + '55' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Image */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `url(${cat.image}) center/cover`,
        transform: hov ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 1.2s cubic-bezier(0.2,0.8,0.2,1)',
      }} />
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)',
      }} />
      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{cat.icon}</div>
        <div style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: '900',
          color: '#FFF', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>{cat.name}</div>
        <div style={{
          fontSize: '8px', fontWeight: '700', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: hov ? accentColor : 'rgba(255,255,255,0.3)',
          marginTop: '6px', transition: 'color 0.3s ease',
        }}>Explore →</div>
      </div>
    </Link>
  );
}
