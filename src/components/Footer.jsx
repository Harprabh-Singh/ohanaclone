import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-teal-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-magenta" />
            <p className="heading-display text-3xl uppercase tracking-[0.02em]">OHANA</p>
          </div>
          <p className="max-w-sm text-sm text-white/70">Cafe Kitchen & Terraces, Jorhat</p>
          <p className="text-xs text-white/50">Above KFC, Gar-Ali, Jorhat, Assam</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-white/75">Quick links</p>
          <div className="grid gap-2 text-sm text-white/70">
            {['Home', 'Menu', 'Gallery', 'About', 'Reservations', 'Contact'].map((item) => (
              <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}` } className="transition hover:text-magenta">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-white/75">Hours</p>
          <p className="text-sm text-white/70">Mon–Sun · 11:00 AM – 10:00 PM</p>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4 text-magenta" />
            Above KFC, Gar-Ali, Jorhat, Assam
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-white/75">Follow Us</p>
          <div className="space-y-3 text-sm text-white/70">
            <a href="https://instagram.com/ohana.jrt" className="inline-flex items-center gap-2 hover:text-magenta">
              <Instagram className="h-4 w-4" /> @ohana.jrt
            </a>
            <a href="https://wa.me/919999999999" className="inline-flex items-center gap-2 hover:text-magenta">
              <Phone className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <Link className="inline-flex w-fit rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-magenta hover:text-magenta" to="/reservations">
            Reserve a Table
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 bg-teal-mid py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 text-xs text-white/40 md:flex-row md:justify-between lg:px-8">
          <span>© 2025 Ohana Cafe Kitchen & Terraces. All rights reserved.</span>
          <span>Made with ♥ in Jorhat</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
