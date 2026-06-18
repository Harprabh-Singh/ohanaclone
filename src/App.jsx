import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingCTA from './components/FloatingCTA';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuCategory from './pages/MenuCategory';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Reservations from './pages/Reservations';
import Contact from './pages/Contact';

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

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream text-text-dark">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
          <Route path="/menu/:category" element={<PageTransition><MenuCategory /></PageTransition>} />
          <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/reservations" element={<PageTransition><Reservations /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default App;
