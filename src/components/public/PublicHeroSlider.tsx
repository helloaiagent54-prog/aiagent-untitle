import React, { useState, useEffect, useRef } from 'react';
import { HeroSlide } from '../../types';
import { apiRequest } from '../../services/api';
import { SafeLink } from '../common/SafeLink';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PublicHeroSliderProps {
  fallbackSlides?: HeroSlide[];
  autoplayIntervalMs?: number;
}

export const PublicHeroSlider: React.FC<PublicHeroSliderProps> = ({
  fallbackSlides = [],
  autoplayIntervalMs = 5000,
}) => {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    apiRequest('/hero-slides/public')
      .then((res) => {
        if (!isMounted) return;
        setIsLoading(false);
        if (res.success && res.slides && res.slides.length > 0) {
          setSlides(res.slides);
        } else if (fallbackSlides.length > 0) {
          setSlides(fallbackSlides);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Autoplay handler
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, autoplayIntervalMs]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (isLoading && slides.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="w-full aspect-21/9 sm:aspect-24/9 rounded-3xl bg-slate-900 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured Hero Slider"
    >
      {/* Slide Image Container - Strictly Image Only, Zero Text Overlays */}
      <div className="relative w-full aspect-16/7 sm:aspect-21/8 lg:aspect-24/8 rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const hasLink = !!slide.destinationUrl && slide.destinationUrl.trim() !== '';

          const imageElement = (
            <picture className="w-full h-full block">
              {slide.mobileImage && (
                <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
              )}
              <img
                src={slide.desktopImage}
                alt={slide.title || 'Storefront Showcase'}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center select-none"
                referrerPolicy="no-referrer"
              />
            </picture>
          );

          return (
            <div
              key={slide._id || slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {hasLink ? (
                <SafeLink
                  to={slide.destinationUrl}
                  target={slide.target || '_self'}
                  className="block w-full h-full cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-blue-500/50"
                  title={slide.title}
                >
                  {imageElement}
                </SafeLink>
              ) : (
                <div className="w-full h-full cursor-default">{imageElement}</div>
              )}
            </div>
          );
        })}

        {/* Previous & Next Controls (only if more than 1 slide) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Hero Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Hero Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all rounded-full cursor-pointer backdrop-blur-sm ${
                  dotIdx === currentIndex
                    ? 'w-7 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
