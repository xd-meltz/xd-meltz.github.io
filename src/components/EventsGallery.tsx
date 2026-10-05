import React, { useState, useEffect } from 'react';
import { ArrowUpRight, X, ChevronLeft, ChevronRight, Eye, Maximize2 } from 'lucide-react';

export default function EventsGallery() {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);

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

  const galleryImages = [
    { url: "https://lh3.googleusercontent.com/d/1R9OYQT8Oe161DYKUpb1xMiQ4bAjRUbWs", alt: "Riding Mud Corner" },
    { url: "https://lh3.googleusercontent.com/d/17oCnPzDF_N1YU2ZSbDoh-vTdvHcNi69Z", alt: "Double Pit Bike Jump" },
    { url: "https://lh3.googleusercontent.com/d/1vgj5Jv6519sz5ioIppFYFbOTXNqUWPJU", alt: "Winning Lean Slide" },
    { url: "https://lh3.googleusercontent.com/d/1opRk9DVra42yLuZUDqxuq9ijEWQURugE", alt: "Track Overview" },
    { url: "https://lh3.googleusercontent.com/d/1jqdT4pedi3b5aaw2biEmFfxtVm5XpxSj", alt: "Junior Track Prep" },
    { url: "https://lh3.googleusercontent.com/d/108-4wXp6z2yCSjZnLj-e2vuE-rr-WFeB", alt: "Team Lineup Session" },
    { url: "https://lh3.googleusercontent.com/d/1ndv4CQUciUdf0E9QIDsASSNXYzoOMUY-", alt: "Fields Near Winelands" },
    { url: "https://lh3.googleusercontent.com/d/1b5QTW9_Y3L3UyqpcldbhKDvg4A2CWcXf", alt: "Stellenbosch Sunset" },
    { url: "https://lh3.googleusercontent.com/d/1qx7fYGB2UaBKrlTKYHcAHsLCJrUBG5fk", alt: "Bikes Stationary" }
  ];

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
    },
    {
      imgUrl: "https://lh3.googleusercontent.com/d/1kZyLMKXdsabDqyivA9mGQ3exA1YXYNdW",
      title: "Weekend Open Session Flyer",
      badge: "Open Session"
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
    <div className="bg-black text-white">
      
      {/* 1. Upcoming Events */}
      <section id="events" className="py-8 sm:py-12 bg-black border-b border-zinc-900 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
              Action & Schedules
            </span>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
              Upcoming Events
            </h2>
          </div>

          {/* Grid of Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {upcomingEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="border border-zinc-800 bg-zinc-950 p-3 group hover:border-brand/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div 
                    onClick={() => setActiveEventIndex(idx)}
                    className="relative overflow-hidden bg-zinc-950 border border-zinc-900 cursor-pointer group/img"
                    title="Click to view full screen"
                  >
                    <img
                      src={event.imgUrl}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-auto object-contain block transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                    <div className="absolute top-3 left-3 bg-black/90 border border-zinc-800 text-brand text-[9px] font-mono uppercase font-bold px-2 py-0.5 pointer-events-none">
                      {event.badge}
                    </div>

                    {/* Hover full screen overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-brand text-black font-mono text-[10px] uppercase font-black px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Full Screen</span>
                      </div>
                    </div>

                    {/* Mobile always-visible expand icon badge */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-zinc-300 border border-zinc-800 px-2 py-1 flex items-center gap-1 text-[9px] font-mono uppercase font-bold sm:hidden">
                      <Maximize2 className="w-3 h-3 text-brand" />
                      <span>Full Screen</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <h3 
                      onClick={() => setActiveEventIndex(idx)}
                      className="font-mono text-xs font-bold uppercase text-white truncate max-w-[180px] cursor-pointer hover:text-brand transition-colors"
                      title="Click to view full screen"
                    >
                      {event.title}
                    </h3>
                    <a 
                      href="#about"
                      className="text-brand hover:text-brand-light flex items-center gap-0.5 text-[10px] font-mono uppercase font-bold"
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

      {/* 2. Photo Gallery */}
      <section id="gallery" className="py-8 sm:py-12 bg-black border-b border-zinc-900 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
              Compound Action
            </span>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
              Photo Gallery
            </h2>
          </div>

          {/* Grid Layout (Strict 3x3 Block) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative aspect-square border border-zinc-850 bg-zinc-950 cursor-pointer overflow-hidden transition-colors hover:border-brand/60"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlaid view icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-brand text-black p-1.5 rounded-none">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/98 z-[100] flex flex-col items-center justify-center p-4 select-none"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-850 p-2 rounded-none cursor-pointer"
            onClick={() => setActiveLightboxIndex(null)}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center border border-zinc-850 p-1 bg-zinc-950">
            {/* Nav Left */}
            <button 
              className="absolute left-4 z-10 p-2 bg-black/85 border border-zinc-800 text-white hover:text-brand transition-colors"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <img 
              src={galleryImages[activeLightboxIndex].url} 
              alt={galleryImages[activeLightboxIndex].alt} 
              className="max-w-full max-h-[75vh] object-contain block"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Nav Right */}
            <button 
              className="absolute right-4 z-10 p-2 bg-black/85 border border-zinc-800 text-white hover:text-brand transition-colors"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Image {activeLightboxIndex + 1} of {galleryImages.length}
            </span>
          </div>
        </div>
      )}

      {/* Upcoming Event Flyer Full-Screen Lightbox Modal */}
      {activeEventIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex flex-col items-center justify-center p-3 sm:p-6 select-none"
          onClick={() => setActiveEventIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 p-2.5 rounded-none cursor-pointer z-20 hover:border-brand transition-colors"
            onClick={() => setActiveEventIndex(null)}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main flyer image container */}
          <div 
            className="relative max-w-4xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl flex items-center justify-center max-w-full">
              {/* Previous flyer button */}
              {upcomingEvents.length > 1 && (
                <button 
                  className="absolute left-2 sm:left-4 z-10 p-2 sm:p-2.5 bg-black/85 border border-zinc-800 text-white hover:text-brand transition-colors cursor-pointer"
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
                className="max-w-full max-h-[78vh] sm:max-h-[84vh] object-contain block"
              />

              {/* Next flyer button */}
              {upcomingEvents.length > 1 && (
                <button 
                  className="absolute right-2 sm:right-4 z-10 p-2 sm:p-2.5 bg-black/85 border border-zinc-800 text-white hover:text-brand transition-colors cursor-pointer"
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
                <span className="bg-brand text-black px-2 py-0.5 text-[10px] font-black uppercase">
                  {upcomingEvents[activeEventIndex].badge}
                </span>
                <span className="text-white font-bold uppercase truncate max-w-[200px] sm:max-w-none">
                  {upcomingEvents[activeEventIndex].title}
                </span>
              </div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider hidden sm:inline">
                Click outside or press ESC to close
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
