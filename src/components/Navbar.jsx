import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, ChevronDown, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setSolid(window.scrollY > 80 || location.pathname !== '/');
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navBg = 'bg-[rgba(14,59,54,0.95)] backdrop-blur-xl border-b border-white/10 shadow-black/10';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-magenta text-[10px] text-white">●</span>
          <div className="leading-none">
            <p className="heading-display text-white text-[26px] uppercase tracking-[0.02em]">OHANA</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">Cafe Kitchen & Terraces</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group relative font-semibold text-sm transition duration-300 ${active ? 'text-white' : 'text-white/80 hover:text-white'}`}
              >
                {item.label}
                <span className={`absolute left-0 -bottom-1 h-[2px] bg-magenta transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to="/reservations"
            className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(196,45,120,0.25)] transition hover:bg-magenta-dark"
          >
            Reserve a Table →
          </Link>
        </div>

        <button onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 lg:hidden">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[rgba(14,59,54,0.98)] px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href} className="rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                {item.label}
              </Link>
            ))}
            <Link to="/reservations" className="rounded-full bg-magenta px-4 py-3 text-sm font-semibold text-white transition hover:bg-magenta-dark">
              Reserve a Table →
            </Link>
          </div>
        </div>
      )}

      {location.pathname === '/' && (
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl items-center justify-between px-5 pb-4 md:px-8">
          
          
        </div>
      )}
    </header>
  ); 
};

export default Navbar;
