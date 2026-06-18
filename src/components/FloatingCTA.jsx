import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';

const FloatingCTA = () => {
  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-40 md:bottom-8">
      <AnimatePresence initial={false}>
        <motion.div
          className="pointer-events-auto flex flex-col items-end gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(196,45,120,0.22)] transition hover:bg-magenta-dark"
            whileHover={{ y: -4 }}
          >
            Reserve <ArrowRight className="h-4 w-4" />
          </motion.a>
          <motion.a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_rgba(37,211,102,0.25)] transition hover:scale-105"
            whileHover={{ y: -4 }}
          >
            <MessageCircle className="h-6 w-6" />
          </motion.a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FloatingCTA;
