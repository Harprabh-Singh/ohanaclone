import { ChevronDown } from 'lucide-react';

const ScrollIndicator = () => {
  return (
    <div className="mt-10 inline-flex flex-col items-center gap-2 text-white/90 md:hidden">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 animate-bounce-slow">
        <ChevronDown className="h-5 w-5" />
      </div>
      <span className="text-xs uppercase tracking-[0.24em] text-white/80">Scroll to explore</span>
    </div>
  );
};

export default ScrollIndicator;
