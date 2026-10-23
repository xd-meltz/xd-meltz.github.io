/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import WebsiteBackground from './components/WebsiteBackground';
import Hero from './components/Hero';
import RiderRequirements from './components/RiderRequirements';
import Track from './components/Track';
import PricingCalculator from './components/PricingCalculator';
import EventsGallery from './components/EventsGallery';
import AboutContact from './components/AboutContact';
import BookingPage from './components/BookingPage';
import TicketPage from './components/TicketPage';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import TermsModal from './components/TermsModal';

// Custom navigation emitter helper
export function navigateTo(page: 'home' | 'booking' | 'ticket' | 'admin' | 'mybookings', bookingId?: string) {
  window.dispatchEvent(new CustomEvent('navigate', { detail: { page, bookingId } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'ticket' | 'admin' | 'mybookings'>('home');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

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
      setShowTermsModal(true);
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
        if (page === 'booking') {
          setShowTermsModal(true);
        } else {
          setCurrentPage(page);
          if (bookingId) {
            setCurrentBookingId(bookingId);
          }
        }
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, [hasAcceptedTerms]);

  return (
    <div id="appRoot" className="min-h-screen bg-zinc-950 text-white flex flex-col relative font-sans antialiased selection:bg-brand selection:text-white">
      {/* Dynamic Website Background featuring all 19 photos from Google Drive */}
      <WebsiteBackground />

      {/* Terms & Conditions Acceptance Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setHasAcceptedTerms(true);
          setShowTermsModal(false);
          setCurrentPage('booking');
        }}
      />

      {/* Redesigned Header Menu */}
      {currentPage !== 'admin' && <Navigation />}

      {/* Main content flow */}
      <main className="flex-1 w-full flex flex-col relative z-10">
        {currentPage === 'home' && (
          <>
            <Hero />
            <PricingCalculator />
            <Track />
            <RiderRequirements />
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
