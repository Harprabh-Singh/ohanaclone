import { useState } from 'react';
import SectionReveal from '../components/SectionReveal';

const times = Array.from({ length: 20 }, (_, index) => {
  const hour = 11 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour <= 12 ? hour : hour - 12;
  return `${displayHour}:${minute} ${period}`;
});

const Reservations = () => {
  const [toastOpen, setToastOpen] = useState(false);
  const [formState, setFormState] = useState({ date: '', time: '', size: '2', name: '', phone: '', requests: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3200);
  };

  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1600)' }}>
        <div className="absolute inset-0 bg-scrim" />
        <div className="relative mx-auto flex min-h-[340px] max-w-7xl items-center px-5 text-white md:px-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-gold">Book Your Terrace Table</p>
            <h1 className="heading-display text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">Book Your Terrace Table</h1>
            <p className="max-w-2xl text-base leading-8 text-white/80 md:text-lg">Walk-ins welcome. Reservations guaranteed.</p>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:px-8">
            <div className="space-y-8">
              <div className="rounded-[24px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                <p className="text-sm uppercase tracking-[0.24em] text-magenta">About Terrace Booking</p>
                <h2 className="mt-4 text-3xl font-black text-teal-dark">A relaxed rooftop experience with extra care.</h2>
                <p className="mt-5 text-base leading-8 text-text-mid">Reserve your favourite evening table on the terrace, where the city lights blend with aromatic food, fresh air, and easy conversations.</p>
                <ul className="mt-8 space-y-4 text-text-mid">
                  <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-magenta" /> Private bookings available</li>
                  <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-magenta" /> Group tables up to 20</li>
                  <li className="flex items-start gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-magenta" /> Special occasion arrangements</li>
                </ul>
              </div>
            </div>
            <div className="relative rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
              <p className="text-sm uppercase tracking-[0.24em] text-teal-dark/60">Book now</p>
              <h2 className="mt-3 text-3xl font-black text-teal-dark">Reserve a table</h2>
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-teal-dark/80">
                    Date
                    <input type="date" value={formState.date} onChange={(e) => setFormState({ ...formState, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required />
                  </label>
                  <label className="space-y-2 text-sm text-teal-dark/80">
                    Time
                    <select value={formState.time} onChange={(e) => setFormState({ ...formState, time: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required>
                      <option value="">Select a slot</option>
                      {times.map((time) => (<option key={time} value={time}>{time}</option>))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-teal-dark/80">
                    Party size
                    <select value={formState.size} onChange={(e) => setFormState({ ...formState, size: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none">
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (<option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>))}
                      <option value="20+">20+ people</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-teal-dark/80">
                    Name
                    <input type="text" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" placeholder="Your name" required />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-teal-dark/80">
                  Phone
                  <input type="tel" value={formState.phone} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" placeholder="+91 9XXXXXXXXX" required />
                </label>
                <label className="space-y-2 text-sm text-teal-dark/80">
                  Special requests
                  <textarea value={formState.requests} onChange={(e) => setFormState({ ...formState, requests: e.target.value })} className="h-32 w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" placeholder="Any dietary notes or celebration details" />
                </label>
                <button type="submit" className="w-full rounded-full bg-magenta px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-magenta-dark">
                  Request Reservation
                </button>
              </form>
              <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#0E3B36] px-5 py-4 text-white shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-magenta text-white">☎</span>
                <div>
                  <p className="font-semibold">Or call us directly</p>
                  <p className="text-sm text-white/70">+91 99999 99999</p>
                </div>
              </div>
            </div>
          </div>
          {toastOpen && (
            <div className="fixed right-5 top-24 z-50 rounded-3xl bg-magenta px-6 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              We'll confirm via WhatsApp shortly! 🎉
            </div>
          )}
        </section>
      </SectionReveal>
    </main>
  );
};

export default Reservations;
