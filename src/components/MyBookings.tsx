import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Bike, 
  Receipt, 
  ChevronRight, 
  Ticket, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  Hash
} from 'lucide-react';
import { navigateTo } from '../App';
import { parseSafeTime, db } from '../lib/firebase';
import { collection, query as fsQuery, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Helper to compare phone numbers across different local/international formats
function comparePhones(phoneA: string, phoneB: string): boolean {
  const digitsA = phoneA ? phoneA.replace(/[^0-9]/g, '') : '';
  const digitsB = phoneB ? phoneB.replace(/[^0-9]/g, '') : '';
  if (!digitsA || !digitsB) return false;
  if (digitsA === digitsB) return true;
  const last9A = digitsA.slice(-9);
  const last9B = digitsB.slice(-9);
  if (last9A.length === 9 && last9B.length === 9 && last9A === last9B) {
    return true;
  }
  return false;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slot: string;
  bikeType: string;
  packageName: string;
  quantity: number;
  amount: number;
  paid: boolean;
  createdAt: string;
}

export default function MyBookings() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setBookings(null);

    try {
      const qTrim = query.trim();
      const params = new URLSearchParams();
      params.append('idNumber', qTrim);

      let data: Booking[] = [];
      try {
        const res = await fetch(`/api/my-bookings?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Server returned error status');
        }
        data = await res.json();
      } catch (apiErr) {
        console.warn('API fetch failed, falling back to direct Firestore query:', apiErr);
        
        // DIRECT FIRESTORE FALLBACK FOR ID NUMBER OR BOOKING ID
        const bookingsCol = collection(db, 'bookings');
        const bookingMap = new Map<string, any>();
        
        // 1. Direct document lookup by ID
        try {
          const docRef = doc(db, 'bookings', qTrim);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const b = { id: docSnap.id, ...docSnap.data() } as any;
            const isPaid = b.paid === true || b.paid === 'true' || b.paymentStatus === 'COMPLETE';
            if (isPaid) {
              bookingMap.set(b.id, b);
            }
          }
        } catch (e) {}

        // 2. Query where idNumber matches (single-field query, no composite index needed)
        try {
          const qIdNumber = fsQuery(bookingsCol, where('idNumber', '==', qTrim));
          const snapId = await getDocs(qIdNumber);
          snapId.forEach((dSnap) => {
            const b = { id: dSnap.id, ...dSnap.data() } as any;
            const isPaid = b.paid === true || b.paid === 'true' || b.paymentStatus === 'COMPLETE';
            if (isPaid) {
              bookingMap.set(dSnap.id, b);
            }
          });
        } catch (e) {}

        // 3. Check localStorage for local cached bookings
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rix_booking_')) {
              const itemStr = localStorage.getItem(key);
              if (itemStr) {
                const b = JSON.parse(itemStr);
                const matches = (b.id && b.id.toLowerCase() === qTrim.toLowerCase()) || 
                                (b.idNumber && b.idNumber.toLowerCase() === qTrim.toLowerCase()) ||
                                (b.email && b.email.toLowerCase() === qTrim.toLowerCase()) ||
                                (b.phone && comparePhones(b.phone, qTrim));
                if (matches && (b.paid === true || b.paid === 'true')) {
                  bookingMap.set(b.id, b);
                }
              }
            }
          }
        } catch (e) {}

        data = Array.from(bookingMap.values());
      }

      // Sort bookings: paid first, then upcoming dates
      const sorted = (data as Booking[]).sort((a, b) => {
        return b.date.localeCompare(a.date) || b.slot.localeCompare(a.slot);
      });
      
      setBookings(sorted);
      if (sorted.length === 0) {
        setError(`No bookings found matching ID Number or Reference "${qTrim}". Please check the number and try again.`);
      }
    } catch (err) {
      console.error('Error fetching my bookings:', err);
      setError('An error occurred while fetching your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBookingExpired = (b: Booking) => {
    if (b.paid) return false;
    const createdTime = parseSafeTime(b.createdAt);
    const elapsedMs = Date.now() - createdTime;
    return createdTime > 0 && elapsedMs > 10 * 60 * 1000;
  };

  return (
    <div className="pt-28 pb-16 sm:pt-32 sm:pb-24 bg-transparent min-h-screen text-white flex flex-col px-3 sm:px-6 lg:px-8">
      {/* Visual Header */}
      <div className="max-w-3xl mx-auto w-full text-center mb-8 sm:mb-12">
        <div className="inline-flex bg-zinc-900 border border-blue-500/50 p-1.5 sm:p-2 rounded-none mb-3 sm:mb-4">
          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase italic tracking-tight">
          MY <span className="text-blue-400">BOOKINGS</span>
        </h1>
        <p className="text-zinc-300 text-[11px] sm:text-sm mt-1.5 max-w-lg mx-auto font-sans px-2">
          Retrieve your reservation passes, view session statuses, or complete secure Payfast checkout for pending sessions.
        </p>
      </div>

      {/* Search Console Card */}
      <div className="max-w-2xl mx-auto w-full mb-6 sm:mb-8">
        <div className="bg-zinc-900/90 border-2 border-zinc-700 rounded-none p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-300 mb-2">
                ENTER YOUR ID NUMBER OR BOOKING REFERENCE <span className="text-brand-light font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 9501015028088 or BK-123456"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-none px-3 py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-24 sm:pr-28 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans transition-all"
                />
                <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-blue-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 sm:px-4 bg-blue-600 text-white font-extrabold uppercase rounded-none hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-1 sm:gap-1.5 transition-all text-[10px] sm:text-xs cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <span>Search</span>
                      <Search className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results Container */}
      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/80 border border-red-700 rounded-none p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 text-red-200"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider font-mono">No Records Found</h4>
                <p className="text-red-200 text-[11px] sm:text-xs mt-0.5 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          {bookings && bookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  FOUND {bookings.length} {bookings.length === 1 ? 'BOOKING' : 'BOOKINGS'}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">
                  Sorted by date
                </span>
              </div>

              {bookings.map((booking, index) => {
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-900/90 border-2 border-zinc-700 rounded-none overflow-hidden hover:border-zinc-500 transition-all group shadow-xl backdrop-blur-md"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Booking Summary */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-black text-blue-400 tracking-wider bg-zinc-950 px-2 py-0.5 rounded-none border border-zinc-700">
                            {booking.id}
                          </span>
                          
                          <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest bg-blue-950/80 border border-blue-600 text-blue-300 px-2 py-0.5 rounded-none flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            PAID & SECURED
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display font-extrabold text-sm sm:text-base text-white">
                            {booking.packageName}
                          </h3>
                          <p className="text-zinc-300 text-[11px] sm:text-xs mt-0.5 font-sans">
                            Booked for: <strong className="text-white">{booking.name}</strong>
                          </p>
                        </div>

                        {/* Timing / Detail Blocks */}
                        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono text-zinc-300 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                            <span>{booking.slot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                            <span>R {booking.amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="flex items-center sm:self-center mt-1 sm:mt-0">
                        <button
                          onClick={() => navigateTo('ticket', booking.id)}
                          className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2.5 font-extrabold uppercase rounded-none text-[10px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                        >
                          <span>View Pass</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
