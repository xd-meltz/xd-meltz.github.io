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
  const [isLoaded] = useState(true);

  useEffect(() => {
    if (currentPage !== 'home') {
      setShowFloatingBookBtn(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > 300) {
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
    <div id="appRoot" className="min-h-screen bg-black text-zinc-100 flex flex-col relative font-sans antialiased selection:bg-brand selection:text-black">
      
      {/* Redesigned Header Menu */}
      {currentPage !== 'admin' && <Navigation />}

      {/* Simplified, Minimalist Floating "Book Online" Button */}
      <AnimatePresence>
        {showFloatingBookBtn && currentPage === 'home' && (
          <motion.button
            key="floating-book-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => navigateTo('booking')}
            className="fixed bottom-6 right-6 z-[45] flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider text-[11px] rounded-none border border-neutral-900 shadow-lg shadow-emerald-500/20 cursor-pointer transition-colors"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Book Online</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main content flow */}
      <main className="flex-1 w-full flex flex-col">
        {currentPage === 'home' && (
          <>
            <Hero />
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
