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
import { ShieldAlert, X, Bike } from 'lucide-react';

// Custom navigation emitter helper
export function navigateTo(page: 'home' | 'booking' | 'ticket' | 'admin', bookingId?: string) {
  window.dispatchEvent(new CustomEvent('navigate', { detail: { page, bookingId } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function App() {
  const [showNotification, setShowNotification] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'ticket' | 'admin'>('home');
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
      // Show when user scrolls down past 450px (beyond the hero book button)
      if (window.scrollY > 450) {
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
              {/* Pulsating & Rotating Sprocket Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-brand border-t-transparent shadow-[0_0_20px_rgba(255,140,0,0.5)] flex items-center justify-center mb-6"
              >
                <div className="w-10 h-10 rounded-full border-2 border-brand/40 border-b-transparent flex items-center justify-center">
                  <div className="w-3 h-3 bg-brand rounded-full animate-ping" />
                </div>
              </motion.div>

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

      {/* Floating "Book Online" Button for PC (desktop) */}
      <AnimatePresence>
        {showFloatingBookBtn && currentPage === 'home' && (
          <motion.button
            key="floating-book-btn"
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => navigateTo('booking')}
            className="fixed bottom-6 left-6 z-[45] hidden lg:flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer border border-emerald-400/30"
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
