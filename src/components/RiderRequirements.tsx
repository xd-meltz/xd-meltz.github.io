import React from 'react';
import { ShieldAlert, AlertTriangle, Bike } from 'lucide-react';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

export default function RiderRequirements() {
  const reqPhoto = getShuffledPhoto(2);

  return (
    <section id="rental-requirements" className="relative py-6 sm:py-14 border-y border-zinc-800 text-white scroll-mt-20 overflow-hidden">
      {/* Background photo from Google Drive - optimized without backdrop blur */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <img 
          src={reqPhoto.url} 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
        
        <div className="border sm:border-2 border-zinc-700 bg-zinc-900/90 p-3.5 sm:p-8 relative overflow-hidden shadow-2xl text-white">
          {/* Solid Red Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-red-600" />

          {/* Section Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b sm:border-b-2 border-zinc-800 pb-3.5 sm:pb-6 mb-4 sm:mb-7 gap-2.5 sm:gap-4">
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-white font-black italic flex items-center gap-2 sm:gap-3">
                <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                Rider Requirements & Rental Info
              </h2>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-2 bg-red-950/80 border sm:border-2 border-red-600 text-red-200 font-sans text-xs sm:text-sm font-black uppercase self-start sm:self-center shadow-sm">
              <span>SAFETY MANDATORY</span>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 font-sans">
            
            {/* Pit Bike Requirements */}
            <div className="border-l-2 sm:border-l-4 border-red-600 pl-3 sm:pl-4 py-1.5 sm:py-2 space-y-2 sm:space-y-3 bg-zinc-950/70 p-3 sm:p-4 border border-zinc-800">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <span>Pit Bike Rentals</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-zinc-200 leading-snug">
                Fleet: 110cc semi-automatic pit bike or Honda CRF80 with manual clutch.
              </p>
              <div className="p-2.5 sm:p-3 bg-red-950/60 border border-red-700/80 space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
                <p className="text-red-300 font-extrabold uppercase">
                  ⚠️ Critical Requirements:
                </p>
                <p className="text-zinc-100 font-bold leading-normal">
                  • Prior experience <strong className="text-red-400 font-black underline">riding on dirt</strong> is mandatory.
                </p>
                <p className="text-zinc-100 font-bold leading-normal">
                  • Prior experience <strong className="text-red-400 font-black underline">changing gears</strong> is mandatory (semi-auto foot shift or manual clutch).
                </p>
                <p className="text-red-400 font-black leading-normal">
                  • Beginners are strictly NOT permitted on rental pit bikes (no lessons offered).
                </p>
              </div>
              <p className="text-zinc-300 text-xs sm:text-sm font-bold">
                • Age: 14+ years old <br />
                • Max weight: 100 kg
              </p>
            </div>

            {/* Quad Bike Requirements */}
            <div className="border-l-2 sm:border-l-4 border-emerald-500 pl-3 sm:pl-4 py-1.5 sm:py-2 space-y-2 sm:space-y-3 bg-zinc-950/70 p-3 sm:p-4 border border-zinc-800">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                <span>Quad Bike Rentals (80cc)</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-zinc-200 leading-snug">
                <strong className="text-emerald-400 font-black">Beginners ARE permitted</strong> on rental quad bikes!
              </p>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal font-semibold">
                80cc quad bike riding is accessible and fun for beginners and experienced riders alike. Simple throttle control on flat terrain.
              </p>
              <div className="p-2.5 sm:p-3 bg-emerald-950/60 border border-emerald-700/80 text-xs sm:text-sm text-zinc-100 font-bold">
                • Kids under 14 with no experience may ride as passenger with a guardian (prior approval required).
              </div>
            </div>

            {/* General Rules & Damage Policy */}
            <div className="border-l-2 sm:border-l-4 border-zinc-600 pl-3 sm:pl-4 py-1.5 sm:py-2 space-y-2 sm:space-y-3 bg-zinc-950/70 p-3 sm:p-4 border border-zinc-800">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                <span>Track Rules & Damage Policy</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal font-bold">
                One rider per vehicle (sharing strictly prohibited). If a rider falls twice or rides recklessly, the ride will be terminated immediately without refund.
              </p>
              <p className="text-xs sm:text-sm text-zinc-200 font-bold p-2.5 sm:p-3 bg-zinc-900/90 border border-zinc-700">
                Riders are fully responsible for any loss or damage to bikes, ATVs, or equipment. All repairs must be settled before leaving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
