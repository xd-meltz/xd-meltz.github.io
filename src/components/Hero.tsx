/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { CalendarDays, Compass, ShieldAlert, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { navigateTo } from '../App';
import { getPitbikeStatus, PitbikeStatus } from '../lib/trackStatus';
import { getClosedDatesDirect, getClosedSlotsDirect } from '../lib/firebase';

export default function Hero() {
  const [pitbikeStatus, setPitbikeStatus] = useState<PitbikeStatus>(() => getPitbikeStatus());

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
      className="relative min-h-[50vh] sm:min-h-[70vh] pt-16 sm:pt-28 pb-6 sm:pb-8 px-3 sm:px-4 flex flex-col justify-center border-b border-zinc-200 bg-white text-zinc-900"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
        
        {/* Left: Content */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4 text-left">
          
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border-2 border-zinc-900 text-zinc-950 text-xs sm:text-sm font-sans uppercase tracking-wider font-extrabold">
                <Compass className="w-4 h-4 text-brand" /> Bottelary Road, Stellenbosch
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 uppercase italic leading-[1.08]">
              Welcome to <br />
              <span className="text-brand">
                RixCompound
              </span>
            </h1>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-zinc-800 max-w-xl leading-relaxed font-sans font-bold">
              A private pit bike and junior MX track on Bottelary Road. Bring your own bike/pit bike (R150) or rent ours for a thrilling, secure day out on the dirt. Simple as that!
            </p>
          </div>

          {/* Prominent Track Status Box + Big Operating Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl my-2">
            
            {/* Open / Closed Live Status Box */}
            <div className={`p-4 border-2 flex flex-col justify-center ${
              pitbikeStatus.isOpen
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900'
            }`}>
              <div className="flex items-center gap-2.5">
                {pitbikeStatus.isOpen ? (
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                    </span>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="font-sans text-lg sm:text-xl font-black tracking-wider uppercase text-emerald-700">
                      TRACK IS OPEN
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-sans text-sm sm:text-base font-black tracking-wider uppercase text-amber-600 block">
                        TRACK IS CLOSED
                      </span>
                      {pitbikeStatus.text && pitbikeStatus.text !== 'CLOSED' && (
                        <span className="font-sans text-xs sm:text-sm font-extrabold text-zinc-700 uppercase block mt-0.5">
                          {pitbikeStatus.text}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Times Box */}
            <div className="p-4 bg-zinc-50 border-2 border-zinc-300 flex flex-col justify-center">
              <div className="space-y-2 font-sans text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-zinc-900 font-extrabold">
                  <CalendarDays className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Fri & Sat: 9:00 AM – 3:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-900 font-extrabold">
                  <CalendarDays className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Sunday: 9:00 AM – 2:15 PM</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-3 mt-2 max-w-md">
            {/* Top Row: Track Layouts & Rider Requirements next to each other */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="#track"
                className="py-3 px-3.5 bg-zinc-100 text-zinc-950 border-2 border-zinc-900 font-sans text-xs sm:text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors text-center flex items-center justify-center font-black"
              >
                Track Layouts
              </a>
              <a
                href="#rental-requirements"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('rental-requirements')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-3 bg-red-50 text-red-700 border-2 border-red-600 font-sans text-xs sm:text-sm uppercase tracking-wider hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-center font-black"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span className="truncate">Rider Rules</span>
              </a>
            </div>

            {/* Bottom Row: Book Online full width */}
            <button
              onClick={() => navigateTo('booking')}
              className="w-full py-3.5 px-5 bg-emerald-500 text-black font-sans font-black uppercase tracking-wider text-sm sm:text-base cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center"
            >
              Book Online Now
            </button>
          </div>

        </div>

        {/* Right: Sharp minimalist showcase image */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-full border border-zinc-200 bg-zinc-50 p-1.5 shadow-sm">
            <div className="relative aspect-[1.5] overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj"
                onError={(e) => {
                  e.currentTarget.src = "https://drive.google.com/uc?export=view&id=10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj";
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

