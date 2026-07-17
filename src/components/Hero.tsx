/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { Flame, CalendarDays, Compass } from 'lucide-react';
import { navigateTo } from '../App';

export default function Hero() {
  return (
    <section 
      id="home" 
      className="relative min-h-[70vh] sm:min-h-[80vh] pt-24 sm:pt-32 lg:pt-36 pb-4 sm:pb-6 px-3 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-dark/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left: Content */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-5 text-center lg:text-left">
          
          <div className="flex flex-col items-center lg:items-start gap-2 sm:gap-3">
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand/10 border border-brand/30 text-brand text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-md sm:rounded-full">
                <Compass className="w-2.5 h-2.5" /> Stellenbosch Winelands
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-md sm:rounded-full">
                <CalendarDays className="w-2.5 h-2.5" /> Fri & Sat 9am-3pm • Sun 9am-2:30pm
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase italic leading-[1.1]">
              Welcome to <br />
              <span className="text-brand">
                RixCompound
              </span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A private pit bike and junior MX track on Bottelary Road. Bring your own bike (R150) or rent ours for a thrilling, secure day out on the dirt. Simple as that!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 mt-0.5">
            <button
              onClick={() => navigateTo('booking')}
              className="w-full sm:w-auto text-center px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider rounded-md sm:rounded-lg shadow-md hover:shadow-emerald-500/20 transition-all text-[10px] sm:text-xs cursor-pointer"
            >
              Book Online
            </button>
            <a
              href="#track"
              className="w-full sm:w-auto text-center px-5 py-2.5 sm:px-6 sm:py-3 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-bold uppercase tracking-wider rounded-md sm:rounded-lg transition-all text-[10px] sm:text-xs"
            >
              Track Layouts
            </a>
          </div>

        </div>

        {/* Right: Beautiful main showcase image card */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative group max-w-sm lg:max-w-none w-full">
            <div className="absolute -inset-0.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand to-brand-dark opacity-20 blur-lg group-hover:opacity-40 transition duration-1000" />
            <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-neutral-850 p-1 sm:p-2 bg-neutral-900/40">
              <div className="relative rounded-md sm:rounded-lg overflow-hidden aspect-[1.5]">
                <img
                  src="https://i.postimg.cc/KYG36gnP/IMG_20251112_WA0108_1024x683.jpg"
                  alt="Riders on the dirt at Rix Compound"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
