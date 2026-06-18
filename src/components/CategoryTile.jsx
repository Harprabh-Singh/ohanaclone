import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryTile = ({ item, to, className }) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className={`group overflow-hidden rounded-[18px] shadow-[0_24px_50px_rgba(0,0,0,0.18)] ${className ?? ''}`}>
      <Link to={to} className="block h-full min-h-[220px] overflow-hidden rounded-[18px] bg-cover bg-center text-white" style={{ backgroundImage: `url(${item.image})` }}>
        <div className="h-full w-full bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end transition duration-300">
          <span className="inline-block h-0.5 w-0 bg-magenta transition-all duration-300 group-hover:w-10" />
          <p className="mt-4 text-[22px] font-black leading-tight tracking-[-0.02em]">{item.name}</p>
          <p className="mt-2 max-w-[85%] text-sm text-white/80">{item.tagline}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryTile;
