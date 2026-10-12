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
              fallbackMap[slot] = { pitbikes: 10, quadbikes: 3 };
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
        return slotAvail.pitbikes < 10;
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
          if (slotAvail.pitbikes < 10) {
            setError(`The track does not have 10 pitbikes available for this slot.`);
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

      // Form post payload to Payfast (migrated AWS endpoint)
      const payfastForm = document.createElement('form');
      payfastForm.method = 'POST';
      payfastForm.action = 'https://payment.payfast.io/eng/process';

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

    const totalPitbikes = 10;
    const totalQuadbikes = 3;

    const availablePit = slotAvail.pitbikes;
    const availableQuad = slotAvail.quadbikes;

    return (
      <div className="mt-1.5 pt-1 border-t border-zinc-200 w-full space-y-1 text-left">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-600 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>PIT ({availablePit}/10)</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalPitbikes }).map((_, i) => {
              const isAvailable = i < availablePit;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-xs' 
                      : 'bg-zinc-300 border border-zinc-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-600 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>QUAD ({availableQuad}/3)</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalQuadbikes }).map((_, i) => {
              const isAvailable = i < availableQuad;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-emerald-500 shadow-xs' 
                      : 'bg-zinc-300 border border-zinc-300'
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
    <div className={isInline ? "w-full text-white bg-transparent" : "pt-20 sm:pt-28 pb-12 sm:pb-24 bg-transparent min-h-screen text-white relative"}>
      <div className={isInline ? "w-full" : "max-w-3xl mx-auto px-3 sm:px-4"}>
        
        {/* Navigation back */}
        {!isInline && (
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border-2 border-zinc-700 hover:border-emerald-500 text-zinc-200 font-mono font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Home</span>
            </button>
            
            {/* Step Counter Badge */}
            <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 shadow-md">
              Step <span className="text-emerald-400 font-bold">{currentStep}</span> of 5
            </span>
          </div>
        )}

        {/* Header */}
        {!isInline && (
          <div className="mb-4 sm:mb-6 text-center sm:text-left">
            <h1 className="font-display text-2xl sm:text-5xl font-black uppercase tracking-tight italic text-white">
              Online <span className="text-emerald-400">Booking</span>
            </h1>
          </div>
        )}

        {/* STEP PROGRESS BAR */}
        <div className="mb-6 bg-zinc-900/90 border-2 border-zinc-700 p-2 sm:p-3 shadow-xl backdrop-blur-md">
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
                      ? 'bg-zinc-900 border-2 border-emerald-500 text-emerald-400 shadow-sm'
                      : isCompleted
                        ? 'bg-zinc-900 border border-emerald-600/80 text-zinc-200 hover:border-emerald-500 cursor-pointer'
                        : 'bg-zinc-950/60 border border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
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
                    isCurrent ? 'text-emerald-400 font-black' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
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
          <div className="mb-4 bg-zinc-900/90 border-2 border-zinc-700 p-2.5 sm:p-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono shadow-xl backdrop-blur-md text-zinc-200">
            <div className="flex items-center gap-3 flex-wrap">
              {name && (
                <span className="text-zinc-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  <strong className="text-white">{name.split(' ')[0]}</strong>
                </span>
              )}
              {date && (
                <span className="text-zinc-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>{date}</span>
                </span>
              )}
              {selectedSlot && (
                <span className="text-zinc-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{selectedSlot}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Total:</span>
              <span className="text-emerald-400 font-black text-sm">R{getPrice().toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 bg-red-950/80 border-2 border-red-700 p-3 sm:p-4 rounded-none flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-mono font-bold text-red-300 text-xs uppercase tracking-wider">Please Note</h4>
              <p className="text-red-200 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STEP CONTENT CONTAINER */}
        <div className="border-2 border-zinc-700 bg-zinc-900/90 p-4 sm:p-7 shadow-2xl backdrop-blur-md text-white">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CONTACT DETAILS */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono">01</span>
                    Rider Details
                  </h3>
                </div>

                {/* Bring your own bike reminder in Step 1 */}
                <div className="p-3 bg-zinc-950/80 border border-zinc-700 flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="text-base flex-shrink-0 mt-0.5">🚲</span>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    <strong className="text-white font-mono uppercase text-[11px] block sm:inline sm:mr-1">
                      Bringing your own bike/pit bike?
                    </strong>
                    You do not need to book online! Simply show up at the track and pay <strong className="text-emerald-400 font-bold">R150 on site</strong>.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="name" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                      First & Last Name <span className="text-blue-400 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 rounded-none px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none transition-colors font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                        Email Address <span className="text-blue-400 font-bold ml-0.5">*</span>
                      </label>
                      <input 
                        type="email" 
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rider@example.com"
                        className="w-full bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 rounded-none px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                        Phone Number <span className="text-blue-400 font-bold ml-0.5">*</span>
                      </label>
                      <input 
                        type="tel" 
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 082 123 4567"
                        className="w-full bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 rounded-none px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none transition-colors font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="idNumber" className="block text-[11px] font-mono uppercase text-zinc-300 mb-1 font-bold">
                      ID / Passport Number <span className="text-blue-400 font-bold ml-0.5">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="idNumber"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. 9501015028088"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 rounded-none px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-5 sm:pt-6 border-t border-zinc-800 flex items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="h-12 px-4 sm:px-5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-emerald-400 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Next Step</span>
                    <span className="hidden sm:inline">Next: Choose Date</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
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
                className="space-y-4"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono">02</span>
                    Select Date
                  </h3>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Calendar Widget */}
                  <div className="bg-zinc-950/80 border border-zinc-700 p-3 sm:p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
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
                        className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
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
                        className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 text-center gap-1 sm:gap-2 mb-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <span key={i} className="text-[11px] font-mono text-zinc-400 uppercase font-bold py-1">
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
                                  ? 'bg-emerald-500 text-black font-black z-10 shadow-md shadow-emerald-500/20'
                                  : isClosed
                                    ? 'bg-red-950/60 border border-red-800 text-red-400 cursor-not-allowed font-bold'
                                    : !isSelectable
                                      ? 'text-zinc-600 bg-zinc-900/30 cursor-not-allowed opacity-30'
                                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-emerald-300 font-bold bg-zinc-900 border border-zinc-700 hover:border-emerald-400 cursor-pointer shadow-xs'
                              }`}
                            >
                              <span className="text-xs">{d}</span>
                              {isClosed ? (
                                <span className="text-[7.5px] font-black tracking-tight text-red-400 uppercase leading-none mt-1">Closed</span>
                              ) : isSelectable && !isSelected ? (
                                <span className="w-1.5 h-1.5 rounded-none absolute bottom-1 bg-emerald-400" />
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
                      <div className="p-3 bg-zinc-950/80 border border-zinc-700 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono font-medium">Selected Day:</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{date} ({dayOfWeekName})</span>
                      </div>
                      <WeatherWidget date={date} />
                    </div>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-5 sm:pt-6 border-t border-zinc-800 flex items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(1);
                    }}
                    className="h-12 px-4 sm:px-5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-emerald-400 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Next Step</span>
                    <span className="hidden sm:inline">Next: Rental Package</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
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
                className="space-y-4"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono">03</span>
                    Select Bikes
                  </h3>
                </div>

                <div className="space-y-4 pt-1">
                  {!isWeekendSelected() ? (
                    /* Weekday group packages */
                    <div className="space-y-4 bg-zinc-950/80 border border-zinc-700 p-4">
                      <span className="px-2 py-0.5 bg-zinc-900 text-zinc-200 text-[10px] font-mono font-bold uppercase tracking-wider border border-zinc-700 shadow-xs">
                        Weekday Group Package
                      </span>
                      <p className="text-zinc-400 text-xs mt-1">
                        Select your group duration and size:
                      </p>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-bold">
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
                                  ? 'border-emerald-500 bg-zinc-900 text-emerald-400 shadow-sm'
                                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950 text-zinc-300'
                              }`}
                            >
                              {dur.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-bold">
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
                                ? 'border-emerald-500 bg-zinc-900 text-emerald-400 shadow-sm'
                                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950 text-zinc-300'
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
                                ? 'border-emerald-500 bg-zinc-900 text-emerald-400 shadow-sm'
                                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950 text-zinc-300'
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
                    <div className="space-y-4">
                      <div className="space-y-4 bg-zinc-950/80 p-5 sm:p-6 border-2 border-zinc-700">
                        {/* Pit Bike Selection */}
                        <div className="py-3 border-b-2 border-zinc-800">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Bike className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <h4 className="font-sans font-black text-base sm:text-lg uppercase text-white">Pit Bike Rental</h4>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-300 font-extrabold mt-1">
                                110cc semi-automatic or CRF80 with clutch
                              </p>
                              <span className="font-sans text-sm sm:text-base text-emerald-400 font-black mt-1 block">
                                R250 <span className="text-xs text-zinc-400 font-bold">per 30 min ride</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => setPitBikeQty(Math.max(0, pitBikeQty - 1))}
                                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-xl font-black cursor-pointer shadow-sm active:scale-95"
                                aria-label="Decrease pit bikes"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-sans font-black text-lg text-white">
                                {pitBikeQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPitBikeQty(Math.min(10, pitBikeQty + 1))}
                                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-xl font-black cursor-pointer shadow-sm active:scale-95"
                                aria-label="Increase pit bikes"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quad Bike Selection */}
                        <div className="py-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Bike className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <h4 className="font-sans font-black text-base sm:text-lg uppercase text-white">Quad Bike Rental</h4>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-300 font-extrabold mt-1">
                                80cc quad bike
                              </p>
                              <span className="font-sans text-sm sm:text-base text-emerald-400 font-black mt-1 block">
                                R300 <span className="text-xs text-zinc-400 font-bold">per 30 min ride</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => setQuadBikeQty(Math.max(0, quadBikeQty - 1))}
                                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-xl font-black cursor-pointer shadow-sm active:scale-95"
                                aria-label="Decrease quad bikes"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-sans font-black text-lg text-white">
                                {quadBikeQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuadBikeQty(Math.min(3, quadBikeQty + 1))}
                                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-xl font-black cursor-pointer shadow-sm active:scale-95"
                                aria-label="Increase quad bikes"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {pitBikeQty === 0 && quadBikeQty === 0 && (
                        <p className="text-xs sm:text-sm text-amber-300 font-sans font-black p-2.5 bg-amber-950/70 border border-amber-800">
                          * Please select at least 1 bike to proceed.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Photo of Rental Fleet under Package / Bike Selection */}
                  <div className="border-2 border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden">
                    <div className="relative h-48 sm:h-60 w-full bg-zinc-950 overflow-hidden">
                      <img 
                        src="https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj"
                        alt="Rix Compound Rental Bikes"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://lh3.googleusercontent.com/d/108-4wXp6z2yCSjZnLj-e2vuE-rr-WFeB";
                        }}
                      />
                    </div>
                    <div className="p-4 bg-zinc-900/90 border-t-2 border-zinc-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="flex items-start gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-sans text-xs sm:text-sm font-black uppercase text-white">
                            Pit Bikes (10 Available)
                          </p>
                          <p className="text-xs text-zinc-300 font-sans mt-0.5 font-bold">
                            110cc semi-automatic or CRF80 with clutch
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-sans text-xs sm:text-sm font-black uppercase text-white">
                            Quad Bikes (3 Available)
                          </p>
                          <p className="text-xs text-zinc-300 font-sans mt-0.5 font-bold">
                            80cc quad bike
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Preview Box */}
                  <div className="p-5 bg-zinc-950 border-2 border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 font-sans uppercase block font-black">Subtotal</span>
                      <span className="text-sm text-zinc-200 font-sans font-bold">
                        {pitBikeQty > 0 ? `${pitBikeQty} Pit Bike${pitBikeQty > 1 ? 's' : ''}` : ''}
                        {pitBikeQty > 0 && quadBikeQty > 0 ? ' + ' : ''}
                        {quadBikeQty > 0 ? `${quadBikeQty} Quad Bike${quadBikeQty > 1 ? 's' : ''}` : ''}
                      </span>
                    </div>
                    <span className="text-2xl font-sans font-black text-emerald-400">
                      R{getPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-5 sm:pt-6 border-t border-zinc-800 flex items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(2);
                    }}
                    className="h-12 px-4 sm:px-5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep3}
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-emerald-400 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Next Step</span>
                    <span className="hidden sm:inline">Next: Choose Time Slot</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
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
                className="space-y-4"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono">04</span>
                    Choose Time Slot
                  </h3>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Legend */}
                  <div className="flex items-center gap-4 bg-zinc-950/80 py-2 px-3 border border-zinc-700 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                      <span className="text-zinc-400 font-bold uppercase text-[10px]">Booked</span>
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
                                  ? 'border-red-900/60 bg-red-950/40 text-red-400 opacity-60 cursor-not-allowed'
                                  : 'border-zinc-800 bg-zinc-950 text-zinc-600 opacity-60 cursor-not-allowed'
                                : selected
                                  ? 'border-2 border-emerald-500 bg-emerald-950/80 text-emerald-200 shadow-sm'
                                  : 'border-zinc-700 hover:border-emerald-500 bg-zinc-950 hover:bg-emerald-950/30 text-zinc-200 cursor-pointer shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={`font-mono text-xs font-black tracking-wider ${
                                selected 
                                  ? 'text-emerald-300' 
                                  : availability[slot]?.isClosed
                                    ? 'text-red-400 line-through' 
                                    : disabled
                                      ? 'text-zinc-600 line-through'
                                      : 'text-white'
                              }`}>
                                {slot}
                              </span>
                              {availability[slot]?.isClosed ? (
                                <span className="text-[7.5px] font-mono font-bold text-red-300 uppercase bg-red-950/80 border border-red-700 px-1 py-0.5">
                                  Closed
                                </span>
                              ) : disabled ? (
                                <span className="text-[7.5px] font-mono font-bold text-zinc-400 uppercase bg-zinc-800 border border-zinc-700 px-1 py-0.5">
                                  Booked
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-mono font-bold text-emerald-300 uppercase bg-emerald-950/80 border border-emerald-600 px-1 py-0.5">
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
                <div className="pt-5 sm:pt-6 border-t border-zinc-800 flex items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(3);
                    }}
                    className="h-12 px-4 sm:px-5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep4}
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-emerald-400 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Review & Pay</span>
                    <span className="hidden sm:inline">Next: Review & Checkout</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
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
                className="space-y-4"
              >
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-emerald-400 px-2 py-0.5 text-xs font-mono">05</span>
                    Review & Checkout
                  </h3>
                </div>

                {/* Summary Details Card */}
                <div className="bg-zinc-950/90 border border-zinc-700 divide-y divide-zinc-800 shadow-2xl text-zinc-200">
                  {/* Rider Info Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">Rider Details</span>
                      <h4 className="font-bold text-white text-sm">{name}</h4>
                      <p className="text-xs text-zinc-300 font-mono mt-0.5">{email} • {phone}</p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {idNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-mono text-brand-light hover:underline uppercase font-bold"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Date & Slot Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">Reserved Date & Time</span>
                      <h4 className="font-bold text-white text-sm">{date} ({dayOfWeekName})</h4>
                      <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">Time Slot: {selectedSlot}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-mono text-brand-light hover:underline uppercase font-bold"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Rental Package Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">Selected Bikes</span>
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
                      className="text-xs font-mono text-brand-light hover:underline uppercase font-bold"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Total Price Row */}
                  <div className="p-4 bg-zinc-900 flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-300">Total Amount Payable</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      R{getPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 5-minute hold notice */}
                <div className="bg-emerald-950/70 border-2 border-emerald-600 p-3.5 text-xs sm:text-sm font-sans leading-snug text-emerald-200 flex items-center gap-3 font-bold">
                  <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-black text-emerald-300">⚡ 5-MINUTE RESERVATION LOCK:</span> Your bikes will be locked for 5 minutes during checkout. Uncompleted checkouts are released back to the track automatically.
                  </div>
                </div>

                {/* Step 5 Checkout & Actions */}
                <div className="pt-5 border-t-2 border-zinc-800 space-y-3">
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={submitting}
                    className={`w-full min-h-[56px] px-6 font-sans font-black uppercase text-sm sm:text-base tracking-wider transition-all flex items-center justify-center gap-3 border-2 cursor-pointer ${
                      submitting
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-500 border-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                    <span>{submitting ? 'Connecting to PayFast Gateway...' : 'Proceed to PayFast Checkout'}</span>
                  </button>

                  <div className="flex items-center justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(4);
                      }}
                      className="h-11 px-5 bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs sm:text-sm font-black uppercase tracking-wider transition-colors border-2 border-zinc-700 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
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
