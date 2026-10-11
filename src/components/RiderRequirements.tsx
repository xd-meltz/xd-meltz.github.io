import React from 'react';
import { ShieldAlert, AlertTriangle, Bike } from 'lucide-react';

export default function RiderRequirements() {
  return (
    <section id="rental-requirements" className="py-12 sm:py-16 bg-white border-y border-zinc-200 text-zinc-900 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="border-2 border-zinc-900 bg-white p-6 sm:p-9 relative overflow-hidden shadow-md">
          {/* Solid Red Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-600" />

          {/* Section Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-zinc-200 pb-6 mb-8 gap-4">
            <div>
              <span className="font-sans text-xs sm:text-sm uppercase tracking-widest text-red-600 font-black block mb-1.5">
                MANDATORY SAFETY GUIDELINES & RULES
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-zinc-950 font-black italic flex items-center gap-3">
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
                Rider Requirements & Rental Info
              </h2>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-600 text-red-700 font-sans text-xs sm:text-sm font-black uppercase self-start sm:self-center">
              <span>SAFETY MANDATORY</span>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Pit Bike Requirements */}
            <div className="border-l-4 border-red-600 pl-4 py-2 space-y-3 bg-red-50/40 p-4 border border-red-200">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-zinc-950 tracking-wide flex items-center gap-2">
                <Bike className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>Pit Bike Rentals</span>
              </h3>
              <p className="text-sm font-bold text-zinc-900 leading-snug">
                Fleet: 110cc semi-automatic pit bike or Honda CRF80 with manual clutch.
              </p>
              <div className="p-3 bg-white border border-red-300 space-y-1.5 text-xs sm:text-sm">
                <p className="text-red-700 font-extrabold uppercase">
                  ⚠️ Critical Requirements:
                </p>
                <p className="text-zinc-900 font-bold leading-normal">
                  • Prior experience <strong className="text-red-600 font-black underline">riding on dirt</strong> is mandatory.
                </p>
                <p className="text-zinc-900 font-bold leading-normal">
                  • Prior experience <strong className="text-red-600 font-black underline">changing gears</strong> is mandatory (semi-auto foot shift or manual clutch).
                </p>
                <p className="text-red-600 font-black leading-normal">
                  • Beginners are strictly NOT permitted on rental pit bikes (no lessons offered).
                </p>
              </div>
              <p className="text-zinc-800 text-xs sm:text-sm font-bold">
                • Age: 14+ years old <br />
                • Max weight: 100 kg
              </p>
            </div>

            {/* Quad Bike Requirements */}
            <div className="border-l-4 border-emerald-600 pl-4 py-2 space-y-3 bg-emerald-50/40 p-4 border border-emerald-200">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-zinc-950 tracking-wide flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Quad Bike Rentals (80cc)</span>
              </h3>
              <p className="text-sm font-bold text-zinc-900 leading-snug">
                <strong className="text-emerald-700 font-black">Beginners ARE permitted</strong> on rental quad bikes!
              </p>
              <p className="text-xs sm:text-sm text-zinc-800 leading-normal font-semibold">
                80cc quad bike riding is accessible and fun for beginners and experienced riders alike. Simple throttle control on flat terrain.
              </p>
              <div className="p-3 bg-white border border-emerald-300 text-xs sm:text-sm text-zinc-900 font-bold">
                • Kids under 14 with no experience may ride as passenger with a guardian (prior approval required).
              </div>
            </div>

            {/* General Rules & Damage Policy */}
            <div className="border-l-4 border-zinc-900 pl-4 py-2 space-y-3 bg-zinc-50 p-4 border border-zinc-200">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-zinc-950 tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Track Rules & Damage Policy</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-900 leading-normal font-bold">
                One rider per vehicle (sharing strictly prohibited). If a rider falls twice or rides recklessly, the ride will be terminated immediately without refund.
              </p>
              <p className="text-xs sm:text-sm text-zinc-800 font-bold p-3 bg-white border border-zinc-300">
                Riders are fully responsible for any loss or damage to bikes, ATVs, or equipment. All repairs must be settled before leaving.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
