import { useState } from 'react';
import { galleryImages } from '../data/galleryImages';
import Lightbox from '../components/Lightbox';
import './Gallery.css';

const descriptions = {
  Interior: 'Step inside our warm, carefully designed space — where every corner tells a story of comfort and character.',
  Terrace: 'Dine under the open sky on our lush terrace, where the breeze meets the aroma of fresh cuisine.',
  Food: 'From garden-fresh salads to indulgent mains — every plate crafted with passion and premium ingredients.',
};

const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <main className="gallery-page">
      {/* Hero Header */}
      <section className="pt-28 pb-16 text-center px-5">
        <p className="section-heading text-5xl md:text-7xl font-black text-[#eebb4d] tracking-wide uppercase mb-4">
          Ohana Gallery
        </p>
        <p className="text-white/50 uppercase tracking-[0.3em] text-xs md:text-sm">
          Scroll to explore our story
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#eebb4d66] to-transparent" />
      </section>

      {/* Timeline */}
      <div className="main-timeline">
        {galleryImages.map((img, index) => {
          const isLeft = index % 2 === 0;
          return (
            <div
              key={index}
              className={`tl-item ${isLeft ? 'tl-left' : 'tl-right'}`}
            >
              <div
                className="tl-card cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="tl-img-wrap">
                  <img
                    src={img.src}
                    alt={img.label}
                    className="tl-img"
                    loading="lazy"
                  />
                </div>
                <div className="tl-card-body">
                  <p className="tl-category">{img.category}</p>
                  <p className="tl-label">{img.label}</p>
                  <p className="tl-description">
                    {descriptions[img.category] || 'A glimpse of the Ohana experience.'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom rule */}
      <div className="mx-auto mt-16 h-px max-w-md bg-gradient-to-r from-transparent via-[#eebb4d55] to-transparent" />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  );
};

export default Gallery;
