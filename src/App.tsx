/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Track from './components/Track';
import PricingCalculator from './components/PricingCalculator';
import EventsGallery from './components/EventsGallery';
import AboutContact from './components/AboutContact';
import BookingPage from './components/BookingPage';
import TicketPage from './components/TicketPage';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import { ShieldAlert, X, Bike } from 'lucide-react';

// Custom navigation emitter helper
export function navigateTo(page: 'home' | 'booking' | 'ticket' | 'admin' | 'mybookings', bookingId?: string) {
  window.dispatchEvent(new CustomEvent('navigate', { detail: { page, bookingId } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function App() {
  const [showNotification, setShowNotification] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'ticket' | 'admin' | 'mybookings'>('home');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [showFloatingBookBtn, setShowFloatingBookBtn] = useState(false);
  
  // Custom high-performance loader states
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadText, setLoadText] = useState('IGNITION KEY ENGAGED...');

  useEffect(() => {
    if (currentPage !== 'home') {
      setShowFloatingBookBtn(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY !== undefined ? window.scrollY : window.pageYOffset || document.documentElement.scrollTop;
      // Show when user scrolls down past 180px (beyond the hero book button)
      if (scrollTop > 180) {
        setShowFloatingBookBtn(true);
      } else {
        setShowFloatingBookBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial run

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  useEffect(() => {
    // Dynamic sequential text to simulate engine/track startup sequence
    const phrases = [
      'IGNITION KEY ENGAGED...',
      'FUEL PRESSURE OPTIMAL...',
      'SYNCHRONIZING TRACK SEGMENTS...',
      'WARMING UP TIRES...',
      'READY TO LAUNCH...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length - 1) {
        index++;
        setLoadText(phrases[index]);
      }
    }, 220);

    // Fast and highly predictable loader duration for a smooth experience
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Process query parameters on load (e.g. from Payfast redirects)
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const bookingIdParam = params.get('bookingId');
    
    if (pageParam === 'ticket' && bookingIdParam) {
      setCurrentPage('ticket');
      setCurrentBookingId(bookingIdParam);
      
      // Auto-confirm booking as paid in the local JSON database
      fetch(`/api/bookings/${bookingIdParam}/confirm`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => console.log('Booking confirmed:', data))
        .catch(async (err) => {
          console.warn('Error confirming booking via API, attempting direct Firestore update:', err);
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('./lib/firebase');
            const docRef = doc(db, 'bookings', bookingIdParam);
            await updateDoc(docRef, { paid: true });
            console.log('Booking confirmed directly via Firestore.');
          } catch (fsErr) {
            console.error('Failed to confirm booking via Firestore:', fsErr);
          }
        });
    } else if (pageParam === 'booking') {
      setCurrentPage('booking');
    } else if (pageParam === 'admin') {
      setCurrentPage('admin');
    } else if (pageParam === 'mybookings') {
      setCurrentPage('mybookings');
    }

    // Custom router event listener
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { page, bookingId } = customEvent.detail;
        setCurrentPage(page);
        if (bookingId) {
          setCurrentBookingId(bookingId);
        }
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  return (
    <div id="appRoot" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col relative font-sans antialiased selection:bg-brand selection:text-black">
      
      {/* High-Performance Launch Loader Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              y: -20,
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            className="fixed inset-0 bg-neutral-950 z-[9999] flex flex-col items-center justify-center select-none"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-82 h-82 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative flex flex-col items-center">
              {/* Creative Bike Wheelieing Animation */}
              <div className="relative h-24 w-36 flex items-end justify-center mb-6">
                {/* Ground/Dirt Line */}
                <div className="absolute bottom-2 w-32 h-[2px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
                
                {/* The Wheelie Bike */}
                <motion.div
                  animate={{ 
                    rotate: [0, -12, -9, -15, 0],
                    y: [0, -6, -2, -4, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.0, 
                    ease: "easeInOut" 
                  }}
                  className="relative origin-bottom-left flex items-center justify-center text-brand pb-2 select-none"
                >
                  <svg viewBox="0 0 100 60" className="w-24 h-16 text-brand drop-shadow-[0_0_12px_rgba(255,140,0,0.4)]">
                    {/* Rear Wheel Spinning Group */}
                    <motion.g
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
                      style={{ transformOrigin: "24px 44px" }}
                    >
                      {/* Outer Tire */}
                      <circle cx="24" cy="44" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      {/* Inner Rim */}
                      <circle cx="24" cy="44" r="7" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
                      {/* Spokes */}
                      <line x1="14" y1="44" x2="34" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="24" y1="34" x2="24" y2="54" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="17" y1="37" x2="31" y2="51" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="17" y1="51" x2="31" y2="37" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                    </motion.g>

                    {/* Front Wheel Spinning Group (Airborne) */}
                    <motion.g
                      animate={{ rotate: 240 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      style={{ transformOrigin: "76px 24px" }}
                    >
                      {/* Outer Tire */}
                      <circle cx="76" cy="24" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      {/* Inner Rim */}
                      <circle cx="76" cy="24" r="7" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
                      {/* Spokes */}
                      <line x1="66" y1="24" x2="86" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="76" y1="14" x2="76" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="69" y1="17" x2="83" y2="31" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                      <line x1="69" y1="31" x2="83" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                    </motion.g>

                    {/* Main Chassis / Frame (Static relative to wheels) */}
                    <g className="text-white">
                      {/* Rear Swingarm */}
                      <line x1="24" y1="44" x2="45" y2="41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Chain / Drive (Darker) */}
                      <line x1="24" y1="44" x2="42" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />

                      {/* Engine Area block */}
                      <rect x="40" y="34" width="11" height="10" rx="2" fill="currentColor" className="text-brand" />
                      <circle cx="45" cy="39" r="4" fill="black" opacity="0.3" />

                      {/* Front Forks */}
                      <line x1="76" y1="24" x2="65" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Handlebars */}
                      <line x1="60" y1="7" x2="70" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Main frame bars */}
                      <line x1="45" y1="41" x2="65" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="45" y1="41" x2="34" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="34" y1="25" x2="65" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                      {/* Seat (tilted dirt-bike seat) */}
                      <path d="M30 24 C38 24 48 22 54 20" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" />

                      {/* Exhaust pipe */}
                      <path d="M43 36 C36 36 30 32 26 29" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9" />
                    </g>
                  </svg>
                </motion.div>

                {/* Ground Dust/Drift Sparks particle escaping from the back wheel */}
                <motion.div
                  animate={{ 
                    x: [0, -35, -20], 
                    y: [0, -5, 0],
                    opacity: [0, 0.9, 0],
                    scale: [0.5, 1.5, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.6, 
                    ease: "easeOut" 
                  }}
                  className="absolute bottom-[6px] left-[18px] w-2.5 h-2.5 bg-brand/40 rounded-full blur-[1px]"
                />
              </div>

              <h2 className="font-display font-black text-2xl tracking-wider text-white uppercase italic flex items-center gap-1.5">
                RIX<span className="text-brand">COMPOUND</span>
              </h2>

              <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono mt-1">
                 Stellenbosch, South Africa
              </p>

              {/* Smooth Sweeping Progress Bar */}
              <div className="w-48 h-[3px] bg-neutral-900 rounded-full overflow-hidden mt-8 border border-neutral-800">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-brand shadow-[0_0_10px_#ff8c00]"
                />
              </div>

              {/* Status phrase logs */}
              <div className="h-4 mt-3 flex items-center justify-center">
                <span className="text-[9px] font-mono tracking-widest text-brand font-bold uppercase animate-pulse">
                  {loadText}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Redesigned Header Menu */}
      {currentPage !== 'admin' && <Navigation />}

      {/* Floating Notification Bubble for Rental Requirements (Only visible on home page) */}
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
          <div className="relative overflow-hidden rounded-xl bg-neutral-950 border-2 border-amber-500 shadow-[0_15px_35px_rgba(234,179,8,0.3)] p-3 pr-8 hover:border-amber-400 hover:shadow-[0_20px_40px_rgba(234,179,8,0.45)] transition-all duration-300">
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

      {/* Floating "Book Online" Button */}
      <AnimatePresence>
        {showFloatingBookBtn && currentPage === 'home' && (
          <motion.button
            key="floating-book-btn"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => navigateTo('booking')}
            className="fixed bottom-6 right-6 md:left-6 md:right-auto z-[45] flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer border border-emerald-400/30"
          >
            <Bike className="w-4 h-4 animate-bounce" />
            <span>Book Online</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main content flow */}
      <main className="flex-1 w-full flex flex-col">
        {currentPage === 'home' && (
          <>
            {/* Hero Welcome */}
            <Hero />

            {/* Render rest of sections immediately under the loader so they are ready when loader fades out.
                This completely prevents any post-loader mounting lag on mobile! */}
            <Track />

            <PricingCalculator />

            <EventsGallery />

            <AboutContact />
          </>
        )}

        {currentPage === 'booking' && (
          <BookingPage />
        )}

        {currentPage === 'mybookings' && (
          <MyBookings />
        )}

        {currentPage === 'ticket' && (
          <TicketPage bookingId={currentBookingId} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}
