import React, { useState, useEffect } from 'react';
import { ArrowUpRight, X, ChevronLeft, ChevronRight, Eye, Maximize2 } from 'lucide-react';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

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

  const galleryImages = [
    { url: "https://lh3.googleusercontent.com/d/1R9OYQT8Oe161DYKUpb1xMiQ4bAjRUbWs", alt: "Riding Mud Corner" },
    { url: "https://lh3.googleusercontent.com/d/17oCnPzDF_N1YU2ZSbDoh-vTdvHcNi69Z", alt: "Double Pit Bike Jump" },
    { url: "https://lh3.googleusercontent.com/d/1vgj5Jv6519sz5ioIppFYFbOTXNqUWPJU", alt: "Winning Lean Slide" },
    { url: "https://lh3.googleusercontent.com/d/1opRk9DVra42yLuZUDqxuq9ijEWQURugE", alt: "Track Overview" },
    { url: "https://lh3.googleusercontent.com/d/1jqdT4pedi3b5aaw2biEmFfxtVm5XpxSj", alt: "Junior Track Prep" },
    { url: "https://lh3.googleusercontent.com/d/108-4wXp6z2yCSjZnLj-e2vuE-rr-WFeB", alt: "Team Lineup Session" },
    { url: "https://lh3.googleusercontent.com/d/1ndv4CQUciUdf0E9QIDsASSNXYzoOMUY-", alt: "Fields Near Winelands" },
    { url: "https://lh3.googleusercontent.com/d/1b5QTW9_Y3L3UyqpcldbhKDvg4A2CWcXf", alt: "Stellenbosch Sunset" },
    { url: "https://lh3.googleusercontent.com/d/1qx7fYGB2UaBKrlTKYHcAHsLCJrUBG5fk", alt: "Bikes Stationary" },
    // 3 Additional Photo Spaces under the gallery
    { url: "https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj", alt: "Rental Pit Bike Fleet Lineup" },
    { url: "https://i.postimg.cc/J44p3K6T/Chat-GPT-Image-Jan-7-2026-03-01-22-PM.png", alt: "PitBike Circuit Action" },
    { url: "https://i.postimg.cc/xdmTR1fj/Chat-GPT-Image-Mar-4-2026-10-12-06-AM.png", alt: "Flat Track Drift Arena" }
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
    <div className="relative text-white">
      
      {/* 1. Upcoming Events */}
      <section id="events" className="relative py-8 sm:py-12 border-b border-zinc-800 text-white scroll-mt-14 overflow-hidden">
        {/* Background photo from Google Drive - dynamic shuffled */}
        <div className="absolute inset-0 z-0">
          <img 
            src={upcomingEventsBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic text-white">
              Upcoming Events
            </h2>
          </div>

          {/* Grid of Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {upcomingEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="border-2 border-zinc-700 bg-zinc-900/90 p-3 group hover:border-brand transition-colors flex flex-col justify-between shadow-2xl backdrop-blur-md"
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
                    <div className="absolute top-3 left-3 bg-zinc-900/90 border border-zinc-700 text-brand-light text-[9px] font-mono uppercase font-black px-2 py-0.5 pointer-events-none shadow-sm">
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

                  <div className="mt-3 flex justify-between items-center">
                    <h3 
                      onClick={() => setActiveEventIndex(idx)}
                      className="font-mono text-xs font-bold uppercase text-white truncate max-w-[180px] cursor-pointer hover:text-brand-light transition-colors"
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

      {/* 2. Photo Gallery */}
      <section id="gallery" className="relative py-8 sm:py-12 border-b border-zinc-800 text-white scroll-mt-14 overflow-hidden">
        {/* Background photo from Google Drive - dynamic shuffled */}
        <div className="absolute inset-0 z-0">
          <img 
            src={galleryBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic text-white">
              Photo Gallery
            </h2>
          </div>

          {/* Grid Layout (3-Column Block with tight spacing) */}
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 max-w-4xl mx-auto">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative aspect-square border-2 border-zinc-700 bg-zinc-900 cursor-pointer overflow-hidden transition-colors hover:border-brand shadow-lg"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj";
                  }}
                />

                {/* Overlaid view icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-brand text-white p-1.5 rounded-none">
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
                <span className="bg-brand text-white px-2 py-0.5 text-[10px] font-black uppercase">
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
