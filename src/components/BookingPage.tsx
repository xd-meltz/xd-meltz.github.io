/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CryptoJS from 'crypto-js';
import { 
  Calendar, 
  Clock, 
  Bike, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle, 
  CreditCard, 
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import { navigateTo } from '../App';
import { getAvailabilityDirect, createBookingDirect } from '../lib/firebase';

interface Availability {
  pitbikes: number;
  quadbikes: number;
}

export default function BookingPage({ isInline = false }: { isInline?: boolean }) {
  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bikeType, setBikeType] = useState<'PitBike' | 'QuadBike' | 'GroupPackage' | 'Mixed'>('Mixed');
  const [pitBikeQty, setPitBikeQty] = useState(1);
  const [quadBikeQty, setQuadBikeQty] = useState(0);
  const [groupSize, setGroupSize] = useState<5 | 10>(5);
  const [groupDuration, setGroupDuration] = useState<30 | 60 | 240>(60);
  const [quantity, setQuantity] = useState(1);

  // Calendar navigation states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Status & Fetching
  const [availability, setAvailability] = useState<Record<string, Availability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date constraints (You cannot book on the day, and you can only book a month ahead)
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [closedDates, setClosedDates] = useState<string[]>([]);

  // Calculate min and max dates on mount
  useEffect(() => {
    const today = new Date();
    
    // Tomorrow is the min booking date (cannot book on the day)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // 1 Month ahead is the max booking date
    const oneMonthAhead = new Date(today);
    oneMonthAhead.setMonth(today.getMonth() + 1);
    oneMonthAhead.setDate(today.getDate() + 1);

    // Format as YYYY-MM-DD
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setMinDate(formatDate(tomorrow));
    setMaxDate(formatDate(oneMonthAhead));

    // Fetch closed dates
    fetch('/api/closed-dates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const dates = data.map((item: any) => item.date);
          setClosedDates(dates);
        }
      })
      .catch(async (err) => {
        console.warn('Failed to fetch closed dates from server, trying direct Firestore:', err);
        try {
          const { getClosedDatesDirect } = await import('../lib/firebase');
          const data = await getClosedDatesDirect();
          const dates = data.map((item: any) => item.date);
          setClosedDates(dates);
        } catch (fsErr) {
          console.error('Failed to fetch closed dates from Firestore:', fsErr);
        }
      });
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (!date) return;

    setLoadingAvailability(true);
    setError(null);
    setSelectedSlot('');

    // If day of week changes, default the bike type appropriately
    const dayOfWeek = new Date(date).getDay(); // 0 is Sunday, 6 is Saturday, 5 is Friday
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4;
    if (isWeekday) {
      setBikeType('GroupPackage');
    } else {
      setBikeType('Mixed');
    }

    fetch(`/api/availability?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch slot availability');
        return res.json();
      })
      .then((data) => {
        setAvailability(data);
      })
      .catch(async (err) => {
        console.warn('Backend fetch failed, trying direct Firestore client fetch:', err);
        try {
          const data = await getAvailabilityDirect(date);
          setAvailability(data);
        } catch (fsErr) {
          console.error('Firestore direct fetch also failed, using default fallback:', fsErr);
          // Fallback: build default full availability for all slots, checking Sunday limit
          const [year, month, day] = date.split('-').map(Number);
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          const defaultSlots = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"];
          const fallbackMap: Record<string, Availability> = {};
          defaultSlots.forEach(slot => {
            if (dayOfWeek === 0 && slot === "14:15") return;
            fallbackMap[slot] = { pitbikes: 8, quadbikes: 2 };
          });
          setAvailability(fallbackMap);
        }
      })
      .finally(() => {
        setLoadingAvailability(false);
      });
  }, [date]);

  const isWeekendSelected = () => {
    if (!date) return false;
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5; // Sunday, Saturday, or Friday
  };

  // Pricing Calculation
  const getPrice = () => {
    if (bikeType === 'GroupPackage') {
      if (groupDuration === 30) {
        return groupSize === 5 ? 1500 : 3000;
      } else if (groupDuration === 60) {
        return groupSize === 5 ? 3000 : 5000;
      } else if (groupDuration === 240) { // 4 Hours
        return groupSize === 5 ? 8000 : 15200;
      }
    } else {
      return (250 * pitBikeQty) + (300 * quadBikeQty);
    }
    return 0;
  };

  const getSlotAvailabilityText = (slot: string) => {
    const slotAvail = availability[slot];
    if (!slotAvail) return '';
    
    return `Pitbikes: ${slotAvail.pitbikes}/8 | Quads: ${slotAvail.quadbikes}/2`;
  };

  const isSlotDisabled = (slot: string) => {
    const slotAvail = availability[slot];
    if (!slotAvail) return true;

    if (isWeekendSelected()) {
      if (pitBikeQty === 0 && quadBikeQty === 0) {
        return slotAvail.pitbikes <= 0 && slotAvail.quadbikes <= 0;
      }
      return slotAvail.pitbikes < pitBikeQty || slotAvail.quadbikes < quadBikeQty;
    } else {
      // Weekdays: group packages
      // If we are booking a group package of 10, we require 8 pitbikes and 2 quads.
      // If we are booking a group package of 5, we require 5 pitbikes.
      if (groupSize === 10) {
        return slotAvail.pitbikes < 8 || slotAvail.quadbikes < 2;
      } else {
        return slotAvail.pitbikes < 5;
      }
    }
  };

  // Submit and redirect to Payfast Secure Checkout
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !date || !selectedSlot) {
      setError('Please fill out all required fields and select an available slot.');
      return;
    }

    // Capacity checks
    const slotAvail = availability[selectedSlot];
    if (slotAvail) {
      if (bikeType === 'Mixed') {
        if (pitBikeQty === 0 && quadBikeQty === 0) {
          setError('Please select at least one bike to book.');
          return;
        }
        if (pitBikeQty > slotAvail.pitbikes) {
          setError(`Only ${slotAvail.pitbikes} pitbikes are available for this slot.`);
          return;
        }
        if (quadBikeQty > slotAvail.quadbikes) {
          setError(`Only ${slotAvail.quadbikes} quad bikes are available for this slot.`);
          return;
        }
      } else if (bikeType === 'GroupPackage') {
        if (groupSize === 10) {
          if (slotAvail.pitbikes < 8 || slotAvail.quadbikes < 2) {
            setError(`The track does not have full 10-bike capacity (8 pitbikes & 2 quads) available for this slot.`);
            return;
          }
        } else {
          if (slotAvail.pitbikes < 5) {
            setError(`Only ${slotAvail.pitbikes} pitbikes are available. We need 5 available pitbikes for this group package.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);

    const bookingPayload = {
      name,
      email,
      phone,
      date,
      slot: selectedSlot,
      bikeType,
      packageName: bikeType === 'GroupPackage' 
        ? `Group Package (${groupDuration === 240 ? '4 Hours' : `${groupDuration} Mins`}, ${groupSize} Bikes)` 
        : `Weekend Rental (${pitBikeQty > 0 ? `${pitBikeQty} Pit` : ''}${pitBikeQty > 0 && quadBikeQty > 0 ? ' & ' : ''}${quadBikeQty > 0 ? `${quadBikeQty} Quad` : ''})`,
      quantity: bikeType === 'GroupPackage' ? groupSize : (pitBikeQty + quadBikeQty),
      pitBikeQty: bikeType === 'Mixed' ? pitBikeQty : undefined,
      quadBikeQty: bikeType === 'Mixed' ? quadBikeQty : undefined,
      amount: getPrice(),
      paid: false, // explicitly set paid to false initially
    };

    const proceedWithBookingId = (bookingId: string) => {
      // Save local backup to localStorage for the ticket page
      const localBooking = {
        id: bookingId,
        name,
        email,
        phone,
        date,
        slot: selectedSlot,
        bikeType,
        packageName: bookingPayload.packageName,
        quantity: bookingPayload.quantity,
        pitBikeQty: bookingPayload.pitBikeQty,
        quadBikeQty: bookingPayload.quadBikeQty,
        amount: bookingPayload.amount,
        paid: false, // do not assume paid yet; it will be marked paid upon successful callback/redirect
        createdAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(`rix_booking_${bookingId}`, JSON.stringify(localBooking));
      } catch (e) {
        console.error('Failed to write to localStorage:', e);
      }

      // Form post payload to Payfast
      const payfastForm = document.createElement('form');
      payfastForm.method = 'POST';
      payfastForm.action = 'https://sandbox.payfast.co.za/eng/process';

      const fields: Record<string, string> = {
        merchant_id: '10051106',
        merchant_key: 'w3q3a42d6my8m',
        return_url: `${window.location.origin}/?page=ticket&bookingId=${bookingId}`,
        cancel_url: `${window.location.origin}/?page=booking`,
        notify_url: `${window.location.origin}/api/payfast-itn`,
        name_first: name.split(' ')[0] || 'Guest',
        name_last: name.split(' ').slice(1).join(' ') || 'Rider',
        email_address: email,
        m_payment_id: bookingId,
        amount: getPrice().toFixed(2),
        item_name: `Rix Compound Booking - ${bookingPayload.packageName} on ${date} at ${selectedSlot}`,
      };

      // Filter out empty or whitespace-only parameters so we only sign and submit valid fields
      const activeFields: Record<string, string> = {};
      Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val.trim() !== '') {
          activeFields[key] = val.trim();
        }
      });

      // 1. Sort keys alphabetically (Payfast requirement)
      const sortedKeys = Object.keys(activeFields).sort();

      // Helper function to match standard PHP urlencode / browser form submission encoding exactly
      const payfastEncode = (str: string) => {
        return encodeURIComponent(str)
          .replace(/%20/g, '+')
          .replace(/!/g, '%21')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/\*/g, '%2A');
      };

      // 2. Build parameter string for signature
      let pfOutput = "";
      sortedKeys.forEach((key) => {
        pfOutput += `${key}=${payfastEncode(activeFields[key])}&`;
      });
      let signatureString = pfOutput.slice(0, -1);

      // 3. No passphrase appended (removed as per instructions)
      console.group('=== Payfast Signature Generation Debugging ===');
      console.log('Active fields:', activeFields);
      console.log('Sorted keys:', sortedKeys);
      console.log('Final concatenated string to be MD5 hashed:', signatureString);

      // 4. Generate MD5 signature
      const signature = CryptoJS.MD5(signatureString).toString();
      console.log('Generated MD5 signature:', signature);
      console.groupEnd();

      // 5. Append ONLY the signed active fields to the form
      sortedKeys.forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = activeFields[key];
        payfastForm.appendChild(input);
      });

      // 6. Append signature field
      const sigInput = document.createElement('input');
      sigInput.type = 'hidden';
      sigInput.name = 'signature';
      sigInput.value = signature;
      payfastForm.appendChild(sigInput);

      document.body.appendChild(payfastForm);
      payfastForm.submit();
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(async (booking) => {
        // Also sync to Firestore client-side for redundancy/static sites
        try {
          await createBookingDirect(booking.id, bookingPayload);
        } catch (fsErr) {
          console.warn('Sync to Firestore on API success failed:', fsErr);
        }
        proceedWithBookingId(booking.id);
      })
      .catch(async (err) => {
        console.warn('Backend booking failed, trying client-side Firestore creation:', err);
        const fallbackId = 'rix-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        try {
          await createBookingDirect(fallbackId, bookingPayload);
          proceedWithBookingId(fallbackId);
        } catch (fbErr) {
          console.error('Firestore save also failed, proceeding with localStorage fallback only:', fbErr);
          proceedWithBookingId(fallbackId);
        }
      });
  };

  const dayOfWeekName = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' }) : '';

  const renderCapacityDots = (slot: string) => {
    const slotAvail = availability[slot];
    if (!slotAvail) return null;

    const totalPitbikes = 8;
    const totalQuadbikes = 2;

    const availablePit = slotAvail.pitbikes;
    const availableQuad = slotAvail.quadbikes;

    return (
      <div className="mt-2.5 pt-2 border-t border-neutral-900/60 w-full space-y-1.5 text-left">
        {/* Pit Bike Dots */}
        <div>
          <div className="flex items-center justify-between text-[7.5px] text-neutral-400 font-mono tracking-wide leading-none mb-1">
            <span>PIT ({availablePit}/8)</span>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {Array.from({ length: totalPitbikes }).map((_, i) => {
              const isAvailable = i < availablePit;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                      : 'bg-red-500 border border-red-500/30'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Quad Bike Dots */}
        <div>
          <div className="flex items-center justify-between text-[7.5px] text-neutral-400 font-mono tracking-wide leading-none mb-1">
            <span>QUAD ({availableQuad}/2)</span>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {Array.from({ length: totalQuadbikes }).map((_, i) => {
              const isAvailable = i < availableQuad;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                      : 'bg-red-500 border border-red-500/30'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={isInline ? "w-full text-white" : "py-24 sm:py-32 bg-neutral-950 min-h-screen text-white relative"}>
      {!isInline && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-dark/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      <div className={isInline ? "w-full" : "max-w-4xl mx-auto px-4"}>
        {/* Navigation back */}
        {!isInline && (
          <button 
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-brand/40 text-neutral-300 hover:text-white rounded-lg mb-8 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Header */}
        {!isInline && (
          <div className="mb-6 text-center sm:text-left">
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight italic">
              Online <span className="text-brand">Booking</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
              Quickly and easily secure your track time.
            </p>
          </div>
        )}

        {/* Bring Your Own Bike Info Card at the Top */}
        <div className="bg-emerald-950/20 border border-emerald-900/35 p-4 sm:p-5 rounded-2xl mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl mt-0.5">🚲</span>
            <div>
              <h4 className="font-black text-xs sm:text-sm uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 flex-wrap">
                <span>Bringing Your Own Bike?</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono rounded font-black">
                  NO ONLINE BOOKING REQUIRED
                </span>
                <span className="px-1.5 py-0.5 bg-brand/10 border border-brand/30 text-brand text-[9px] font-mono rounded font-black">
                  PAY ON SITE
                </span>
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1.5">
                If you are bringing your own bike, <span className="text-white font-bold">you do not need to book online</span>. Simply show up at the compound, pay <span className="text-emerald-400 font-black">R150 on site</span>, and you're ready to ride!
              </p>
            </div>
          </div>
        </div>



        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-400 text-sm">Booking Action Required</h4>
              <p className="text-neutral-300 text-xs sm:text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Main inputs */}
          <div className="md:col-span-7 bg-neutral-900/40 border border-neutral-850 p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6">
            
            {/* Step 1: Personal info */}
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand mb-4 flex items-center gap-1.5">
                <span className="bg-brand/10 border border-brand/30 text-brand px-2 py-0.5 rounded text-[10px] font-mono">01</span>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono uppercase text-neutral-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your first and last name"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-base md:text-sm focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-mono uppercase text-neutral-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rider@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-base md:text-sm focus:border-brand focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-mono uppercase text-neutral-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0768299919"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-base md:text-sm focus:border-brand focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800/60" />

            {/* Step 2: Date Selector */}
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand mb-4 flex items-center gap-1.5">
                <span className="bg-brand/10 border border-brand/30 text-brand px-2 py-0.5 rounded text-[10px] font-mono">02</span>
                Choose Date
              </h3>
              <div className="space-y-4">
                {/* Visual Calendar UI */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-inner">
                  {/* Calendar Month Selector Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-850">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(y => y - 1);
                        } else {
                          setCurrentMonth(m => m - 1);
                        }
                      }}
                      disabled={currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth()}
                      className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="font-display font-extrabold uppercase italic text-xs sm:text-sm tracking-wide text-white">
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentMonth]} {currentYear}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(y => y + 1);
                        } else {
                          setCurrentMonth(m => m + 1);
                        }
                      }}
                      disabled={(() => {
                        const nextMonthLimit = new Date();
                        nextMonthLimit.setMonth(new Date().getMonth() + 1);
                        return currentYear === nextMonthLimit.getFullYear() && currentMonth === nextMonthLimit.getMonth();
                      })()}
                      className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-brand/40 hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Weekday Names */}
                  <div className="grid grid-cols-7 text-center gap-1 sm:gap-2 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <span key={i} className="text-[10px] font-mono text-neutral-500 uppercase font-bold py-1">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {(() => {
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      // Monday starts at index 0, so subtract 1 and wrap with % 7
                      const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
                      
                      const cells = [];
                      
                      // Empty cells for first day alignment
                      for (let i = 0; i < firstDayIndex; i++) {
                        cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                      }
                      
                      // Days
                      for (let d = 1; d <= daysInMonth; d++) {
                        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
                        const isClosed = closedDates.includes(dateString);
                        // Only available on Fridays, Saturdays and Sundays (isWeekend) and not closed by admin
                        const isSelectable = dateString >= minDate && dateString <= maxDate && isWeekend && !isClosed;
                        const isSelected = date === dateString;

                        cells.push(
                          <button
                            type="button"
                            key={`day-${d}`}
                            disabled={isClosed || !isSelectable}
                            onClick={() => setDate(dateString)}
                            className={`aspect-square w-full rounded-lg text-xs font-mono transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/35 scale-105 z-10'
                                : isClosed
                                  ? 'bg-red-950/50 border border-red-500/40 text-red-500 cursor-not-allowed font-bold'
                                  : !isSelectable
                                    ? 'text-neutral-700 bg-neutral-950/25 cursor-not-allowed opacity-20'
                                    : 'text-emerald-500 hover:bg-neutral-800 hover:text-white font-bold bg-neutral-900/30'
                            }`}
                          >
                            <span className="text-xs">{d}</span>
                            {isClosed ? (
                              <span className="text-[7.5px] font-black tracking-tight text-red-400 uppercase leading-none mt-1">Closed</span>
                            ) : isSelectable && !isSelected ? (
                              <span className="w-1 h-1 rounded-full absolute bottom-1 bg-emerald-500" />
                            ) : null}
                          </button>
                        );
                      }
                      
                      return cells;
                    })()}
                  </div>
                </div>

                {date && (
                  <p className="text-xs text-brand font-mono">
                    Selected day: <span className="font-bold underline">{dayOfWeekName}</span>
                  </p>
                )}
                <div className="p-3 bg-neutral-950/60 border border-neutral-850/60 rounded-xl text-neutral-400 text-[11px] leading-relaxed flex items-start gap-2">
                  <span className="text-amber-500">📅</span>
                  <div>
                    <span className="text-white font-bold">Booking Window Constraints:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>You cannot book on the day of riding.</li>
                      <li>Reservations are strictly capped to 1 month ahead.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {date && (
              <>
                <div className="w-full h-px bg-neutral-800/60" />

                {/* Step 3: Package Selector */}
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand mb-4 flex items-center gap-1.5">
                    <span className="bg-brand/10 border border-brand/30 text-brand px-2 py-0.5 rounded text-[10px] font-mono">03</span>
                    Rental Package
                  </h3>

                  {!isWeekendSelected() ? (
                    /* Weekday packages */
                    <div className="space-y-4">
                      <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl">
                        <span className="px-2 py-0.5 bg-neutral-850 text-neutral-300 text-[9px] font-mono font-bold uppercase tracking-wider rounded">
                          Monday – Thursday Only
                        </span>
                        <h4 className="text-white font-extrabold text-sm uppercase mt-1.5">Weekday Group Track Package</h4>
                        <p className="text-neutral-400 text-[11px] leading-relaxed mt-1">
                          Select your desired session duration and group size below. All prices match our standard weekday packages:
                        </p>

                        {/* Session Duration Selector */}
                        <div className="mt-4">
                          <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                            Session Duration
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: '30 Min', value: 30 },
                              { label: '60 Min', value: 60 },
                              { label: '4 Hours', value: 240 }
                            ].map((dur) => (
                              <button
                                type="button"
                                key={dur.value}
                                onClick={() => setGroupDuration(dur.value as 30 | 60 | 240)}
                                className={`py-2 px-2 rounded-lg border font-bold text-center text-xs transition-all ${
                                  groupDuration === dur.value
                                    ? 'border-brand bg-brand/10 text-brand'
                                    : 'border-neutral-800 hover:border-neutral-750 bg-neutral-950'
                                }`}
                              >
                                {dur.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Group Size Selector */}
                        <div className="mt-4">
                          <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                            Group size (Pitbikes included)
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setBikeType('GroupPackage');
                                setGroupSize(5);
                              }}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                bikeType === 'GroupPackage' && groupSize === 5
                                  ? 'border-brand bg-brand/10 text-brand'
                                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'
                              }`}
                            >
                              <Users className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold text-xs block">5 Bikes Package</span>
                              <span className="text-[10px] font-mono opacity-80">
                                R{groupDuration === 30 ? '1,500' : groupDuration === 60 ? '3,000' : '8,000'}
                              </span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setBikeType('GroupPackage');
                                setGroupSize(10);
                              }}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                bikeType === 'GroupPackage' && groupSize === 10
                                  ? 'border-brand bg-brand/10 text-brand'
                                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'
                              }`}
                            >
                              <Users className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold text-xs block">10 Bikes Package</span>
                              <span className="text-[10px] font-mono opacity-80">
                                R{groupDuration === 30 ? '3,000' : groupDuration === 60 ? '5,000' : '15,200'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Weekend rentals */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <span className="self-start px-2 py-0.5 bg-brand/10 border border-brand/30 text-brand text-[9px] font-mono font-bold uppercase tracking-wider rounded">
                          Friday, Saturday & Sunday Only
                        </span>
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          ⚠️ 30 Minutes of active riding time per slot
                        </span>
                      </div>

                      <div className="space-y-3 bg-neutral-900/30 p-4 rounded-xl border border-neutral-850">
                        {/* Pit Bike Selection */}
                        <div className="flex items-center justify-between gap-4 py-2 border-b border-neutral-800/40 last:border-b-0">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-brand" />
                              <h4 className="font-extrabold text-sm uppercase text-white">Pit Bike Rental</h4>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Fun, responsive 125cc pit bike</p>
                            <span className="font-mono text-xs text-brand font-bold mt-1 block">
                              R250 <span className="text-[10px] text-neutral-300 font-sans font-medium">per 30 min ride</span> <span className="text-[9px] text-neutral-500 font-sans font-normal">(45 min slots)</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.max(0, pitBikeQty - 1))}
                              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors text-lg font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {pitBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.min(8, pitBikeQty + 1))}
                              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Quad Bike Selection */}
                        <div className="flex items-center justify-between gap-4 py-2 border-b border-neutral-800/40 last:border-b-0">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-orange-500" />
                              <h4 className="font-extrabold text-sm uppercase text-white">Quad Bike Rental</h4>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Stable and solid quad action</p>
                            <span className="font-mono text-xs text-brand font-bold mt-1 block">
                              R300 <span className="text-[10px] text-neutral-300 font-sans font-medium">per 30 min ride</span> <span className="text-[9px] text-neutral-500 font-sans font-normal">(45 min slots)</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.max(0, quadBikeQty - 1))}
                              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors text-lg font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {quadBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.min(2, quadBikeQty + 1))}
                              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {pitBikeQty === 0 && quadBikeQty === 0 && (
                        <p className="text-[10px] text-red-500 font-mono mt-1">
                          ⚠️ Please select at least 1 bike to view slot availability.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-neutral-800/60" />

                {/* Step 4: Time Slots */}
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
                    <span className="bg-brand/10 border border-brand/30 text-brand px-2 py-0.5 rounded text-[10px] font-mono">04</span>
                    Choose Available Time Slots
                  </h3>
                  
                  {/* Interactive Visual Color Legend */}
                  <div className="flex items-center gap-4 mb-4 bg-neutral-950/60 py-2 px-3 rounded-xl border border-neutral-850 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
                      <span className="text-red-400 font-bold uppercase text-[10px]">Booked</span>
                    </div>
                  </div>

                  {loadingAvailability ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs font-mono text-neutral-500">Checking track availability...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.keys(availability).map((slot) => {
                        const disabled = isSlotDisabled(slot);
                        const selected = selectedSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={disabled}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                              disabled 
                                ? 'border-red-900/60 bg-red-950/10 opacity-80 cursor-not-allowed hover:border-red-800'
                                : selected
                                  ? 'border-emerald-400 bg-emerald-950/25 shadow-lg shadow-emerald-500/10 scale-102 ring-1 ring-emerald-500/30'
                                  : 'border-emerald-900/40 hover:border-emerald-500 bg-neutral-950 hover:bg-neutral-900/50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={`font-mono text-xs font-black tracking-wider ${
                                selected 
                                  ? 'text-emerald-400' 
                                  : disabled || availability[slot]?.isClosed
                                    ? 'text-red-500 line-through' 
                                    : 'text-emerald-300'
                              }`}>
                                {slot}
                              </span>
                              {availability[slot]?.isClosed ? (
                                <span className="text-[7.5px] font-extrabold text-amber-500 uppercase bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded leading-none">
                                  Closed
                                </span>
                              ) : disabled ? (
                                <span className="text-[7.5px] font-extrabold text-red-400 uppercase bg-red-950/80 border border-red-800/50 px-1.5 py-0.5 rounded leading-none">
                                  Booked
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-extrabold text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-850 px-1.5 py-0.5 rounded leading-none">
                                  Open
                                </span>
                              )}
                            </div>
                            
                            {/* Capacity Dots Indicator */}
                            {renderCapacityDots(slot)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Sidebar checkout summary */}
          <div className="md:col-span-5 space-y-6">
            <div id="booking-summary-panel" className="bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-white mb-4">
                Booking <span className="text-brand">Summary</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm border-b border-neutral-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Rider</span>
                  <span className="text-white font-semibold">{name || 'Guest Rider'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Date</span>
                  <span className="text-white font-semibold">{date ? `${date} (${dayOfWeekName})` : 'Select Date'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Time Slot</span>
                  <span className="text-white font-semibold font-mono">{selectedSlot || 'Select Slot'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Package Type</span>
                  <span className="text-brand font-bold uppercase text-right max-w-[180px] break-words">
                    {bikeType === 'GroupPackage' 
                      ? `Weekday Group (${groupDuration === 240 ? '4 Hours' : `${groupDuration} Mins`}, ${groupSize} Bikes)` 
                      : `Weekend Combined Rental`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Bike Quantity</span>
                  <span className="text-white font-semibold text-right">
                    {bikeType === 'GroupPackage' 
                      ? `${groupSize} Bikes` 
                      : `${pitBikeQty} Pit / ${quadBikeQty} Quad`}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-baseline mb-6">
                <span className="text-sm text-neutral-400 font-mono uppercase">Total Price</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-brand">
                  R{getPrice().toLocaleString()}
                </span>
              </div>

              {/* Safety Rules check */}
              <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl mb-6 text-[11px] leading-relaxed text-amber-300">
                <strong className="text-white block uppercase text-[9px] mb-1">🚧 Safety Prerequisite</strong>
                All riders must have competent off-road riding experience. No beginners are permitted to operate rental units.
              </div>

              <button
                type="submit"
                disabled={submitting || !date || !selectedSlot}
                className={`w-full py-3.5 px-4 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  submitting || !date || !selectedSlot
                    ? 'bg-neutral-850 border border-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-97'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{submitting ? 'Connecting to Payfast...' : 'Proceed to Payfast Checkout'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Floating "Go to Checkout" green arrow button */}
      <AnimatePresence>
        {date && selectedSlot && (isWeekendSelected() ? (pitBikeQty > 0 || quadBikeQty > 0) : true) && (
          <motion.button
            key="scroll-top-arrow"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => {
              const el = document.getElementById('booking-summary-panel');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="fixed bottom-6 right-6 z-[45] flex items-center gap-2 pl-4 pr-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer border border-emerald-400/30 group"
            title="Go to Checkout Summary"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            <span>Go to Checkout</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
