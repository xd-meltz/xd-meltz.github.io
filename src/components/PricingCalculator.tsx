import React from 'react';
import { Calendar } from 'lucide-react';
import { navigateTo } from '../App';

export default function PricingCalculator() {
  const rates = [
    {
      item: "Pit Bike Rental",
      price: "R250",
      duration: "per 30 min session",
      note: "45-minute slot intervals. Active track time is 30 minutes. Prior riding experience required."
    },
    {
      item: "Quad Bike Rental",
      price: "R300",
      duration: "per 30 min session",
      note: "45-minute slot intervals. Active track time is 30 minutes. Prior riding experience required."
    },
    {
      item: "Bring Your Own Bike",
      price: "R150",
      duration: "per day",
      note: "Pay on-site. No online booking required. Show up and ride during open hours."
    }
  ];

  const requirements = [
    {
      label: "NO BEGINNERS",
      description: "Riders must have competent off-road riding skills. Under no circumstances are absolute beginners permitted to operate rental units."
    },
    {
      label: "PRIOR EXPERIENCE",
      description: "All rental riders must have prior off-road motorcycle or ATV riding experience. We do not offer riding lessons or training."
    },
    {
      label: "MINIMUM AGE",
      description: "Riders must be 14 years of age or older to operate our Pit Bike or ATV rentals."
    },
    {
      label: "SAFETY BRIEFING",
      description: "A mandatory safety briefing and waiver completion are conducted before every riding session."
    }
  ];

  return (
    <section id="pricing" className="py-12 bg-black border-b border-zinc-900 text-white scroll-mt-14">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
            Rates & Guidelines
          </span>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
            Pricing & Packages
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
                  <div className="font-mono text-lg font-black text-brand">
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

        {/* Rules & Policies Grid */}
        <div id="rental-requirements" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Safety Requirements */}
          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-brand font-extrabold mb-6">
              Rider Requirements
            </h3>
            
            <div className="space-y-6">
              {requirements.map((req, idx) => (
                <div key={idx} className="border-l-2 border-zinc-800 pl-4">
                  <h4 className="font-mono text-[10px] font-black uppercase text-zinc-200 tracking-wider">
                    {req.label}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                    {req.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* General Rental Policies */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-brand font-extrabold mb-6">
                Important Rental Info & Policies
              </h3>
              
              <ul className="space-y-4 font-sans text-xs text-zinc-400">
                <li className="leading-relaxed">
                  <strong className="text-zinc-200 font-mono text-[10px] block uppercase tracking-wider mb-1">Track Boundary</strong>
                  All rental bikes and ATVs are ridden exclusively on our Mini MX and Pit Bike Track.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-200 font-mono text-[10px] block uppercase tracking-wider mb-1">Rider Responsibility</strong>
                  All riders are responsible for the rental unit they sign for and operate.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-200 font-mono text-[10px] block uppercase tracking-wider mb-1">Damage Policy</strong>
                  Any damage caused to a rental unit, including broken, bent, snapped, or damaged parts, will be charged accordingly before departure.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-200 font-mono text-[10px] block uppercase tracking-wider mb-1">Safety Equipment</strong>
                  Helmets are provided once registration, waiver completion, and full payment are received.
                </li>
                <li className="leading-relaxed border-t border-zinc-900 pt-4">
                  <strong className="text-zinc-200 font-mono text-[10px] block uppercase tracking-wider mb-1">Parents and Guardians</strong>
                  Children under 14 with no prior riding experience must be accompanied by a parent or guardian as a passenger on <span className="text-brand font-bold">ATV rentals only</span>, subject to management approval.
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 text-center max-w-xl mx-auto">
          <p className="font-sans text-xs text-zinc-400 leading-relaxed mb-4">
            Guaranteed slots and rental unit availability require online booking. Choose dates, input details, and checkout securely.
          </p>
          <button
            onClick={() => navigateTo('booking')}
            className="px-6 py-3 bg-emerald-500 text-black font-mono font-bold uppercase tracking-widest text-xs rounded-none hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Ride Online</span>
          </button>
        </div>

      </div>
    </section>
  );
}
