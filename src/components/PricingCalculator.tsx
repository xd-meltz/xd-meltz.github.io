import React from 'react';
import { Calendar } from 'lucide-react';
import { navigateTo } from '../App';

export default function PricingCalculator() {
  const rates = [
    {
      item: "Pit Bike Rental (110cc Semi-Automatic)",
      price: "R250",
      duration: "per 30 min session",
      note: "110cc semi-automatic pit bike. 45-minute slot intervals (30 min active ride time). Prior riding experience required (no beginners permitted on rental pit bikes). Max weight: 100 kg."
    },
    {
      item: "Quad Bike Rental (80cc Quad)",
      price: "R300",
      duration: "per 30 min session",
      note: "80cc quad bike. 45-minute slot intervals (30 min active ride time). Beginners are permitted on rental quad bikes!"
    },
    {
      item: "Bring Your Own Bike/Pit Bike",
      price: "R150",
      duration: "per day",
      note: "Pay on-site. No online booking required. Show up and ride during open hours."
    }
  ];

  return (
    <section id="pricing" className="py-8 sm:py-12 bg-black border-b border-zinc-900 text-white scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
            Rates & Guidelines
          </span>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
            Pricing
          </h2>
        </div>

        {/* Rates Sheet (Tabular) */}
        <div className="border border-zinc-800 bg-zinc-950 mb-12">
          <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
            <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">
              Standard Compound Rates
            </h3>
          </div>
          <div className="divide-y divide-zinc-900 font-sans">
            {rates.map((rate, idx) => (
              <div key={idx} className="p-4 sm:flex sm:items-start sm:justify-between gap-6 hover:bg-zinc-900/10 transition-colors">
                <div className="sm:max-w-md">
                  <h4 className="font-mono text-xs uppercase font-extrabold text-white">
                    {rate.item}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {rate.note}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right flex-shrink-0">
                  <div className="font-mono text-lg font-black text-emerald-400">
                    {rate.price}
                  </div>
                  <div className="font-mono text-[10px] uppercase text-zinc-500">
                    {rate.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 text-center max-w-xl mx-auto">
          <p className="font-sans text-xs text-zinc-400 leading-relaxed mb-4">
            Guaranteed slots and rental unit availability require online booking. Choose dates, input details, and checkout securely.
          </p>
          <button
            onClick={() => navigateTo('booking')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-xs rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 border border-emerald-500"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Ride Online</span>
          </button>
        </div>

      </div>
    </section>
  );
}
