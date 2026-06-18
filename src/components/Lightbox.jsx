import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setCurrent((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setCurrent((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  useEffect(() => setCurrent(startIndex), [startIndex]);

  const onSwipe = (startX, endX) => {
    if (startX - endX > 50) setCurrent((i) => (i + 1) % images.length);
    if (endX - startX > 50) setCurrent((i) => (i - 1 + images.length) % images.length);
  };

  const [touchStart, setTouchStart] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button onClick={onClose} className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
      <button onClick={() => setCurrent((i) => (i - 1 + images.length) % images.length)} className="absolute left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={() => setCurrent((i) => (i + 1) % images.length)} className="absolute right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex">
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)]" onTouchStart={(e) => setTouchStart(e.touches[0].clientX)} onTouchEnd={(e) => onSwipe(touchStart, e.changedTouches[0].clientX)}>
        <img src={images[current].src} alt={images[current].label} className="h-[90vh] w-[90vw] object-contain" />
        <div className="bg-black/70 px-6 py-4 text-center text-sm text-white/80">{images[current].label}</div>
      </div>
    </div>
  );
};

export default Lightbox;
