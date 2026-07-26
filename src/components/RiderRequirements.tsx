import React from 'react';
import { ShieldAlert, AlertTriangle, Bike } from 'lucide-react';

export default function RiderRequirements() {
  return (
    <section id="rental-requirements" className="py-10 bg-black border-b border-zinc-900 text-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="border border-zinc-800 bg-zinc-950 p-4 sm:p-8 relative overflow-hidden">
          {/* Solid Orange Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

          {/* Section Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-5 mb-6 gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-orange-500 font-bold block mb-1">
                Essential Guidelines & Rules
              </span>
              <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-wider text-white font-black italic flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                Rider Requirements & Rental Info
              </h2>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] font-bold uppercase self-start sm:self-center">
              <span>Safety First</span>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
            
            {/* Pit Bike Requirements */}
            <div className="border-l-2 border-orange-500 pl-4 py-1 space-y-1.5">
              <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-orange-500" />
                <span>Pit Bike Rentals (110cc)</span>
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                Prior dirt bike riding experience is <strong className="text-orange-500">mandatory</strong>. <strong className="text-orange-500">Beginners are strictly NOT permitted</strong> on rental pit bikes (no lessons offered).
              </p>
              <p className="text-zinc-400 text-[11px] font-mono">
                • Age 14+ years old <br />
                • Max weight: 100 kg
              </p>
            </div>

            {/* Quad Bike Requirements */}
            <div className="border-l-2 border-orange-500 pl-4 py-1 space-y-1.5">
              <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-orange-500" />
                <span>Quad Bike Rentals (80cc)</span>
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-orange-500">Beginners ARE permitted</strong> on rental quad bikes! 80cc quad bike riding for beginners and experienced riders alike.
              </p>
              <p className="text-zinc-400 text-[11px] font-mono">
                • Kids under 14 with no experience may ride as passenger with a guardian (prior approval required).
              </p>
            </div>

            {/* General Rules & Damage Policy */}
            <div className="border-l-2 border-orange-500 pl-4 py-1 space-y-1.5">
              <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Rules & Damage Responsibility</span>
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                One rider per vehicle (sharing strictly prohibited). If a rider falls twice or rides recklessly, the ride will be terminated immediately without refund.
              </p>
              <p className="text-zinc-400 text-[11px]">
                Riders are fully responsible for any loss or damage to bikes, ATVs, or equipment.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
