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
  ArrowRight,
  ShieldAlert, 
  CheckCircle, 
  CreditCard, 
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  CheckSquare
} from 'lucide-react';
import { navigateTo } from '../App';
import { getAvailabilityDirect, createBookingDirect } from '../lib/firebase';
import WeatherWidget from './WeatherWidget';

interface Availability {
  pitbikes: number;
  quadbikes: number;
  isClosed?: boolean;
}

export default function BookingPage({ isInline = false }: { isInline?: boolean }) {
  // Step state (1: Details, 2: Date, 3: Package/Bikes, 4: Slot, 5: Review & Checkout)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
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

  // Date constraints (cannot book on the day, max 1 month ahead)
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [closedDates, setClosedDates] = useState<string[]>([]);

  // Calculate min and max dates on mount
  useEffect(() => {
    const today = new Date();
    
    // Tomorrow is min booking date
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // 1 Month ahead is max booking date
    const oneMonthAhead = new Date(today);
    oneMonthAhead.setMonth(today.getMonth() + 1);
    oneMonthAhead.setDate(today.getDate() + 1);

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setMinDate(formatDate(tomorrow));
    setMaxDate(formatDate(oneMonthAhead));

    // Fetch closed dates with background refresh
    const loadClosedDates = () => {
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
    };

    loadClosedDates();
    const closedTimer = setInterval(loadClosedDates, 3000);
    return () => clearInterval(closedTimer);
  }, []);

  // Fetch availability when date changes (with 1-second real-time refreshing)
  useEffect(() => {
    if (!date) return;

    setLoadingAvailability(true);
    setSelectedSlot('');

    // If day of week changes, default the bike type appropriately
    const dayOfWeek = new Date(date).getDay(); // 0 is Sunday, 6 is Saturday, 5 is Friday
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4;
    if (isWeekday) {
      setBikeType('GroupPackage');
    } else {
      setBikeType('Mixed');
    }

    const loadAvailability = (isInitial = false) => {
      if (isInitial) {
        setLoadingAvailability(true);
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
            const [year, month, day] = date.split('-').map(Number);
            const dOfWeek = new Date(year, month - 1, day).getDay();
            const defaultSlots = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"];
            const fallbackMap: Record<string, Availability> = {};
            defaultSlots.forEach(slot => {
              if (dOfWeek === 0 && slot === "14:15") return;
              fallbackMap[slot] = { pitbikes: 8, quadbikes: 2 };
            });
            setAvailability(fallbackMap);
          }
        })
        .finally(() => {
          if (isInitial) {
            setLoadingAvailability(false);
          }
        });
    };

    loadAvailability(true);
    const timer = setInterval(() => loadAvailability(false), 1000);
    return () => clearInterval(timer);
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

  const isSlotDisabled = (slot: string) => {
    const slotAvail = availability[slot];
    if (!slotAvail) return true;
    if (slotAvail.isClosed) return true;

    if (isWeekendSelected()) {
      if (pitBikeQty === 0 && quadBikeQty === 0) {
        return slotAvail.pitbikes <= 0 && slotAvail.quadbikes <= 0;
      }
      return slotAvail.pitbikes < pitBikeQty || slotAvail.quadbikes < quadBikeQty;
    } else {
      // Weekdays: group packages
      if (groupSize === 10) {
        return slotAvail.pitbikes < 8 || slotAvail.quadbikes < 2;
      } else {
        return slotAvail.pitbikes < 5;
      }
    }
  };

  // Step Validation logic
  const handleNextFromStep1 = () => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!idNumber.trim()) {
      setError('Please enter your ID number.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setError(null);
    if (!date) {
      setError('Please select a date on the calendar to continue.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setError(null);
    if (isWeekendSelected()) {
      if (pitBikeQty === 0 && quadBikeQty === 0) {
        setError('Please select at least 1 bike to rent.');
        return;
      }
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep4 = () => {
    setError(null);
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }
    if (isSlotDisabled(selectedSlot)) {
      setError('The selected time slot does not have sufficient capacity.');
      return;
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and redirect to Payfast Secure Checkout
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !idNumber || !date || !selectedSlot) {
      setError('Please make sure all steps are complete before proceeding to payment.');
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
      idNumber,
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
      paid: false,
    };

    const proceedWithBookingId = (bookingId: string) => {
      const localBooking = {
        id: bookingId,
        name,
        email,
        phone,
        idNumber,
        date,
        slot: selectedSlot,
        bikeType,
        packageName: bookingPayload.packageName,
        quantity: bookingPayload.quantity,
        pitBikeQty: bookingPayload.pitBikeQty,
        quadBikeQty: bookingPayload.quadBikeQty,
        amount: bookingPayload.amount,
        paid: false,
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
      payfastForm.action = 'https://www.payfast.co.za/eng/process';

      const fields: Record<string, string> = {
        merchant_id: '37096219',
        merchant_key: 'y0wll0wnpt4k3',
        return_url: `${window.location.origin}/?page=ticket&bookingId=${bookingId}`,
        cancel_url: `${window.location.origin}/?page=booking`,
        notify_url: `${window.location.origin}/api/payfast-itn`,
        name_first: name.split(' ')[0] || 'Guest',
        name_last: name.split(' ').slice(1).join(' ') || 'Rider',
        email_address: email,
        m_payment_id: bookingId,
        amount: getPrice().toFixed(2),
        item_name: `Rix Compound Booking - ${bookingPayload.packageName} on ${date} at ${selectedSlot}`.slice(0, 100),
      };

      const activeFields: Record<string, string> = {};
      Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val.trim() !== '') {
          activeFields[key] = val.trim();
        }
      });

      const sortedKeys = Object.keys(activeFields).sort();

      const payfastEncode = (str: string) => {
        return encodeURIComponent(str)
          .replace(/%20/g, '+')
          .replace(/!/g, '%21')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/\*/g, '%2A');
      };

      let pfOutput = "";
      sortedKeys.forEach((key) => {
        pfOutput += `${key}=${payfastEncode(activeFields[key])}&`;
      });
      let signatureString = pfOutput.slice(0, -1);

      const signature = CryptoJS.MD5(signatureString).toString();

      sortedKeys.forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = activeFields[key];
        payfastForm.appendChild(input);
      });

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
      <div className="mt-1.5 pt-1 border-t border-neutral-900/60 w-full space-y-1 text-left">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-300 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>PIT ({availablePit}/8)</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalPitbikes }).map((_, i) => {
              const isAvailable = i < availablePit;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                      : 'bg-zinc-600 border border-zinc-700'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-300 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>QUAD ({availableQuad}/2)</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalQuadbikes }).map((_, i) => {
              const isAvailable = i < availableQuad;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                      : 'bg-zinc-600 border border-zinc-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const steps = [
    { num: 1 as const, title: 'Details', short: '01 Details' },
    { num: 2 as const, title: 'Date', short: '02 Date' },
    { num: 3 as const, title: 'Package', short: '03 Package' },
    { num: 4 as const, title: 'Time Slot', short: '04 Slot' },
    { num: 5 as const, title: 'Checkout', short: '05 Checkout' },
  ];

  return (
    <div className={isInline ? "w-full text-white bg-black" : "pt-20 sm:pt-28 pb-12 sm:pb-24 bg-black min-h-screen text-white relative"}>
      <div className={isInline ? "w-full" : "max-w-3xl mx-auto px-3 sm:px-4"}>
        
        {/* Navigation back */}
        {!isInline && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-emerald-400 text-white font-mono font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Home</span>
            </button>
            
            {/* Step Counter Badge */}
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest bg-zinc-950 border border-zinc-800 px-3 py-1.5">
              Step <span className="text-emerald-400 font-bold">{currentStep}</span> of 5
            </span>
          </div>
        )}

        {/* Header */}
        {!isInline && (
          <div className="mb-4 sm:mb-6 text-center sm:text-left">
            <h1 className="font-display text-2xl sm:text-5xl font-black uppercase tracking-tight italic">
              Online <span className="text-emerald-400">Booking</span>
            </h1>
          </div>
        )}

        {/* Bring Your Own Bike/Pit Bike Info Card */}
        <div className="bg-zinc-950 border border-zinc-800 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="text-lg sm:text-xl mt-0.5">🚲</span>
            <div>
              <h4 className="font-mono text-xs sm:text-sm uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 flex-wrap">
                <span>Bringing Your Own Bike/Pit Bike?</span>
                <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-mono font-black">
                  NO ONLINE BOOKING REQUIRED
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black">
                  PAY ON SITE
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed mt-1">
                If you are bringing your own bike/pit bike, <span className="text-white font-bold">you do not need to book online</span>. Simply show up at the compound, pay <span className="text-emerald-400 font-black">R150 on site</span>, and you're ready to ride!
              </p>
            </div>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="mb-6 bg-zinc-950 border border-zinc-800 p-2 sm:p-3">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {steps.map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              const isClickable = s.num < currentStep;

              return (
                <button
                  type="button"
                  key={s.num}
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable) {
                      setError(null);
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`py-2 px-1 text-center font-mono transition-all rounded-none flex flex-col items-center justify-center relative ${
                    isCurrent
                      ? 'bg-zinc-900 border-2 border-emerald-400 text-emerald-400 shadow-sm'
                      : isCompleted
                        ? 'bg-zinc-950 border border-emerald-500/40 text-white hover:border-emerald-400 cursor-pointer'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        0{s.num}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[11px] uppercase font-bold tracking-wider mt-0.5 truncate max-w-full ${
                    isCurrent ? 'text-emerald-400 font-black' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                  }`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Mini Summary Bar (Visible on Steps 2, 3, 4) */}
        {currentStep > 1 && currentStep < 5 && (
          <div className="mb-4 bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div className="flex items-center gap-3 flex-wrap">
              {name && (
                <span className="text-zinc-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  <strong className="text-white">{name.split(' ')[0]}</strong>
                </span>
              )}
              {date && (
                <span className="text-zinc-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>{date}</span>
                </span>
              )}
              {selectedSlot && (
                <span className="text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{selectedSlot}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Total:</span>
              <span className="text-emerald-400 font-black text-sm">R{getPrice().toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 bg-red-950/60 border border-red-500/60 p-3 sm:p-4 rounded-none flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-mono font-bold text-red-400 text-xs uppercase tracking-wider">Please Note</h4>
              <p className="text-zinc-300 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STEP CONTENT CONTAINER */}
        <div className="border border-zinc-800 bg-zinc-950 p-4 sm:p-7">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CONTACT DETAILS */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 text-xs font-mono">01</span>
                    Rider Contact Information
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter your details to reserve your bike slot and retrieve your entry pass.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label htmlFor="name" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                      First & Last Name <span className="text-orange-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Igor Rix"
                      className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                        Email Address <span className="text-orange-500 font-bold ml-0.5">*</span>
                      </label>
                      <input 
                        type="email" 
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rider@example.com"
                        className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                        Phone Number <span className="text-orange-500 font-bold ml-0.5">*</span>
                      </label>
                      <input 
                        type="tel" 
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 076 829 9919"
                        className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="idNumber" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                      ID / Passport Number <span className="text-orange-500 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="idNumber"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. 9501015028088"
                      className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors font-sans"
                    />
                    <p className="text-[10px] font-mono text-zinc-500 mt-1.5">
                      Required for indemnity tracking and retrieving tickets on the My Bookings portal.
                    </p>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors border border-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <span>Next: Choose Date</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHOOSE DATE */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 text-xs font-mono">02</span>
                    Select Booking Date
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Choose a Friday, Saturday, or Sunday to ride. Weekdays are reserved for pre-booked group track packages.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Calendar Widget */}
                  <div className="bg-black border border-zinc-800 p-3 sm:p-5">
                    {/* Header */}
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
                        className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-400 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="font-mono font-bold uppercase italic text-sm tracking-wide text-white">
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
                        className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-400 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 text-center gap-1 sm:gap-2 mb-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <span key={i} className="text-[11px] font-mono text-zinc-500 uppercase font-bold py-1">
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {(() => {
                        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                        const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
                        const cells = [];
                        
                        for (let i = 0; i < firstDayIndex; i++) {
                          cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                        }
                        
                        for (let d = 1; d <= daysInMonth; d++) {
                          const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
                          const isClosed = closedDates.includes(dateString);
                          const isSelectable = dateString >= minDate && dateString <= maxDate && isWeekend && !isClosed;
                          const isSelected = date === dateString;

                          cells.push(
                            <button
                              type="button"
                              key={`day-${d}`}
                              disabled={isClosed || !isSelectable}
                              onClick={() => {
                                setDate(dateString);
                                setError(null);
                              }}
                              className={`aspect-square w-full rounded-none text-xs font-mono transition-all flex flex-col items-center justify-center relative ${
                                isSelected
                                  ? 'bg-emerald-500 text-black font-black z-10 shadow-lg shadow-emerald-500/20'
                                  : isClosed
                                    ? 'bg-zinc-950 border border-red-900/40 text-red-500 cursor-not-allowed font-bold'
                                    : !isSelectable
                                      ? 'text-zinc-800 bg-zinc-950/20 cursor-not-allowed opacity-25'
                                      : 'text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold bg-zinc-950 border border-emerald-500/30 cursor-pointer shadow-sm shadow-emerald-500/5'
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

                  {/* Weather and Date info */}
                  {date && (
                    <div className="space-y-3">
                      <div className="p-3 bg-zinc-900 border border-emerald-500/30 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono">Selected Day:</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{date} ({dayOfWeekName})</span>
                      </div>
                      <WeatherWidget date={date} />
                    </div>
                  )}

                  {/* Booking rules */}
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800 text-[11px] leading-relaxed flex items-start gap-2 text-zinc-400">
                    <span className="text-emerald-400 text-sm">📅</span>
                    <div>
                      <span className="text-white font-mono font-bold uppercase tracking-wider text-[10px]">Booking Rules:</span>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                        <li>You cannot book on the same day (advance reservations required).</li>
                        <li>Slots can be reserved up to 1 month in advance.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <span>Next: Rental Package</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RENTAL PACKAGE & BIKES */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 text-xs font-mono">03</span>
                    Choose Rental Package & Bikes
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Select the number of Pit Bikes and Quad Bikes for your 45-minute booking slot (30 min riding time).
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {!isWeekendSelected() ? (
                    /* Weekday group packages */
                    <div className="space-y-4 bg-black border border-zinc-800 p-4">
                      <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-zinc-800">
                        Weekday Group Package
                      </span>
                      <p className="text-zinc-400 text-xs mt-1">
                        Select your group duration and size:
                      </p>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
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
                              className={`py-2 px-2 border font-mono font-bold text-center text-xs transition-all cursor-pointer ${
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

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Group Size
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setBikeType('GroupPackage');
                              setGroupSize(5);
                            }}
                            className={`p-3 border text-center transition-all cursor-pointer ${
                              bikeType === 'GroupPackage' && groupSize === 5
                                ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                            }`}
                          >
                            <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                            <span className="font-mono font-bold text-xs block uppercase">5 Bikes</span>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              R{groupDuration === 30 ? '1,500' : groupDuration === 60 ? '3,000' : '8,000'}
                            </span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setBikeType('GroupPackage');
                              setGroupSize(10);
                            }}
                            className={`p-3 border text-center transition-all cursor-pointer ${
                              bikeType === 'GroupPackage' && groupSize === 10
                                ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                            }`}
                          >
                            <Users className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                            <span className="font-mono font-bold text-xs block uppercase">10 Bikes</span>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              R{groupDuration === 30 ? '3,000' : groupDuration === 60 ? '5,000' : '15,200'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Weekend rentals */
                    <div className="space-y-3">
                      <div className="space-y-3 bg-black p-4 sm:p-5 border border-zinc-800">
                        {/* Pit Bike Selection */}
                        <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-900">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-emerald-400" />
                              <h4 className="font-mono font-bold text-sm uppercase text-white">Pit Bike Rental</h4>
                            </div>
                            <p className="text-[11px] text-zinc-300 font-medium mt-0.5">110cc semi-automatic pit bike</p>
                            <p className="text-[10px] text-amber-400 font-mono mt-0.5">Max rider weight: 100 kg • Prior experience required</p>
                            <span className="font-mono text-xs text-emerald-400 font-bold mt-1 block">
                              R250 <span className="text-[10px] text-zinc-400">per 30 min ride</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.max(0, pitBikeQty - 1))}
                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-400 transition-colors text-lg font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {pitBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPitBikeQty(Math.min(8, pitBikeQty + 1))}
                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-400 transition-colors text-lg font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Quad Bike Selection */}
                        <div className="flex items-center justify-between gap-3 py-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Bike className="w-4 h-4 text-emerald-400" />
                              <h4 className="font-mono font-bold text-sm uppercase text-white">Quad Bike Rental</h4>
                            </div>
                            <p className="text-[11px] text-zinc-300 font-medium mt-0.5">80cc quad bike (Beginners welcome)</p>
                            <span className="font-mono text-xs text-emerald-400 font-bold mt-1 block">
                              R300 <span className="text-[10px] text-zinc-400">per 30 min ride</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.max(0, quadBikeQty - 1))}
                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-400 transition-colors text-lg font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">
                              {quadBikeQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuadBikeQty(Math.min(2, quadBikeQty + 1))}
                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-400 transition-colors text-lg font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {pitBikeQty === 0 && quadBikeQty === 0 && (
                        <p className="text-xs text-amber-400 font-mono">
                          * Please select at least 1 bike to proceed.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Pricing Preview Box */}
                  <div className="p-4 bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 font-mono uppercase block">Subtotal</span>
                      <span className="text-xs text-zinc-300 font-mono">
                        {pitBikeQty > 0 ? `${pitBikeQty} Pit Bike${pitBikeQty > 1 ? 's' : ''}` : ''}
                        {pitBikeQty > 0 && quadBikeQty > 0 ? ' + ' : ''}
                        {quadBikeQty > 0 ? `${quadBikeQty} Quad Bike${quadBikeQty > 1 ? 's' : ''}` : ''}
                      </span>
                    </div>
                    <span className="text-xl font-mono font-black text-emerald-400">
                      R{getPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(2);
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep3}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <span>Next: Choose Time Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: TIME SLOT SELECTION */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 text-xs font-mono">04</span>
                    Choose Available Time Slot
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Track availability refreshes in real-time every second. Select an open slot that fits your schedule.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Legend */}
                  <div className="flex items-center gap-4 bg-black py-2 px-3 border border-zinc-800 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                      <span className="text-zinc-500 font-bold uppercase text-[10px]">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-red-400 font-bold uppercase text-[10px]">Closed</span>
                    </div>
                  </div>

                  {/* Weather for selected slot */}
                  {date && (
                    <WeatherWidget date={date} selectedSlot={selectedSlot} />
                  )}

                  {/* Slot Grid */}
                  {loadingAvailability ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs font-mono text-zinc-400">Loading real-time track slots...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.keys(availability).map((slot) => {
                        const disabled = isSlotDisabled(slot);
                        const selected = selectedSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={disabled}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setError(null);
                            }}
                            className={`p-2.5 rounded-none border text-left flex flex-col justify-between transition-all relative ${
                              disabled 
                                ? availability[slot]?.isClosed
                                  ? 'border-red-950/45 bg-red-950/10 opacity-60 cursor-not-allowed'
                                  : 'border-zinc-900 bg-zinc-950 text-zinc-600 opacity-50 cursor-not-allowed'
                                : selected
                                  ? 'border-2 border-emerald-400 bg-zinc-900 text-emerald-400 shadow-md shadow-emerald-500/10'
                                  : 'border-zinc-800 hover:border-emerald-500/50 bg-black hover:bg-zinc-900 cursor-pointer'
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
                                      : 'text-zinc-200'
                              }`}>
                                {slot}
                              </span>
                              {availability[slot]?.isClosed ? (
                                <span className="text-[7.5px] font-mono font-bold text-amber-500 uppercase bg-amber-950 border border-amber-900/40 px-1 py-0.5">
                                  Closed
                                </span>
                              ) : disabled ? (
                                <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-1 py-0.5">
                                  Booked
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-mono font-bold text-emerald-400 uppercase bg-zinc-900 border border-zinc-800 px-1 py-0.5">
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

                {/* Step 4 Actions */}
                <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(3);
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep4}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <span>Next: Review & Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: REVIEW & PAYFAST CHECKOUT */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-0.5 text-xs font-mono">05</span>
                    Review & PayFast Checkout
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Please review your booking details below before proceeding to PayFast secure checkout.
                  </p>
                </div>

                {/* Summary Details Card */}
                <div className="bg-black border border-zinc-800 divide-y divide-zinc-900">
                  {/* Rider Info Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Rider Details</span>
                      <h4 className="font-bold text-white text-sm">{name}</h4>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{email} • {phone}</p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {idNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-mono text-emerald-400 hover:underline uppercase"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Date & Slot Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Reserved Date & Time</span>
                      <h4 className="font-bold text-white text-sm">{date} ({dayOfWeekName})</h4>
                      <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">Time Slot: {selectedSlot}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-mono text-emerald-400 hover:underline uppercase"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Rental Package Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">Selected Bikes</span>
                      <h4 className="font-bold text-white text-sm">
                        {bikeType === 'GroupPackage' 
                          ? `Weekday Group (${groupDuration === 240 ? '4 Hours' : `${groupDuration} Mins`}, ${groupSize} Bikes)` 
                          : `${pitBikeQty} Pit Bike${pitBikeQty !== 1 ? 's' : ''}${pitBikeQty > 0 && quadBikeQty > 0 ? ' & ' : ''}${quadBikeQty > 0 ? `${quadBikeQty} Quad Bike${quadBikeQty !== 1 ? 's' : ''}` : ''}`}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                        45-minute slot duration (30 mins active track riding time)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-mono text-emerald-400 hover:underline uppercase"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Total Price Row */}
                  <div className="p-4 bg-zinc-950 flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-300">Total Amount Payable</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      R{getPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 5-minute hold notice */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 text-[11px] font-mono leading-tight text-emerald-300 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-400">⚡ 5-MINUTE RESERVATION LOCK:</span> Your bikes will be locked for 5 minutes during checkout. Uncompleted checkouts are released back to the track automatically.
                  </div>
                </div>

                {/* Step 5 Checkout & Actions */}
                <div className="pt-4 border-t border-zinc-900 space-y-3">
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={submitting}
                    className={`w-full py-3.5 px-4 font-mono font-bold uppercase text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      submitting
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-500 border-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-[0.99]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{submitting ? 'Connecting to PayFast Gateway...' : 'Proceed to PayFast Checkout'}</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(4);
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Time Slots</span>
                    </button>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      🔒 Secure 256-bit Encryption
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
