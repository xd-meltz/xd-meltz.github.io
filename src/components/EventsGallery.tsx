import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, ChevronLeft, ChevronRight, Eye, Maximize2 } from 'lucide-react';
import { getShuffledPhoto, ALL_DRIVE_PHOTOS } from '../lib/backgroundPhotos';

export default function EventsGallery() {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);

  const upcomingEventsBgPhoto = getShuffledPhoto(5);
  const galleryBgPhoto = getShuffledPhoto(6);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
        setActiveEventIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when any lightbox modal is open
  useEffect(() => {
    if (activeLightboxIndex !== null || activeEventIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeLightboxIndex, activeEventIndex]);

  // All 20 photos from the user's Google Drive folder
  const galleryImages = ALL_DRIVE_PHOTOS;

  type EventItem = {
    imgUrl: string;
    title: string;
    badge: string;
  };

  const upcomingEvents: EventItem[] = [
    {
      imgUrl: "https://lh3.googleusercontent.com/d/1T1wcEUFgq5E6Gg4_SAw0wh7dvJhpCW-K",
      title: "Track Showcase Flyer",
      badge: "Featured Event"
    }
  ];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(
      activeLightboxIndex === 0 ? galleryImages.length - 1 : activeLightboxIndex - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(
      activeLightboxIndex === galleryImages.length - 1 ? 0 : activeLightboxIndex + 1
    );
  };

  return (
    <div className="relative text-white">
      
      {/* 1. Upcoming Events */}
      <section id="events" className="relative py-6 sm:py-12 border-b border-zinc-800 text-white scroll-mt-14 overflow-hidden">
        {/* Background photo from Google Drive - optimized without backdrop blur */}
        <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
          <img 
            src={upcomingEventsBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
          
          {/* Header */}
          <div className="mb-4 sm:mb-8 text-center sm:text-left">
            <h2 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight italic text-white">
              Upcoming Events
            </h2>
          </div>

          {/* Single Event Flyer Centered */}
          <div className="max-w-xl mx-auto">
            {upcomingEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="border sm:border-2 border-zinc-700 bg-zinc-900/90 p-2.5 sm:p-4 group hover:border-brand transition-colors flex flex-col justify-between shadow-2xl"
              >
                <div>
                  <div 
                    onClick={() => setActiveEventIndex(idx)}
                    className="relative overflow-hidden bg-zinc-950 border border-zinc-800 cursor-pointer group/img"
                    title="Click to view full screen"
                  >
                    <img
                      src={event.imgUrl}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-auto object-contain block transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-zinc-900/90 border border-zinc-700 text-brand-light text-[9px] font-mono uppercase font-black px-2 py-0.5 pointer-events-none shadow-sm">
                      {event.badge}
                    </div>

                    {/* Hover full screen overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-brand text-white font-mono text-[10px] uppercase font-black px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Full Screen</span>
                      </div>
                    </div>

                    {/* Mobile always-visible expand icon badge */}
                    <div className="absolute bottom-2 right-2 bg-zinc-900/90 text-white border border-zinc-700 px-2 py-1 flex items-center gap-1 text-[9px] font-mono uppercase font-bold sm:hidden shadow-sm">
                      <Maximize2 className="w-3.5 h-3.5 text-brand-light" />
                      <span>Full Screen</span>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex justify-between items-center">
                    <h3 
                      onClick={() => setActiveEventIndex(idx)}
                      className="font-mono text-xs font-bold uppercase text-white truncate max-w-[180px] sm:max-w-none cursor-pointer hover:text-brand-light transition-colors"
                      title="Click to view full screen"
                    >
                      {event.title}
                    </h3>
                    <a 
                      href="#about"
                      className="text-brand-light hover:text-white flex items-center gap-0.5 text-[10px] font-mono uppercase font-black"
                    >
                      Ask <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Photo Gallery: 4 Horizontally x 5 Vertically Grid (20 Photos from Drive) */}
      <section id="gallery" className="relative py-6 sm:py-12 border-b border-zinc-800 text-white scroll-mt-14 overflow-hidden">
        {/* Background photo from Google Drive - optimized without backdrop blur */}
        <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
          <img 
            src={galleryBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
          
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <h2 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight italic text-white">
              Photo Gallery
            </h2>
          </div>

          {/* Grid Layout (4 Horizontally x 5 Vertically = 20 Photos) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 max-w-5xl mx-auto">
            {galleryImages.map((img, index) => (
              <div
                key={img.id || index}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative aspect-square border sm:border-2 border-zinc-700 bg-zinc-900 cursor-pointer overflow-hidden transition-colors hover:border-brand shadow-lg"
              >
                <img
                  src={img.url}
                  alt={img.title || `Gallery photo ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj";
                  }}
                />

                {/* Overlaid view icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-brand text-white p-1.5 sm:p-2 rounded-none shadow-md">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox Modal - Mounted to body via React Portal to be completely above navbar */}
      {activeLightboxIndex !== null && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-3 sm:p-6 select-none"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Prominent Close button at top right, fully above navbar */}
          <button 
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[10000] text-white bg-zinc-900/95 hover:bg-red-600 border-2 border-zinc-500 hover:border-red-500 p-2.5 sm:p-3 rounded-none cursor-pointer transition-colors shadow-2xl flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex(null);
            }}
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline text-white">Close</span>
          </button>

          <div 
            className="relative max-w-4xl w-full max-h-[82vh] flex items-center justify-center border-2 border-zinc-700 p-1 sm:p-2 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav Left */}
            <button 
              className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 bg-black/85 border border-zinc-700 text-white hover:text-brand hover:border-brand transition-colors cursor-pointer"
              onClick={handlePrev}
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <img 
              src={galleryImages[activeLightboxIndex].url} 
              alt={galleryImages[activeLightboxIndex].title} 
              className="max-w-full max-h-[75vh] object-contain block"
            />

            {/* Nav Right */}
            <button 
              className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 bg-black/85 border border-zinc-700 text-white hover:text-brand hover:border-brand transition-colors cursor-pointer"
              onClick={handleNext}
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Upcoming Event Flyer Full-Screen Lightbox Modal - Mounted to body via React Portal */}
      {activeEventIndex !== null && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-3 sm:p-6 select-none pt-14 sm:pt-6"
          onClick={() => setActiveEventIndex(null)}
        >
          {/* Prominent Close button at top right, fully above navbar */}
          <button 
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[10000] text-white bg-zinc-900/95 hover:bg-red-600 border-2 border-zinc-500 hover:border-red-500 p-2.5 sm:p-3 rounded-none cursor-pointer transition-colors shadow-2xl flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              setActiveEventIndex(null);
            }}
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline text-white">Close</span>
          </button>

          {/* Main flyer image container */}
          <div 
            className="relative max-w-4xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-2 border-zinc-700 bg-zinc-950 p-1.5 sm:p-2 shadow-2xl flex items-center justify-center max-w-full">
              {/* Previous flyer button */}
              {upcomingEvents.length > 1 && (
                <button 
                  className="absolute left-2 sm:left-4 z-10 p-2 sm:p-2.5 bg-black/85 border border-zinc-700 text-white hover:text-brand transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEventIndex(activeEventIndex === 0 ? upcomingEvents.length - 1 : activeEventIndex - 1);
                  }}
                  title="Previous Event"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <img 
                src={upcomingEvents[activeEventIndex].imgUrl} 
                alt={upcomingEvents[activeEventIndex].title} 
                className="max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain block"
              />

              {/* Next flyer button */}
              {upcomingEvents.length > 1 && (
                <button 
                  className="absolute right-2 sm:right-4 z-10 p-2 sm:p-2.5 bg-black/85 border border-zinc-700 text-white hover:text-brand transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEventIndex(activeEventIndex === upcomingEvents.length - 1 ? 0 : activeEventIndex + 1);
                  }}
                  title="Next Event"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Flyer Title & Caption bar */}
            <div className="mt-3 flex items-center justify-between w-full max-w-2xl px-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="bg-brand text-white px-2 py-0.5 text-[10px] font-black uppercase">
                  {upcomingEvents[activeEventIndex].badge}
                </span>
                <span className="text-white font-bold uppercase truncate max-w-[200px] sm:max-w-none">
                  {upcomingEvents[activeEventIndex].title}
                </span>
              </div>
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider hidden sm:inline">
                Click outside or press ESC to close
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
