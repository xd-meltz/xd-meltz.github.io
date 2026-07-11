/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bike, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Lock, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Ticket,
  AlertCircle,
  HelpCircle,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  collection, 
  addDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  onSnapshot,
  handleFirestoreError,
  OperationType,
  updateDoc,
  getDoc
} from '../lib/firebase';

// Type definitions for Booking State
interface BookedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00" or "09:45"
  type: 'individual' | 'group';
  packageName: string;
  name: string;
  email: string;
  phone: string;
  bikes: {
    pitBikes: number;
    quads: number;
    ownBikes: number;
  };
  totalPaid: number;
  createdAt: string;
  paid: boolean;
}

export default function BookingSystem({ onBack }: { onBack?: () => void }) {
  // Current Date context for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Calculate today and 1 month ahead bounds
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxBookingDate = new Date(today);
  maxBookingDate.setMonth(maxBookingDate.getMonth() + 1);

  // Initialize selected date to first open bookable date (Wed-Fri, Sat-Sun, no Mon/Tue)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    let startDay = new Date(today);
    while (startDay.getDay() === 1 || startDay.getDay() === 2) {
      startDay.setDate(startDay.getDate() + 1);
    }
    return startDay;
  });

  // Booking Type: Selected automatically based on selectedDate
  const [bookingType, setBookingType] = useState<'individual' | 'group'>(() => {
    let startDay = new Date(today);
    while (startDay.getDay() === 1 || startDay.getDay() === 2) {
      startDay.setDate(startDay.getDate() + 1);
    }
    const day = startDay.getDay();
    // Wednesday (3), Thursday (4), Friday (5) are Group Packages, Saturday (6), Sunday (0) are Individual Rides
    return (day === 3 || day === 4 || day === 5) ? 'group' : 'individual';
  });
  
  // Selected Time Slot
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Fleet quantities (Individual)
  const [pitBikesCount, setPitBikesCount] = useState<number>(1);
  const [quadsCount, setQuadsCount] = useState<number>(0);
  const [ownBikesCount, setOwnBikesCount] = useState<number>(0);

  // Group packages configuration
  const [groupPackageSize, setGroupPackageSize] = useState<5 | 10>(5);
  const [groupDuration, setGroupDuration] = useState<'30min' | '60min' | '4hour'>('30min');

  // Customer Details Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [requirementsAccepted, setRequirementsAccepted] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  // Payment State
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'processing' | 'success'>('processing');

  // Confirmed booking response
  const [latestBooking, setLatestBooking] = useState<BookedSlot | null>(null);

  // List of all bookings persisted in Firebase
  const [bookings, setBookings] = useState<BookedSlot[]>([]);

  // Check for PayFast return parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payfastStatus = params.get('payfast_status');
    const urlBookingId = params.get('booking_id');
    const localBookingId = localStorage.getItem('pending_rix_booking_id');
    const bookingId = urlBookingId || localBookingId;
    
    if (payfastStatus === 'success') {
      if (bookingId) {
        setPaymentStep('processing');
        setIsPaying(true);
        
        const bookingRef = doc(db, 'bookings', bookingId);
        getDoc(bookingRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const currentBookingData = docSnap.data();
              const confirmedBooking: BookedSlot = {
                id: docSnap.id,
                ...currentBookingData
              } as BookedSlot;
              
              if (currentBookingData.paid === true) {
                // Already processed, just show success UI
                setLatestBooking(confirmedBooking);
                setPaymentStep('success');
                localStorage.removeItem('pending_rix_booking');
                localStorage.removeItem('pending_rix_booking_id');
                
                // Clean up query parameters
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('payfast_status');
                cleanUrl.searchParams.delete('booking_id');
                window.history.replaceState({}, document.title, cleanUrl.toString());
              } else {
                // Mark as paid
                updateDoc(bookingRef, { paid: true })
                  .then(() => {
                    confirmedBooking.paid = true;
                    setLatestBooking(confirmedBooking);
                    setPaymentStep('success');
                    localStorage.removeItem('pending_rix_booking');
                    localStorage.removeItem('pending_rix_booking_id');
                    
                    // Queue an automated HTML Ticket Confirmation Email using the Trigger Email format
                    const mailDoc = {
                      to: confirmedBooking.email,
                      message: {
                        subject: `Rix Compound Booking Confirmation - Ticket #${confirmedBooking.id}`,
                        html: `
                          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; border-radius: 16px; background-color: #0a0a0a; color: #ffffff;">
                            <div style="text-align: center; border-bottom: 2px dashed #facc15; padding-bottom: 25px; margin-bottom: 25px;">
                              <h1 style="color: #facc15; margin: 0; font-size: 28px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">RIX COMPOUND</h1>
                              <p style="color: #a3a3a3; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; font-family: monospace;">SECURE ADMISSION TICKET</p>
                            </div>
                            
                            <div style="margin-bottom: 25px; padding: 20px; background-color: #121212; border: 1px solid #1a1a1a; border-radius: 12px;">
                              <h3 style="color: #facc15; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">Reservation Receipt</h3>
                              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d4;">
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">TICKET REF:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #facc15; font-family: monospace;">#${confirmedBooking.id}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">RIDER:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #fff;">${confirmedBooking.name}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">PHONE:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${confirmedBooking.phone}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">DATE:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #fff;">${confirmedBooking.date}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">TIME SLOT:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #facc15;">${confirmedBooking.timeSlot}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">BOOKING TYPE:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${confirmedBooking.type}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #1a1a1a;">
                                  <td style="padding: 8px 0; color: #888; font-family: monospace;">PACKAGE:</td>
                                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #eee; font-size: 13px;">${confirmedBooking.packageName}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 12px 0 0 0; color: #888; font-family: monospace;">TOTAL PAID:</td>
                                  <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 900; text-align: right; color: #facc15;">R${confirmedBooking.totalPaid.toLocaleString('en-ZA')}</td>
                                </tr>
                              </table>
                            </div>
      
                            <div style="margin-bottom: 25px; padding: 20px; background-color: #121212; border: 1px solid #1a1a1a; border-radius: 12px;">
                              <h3 style="color: #facc15; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">Allocated Gear Summary</h3>
                              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #d4d4d4;">
                                ${confirmedBooking.bikes.pitBikes > 0 ? `<li style="margin-bottom: 4px;"><strong style="color: #fff;">${confirmedBooking.bikes.pitBikes}x</strong> Pit Bike Rentals</li>` : ''}
                                ${confirmedBooking.bikes.quads > 0 ? `<li style="margin-bottom: 4px;"><strong style="color: #fff;">${confirmedBooking.bikes.quads}x</strong> Quad ATV Rentals</li>` : ''}
                                ${confirmedBooking.bikes.ownBikes > 0 ? `<li style="margin-bottom: 4px;"><strong style="color: #fff;">${confirmedBooking.bikes.ownBikes}x</strong> Bring Your Own Machine</li>` : ''}
                              </ul>
                            </div>
      
                            <div style="text-align: center; font-size: 12px; border-top: 1px solid #222; padding-top: 20px;">
                              <p style="font-weight: bold; color: #ef4444; margin: 0 0 8px 0; letter-spacing: 0.5px; text-transform: uppercase;">⚠️ NO REFUNDS WAIVER ACTIVE</p>
                              <p style="color: #888; margin: 0 0 15px 0; line-height: 1.5; font-size: 11px;">Riders must be experienced off-roaders. Arrive 15 minutes prior to your time slot for setup. Bring this email or ticket ID to the gate on arrival.</p>
                              <p style="color: #a3a3a3; font-size: 12px; margin: 15px 0 0 0; font-weight: bold;">Rix Compound Gatehouse</p>
                            </div>
                          </div>
                        `
                      }
                    };
                    
                    addDoc(collection(db, 'mail'), mailDoc)
                      .then(() => {
                        console.log("Confirmation email queued successfully in Firestore.");
                      })
                      .catch((e) => {
                        console.error("Failed to queue confirmation email:", e);
                      });
                    
                    // Clean up query parameters so refresh doesn't trigger write again
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('payfast_status');
                    cleanUrl.searchParams.delete('booking_id');
                    window.history.replaceState({}, document.title, cleanUrl.toString());
                  })
                  .catch((err) => {
                    console.error("Error updating booking paid state in Firestore", err);
                    alert("Payment was successful on PayFast, but there was an error updating your booking. Please contact us!");
                    setIsPaying(false);
                    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
                  });
              }
            } else {
              // Document doesn't exist, try falling back to localStorage JSON data
              const pendingRaw = localStorage.getItem('pending_rix_booking');
              if (pendingRaw) {
                const finalBooking = JSON.parse(pendingRaw);
                finalBooking.paid = true;
                addDoc(collection(db, 'bookings'), finalBooking)
                  .then((newDocRef) => {
                    const confirmedBooking: BookedSlot = { id: newDocRef.id, ...finalBooking };
                    setLatestBooking(confirmedBooking);
                    setPaymentStep('success');
                    localStorage.removeItem('pending_rix_booking');
                    localStorage.removeItem('pending_rix_booking_id');
                    
                    // Queue confirmation email
                    const mailDoc = {
                      to: finalBooking.email,
                      message: {
                        subject: `Rix Compound Booking Confirmation - Ticket #${newDocRef.id}`,
                        html: `
                          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; border-radius: 16px; background-color: #0a0a0a; color: #ffffff;">
                            <div style="text-align: center; border-bottom: 2px dashed #facc15; padding-bottom: 25px; margin-bottom: 25px;">
                              <h1 style="color: #facc15; margin: 0; font-size: 28px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">RIX COMPOUND</h1>
                              <p style="color: #a3a3a3; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; font-family: monospace;">SECURE ADMISSION TICKET</p>
                            </div>
                            <div style="margin-bottom: 25px; padding: 20px; background-color: #121212; border: 1px solid #1a1a1a; border-radius: 12px;">
                              <h3 style="color: #facc15; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">Reservation Receipt</h3>
                              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d4;">
                                <tr><td style="padding: 8px 0; color: #888; font-family: monospace;">TICKET REF:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #facc15; font-family: monospace;">#${newDocRef.id}</td></tr>
                                <tr><td style="padding: 8px 0; color: #888; font-family: monospace;">RIDER:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #fff;">${finalBooking.name}</td></tr>
                                <tr><td style="padding: 8px 0; color: #888; font-family: monospace;">TIME SLOT:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #facc15;">${finalBooking.timeSlot}</td></tr>
                                <tr><td style="padding: 12px 0 0 0; color: #888; font-family: monospace;">TOTAL PAID:</td><td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 900; text-align: right; color: #facc15;">R${finalBooking.totalPaid.toLocaleString('en-ZA')}</td></tr>
                              </table>
                            </div>
                          </div>
                        `
                      }
                    };
                    addDoc(collection(db, 'mail'), mailDoc).catch(console.error);
                    
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('payfast_status');
                    cleanUrl.searchParams.delete('booking_id');
                    window.history.replaceState({}, document.title, cleanUrl.toString());
                  })
                  .catch((err) => {
                    console.error("Error creating fallback booking", err);
                    setIsPaying(false);
                  });
              } else {
                console.error("Booking document does not exist and no fallback found in localStorage.");
                setIsPaying(false);
              }
            }
          })
          .catch((err) => {
            console.error("Error getting booking document:", err);
            setIsPaying(false);
            handleFirestoreError(err, OperationType.GET, `bookings/${bookingId}`);
          });
      }
    } else if (payfastStatus === 'cancel') {
      alert("Payment was cancelled or failed on PayFast. Your slot has not been reserved.");
      localStorage.removeItem('pending_rix_booking');
      localStorage.removeItem('pending_rix_booking_id');
      
      if (bookingId) {
        deleteDoc(doc(db, 'bookings', bookingId)).catch((err) => {
          console.warn("Failed to delete cancelled booking document:", err);
        });
      }
      
      // Clean up query parameters
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('payfast_status');
      cleanUrl.searchParams.delete('booking_id');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, []);

  // Scroll to top on mount of Rick's Compound Booking Portal
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load and subscribe to real-time bookings from Firestore
  useEffect(() => {
    const q = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingsList: BookedSlot[] = [];
      snapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() } as BookedSlot);
      });
      
      // If Firestore is empty, let's seed with 3 realistic bookings to represent live track traffic
      if (snapshot.empty) {
        const todayStr = getFormattedDateString(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getFormattedDateString(tomorrow);
        
        const initialMockBookings: Omit<BookedSlot, 'id'>[] = [
          {
            date: todayStr,
            timeSlot: '10:30',
            type: 'individual',
            packageName: 'Pit Bike & Quad Rental',
            name: 'Marco Silva',
            email: 'marco@example.com',
            phone: '0825551234',
            bikes: { pitBikes: 2, quads: 1, ownBikes: 0 },
            totalPaid: 800,
            createdAt: new Date().toISOString(),
            paid: true
          },
          {
            date: tomorrowStr,
            timeSlot: '12:45',
            type: 'individual',
            packageName: 'Pit Bike Session',
            name: 'Zane Venter',
            email: 'zane@example.com',
            phone: '0714445566',
            bikes: { pitBikes: 4, quads: 0, ownBikes: 0 },
            totalPaid: 1150,
            createdAt: new Date().toISOString(),
            paid: true
          },
          {
            date: tomorrowStr,
            timeSlot: '09:00',
            type: 'group',
            packageName: 'Weekday Group (60m - 5 Bikes)',
            name: 'Apex Corporate Team',
            email: 'events@apex.co.za',
            phone: '0218889900',
            bikes: { pitBikes: 5, quads: 0, ownBikes: 0 },
            totalPaid: 3000,
            createdAt: new Date().toISOString(),
            paid: true
          }
        ];

        for (const item of initialMockBookings) {
          try {
            await addDoc(collection(db, 'bookings'), item);
          } catch (err) {
            console.error("Error adding initial live seeding", err);
            handleFirestoreError(err, OperationType.CREATE, 'bookings');
          }
        }
      } else {
        setBookings(bookingsList);
      }
    }, (error) => {
      console.error("Error loading live bookings from database", error);
      handleFirestoreError(error, OperationType.GET, 'bookings');
    });
    return () => unsubscribe();
  }, []);

  const clearAllBookings = async () => {
    if (window.confirm("Are you sure you want to clear all bookings from the database? This will reset the slots.")) {
      try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'bookings', d.id)));
        await Promise.all(deletePromises);
        setBookings([]);
        setSelectedTime('');
      } catch (err) {
        console.error("Error clearing database bookings", err);
        alert("Could not clear database. See console logs.");
        handleFirestoreError(err, OperationType.DELETE, 'bookings');
      }
    }
  };

  // Date utility functions
  function getFormattedDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  const selectedDateStr = getFormattedDateString(selectedDate);

  // Determine if a selected date is a weekend
  const isWeekendDay = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Get active pricing
  const calculateTotal = (): number => {
    if (bookingType === 'individual') {
      const pitBikesCost = pitBikesCount * 250;
      const quadsCost = quadsCount * 300;
      return pitBikesCost + quadsCost;
    } else {
      // Group Packages pricing
      if (groupDuration === '30min') {
        return groupPackageSize === 5 ? 1500 : 3000;
      } else if (groupDuration === '60min') {
        return groupPackageSize === 5 ? 3000 : 5000;
      } else { // 4hour
        return groupPackageSize === 5 ? 8000 : 15200;
      }
    }
  };

  // Defined Slots
  // Individual Rental Slots (45-minute booking slots, 30-minute riding time)
  const individualTimeSlots = [
    "09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15", "15:00"
  ];

  // Group Packages Slots
  const groupTimeSlots = [
    "09:00", "10:30", "12:00", "13:30", "15:00"
  ];

  const currentTimeSlots = bookingType === 'individual' ? individualTimeSlots : groupTimeSlots;

  // Check if a time slot is booked on the selected date
  const isSlotBooked = (time: string): boolean => {
    return bookings.some(b => b.date === selectedDateStr && b.timeSlot === time && b.paid === true);
  };

  // Total bikes booked in a slot (individual booking might have a limit, but prompt says "that slot is taken, no one else can book it")
  const getSlotBookingDetail = (time: string): BookedSlot | undefined => {
    return bookings.find(b => b.date === selectedDateStr && b.timeSlot === time && b.paid === true);
  };

  // Month navigation helpers (restricted to booking exactly 1 month ahead)
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const earliestMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prevMonth >= earliestMonth) {
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const latestMonth = new Date(maxBookingDate.getFullYear(), maxBookingDate.getMonth(), 1);
    if (nextMonth <= latestMonth) {
      setCurrentMonth(nextMonth);
    }
  };

  // Calendar render helper (starts on Monday, ends on Sunday)
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];

    // Calculate padding cells for Monday-start row layout
    // Convert Sunday (0) -> 6 padding cells, Monday (1) -> 0 padding, Tuesday (2) -> 1, etc.
    const paddingCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < paddingCells; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10 sm:h-12 sm:w-12" />);
    }

    // Actual month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const isSelected = getFormattedDateString(dayDate) === selectedDateStr;
      
      const dayOfWeek = dayDate.getDay();
      const isClosed = dayOfWeek === 1 || dayOfWeek === 2; // Mon (1), Tue (2) closed
      const isPast = dayDate < today;
      const isTooFar = dayDate > maxBookingDate;
      const isDisabled = isPast || isTooFar || isClosed;
      const isWeekend = isWeekendDay(dayDate);
      
      let dayStyles = "h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-bold relative transition-all ";
      
      if (isDisabled) {
        if (isClosed) {
          dayStyles += "text-neutral-700 bg-neutral-950/25 line-through cursor-not-allowed hover:bg-transparent";
        } else {
          dayStyles += "text-neutral-750 cursor-not-allowed hover:bg-transparent opacity-40";
        }
      } else if (isSelected) {
        dayStyles += "bg-brand text-black shadow-[0_0_15px_rgba(255,140,0,0.4)] cursor-pointer";
      } else {
        dayStyles += "text-neutral-200 hover:bg-neutral-850 hover:text-white cursor-pointer ";
        if (isWeekend) {
          dayStyles += "border border-amber-500/25 bg-amber-500/5";
        } else {
          dayStyles += "bg-neutral-900/60 border border-neutral-850";
        }
      }

      days.push(
        <button
          key={`day-${d}`}
          disabled={isDisabled}
          type="button"
          onClick={() => {
            if (isDisabled) return;
            setSelectedDate(dayDate);
            setSelectedTime(''); // Reset time selection on date change
            
            // Auto-set the bookingType based on the date clicked
            // Wed (3), Thu (4), Fri (5) are Group Packages
            // Sat (6), Sun (0) are Individual Rentals
            if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) {
              setBookingType('group');
            } else if (dayOfWeek === 6 || dayOfWeek === 0) {
              setBookingType('individual');
            }
          }}
          className={dayStyles}
          title={isClosed ? "Compound Closed (Mondays & Tuesdays)" : isTooFar ? "Bookings restricted to 1 month ahead" : ""}
        >
          <span>{d}</span>
          {isWeekend && !isSelected && !isDisabled && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
          )}
          {!isWeekend && !isSelected && !isDisabled && !isClosed && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-neutral-500" />
          )}
        </button>
      );
    }

    return days;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Please select an available time slot.");
      return;
    }
    if (bookingType === 'individual' && pitBikesCount === 0 && quadsCount === 0) {
      alert("Please select at least 1 rental (Pit Bike or Quad ATV) to book a slot.");
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      alert("Please complete all personal details.");
      return;
    }
    if (!requirementsAccepted) {
      alert("You must acknowledge that competent riding experience is mandatory.");
      return;
    }
    if (!waiverAccepted) {
      alert("You must accept our safety rules & no-refunds waiver terms.");
      return;
    }

    // Immediately trigger processing screen
    setPaymentStep('processing');
    setIsPaying(true);

    try {
      const totalAmount = calculateTotal();
      const finalBooking: Omit<BookedSlot, 'id'> = {
        date: selectedDateStr,
        timeSlot: selectedTime,
        type: bookingType,
        packageName: bookingType === 'individual' 
          ? `Individual Rentals (${pitBikesCount} Pit Bike, ${quadsCount} Quad)`
          : `Weekday Group (${groupDuration === '30min' ? '30m' : groupDuration === '60min' ? '60m' : '4h'} - ${groupPackageSize} Bikes)`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        bikes: {
          pitBikes: bookingType === 'individual' ? pitBikesCount : (groupPackageSize),
          quads: bookingType === 'individual' ? quadsCount : 0,
          ownBikes: 0
        },
        totalPaid: totalAmount,
        createdAt: new Date().toISOString(),
        paid: false
      };

      // Write pending booking to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), finalBooking);
      const bookingId = docRef.id;

      // Store in localStorage as a backup
      localStorage.setItem('pending_rix_booking_id', bookingId);
      localStorage.setItem('pending_rix_booking', JSON.stringify({ ...finalBooking, id: bookingId }));

      // Redirect to PayFast
      redirectToPayFast(totalAmount, bookingId);
    } catch (err) {
      console.error("Error creating pending booking:", err);
      alert("Failed to initialize booking session. Please try again.");
      setIsPaying(false);
      handleFirestoreError(err, OperationType.CREATE, 'bookings');
    }
  };

  const redirectToPayFast = (totalAmount: number, bookingId: string) => {
    const merchantId = (import.meta as any).env.VITE_PAYFAST_MERCHANT_ID || "10000100";
    const merchantKey = (import.meta as any).env.VITE_PAYFAST_MERCHANT_KEY || "464270a3f33d7";
    const processUrl = (import.meta as any).env.VITE_PAYFAST_PROCESS_URL || "https://sandbox.payfast.co.za/eng/process";

    // Build self-referential return and cancel URLs
    const urlSuccess = new URL(window.location.href);
    urlSuccess.searchParams.set('payfast_status', 'success');
    urlSuccess.searchParams.set('booking_id', bookingId);
    
    const urlCancel = new URL(window.location.href);
    urlCancel.searchParams.set('payfast_status', 'cancel');
    urlCancel.searchParams.set('booking_id', bookingId);

    // Create a form element programmatically and submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = processUrl;
    form.target = '_top'; // Break out of any iframes so PayFast loads correctly

    const parameters: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: urlSuccess.toString(),
      cancel_url: urlCancel.toString(),
      name_first: customerName.split(' ')[0] || 'Rider',
      name_last: customerName.split(' ').slice(1).join(' ') || 'Compound',
      email_address: customerEmail,
      phone_number: customerPhone,
      amount: totalAmount.toFixed(2),
      item_name: `Rix Compound Booking: ${selectedTime}`,
      item_description: `${bookingType === 'individual' ? 'Individual Slot' : 'Group Reservation'} on ${selectedDateStr}`,
      custom_str1: bookingId
    };

    for (const [key, value] of Object.entries(parameters)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const handleCloseSuccess = () => {
    setIsPaying(false);
    setLatestBooking(null);
    setSelectedTime('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setRequirementsAccepted(false);
    setWaiverAccepted(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="py-24 sm:py-28 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-850 pb-6 mb-8">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="group inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-mono uppercase tracking-wider mb-2.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> Back to Home
            </button>
          )}
          <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            RIX COMPOUND <span className="text-brand">BOOKING PORTAL</span>
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Real-time reservation system. Select your slot, secure with online payment, and lock your ride.
          </p>
        </div>
        
        {/* Reset utilities for testing */}
        <div className="flex items-center gap-2 sm:self-end">
          <button
            onClick={clearAllBookings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-red-500/40 hover:bg-red-950/20 text-neutral-450 hover:text-red-400 font-mono text-[10px] sm:text-xs transition-all uppercase"
            title="Reset slots back to default for testing"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Slots
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Selection & Configuration (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Calendar & Date Picker */}
          <div className="bg-neutral-900/40 rounded-xl sm:rounded-2xl border border-neutral-850 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-brand">01</span> Choose Your Date
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 text-neutral-400 hover:text-white rounded border border-neutral-800 bg-neutral-950/50"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider min-w-[100px] text-center">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 text-neutral-400 hover:text-white rounded border border-neutral-800 bg-neutral-950/50"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Actual Calendar Block */}
              <div className="md:col-span-7">
                <div className="grid grid-cols-7 gap-1 text-center mb-1 text-neutral-500 font-mono text-[10px] uppercase font-bold">
                  <div>Mo</div>
                  <div>Tu</div>
                  <div>We</div>
                  <div>Th</div>
                  <div>Fr</div>
                  <div>Sa</div>
                  <div>Su</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>
              </div>

              {/* Day info / Guide side card */}
              <div className="md:col-span-5 bg-neutral-950/50 border border-neutral-850 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase font-mono mb-2">
                    <CalendarIcon className="w-3.5 h-3.5" /> Selected Date
                  </div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-white">
                    {selectedDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  {isWeekendDay(selectedDate) ? (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-[10px] font-mono font-bold uppercase">
                      Premium Weekend Slot
                    </div>
                  ) : (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-[10px] font-mono font-bold uppercase">
                      Weekday Slot
                    </div>
                  )}

                  <p className="text-neutral-450 text-xs mt-3 leading-relaxed">
                    {isWeekendDay(selectedDate) 
                      ? "Weekend reservations require booking. Slots fill up quickly. Make sure you complete online checkout."
                      : "Weekday reservations are dedicated primarily to exclusive group layouts of 5-10 bikes."
                    }
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center gap-2 text-neutral-500 text-[10px] font-mono uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Weekend Accent
                  <span className="w-2 h-2 rounded-full bg-neutral-600 ml-2" /> Weekday Accent
                </div>
              </div>

            </div>
          </div>

          {/* STEP 2: Configure Booking Details & Quantities */}
          <div className="bg-neutral-900/40 rounded-xl sm:rounded-2xl border border-neutral-850 p-4 sm:p-6">
            <h3 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-brand">02</span> Fleet & Rider Configuration
            </h3>

            {bookingType === 'individual' ? (
              <div className="space-y-4">
                <div className="p-3 bg-neutral-950/40 rounded-xl border border-neutral-900 text-xs text-neutral-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Maximum fleet limits for safety: <strong>8 Pit Bikes</strong> and <strong>2 ATV Quads</strong> are active concurrently.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Pit Bike Counter */}
                  <div className="bg-neutral-950/60 rounded-xl border border-neutral-850 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-xs uppercase tracking-tight">Pit Bike rentals</h4>
                        <span className="text-brand font-mono font-bold text-xs">R250 <span className="text-neutral-550 text-[10px]">/slot</span></span>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1">Responsive mini motocross dirt bikes (ages 14+).</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-neutral-500 text-[10px] font-mono">Qty (Max 8)</span>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          disabled={pitBikesCount <= 0}
                          onClick={() => setPitBikesCount(prev => Math.max(0, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-white text-sm w-4 text-center">{pitBikesCount}</span>
                        <button 
                          type="button"
                          disabled={pitBikesCount + quadsCount >= 10 || pitBikesCount >= 8}
                          onClick={() => setPitBikesCount(prev => Math.min(8, prev + 1))}
                          className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quad Bike Counter */}
                  <div className="bg-neutral-950/60 rounded-xl border border-neutral-850 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-xs uppercase tracking-tight">Quad ATV rentals</h4>
                        <span className="text-brand font-mono font-bold text-xs">R300 <span className="text-neutral-550 text-[10px]">/slot</span></span>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1">Stable four-wheeled off-road action (ages 14+).</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-neutral-500 text-[10px] font-mono">Qty (Max 2)</span>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          disabled={quadsCount <= 0}
                          onClick={() => setQuadsCount(prev => Math.max(0, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-white text-sm w-4 text-center">{quadsCount}</span>
                        <button 
                          type="button"
                          disabled={pitBikesCount + quadsCount >= 10 || quadsCount >= 2}
                          onClick={() => setQuadsCount(prev => Math.min(2, prev + 1))}
                          className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-3 p-3.5 bg-brand/5 border border-brand/20 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-brand flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-brand block uppercase tracking-wider font-mono text-[10px] mb-0.5">Bringing Your Own Bike?</strong>
                    <span className="text-neutral-300 leading-relaxed">You do <strong className="text-white font-black">not</strong> have to book or reserve online if you are riding with your own bike. Just pay at the gate on arrival! Pre-booking is strictly for rental machines.</span>
                  </div>
                </div>
              </div>
            ) : (
              // Group Configuration Layout
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Select Group Size */}
                  <div className="bg-neutral-950/60 border border-neutral-850 p-4 rounded-xl">
                    <label className="block text-neutral-400 text-xs font-mono uppercase mb-2">Group Fleet Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGroupPackageSize(5)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          groupPackageSize === 5 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-350'
                        }`}
                      >
                        5 Bikes Group
                      </button>
                      <button
                        type="button"
                        onClick={() => setGroupPackageSize(10)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          groupPackageSize === 10 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-350'
                        }`}
                      >
                        10 Bikes Group
                      </button>
                    </div>
                  </div>

                  {/* Select Package Duration */}
                  <div className="bg-neutral-950/60 border border-neutral-850 p-4 rounded-xl md:col-span-2">
                    <label className="block text-neutral-400 text-xs font-mono uppercase mb-2">Package Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setGroupDuration('30min')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          groupDuration === '30min' 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-350'
                        }`}
                      >
                        30 Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setGroupDuration('60min')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          groupDuration === '60min' 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-350'
                        }`}
                      >
                        60 Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setGroupDuration('4hour')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          groupDuration === '4hour' 
                            ? 'bg-brand/10 border-brand text-brand' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-350'
                        }`}
                      >
                        4 Hour Half-Day
                      </button>
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-neutral-950/40 rounded-xl border border-neutral-850 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-xs uppercase">Selected Group Booking Level</h4>
                    <p className="text-neutral-400 text-[11px] mt-0.5">Exclusive track reservation with custom fleet safety briefing</p>
                  </div>
                  <span className="font-mono font-black text-brand text-xl sm:text-2xl">R{calculateTotal().toLocaleString('en-ZA')}</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Choose Time Slot */}
          <div className="bg-neutral-900/40 rounded-xl sm:rounded-2xl border border-neutral-850 p-4 sm:p-6">
            <h3 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="text-brand">03</span> Select Time Slot
            </h3>
            <p className="text-neutral-400 text-[11px] sm:text-xs mb-4 leading-relaxed">
              {bookingType === 'individual' 
                ? "Individual slots run strictly in 45-minute booking cycles (30 minutes of real riding time + 15 minutes safety prep)."
                : "Group package blocks run in exclusive intervals on Wednesday – Friday."
              }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {currentTimeSlots.map((time) => {
                const booked = isSlotBooked(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={booked}
                    onClick={() => setSelectedTime(time)}
                    className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      booked
                        ? 'bg-red-950/20 border-red-900/30 text-neutral-600 cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'bg-brand/20 border-brand text-brand shadow-[0_0_15px_rgba(255,140,0,0.15)] scale-[1.03]'
                          : 'bg-neutral-950/50 border-neutral-850 hover:border-neutral-700 text-neutral-200'
                    }`}
                  >
                    <Clock className={`w-4 h-4 mb-1.5 ${booked ? 'text-red-900/50' : isSelected ? 'text-brand' : 'text-neutral-500'}`} />
                    <span className="font-mono text-xs sm:text-sm font-bold">{time}</span>
                    
                    {bookingType === 'individual' && (
                      <span className="text-[9px] font-sans text-neutral-450 mt-1 leading-none font-normal block">
                        45m slot
                      </span>
                    )}

                    {booked ? (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center backdrop-blur-[1px]">
                        <Lock className="w-3.5 h-3.5 text-red-500 mb-0.5" />
                        <span className="font-mono text-[8px] text-red-400 font-extrabold uppercase tracking-wide">Occupied</span>
                      </div>
                    ) : isSelected ? (
                      <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-black text-[9px] font-black">✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedTime && (
              <div className="mt-4 p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between text-xs text-neutral-300">
                <span>Selected Interval: <strong className="text-white font-mono">{selectedTime}</strong> on <strong className="text-white">{selectedDate.toLocaleDateString()}</strong></span>
                <span className="text-amber-500 font-mono font-bold uppercase text-[10px] tracking-widest animate-pulse">● Live Selected</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Checkout Summary & Rider Waiver Rules (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Booking Summary Box */}
          <div className="bg-neutral-900/80 rounded-xl sm:rounded-2xl border-2 border-neutral-800 p-4 sm:p-6 sticky top-24">
            <h3 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider mb-4 border-b border-neutral-850 pb-2">
              Booking Summary
            </h3>
            
            <div className="space-y-4">
              
              {/* Type Detail */}
              <div className="flex justify-between items-start text-xs border-b border-neutral-900 pb-3">
                <div>
                  <span className="text-neutral-500 uppercase font-mono block text-[9px]">Category</span>
                  <span className="text-white font-bold uppercase">
                    {bookingType === 'individual' ? "Individual Slots" : "Group Package"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 uppercase font-mono block text-[9px]">Ride time</span>
                  <span className="text-amber-400 font-bold uppercase font-mono text-xs">
                    {bookingType === 'individual' ? "30 MINS RIDE" : `${groupDuration === '30min' ? '30m' : groupDuration === '60min' ? '60m' : '4 HOURS'}`}
                  </span>
                </div>
              </div>

              {/* Date / Time */}
              <div className="flex justify-between items-start text-xs border-b border-neutral-900 pb-3">
                <div>
                  <span className="text-neutral-500 uppercase font-mono block text-[9px]">Target Date</span>
                  <span className="text-white font-bold">{selectedDateStr}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 uppercase font-mono block text-[9px]">Target Time Slot</span>
                  <span className="text-white font-mono font-bold text-xs">
                    {selectedTime ? selectedTime : "Not Selected"}
                  </span>
                </div>
              </div>

              {/* Selected Gear */}
              <div className="text-xs border-b border-neutral-900 pb-3 space-y-1.5">
                <span className="text-neutral-500 uppercase font-mono block text-[9px]">Gear configuration</span>
                {bookingType === 'individual' ? (
                  <>
                    {pitBikesCount > 0 && (
                      <div className="flex justify-between text-neutral-300">
                        <span>{pitBikesCount}x Pit Bike Rental(s)</span>
                        <span className="font-mono text-neutral-400">R{pitBikesCount * 250}</span>
                      </div>
                    )}
                    {quadsCount > 0 && (
                      <div className="flex justify-between text-neutral-300">
                        <span>{quadsCount}x Quad ATV Rental(s)</span>
                        <span className="font-mono text-neutral-400">R{quadsCount * 300}</span>
                      </div>
                    )}
                    {ownBikesCount > 0 && (
                      <div className="flex justify-between text-neutral-300">
                        <span>{ownBikesCount}x BYO Own Bike(s)</span>
                        <span className="font-mono text-neutral-400">R{ownBikesCount * 150}</span>
                      </div>
                    )}
                    {pitBikesCount === 0 && quadsCount === 0 && ownBikesCount === 0 && (
                      <span className="text-neutral-600 block italic">Add bikes above...</span>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-neutral-350">
                    <span>{groupPackageSize} Bikes Pack ({groupDuration === '30min' ? '30m' : groupDuration === '60min' ? '60m' : '4h'})</span>
                    <span className="font-mono text-neutral-400">R{calculateTotal()}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Total to Pay Now</span>
                <span className="font-mono font-black text-brand text-2xl">R{calculateTotal().toLocaleString('en-ZA')}</span>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 mt-2.5">
                <div>
                  <label className="block text-neutral-400 text-[10px] font-mono uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-mono uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                      placeholder="e.g. name@host.com"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] font-mono uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors"
                      placeholder="e.g. 0821234567"
                    />
                  </div>
                </div>

                {/* Rider Requirements Warning Checkboxes */}
                <div className="bg-amber-500/5 border border-amber-500/35 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <input
                      type="checkbox"
                      id="accept-reqs"
                      required
                      checked={requirementsAccepted}
                      onChange={(e) => setRequirementsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-850 bg-neutral-950 text-brand focus:ring-0"
                    />
                    <label htmlFor="accept-reqs" className="text-neutral-300">
                      I confirm all rental riders have <strong className="text-white">competent off-road riding experience</strong>. (strictly no beginners)
                    </label>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <input
                      type="checkbox"
                      id="accept-waiver"
                      required
                      checked={waiverAccepted}
                      onChange={(e) => setWaiverAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-850 bg-neutral-950 text-brand focus:ring-0"
                    />
                    <label htmlFor="accept-waiver" className="text-neutral-300">
                      I agree to the compound safety waiver and acknowledge there are <strong className="text-white">no refunds</strong>.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedTime || (bookingType === 'individual' && pitBikesCount === 0 && quadsCount === 0 && ownBikesCount === 0)}
                  className="w-full bg-brand text-black font-black uppercase tracking-wider py-3.5 rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-brand/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Secure & Book Now
                </button>
              </form>

              <div className="text-[10px] text-neutral-500 text-center uppercase tracking-wide mt-2">
                🔒 Encrypted Payment System • Instant Reservation
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* RENTAL RULES SUMMARY ACCENT TAB */}
      <div className="bg-neutral-950/70 border border-neutral-850 rounded-2xl p-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex gap-4 items-start col-span-2">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2.5 rounded-xl flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-black text-white uppercase text-sm tracking-wide">
              No Refunds & Zero Beginner Tolerance
            </h4>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
              Once you pay and secure your slot, that exact time block is permanently taken and reserved exclusively for your bikes. No refund of booking fees is possible. Riders must possess prior dirt riding competency to operate compound units.
            </p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">Questions or Events?</span>
          <a 
            href="https://wa.me/27768299919" 
            target="_blank" 
            rel="noreferrer"
            className="text-brand font-black text-sm uppercase tracking-wider mt-1 hover:underline"
          >
            WhatsApp Support
          </a>
        </div>
      </div>

      {/* HIGH FIDELITY SECURE GATEWAY DIALOG MODAL OVERLAY */}
      <AnimatePresence>
        {isPaying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Caution stripes header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#ff8c00,#ff8c00_8px,#000_8px,#000_16px)]" />

              {paymentStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-neutral-850" />
                    <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                    <Bike className="w-6 h-6 text-brand absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <span className="font-mono text-[10px] text-brand uppercase font-black tracking-widest block animate-pulse">RE-DIRECTING SECURELY</span>
                  <h4 className="font-display text-lg font-black text-white uppercase tracking-tight mt-1.5">OPENING PAYFAST PORTAL</h4>
                  <p className="text-neutral-450 text-xs mt-2 max-w-xs">
                    Please do not refresh or close. Initiating South Africa's leading secure merchant checkout for slot {selectedTime} on {selectedDateStr}.
                  </p>
                </div>
              )}

              {paymentStep === 'success' && latestBooking && (
                <div className="py-2">
                  <div className="flex flex-col items-center justify-center text-center mb-5">
                    <div className="w-12 h-12 bg-brand/10 border border-brand/30 text-brand rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[9px] text-brand uppercase font-black tracking-widest">TRANSACTION SUCCESSFUL</span>
                    <h4 className="font-display text-lg font-black text-white uppercase tracking-tight">RIDE SLOT LOCKED!</h4>
                  </div>

                  {/* High fidelity ticket receipt */}
                  <div className="bg-neutral-950 rounded-2xl border-2 border-neutral-850 p-4 relative overflow-hidden font-mono text-[11px] text-neutral-350 space-y-2">
                    
                    {/* Ticket notch side circles */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800" />
                    
                    <div className="flex justify-between items-center text-white font-bold border-b border-neutral-900 pb-2.5">
                      <span className="text-[12px] uppercase">Compound Entry Ticket</span>
                      <span className="text-brand text-[12px]">{latestBooking.id}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 pt-1 border-b border-neutral-900/60 pb-2">
                      <div>
                        <span className="text-neutral-550 uppercase text-[9px] block">RIDER</span>
                        <span className="text-white text-xs font-sans font-bold">{latestBooking.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-550 uppercase text-[9px] block">DATE</span>
                        <span className="text-white text-xs font-bold">{latestBooking.date}</span>
                      </div>
                      <div>
                        <span className="text-neutral-550 uppercase text-[9px] block">INTERVAL TIME</span>
                        <span className="text-brand text-xs font-bold">{latestBooking.timeSlot}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-550 uppercase text-[9px] block">TOTAL PRICE</span>
                        <span className="text-white text-xs font-bold">R{latestBooking.totalPaid}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-neutral-400 space-y-1 font-sans">
                      <div className="font-bold text-white uppercase flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-brand" /> Allocated Gear:
                      </div>
                      <div className="pl-4 leading-relaxed font-mono text-[10px]">
                        {latestBooking.bikes.pitBikes > 0 && <div>• {latestBooking.bikes.pitBikes}x Pit Bike Rentals</div>}
                        {latestBooking.bikes.quads > 0 && <div>• {latestBooking.bikes.quads}x Quad ATV Rentals</div>}
                        {latestBooking.bikes.ownBikes > 0 && <div>• {latestBooking.bikes.ownBikes}x BYO Own Bikes</div>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 flex flex-col items-center justify-center text-center">
                      {/* Simulated Barcode */}
                      <div className="bg-white px-2 py-1.5 rounded mt-1.5 select-none w-full flex flex-col items-center">
                        <div className="h-6 w-11/12 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_6px,#000_6px,#000_7px)]" />
                        <span className="text-[8px] text-black tracking-[4px] mt-1 font-mono font-bold">{latestBooking.id}-RESERVED</span>
                      </div>
                    </div>

                  </div>

                  <p className="text-[10px] text-red-400 text-center uppercase tracking-wide font-extrabold mt-4">
                    ⚠️ NO REFUNDS WAIVER ACTIVE • ARRIVE 15M EARLY
                  </p>

                  <button
                    type="button"
                    onClick={handleCloseSuccess}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold uppercase text-xs tracking-wider py-3.5 rounded-xl mt-4 transition-all"
                  >
                    Done & Exit Portal
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
