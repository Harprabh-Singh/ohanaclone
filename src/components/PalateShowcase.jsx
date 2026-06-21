import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PalateShowcase.css';

const categories = [
  {
    key: 'breakfast',
    title: 'Breakfast',
    copy: 'Golden mornings built around coffee steam, citrus light, and the first flavorful bite.',
    accent: 'Warm beige mornings',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&auto=format&fit=crop',
    signature: 'rays',
  },
  {
    key: 'appetizers',
    title: 'Appetizers',
    copy: 'Shared plates that arrive with artful detail and the perfect first impression.',
    accent: 'Light, layered, unforgettable',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1800&auto=format&fit=crop',
    signature: 'flecks',
  },
  {
    key: 'burgers',
    title: 'Burgers',
    copy: 'Layered texture, smoke, and chemistry in every bite — elevated to a modern classic.',
    accent: 'Deep charcoal luxury',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1800&auto=format&fit=crop',
    signature: 'stack',
  },
  {
    key: 'pizza',
    title: 'Pizza',
    copy: 'Thin crust, molten cheese, and a basil-flecked edge made for slow evenings.',
    accent: 'Terracotta warmth',
    image: 'https://images.unsplash.com/photo-1548365328-1103f2f4d4ad?w=1800&auto=format&fit=crop',
    signature: 'toppings',
  },
  {
    key: 'pasta',
    title: 'Pasta',
    copy: 'Comfort from the fork up: glossy ribbons, rich sauce, and a touch of unexpected spice.',
    accent: 'Polished amber tones',
    image: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8e5d?w=1800&auto=format&fit=crop',
    signature: 'steam',
  },
  {
    key: 'beverages',
    title: 'Beverages',
    copy: 'Bright pours designed to refresh, delight, and carry the same premium finish.',
    accent: 'Emerald depth',
    image: 'https://images.unsplash.com/photo-1505577058444-a3dab5d1d8b8?w=1800&auto=format&fit=crop',
    signature: 'pour',
  },
  {
    key: 'desserts',
    title: 'Desserts',
    copy: 'Soft finishes, berry brightness, and chocolate whispers that close the story beautifully.',
    accent: 'Soft blush finale',
    image: 'https://images.unsplash.com/photo-1505251216167-40b63bd84227?w=1800&auto=format&fit=crop',
    signature: 'drizzle',
  },
];

/* ── Per-category signature animation markup ──────────────────────────── */
const Signature = ({ type }) => {
  switch (type) {
    case 'rays':
      return (
        <div className="sig-rays" aria-hidden="true">
          <span className="sig-ray sig-ray--1" />
          <span className="sig-ray sig-ray--2" />
          <span className="sig-ray sig-ray--3" />
        </div>
      );

    case 'flecks':
      return (
        <div className="sig-flecks" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={`sig-fleck sig-fleck--${i}`} />
          ))}
        </div>
      );

    case 'stack':
      return (
        <div className="sig-stack" aria-hidden="true">
          <span className="sig-bar sig-bar--bun" />
          <span className="sig-bar sig-bar--patty" />
          <span className="sig-bar sig-bar--lettuce" />
        </div>
      );

    case 'toppings':
      return (
        <div className="sig-toppings" aria-hidden="true">
          <svg viewBox="0 0 28 28" className="sig-top sig-top--1"><circle cx="14" cy="14" r="13" fill="#b3392f"/></svg>
          <svg viewBox="0 0 28 28" className="sig-top sig-top--2"><circle cx="14" cy="14" r="13" fill="#b3392f"/></svg>
          <svg viewBox="0 0 24 24" className="sig-top sig-top--3"><path d="M12 2c5 2 8 7 8 12a8 8 0 1 1-16 0c0-5 3-10 8-12z" fill="#4c7a4a"/></svg>
          <svg viewBox="0 0 24 24" className="sig-top sig-top--4"><path d="M12 2c5 2 8 7 8 12a8 8 0 1 1-16 0c0-5 3-10 8-12z" fill="#4c7a4a"/></svg>
          <svg viewBox="0 0 20 20" className="sig-top sig-top--5"><ellipse cx="10" cy="10" rx="6" ry="9" fill="#2f2a1d"/></svg>
          <svg viewBox="0 0 20 20" className="sig-top sig-top--6"><ellipse cx="10" cy="10" rx="6" ry="9" fill="#2f2a1d"/></svg>
        </div>
      );

    case 'steam':
      return (
        <div className="sig-steam" aria-hidden="true">
          <span className="sig-wisp sig-wisp--1" />
          <span className="sig-wisp sig-wisp--2" />
          <span className="sig-wisp sig-wisp--3" />
        </div>
      );

    case 'pour':
      return (
        <div className="sig-pour" aria-hidden="true">
          <div className="sig-pour__glass">
            <div className="sig-pour__liquid" />
          </div>
        </div>
      );

    case 'drizzle':
      return (
        <svg className="sig-drizzle" viewBox="0 0 400 120" aria-hidden="true" preserveAspectRatio="none">
          <path
            className="sig-drizzle__path"
            d="M10,60 C60,10 100,100 150,55 C200,15 230,95 280,50 C320,18 350,80 390,45"
            fill="none"
            stroke="#5a3a24"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};

