import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroParticles from './HeroParticles';
import './HeroParticles.css';
import './hero-animations.css';

const BACKGROUND_LAYERS = [
  {
    key: 'terrace',
    image:
      'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80)',
  },
  {
    key: 'food',
    image:
      'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80)',
  },
  {
    key: 'cocktail',
    image:
      'url(https://images.unsplash.com/photo-1528805402804-2be1b026d2d6?auto=format&fit=crop&w=1800&q=80)',
  },
];

const HERO_WORDS = ['Stay', 'A', 'Little', 'Longer.'];

const HERO_CARDS = [
  { title: '★★★★★', subtitle: '4.8 Rating' },
  { title: 'Open Today', subtitle: '11 AM – 10 PM' },
  { title: 'Gar-Ali', subtitle: 'Jorhat' },
];

const HeroSection = () => {
  const videoForHome = '/videos/hero.mp4';
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const layerRefs = useRef([]);
  const contentRef = useRef(null);
  const headlineRef = useRef(null);
  const eyebrowRef = useRef(null);
  const cardsRef = useRef([]);
  const wordRefs = useRef([]);
  const buttonRefs = useRef([]);

  const addLayer = (node) => {
    if (node && !layerRefs.current.includes(node)) {
      layerRefs.current.push(node);
    }
  };

  const addCard = (node) => {
    if (node && !cardsRef.current.includes(node)) {
      cardsRef.current.push(node);
    }
  };

  const addWord = (node) => {
    if (node && !wordRefs.current.includes(node)) {
      wordRefs.current.push(node);
    }
  };

  const addButton = (node) => {
    if (node && !buttonRefs.current.includes(node)) {
      buttonRefs.current.push(node);
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    const headline = headlineRef.current;
    const eyebrow = eyebrowRef.current;
    const cards = cardsRef.current;
    const words = wordRefs.current;
    const buttons = buttonRefs.current;
    const layers = layerRefs.current;

    if (!section || !bg || !content || !headline || !eyebrow) return;

    const heroLoad = gsap.timeline();
    heroLoad
      .from(bg, { scale: 1.12, duration: 2.2, ease: 'power3.out' }, 0)
      .from(eyebrow, { opacity: 0, y: 18, duration: 0.72 }, 0.2)
      .from(words, { opacity: 0, y: 24, stagger: 0.14, duration: 0.72 }, 0.5)
      .from(content.querySelector('.hero-copy'), { opacity: 0, y: 24, duration: 0.9 }, 1.0)
      .from(buttons, { opacity: 0, y: 26, stagger: 0.12, duration: 0.85 }, 1.2)
      .from(cards, { opacity: 0, y: 36, stagger: 0.12, duration: 0.9 }, 1.3);

    const crossfade = gsap.timeline({ repeat: -1, defaults: { duration: 1.8, ease: 'power2.inOut' } });
    crossfade.set(layers, { autoAlpha: 0, scale: 1.08 });
    crossfade.to(layers[0], { autoAlpha: 1, scale: 1 }, 0);
    crossfade.to(layers[0], { autoAlpha: 0 }, '+=6');
    crossfade.to(layers[1], { autoAlpha: 1, scale: 1 }, '-=1.6');
    crossfade.to(layers[1], { autoAlpha: 0 }, '+=6');
    crossfade.to(layers[2], { autoAlpha: 1, scale: 1 }, '-=1.6');
    crossfade.to(layers[2], { autoAlpha: 0 }, '+=6');

    const scrollWidget = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=420',
      scrub: 0.75,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.to(bg, { scale: 1.08 + progress * 0.03, duration: 0.1, ease: 'none' });
        gsap.to(content, { opacity: 1 - progress * 1.1, y: -progress * 72, duration: 0.1, ease: 'none' });
        gsap.to(cards, { opacity: 1 - progress * 1.2, y: -progress * 42, duration: 0.1, ease: 'none' });
      },
    });

    const resetMotion = () => {
      gsap.to([bg, content, headline, cards], { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    };

    const moveHero = (event) => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const bounds = section.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const offsetY = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
      gsap.to(bg, { x: offsetX * 8, y: offsetY * 8, duration: 0.9, ease: 'power3.out' });
      gsap.to(content, { x: offsetX * 16, y: offsetY * 12, duration: 0.9, ease: 'power3.out' });
      gsap.to(headline, { x: offsetX * 4, y: offsetY * 4, duration: 0.9, ease: 'power3.out' });
      gsap.to(cards, { x: offsetX * 10, y: offsetY * 10, duration: 0.9, ease: 'power3.out' });
    };

    section.addEventListener('pointermove', moveHero);
    section.addEventListener('pointerleave', resetMotion);
    section.addEventListener('pointercancel', resetMotion);

    return () => {
      section.removeEventListener('pointermove', moveHero);
      section.removeEventListener('pointerleave', resetMotion);
      section.removeEventListener('pointercancel', resetMotion);
      crossfade.kill();
      heroLoad.kill();
      scrollWidget.kill();
    };
  }, []);

  // Check for a bundled video at runtime (served from public/videos/hero.mp4)
  const [videoAvailable, setVideoAvailable] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch('/videos/hero.mp4', { method: 'HEAD' })
      .then((res) => {
        if (!mounted) return;
        if (res.ok) setVideoAvailable(true);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!videoAvailable) return;
    const v = videoRef.current;
    if (!v) return;
    const tl = gsap.timeline();
    tl.fromTo(
      v,
      { scale: 1.08, filter: 'brightness(0.9)', opacity: 0 },
      { scale: 1, filter: 'brightness(1.04)', opacity: 1, duration: 15, ease: 'power1.out' }
    );
    // subtle repeating micro-shift in brightness
    gsap.to(v, { filter: 'brightness(1.02)', duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    return () => {
      tl.kill();
    };
  }, [videoAvailable]);

  return (
    <section ref={sectionRef} className="hero-section relative min-h-screen overflow-hidden text-white">
      <div ref={bgRef} className="hero-background">
        {videoAvailable ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="hero-video"
            >
              <source src={videoForHome} type="video/mp4" />
            </video>
            <div className="hero-video-overlay" />
          </>
        ) : (
          <>
            <div className="hero-background-mask" />
            {BACKGROUND_LAYERS.map((layer) => (
              <div
                key={layer.key}
                ref={addLayer}
                aria-hidden="true"
                className={`hero-layer hero-layer--${layer.key}`}
                style={{ backgroundImage: layer.image }}
              />
            ))}
            <div className="hero-ambient" />
            <div className="hero-grain" />
          </>
        )}
      </div>

      <HeroParticles />

      <div ref={contentRef} className="relative z-10 mx-auto flex min-h-screen flex-col justify-end px-5 py-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <div className="hero-radial" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 lg:gap-14">
          <div className="max-w-3xl">
            <p ref={eyebrowRef} className="hero-eyebrow mb-6 uppercase tracking-[0.26em] text-gold/90">
              OHANA AFTER SUNSET
            </p>

            <h1 ref={headlineRef} className="hero-headline text-[3.6rem] leading-[0.92] tracking-[-0.04em] text-white sm:text-[4.8rem] md:text-[5.8rem] lg:text-[6.6rem]">
              {HERO_WORDS.map((word) => (
                <span key={word} ref={addWord} className="hero-word mr-3 inline-block">
                  {word}
                </span>
              ))}
            </h1>

            <p className="hero-copy max-w-2xl text-base leading-8 text-white/80 sm:text-lg md:text-xl">
              An evening suspended between warm light and thoughtful company — a terrace made for staying a little longer.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                ref={addButton}
                to="/reservations"
                className="hero-btn hero-btn--primary inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_24px_50px_rgba(0,0,0,0.22)]"
              >
                Reserve a Table
              </Link>
              <Link
                ref={addButton}
                to="/menu"
                className="hero-btn hero-btn--secondary inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
              >
                Explore Menu
              </Link>
            </div>
          </div>

          <div className="hero-card-grid pointer-events-none">
            {HERO_CARDS.map((card, index) => (
              <article key={card.title} ref={addCard} className={`hero-card hero-card--${index + 1}`}>
                <p className="hero-card-title">{card.title}</p>
                <p className="hero-card-subtitle">{card.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
