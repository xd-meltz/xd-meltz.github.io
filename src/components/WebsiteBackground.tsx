import React, { useState, useEffect } from 'react';
import { SHUFFLED_PHOTOS } from '../lib/backgroundPhotos';

export default function WebsiteBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically cycle through the shuffled photos every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHUFFLED_PHOTOS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-zinc-950"
    >
      {SHUFFLED_PHOTOS.map((photo, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={photo.url}
              alt=""
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover object-center scale-105"
            />
          </div>
        );
      })}

      {/* Dark theme overlay - less transparent so the vivid dirt track action photos pop */}
      <div className="absolute inset-0 bg-zinc-950/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-transparent to-zinc-950/60" />
    </div>
  );
}
