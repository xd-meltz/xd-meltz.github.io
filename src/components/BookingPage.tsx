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
  CheckSquare,
  Car
} from 'lucide-react';
import { navigateTo } from '../App';
import { getAvailabilityDirect, createBookingDirect, STANDARD_SLOTS, KIDS_SLOTS } from '../lib/firebase';
import WeatherWidget from './WeatherWidget';

export const VEHICLE_IMAGES = {
  pitbike: 'https://lh3.googleusercontent.com/d/18JWurQxEoV9GDDkhPT0py9GhaHvXg-kx', // Pit Bike (110cc / CRF80)
  quadbike: 'https://lh3.googleusercontent.com/d/12K7fYEZ24WS7ykDcs00dFW1omENFeJin', // Quad Bike (80cc)
  gokart: 'https://lh3.googleusercontent.com/d/1FSVpa7ME0fYUIt85OTI-1GADo9sBgyj5', // Off-Road Go Kart (70cc for Kids)
  minibike: 'https://lh3.googleusercontent.com/d/1Rf8_HaN4c7kFYefAggETvLmq2p_9-WX9', // Mini Bike (70cc)
};

interface Availability {
  pitbikes: number;
  quadbikes: number;
  gokarts: number;
  minibikes: number;
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
  
  // Multi-slot selection state (15-min intervals for Go Karts & Mini Bikes)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Online booking is exclusively for Kids Off-Road Go Karts (70cc) & Mini Bikes (70cc)
  // Pit bikes and quad bikes are strictly walk-in / first-come first-served on-site at the track gate
  const [goKartQty, setGoKartQty] = useState(1);
  const [miniBikeQty, setMiniBikeQty] = useState(0);
  const [sessionDuration, setSessionDuration] = useState<10 | 15>(10);

