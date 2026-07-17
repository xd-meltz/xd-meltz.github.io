/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  RefreshCw, 
  Home, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle,
  CalendarOff,
  Plus,
  Clock
} from 'lucide-react';
import { navigateTo } from '../App';
import { motion } from 'motion/react';

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
  pitBikeQty?: number;
  quadBikeQty?: number;
  amount: number;
  paid: boolean;
  createdAt: string;
  calendarEventId?: string;
  syncedToCalendar?: boolean;
}

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('safeLocalStorage.getItem failed:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('safeLocalStorage.setItem failed:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('safeLocalStorage.removeItem failed:', e);
    }
  }
};

export default function AdminPanel() {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Google Calendar Link status
  const [calendarStatus, setCalendarStatus] = useState<{ linked: boolean; linkedEmail?: string; updatedAt?: string } | null>(null);
  const [linkingCalendar, setLinkingCalendar] = useState(false);

  // Closed Days states
  const [closedDays, setClosedDays] = useState<{ date: string; reason?: string; createdAt?: string }[]>([]);
  const [closingStartDate, setClosingStartDate] = useState('');
  const [closingEndDate, setClosingEndDate] = useState('');
  const [closingReason, setClosingReason] = useState('');
  const [submittingClose, setSubmittingClose] = useState(false);
  const [fetchingClosedDays, setFetchingClosedDays] = useState(false);
  const [reopenConfirmDate, setReopenConfirmDate] = useState<string | null>(null);

  // Closed Slots states
  const [closedSlots, setClosedSlots] = useState<{ id: string; date: string; slot: string; reason?: string; createdAt?: string }[]>([]);
  const [closingSlotStartDate, setClosingSlotStartDate] = useState('');
  const [closingSlotEndDate, setClosingSlotEndDate] = useState('');
  const [closingSlotStartTime, setClosingSlotStartTime] = useState('');
  const [closingSlotEndTime, setClosingSlotEndTime] = useState('');
  const [closingSlotReason, setClosingSlotReason] = useState('');
  const [submittingSlotClose, setSubmittingSlotClose] = useState(false);
  const [fetchingClosedSlots, setFetchingClosedSlots] = useState(false);
  const [reopenConfirmSlotId, setReopenConfirmSlotId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'bookings' | 'closures' | 'config'>('bookings');

  // Check if session credentials exist in localStorage
  useEffect(() => {
    const savedUser = safeLocalStorage.getItem('rix_admin_username');
    const savedPass = safeLocalStorage.getItem('rix_admin_passcode');
    if (savedUser?.trim().toLowerCase() === 'igor rix' && savedPass?.trim() === 'compoundrix.20') {
      setUsername(savedUser.trim());
      setPasscode(savedPass.trim());
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch admin data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError('');
    fetchBookings();
    fetchCalendarStatus();
    fetchClosedDays();
    fetchClosedSlots();
  }, [isAuthenticated]);

  const fetchClosedDays = async () => {
    setFetchingClosedDays(true);
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();

    try {
      const res = await fetch(`/api/admin/closed-dates?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`);
      if (res.ok) {
        const data = await res.json();
        setClosedDays(data);
        setFetchingClosedDays(false);
        return;
      }
    } catch (err) {
      console.warn('API fetch closed days failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { getClosedDatesDirect } = await import('../lib/firebase');
      const data = await getClosedDatesDirect();
      setClosedDays(data);
    } catch (fsErr) {
      console.error('Error fetching closed days from Firestore:', fsErr);
    } finally {
      setFetchingClosedDays(false);
    }
  };

  const handleCloseDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingStartDate) {
      alert('Please select a start date to close.');
      return;
    }

    if (closingEndDate && closingEndDate < closingStartDate) {
      alert('End Date cannot be earlier than Start Date.');
      return;
    }

    setSubmittingClose(true);
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();

    try {
      const res = await fetch(`/api/admin/closed-dates?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: closingStartDate,
          endDate: closingEndDate || closingStartDate,
          reason: closingReason
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const rangeInfo = closingEndDate && closingEndDate !== closingStartDate
            ? `${closingStartDate} to ${closingEndDate}`
            : closingStartDate;
          alert(`Successfully closed date(s): ${rangeInfo}`);
          setClosingStartDate('');
          setClosingEndDate('');
          setClosingReason('');
          fetchClosedDays();
          setSubmittingClose(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API add closed days failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { addClosedDateDirect } = await import('../lib/firebase');
      
      const dates: string[] = [];
      let curr = new Date(closingStartDate);
      const last = new Date(closingEndDate || closingStartDate);
      while (curr <= last) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
        curr.setDate(curr.getDate() + 1);
      }

      for (const d of dates) {
        await addClosedDateDirect(d, closingReason);
      }

      const rangeInfo = closingEndDate && closingEndDate !== closingStartDate
        ? `${closingStartDate} to ${closingEndDate}`
        : closingStartDate;
      alert(`Successfully closed date(s) (Direct Firestore): ${rangeInfo}`);
      setClosingStartDate('');
      setClosingEndDate('');
      setClosingReason('');
      fetchClosedDays();
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to save closed dates to Firestore.');
    } finally {
      setSubmittingClose(false);
    }
  };

  const handleReopenDay = async (dateToReopen: string) => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();

    try {
      const res = await fetch(`/api/admin/closed-dates/delete?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateToReopen })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReopenConfirmDate(null);
          alert(`Successfully reopened date: ${dateToReopen}`);
          fetchClosedDays();
          return;
        }
      }
    } catch (err) {
      console.warn('API delete closed day failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { removeClosedDateDirect } = await import('../lib/firebase');
      await removeClosedDateDirect(dateToReopen);
      setReopenConfirmDate(null);
      alert(`Successfully reopened date (Direct Firestore): ${dateToReopen}`);
      fetchClosedDays();
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to reopen date in Firestore.');
    }
  };

  const fetchClosedSlots = async () => {
    setFetchingClosedSlots(true);
    try {
      const { getClosedSlotsDirect } = await import('../lib/firebase');
      const data = await getClosedSlotsDirect();
      setClosedSlots(data);
    } catch (fsErr) {
      console.error('Error fetching closed slots from Firestore:', fsErr);
    } finally {
      setFetchingClosedSlots(false);
    }
  };

  const handleCloseSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingSlotStartDate) {
      alert('Please select a start date.');
      return;
    }
    if (!closingSlotStartTime) {
      alert('Please select a start time slot.');
      return;
    }

    setSubmittingSlotClose(true);

    try {
      const { addClosedSlotDirect } = await import('../lib/firebase');

      // Define all slots
      const ALL_SLOTS = ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"];
      
      let selectedSlots = [closingSlotStartTime];
      if (closingSlotEndTime) {
        const startIndex = ALL_SLOTS.indexOf(closingSlotStartTime);
        const endIndex = ALL_SLOTS.indexOf(closingSlotEndTime);
        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Invalid slot configuration.');
        }
        if (startIndex > endIndex) {
          throw new Error('Start time slot cannot be after end time slot.');
        }
        selectedSlots = ALL_SLOTS.slice(startIndex, endIndex + 1);
      }

      // Generate dates in range
      const dates: string[] = [];
      let curr = new Date(closingSlotStartDate);
      const last = new Date(closingSlotEndDate || closingSlotStartDate);
      while (curr <= last) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
        curr.setDate(curr.getDate() + 1);
      }

      for (const d of dates) {
        for (const s of selectedSlots) {
          await addClosedSlotDirect(d, s, closingSlotReason);
        }
      }

      const slotRangeStr = closingSlotEndTime && closingSlotEndTime !== closingSlotStartTime
        ? `${closingSlotStartTime} to ${closingSlotEndTime}`
        : closingSlotStartTime;

      const dateRangeStr = closingSlotEndDate && closingSlotEndDate !== closingSlotStartDate
        ? `${closingSlotStartDate} to ${closingSlotEndDate}`
        : closingSlotStartDate;

      alert(`Successfully closed slot range (${slotRangeStr}) on ${dateRangeStr}!`);
      
      setClosingSlotStartDate('');
      setClosingSlotEndDate('');
      setClosingSlotStartTime('');
      setClosingSlotEndTime('');
      setClosingSlotReason('');
      fetchClosedSlots();
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to close slots in Firestore.');
    } finally {
      setSubmittingSlotClose(false);
    }
  };

  const handleReopenSlot = async (date: string, slot: string) => {
    try {
      const { removeClosedSlotDirect } = await import('../lib/firebase');
      await removeClosedSlotDirect(date, slot);
      setReopenConfirmSlotId(null);
      alert(`Successfully reopened slot: ${slot} on ${date}`);
      fetchClosedSlots();
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to reopen slot in Firestore.');
    }
  };

  const fetchBookings = async () => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();

    if (activeUser.toLowerCase() !== 'igor rix' || activePass !== 'compoundrix.20') {
      setError('Incorrect credentials or unauthorized.');
      setIsAuthenticated(false);
      safeLocalStorage.removeItem('rix_admin_username');
      safeLocalStorage.removeItem('rix_admin_passcode');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/bookings?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        setError('');
        setLoading(false);
        return;
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error('Incorrect credentials or unauthorized.');
      }
    } catch (err) {
      console.warn('API fetch bookings failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { getAllBookingsDirect } = await import('../lib/firebase');
      const data = await getAllBookingsDirect();
      const mapped = data.map((b: any) => ({
        ...b,
        id: b.id,
        paid: b.paid !== false
      }));
      mapped.sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
      });
      setBookings(mapped);
      setError('');
    } catch (fsErr: any) {
      setError(fsErr.message || 'Failed to retrieve bookings from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarStatus = () => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();
    fetch(`/api/admin/calendar-status?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not available');
        return res.json();
      })
      .then((data) => setCalendarStatus(data))
      .catch((err) => {
        console.warn('Error checking calendar status, falling back:', err);
        setCalendarStatus({ linked: false, linkedEmail: "Server link offline" });
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();
    if (cleanUser.toLowerCase() === 'igor rix' && cleanPass === 'compoundrix.20') {
      setUsername(cleanUser);
      setPasscode(cleanPass);
      setIsAuthenticated(true);
      setAuthError('');
      safeLocalStorage.setItem('rix_admin_username', cleanUser);
      safeLocalStorage.setItem('rix_admin_passcode', cleanPass);
    } else {
      setAuthError('Incorrect admin username or passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPasscode('');
    safeLocalStorage.removeItem('rix_admin_username');
    safeLocalStorage.removeItem('rix_admin_passcode');
  };

  const handleTogglePaid = async (id: string) => {
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();

    try {
      const res = await fetch(`/api/admin/bookings/${id}/toggle-paid?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
          return;
        }
      }
    } catch (err) {
      console.warn('API toggle paid failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const currentBooking = bookings.find(b => b.id === id);
      if (currentBooking) {
        const bookingRef = doc(db, 'bookings', id);
        await updateDoc(bookingRef, { paid: !currentBooking.paid });
        setBookings(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
      }
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to update booking status in Firestore.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();

    try {
      const res = await fetch(`/api/admin/bookings/${id}/delete?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings(prev => prev.filter(b => b.id !== id));
          setConfirmDeleteId(null);
          return;
        }
      }
    } catch (err) {
      console.warn('API delete booking failed, falling back to direct Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const bookingRef = doc(db, 'bookings', id);
      await deleteDoc(bookingRef);
      setBookings(prev => prev.filter(b => b.id !== id));
      setConfirmDeleteId(null);
      alert('Booking deleted successfully (Direct Firestore).');
    } catch (fsErr: any) {
      alert(fsErr.message || 'Failed to delete booking in Firestore.');
    }
  };

  const handleSyncCalendar = (id: string) => {
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();
    fetch(`/api/admin/bookings/${id}/sync-calendar?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Calendar synchronization failed');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setBookings(prev => prev.map(b => b.id === id ? { ...b, syncedToCalendar: true, calendarEventId: data.booking.calendarEventId } : b));
          alert('Successfully synced with Google Calendar!');
        }
      })
      .catch(err => {
        console.warn('Google Calendar sync offline fallback:', err);
        alert('Google Calendar Sync requires server-side hosting. Local and Firestore changes are fully functional!');
      });
  };

  const handleConnectCalendar = () => {
    setLinkingCalendar(true);
    const customToken = prompt("Enter your Google OAuth access token to link Google Calendar (Owner Account):");
    if (!customToken) {
      setLinkingCalendar(false);
      return;
    }

    const cleanUser = username.trim();
    const cleanPass = passcode.trim();

    fetch(`/api/admin/set-calendar-token?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: customToken, linkedEmail: "rixcompound@gmail.com" })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Calendar Token Linked Successfully! Background auto-sync of unsynced bookings has started.');
          fetchCalendarStatus();
          fetchBookings();
        }
      })
      .catch(err => {
        console.warn('Connecting calendar offline fallback:', err);
        alert('Google Calendar Integration requires server-side hosting.');
      })
      .finally(() => setLinkingCalendar(false));
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      b.name.toLowerCase().includes(query) ||
      b.id.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.date.includes(query);

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'paid' ? b.paid : !b.paid;

    return matchesSearch && matchesStatus;
  });

  // Math metrics
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paid).length;
  const pendingBookings = totalBookings - paidBookings;
  const totalRevenue = bookings.filter(b => b.paid).reduce((acc, curr) => acc + curr.amount, 0);

  if (!isAuthenticated) {
    return (
      <div className="py-32 bg-neutral-950 min-h-screen text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-850 p-8 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Top Danger Line Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#ff8c00,#ff8c00_10px,#000_10px,#000_20px)]" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-3">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="font-display text-xl font-black uppercase tracking-tight text-white">
              Owner Admin Portal
            </h1>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
              Enter your secret admin passcode to manage track bookings, toggle payments, and remove/delete slots.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                ADMIN USERNAME
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-brand rounded-xl px-4 py-3 text-base md:text-sm font-mono text-center text-white outline-none transition-all"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="passcode" className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                SECRET PASSCODE
              </label>
              <input
                id="passcode"
                type="password"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-brand rounded-xl px-4 py-3 text-base md:text-sm font-mono text-center tracking-widest text-white outline-none transition-all"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-lg text-center font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand hover:bg-brand-light text-black font-extrabold uppercase rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-brand/10 hover:shadow-brand/20 active:scale-[0.98]"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigateTo('home')}
              className="text-[11px] font-mono text-neutral-500 hover:text-white transition-colors underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-neutral-950 min-h-screen text-white px-2">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header Title Section */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
          <div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                Owner Dashboard
              </span>
            </div>
            <h1 className="font-display text-base font-black uppercase text-white tracking-tight italic">
              RIX<span className="text-brand">COMPOUND</span> MANAGER
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-1.5 bg-neutral-900 rounded-lg text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand' : ''}`} />
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="p-1.5 bg-neutral-900 rounded-lg text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Public Site"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex border border-neutral-900 bg-neutral-900/40 p-0.5 rounded-xl gap-0.5">
          <button
            onClick={() => setAdminTab('bookings')}
            className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'bookings' ? 'bg-brand text-black' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            📋 Bookings
          </button>
          <button
            onClick={() => setAdminTab('closures')}
            className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'closures' ? 'bg-brand text-black' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            🔒 Locks
          </button>
          <button
            onClick={() => setAdminTab('config')}
            className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'config' ? 'bg-brand text-black' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            ⚙️ Config
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {adminTab === 'bookings' && (
          <div className="space-y-3">
            
            {/* Key Metrics Widgets */}
            <div className="grid grid-cols-4 gap-1 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-850 text-center">
              <div className="py-1">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase">Bookings</span>
                <span className="text-sm font-black font-mono text-white">{totalBookings}</span>
              </div>
              <div className="py-1 border-l border-neutral-850">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase">Paid</span>
                <span className="text-sm font-black font-mono text-emerald-400">{paidBookings}</span>
              </div>
              <div className="py-1 border-l border-neutral-850">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase">Unpaid</span>
                <span className="text-sm font-black font-mono text-amber-500">{pendingBookings}</span>
              </div>
              <div className="py-1 border-l border-neutral-850">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase">Revenue</span>
                <span className="text-xs font-black font-mono text-brand">R{(totalRevenue/1000).toFixed(1)}k</span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8.5 pr-8 py-1.5 text-[11px] text-white outline-none focus:border-brand/50 transition-all font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex bg-neutral-900/40 p-0.5 border border-neutral-850 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 py-1 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`flex-1 py-1 rounded-lg transition-colors ${statusFilter === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-400'}`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`flex-1 py-1 rounded-lg transition-colors ${statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'text-neutral-400'}`}
                >
                  Unpaid
                </button>
              </div>
            </div>

            {/* Dense Bookings List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-850 rounded-xl">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[9px]">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono">No matching bookings.</span>
                  )}
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isConfirmingDelete = confirmDeleteId === b.id;
                  const bikeDetails = b.bikeType === "Mixed"
                    ? `${b.pitBikeQty || 0}P, ${b.quadBikeQty || 0}Q`
                    : `${b.quantity} Unit(s)`;
                  
                  return (
                    <div key={b.id} className="bg-neutral-900 border border-neutral-850/70 p-2 rounded-xl space-y-1.5 hover:border-neutral-800 transition-all">
                      
                      {/* Header Line */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-brand uppercase tracking-wider">{b.id}</span>
                        <span className="text-neutral-400 font-medium">
                          {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • <span className="text-white font-bold">{b.slot}</span>
                        </span>
                      </div>

                      {/* Info Line */}
                      <div className="flex justify-between items-start text-[10px]">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-white">{b.name}</div>
                          <div className="text-neutral-400 font-mono text-[9px] flex items-center gap-1.5">
                            <a href={`tel:${b.phone}`} className="hover:underline hover:text-brand">{b.phone}</a>
                            <span className="text-neutral-600">|</span>
                            <span className="truncate max-w-[140px]">{b.email}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-black text-white">R{b.amount.toLocaleString()}</div>
                          <div className="text-neutral-400 font-mono text-[9px] uppercase">
                            {b.packageName ? b.packageName : b.bikeType} ({bikeDetails})
                          </div>
                        </div>
                      </div>

                      {/* Action Line */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-850/50">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePaid(b.id)}
                            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border transition-all ${
                              b.paid
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}
                          >
                            {b.paid ? 'Paid' : 'Unpaid'}
                          </button>

                          {b.syncedToCalendar ? (
                            <span className="inline-flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                              <Check className="w-2.5 h-2.5" /> Synced
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSyncCalendar(b.id)}
                              className="px-1.5 py-0.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded text-[8px] font-bold uppercase transition-colors flex items-center gap-0.5"
                            >
                              <RefreshCw className="w-2 h-2" /> Sync
                            </button>
                          )}
                        </div>

                        <div>
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-red-400 font-bold font-mono">Del?</span>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1 bg-red-600 text-white rounded text-[8px]"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 bg-neutral-800 text-neutral-400 rounded text-[8px]"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(b.id)}
                              className="p-1 bg-neutral-950 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 border border-neutral-800 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLOSURES */}
        {adminTab === 'closures' && (
          <div className="space-y-4">
            
            {/* Lock Date Range Form */}
            <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl space-y-2">
              <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                <CalendarOff className="w-3.5 h-3.5 text-brand" />
                Lock Date Range
              </h3>
              
              <form onSubmit={handleCloseDay} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">Start Date</label>
                    <input
                      type="date"
                      required
                      value={closingStartDate}
                      onChange={(e) => setClosingStartDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">End Date</label>
                    <input
                      type="date"
                      value={closingEndDate}
                      onChange={(e) => setClosingEndDate(e.target.value)}
                      min={closingStartDate}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">Reason (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Track work"
                    value={closingReason}
                    onChange={(e) => setClosingReason(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingClose}
                  className="w-full py-1.5 bg-brand hover:bg-brand-light text-black font-extrabold uppercase rounded-lg text-[9px] tracking-wider cursor-pointer"
                >
                  {submittingClose ? 'Locking...' : 'Apply Date Lock'}
                </button>
              </form>
            </div>

            {/* Lock Time Slot Range Form */}
            <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl space-y-2">
              <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand" />
                Lock Time Slot Range
              </h3>
              
              <form onSubmit={handleCloseSlot} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">Start Date</label>
                    <input
                      type="date"
                      required
                      value={closingSlotStartDate}
                      onChange={(e) => setClosingSlotStartDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">End Date</label>
                    <input
                      type="date"
                      value={closingSlotEndDate}
                      onChange={(e) => setClosingSlotEndDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">Start Slot</label>
                    <select
                      required
                      value={closingSlotStartTime}
                      onChange={(e) => setClosingSlotStartTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    >
                      <option value="">-- Choose --</option>
                      {["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">End Slot</label>
                    <select
                      value={closingSlotEndTime}
                      onChange={(e) => setClosingSlotEndTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none font-mono"
                    >
                      <option value="">-- Single --</option>
                      {["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold">Reason (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Private Hire"
                    value={closingSlotReason}
                    onChange={(e) => setClosingSlotReason(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingSlotClose}
                  className="w-full py-1.5 bg-brand hover:bg-brand-light text-black font-extrabold uppercase rounded-lg text-[9px] tracking-wider cursor-pointer"
                >
                  {submittingSlotClose ? 'Locking...' : 'Apply Slot Lock'}
                </button>
              </form>
            </div>

            {/* Locked Items Lists */}
            <div className="space-y-3">
              {/* Locked Dates */}
              <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl space-y-1.5">
                <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Date Locks ({closedDays.length})
                </h3>
                <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
                  {fetchingClosedDays ? (
                    <div className="text-center py-4 font-mono text-[9px] text-neutral-500">Retrieving locks...</div>
                  ) : closedDays.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-neutral-500">All days are open</div>
                  ) : (
                    closedDays.map((item) => (
                      <div key={item.date} className="flex items-center justify-between p-1.5 bg-neutral-950 border border-neutral-850/60 rounded-lg">
                        <div className="text-[10px]">
                          <div className="font-mono font-bold text-white">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {item.reason && <div className="text-[9px] text-neutral-400">📝 {item.reason}</div>}
                        </div>
                        {reopenConfirmDate === item.date ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-emerald-400 font-mono">Open?</span>
                            <button onClick={() => handleReopenDay(item.date)} className="p-0.5 bg-emerald-600 text-white rounded"><Check className="w-2.5 h-2.5" /></button>
                            <button onClick={() => setReopenConfirmDate(null)} className="p-0.5 bg-neutral-800 text-neutral-400 rounded"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReopenConfirmDate(item.date)}
                            className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 hover:text-emerald-400 text-[8px] font-extrabold uppercase rounded"
                          >
                            Open
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Locked Slots */}
              <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl space-y-1.5">
                <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Slot Locks ({closedSlots.length})
                </h3>
                <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
                  {fetchingClosedSlots ? (
                    <div className="text-center py-4 font-mono text-[9px] text-neutral-500">Retrieving locks...</div>
                  ) : closedSlots.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-neutral-500">All slots are open</div>
                  ) : (
                    closedSlots.map((item) => {
                      const itemKey = `${item.date}_${item.slot}`;
                      return (
                        <div key={itemKey} className="flex items-center justify-between p-1.5 bg-neutral-950 border border-neutral-850/60 rounded-lg">
                          <div className="text-[10px]">
                            <div className="font-mono font-bold text-white">
                              <span className="text-brand mr-1">{item.slot}</span>
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            {item.reason && <div className="text-[9px] text-neutral-400">📝 {item.reason}</div>}
                          </div>
                          {reopenConfirmSlotId === itemKey ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-emerald-400 font-mono">Open?</span>
                              <button onClick={() => handleReopenSlot(item.date, item.slot)} className="p-0.5 bg-emerald-600 text-white rounded"><Check className="w-2.5 h-2.5" /></button>
                              <button onClick={() => setReopenConfirmSlotId(null)} className="p-0.5 bg-neutral-800 text-neutral-400 rounded"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReopenConfirmSlotId(itemKey)}
                              className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 hover:text-emerald-400 text-[8px] font-extrabold uppercase rounded"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CONFIG */}
        {adminTab === 'config' && (
          <div className="space-y-4">
            
            {/* Google Calendar Link */}
            <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl space-y-2.5">
              <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Google Calendar Sync
              </h3>
              {calendarStatus?.linked ? (
                <div className="space-y-1 text-[10px]">
                  <p className="text-neutral-300 leading-normal">
                    Linked to <span className="text-blue-400 font-bold">{calendarStatus.linkedEmail}</span>. New bookings automatically sync.
                  </p>
                  <div className="text-[8px] text-neutral-500 font-mono">
                    Updated: {new Date(calendarStatus.updatedAt || '').toLocaleString()}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Connect your owner account to sync bookings dynamically in real-time.
                </p>
              )}
              <button
                onClick={handleConnectCalendar}
                disabled={linkingCalendar}
                className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                {calendarStatus?.linked ? 'Reconnect Calendar' : 'Connect Account'}
              </button>
            </div>

            {/* Session Information */}
            <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl space-y-2">
              <h3 className="font-display text-xs font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Session Controls
              </h3>
              <div className="text-[10px] text-neutral-400 space-y-0.5">
                <div>Active User: <span className="text-white font-bold font-mono">{username}</span></div>
                <div>Status: <span className="text-emerald-400 font-bold font-mono">AUTHORIZED</span></div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[9px] font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Logout Session
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
