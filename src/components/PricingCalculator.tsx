import React from 'react';
import { Calendar } from 'lucide-react';
import { navigateTo } from '../App';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

export default function PricingCalculator() {
  const pricingBgPhoto = getShuffledPhoto(4);

  const rates = [
    {
      item: "Pit Bike Rental (110cc Semi-Auto or CRF80 Clutch) • 10 Available",
      price: "R250",
      duration: "per 30 min session",
      note: "110cc semi-automatic pit bike or Honda CRF80 with clutch. 45-minute slot intervals (30 min active ride time). Mandatory prior experience riding on dirt and changing gears. Max weight: 100 kg • Age 14+."
    },
    {
      item: "Quad Bike Rental (80cc Quad) • 3 Available",
      price: "R300",
      duration: "per 30 min session",
      note: "80cc quad bike. 45-minute slot intervals (30 min active ride time). Beginners ARE permitted on rental quad bikes! Fun, simple throttle control on flat dirt."
    },
    {
      item: "Off-Road Go Kart (70cc Kids) • 4 Available",
      price: "R150",
      duration: "per 10 min session",
      note: "70cc off-road go kart for kids. 10-minute session. Thrilling dirt track handling with roll cage protection for kids."
    },
    {
      item: "Mini Bike Rental (70cc) • 2 Available",
      price: "R150",
      duration: "per 10 min session",
      note: "70cc mini bike. 10-minute session. Perfect for smaller or younger riders developing balance and throttle confidence."
    },
    {
      item: "Bring Your Own Bike/Pit Bike",
      price: "R150",
      duration: "per day",
      note: "Pay on-site. No online booking required. Show up and ride during open hours."
    }
  ];

  return (
    <section id="pricing" className="relative py-6 sm:py-12 border-b border-zinc-800 text-white scroll-mt-16 overflow-hidden">
      {/* Background photo from Google Drive - optimized without backdrop blur */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <img 
          src={pricingBgPhoto.url} 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
        
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight italic text-white">
            Pricing
          </h2>
        </div>

        {/* Rates Sheet (Tabular) */}
        <div className="border sm:border-2 border-zinc-700 bg-zinc-900/90 mb-6 sm:mb-10 shadow-2xl">
          <div className="border-b border-zinc-700 px-3.5 sm:px-5 py-3 sm:py-4 bg-zinc-950/80">
            <h3 className="font-sans text-sm sm:text-base uppercase tracking-wider text-white font-black">
              Standard Compound Rates
            </h3>
          </div>
          <div className="divide-y divide-zinc-800 font-sans">
            {rates.map((rate, idx) => (
              <div key={idx} className="p-3.5 sm:p-6 sm:flex sm:items-start sm:justify-between gap-4 sm:gap-6 hover:bg-zinc-800/50 transition-colors">
                <div className="sm:max-w-xl">
                  <h4 className="font-sans text-base sm:text-lg uppercase font-black text-white">
                    {rate.item}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-300 mt-1 leading-relaxed">
                    {rate.note}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right flex-shrink-0">
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
        <div className="border sm:border-2 border-zinc-700 bg-zinc-900/90 p-4 sm:p-8 text-center max-w-xl mx-auto shadow-2xl">
          <p className="font-sans text-sm sm:text-base font-bold text-zinc-200 leading-relaxed mb-4 sm:mb-5">
            Guaranteed slots and rental unit availability require online booking. Choose dates, select your bikes, and checkout securely.
          </p>
          <button
            onClick={() => navigateTo('booking')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-black uppercase tracking-wider text-sm sm:text-base rounded-none transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-emerald-500/20 border sm:border-2 border-emerald-500"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Ride Online</span>
          </button>
        </div>

      </div>
    </section>
  );
}
