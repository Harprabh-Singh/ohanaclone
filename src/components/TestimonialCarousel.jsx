import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const TestimonialCarousel = ({ testimonials }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setIndex((current) => (current + 1) % testimonials.length), 4500);
    return () => clearTimeout(timeout);
  }, [index, testimonials.length]);

  return (
    <div className="space-y-8 text-center text-white">
      <div className="mx-auto flex items-center justify-center gap-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-gold" />
        ))}
      </div>
      <p className="mx-auto max-w-3xl text-xl italic leading-9 text-white/90">“{testimonials[index].quote}”</p>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">{testimonials[index].name}</p>
      <div className="flex justify-center gap-2">
        {testimonials.map((_, dot) => (
          <button
            key={dot}
            onClick={() => setIndex(dot)}
            className={`h-3 w-3 rounded-full transition ${dot === index ? 'bg-magenta' : 'bg-white/30'}`}
            aria-label={`Show testimonial ${dot + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
