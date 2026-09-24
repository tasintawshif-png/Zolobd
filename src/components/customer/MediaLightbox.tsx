import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductMediaItem } from '../../types';

interface MediaLightboxProps {
  media: ProductMediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onSelectIndex((currentIndex === 0 ? media.length - 1 : currentIndex - 1));
      }
      if (e.key === 'ArrowRight') {
        onSelectIndex((currentIndex + 1) % media.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, media.length, onClose, onSelectIndex]);

  if (!isOpen || media.length === 0) return null;

  const currentItem = media[currentIndex] || media[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs sm:text-sm font-semibold text-slate-300">
          {currentIndex + 1} / {media.length}
        </span>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main View Area */}
      <div
        className="relative flex-1 flex items-center justify-center my-2 max-w-5xl mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {currentItem.type === 'video' ? (
          <video
            src={currentItem.url}
            controls
            playsInline
            className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl"
          />
        ) : (
          <img
            src={currentItem.url}
            alt={currentItem.title || 'Product zoom'}
            className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
          />
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => onSelectIndex(currentIndex === 0 ? media.length - 1 : currentIndex - 1)}
              className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => onSelectIndex((currentIndex + 1) % media.length)}
              className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {media.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => onSelectIndex(idx)}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex ? 'border-emerald-400 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
                  VIDEO
                </div>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
