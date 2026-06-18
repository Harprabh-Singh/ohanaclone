import { useState } from 'react';
import { Instagram, MapPin, Clock, Phone, Send } from 'lucide-react';
import SectionReveal from '../components/SectionReveal';

const Contact = () => {
  const [messageOpen, setMessageOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessageOpen(true);
    setTimeout(() => setMessageOpen(false), 3200);
  };

  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-dark via-teal-mid to-[#042924] text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),transparent_20%)]" />
        <div className="relative mx-auto flex min-h-[240px] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
          <h1 className="heading-display text-4xl font-black uppercase tracking-[-0.04em] md:text-5xl">Let's Talk. We Don't Bite (Much).</h1>
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cream py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[24px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3 text-magenta">
                  <MapPin className="h-6 w-6" />
                  <p className="text-sm uppercase tracking-[0.24em]">Find Us</p>
                </div>
                <p className="mt-4 text-lg font-black text-teal-dark">Above KFC, Gar-Ali, Jorhat, Assam 785001</p>
              </div>
              <div className="rounded-[24px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3 text-magenta">
                  <Clock className="h-6 w-6" />
                  <p className="text-sm uppercase tracking-[0.24em]">Hours</p>
                </div>
                <p className="mt-4 text-lg font-black text-teal-dark">Monday–Sunday · 11:00 AM – 10:00 PM</p>
              </div>
              <div className="rounded-[24px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3 text-magenta">
                  <Phone className="h-6 w-6" />
                  <p className="text-sm uppercase tracking-[0.24em]">Reach Out</p>
                </div>
                <p className="mt-4 text-lg font-black text-teal-dark">Click to call or chat on WhatsApp</p>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="bg-teal-mid py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="rounded-[24px] bg-[#163D38] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <div className="h-80 rounded-[20px] bg-[#0A2E2A] p-8 text-center text-white/80">
                  <p className="mt-28 text-lg font-semibold">📍 Google Maps Embed Goes Here</p>
                  <p className="mt-3 text-xs text-white/50">Replace this placeholder with the Google Maps iframe for Ohana Cafe Jorhat.</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
                  <h2 className="text-3xl font-black text-teal-dark">Send us a message</h2>
                  <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-teal-dark/80">
                        First Name
                        <input type="text" placeholder="First name" className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required />
                      </label>
                      <label className="space-y-2 text-sm text-teal-dark/80">
                        Last Name
                        <input type="text" placeholder="Last name" className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required />
                      </label>
                    </div>
                    <label className="space-y-2 text-sm text-teal-dark/80">
                      Email
                      <input type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required />
                    </label>
                    <label className="space-y-2 text-sm text-teal-dark/80">
                      Subject
                      <select className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required>
                        <option value="">Choose a subject</option>
                        <option>General Inquiry</option>
                        <option>Reservation</option>
                        <option>Event Booking</option>
                        <option>Feedback</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-teal-dark/80">
                      Message
                      <textarea rows="5" placeholder="Tell us what you'd like" className="w-full rounded-2xl border border-slate-200 bg-cream-dark px-4 py-3 outline-none" required />
                    </label>
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-magenta-dark">
                      <Send className="h-4 w-4" /> Send Message
                    </button>
                  </form>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <a href="https://instagram.com/ohana.jrt" className="rounded-[24px] bg-white p-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-teal-dark transition hover:text-magenta">
                    <Instagram className="mx-auto mb-2 h-6 w-6 text-magenta" /> Instagram
                  </a>
                  <a href="https://wa.me/919999999999" className="rounded-[24px] bg-white p-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-teal-dark transition hover:text-magenta">
                    <Phone className="mx-auto mb-2 h-6 w-6 text-magenta" /> WhatsApp
                  </a>
                  <a href="https://facebook.com" className="rounded-[24px] bg-white p-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-teal-dark transition hover:text-magenta">
                    <Phone className="mx-auto mb-2 h-6 w-6 text-magenta" /> Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
          {messageOpen && (
            <div className="fixed right-5 top-24 z-50 rounded-3xl bg-magenta px-6 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              Thanks! Your message is on its way.
            </div>
          )}
        </section>
      </SectionReveal>
    </main>
  );
};

export default Contact;
