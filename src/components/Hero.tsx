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
      className="relative min-h-[60vh] sm:min-h-[70vh] pt-24 sm:pt-28 pb-6 px-4 flex flex-col justify-center border-b border-zinc-900 bg-black text-white"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Content */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-350 text-[10px] font-mono uppercase tracking-wider">
                <Compass className="w-3 h-3 text-brand" /> Stellenbosch Winelands
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-350 text-[10px] font-mono uppercase tracking-wider">
                <CalendarDays className="w-3 h-3 text-brand" /> Fri & Sat 9am-3pm • Sun 9am-2:30pm
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase italic leading-[1.1]">
              Welcome to <br />
              <span className="text-brand">
                RixCompound
              </span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
              A private pit bike and junior MX track on Bottelary Road. Bring your own bike (R150) or rent ours for a thrilling, secure day out on the dirt. Simple as that!
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 mt-1">
            <button
              onClick={() => navigateTo('booking')}
              className="px-5 py-2.5 bg-emerald-500 text-black font-mono font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/10"
            >
              Book Online
            </button>
            <a
              href="#track"
              className="px-5 py-2.5 bg-zinc-950 text-white border border-zinc-800 font-mono text-[11px] uppercase tracking-wider hover:bg-zinc-900 transition-colors"
            >
              Track Layouts
            </a>
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