const PalateShowcase = () => {
  const sectionRef    = useRef(null);
  const introRef      = useRef(null);
  const finalRef      = useRef(null);
  const slidesRef     = useRef([]);
  const progressItems = useRef([]);
  const fillRef       = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const intro   = introRef.current;
    const final   = finalRef.current;
    if (!section || !intro || !final) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll().forEach((t) => { if (t.trigger === section) t.kill(); });

    const slides      = slidesRef.current.filter(Boolean);
    const allPanels   = [intro, ...slides, final];
    const totalScenes = categories.length + 2;

    const showScene = (scene) => {
      allPanels.forEach((el) => el && el.classList.remove('palate-panel--visible'));

      if (scene === 0) {
        intro.classList.add('palate-panel--visible');

      } else if (scene >= 1 && scene <= categories.length) {
        const i = scene - 1;
        if (slides[i]) slides[i].classList.add('palate-panel--visible');

        const pct = ((i + 1) / categories.length) * 100;
        if (fillRef.current) fillRef.current.style.setProperty('--fill-percent', `${pct}%`);
        progressItems.current.forEach((ref, idx) => {
          if (ref) ref.classList.toggle('palate-progress__item--active', idx === i);
        });
      } else {
        final.classList.add('palate-panel--visible');
      }
    };

    showScene(0);
    if (fillRef.current) fillRef.current.style.setProperty('--fill-percent', '0%');

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * totalScenes}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const scene = Math.floor(Math.min(self.progress, 0.9999) * totalScenes);
        showScene(scene);
      },
    });

    const images = Array.from(section.querySelectorAll('img, [data-bg-img]'));
    let loaded = 0;
    const onImgLoad = () => { loaded += 1; if (loaded >= images.length) ScrollTrigger.refresh(); };
    images.forEach((img) => {
      if (img.tagName === 'IMG') {
        if (img.complete && img.naturalHeight) onImgLoad();
        else img.addEventListener('load', onImgLoad, { once: true });
      } else {
        onImgLoad();
      }
    });

    return () => { st.kill(); };
  }, []);

  return (
    <section className="palate-showcase" ref={sectionRef}>
      <div className="palate-showcase__inner">

        {/* ── Intro ── */}
        <div className="palate-showcase__intro" ref={introRef}>
          <div className="palate-showcase__intro-copy">
            <span className="palate-intro-eyebrow">Ohana Cafe Kitchen &amp; Terraces</span>
            <h2 className="palate-showcase__intro-title">Our Palate Pleasers</h2>
            <p className="palate-intro-copy">Every dish tells a story.</p>
            <div className="palate-intro-hint">
              <span>Scroll to explore</span>
              <span className="palate-intro-arrow">↓</span>
            </div>
          </div>
        </div>

        {/* ── Progress sidebar ── */}
        <aside className="palate-progress" aria-label="Menu categories">
          <div className="palate-progress__track-wrap" aria-hidden="true">
            <div className="palate-progress__fill" ref={fillRef} />
          </div>
          <ul className="palate-progress__list">
            {categories.map((cat, i) => (
              <li
                key={cat.key}
                ref={(el) => { progressItems.current[i] = el; }}
                className="palate-progress__item"
              >
                <span className="palate-progress__label">{cat.title}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Slides : full-bleed ── */}
        <div className="palate-showcase__slides">
          {categories.map((cat, i) => {
            const wipe = i % 2 === 0 ? 'wipe-left' : 'wipe-right';
            const num  = String(i + 1).padStart(2, '0');
            return (
              <article
                key={cat.key}
                className={`palate-slide palate-slide--${wipe}`}
                ref={(el) => { slidesRef.current[i] = el; }}
              >
                {/* Full-bleed image */}
                <div className="palate-slide__media">
                  <img
                    loading="lazy"
                    src={cat.image}
                    alt={cat.title}
                    className="palate-slide__img"
                  />
                  <div className="palate-slide__scrim" />
                  <Signature type={cat.signature} />
                </div>

                {/* Overlaid text */}
                <div className="palate-slide__overlay">
                  <span className="palate-slide__number">{num}</span>
                  <div className="palate-slide__text">
                    <span className="palate-slide__tag">{cat.accent}</span>
                    <h3 className="palate-slide__title">{cat.title}</h3>
                    <p className="palate-slide__description">{cat.copy}</p>
                    <button type="button" className="palate-slide__button">
                      <span>Explore</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Final CTA */}
          <article className="palate-slide palate-slide--final" ref={finalRef}>
            <div className="palate-slide__final-copy">
              <span className="palate-slide__final-eyebrow">Jorhat's favourite terrace</span>
              <p className="palate-slide__final-title">Ready to find your favourite?</p>
              <button type="button" className="palate-slide__final-button">
                <span>View Full Menu</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
};

export default PalateShowcase;