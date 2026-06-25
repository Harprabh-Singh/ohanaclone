import { useEffect, useRef } from 'react';
import './FlatGallery.css';

export default function FlatGallery({ items = [], height = 420, cardWidth = 300, borderRadius = 20 }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    // Drag to scroll + wheel horizontal scroll + simple momentum
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let rafId = null;

    function onDown(e) {
      isDown = true;
      node.classList.add('is-dragging');
      startX = (e.pageX || e.touches?.[0]?.pageX) || 0;
      startScroll = node.scrollLeft;
      lastX = startX;
      lastTime = performance.now();
      velocity = 0;
    }

    function onMove(e) {
      if (!isDown) return;
      const x = (e.pageX || e.touches?.[0]?.pageX) || 0;
      const dx = x - startX;
      node.scrollLeft = startScroll - dx;

      const now = performance.now();
      const dt = now - lastTime || 16;
      velocity = (x - lastX) / dt; // px per ms
      lastX = x;
      lastTime = now;
    }

    function onUp() {
      if (!isDown) return;
      isDown = false;
      node.classList.remove('is-dragging');
      // start momentum
      const friction = 0.95;
      const step = () => {
        velocity *= friction;
        if (Math.abs(velocity) < 0.001) {
          cancelAnimationFrame(rafId);
          rafId = null;
          return;
        }
        node.scrollLeft -= velocity * 16; // apply per frame (~16ms)
        rafId = requestAnimationFrame(step);
      };
      if (Math.abs(velocity) >= 0.001) rafId = requestAnimationFrame(step);
    }

    function onWheel(e) {
      // Prefer horizontal scrolling within the gallery when cursor is over it
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        // translate vertical wheel to horizontal scroll
        node.scrollLeft += e.deltaY * 1.5;
        e.preventDefault();
      } else {
        node.scrollLeft += e.deltaX;
        e.preventDefault();
      }
      // set velocity for small momentum on wheel end
      velocity = (e.deltaY || e.deltaX) * 0.02;
    }

    node.addEventListener('mousedown', onDown);
    node.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    node.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      node.removeEventListener('mousedown', onDown);
      node.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      node.removeEventListener('wheel', onWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="flat-gallery-viewport" style={{ height }}>
      <div className="flat-gallery-track" ref={trackRef}>
        {items.map((it, i) => (
          <div className="flat-gallery-card" key={i} style={{ width: cardWidth, borderRadius, height: '100%' }}>
            <div className="flat-gallery-media" style={{ borderRadius }}>
              <img src={it.image} alt={it.text || `item-${i}`} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'}} />
            </div>
            <div className="flat-gallery-title">{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
