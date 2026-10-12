/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { CalendarDays, Compass, ShieldAlert, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { navigateTo } from '../App';
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
      className="relative min-h-[48vh] sm:min-h-[70vh] pt-16 sm:pt-24 pb-5 sm:pb-8 px-3 sm:px-4 flex flex-col justify-center border-b border-zinc-800 text-white overflow-hidden"
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
              A private pit bike and junior MX track on Bottelary Road. Bring your own bike/pit bike (R150) or rent ours for a thrilling, secure day out on the dirt. Simple as that!
            </p>
          </div>

          {/* Prominent Track Status Box + Big Operating Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 max-w-xl my-1 sm:my-2">
            
            {/* Open / Closed Live Status Box */}
            <div className={`p-3 sm:p-4 border sm:border-2 flex flex-col justify-center ${
              pitbikeStatus.isOpen
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-lg'
                : 'bg-zinc-900/85 border-zinc-700 text-zinc-100 shadow-md'
            }`}>
              <div className="flex items-center gap-2.5">
                {pitbikeStatus.isOpen ? (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                    </span>
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    <span className="font-sans text-base sm:text-xl font-black tracking-wider uppercase text-emerald-300">
                      TRACK IS OPEN
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-sans text-sm sm:text-base font-black tracking-wider uppercase text-amber-300 block">
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
            {/* Top Row: Track Layouts & Rider Requirements next to each other */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <a
                href="#track"
                className="py-2.5 sm:py-3 px-3 sm:px-3.5 bg-zinc-900/90 text-white border sm:border-2 border-zinc-700 font-sans text-xs sm:text-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors text-center flex items-center justify-center font-black shadow-md"
              >
                Track Layouts
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

            {/* Bottom Row: Book Online full width */}
            <button
              onClick={() => navigateTo('booking')}
              className="w-full py-3 sm:py-3.5 px-4 sm:px-5 bg-emerald-500 text-black font-sans font-black uppercase tracking-wider text-sm sm:text-base cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center"
            >
              Book Online Now
            </button>
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

