import { motion } from 'framer-motion';

const MenuItemCard = ({ item }) => {
  const labelColor = item.labels?.some((label) => label.includes('Spicy')) ? 'bg-magenta/95' : item.labels?.some((label) => label.includes('Ohana')) ? 'bg-gold/90 text-teal-dark' : 'bg-white/10';

  return (
    <motion.article whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute right-4 top-4 flex flex-wrap gap-2">
          {item.labels?.map((label) => (
            <span key={label} className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-dark">
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black tracking-[-0.03em]">{item.title}</h3>
          <span className="text-magenta font-bold">₹{item.price}</span>
        </div>
        <p className="text-sm leading-6 text-slate-600 line-clamp-2">{item.description}</p>
        {item.tags?.length ? (
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${item.tags.includes('veg') ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {item.tags.includes('veg') ? 'Veg' : 'Non-Veg'}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
};

export default MenuItemCard;
