/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, PlayCircle, X } from 'lucide-react';

export default function Track() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const tracks = [
    {
      title: "PitBike Track",
      description: "Professionally designed turns, rhythmic sections, and dirt obstacles engineered for both junior and adult riders.",
      image: "https://i.postimg.cc/J44p3K6T/Chat-GPT-Image-Jan-7-2026-03-01-22-PM.png",
      underConstruction: false
    },
    {
      title: "Flat Track",
      description: "Practice your sliding, drifting, and precise throttle controls in a secure, fast, wide-open winelands setup. Full-size Big Bikes are welcome here!",
      image: "https://i.postimg.cc/xdmTR1fj/Chat-GPT-Image-Mar-4-2026-10-12-06-AM.png",
      underConstruction: true
    }
  ];

  return (
    <section id="track" className="py-6 sm:py-10 bg-neutral-950/60 border-y border-neutral-900/60 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-brand mb-2">
            The Compound Circuits
          </h2>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
            The <span className="text-brand">Tracks</span>
          </p>
          <div className="w-12 h-0.5 bg-brand mx-auto mt-3 rounded-full" />
        </div>

        {/* Tracks Grid - side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
          {tracks.map((track, idx) => (
            <div 
              key={idx}
              className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all group relative overflow-hidden ${
                track.underConstruction 
                  ? 'border-yellow-500/50 bg-neutral-950/90 shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                  : 'bg-neutral-900/30 border-neutral-850 hover:border-brand/35'
              }`}
            >
              {/* Construction Tape Wraps (extends out of the box container slightly or overlays it) */}
              {track.underConstruction && (
                <>
                  {/* Diagonal wrapped tape 1 */}
                  <div className="absolute -left-16 -right-16 top-6 h-8 bg-[repeating-linear-gradient(-45deg,#f59e0b,#f59e0b_12px,#000_12px,#000_24px)] transform rotate-12 shadow-[0_4px_12px_rgba(0,0,0,0.6)] z-20 pointer-events-none border-y-2 border-yellow-400/30 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-yellow-300 uppercase tracking-[0.25em] drop-shadow-sm">
                      CAUTION ⚠️ CAUTION
                    </span>
                  </div>
                  {/* Diagonal wrapped tape 2 */}
                  <div className="absolute -left-16 -right-16 bottom-16 h-8 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_12px,#000_12px,#000_24px)] transform -rotate-12 shadow-[0_4px_12px_rgba(0,0,0,0.6)] z-20 pointer-events-none border-y-2 border-yellow-400/30 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-yellow-300 uppercase tracking-[0.25em] drop-shadow-sm">
                      🚧 WORK IN PROGRESS 🚧
                    </span>
                  </div>
                </>
              )}

              {/* Image Container */}
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-[1.6] mb-3 sm:mb-4 border border-neutral-800">
                <img 
                  src={track.image} 
                  alt={track.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    track.underConstruction ? 'opacity-30 filter grayscale contrast-125' : 'group-hover:scale-102'
                  }`}
                />

                {track.underConstruction && (
                  <>
                    {/* Big Sign Over the Image area */}
                    <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center z-10 p-2">
                      <div className="bg-amber-500 text-black p-3 sm:p-4 rounded-xl border-4 border-black shadow-[0_12px_24px_rgba(0,0,0,0.9)] transform -rotate-3 max-w-[90%] text-center relative overflow-hidden">
                        {/* Screw dots */}
                        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-black shadow-inner" />
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-black shadow-inner" />
                        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-black shadow-inner" />
                        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-600 border border-black shadow-inner" />

                        <div className="border-2 border-dashed border-black/40 p-2.5 rounded-lg bg-amber-400">
                          <div className="text-[10px] font-mono font-black tracking-widest text-black/80 mb-0.5 flex items-center justify-center gap-1">
                            <span>⚠️</span> FLAT TRACK <span>⚠️</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none text-black">
                            UNDER
                          </h4>
                          <h4 className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none text-black mt-0.5">
                            CONSTRUCTION
                          </h4>
                          <p className="mt-1.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-900 bg-black/10 py-0.5 rounded px-1">
                            Big Bike Upgrades Coming
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Title & Description Area */}
              <div className="relative">
                <h3 className={`font-display text-base sm:text-lg font-bold mb-1 uppercase transition-colors ${
                  track.underConstruction 
                    ? 'text-yellow-500' 
                    : 'text-white group-hover:text-brand'
                }`}>
                  {track.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed transition-opacity ${
                  track.underConstruction ? 'text-neutral-500 line-through decoration-yellow-500/30' : 'text-neutral-400'
                }`}>
                  {track.description}
                </p>

                {track.underConstruction && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 font-mono text-[10px] uppercase tracking-wider font-extrabold animate-pulse">
                    <span>🚧</span> Track Expansion in Progress
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Compact Video Feature */}
        <div className="max-w-3xl mx-auto">
          <div 
            onClick={() => setIsPlayingVideo(true)}
            className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-video border border-neutral-850 bg-neutral-900 cursor-pointer group shadow-xl transition-all hover:border-brand/40"
          >
            <img 
              src="https://img.youtube.com/vi/vgHBEpjlTRU/maxresdefault.jpg" 
              alt="Track video tour thumbnail"
              className="w-full h-full object-cover opacity-80"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/25 transition-colors">
              <div className="w-12 h-12 bg-brand text-black rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Play className="w-5 h-5 fill-black translate-x-0.5" />
              </div>
              <span className="mt-3 font-mono text-[10px] tracking-widest uppercase bg-black/80 px-3 py-1 rounded-full text-brand font-bold border border-neutral-800">
                Play Video Tour
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal Screen */}
      {isPlayingVideo && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setIsPlayingVideo(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-neutral-900 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-brand/35 bg-neutral-950">
            <iframe 
              src="https://www.youtube.com/embed/vgHBEpjlTRU?autoplay=1"
              title="Rix Compound Track Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
