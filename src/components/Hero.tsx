/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { CalendarDays, Compass, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { getPitbikeStatus, PitbikeStatus } from '../lib/trackStatus';
import { getClosedDatesDirect, getClosedSlotsDirect } from '../lib/firebase';
import { getShuffledPhoto, MAIN_LANDING_PHOTO } from '../lib/backgroundPhotos';

export default function Hero() {
  const [pitbikeStatus, setPitbikeStatus] = useState<PitbikeStatus>(() => getPitbikeStatus());
  const heroPhoto = getShuffledPhoto(0);
  const heroShowcasePhoto = MAIN_LANDING_PHOTO;

  useEffect(() => {
    Promise.all([getClosedDatesDirect(), getClosedSlotsDirect()])
      .then(([closedDatesData, closedSlotsData]) => {
        const datesSet = new Set(closedDatesData.map(item => item.date));
        const slotsSet = new Set(closedSlotsData.map(item => `${item.date}_${item.slot}`));
        setPitbikeStatus(getPitbikeStatus(datesSet, slotsSet));
      })
      .catch((err) => {
        console.error('Failed to fetch closed dates/slots for hero status:', err);
      });
  }, []);

  return (
    <section 
      id="home" 
      className="relative min-h-[48vh] sm:min-h-[70vh] pt-24 sm:pt-32 pb-5 sm:pb-8 px-3 sm:px-4 flex flex-col justify-center border-b border-zinc-800 text-white overflow-hidden"
    >
      {/* Hero photographic background from Google Drive - optimized without backdrop blur */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <img 
          src={heroPhoto.url} 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
        
        {/* Left: Content */}
        <div className="lg:col-span-7 flex flex-col gap-2.5 sm:gap-4 text-left">
          
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-zinc-900/90 border sm:border-2 border-zinc-700 text-zinc-100 text-xs sm:text-sm font-sans uppercase tracking-wider font-extrabold shadow-md">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-light" /> Bottelary Road, Stellenbosch
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase italic leading-[1.08] drop-shadow-sm">
              Welcome to <br />
              <span className="text-brand-light">
                RixCompound
              </span>
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-200 max-w-xl leading-relaxed font-sans font-bold drop-shadow-sm">
              Bottelary Road&apos;s premier dirt track offering 5 thrilling activities: Off-Road Go Karts (Kids), Mini Bikes, Pit Bikes, Quad Bikes, and Bring Your Own Bike (BYOB) track access. Private bookings for pitbikes are also available by contacting Rix Compound directly!
            </p>
          </div>

          {/* Prominent Track Status Box + Big Operating Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 max-w-xl my-1 sm:my-2">
            
            {/* Open / Closed Live Status Box */}
            <div className={`p-3 sm:p-4 border sm:border-2 flex flex-col justify-center ${
              pitbikeStatus.isOpen
                ? 'bg-blue-950/70 border-blue-500 text-blue-100 shadow-lg'
                : 'bg-zinc-900/85 border-zinc-700 text-zinc-100 shadow-md'
            }`}>
              <div className="flex items-center gap-2.5">
                {pitbikeStatus.isOpen ? (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-blue-500"></span>
                    </span>
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <span className="font-sans text-base sm:text-xl font-black tracking-wider uppercase text-blue-300">
                      TRACK IS OPEN
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-sans text-sm sm:text-base font-black tracking-wider uppercase text-red-300 block">
                        TRACK IS CLOSED
                      </span>
                      {pitbikeStatus.text && pitbikeStatus.text !== 'CLOSED' && (
                        <span className="font-sans text-xs sm:text-sm font-extrabold text-zinc-300 uppercase block mt-0.5">
                          {pitbikeStatus.text}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Times Box */}
            <div className="p-3 sm:p-4 bg-zinc-900/85 border sm:border-2 border-zinc-700 flex flex-col justify-center shadow-md">
              <div className="space-y-1.5 sm:space-y-2 font-sans text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-zinc-100 font-extrabold">
                  <CalendarDays className="w-4 h-4 text-brand-light flex-shrink-0" />
                  <span>Fri & Sat: 9:00 AM – 3:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-100 font-extrabold">
                  <CalendarDays className="w-4 h-4 text-brand-light flex-shrink-0" />
                  <span>Sunday: 9:00 AM – 2:15 PM</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-2.5 mt-1 sm:mt-2 max-w-md">
            {/* Top Row: Pricing & Rider Requirements next to each other */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 sm:py-3 px-3 sm:px-3.5 bg-zinc-900/90 text-white border sm:border-2 border-zinc-700 font-sans text-xs sm:text-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors text-center flex items-center justify-center font-black shadow-md"
              >
                Pricing
              </a>
              <a
                href="#rental-requirements"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('rental-requirements')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 sm:py-3 px-2.5 sm:px-3 bg-red-950/70 text-red-200 border sm:border-2 border-red-700 font-sans text-xs sm:text-sm uppercase tracking-wider hover:bg-red-900/70 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-center font-black shadow-md"
              >
                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-red-400" />
                <span className="truncate">Rider Rules</span>
              </a>
            </div>

            {/* Top Info Banner */}
            <div className="p-3 sm:p-3.5 bg-zinc-900/95 border sm:border-2 border-zinc-700 shadow-lg">
              <div className="space-y-1 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                <div className="text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 flex-shrink-0" />
                  <span>Pitbikes &amp; Quadbikes: First Come First Serve</span>
                </div>
                <div className="text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 flex-shrink-0" />
                  <span>Go Karts &amp; Mini Bikes: Online Booking</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Sharp minimalist showcase image */}
        <div className="lg:col-span-5 relative w-full flex justify-center mt-2 lg:mt-0">
          <div className="relative w-full border sm:border-2 border-zinc-700 bg-zinc-900/90 p-1 sm:p-1.5 shadow-2xl">
            <div className="relative aspect-[1.5] overflow-hidden">
              <img
                src={heroShowcasePhoto.url}
                onError={(e) => {
                  e.currentTarget.src = "https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj";
                }}
                alt="Rix Compound Track"
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

