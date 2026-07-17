/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  Calendar, 
  Bike 
} from 'lucide-react';
import { navigateTo } from '../App';

export default function PricingCalculator() {
  const whatsappLink = "https://wa.me/27768299919";
  const phoneCallLink = "tel:+27768299919";
  const phoneDisplay = "0768299919";

  return (
    <section id="pricing" className="py-6 sm:py-12 bg-neutral-900/10 relative">
      {/* Visual background effects */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-8">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Simple, Transparent Rates
          </h2>
          <p className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            Pricing & <span className="text-brand">Packages</span>
          </p>
          <div className="w-12 h-0.5 bg-brand mx-auto mt-3 rounded-full" />
        </div>

        {/* Book Online Call to Action */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-16 text-center">
          <div className="bg-neutral-900/40 rounded-2xl sm:rounded-3xl border-2 border-neutral-850 p-6 sm:p-10 flex flex-col items-center gap-5 sm:gap-6 relative overflow-hidden group">
            {/* Ambient Background Glow inside */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            
            <span className="px-3 py-1 bg-brand/10 border border-brand/30 text-brand text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full">
              Reserve Your Slot Online
            </span>
            
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight max-w-lg leading-tight">
              Ready for an action-packed ride?
            </h3>
            
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Book your ride online to guarantee track access and rental gear availability. Choose from our Pit Bike or Quad Bike rentals. Click below to view available dates and times.
            </p>

            <button
              onClick={() => navigateTo('booking')}
              className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-light text-black font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-brand/10 hover:shadow-brand/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[3]" />
              <span>Book Online Now</span>
            </button>
          </div>
        </div>

        {/* STANDOUT GUIDELINES: Rider Requirements & Rental Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-16">
          
          {/* Rider Requirements Box with High-Contrast Caution Layout */}
          <div id="rental-requirements" className="bg-neutral-950/80 rounded-xl sm:rounded-3xl border-2 border-amber-500 p-4 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.15)] scroll-mt-24">
            {/* Caution stripes design */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(-45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)]" />
            
            <h3 className="font-display text-lg sm:text-2xl font-black text-white uppercase tracking-tight mb-2 mt-2 flex items-center gap-2">
              <span className="text-amber-500">🚧</span> Rental Rider Requirements
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6">
              At Rix Compound, safety remains our highest priority.
            </p>

            <div className="space-y-3 sm:space-y-4">
              
              {/* MANDATORY WARNING: NO BEGINNERS PERMITTED */}
              <div className="bg-red-950/40 border-2 border-red-500/50 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start gap-2.5 sm:gap-3">
                <span className="text-lg sm:text-xl mt-0.5">🚨</span>
                <div>
                  <h4 className="text-red-400 font-extrabold uppercase text-[11px] sm:text-sm tracking-wider">
                    No Beginners Permitted
                  </h4>
                  <p className="text-neutral-300 text-xs mt-1 leading-relaxed">
                    No beginners are permitted to operate our rental units under any circumstances. You must have competent off-road riding skills.
                  </p>
                </div>
              </div>

              {/* MANDATORY WARNING: PRIOR RIDING EXPERIENCE REQUIRED */}
              <div className="bg-amber-950/45 border-2 border-amber-500/50 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start gap-2.5 sm:gap-3">
                <span className="text-lg sm:text-xl mt-0.5">🔥</span>
                <div>
                  <h4 className="text-amber-400 font-extrabold uppercase text-[11px] sm:text-sm tracking-wider">
                    Must Have Prior Riding Experience
                  </h4>
                  <p className="text-neutral-300 text-xs mt-1 leading-relaxed">
                    All rental riders must have prior off-road riding experience. Please note that riding lessons or training sessions are not offered.
                  </p>
                </div>
              </div>

              {/* Requirements list */}
              <ul className="space-y-2 sm:space-y-3 pl-1 pt-1 text-xs sm:text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Minimum Age:</strong> Riders must be 14 years of age or older to operate our Pit Bike or ATV rentals.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Safety Briefing:</strong> A comprehensive safety briefing is conducted before every riding session.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Important Rental Information */}
          <div className="bg-neutral-900/40 rounded-xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg sm:text-2xl font-extrabold text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
                <span className="text-brand">📋</span> Important Rental Info
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-6">
                All rental bikes and ATVs are ridden exclusively on our Mini MX and Pit Bike Track.
              </p>

              <ul className="space-y-3 sm:space-y-4 pl-1">
                <li className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="text-brand mt-0.5 text-xs sm:text-sm">💰</span>
                  <div>
                    <strong className="text-white block uppercase text-[9px] sm:text-[10px] tracking-wider text-amber-500 mb-0.5">Weekend Rates & riding time</strong>
                    <div className="space-y-1 mt-1 text-xs">
                      <div>• <strong className="text-brand">Pit Bike Rental:</strong> R250 per 30 minutes of active riding time <span className="text-neutral-500">(45-minute slot intervals)</span></div>
                      <div>• <strong className="text-brand">Quad Bike Rental:</strong> R300 per 30 minutes of active riding time <span className="text-neutral-500">(45-minute slot intervals)</span></div>
                      <p className="text-amber-400 text-[10px] font-mono uppercase mt-1 leading-snug">⚠️ Each booking slot provides exactly 30 minutes of active track / riding time.</p>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="text-brand mt-0.5 text-xs sm:text-sm">🔒</span>
                  <div>
                    <strong className="text-white block uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 mb-0.5">Rider Responsibility</strong>
                    All riders are responsible for the rental they sign for and operate.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="text-brand mt-0.5 text-xs sm:text-sm">✍️</span>
                  <div>
                    <strong className="text-white block uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 mb-0.5">Liability Waiver</strong>
                    A waiver must be completed before riding.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="text-brand mt-0.5 text-xs sm:text-sm">💥</span>
                  <div>
                    <strong className="text-white block uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 mb-0.5">Damage Charges Policy</strong>
                    Any damage caused to a rental unit, including broken, bent, snapped, or damaged parts, will be charged accordingly before departure.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <span className="text-brand mt-0.5 text-xs sm:text-sm">🪖</span>
                  <div>
                    <strong className="text-white block uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 mb-0.5">Helmets Provided</strong>
                    Helmets are provided once registration, waiver completion, and full payment are received.
                  </div>
                </li>
              </ul>
            </div>

            {/* Parents & Guardians Policy */}
            <div className="mt-4 p-3.5 rounded-lg sm:rounded-2xl bg-neutral-950/40 border border-neutral-850/60">
              <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>👨‍👩‍👦</span> Parents and Guardians
              </h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">
                Children under 14 with no prior riding experience need to be accompanied by a parent or guardian as a passenger on <strong className="text-brand">ATV rentals ONLY</strong>, subject to management approval.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
