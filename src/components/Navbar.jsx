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

  const navBg = 'bg-[#000] border-b border-[#E24F33]/30 shadow-black/10 transition-all duration-500';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-1 min-[701px]:py-1.5 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          {/* Universal Logo */}
          <div className="flex flex-col items-center gap-[0.1em]">
            <svg className="w-[22px] h-[22px] text-[#eebb4d] -mb-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21v-7"/>
              <path d="M12 14c-2.5-2.5-6-1.5-6 2.5 0 2.5 2.5 3.5 6 1.5"/>
              <path d="M12 14c2.5-2.5 6-1.5 6 2.5 0 2.5-2.5 3.5-6 1.5"/>
              <path d="M12 14c-1.5-3.5 0-6 2.5-6 2.5 0 3.5 2.5 1.5 6"/>
            </svg>
            <strong className="text-[#E24F33] font-['Playfair_Display'] text-[28px] tracking-tight leading-none font-bold">Ohana.</strong>
            <span className="flex items-center justify-center text-[#E24F33] text-[9px] tracking-[0.15em] font-medium font-['DM_Sans'] uppercase">
              <span className="mx-1 font-light">—</span>
              Kitchen & Café
              <span className="mx-1 font-light">—</span>
            </span>
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
                <span className={`absolute left-0 -bottom-1 h-[2px] bg-[#E24F33] transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to="/reservations"
            className="rounded-full border border-[#eebb4d] bg-transparent text-[#eebb4d] px-6 py-2 text-[11px] font-bold tracking-[0.15em] uppercase transition hover:bg-[#eebb4d] hover:text-black"
          >
            Reserve a Table
          </Link>
        </div>

        <button onClick={() => setMenuOpen((open) => !open)} className="inline-flex items-center justify-center lg:hidden focus:outline-none">
          <div className="flex items-center gap-2 text-[#E24F33]">
            {menuOpen ? (
              <X className="h-7 w-7 stroke-[1.5]" />
            ) : (
              <div className="flex flex-col gap-[5px]">
                <span className="w-[22px] h-[1.5px] bg-[#E24F33] block rounded-full"></span>
                <span className="w-[22px] h-[1.5px] bg-[#E24F33] block rounded-full"></span>
                <span className="w-[22px] h-[1.5px] bg-[#E24F33] block rounded-full"></span>
              </div>
            )}
            <ChevronDown className={`h-[14px] w-[14px] stroke-[2.5] transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-[#E24F33]/30 bg-[#000] px-5 py-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href} className="rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-[#E24F33]">
                {item.label}
              </Link>
            ))}
            <Link to="/reservations" className="rounded-full border border-[#eebb4d] text-[#eebb4d] px-4 py-3 text-sm font-bold tracking-widest text-center uppercase transition hover:bg-[#eebb4d] hover:text-black">
              Reserve a Table
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
