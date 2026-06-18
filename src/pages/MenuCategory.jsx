import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X } from 'lucide-react';
import MenuItemCard from '../components/MenuItemCard';
import SectionReveal from '../components/SectionReveal';
import { categoryData, menuItems } from '../data/menuData';

const MenuCategory = () => {
  const { category } = useParams();
  const currentCategory = categoryData.find((item) => item.slug === category) || categoryData[0];
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');

  const categoryItems = useMemo(() => {
    const items = menuItems.filter((item) => item.category === category);
    const filtered = items.filter((item) => {
      const q = query.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    });
    return activeGroup === 'All' ? filtered : filtered.filter((item) => item.group === activeGroup);
  }, [activeGroup, category, query]);

  const groupOptions = useMemo(() => {
    if (category !== 'beverages') return [];
    const groups = Array.from(
      new Set(menuItems.filter((i) => i.category === 'beverages').map((i) => i.group))
    ).filter(Boolean);
    return ['All', ...groups];
  }, [category]);

  // Sibling categories for the bottom nav
  const siblingCategories = categoryData.filter((c) => c.slug !== category).slice(0, 4);

  return (
    <main className="bg-[#f9f5ef]" style={{ paddingTop: '96px' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[420px] flex items-end">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${currentCategory.image})` }}
        />
        {/* Scrim layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-8 left-0 right-0">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              <Link to="/menu" className="transition hover:text-white">Menu</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white">{currentCategory.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-24 md:px-8 w-full">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse inline-block" />
                Ohana Kitchen
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white md:text-7xl"
              >
                {currentCategory.name}
              </motion.h1>
              {currentCategory.description && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className="mt-4 max-w-lg text-base leading-7 text-white/60"
                >
                  {currentCategory.description}
                </motion.p>
              )}
            </div>

            {/* Item count pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="flex-shrink-0"
            >
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-6 py-4 text-center">
                <span className="block text-4xl font-black text-white leading-none">
                  {categoryItems.length}
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 mt-1">
                  Items
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Filter & Search bar ── */}
      <div className="sticky top-[72px] z-20 bg-[#f9f5ef]/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-6">

            {/* Group tabs (beverages only) */}
            {groupOptions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
                {groupOptions.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setActiveGroup(group)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                      activeGroup === group
                        ? 'bg-magenta text-white shadow-[0_4px_16px_rgba(196,45,120,0.28)]'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-magenta hover:text-magenta'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this menu…"
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-800 outline-none transition focus:border-magenta focus:ring-2 focus:ring-magenta/15 placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Result count */}
            <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Items grid ── */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <AnimatePresence mode="popLayout">
            {categoryItems.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {categoryItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MenuItemCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center"
              >
                <span className="text-5xl">🍽️</span>
                <p className="mt-5 text-xl font-black tracking-[-0.03em] text-slate-800">
                  Nothing matches "{query}"
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different keyword, or clear the search.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-magenta/90"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Explore more categories ── */}
      {siblingCategories.length > 0 && (
        <SectionReveal>
          <section className="border-t border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-[-0.03em] text-teal-dark">
                  Explore More
                </h2>
                <Link
                  to="/menu"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-magenta transition hover:underline"
                >
                  All Categories →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {siblingCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/menu/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-slate-100 aspect-[4/3]"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="block text-sm font-black uppercase tracking-[-0.02em] text-white">
                        {cat.name}
                      </span>
                    </div>
                    {/* Hover magenta tint */}
                    <div className="absolute inset-0 bg-magenta/0 transition duration-300 group-hover:bg-magenta/20" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </SectionReveal>
      )}

      {/* ── Bottom CTA ── */}
      <section className="bg-teal-dark py-16 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <p className="text-3xl font-black uppercase tracking-[-0.04em] md:text-4xl">
            Sounds good? Come up.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
            Above KFC, Gar-Ali, Jorhat. Open 11 AM – 10 PM daily.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/reservations"
              className="inline-flex items-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_36px_rgba(196,45,120,0.3)] transition hover:bg-magenta/90"
            >
              Reserve a Table →
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/50"
            >
              ← Back to Menu
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default MenuCategory;
