import React from 'react';
import { Calendar } from 'lucide-react';
import { navigateTo } from '../App';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

export default function PricingCalculator() {
  const pricingBgPhoto = getShuffledPhoto(4);

  const rates = [
    {
      item: "Pit Bike Rental (110cc Semi-Auto or CRF80 Clutch)",
      price: "R250",
      duration: "per 30 min session",
      note: "110cc semi-automatic pit bike or Honda CRF80 with clutch. 45-minute slot intervals (30 min active ride time). Mandatory prior experience riding on dirt and changing gears (no beginners permitted on rental pit bikes). Max weight: 100 kg • Age 14+."
    },
    {
      item: "Quad Bike Rental (80cc Quad)",
      price: "R300",
      duration: "per 30 min session",
      note: "80cc quad bike. 45-minute slot intervals (30 min active ride time). Beginners ARE permitted on rental quad bikes! Fun, simple throttle control on flat dirt."
    },
    {
      item: "Bring Your Own Bike/Pit Bike",
      price: "R150",
      duration: "per day",
      note: "Pay on-site. No online booking required. Show up and ride during open hours."
    }
  ];

  return (
    <section id="pricing" className="relative py-10 sm:py-16 border-b border-zinc-800 text-white scroll-mt-16 overflow-hidden">
      {/* Background photo from Google Drive - dynamic shuffled */}
      <div className="absolute inset-0 z-0">
        <img 
          src={pricingBgPhoto.url} 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight italic text-white">
            Pricing
          </h2>
        </div>

        {/* Rates Sheet (Tabular) */}
        <div className="border-2 border-zinc-700 bg-zinc-900/90 mb-12 shadow-2xl backdrop-blur-md">
          <div className="border-b-2 border-zinc-700 px-5 py-4 bg-zinc-950/80">
            <h3 className="font-sans text-sm sm:text-base uppercase tracking-wider text-white font-black">
              Standard Compound Rates
            </h3>
          </div>
          <div className="divide-y-2 divide-zinc-800 font-sans">
            {rates.map((rate, idx) => (
              <div key={idx} className="p-5 sm:p-6 sm:flex sm:items-start sm:justify-between gap-6 hover:bg-zinc-800/50 transition-colors">
                <div className="sm:max-w-xl">
                  <h4 className="font-sans text-base sm:text-lg uppercase font-black text-white">
                    {rate.item}
                  </h4>
                  <p className="text-sm font-semibold text-zinc-300 mt-1.5 leading-relaxed">
                    {rate.note}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 text-left sm:text-right flex-shrink-0">
                  <div className="font-sans text-2xl sm:text-3xl font-black text-emerald-400">
                    {rate.price}
                  </div>
                  <div className="font-sans text-xs sm:text-sm font-bold uppercase text-zinc-400 mt-0.5">
                    {rate.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-2 border-zinc-700 bg-zinc-900/90 p-6 sm:p-8 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
          <p className="font-sans text-sm sm:text-base font-bold text-zinc-200 leading-relaxed mb-5">
            Guaranteed slots and rental unit availability require online booking. Choose dates, select your bikes, and checkout securely.
          </p>
          <button
            onClick={() => navigateTo('booking')}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-black uppercase tracking-wider text-sm sm:text-base rounded-none transition-colors inline-flex items-center gap-2.5 cursor-pointer shadow-lg shadow-emerald-500/20 border-2 border-emerald-500"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Ride Online</span>
          </button>
        </div>

      </div>
    </section>
  );
}
