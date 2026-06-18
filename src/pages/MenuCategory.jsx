import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
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
      const searchText = query.toLowerCase();
      return item.title.toLowerCase().includes(searchText) || item.description.toLowerCase().includes(searchText);
    });
    return activeGroup === 'All' ? filtered : filtered.filter((item) => item.group === activeGroup);
  }, [activeGroup, category, query]);

  const groupOptions = useMemo(() => {
    if (category !== 'beverages') return [];
    const groups = Array.from(new Set(menuItems.filter((item) => item.category === 'beverages').map((item) => item.group))).filter(Boolean);
    return ['All', ...groups];
  }, [category]);

  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${currentCategory.image})` }}>
        <div className="absolute inset-0 bg-scrim" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center text-white md:px-8">
          <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/70">← <Link to="/menu" className="underline underline-offset-4">Menu</Link> <span className="text-white/50">/</span> {currentCategory.name}</p>
          <h1 className="heading-display text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">{currentCategory.name}</h1>
          <div className="mt-6 inline-flex rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {categoryItems.length} items
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {groupOptions.length > 0 && (
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {groupOptions.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeGroup === group ? 'bg-magenta text-white' : 'border border-white/30 bg-teal-mid/10 text-[#0A2E2A]'}`}
                >
                  {group}
                </button>
              ))}
            </div>
          )}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-lg font-semibold text-teal-dark">Showing {categoryItems.length} menu item{categoryItems.length === 1 ? '' : 's'}</p>
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-mid" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the menu"
                className="w-full rounded-full border border-teal-card bg-cream-dark py-3 pl-12 pr-4 text-sm text-text-dark outline-none transition focus:border-magenta"
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryItems.length > 0 ? (
              categoryItems.map((item) => <MenuItemCard key={item.title} item={item} />)
            ) : (
              <div className="col-span-full rounded-[24px] border border-dashed border-teal-card bg-white p-12 text-center text-teal-dark">
                <p className="text-xl font-semibold">No items match your search yet.</p>
                <p className="mt-3 text-sm text-text-mid">Try a different keyword, or browse another category.</p>
                <Link to="/menu" className="mt-6 inline-flex items-center gap-2 text-magenta font-semibold">
                  Back to menu <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MenuCategory;
