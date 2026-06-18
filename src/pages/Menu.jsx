import CategoryTile from '../components/CategoryTile';
import SectionReveal from '../components/SectionReveal';
import { categoryData } from '../data/menuData';

const Menu = () => {
  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-teal-mid to-[#042924] text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_28%)]" />
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
          <span className="text-sm uppercase tracking-[0.24em] text-gold">Menu</span>
          <h1 className="heading-display mt-5 text-5xl font-black uppercase tracking-[-0.04em] text-white md:text-6xl">What Are You Feeling Today?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">17 categories. Everything from sunrise eggs to midnight desserts.</p>
          <span className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto hidden h-24 w-full text-center text-[160px] font-black uppercase tracking-[-0.1em] text-white/10 md:block">MENU</span>
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {categoryData.map((item) => (
                <CategoryTile key={item.slug} item={item} to={`/menu/${item.slug}`} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
};

export default Menu;
