import { useEffect, useRef } from 'react';

export default function useMouseParallax(rootRef) {
  const mouse  = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf    = useRef(null);

  useEffect(() => {
    // Disable completely on mobile/touch devices to save performance
    if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
      return undefined;
    }

    const root = rootRef.current;
    if (!root) return undefined;

    const updateFromPoint = (clientX, clientY) => {
      const rect = root.getBoundingClientRect();
      target.current.x =  ((clientX - rect.left) / rect.width  - 0.5) * 2;
      target.current.y = -((clientY - rect.top)  / rect.height - 0.5) * 2;
    };

    const onMove  = (e) => updateFromPoint(e.clientX, e.clientY);
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    const tick = () => {
      mouse.current.x += (target.current.x - mouse.current.x) * 0.075;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.075;
      root.style.setProperty('--oh3-mx', `${mouse.current.x}`);
      root.style.setProperty('--oh3-my', `${mouse.current.y}`);

      const needsMore = Math.abs(mouse.current.x - target.current.x) > 0.0005 ||
        Math.abs(mouse.current.y - target.current.y) > 0.0005;

      raf.current = needsMore ? requestAnimationFrame(tick) : null;
    };

    const scheduleTick = () => {
      if (!raf.current) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    root.addEventListener('pointermove', (event) => {
      onMove(event);
      scheduleTick();
    }, { passive: true });
    root.addEventListener('pointerleave', onLeave);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [rootRef]);

  return mouse;
}
