import React, { useState, useEffect, useRef } from 'react';
import { SHUFFLED_PHOTOS } from '../lib/backgroundPhotos';

export default function WebsiteBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect when user is actively scrolling so we pause background cross-fade to prevent scroll jitter
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Smooth background cycling every 10 seconds, only when not actively scrolling
  useEffect(() => {
    if (SHUFFLED_PHOTOS.length <= 1) return;
    const interval = setInterval(() => {
      if (isScrollingRef.current) return; // don't repaint during active scroll
      setCurrentIndex((curr) => {
        setPrevIndex(curr);
        return (curr + 1) % SHUFFLED_PHOTOS.length;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const activePhoto = SHUFFLED_PHOTOS[currentIndex] || SHUFFLED_PHOTOS[0];
  const prevPhoto = prevIndex !== null ? SHUFFLED_PHOTOS[prevIndex] : null;

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-zinc-950 transform-gpu"
      style={{ contain: 'strict' }}
    >
      {/* Previous photo fading out */}
      {prevPhoto && (
        <div
          key={`prev-${prevPhoto.id}`}
          className="absolute inset-0 transition-opacity duration-1000 ease-out opacity-0 pointer-events-none"
        >
          <img
            src={prevPhoto.url}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Active photo */}
      {activePhoto && (
        <div
          key={`active-${activePhoto.id}`}
          className="absolute inset-0 transition-opacity duration-1000 ease-in opacity-100 pointer-events-none"
        >
          <img
            src={activePhoto.url}
            alt=""
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Dark theme overlay - optimized without backdrop-filter to guarantee 60fps smooth scrolling */}
      <div className="absolute inset-0 bg-zinc-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/70 pointer-events-none" />
    </div>
  );
}
