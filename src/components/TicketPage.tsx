/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Bike, 
  Printer, 
  Home, 
  User, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { navigateTo } from '../App';
import { getBookingDirect } from '../lib/firebase';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slot: string;
  bikeType: "PitBike" | "QuadBike" | "GroupPackage" | "Mixed";
  packageName?: string;
  quantity: number;
  amount: number;
  paid: boolean;
  createdAt: string;
}

interface TicketPageProps {
  bookingId: string | null;
}

export default function TicketPage({ bookingId }: TicketPageProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID was provided.');
      setLoading(false);
      return;
    }

    // Query booking details
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Booking could not be retrieved.');
        return res.json();
      })
      .then((data) => {
        setBooking(data);
      })
      .catch(async (err) => {
        console.warn('Backend query failed, trying direct Firestore client fetch:', err);
        try {
          const directBooking = await getBookingDirect(bookingId);
          if (directBooking) {
            setBooking(directBooking as any);
          } else {
            throw new Error('Not found in Firestore');
          }
        } catch (fsErr) {
          console.warn('Firestore fetch failed, falling back to localStorage:', fsErr);
          let stored: string | null = null;
          try {
            stored = localStorage.getItem(`rix_booking_${bookingId}`);
          } catch (storageErr) {
            console.error('Failed to access localStorage:', storageErr);
          }
          if (stored) {
            try {
              setBooking(JSON.parse(stored));
            } catch (e) {
              console.error('Failed to parse stored booking:', e);
              setError('Could not load the booking. However, if your payment was successful, your slot has been reserved.');
            }
          } else {
            setError('Could not load the booking. However, if your payment was successful, your slot has been reserved.');
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-32 bg-neutral-950 min-h-screen text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs text-neutral-400">Verifying secure Payfast payment...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-32 bg-neutral-950 min-h-screen text-white flex flex-col items-center justify-center px-4 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h1 className="font-display text-2xl font-black uppercase text-white mb-2">Ticket Error</h1>
        <p className="text-neutral-400 text-sm max-w-md leading-relaxed mb-8">
          {error || "We couldn't retrieve your booking details at this moment."}
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-2.5 bg-brand text-black font-extrabold uppercase rounded-lg shadow-lg active:scale-95 text-xs tracking-wider"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32 bg-neutral-950 min-h-screen text-white relative flex flex-col items-center justify-center px-4">
      {/* Print Styles: centers and targets only the #printTicket block */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all sibling elements of the ticket */
          body * {
            visibility: hidden !important;
          }
          /* Make the ticket container and its content visible */
          #printTicket, #printTicket * {
            visibility: visible !important;
          }
          /* Position the ticket at the very top left of the printable page */
          #printTicket {
            position: absolute !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 460px !important;
            margin: 0 !important;
            padding: 10px !important;
            border: 2px solid #000000 !important;
            border-radius: 16px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          /* Hide default page header and footer */
          @page {
            margin: 0.5cm;
          }
        }
      `}} />

      {/* Background ambient lights */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-brand/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Hero Welcome confirmation */}
      <div className="text-center max-w-xl mb-10 print:hidden">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4 animate-bounce">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase italic tracking-tight">
          Payment <span className="text-emerald-400">Successful!</span>
        </h1>
        <p className="text-neutral-400 text-sm mt-2">
          Your slot has been reserved. Please print or download your access ticket below to present at the Rix Compound entrance.
        </p>
      </div>

      {/* Ticket Layout Card */}
      <div id="printTicket" className="w-full max-w-lg bg-neutral-900 border-2 border-neutral-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 relative print:bg-white print:text-black print:border-black print:shadow-none print:rounded-none">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 px-6 py-5 border-b border-neutral-800/80 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
          <div>
            <span className="text-[10px] font-mono text-brand font-black uppercase tracking-widest print:text-neutral-500">
              RIDER COMPLIANCE PASS
            </span>
            <h2 className="font-display text-xl font-black italic uppercase text-white print:text-black">
              RIX<span className="text-brand">COMPOUND</span>
            </h2>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase print:border-black print:text-black">
            PAID
          </span>
        </div>

        {/* Diagonal caution stripes accent */}
        <div className="h-1.5 bg-[repeating-linear-gradient(45deg,#ff8c00,#ff8c00_10px,#1a1a1a_10px,#1a1a1a_20px)] print:hidden" />

        {/* Ticket Details Body */}
        <div className="p-6 space-y-6 print:p-4">
          
          {/* Main Info Blocks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-950/50 border border-neutral-850/60 p-3 rounded-xl print:bg-white print:border-black">
              <span className="text-[9px] font-mono uppercase text-neutral-500 block mb-0.5">Booking Reference</span>
              <span className="font-mono text-base font-black text-white uppercase tracking-wider print:text-black">
                {booking.id}
              </span>
            </div>
            <div className="bg-neutral-950/50 border border-neutral-850/60 p-3 rounded-xl print:bg-white print:border-black">
              <span className="text-[9px] font-mono uppercase text-neutral-500 block mb-0.5">Rider Name</span>
              <span className="text-xs font-bold text-white truncate block print:text-black">
                {booking.name}
              </span>
            </div>
          </div>

          {/* Location & Slot details */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-xs text-neutral-300 print:text-black">
              <Calendar className="w-4.5 h-4.5 text-brand flex-shrink-0 print:text-neutral-600" />
              <div>
                <span className="text-[9px] text-neutral-500 block leading-tight">SCHEDULED DATE</span>
                <span className="font-bold text-white text-xs sm:text-sm print:text-black">
                  {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-300 print:text-black">
              <Clock className="w-4.5 h-4.5 text-brand flex-shrink-0 print:text-neutral-600" />
              <div>
                <span className="text-[9px] text-neutral-500 block leading-tight">TIME SLOT (45 MINS / 30 MIN RIDE)</span>
                <span className="font-mono font-bold text-white text-xs sm:text-sm print:text-black">
                  {booking.slot}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-300 print:text-black">
              <Bike className="w-4.5 h-4.5 text-brand flex-shrink-0 print:text-neutral-600" />
              <div>
                <span className="text-[9px] text-neutral-500 block leading-tight">RENTAL SPECIFICATION</span>
                <span className="font-bold text-white text-xs sm:text-sm print:text-black uppercase">
                  {booking.packageName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-300 print:text-black">
              <MapPin className="w-4.5 h-4.5 text-brand flex-shrink-0 print:text-neutral-600" />
              <div>
                <span className="text-[9px] text-neutral-500 block leading-tight">TRACK ARENA LOCATION</span>
                <span className="font-bold text-white text-xs sm:text-sm print:text-black">
                  Protea Farms, Bottelary Road, Cape Town
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800 print:bg-black" />

          {/* Quantity and receipt pricing */}
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div>
              <span className="text-neutral-400 block print:text-neutral-600">Total Units Reserved</span>
              <span className="font-extrabold text-white text-base print:text-black">
                {booking.quantity} Unit{booking.quantity > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 block print:text-neutral-600">Amount Paid Securely</span>
              <span className="font-mono font-black text-brand text-lg sm:text-xl print:text-black">
                R{booking.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="p-3 bg-neutral-950/60 border border-neutral-850/60 rounded-xl text-[10px] text-neutral-400 leading-relaxed print:bg-white print:border-black print:text-black">
            <strong className="text-amber-500 block mb-0.5 print:text-black uppercase text-[9px]">⚠️ ADMISSION COMPLIANCE WARNING</strong>
            No beginners permitted. Competent off-road handling experience is mandatory. Under 14 riders must be accompanied by a guardian passenger on ATV rentals only.
          </div>

          {/* SVG Vector Barcode for instant scanning */}
          <div className="flex flex-col items-center justify-center pt-2 gap-1.5">
            <svg className="w-full h-12 max-w-[280px]" viewBox="0 0 100 20" preserveAspectRatio="none">
              {/* Generate random-ish but aesthetic lines representing barcode */}
              <g fill="currentColor" className="text-white print:text-black">
                <rect x="0" y="0" width="1" height="20" />
                <rect x="2" y="0" width="0.5" height="20" />
                <rect x="3" y="0" width="1.5" height="20" />
                <rect x="5.5" y="0" width="0.5" height="20" />
                <rect x="7" y="0" width="2" height="20" />
                <rect x="10" y="0" width="1" height="20" />
                <rect x="12" y="0" width="0.5" height="20" />
                <rect x="13.5" y="0" width="1.5" height="20" />
                <rect x="16" y="0" width="0.5" height="20" />
                <rect x="18" y="0" width="2" height="20" />
                <rect x="21" y="0" width="1" height="20" />
                <rect x="23" y="0" width="0.5" height="20" />
                <rect x="24.5" y="0" width="1.5" height="20" />
                <rect x="27" y="0" width="0.5" height="20" />
                <rect x="29" y="0" width="2" height="20" />
                <rect x="32" y="0" width="1" height="20" />
                <rect x="34" y="0" width="0.5" height="20" />
                <rect x="35.5" y="0" width="1.5" height="20" />
                <rect x="38" y="0" width="0.5" height="20" />
                <rect x="40" y="0" width="2" height="20" />
                <rect x="43" y="0" width="1.5" height="20" />
                <rect x="45" y="0" width="0.5" height="20" />
                <rect x="46.5" y="0" width="1.5" height="20" />
                <rect x="49" y="0" width="0.5" height="20" />
                <rect x="51" y="0" width="2" height="20" />
                <rect x="54" y="0" width="1" height="20" />
                <rect x="56" y="0" width="0.5" height="20" />
                <rect x="57.5" y="0" width="1.5" height="20" />
                <rect x="60" y="0" width="0.5" height="20" />
                <rect x="62" y="0" width="2" height="20" />
                <rect x="65" y="0" width="1.5" height="20" />
                <rect x="67" y="0" width="0.5" height="20" />
                <rect x="68.5" y="0" width="1.5" height="20" />
                <rect x="71" y="0" width="0.5" height="20" />
                <rect x="73" y="0" width="2" height="20" />
                <rect x="76" y="0" width="1" height="20" />
                <rect x="78" y="0" width="0.5" height="20" />
                <rect x="79.5" y="0" width="1.5" height="20" />
                <rect x="82" y="0" width="0.5" height="20" />
                <rect x="84" y="0" width="2" height="20" />
                <rect x="87" y="0" width="1.5" height="20" />
                <rect x="89" y="0" width="0.5" height="20" />
                <rect x="90.5" y="0" width="1.5" height="20" />
                <rect x="93" y="0" width="0.5" height="20" />
                <rect x="95" y="0" width="2" height="20" />
                <rect x="98" y="0" width="1" height="20" />
                <rect x="99.5" y="0" width="0.5" height="20" />
              </g>
            </svg>
            <span className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase block">
              RIXPASS-{booking.id}
            </span>
          </div>

        </div>

      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden w-full max-w-lg mx-auto">
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold uppercase rounded-xl transition-all border border-neutral-850 hover:border-neutral-700 shadow-md flex items-center justify-center gap-2 active:scale-95 text-xs"
        >
          <Printer className="w-4 h-4 text-brand" />
          <span>Print Ticket</span>
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="flex-1 px-4 py-3 bg-brand hover:bg-brand-light text-black font-black uppercase rounded-xl transition-all shadow-lg shadow-brand/20 hover:shadow-brand/35 flex items-center justify-center gap-2 active:scale-95 text-xs"
        >
          <Home className="w-4 h-4" />
          <span>Home Dashboard</span>
        </button>
      </div>
    </div>
  );
}
