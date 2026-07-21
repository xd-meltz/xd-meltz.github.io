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
  ArrowUp,
  ArrowDown
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
  const [hasClickedGoToCheckout, setHasClickedGoToCheckout] = useState(false);

  // Reset checkout button click when inputs change
  useEffect(() => {
    setHasClickedGoToCheckout(false);
  }, [date, selectedSlot, name, email, pitBikeQty, quadBikeQty, groupSize, groupDuration, bikeType, quantity]);

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
    <div className={isInline ? "w-full text-white bg-black" : "py-16 sm:py-24 bg-black min-h-screen text-white relative"}>

      <div className={isInline ? "w-full" : "max-w-4xl mx-auto px-4"}>
        {/* Navigation back */}
        {!isInline && (
          <button 
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-white rounded-lg mb-8 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Header */}
        {!isInline && (
          <div className="mb-6 text-center sm:text-left">
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight italic">
              Online <span className="text-emerald-400">Booking</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
              Quickly and easily secure your track time.
            </p>
          </div>
        )}

        {/* Bring Your Own Bike Info Card at the Top */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl mt-0.5">🚲</span>
            <div>
              <h4 className="font-mono text-xs sm:text-sm uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 flex-wrap">
                <span>Bringing Your Own Bike?</span>
                <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-mono font-black">
                  NO ONLINE BOOKING REQUIRED
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black">
                  PAY ON SITE
                </span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
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
          <div className="md:col-span-7 border border-zinc-800 bg-zinc-950 p-6 space-y-8">
            
            {/* Step 1: Personal info */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5 font-bold">
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-mono">01</span>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-bold">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your first and last name"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-4 py-3 text-base md:text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rider@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-4 py-3 text-base md:text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-bold">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0768299919"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-4 py-3 text-base md:text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-900" />

            {/* Step 2: Date Selector */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5 font-bold">
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-mono">02</span>
                Choose Date
              </h3>
              <div className="space-y-4">
                {/* Visual Calendar UI */}
                <div className="bg-black border border-zinc-800 p-4">
                  {/* Calendar Month Selector Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
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
                      className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-none hover:border-emerald-500/45 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="font-mono font-bold uppercase italic text-xs tracking-wide text-white">
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
                      className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-none hover:border-emerald-500/45 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Weekday Names */}
                  <div className="grid grid-cols-7 text-center gap-1 sm:gap-2 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <span key={i} className="text-[10px] font-mono text-zinc-500 uppercase font-bold py-1">
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
                            className={`aspect-square w-full rounded-none text-xs font-mono transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-black font-black z-10'
                                : isClosed
                                  ? 'bg-zinc-950 border border-red-900/40 text-red-500 cursor-not-allowed font-bold'
                                  : !isSelectable
                                    ? 'text-zinc-800 bg-zinc-950/10 cursor-not-allowed opacity-25'
                                    : 'text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold bg-zinc-950 border border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                            }`}
                          >
                            <span className="text-xs">{d}</span>
                            {isClosed ? (
                              <span className="text-[7.5px] font-black tracking-tight text-red-400 uppercase leading-none mt-1">Closed</span>
                            ) : isSelectable && !isSelected ? (
                              <span className="w-1.5 h-1.5 rounded-none absolute bottom-1 bg-emerald-500" />
                            ) : null}
                          </button>
                        );
                      }
                      
                      return cells;
                     })()}
                  </div>
                </div>

                {date && (
                  <p className="text-xs text-emerald-400 font-mono">
                    Selected day: <span className="font-bold underline">{dayOfWeekName}</span>
                  </p>
                )}
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-none text-zinc-450 text-[11px] leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-400">📅</span>
                  <div>
                    <span className="text-white font-mono font-bold uppercase tracking-wider text-[10px]">Booking Window Constraints:</span>
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
                <div className="w-full h-px bg-zinc-900" />

                {/* Step 3: Package Selector */}
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-mono">03</span>
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
                                className={`py-2 px-2 rounded-none border font-mono font-bold text-center text-xs transition-all cursor-pointer ${
                                  groupDuration === dur.value
                                    ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                                }`}
                              >
                                {dur.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Group Size Selector */}
                        <div className="mt-4">
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Group size (Pitbikes included)
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                  setBikeType('GroupPackage');
                                  setGroupSize(5);
                                }}
                              className={`p-3 rounded-none border text-center transition-all cursor-pointer ${
                                bikeType === 'GroupPackage' && groupSize === 5
                                  ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                              }`}
                            >
                              <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                              <span className="font-mono font-bold text-xs block uppercase">5 Bikes Package</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                R{groupDuration === 30 ? '1,500' : groupDuration === 60 ? '3,000' : '8,000'}
                              </span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                  setBikeType('GroupPackage');
                                  setGroupSize(10);
                                }}
                              className={`p-3 rounded-none border text-center transition-all cursor-pointer ${
                                bikeType === 'GroupPackage' && groupSize === 10
                                  ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                              }`}
                            >
                              <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                              <span className="font-mono font-bold text-xs block uppercase">10 Bikes Package</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
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
                        <span className="self-start px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-none">
                          Friday, Saturday & Sunday Only
                        </span>
                        <span className="text-emerald-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-bold">
                          * 30 Minutes of active riding time per slot
                        </span>
                      </div>

                      <div className="space-y-3 bg-zinc-950 p-4 rounded-none border border-zinc-800">
                        {/* Pit Bike Selection */}
                        <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-900">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-emerald-400" />
                              <h4 className="font-mono font-bold text-xs uppercase text-white">Pit Bike Rental</h4>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Fun, responsive 125cc pit bike</p>
                            <span className="font-mono text-xs text-emerald-400 font-bold mt-1 block">
                              R250 <span className="text-[10px] text-zinc-400 font-sans font-medium">per 30 min ride</span> <span className="text-[9px] text-zinc-500 font-sans font-normal">(45 min slots)</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.max(0, pitBikeQty - 1))}
                              className="w-8 h-8 rounded-none bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/45 transition-colors text-lg font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {pitBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.min(8, pitBikeQty + 1))}
                              className="w-8 h-8 rounded-none bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/45 transition-colors text-lg font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Quad Bike Selection */}
                        <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-900">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-emerald-400" />
                              <h4 className="font-mono font-bold text-xs uppercase text-white">Quad Bike Rental</h4>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">Stable and solid quad action</p>
                            <span className="font-mono text-xs text-emerald-400 font-bold mt-1 block">
                              R300 <span className="text-[10px] text-zinc-400 font-sans font-medium">per 30 min ride</span> <span className="text-[9px] text-zinc-500 font-sans font-normal">(45 min slots)</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.max(0, quadBikeQty - 1))}
                              className="w-8 h-8 rounded-none bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/45 transition-colors text-lg font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {quadBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.min(2, quadBikeQty + 1))}
                              className="w-8 h-8 rounded-none bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500/45 transition-colors text-lg font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {pitBikeQty === 0 && quadBikeQty === 0 && (
                        <p className="text-[10px] text-emerald-400 font-mono mt-1 uppercase">
                          * Please select at least 1 bike to view slot availability.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-zinc-900" />

                {/* Step 4: Time Slots */}
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-mono">04</span>
                    Choose Available Time Slots
                  </h3>
                  
                  {/* Interactive Visual Color Legend */}
                  <div className="flex items-center gap-4 mb-4 bg-zinc-950 py-2 px-3 rounded-none border border-zinc-800 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-600 shadow-sm shadow-zinc-600/30" />
                      <span className="text-zinc-500 font-bold uppercase text-[10px]">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
                      <span className="text-red-400 font-bold uppercase text-[10px]">Closed</span>
                    </div>
                  </div>

                  {loadingAvailability ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
                            className={`p-3 rounded-none border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                              disabled 
                                ? availability[slot]?.isClosed
                                  ? 'border-red-950/45 bg-red-950/10 opacity-60 cursor-not-allowed'
                                  : 'border-zinc-900 bg-zinc-950 text-zinc-500 opacity-50 cursor-not-allowed'
                                : selected
                                  ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                  : 'border-zinc-800 hover:border-emerald-500/45 bg-zinc-950 hover:bg-zinc-900/50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={`font-mono text-xs font-black tracking-wider ${
                                selected 
                                  ? 'text-emerald-400' 
                                  : availability[slot]?.isClosed
                                    ? 'text-red-500 line-through' 
                                    : disabled
                                      ? 'text-zinc-600 line-through'
                                      : 'text-zinc-300'
                              }`}>
                                {slot}
                              </span>
                              {availability[slot]?.isClosed ? (
                                <span className="text-[7.5px] font-mono font-bold text-amber-500 uppercase bg-amber-950 border border-amber-900/40 px-1.5 py-0.5 rounded-none leading-none">
                                  Closed
                                </span>
                              ) : disabled ? (
                                <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-none leading-none">
                                  Booked
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-mono font-bold text-emerald-400 uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-none leading-none">
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
            <div id="booking-summary-panel" className="bg-zinc-950 border border-zinc-800 p-5 sm:p-6 rounded-none">
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-white mb-4">
                Booking <span className="text-emerald-400">Summary</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm border-b border-zinc-900 pb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rider</span>
                  <span className="text-white font-semibold">{name || 'Guest Rider'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="text-white font-semibold">{date ? `${date} (${dayOfWeekName})` : 'Select Date'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Time Slot</span>
                  <span className="text-white font-semibold font-mono">{selectedSlot || 'Select Slot'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Package Type</span>
                  <span className="text-emerald-400 font-bold uppercase text-right max-w-[180px] break-words">
                    {bikeType === 'GroupPackage' 
                      ? `Weekday Group (${groupDuration === 240 ? '4 Hours' : `${groupDuration} Mins`}, ${groupSize} Bikes)` 
                      : `Weekend Combined Rental`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bike Quantity</span>
                  <span className="text-white font-semibold text-right">
                    {bikeType === 'GroupPackage' 
                      ? `${groupSize} Bikes` 
                      : `${pitBikeQty} Pit / ${quadBikeQty} Quad`}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-baseline mb-6">
                <span className="text-xs text-zinc-500 font-mono uppercase">Total Price</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                  R{getPrice().toLocaleString()}
                </span>
              </div>

              {/* Safety Rules check */}
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-none mb-6 text-[11px] leading-relaxed text-zinc-400 font-sans">
                <strong className="text-emerald-400 block uppercase text-[10px] font-mono mb-1">* SAFETY REQUIREMENT</strong>
                All riders must have competent off-road riding experience. No beginners are permitted to operate rental units.
              </div>

              <button
                type="submit"
                disabled={submitting || !date || !selectedSlot}
                className={`w-full py-3 px-4 font-mono font-bold uppercase text-xs tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 border ${
                  submitting || !date || !selectedSlot
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-500 border-emerald-500 hover:bg-emerald-400 text-black cursor-pointer shadow-md shadow-emerald-500/10'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{submitting ? 'Connecting to Payfast...' : 'Proceed to Payfast Checkout'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Floating "Go to Checkout" button */}
      <AnimatePresence>
        {date && selectedSlot && (isWeekendSelected() ? (pitBikeQty > 0 || quadBikeQty > 0) : true) && !hasClickedGoToCheckout && (
          <motion.button
            key="scroll-top-arrow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setHasClickedGoToCheckout(true);
              const el = document.getElementById('booking-summary-panel');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="fixed bottom-6 right-6 z-[45] flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono uppercase tracking-wider rounded-none shadow-none text-xs cursor-pointer border border-zinc-800 group"
            title="Go to Checkout Summary"
          >
            <ArrowUp className="hidden md:block w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            <ArrowDown className="block md:hidden w-4 h-4 group-hover:translate-y-1 transition-transform" />
            <span>Go to Checkout</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
