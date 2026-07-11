/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Track from './components/Track';
import EventsGallery from './components/EventsGallery';
import AboutContact from './components/AboutContact';
import BookingSystem from './components/BookingSystem';
import { ShieldAlert, X } from 'lucide-react';

export default function App() {
  const [showNotification, setShowNotification] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('payfast_status') || params.has('booking_id')) {
        return 'booking';
      }
    }
    return 'home';
  });

  const handlePageChange = (page: 'home' | 'booking') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div id="appRoot" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col relative font-sans antialiased selection:bg-brand selection:text-black">
      
      {/* Modern Redesigned Header Menu */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Floating Notification Bubble for Rental Requirements (Only visible on Home page) */}
      {showNotification && currentPage === 'home' && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            y: [0, -8, 0],
            rotate: [-1.5, 1.5, -1.5]
          }}
          transition={{
            opacity: { duration: 0.5 },
            x: { duration: 0.5 },
            scale: { duration: 0.5 },
            y: {
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="fixed top-24 left-4 sm:left-6 lg:left-8 z-40 cursor-pointer max-w-[210px] sm:max-w-[240px] group select-none"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.close-btn')) return;
            document.getElementById('rental-requirements')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="relative overflow-hidden rounded-xl bg-neutral-950/95 border-2 border-amber-500 shadow-[0_15px_35px_rgba(234,179,8,0.3)] backdrop-blur-md p-3 pr-8 hover:border-amber-400 hover:shadow-[0_20px_40px_rgba(234,179,8,0.45)] transition-all duration-300">
            {/* Background Hazard Stripe Accent inside */}
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_6px,#000_6px,#000_12px)]" />
            
            <div className="pl-2 flex items-start gap-2">
              <div className="flex-shrink-0 bg-amber-500/10 border border-amber-500/30 text-amber-500 p-1.5 rounded-lg mt-0.5 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-mono text-[9px] text-amber-500 font-black tracking-widest block uppercase">
                    RENTAL ALERT
                  </span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                </div>
                <h4 className="text-white font-extrabold text-xs uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                  Rider Rules
                </h4>
                <p className="text-neutral-400 text-[10px] sm:text-[11px] mt-0.5 leading-relaxed">
                  Competent experience is strictly mandatory. Tap to view requirements.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotification(false);
              }}
              className="close-btn absolute top-2 right-2 p-1 text-neutral-500 hover:text-white rounded-full bg-neutral-950/40 hover:bg-neutral-950/80 transition-colors z-50"
              aria-label="Dismiss notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Grid content flow */}
      <main className="flex-1 w-full flex flex-col">
        {currentPage === 'home' ? (
          <>
            {/* Hero Welcome */}
            <Hero />

            {/* Tracks Highlight and Video tour */}
            <Track />

            {/* Clean, high-impact "Book Online" CTA section replacing the static Pricing */}
            <section id="booking" className="py-24 relative overflow-hidden bg-neutral-950 border-t border-b border-neutral-900 scroll-mt-20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 text-brand text-xs font-mono uppercase tracking-widest rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                  Secure Online Reservations
                </div>
                
                <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight mb-6">
                  READY TO HIT <span className="text-brand">THE TRACK?</span>
                </h2>
                
                <p className="text-neutral-450 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Riders with their <strong className="text-white">own bikes do not need to book</strong>—just arrive, pay at the gate, and ride! If you want to rent our top-spec Pit Bikes or Quads, or are booking an exclusive group event, use our portal below to secure your slot.
                </p>

                {/* Info highlights card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mb-12">
                  <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-850">
                    <span className="text-brand font-mono text-xs uppercase tracking-wider block mb-1">01. Rental Options</span>
                    <span className="text-white font-bold text-sm uppercase">Pit Bikes & Quad Rentals</span>
                    <p className="text-neutral-500 text-xs mt-1.5">Top-of-the-line bikes tuned for maximum compound action.</p>
                  </div>
                  <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-850">
                    <span className="text-brand font-mono text-xs uppercase tracking-wider block mb-1">02. Own Rides</span>
                    <span className="text-white font-bold text-sm uppercase">No Booking Required</span>
                    <p className="text-neutral-500 text-xs mt-1.5">Bringing your own machine? Just arrive at the gate and ride—no pre-booking needed.</p>
                  </div>
                  <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-850">
                    <span className="text-brand font-mono text-xs uppercase tracking-wider block mb-1">03. Secure Gate</span>
                    <span className="text-white font-bold text-sm uppercase">PayFast Sandbox Enabled</span>
                    <p className="text-neutral-500 text-xs mt-1.5">Secure payment integration for fast, instant ticket emission.</p>
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={() => handlePageChange('booking')}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-brand hover:bg-brand-light text-black font-black uppercase text-base sm:text-lg tracking-wider rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Open Booking Portal
                </button>
              </div>
            </section>

            {/* Events Schedule & Image grid with lightboxes */}
            <EventsGallery />

            {/* Story, Map integration, hours and footer */}
            <AboutContact />
          </>
        ) : (
          <div className="py-24 min-h-screen bg-neutral-950">
            <BookingSystem onBack={() => handlePageChange('home')} />
          </div>
        )}
      </main>
    </div>
  );
}
