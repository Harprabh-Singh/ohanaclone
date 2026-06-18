import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryTile from '../components/CategoryTile';
import SectionReveal from '../components/SectionReveal';
import { categoryData } from '../data/menuData';

// Animated counter for the stat strip
const AnimatedNumber = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const duration = 1200;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Categories' },
    { id: 'veg', label: 'Veg-Friendly' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'mains', label: 'Mains' },
  ];

  return (
    <main className="pt-24 bg-[#f9f5ef]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-teal-dark text-white min-h-[480px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(196,45,120,0.18),transparent_65%)]" />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Large ghost text */}
          <span className="absolute inset-x-0 bottom-0 text-center text-[22vw] font-black uppercase leading-none tracking-[-0.06em] text-white/[0.03] select-none pointer-events-none">
            MENU
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-gold mb-8">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Ohana Cafe Kitchen &amp; Terraces
            </div>
            <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white md:text-7xl lg:text-[5.5rem]">
              What Are<br />
              <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#f5c842] to-[#e8a020]">
                You Feeling
              </em><br />
              Today?
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/60 md:text-lg">
              17 categories. Everything from sunrise eggs to midnight desserts — served above Gar-Ali with the warmth Ohana is known for.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/reservations"
                className="inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-magenta/90 shadow-[0_12px_40px_rgba(196,45,120,0.3)]"
              >
                Reserve a Table →
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
              >
                Browse Menu ↓
              </a>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-16 flex flex-wrap gap-10 border-t border-white/10 pt-8">
            {[
              { value: 17, suffix: '', label: 'Categories' },
              { value: 80, suffix: '+', label: 'Dishes' },
              { value: 4, suffix: '.8★', label: 'Avg Rating' },
              { value: 11, suffix: 'AM–10PM', label: 'Open Daily' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-3xl font-black tracking-[-0.04em] text-white">
                  <AnimatedNumber target={s.value} suffix={s.suffix} />
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="overflow-hidden bg-magenta py-3 select-none">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array(3).fill(['Breakfast', 'Burgers', 'Pizza', 'Momos', 'Pasta', 'Beverages', 'Desserts', 'Sandwiches', 'Wraps', 'Shakes']).flat().map((item, i) => (
            <span key={i} className="mx-6 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
              {item} <span className="mx-3 text-white/30">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Categories grid ── */}
      <SectionReveal>
        <section id="categories" className="bg-[#f9f5ef] py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">

            {/* Section header */}
            <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-magenta">
                  The Full Menu
                </span>
                <h2 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[-0.04em] text-teal-dark md:text-5xl">
                  Every Craving, Covered.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-500 md:text-right">
                Tap a category to see the full selection — from quick bites to full spreads.
              </p>
            </div>

            {/* Category grid */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {categoryData.map((item) => (
                <CategoryTile key={item.slug} item={item} to={`/menu/${item.slug}`} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ── Bottom CTA ── */}
      <section className="bg-teal-dark py-20 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Come Experience It
          </span>
          <h2 className="mt-4 text-4xl font-black uppercase leading-tight tracking-[-0.04em] md:text-5xl">
            Above KFC, Gar-Ali.<br />Jorhat's favourite terrace.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60">
            Open every day, 11 AM to 10 PM. Walk in or reserve ahead for the terrace seats.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/reservations"
              className="inline-flex items-center gap-2 rounded-full bg-magenta px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_48px_rgba(196,45,120,0.32)] transition hover:bg-magenta/90"
            >
              Reserve a Table →
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/50"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Menu;