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

export default function PricingCalculator({ onBookNow }: { onBookNow?: () => void }) {
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

        {/* Pricing Layout: 2 Main Service Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-stretch mb-8 sm:mb-16">
          
          {/* Weekends Rate Card */}
          <div className="bg-neutral-900/50 rounded-xl sm:rounded-3xl border-2 border-neutral-800 p-4 sm:p-8 lg:p-10 flex flex-col justify-between hover:border-brand/35 transition-all">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                <span className="px-2.5 py-1 bg-brand/10 border border-brand/30 text-brand text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-md sm:rounded-lg">
                  Saturdays, Sundays & Public Holidays
                </span>
                <span className="text-brand font-semibold text-[10px] sm:text-xs flex items-center gap-1">Online Booking Required</span>
              </div>
              
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase italic tracking-tight mb-1.5 sm:mb-2">
                Weekend & Holiday Rentals
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-8 leading-relaxed">
                Ridden exclusively on our Mini MX and Pit Bike Track. Online booking is mandatory. We operate in 45-minute booking slots providing exactly 30 minutes of dedicated track riding.
              </p>
              
              <div className="space-y-3">
                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">Pit Bike Rental</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">Fun, responsive ride on our mini track</span>
                  </div>
                  <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R250 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ 30m</span></span>
                </div>

                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">ATV Rental</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">Stable and solid dirt quad bike action</span>
                  </div>
                  <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R300 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ 30m</span></span>
                </div>

                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">Bring Your Own Bike</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">All-day unlimited access to open lines</span>
                  </div>
                  <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R150 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ Day</span></span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-850 text-neutral-400 text-xs flex flex-col gap-1">
              <span className="font-semibold text-white">⏰ Operating Hours:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-neutral-400 mt-0.5">
                <span>• Saturdays: 09:00 – 15:00</span>
                <span>• Sundays: 09:00 – 14:30</span>
                <span>• Public Holidays: 09:00 – 17:00</span>
              </div>
            </div>
          </div>

          {/* Weekdays Group Packages Card */}
          <div className="bg-neutral-900/50 rounded-xl sm:rounded-3xl border-2 border-neutral-850 p-4 sm:p-8 lg:p-10 flex flex-col justify-between hover:border-brand/20 transition-all">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md sm:rounded-lg">
                  Wednesday - Friday
                </span>
                <span className="text-brand font-semibold text-[10px] sm:text-xs flex items-center gap-1">Booking Mandatory</span>
              </div>
              
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase italic tracking-tight mb-1.5 sm:mb-2">
                Weekday Group Packages
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm mb-4 sm:mb-8 leading-relaxed">
                Unlock exclusive track reservations for birthday celebrations, team building sessions, or client entertainment.
              </p>
              
              <div className="space-y-3">
                
                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">30 Minute Slots</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">Perfect for quick, focused private runs</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R1,500 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ 5 bikes</span></span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-400 whitespace-nowrap mt-0.5">R3,000 <span className="text-[9px] sm:text-xs text-neutral-550 font-sans font-normal">/ 10 bikes</span></span>
                  </div>
                </div>

                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">60 Minute Slots</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">More track time for transitions & skill building</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R3,000 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ 5 bikes</span></span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-400 whitespace-nowrap mt-0.5">R5,000 <span className="text-[9px] sm:text-xs text-neutral-550 font-sans font-normal">/ 10 bikes</span></span>
                  </div>
                </div>

                <div className="bg-neutral-950/45 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-850 flex flex-row items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs sm:text-sm">4 Hour Half-Day</h4>
                    <span className="text-[10px] sm:text-xs text-neutral-500">Exclusive facility use for events, parties, & teams</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base sm:text-xl font-bold text-brand whitespace-nowrap">R8,000 <span className="text-[9px] sm:text-xs text-neutral-455 font-sans font-normal">/ 5 bikes</span></span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-neutral-400 whitespace-nowrap mt-0.5">R15,200 <span className="text-[9px] sm:text-xs text-neutral-555 font-sans font-normal">/ 10 bikes</span></span>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-850 text-neutral-400 text-xs flex flex-wrap gap-x-3 gap-y-1">
              <span>🗓️ Weekdays: Booking Required (Wednesday to Friday)</span>
              <span>• Custom group builds welcome</span>
            </div>
          </div>

        </div>

        {/* BOOKINGS ONLINE RESERVATION & PAYMENT CALLOUT */}
        <div className="bg-neutral-950 rounded-xl sm:rounded-2xl border border-brand/40 p-4 sm:p-6 mb-8 sm:mb-16 shadow-[0_0_20px_rgba(255,140,0,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="max-w-2xl">
              <span className="px-2 py-0.5 bg-brand/10 border border-brand/30 text-brand text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider rounded">
                ⚡ Mandatory Online Booking
              </span>
              <h4 className="font-display text-white font-extrabold text-sm sm:text-base uppercase tracking-tight mt-1 sm:mt-1.5">
                Reserve & Pay Online to Lock Your Ride
              </h4>
              <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed mt-1">
                Due to popular demand, we operate strictly on a mandatory booking system. All weekend individual slots and weekday group packages must be booked and paid for on our website. Once confirmed, your slot is locked and guaranteed. No refunds are permitted.
              </p>
            </div>
            <div className="flex-shrink-0 bg-neutral-900 border border-neutral-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left sm:text-right">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono block uppercase">SLOT DURATION</span>
              <span className="text-white font-bold text-xs sm:text-sm">45-Min Slots (30m Ride)</span>
            </div>
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

        {/* Dynamic Professional Booking Callout Section (Online Portal CTA) */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-xl sm:rounded-3xl border border-brand/35 p-4 sm:p-10 text-center shadow-2xl shadow-black relative overflow-hidden">
          {/* Ambient Corner Orange Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-dark/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center border border-brand/40 shadow-lg shadow-brand/5 text-brand mb-1">
              <Calendar className="w-5 h-5 animate-pulse" />
            </div>

            <h3 className="font-display text-xl sm:text-3xl font-extrabold text-white uppercase italic tracking-tight">
              Interactive <span className="text-brand">Online Booking Portal</span>
            </h3>
            
            <p className="text-brand text-[10px] sm:text-xs max-w-lg mx-auto uppercase font-bold font-mono tracking-wider mt-0.5">
              Schedules, fleet availability & live slot checkout
            </p>

            <div className="w-12 h-0.5 bg-neutral-800 my-1.5" />

            <div className="w-full max-w-md mt-1.5">
              <button
                type="button"
                onClick={onBookNow}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand hover:bg-brand-light text-black font-black uppercase rounded-lg sm:rounded-xl transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 text-xs sm:text-sm active:scale-97 cursor-pointer hover:scale-[1.03]"
              >
                <Bike className="w-4 h-4 text-black" />
                <span>Book Your Ride Online Now</span>
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-[10px] sm:text-xs text-neutral-500 font-mono uppercase">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand/70" /> Weekday Groups
              </span>
              <span className="hidden sm:inline text-neutral-800">|</span>
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-brand/70" /> Weekend Rentals
              </span>
              <span className="hidden sm:inline text-neutral-800">|</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" /> Real-time slots
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
