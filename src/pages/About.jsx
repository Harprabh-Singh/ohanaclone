import SectionReveal from '../components/SectionReveal';
import { Briefcase, HeartHandshake, Sparkle, Users } from 'lucide-react';

const pillars = [
  { icon: Sparkle, title: 'Fresh Ingredients', description: 'Seasonal produce, premium spices and vibrant herbs in every plate.' },
  { icon: Users, title: 'Multi-Cuisine Range', description: 'Breakfast, burgers, pizza, shakes, and global comfort dishes under one roof.' },
  { icon: HeartHandshake, title: 'Terrace Ambience', description: 'Soft lights, warm textures, evening breeze and a view above the street.' },
  { icon: Briefcase, title: 'Family Hospitality', description: 'Attentive service, caring moments, and a welcoming table for every group.' },
];

const About = () => {
  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600)' }}>
        <div className="absolute inset-0 bg-scrim" />
        <div className="relative mx-auto flex min-h-[400px] max-w-7xl items-center px-5 text-white md:px-8">
          <div className="space-y-4">
            <p className="section-heading text-4xl font-black md:text-5xl">Ohana. Family in Every Bite.</p>
            <p className="max-w-2xl text-base leading-8 text-white/80 md:text-lg">A warm terrace kitchen where every dish has a story and every guest is part of the family.</p>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <p className="section-heading text-3xl font-black text-teal-dark md:text-4xl">The story behind Ohana.</p>
                <p className="text-base leading-8 text-text-mid">Ohana is Hawaiian for family, and we built this cafe to be the kind of place where strangers become regulars, and late evenings feel like a homecoming.</p>
                <p className="text-base leading-8 text-text-mid">The terrace above Gar-Ali brings golden hour warmth, string lights, and a relaxed rooftop feeling—perfect for sharing plates, cocktails, and conversations.</p>
              </div>
              <div className="space-y-6">
                <p className="text-base leading-8 text-text-mid">Our menu philosophy is simple: global comfort food with local soul. Every bite is layered with colour, spice, and balance—designed to be craveable from breakfast to late dinner.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Team" className="h-64 w-full rounded-[18px] object-cover" />
                  <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800" alt="Ambience" className="h-64 w-full rounded-[18px] object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-teal-dark py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="rounded-[24px] border border-white/10 bg-[#0E3B36]/90 p-8 text-left shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-magenta text-white shadow-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <p className="section-heading text-4xl font-black text-teal-dark md:text-5xl">A menu built to keep you coming back.</p>
                <p className="text-base leading-8 text-text-mid">Every ingredient, every recipe and every table setting is chosen to make your experience memorable and unmistakably Ohana.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { value: '3 Years', label: 'Open' },
                  { value: '200+', label: 'Menu Items' },
                  { value: '17', label: 'Categories' },
                  { value: '4.8★', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                    <p className="text-5xl font-black tracking-[-0.05em] text-magenta">{stat.value}</p>
                    <p className="mt-3 text-sm uppercase tracking-[0.2em] text-text-mid">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
};

export default About;
