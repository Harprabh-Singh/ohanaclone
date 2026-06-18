const HeroParticles = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-10 top-20 h-8 w-8 rounded-full bg-magenta/25 blur-xl animate-wave" />
      <div className="absolute right-16 top-28 h-10 w-10 rounded-full bg-gold/20 blur-2xl" />
      <div className="absolute left-1/2 top-24 h-5 w-5 rounded-full bg-white/30 blur-sm" />
      <div className="absolute right-24 bottom-24 h-6 w-6 rounded-full bg-magenta/20 blur-sm" />
      <div className="absolute left-24 bottom-28 h-8 w-8 rounded-full bg-white/10 blur-xl" />
    </div>
  );
};

export default HeroParticles;
