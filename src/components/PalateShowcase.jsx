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
    bg: '#e9d5b5',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop',
  },
  {
    key: 'appetizers',
    title: 'Appetizers',
    copy: 'Shared plates that arrive with artful detail and the perfect first impression.',
    accent: 'Light, layered, unforgettable',
    bg: '#dbe3d1',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1400&auto=format&fit=crop',
  },
  {
    key: 'burgers',
    title: 'Burgers',
    copy: 'Layered texture, smoke, and chemistry in every bite — elevated to a modern classic.',
    accent: 'Deep charcoal luxury',
    bg: '#192022',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1400&auto=format&fit=crop',
  },
  {
    key: 'pizza',
    title: 'Pizza',
    copy: 'Thin crust, molten cheese, and a basil-flecked edge made for slow evenings.',
    accent: 'Terracotta warmth',
    bg: '#bd6a44',
    image: 'https://images.unsplash.com/photo-1548365328-1103f2f4d4ad?w=1400&auto=format&fit=crop',
  },
  {
    key: 'pasta',
    title: 'Pasta',
    copy: 'Comfort from the fork up: glossy ribbons, rich sauce, and a touch of unexpected spice.',
    accent: 'Polished amber tones',
    bg: '#4a2f22',
    image: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8e5d?w=1400&auto=format&fit=crop',
  },
  {
    key: 'beverages',
    title: 'Beverages',
    copy: 'Bright pours designed to refresh, delight, and carry the same premium finish.',
    accent: 'Emerald depth',
    bg: '#1c4f44',
    image: 'https://images.unsplash.com/photo-1505577058444-a3dab5d1d8b8?w=1400&auto=format&fit=crop',
  },
  {
    key: 'desserts',
    title: 'Desserts',
    copy: 'Soft finishes, berry brightness, and chocolate whispers that close the story beautifully.',
    accent: 'Soft blush finale',
    bg: '#f0d8dd',
    image: 'https://images.unsplash.com/photo-1505251216167-40b63bd84227?w=1400&auto=format&fit=crop',
  },
];

const PalateShowcase = () => {
  const sectionRef    = useRef(null);
  const bgRef         = useRef(null);
  const introRef      = useRef(null);
  const finalRef      = useRef(null);
  const slidesRef     = useRef([]);
  const progressItems = useRef([]);
  const fillRef       = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg      = bgRef.current;
    const intro   = introRef.current;
    const final   = finalRef.current;
    if (!section || !intro || !final) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getAll().forEach((t) => { if (t.trigger === section) t.kill(); });

    const slides      = slidesRef.current.filter(Boolean);
    const allPanels   = [intro, ...slides, final];
    const totalScenes = categories.length + 2; // intro + 7 + final

    // ── helpers ────────────────────────────────────────────────
    const showScene = (scene) => {
      // Remove visible class from all panels
      allPanels.forEach((el) => {
        if (el) el.classList.remove('palate-panel--visible');
      });

      if (scene === 0) {
        intro.classList.add('palate-panel--visible');

      } else if (scene >= 1 && scene <= categories.length) {
        const i = scene - 1;
        if (slides[i]) slides[i].classList.add('palate-panel--visible');

        // Progress fill
        const pct = ((i + 1) / categories.length) * 100;
        if (fillRef.current) fillRef.current.style.setProperty('--fill-percent', `${pct}%`);
        progressItems.current.forEach((ref, idx) => {
          if (ref) ref.classList.toggle('palate-progress__item--active', idx === i);
        });

        // Background colour on the dedicated bg div (avoids CSS var repaint lag)
        if (bg) bg.style.background = categories[i].bg;

      } else {
        final.classList.add('palate-panel--visible');
        if (bg) bg.style.background = categories[categories.length - 1].bg;
      }
    };

    // ── initial state ──────────────────────────────────────────
    showScene(0);
    if (bg) bg.style.background = categories[0].bg;
    if (fillRef.current) fillRef.current.style.setProperty('--fill-percent', '0%');

    // ── ScrollTrigger ──────────────────────────────────────────
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

    // Refresh after images load
    const images = Array.from(section.querySelectorAll('img'));
    let loaded = 0;
    const onImgLoad = () => { loaded += 1; if (loaded >= images.length) ScrollTrigger.refresh(); };
    images.forEach((img) => {
      if (img.complete && img.naturalHeight) onImgLoad();
      else img.addEventListener('load', onImgLoad, { once: true });
    });

    return () => { st.kill(); };
  }, []);

  return (
    <section className="palate-showcase" ref={sectionRef}>
      {/* Dedicated background layer for smooth colour transitions */}
      <div className="palate-showcase__bg" ref={bgRef} />

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
                aria-label={`${i + 1} of ${categories.length}: ${cat.title}`}
              >
                <span className="palate-progress__label">{cat.title}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Slides ── */}
        <div className="palate-showcase__slides">
          {categories.map((cat, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const num  = String(i + 1).padStart(2, '0');
            return (
              <article
                key={cat.key}
                className={`palate-slide palate-slide--${side}`}
                ref={(el) => { slidesRef.current[i] = el; }}
              >
                {/* Image */}
                <div className="palate-slide__image-area">
                  <div className="palate-slide__image-wrap">
                    <img
                      loading="lazy"
                      src={cat.image}
                      alt={cat.title}
                      className="palate-slide__image"
                    />
                    <span className="palate-slide__badge">{cat.accent}</span>
                    <span className="palate-slide__number" aria-hidden="true">{num}</span>
                  </div>
                </div>

                {/* Text */}
                <div className="palate-slide__content">
                  <span className="palate-slide__tag">{cat.accent}</span>
                  <h3 className="palate-slide__title">{cat.title}</h3>
                  <p className="palate-slide__description">{cat.copy}</p>
                  <button type="button" className="palate-slide__button">
                    <span className="palate-slide__button-label">Explore</span>
                    <span className="palate-slide__btn-arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}

          {/* Final CTA */}
          <article
            className="palate-slide palate-slide--final"
            ref={finalRef}
          >
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