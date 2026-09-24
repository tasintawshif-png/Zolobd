import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';

interface BannerCarouselProps {
  banners: Banner[];
  onBannerClick?: (banner: Banner) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onBannerClick }) => {
  const activeBanners = banners.filter(b => b.enabled);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    // Min swipe distance 50px
    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (diff < -50) {
      setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const safeIndex = activeBanners.length > 0 ? currentIndex % activeBanners.length : 0;
  const currentBanner = activeBanners[safeIndex];

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-2 sm:mt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="group relative overflow-hidden rounded-xl sm:rounded-3xl shadow-sm sm:shadow-lg shadow-emerald-950/5 aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/8] min-h-[120px] sm:min-h-[200px] md:min-h-[260px] bg-slate-900">
        
        {/* Banner Images with Crossfade */}
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out cursor-pointer ${
              index === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            onClick={() => onBannerClick && onBannerClick(banner)}
          >
            <img
              src={banner.image}
              alt={banner.title || 'Promotional Banner'}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradient Overlay - ONLY if title or subtitle exists */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center">
                <div className="p-4 sm:p-10 md:p-14 max-w-xl text-white">
                  {banner.title && (
                    <h2 className="text-base sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md text-white line-clamp-2">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-base text-slate-200 line-clamp-2 font-medium drop-shadow">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.linkType !== 'none' && (
                    <div className="mt-2 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm shadow-md transition-transform active:scale-95">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Previous / Next Arrows - Subtle / Hide Type */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/20 hover:bg-black/50 text-white/60 hover:text-white rounded-full backdrop-blur-xs transition-all opacity-25 group-hover:opacity-75 hover:!opacity-100 active:scale-90 cursor-pointer"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/20 hover:bg-black/50 text-white/60 hover:text-white rounded-full backdrop-blur-xs transition-all opacity-25 group-hover:opacity-75 hover:!opacity-100 active:scale-90 cursor-pointer"
              aria-label="Next banner"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === safeIndex ? 'w-6 sm:w-8 bg-emerald-400' : 'w-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
