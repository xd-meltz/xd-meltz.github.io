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
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'id'>('email');
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
      const params = new URLSearchParams();
      params.append(searchType, query.trim());

      let data: Booking[] = [];
      try {
        const res = await fetch(`/api/my-bookings?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Server returned error status');
        }
        data = await res.json();
      } catch (apiErr) {
        console.warn('API fetch failed, falling back to direct Firestore query:', apiErr);
        
        // DIRECT FIRESTORE FALLBACK
        const bookingsCol = collection(db, 'bookings');
        const qTrim = query.trim();
        
        if (searchType === 'id') {
          // Direct document lookup by ID
          const docRef = doc(db, 'bookings', qTrim);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const b = { id: docSnap.id, ...docSnap.data() } as any;
            if (b.paid) {
              data = [b];
            }
          }
        } else if (searchType === 'email') {
          // Query by email (exact, lower, and upper checks to be safe)
          const queries = [
            fsQuery(bookingsCol, where('email', '==', qTrim), where('paid', '==', true)),
            fsQuery(bookingsCol, where('email', '==', qTrim.toLowerCase()), where('paid', '==', true)),
            fsQuery(bookingsCol, where('email', '==', qTrim.toUpperCase()), where('paid', '==', true))
          ];
          
          const bookingMap = new Map<string, any>();
          for (const q of queries) {
            const snap = await getDocs(q);
            snap.forEach((docSnap) => {
              bookingMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
            });
          }
          data = Array.from(bookingMap.values());
        } else if (searchType === 'phone') {
          // Since phone format can vary, we query all paid bookings first and then filter in memory
          // In Firestore, if the database is small, this is extremely fast and robust
          const qExact = fsQuery(bookingsCol, where('phone', '==', qTrim), where('paid', '==', true));
          const snapExact = await getDocs(qExact);
          const bookingMap = new Map<string, any>();
          snapExact.forEach((docSnap) => {
            bookingMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });
          
          // Fallback: If no exact phone matches, scan all paid bookings
          if (bookingMap.size === 0) {
            const qAllPaid = fsQuery(bookingsCol, where('paid', '==', true));
            const snapAllPaid = await getDocs(qAllPaid);
            snapAllPaid.forEach((docSnap) => {
              const b = { id: docSnap.id, ...docSnap.data() } as any;
              if (b.phone && comparePhones(b.phone, qTrim)) {
                bookingMap.set(docSnap.id, b);
              }
            });
          }
          data = Array.from(bookingMap.values());
        }
      }

      // Sort bookings: paid first, then upcoming dates
      const sorted = (data as Booking[]).sort((a, b) => {
        // Sort by date descending
        return b.date.localeCompare(a.date) || b.slot.localeCompare(a.slot);
      });
      
      setBookings(sorted);
      if (sorted.length === 0) {
        setError(`No bookings found matching that ${searchType === 'id' ? 'Booking ID' : searchType === 'email' ? 'email address' : 'phone number'}.`);
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
    <div className="pt-28 pb-16 sm:pt-32 sm:pb-24 bg-neutral-950 min-h-screen text-neutral-100 flex flex-col px-3 sm:px-6 lg:px-8">
      {/* Visual Header */}
      <div className="max-w-3xl mx-auto w-full text-center mb-8 sm:mb-12">
        <div className="inline-flex bg-brand/10 border border-brand/20 p-1.5 sm:p-2 rounded-full mb-3 sm:mb-4">
          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase italic tracking-tight">
          MY <span className="text-brand">BOOKINGS</span>
        </h1>
        <p className="text-neutral-400 text-[11px] sm:text-sm mt-1.5 max-w-lg mx-auto font-sans px-2">
          Retrieve your reservation passes, view session statuses, or complete secure Payfast checkout for pending sessions.
        </p>
      </div>

      {/* Search Console Card */}
      <div className="max-w-2xl mx-auto w-full mb-6 sm:mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand to-brand-light" />
          
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-neutral-400 mb-2">
                SEARCH BY
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-neutral-950 rounded-lg sm:rounded-xl border border-neutral-850">
                <button
                  type="button"
                  onClick={() => { setSearchType('email'); setQuery(''); setError(null); }}
                  className={`py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                    searchType === 'email' 
                      ? 'bg-brand text-black shadow-md shadow-brand/10' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSearchType('phone'); setQuery(''); setError(null); }}
                  className={`py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                    searchType === 'phone' 
                      ? 'bg-brand text-black shadow-md shadow-brand/10' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Phone</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSearchType('id'); setQuery(''); setError(null); }}
                  className={`py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                    searchType === 'id' 
                      ? 'bg-brand text-black shadow-md shadow-brand/10' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>ID Ref</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchType === 'email' 
                    ? 'e.g. rider@example.com' 
                    : searchType === 'phone' 
                      ? 'e.g. 0821234567 or +27...' 
                      : 'e.g. BK-123456'
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-24 sm:pr-28 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-sans transition-all"
              />
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-neutral-600">
                {searchType === 'email' && <Mail className="w-3.5 h-3.5" />}
                {searchType === 'phone' && <Phone className="w-3.5 h-3.5" />}
                {searchType === 'id' && <Hash className="w-3.5 h-3.5" />}
              </div>
              
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 sm:px-4 bg-brand text-black font-extrabold uppercase rounded-md sm:rounded-lg hover:bg-brand-light active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-1 sm:gap-1.5 transition-all text-[10px] sm:text-xs cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
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
              className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider font-mono">No Records Found</h4>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5 leading-relaxed">{error}</p>
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
                <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                  FOUND {bookings.length} {bookings.length === 1 ? 'BOOKING' : 'BOOKINGS'}
                </span>
                <span className="text-[9px] font-mono text-neutral-500">
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
                    className="bg-neutral-900 border border-neutral-800 rounded-lg sm:rounded-xl overflow-hidden hover:border-neutral-700 transition-all group shadow-lg"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Booking Summary */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-black text-brand tracking-wider bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                            {booking.id}
                          </span>
                          
                          <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            PAID & SECURED
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display font-extrabold text-sm sm:text-base text-white">
                            {booking.packageName}
                          </h3>
                          <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5 font-sans">
                            Booked for: <strong className="text-neutral-200">{booking.name}</strong>
                          </p>
                        </div>

                        {/* Timing / Detail Blocks */}
                        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono text-neutral-400 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
                            <span>{booking.slot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
                            <span>R {booking.amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="flex items-center sm:self-center mt-1 sm:mt-0">
                        <button
                          onClick={() => navigateTo('ticket', booking.id)}
                          className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2.5 font-extrabold uppercase rounded-md sm:rounded-lg text-[10px] sm:text-xs tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-brand hover:bg-brand-light text-black shadow-md shadow-brand/10"
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
