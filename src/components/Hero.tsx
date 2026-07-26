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
      className="relative min-h-[50vh] sm:min-h-[70vh] pt-16 sm:pt-28 pb-6 sm:pb-8 px-3 sm:px-4 flex flex-col justify-center border-b border-zinc-900 bg-black text-white"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
        
        {/* Left: Content */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4 text-left">
          
          <div className="flex flex-col items-start gap-1.5 sm:gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold">
                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" /> Bottelary Road, Stellenbosch
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-mono text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase italic leading-[1.1]">
              Welcome to <br />
              <span className="text-brand">
                RixCompound
              </span>
            </h1>
            <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
              A private pit bike and junior MX track on Bottelary Road. Bring your own bike/pit bike (R150) or rent ours for a thrilling, secure day out on the dirt. Simple as that!
            </p>
          </div>

          {/* Prominent Track Status Box + Big Operating Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl my-1">
            
            {/* Open / Closed Live Status Box */}
            <div className={`p-3.5 border flex flex-col justify-center ${
              pitbikeStatus.isOpen
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300'
            }`}>
              <div className="flex items-center gap-2">
                {pitbikeStatus.isOpen ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider uppercase text-emerald-400">
                      TRACK IS OPEN
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs font-black tracking-wider uppercase text-amber-400 block">
                        TRACK IS CLOSED
                      </span>
                      {pitbikeStatus.text && pitbikeStatus.text !== 'CLOSED' && (
                        <span className="font-mono text-[11px] font-bold text-zinc-300 uppercase block mt-0.5">
                          {pitbikeStatus.text}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Times Box */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 flex flex-col justify-center">
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                  <span>Friday and Saturday 9:00 AM to 3:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                  <span>Sunday 9:00 AM to 2:15 PM</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-2.5 mt-1 max-w-md">
            {/* Top Row: Track Layouts & Rider Requirements next to each other */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="#track"
                className="py-2.5 px-3 bg-zinc-950 text-white border border-zinc-800 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-900 transition-colors text-center flex items-center justify-center font-bold"
              >
                Track Layouts
              </a>
              <a
                href="#rental-requirements"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('rental-requirements')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 px-2 bg-zinc-950 text-amber-400 border border-amber-500/40 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider hover:bg-zinc-900 hover:border-amber-400 transition-colors flex items-center justify-center gap-1.5 text-center font-bold"
              >
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Rider Requirements</span>
              </a>
            </div>

            {/* Bottom Row: Book Online full width */}
            <button
              onClick={() => navigateTo('booking')}
              className="w-full py-2.5 px-4 bg-emerald-500 text-black font-mono font-black uppercase tracking-wider text-[11px] cursor-pointer hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/10 text-center flex items-center justify-center"
            >
              Book Online
            </button>
          </div>

        </div>

        {/* Right: Sharp minimalist showcase image */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-full border border-zinc-800 bg-zinc-950 p-1.5">
            <div className="relative aspect-[1.5] overflow-hidden">
              <img
                src="https://i.postimg.cc/KYG36gnP/IMG_20251112_WA0108_1024x683.jpg"
                alt="Riders on the dirt at Rix Compound"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

