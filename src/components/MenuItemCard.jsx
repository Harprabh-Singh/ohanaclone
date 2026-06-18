import { motion } from 'framer-motion';

const dietDot = (tags) => {
  if (!tags?.length) return null;
  const isVeg = tags.includes('veg');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
        isVeg
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {isVeg ? 'Veg' : 'Non-Veg'}
    </span>
  );
};

const MenuItemCard = ({ item }) => {
  const isOhanaSpecial = item.labels?.some((l) => l.toLowerCase().includes('ohana'));
  const isSpicy        = item.labels?.some((l) => l.toLowerCase().includes('spicy'));

  return (
    <motion.article
      whileHover={{ y: -5, boxShadow: '0 24px 60px rgba(15,21,19,0.13)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(15,21,19,0.07)] ring-1 ring-slate-100"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-100 aspect-[4/3]">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Labels */}
        {item.labels?.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {item.labels.map((label) => (
              <span
                key={label}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm ${
                  label.toLowerCase().includes('spicy')
                    ? 'bg-magenta/90 text-white'
                    : label.toLowerCase().includes('ohana')
                    ? 'bg-gold/90 text-teal-dark'
                    : 'bg-white/90 text-slate-700'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Price badge bottom right on image */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-sm font-black text-magenta shadow-sm">
            ₹{item.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[0.95rem] font-black leading-snug tracking-[-0.02em] text-slate-900 line-clamp-2">
            {item.title}
          </h3>
          {/* Ohana special star */}
          {isOhanaSpecial && (
            <span className="flex-shrink-0 text-gold text-base" title="Ohana Special">★</span>
          )}
        </div>

        {item.description && (
          <p className="text-xs leading-5 text-slate-500 line-clamp-2">{item.description}</p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
          {dietDot(item.tags)}
          {isSpicy && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              🌶 Spicy
            </span>
          )}
        </div>
      </div>

      {/* Hover accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-magenta to-[#3ca089] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.article>
  );
};

export default MenuItemCard;