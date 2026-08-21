import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuCategory from './pages/MenuCategory';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Reservations from './pages/Reservations';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.45, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

/* Route changes must start at the top of the new page — React Router keeps
   the previous scroll position by default, so deep-scrolling the home hero
   and then opening About/Menu/etc. used to land halfway down the page.
   (Menu's ?flip= deep-links still win: they scrollIntoView after mount.) */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-cream text-text-dark">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
          <Route path="/menu/:category" element={<PageTransition><MenuCategory /></PageTransition>} />
          <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/reservations" element={<PageTransition><Reservations /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
      {location.pathname !== '/menu' && !isAdmin && <Footer />}
    </div>
  );
}

export default App;