  // Calendar navigation states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Status & Fetching
  const [availability, setAvailability] = useState<Record<string, Availability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date constraints (same-day booking allowed up to 30 min beforehand, max 1 month ahead)
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
    setSelectedSlots([]);

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
            const fallbackMap: Record<string, Availability> = {};
            STANDARD_SLOTS.forEach(slot => {
              if (dOfWeek === 0 && slot === "14:15") return;
              fallbackMap[slot] = { pitbikes: 10, quadbikes: 3, gokarts: 0, minibikes: 0 };
            });
            KIDS_SLOTS.forEach(slot => {
              if (dOfWeek === 0 && (slot === "14:30" || slot === "14:45")) return;
              if (!fallbackMap[slot]) {
                fallbackMap[slot] = { pitbikes: 0, quadbikes: 0, gokarts: 4, minibikes: 2 };
              } else {
                fallbackMap[slot].gokarts = 4;
                fallbackMap[slot].minibikes = 2;
              }
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

  const selectedSlot = selectedSlots.join(', ');

  // Helper to format selected vehicles summary
  const getSelectedVehiclesSummary = () => {
    const list: string[] = [];
    if (goKartQty > 0) list.push(`${goKartQty} Off-Road Go Kart${goKartQty > 1 ? 's' : ''} (70cc Kids)`);
    if (miniBikeQty > 0) list.push(`${miniBikeQty} Mini Bike${miniBikeQty > 1 ? 's' : ''} (70cc)`);
    return list.length > 0 ? list.join(' + ') : 'None selected';
  };

  // Pricing Calculation: R200 for 10 min session or R280 for 15 min session per vehicle (Go Kart & Mini Bike)
  // Multiplied by number of chosen 15-minute time slots
  const getPrice = () => {
    const ratePerVehicle = sessionDuration === 15 ? 280 : 200;
    const baseRatePerSession = (ratePerVehicle * goKartQty) + (ratePerVehicle * miniBikeQty);
    const slotCount = Math.max(1, selectedSlots.length);
    if (selectedSlots.length === 0) {
      return baseRatePerSession; // Preview rate for 1 session in Step 3
    }
    return baseRatePerSession * slotCount;
  };

  // Toggle selection for 15-min Slots
  const toggleSlot = (slot: string) => {
    setError(null);
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort()
    );
  };

  const isSlotDisabled = (slot: string) => {
    const slotAvail = availability[slot];
    if (!slotAvail) return true;
    if (slotAvail.isClosed) return true;

    if (goKartQty > 0 && (slotAvail.gokarts ?? 0) < goKartQty) return true;
    if (miniBikeQty > 0 && (slotAvail.minibikes ?? 0) < miniBikeQty) return true;

    // Same-day cutoff: must book at least 30 minutes beforehand
    if (date) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (date === todayStr) {
        const [slotH, slotM] = slot.split(":").map(Number);
        const slotMinutes = slotH * 60 + slotM;
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        if (slotMinutes - currentMinutes < 30) {
          return true;
        }
      }
    }

    return false;
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
    const totalSelected = goKartQty + miniBikeQty;
    if (totalSelected === 0) {
      setError('Please select at least 1 Go Kart or Mini Bike to rent.');
      return;
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep4 = () => {
    setError(null);
    if (selectedSlots.length === 0) {
      setError('Please select at least one 15-minute time slot for your Go Kart / Mini Bike session.');
      return;
    }

    for (const s of selectedSlots) {
      if (isSlotDisabled(s)) {
        setError(`Slot ${s} does not have sufficient capacity for your selected vehicles.`);
        return;
      }
    }

    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and redirect to Payfast Secure Checkout
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !idNumber || !date || selectedSlots.length === 0) {
      setError('Please make sure all steps are complete before proceeding to payment.');
      return;
    }

    const totalSelected = goKartQty + miniBikeQty;
    if (totalSelected === 0) {
      setError('Please select at least 1 vehicle to rent.');
      return;
    }

    // Capacity checks on each selected slot
    for (const checkSlot of selectedSlots) {
      const slotAvail = availability[checkSlot];
      if (slotAvail) {
        if (goKartQty > (slotAvail.gokarts ?? 0)) {
          setError(`Only ${slotAvail.gokarts} go karts are available for slot ${checkSlot}.`);
          return;
        }
        if (miniBikeQty > (slotAvail.minibikes ?? 0)) {
          setError(`Only ${slotAvail.minibikes} mini bikes are available for slot ${checkSlot}.`);
          return;
        }
      }
    }

    setSubmitting(true);

    const totalSlotCount = selectedSlots.length;
    const ratePerVehicle = sessionDuration === 15 ? 280 : 200;
    const bookingPayload = {
      name,
      email,
      phone,
      idNumber,
      date,
      slot: selectedSlots.join(', '),
      slots: selectedSlots,
      bikeType: 'Mixed',
      packageName: `Go Kart & Mini Bike Booking (${getSelectedVehiclesSummary()}) - ${sessionDuration} min (${ratePerVehicle === 280 ? 'R280' : 'R200'}) - ${totalSlotCount} Session${totalSlotCount > 1 ? 's' : ''} (${selectedSlots.join(', ')})`,
      quantity: totalSelected * totalSlotCount,
      pitBikeQty: 0,
      quadBikeQty: 0,
      goKartQty: goKartQty > 0 ? goKartQty : undefined,
      miniBikeQty: miniBikeQty > 0 ? miniBikeQty : undefined,
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
        slot: bookingPayload.slot,
        slots: bookingPayload.slots,
        bikeType: 'Mixed',
        packageName: bookingPayload.packageName,
        quantity: bookingPayload.quantity,
        pitBikeQty: 0,
        quadBikeQty: 0,
        goKartQty: bookingPayload.goKartQty,
        miniBikeQty: bookingPayload.miniBikeQty,
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
        item_name: `Rix Compound Booking - ${date} (${selectedSlots.join(', ')})`.slice(0, 100),
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

    const totalGoKarts = 4;
    const totalMiniBikes = 2;

    const availableKart = slotAvail.gokarts ?? 4;
    const availableMini = slotAvail.minibikes ?? 2;

    return (
      <div className="mt-1.5 pt-1.5 border-t border-zinc-800 w-full space-y-1 text-left">
        {/* Off-Road Go Karts */}
        <div>
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-300 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>KARTS ({availableKart}/{totalGoKarts})</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalGoKarts }).map((_, i) => {
              const isAvailable = i < availableKart;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-blue-500 shadow-xs' 
                      : 'bg-zinc-700 border border-zinc-800'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Mini Bikes (70cc) */}
        <div>
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-300 font-mono font-bold tracking-wider leading-none mb-0.5">
            <span>MINI ({availableMini}/{totalMiniBikes})</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
            {Array.from({ length: totalMiniBikes }).map((_, i) => {
              const isAvailable = i < availableMini;
              return (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                    isAvailable 
                      ? 'bg-blue-500 shadow-xs' 
                      : 'bg-zinc-700 border border-zinc-800'
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
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border-2 border-zinc-700 hover:border-blue-500 text-zinc-200 font-mono font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Back to Home</span>
            </button>
            
            {/* Step Counter Badge */}
            <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 shadow-md">
              Step <span className="text-blue-400 font-bold">{currentStep}</span> of 5
            </span>
          </div>
        )}

        {/* Header */}
        {!isInline && (
          <div className="mb-4 sm:mb-6 text-center sm:text-left">
            <h1 className="font-display text-2xl sm:text-5xl font-black uppercase tracking-tight italic text-white">
              Online <span className="text-blue-400">Booking</span>
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
                      ? 'bg-zinc-900 border-2 border-blue-500 text-blue-400 shadow-sm'
                      : isCompleted
                        ? 'bg-zinc-900 border border-blue-600/80 text-zinc-200 hover:border-blue-500 cursor-pointer'
                        : 'bg-zinc-950/60 border border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-blue-400" />
                    ) : (
                      <span className={`text-[10px] font-bold ${isCurrent ? 'text-blue-400' : 'text-zinc-500'}`}>
                        0{s.num}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[11px] uppercase font-bold tracking-wider mt-0.5 truncate max-w-full ${
                    isCurrent ? 'text-blue-400 font-black' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
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
                  <User className="w-3 h-3 text-blue-400" />
                  <strong className="text-white">{name.split(' ')[0]}</strong>
                </span>
              )}
              {date && (
                <span className="text-zinc-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>{date}</span>
                </span>
              )}
              {selectedSlot && (
                <span className="text-zinc-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{selectedSlot}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Total:</span>
              <span className="text-blue-400 font-black text-sm">R{getPrice().toLocaleString()}</span>
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
                  <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-blue-400 px-2 py-0.5 text-xs font-mono">01</span>
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
                    You do not need to book online! Simply show up at the track and pay <strong className="text-blue-400 font-bold">R150 on site</strong>.
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
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
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
                  <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-blue-400 px-2 py-0.5 text-xs font-mono">02</span>
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
                        className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
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
                        className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
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
                                  ? 'bg-blue-600 text-white font-black z-10 shadow-md shadow-blue-500/20'
                                  : isClosed
                                    ? 'bg-red-950/60 border border-red-800 text-red-400 cursor-not-allowed font-bold'
                                    : !isSelectable
                                      ? 'text-zinc-600 bg-zinc-900/30 cursor-not-allowed opacity-30'
                                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-blue-300 font-bold bg-zinc-900 border border-zinc-700 hover:border-blue-400 cursor-pointer shadow-xs'
                              }`}
                            >
                              <span className="text-xs">{d}</span>
                              {isClosed ? (
                                <span className="text-[7.5px] font-black tracking-tight text-red-400 uppercase leading-none mt-1">Closed</span>
                              ) : isSelectable && !isSelected ? (
                                <span className="w-1.5 h-1.5 rounded-none absolute bottom-1 bg-blue-400" />
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
                        <span className="text-sm font-mono font-bold text-blue-400">{date} ({dayOfWeekName})</span>
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
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Next Step</span>
                    <span className="hidden sm:inline">Next: Rental Package</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SELECT VEHICLES (GO KARTS & MINI BIKES ONLY) */}
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
                  <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-blue-400 px-2 py-0.5 text-xs font-mono">03</span>
                    Select Vehicles
                  </h3>
                </div>

                {/* Important Notice: Pit Bikes and Quad Bikes are strictly First Come First Serve */}
                <div className="p-3.5 sm:p-4 bg-red-950/70 border-2 border-red-600/80 text-xs sm:text-sm font-sans text-red-200 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <span className="font-mono font-black uppercase text-red-300 block mb-0.5 tracking-wider">
                        Pit Bikes & Quad Bikes: Strictly First-Come, First-Served On-Site!
                      </span>
                      <p className="text-zinc-200 text-xs sm:text-xs leading-relaxed font-semibold">
                        Pit bikes (110cc / CRF80) and Quad bikes (80cc) are strictly walk-in / arrive-and-drive at the track — pay at the gate on arrival (no advance online booking required).
                        <strong className="text-white block mt-1">Advance online bookings below are exclusively reserved for Kids Off-Road Go Karts &amp; Mini Bikes (R200 for 10 min • R280 for 15 min).</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Ride Duration Selection: 10 min (R200) vs 15 min (R280) */}
                  <div className="p-3.5 sm:p-4 bg-zinc-950/90 border-2 border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase font-black text-white">Choose Session Duration:</span>
                      <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Both Vehicles Same Rates</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSessionDuration(10)}
                        className={`p-3 border-2 text-center transition-all cursor-pointer ${
                          sessionDuration === 10
                            ? 'bg-blue-950/90 border-blue-500 text-white shadow-md ring-1 ring-blue-500'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="font-mono text-xs font-black uppercase tracking-wider">10 Min Session</div>
                        <div className="font-sans text-base sm:text-lg font-black text-blue-400 mt-0.5">
                          R200 <span className="text-xs text-zinc-400 font-bold uppercase">/ vehicle</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionDuration(15)}
                        className={`p-3 border-2 text-center transition-all cursor-pointer ${
                          sessionDuration === 15
                            ? 'bg-blue-950/90 border-blue-500 text-white shadow-md ring-1 ring-blue-500'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="font-mono text-xs font-black uppercase tracking-wider">15 Min Session</div>
                        <div className="font-sans text-base sm:text-lg font-black text-blue-400 mt-0.5">
                          R280 <span className="text-xs text-zinc-400 font-bold uppercase">/ vehicle</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-950/80 p-4 sm:p-6 border-2 border-zinc-700 divide-y-2 divide-zinc-800">
                    {/* 1. Off-Road Go Kart Selection (4 available) */}
                    <div className="pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                            {VEHICLE_IMAGES.gokart ? (
                              <img 
                                src={VEHICLE_IMAGES.gokart} 
                                alt="Off-Road Go Kart 70cc (Kids)" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 border border-dashed border-zinc-700/80 p-1 text-center">
                                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 mb-0.5" />
                                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-400 font-bold leading-tight">Image Space</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-sans font-black text-sm sm:text-base uppercase text-white truncate">Off-Road Go Kart (70cc Kids)</h4>
                              <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-blue-400 font-bold whitespace-nowrap">
                                4 Available
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-bold mt-0.5 leading-snug">
                              70cc off-road racing go kart for kids with roll cage & safety belt
                            </p>
                            <span className="font-sans text-sm sm:text-base text-blue-400 font-black mt-1 block">
                              R{sessionDuration === 15 ? 280 : 200} <span className="text-xs text-zinc-400 font-bold">per {sessionDuration} min ride</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setGoKartQty(Math.max(0, goKartQty - 1))}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-lg sm:text-xl font-black cursor-pointer shadow-sm active:scale-95"
                            aria-label="Decrease go karts"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-sans font-black text-base sm:text-lg text-white">
                            {goKartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGoKartQty(Math.min(4, goKartQty + 1))}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-lg sm:text-xl font-black cursor-pointer shadow-sm active:scale-95"
                            aria-label="Increase go karts"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 2. Mini Bike (70cc) Selection (2 available) */}
                    <div className="pt-3 sm:pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                            {VEHICLE_IMAGES.minibike ? (
                              <img 
                                src={VEHICLE_IMAGES.minibike} 
                                alt="Mini Bike 70cc" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 border border-dashed border-zinc-700/80 p-1 text-center">
                                <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 mb-0.5" />
                                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-400 font-bold leading-tight">Image Space</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-sans font-black text-sm sm:text-base uppercase text-white truncate">Mini Bike (70cc)</h4>
                              <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-blue-400 font-bold whitespace-nowrap">
                                2 Available
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-bold mt-0.5 leading-snug">
                              70cc mini bike (great for smaller/younger riders developing throttle control)
                            </p>
                            <span className="font-sans text-sm sm:text-base text-blue-400 font-black mt-1 block">
                              R{sessionDuration === 15 ? 280 : 200} <span className="text-xs text-zinc-400 font-bold">per {sessionDuration} min ride</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setMiniBikeQty(Math.max(0, miniBikeQty - 1))}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-lg sm:text-xl font-black cursor-pointer shadow-sm active:scale-95"
                            aria-label="Decrease mini bikes"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-sans font-black text-base sm:text-lg text-white">
                            {miniBikeQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setMiniBikeQty(Math.min(2, miniBikeQty + 1))}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors text-lg sm:text-xl font-black cursor-pointer shadow-sm active:scale-95"
                            aria-label="Increase mini bikes"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {goKartQty === 0 && miniBikeQty === 0 && (
                    <p className="text-xs sm:text-sm text-red-300 font-sans font-black p-2.5 bg-red-950/70 border border-red-800">
                      * Please select at least 1 vehicle (Go Kart or Mini Bike) to proceed.
                    </p>
                  )}

                  {/* Pricing Preview Box */}
                  <div className="p-4 sm:p-5 bg-zinc-950 border-2 border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 font-sans uppercase block font-black">Subtotal (per {sessionDuration} min session)</span>
                      <span className="text-xs sm:text-sm text-zinc-200 font-sans font-bold">
                        {getSelectedVehiclesSummary()}
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-sans font-black text-blue-400">
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
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    <span className="sm:hidden">Next Step</span>
                    <span className="hidden sm:inline">Next: Choose Time Slot(s)</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: TIME SLOT SELECTION (15-MIN INTERVALS FOR GO KARTS & MINI BIKES) */}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2 font-bold">
                      <span className="bg-zinc-950 border border-zinc-700 text-blue-400 px-2 py-0.5 text-xs font-mono">04</span>
                      Choose Time Slot(s)
                    </h3>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 border border-blue-600/70 px-2 py-0.5 self-start sm:self-auto font-bold uppercase tracking-wider">
                      Multi-Slot Booking Enabled
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-1">
                    Select one or more 15-minute time slots ({sessionDuration}-minute active rides • R{sessionDuration === 15 ? 280 : 200} per session). Tap any slot to add or remove it from your booking!
                  </p>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Legend */}
                  <div className="flex items-center gap-4 bg-zinc-950/80 py-2 px-3 border border-zinc-700 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                      <span className="text-blue-400 font-bold uppercase text-[10px]">Open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                      <span className="text-zinc-400 font-bold uppercase text-[10px]">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-red-400 font-bold uppercase text-[10px]">Closed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-none bg-blue-400 border border-blue-300" />
                      <span className="text-blue-300 font-bold uppercase text-[10px]">Selected</span>
                    </div>
                  </div>

                  {/* Weather for selected slot */}
                  {date && (
                    <WeatherWidget date={date} selectedSlot={selectedSlots[0]} />
                  )}

                  {loadingAvailability ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs font-mono text-zinc-400">Loading real-time track slots...</span>
                    </div>
                  ) : (() => {
                    const [year, month, day] = date ? date.split('-').map(Number) : [2026, 1, 1];
                    const dOfWeek = date ? new Date(year, month - 1, day).getDay() : 6;
                    // On Sunday, track closes at 14:30, so exclude 14:30 and 14:45
                    const kidsSlotList = KIDS_SLOTS.filter(s => !(dOfWeek === 0 && (s === "14:30" || s === "14:45")));

                    return (
                      <div className="bg-zinc-950/60 p-3 sm:p-4 border-2 border-zinc-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-800 pb-2">
                          <div>
                            <h4 className="font-mono text-xs sm:text-sm uppercase tracking-wider text-white font-black flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-400" />
                              Go Kart &amp; Mini Bike Sessions
                              <span className="text-[10px] text-blue-400 font-normal font-sans">(15-Min Intervals • {sessionDuration}m Active Ride • R{sessionDuration === 15 ? 280 : 200})</span>
                            </h4>
                            <span className="text-[11px] text-zinc-400">
                              Choose multiple slots to extend ride time • Pit bikes & Quad bikes are walk-in only
                            </span>
                          </div>
                          {selectedSlots.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedSlots([])}
                              className="text-[11px] font-mono text-zinc-400 hover:text-red-400 uppercase font-bold self-start sm:self-auto underline cursor-pointer"
                            >
                              Clear Selection ({selectedSlots.length})
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {kidsSlotList.map((slot) => {
                            const disabled = isSlotDisabled(slot);
                            const selected = selectedSlots.includes(slot);
                            return (
                              <button
                                type="button"
                                key={`kids-${slot}`}
                                disabled={disabled}
                                onClick={() => toggleSlot(slot)}
                                className={`p-2 rounded-none border text-left flex flex-col justify-between transition-all relative ${
                                  disabled 
                                    ? availability[slot]?.isClosed
                                      ? 'border-red-900/60 bg-red-950/40 text-red-400 opacity-60 cursor-not-allowed'
                                      : 'border-zinc-800 bg-zinc-950 text-zinc-600 opacity-60 cursor-not-allowed'
                                    : selected
                                      ? 'border-2 border-blue-400 bg-blue-950/90 text-blue-200 shadow-md ring-1 ring-blue-400/40'
                                      : 'border-zinc-700 hover:border-blue-500 bg-zinc-950 hover:bg-blue-950/30 text-zinc-200 cursor-pointer shadow-xs'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className={`font-mono text-xs font-black tracking-wider ${
                                    selected 
                                      ? 'text-blue-300' 
                                      : availability[slot]?.isClosed
                                        ? 'text-red-400 line-through' 
                                        : disabled
                                          ? 'text-zinc-600 line-through'
                                          : 'text-white'
                                  }`}>
                                    {slot}
                                  </span>
                                  {selected ? (
                                    <span className="flex items-center gap-0.5 text-[7px] font-mono font-bold text-black uppercase bg-blue-400 px-1 py-0.5">
                                      <Check className="w-2 h-2 stroke-[3]" />
                                    </span>
                                  ) : availability[slot]?.isClosed ? (
                                    <span className="text-[7px] font-mono font-bold text-red-300 uppercase bg-red-950/80 px-1 py-0.5">
                                      ✕
                                    </span>
                                  ) : disabled ? (
                                    <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase">
                                      FULL
                                    </span>
                                  ) : (
                                    <span className="text-[7px] font-mono font-bold text-blue-400 uppercase">
                                      OPEN
                                    </span>
                                  )}
                                </div>
                                
                                {/* Capacity Dots */}
                                {renderCapacityDots(slot)}
                              </button>
                            );
                          })}
                        </div>

                        {selectedSlots.length > 0 && (
                          <div className="p-2 bg-blue-950/40 border border-blue-600/40 text-xs font-mono text-blue-300 flex items-center justify-between">
                            <span>✓ Selected: {selectedSlots.join(', ')} ({selectedSlots.length} session{selectedSlots.length > 1 ? 's' : ''})</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Multi-slot summary counter bar */}
                  <div className="bg-zinc-900 border-2 border-zinc-700 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Selected Sessions</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {selectedSlots.length === 0 
                          ? 'No time slots selected yet (tap slots above)'
                          : `${selectedSlots.length} total slot${selectedSlots.length > 1 ? 's' : ''} (${selectedSlots.join(', ')})`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Total Amount</span>
                      <span className="font-sans font-black text-xl text-blue-400">
                        R{getPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
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
                    className="flex-1 sm:flex-initial h-12 px-5 sm:px-7 bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all border border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
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
                  <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2 font-bold">
                    <span className="bg-zinc-950 border border-zinc-700 text-blue-400 px-2 py-0.5 text-xs font-mono">05</span>
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
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">Reserved Date &amp; Time</span>
                      <h4 className="font-bold text-white text-sm">{date} ({dayOfWeekName})</h4>
                      <p className="text-xs text-blue-400 font-mono font-bold mt-1">
                        Selected Time Slots (15-min intervals): {selectedSlots.join(', ')} ({selectedSlots.length} session{selectedSlots.length > 1 ? 's' : ''} of {sessionDuration} min each)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-mono text-brand-light hover:underline uppercase font-bold"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Rental Package Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">Selected Vehicles &amp; Sessions</span>
                      <h4 className="font-bold text-white text-sm">
                        {getSelectedVehiclesSummary()}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        {selectedSlots.length} session{selectedSlots.length > 1 ? 's' : ''} ({sessionDuration} min) × R{sessionDuration === 15 ? 280 : 200} per vehicle on {date}
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
                    <span className="text-2xl font-mono font-black text-blue-400">
                      R{getPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 5-minute hold notice */}
                <div className="bg-blue-950/70 border-2 border-blue-600 p-3.5 text-xs sm:text-sm font-sans leading-snug text-blue-200 flex items-center gap-3 font-bold">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="font-black text-blue-300">⚡ 5-MINUTE RESERVATION LOCK:</span> Your vehicles will be locked for 5 minutes during checkout. Uncompleted checkouts are released back to the track automatically.
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
                        : 'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
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
