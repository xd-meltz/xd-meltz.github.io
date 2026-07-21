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
      <div className="py-32 bg-[#121212] min-h-screen text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-none shadow-none relative overflow-hidden">
          {/* Top Danger Line Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-none flex items-center justify-center text-brand mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-mono text-lg font-bold uppercase tracking-wider text-white">
              Owner Admin Portal
            </h1>
            <p className="text-neutral-400 text-xs mt-2 leading-relaxed font-mono uppercase tracking-wide">
              Enter admin passcode to manage track bookings & locks.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                ADMIN USERNAME
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-brand rounded-none px-4 py-3 text-base md:text-sm font-mono text-center text-white outline-none transition-all"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="passcode" className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                SECRET PASSCODE
              </label>
              <input
                id="passcode"
                type="password"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-brand rounded-none px-4 py-3 text-base md:text-sm font-mono text-center tracking-widest text-white outline-none transition-all"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-none text-center font-mono uppercase tracking-wider">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand hover:bg-brand-light text-black font-mono font-bold uppercase rounded-none text-xs tracking-wider transition-colors cursor-pointer border border-brand"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigateTo('home')}
              className="text-[11px] font-mono text-neutral-500 hover:text-white transition-colors underline uppercase tracking-wider"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 bg-[#121212] min-h-screen text-white px-2 text-[10px] sm:text-xs">
      <div className="max-w-4xl mx-auto space-y-3">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-850 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="h-1 w-1 rounded-none bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                Owner Dashboard
              </span>
            </div>
            <h1 className="font-sans text-sm font-black uppercase text-white tracking-tight italic">
              RIX<span className="text-brand">COMPOUND</span> MANAGER
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex-1 sm:flex-initial px-2 py-1 bg-zinc-950 text-neutral-400 hover:text-white border border-zinc-800 hover:border-brand/40 transition-colors cursor-pointer text-[9px] font-mono uppercase font-bold flex items-center justify-center gap-1"
              title="Refresh"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin text-brand' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="flex-1 sm:flex-initial px-2 py-1 bg-zinc-950 text-neutral-400 hover:text-white border border-zinc-800 hover:border-brand/40 transition-colors cursor-pointer text-[9px] font-mono uppercase font-bold flex items-center justify-center gap-1"
              title="Public Site"
            >
              <Home className="w-2.5 h-2.5" />
              <span>Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial px-2 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 text-[9px] font-mono font-bold uppercase rounded-none transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border border-zinc-800 bg-zinc-950 p-0.5 rounded-none gap-0.5">
          <button
            onClick={() => setAdminTab('bookings')}
            className={`flex-1 py-1 text-center rounded-none text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'bookings' ? 'bg-brand text-black border border-brand' : 'text-neutral-400 hover:text-white hover:bg-zinc-900'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setAdminTab('closures')}
            className={`flex-1 py-1 text-center rounded-none text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'closures' ? 'bg-brand text-black border border-brand' : 'text-neutral-400 hover:text-white hover:bg-zinc-900'}`}
          >
            Locks
          </button>
          <button
            onClick={() => setAdminTab('config')}
            className={`flex-1 py-1 text-center rounded-none text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${adminTab === 'config' ? 'bg-brand text-black border border-brand' : 'text-neutral-400 hover:text-white hover:bg-zinc-900'}`}
          >
            Config
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {adminTab === 'bookings' && (
          <div className="space-y-2">
            
            {/* Key Metrics Widgets */}
            <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-2 rounded-none border border-zinc-800 text-center">
              <div className="py-1">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase tracking-wider mb-0.5">Bookings</span>
                <span className="text-sm font-black font-mono text-white">{totalBookings}</span>
              </div>
              <div className="py-1 border-l border-zinc-800/40">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase tracking-wider mb-0.5">Paid</span>
                <span className="text-sm font-black font-mono text-emerald-400">{paidBookings}</span>
              </div>
              <div className="py-1 border-l border-zinc-800/40">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase tracking-wider mb-0.5">Unpaid</span>
                <span className="text-sm font-black font-mono text-amber-500">{pendingBookings}</span>
              </div>
              <div className="py-1 border-l border-zinc-800/40">
                <span className="text-[8px] font-mono text-neutral-400 block uppercase tracking-wider mb-0.5">Revenue</span>
                <span className="text-sm font-black font-mono text-brand font-bold">R{totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-7 pr-6 py-1 text-[10px] text-white outline-none focus:border-brand transition-all font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="flex bg-zinc-950 p-0.5 border border-zinc-800 rounded-none text-[9px] font-mono uppercase">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 py-1 rounded-none transition-all font-bold cursor-pointer ${statusFilter === 'all' ? 'bg-zinc-900 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`flex-1 py-1 rounded-none transition-all font-bold cursor-pointer ${statusFilter === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`flex-1 py-1 rounded-none transition-all font-bold cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'text-neutral-400 hover:text-white'}`}
                >
                  Unpaid
                </button>
              </div>
            </div>

            {/* Dense Bookings List */}
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[500px] pr-1">
              {filteredBookings.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 border border-zinc-800 rounded-none bg-zinc-950 font-mono text-[9px] uppercase tracking-wider">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-none animate-spin" />
                      <span>Loading bookings...</span>
                    </div>
                  ) : (
                    <span>No matching bookings found.</span>
                  )}
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isConfirmingDelete = confirmDeleteId === b.id;
                  const bikeDetails = b.bikeType === "Mixed"
                    ? `${b.pitBikeQty || 0}P, ${b.quadBikeQty || 0}Q`
                    : `${b.quantity} Unit(s)`;
                  
                  return (
                    <div key={b.id} className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none space-y-1.5 hover:border-brand/40 transition-all flex flex-col justify-between">
                      <div className="space-y-1">
                        {/* Header Line */}
                        <div className="flex items-center justify-between text-[9px] font-mono border-b border-zinc-900 pb-1">
                          <span className="font-black text-brand uppercase tracking-widest">{b.id}</span>
                          <span className="text-neutral-400 font-semibold uppercase">
                            {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • <span className="text-white font-bold">{b.slot}</span>
                          </span>
                        </div>

                        {/* Info Line */}
                        <div className="flex justify-between items-start text-[10px] gap-2">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white uppercase tracking-wide text-xs">{b.name}</div>
                            <div className="text-neutral-400 font-mono text-[9px] flex flex-wrap items-center gap-1">
                              <a href={`tel:${b.phone}`} className="hover:underline hover:text-brand font-bold">{b.phone}</a>
                              <span className="text-neutral-700">|</span>
                              <span className="truncate max-w-[150px]">{b.email}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-black text-white text-xs">R{b.amount.toLocaleString()}</div>
                            <div className="text-neutral-400 font-mono text-[8px] uppercase tracking-wider">
                              {b.packageName ? b.packageName : b.bikeType} ({bikeDetails})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Line */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900/60 mt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePaid(b.id)}
                            className={`px-2 py-0.5 rounded-none text-[8px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                              b.paid
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                            }`}
                          >
                            {b.paid ? 'Paid' : 'Unpaid'}
                          </button>

                          {b.syncedToCalendar ? (
                            <span className="inline-flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-bold uppercase">
                              <Check className="w-2.5 h-2.5" /> Synced
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSyncCalendar(b.id)}
                              className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-neutral-400 hover:text-white rounded-none text-[8px] font-mono font-bold uppercase transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <RefreshCw className="w-2 h-2" /> Sync
                            </button>
                          )}
                        </div>

                        <div>
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-0.5 bg-red-950/20 border border-red-900/50 p-0.5 rounded-none">
                              <span className="text-[8px] text-red-400 font-bold font-mono px-0.5 uppercase">Delete?</span>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-none cursor-pointer"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-0.5 bg-zinc-800 text-neutral-400 rounded-none cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(b.id)}
                              className="p-1 bg-zinc-900 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 border border-zinc-800 rounded-none transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            
            {/* Left Column Forms */}
            <div className="space-y-2">
              {/* Lock Date Range Form */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none space-y-2">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <CalendarOff className="w-3.5 h-3.5 text-brand" />
                  Lock Date Range
                </h3>
                
                <form onSubmit={handleCloseDay} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">Start Date</label>
                      <input
                        type="date"
                        required
                        value={closingStartDate}
                        onChange={(e) => setClosingStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">End Date</label>
                      <input
                        type="date"
                        value={closingEndDate}
                        onChange={(e) => setClosingEndDate(e.target.value)}
                        min={closingStartDate}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">Reason (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Track Maintenance"
                      value={closingReason}
                      onChange={(e) => setClosingReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingClose}
                    className="w-full py-1 bg-brand hover:bg-brand-light text-black font-mono font-bold uppercase rounded-none text-[9px] tracking-wider border border-brand transition-colors cursor-pointer"
                  >
                    {submittingClose ? 'Locking...' : 'Apply Date Lock'}
                  </button>
                </form>
              </div>

              {/* Lock Time Slot Range Form */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none space-y-2">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  Lock Time Slot Range
                </h3>
                
                <form onSubmit={handleCloseSlot} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">Start Date</label>
                      <input
                        type="date"
                        required
                        value={closingSlotStartDate}
                        onChange={(e) => setClosingSlotStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">End Date</label>
                      <input
                        type="date"
                        value={closingSlotEndDate}
                        onChange={(e) => setClosingSlotEndDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">Start Slot</label>
                      <select
                        required
                        value={closingSlotStartTime}
                        onChange={(e) => setClosingSlotStartTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-1.5 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      >
                        <option value="">-- Choose --</option>
                        {["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"].map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">End Slot</label>
                      <select
                        value={closingSlotEndTime}
                        onChange={(e) => setClosingSlotEndTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-1.5 py-1 text-[10px] text-white outline-none focus:border-brand font-mono"
                      >
                        <option value="">-- Single --</option>
                        {["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"].map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-neutral-400 mb-0.5 font-bold tracking-wider">Reason (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Private Booking"
                      value={closingSlotReason}
                      onChange={(e) => setClosingSlotReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1 text-[10px] text-white outline-none focus:border-brand"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingSlotClose}
                    className="w-full py-1 bg-brand hover:bg-brand-light text-black font-mono font-bold uppercase rounded-none text-[9px] tracking-wider border border-brand transition-colors cursor-pointer"
                  >
                    {submittingSlotClose ? 'Locking...' : 'Apply Slot Lock'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column Locked Items List */}
            <div className="space-y-2">
              {/* Locked Dates */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none space-y-2">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Active Date Locks ({closedDays.length})
                </h3>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                  {fetchingClosedDays ? (
                    <div className="text-center py-4 font-mono text-[9px] text-neutral-500">Retrieving locks...</div>
                  ) : closedDays.length === 0 ? (
                    <div className="text-center py-4 text-[9px] text-neutral-500 font-mono uppercase">All days are open</div>
                  ) : (
                    closedDays.map((item) => (
                      <div key={item.date} className="flex items-center justify-between p-1.5 bg-zinc-900 border border-zinc-800 rounded-none">
                        <div className="text-[10px]">
                          <div className="font-mono font-bold text-white uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {item.reason && <div className="text-[9px] text-neutral-400">Reason: {item.reason}</div>}
                        </div>
                        {reopenConfirmDate === item.date ? (
                          <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 border border-zinc-800">
                            <span className="text-[8px] text-emerald-400 font-mono font-bold px-0.5 uppercase">Reopen?</span>
                            <button onClick={() => handleReopenDay(item.date)} className="p-0.5 bg-emerald-600 text-white rounded-none cursor-pointer"><Check className="w-2.5 h-2.5" /></button>
                            <button onClick={() => setReopenConfirmDate(null)} className="p-0.5 bg-zinc-800 text-neutral-400 rounded-none cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReopenConfirmDate(item.date)}
                            className="px-1.5 py-0.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:text-emerald-400 text-[8px] font-mono font-bold uppercase rounded-none transition-colors cursor-pointer"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Locked Slots */}
              <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none space-y-2">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Active Slot Locks ({closedSlots.length})
                </h3>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                  {fetchingClosedSlots ? (
                    <div className="text-center py-4 font-mono text-[9px] text-neutral-500">Retrieving locks...</div>
                  ) : closedSlots.length === 0 ? (
                    <div className="text-center py-4 text-[9px] text-neutral-500 font-mono uppercase">All slots are open</div>
                  ) : (
                    closedSlots.map((item) => {
                      const itemKey = `${item.date}_${item.slot}`;
                      return (
                        <div key={itemKey} className="flex items-center justify-between p-1.5 bg-zinc-900 border border-zinc-800 rounded-none">
                          <div className="text-[10px]">
                            <div className="font-mono font-bold text-white uppercase tracking-wider">
                              <span className="text-brand mr-1">{item.slot}</span>
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {item.reason && <div className="text-[9px] text-neutral-400">Reason: {item.reason}</div>}
                          </div>
                          {reopenConfirmSlotId === itemKey ? (
                            <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 border border-zinc-800">
                              <span className="text-[8px] text-emerald-400 font-mono font-bold px-0.5 uppercase">Reopen?</span>
                              <button onClick={() => handleReopenSlot(item.date, item.slot)} className="p-0.5 bg-emerald-600 text-white rounded-none cursor-pointer"><Check className="w-2.5 h-2.5" /></button>
                              <button onClick={() => setReopenConfirmSlotId(null)} className="p-0.5 bg-zinc-800 text-neutral-400 rounded-none cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReopenConfirmSlotId(itemKey)}
                              className="px-1.5 py-0.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:text-emerald-400 text-[8px] font-mono font-bold uppercase rounded-none transition-colors cursor-pointer"
                            >
                              Reopen
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            
            {/* Google Calendar Link */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-none space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Google Calendar Sync
                </h3>
                {calendarStatus?.linked ? (
                  <div className="space-y-1 text-[10px] font-mono">
                    <p className="text-neutral-300 leading-normal">
                      Linked to <span className="text-blue-400 font-bold">{calendarStatus.linkedEmail}</span>. New bookings automatically sync.
                    </p>
                    <div className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">
                      Updated: {new Date(calendarStatus.updatedAt || '').toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-mono">
                    Connect your owner account to sync bookings dynamically in real-time.
                  </p>
                )}
              </div>
              <button
                onClick={handleConnectCalendar}
                disabled={linkingCalendar}
                className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded-none transition-colors cursor-pointer border border-blue-600 mt-2"
              >
                {calendarStatus?.linked ? 'Reconnect Calendar' : 'Connect Account'}
              </button>
            </div>

            {/* Session Information */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-none space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1 border-b border-zinc-900 pb-1">
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                  Session Controls
                </h3>
                <div className="text-[10px] text-neutral-400 space-y-0.5 font-mono">
                  <div>Active User: <span className="text-white font-bold">{username}</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">AUTHORIZED LEVEL</span></div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 font-mono font-bold uppercase text-[9px] tracking-wider rounded-none transition-colors cursor-pointer mt-2"
              >
                Logout Session
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
