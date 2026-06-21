import { useMemo } from 'react';

/* Deterministic pseudo-random so particles don't re-shuffle on every re-render */
const seeded = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const PARTICLE_COUNT = 22;

const HeroParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const left      = seeded(i * 1.1) * 100;
      const size       = 2 + seeded(i * 2.3) * 5;
      const duration  = 14 + seeded(i * 3.7) * 16;
      const delay      = -seeded(i * 4.9) * 30;
      const drift       = (seeded(i * 5.3) - 0.5) * 60;
      const opacity    = 0.25 + seeded(i * 6.1) * 0.45;
      const isGold     = seeded(i * 7.7) > 0.6;
      return { id: i, left, size, duration, delay, drift, opacity, isGold };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large soft ambient glows — slow independent drift, gives depth */}
      <div className="hero-glow hero-glow--1" />
      <div className="hero-glow hero-glow--2" />
      <div className="hero-glow hero-glow--3" />

      {/* Drifting ember/light-mote field */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`hero-particle ${p.isGold ? 'hero-particle--gold' : 'hero-particle--white'}`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

export default HeroParticles;