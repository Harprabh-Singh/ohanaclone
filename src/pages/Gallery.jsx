import { useMemo, useState } from 'react';
import Lightbox from '../components/Lightbox';
import SectionReveal from '../components/SectionReveal';
import { galleryImages } from '../data/galleryImages';

const filters = ['All', 'Food', 'Interior', 'Terrace'];

const Gallery = () => {
  const [active, setActive] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = useMemo(() => {
    return active === 'All' ? galleryImages : galleryImages.filter((image) => image.category === active);
  }, [active]);

  return (
    <main className="pt-24">
      <section className="bg-teal-dark py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
          <p className="section-heading text-4xl font-black md:text-5xl">A Table With A View.</p>
          <p className="mt-4 mx-auto max-w-2xl text-base leading-8 text-white/70 md:text-lg">Real food, real space, real evenings.</p>
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cream py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-8 flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${active === filter ? 'bg-magenta text-white' : 'border border-slate-300 bg-white text-teal-dark'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="columns-1 gap-4 md:columns-2 xl:columns-4">
              {images.map((image, index) => (
                <button
                  key={image.src + index}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="mb-4 block w-full overflow-hidden rounded-[18px] bg-slate-100 text-left shadow-[0_24px_50px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)]"
                >
                  <img src={image.src} alt={image.label} className="w-full object-cover transition duration-500 hover:scale-105" />
                  <div className="p-4 text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-dark">{image.category}</p>
                    <p className="mt-2 text-lg font-black text-teal-dark">{image.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {lightboxIndex !== null && (
        <Lightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </main>
  );
};

export default Gallery;
