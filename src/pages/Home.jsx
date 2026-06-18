import { Link } from 'react-router-dom';
import { ArrowRight, Instagram as InstagramIcon, MapPin, Clock, Phone } from 'lucide-react';
import SectionReveal from '../components/SectionReveal';
import HeroParticles from '../components/HeroParticles';
import SignatureCarousel from '../components/SignatureCarousel';
import TestimonialCarousel from '../components/TestimonialCarousel';
import ScrollIndicator from '../components/ScrollIndicator';
import PalateShowcase from '../components/PalateShowcase';
import { testimonials } from '../data/testimonials';

const instagramTiles = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
];

const signatureDishes = [
  {
    name: 'Dragon Fiery Chicken Wings',
    description: "The kind of heat you'll crave again tomorrow",
    price: 280,
    badge: '🌶 Spicy',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  },
  {
    name: 'Tandoori Chicken Sausage Pizza',
    description: 'Tandoor meets Naples, Ohana style',
    price: 320,
    badge: '★ Ohana Special',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  },
  {
    name: 'Ohana Chunky Shake',
    description: 'Thick, cold, devastating',
    price: 180,
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800',
  },
  {
    name: 'Grilled Chicken Club Sandwich',
    description: 'Triple-decker done properly',
    price: 220,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
  },
  {
    name: 'Veg Momos (8 pcs)',
    description: 'Steamed or fried. Both right answers.',
    price: 140,
    badge: '🌶 Spicy',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  },
  {
    name: 'Death By Chocolate Brownie',
    description: 'With vanilla ice cream. You know what to do.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1527515637460-70b57f533338?w=800',
  },
];

const Home = () => {
  return (
    <main className="relative overflow-hidden">
      <section className="relative min-h-[760px] overflow-hidden bg-teal-dark text-white md:min-h-[820px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600)' }}
          data-replace-image="Replace with hero terrace/dining photo, golden hour, 1600x900 minimum"
        />
        <div className="absolute inset-0 bg-scrim" />
        <HeroParticles />
        <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col justify-center px-5 py-20 text-center md:min-h-[820px] md:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <p className="label-uppercase text-sm tracking-[0.24em] text-gold">Ohana Cafe Kitchen & Terraces</p>
            <h1 className="heading-display text-5xl uppercase leading-tight tracking-[-0.04em] text-white md:text-7xl lg:text-8xl">
              Terrace dining with a warm, global twist.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Above KFC, Gar-Ali in Jorhat. Breakfast through late dinner, multi-cuisine comfort food served under string lights, with tropical warmth and cinematic flavour.
            </p>
            <div className="mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/menu" className="inline-flex items-center justify-center rounded-full bg-magenta px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_rgba(196,45,120,0.28)] transition hover:bg-magenta-dark">
                View Menu
              </Link>
              <Link to="/reservations" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-magenta hover:text-magenta">
                Reserve a Table
              </Link>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
              <Link to="/reservations" className="inline-flex items-center justify-center rounded-full bg-magenta px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_rgba(196,45,120,0.28)] transition hover:bg-magenta-dark">
                Reserve Now
              </Link>
              <ScrollIndicator />
            </div>
          </div>
        </div>
      </section>

      <PalateShowcase />

      <SectionReveal>
        <section className="bg-teal-mid py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex flex-col gap-6 md:items-start md:justify-between md:flex-row">
              <div>
                <p className="uppercase tracking-[0.22em] text-sm text-gold">House Favourites</p>
                <h2 className="section-heading mt-4 text-4xl font-black leading-tight md:text-5xl">A few things people always come back for.</h2>
              </div>
            </div>
            <div className="mt-10">
              <SignatureCarousel items={signatureDishes} />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:px-8">
            <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
              <img src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800" alt="Story" className="h-full w-full min-h-[380px] object-cover" />
            </div>
            <div className="relative flex flex-col justify-center gap-6">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-magenta">Our Story</span>
              <h2 className="section-heading text-4xl font-black leading-tight text-teal-dark md:text-5xl">More Than A Meal. It's A Feeling.</h2>
              <div className="space-y-4 text-base leading-8 text-text-mid md:text-lg">
                <p>Ohana means family, and every plate we send out is served with the same warmth. The terrace above Gar-Ali is designed for long evenings, conversation, and the golden-hour glow.</p>
                <p>From tropical breakfasts to late-night dinner plates, our kitchen blends global comfort flavours with local ingredients, all in a space that feels intimate and elevated.</p>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-magenta font-semibold transition hover:underline">
                Read Our Story →
              </Link>
              <div className="pointer-events-none absolute -right-10 top-10 hidden h-72 w-72 rounded-full bg-magenta/10 blur-3xl md:block" />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-teal-dark py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center">
              <p className="section-heading text-4xl font-black md:text-5xl">Regulars Say It Best.</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.24em] text-gold">4.8 out of 5 across 200+ visits</p>
            </div>
            <div className="mt-12">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center">
              <p className="section-heading text-3xl font-black text-teal-dark md:text-4xl">Find Us On Instagram</p>
              <p className="mt-4 text-lg font-semibold text-magenta">@ohana.jrt</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {instagramTiles.map((src, index) => (
                <div key={index} className="group relative overflow-hidden rounded-[18px] bg-slate-100 text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                  <img src={src} alt={`Instagram ${index + 1}`} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-magenta/0 transition duration-300 group-hover:bg-magenta/60" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="flex flex-col items-center gap-2 rounded-3xl bg-black/50 px-4 py-3 backdrop-blur-sm">
                      <InstagramIcon className="h-5 w-5 text-white" />
                      <span className="text-sm uppercase tracking-[0.18em] text-white">View Post</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="https://instagram.com/ohana.jrt" className="inline-flex items-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white transition hover:bg-magenta-dark">
                Follow @ohana.jrt
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-teal-mid py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <MapPin className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Address</p>
                <p className="mt-3 text-sm text-white/80">Above KFC, Gar-Ali, Jorhat, Assam</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <Clock className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Hours</p>
                <p className="mt-3 text-sm text-white/80">Mon–Sun · 11:00 AM – 10:00 PM</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-[#0E3B36]/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <Phone className="mx-auto h-8 w-8 text-magenta" />
                <p className="mt-6 text-lg font-black">Quick Contact</p>
                <p className="mt-3 text-sm text-white/80">Tap to call or message us on WhatsApp</p>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-magenta hover:text-magenta">
                Get Full Details →
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
};

export default Home;
