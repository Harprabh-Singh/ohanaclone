import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

const SignatureCarousel = ({ items }) => {
  const [position, setPosition] = useState(0);
  const rowRef = useRef(null);

  const handleScroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div ref={rowRef} className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
        {items.map((dish) => (
          <motion.div key={dish.name} whileHover={{ y: -8 }} className="min-w-[260px] flex-shrink-0 overflow-hidden rounded-[20px] bg-teal-card shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
            <div className="h-[204px] overflow-hidden">
              <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 bg-teal-card p-5 text-white">
              {dish.badge && <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-dark">{dish.badge}</span>}
              <h3 className="text-lg font-black tracking-[-0.03em]">{dish.name}</h3>
              <p className="text-sm leading-6 text-white/70">{dish.description}</p>
              <p className="text-[18px] font-bold text-magenta">₹{dish.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <button onClick={() => handleScroll('left')} className="absolute left-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => handleScroll('right')} className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SignatureCarousel;
