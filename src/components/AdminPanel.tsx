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
  Plus
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
  }, [isAuthenticated]);

  const fetchClosedDays = () => {
    setFetchingClosedDays(true);
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();
    fetch(`/api/admin/closed-dates?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve closed dates.');
        return res.json();
      })
      .then((data) => {
        setClosedDays(data);
      })
      .catch((err) => console.error('Error fetching closed days:', err))
      .finally(() => setFetchingClosedDays(false));
  };

  const handleCloseDay = (e: React.FormEvent) => {
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

    fetch(`/api/admin/closed-dates?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: closingStartDate,
        endDate: closingEndDate || closingStartDate,
        reason: closingReason
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to close selected date(s).');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const rangeInfo = closingEndDate && closingEndDate !== closingStartDate
            ? `${closingStartDate} to ${closingEndDate}`
            : closingStartDate;
          alert(`Successfully closed date(s): ${rangeInfo}`);
          setClosingStartDate('');
          setClosingEndDate('');
          setClosingReason('');
          fetchClosedDays();
        }
      })
      .catch((err) => alert(err.message))
      .finally(() => setSubmittingClose(false));
  };

  const handleReopenDay = (dateToReopen: string) => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();

    fetch(`/api/admin/closed-dates/delete?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateToReopen })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to reopen date.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setReopenConfirmDate(null);
          alert(`Successfully reopened date: ${dateToReopen}`);
          fetchClosedDays();
        }
      })
      .catch((err) => alert(err.message));
  };

  const fetchBookings = () => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();
    fetch(`/api/admin/bookings?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Incorrect credentials or unauthorized.');
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve bookings.');
        setIsAuthenticated(false);
        safeLocalStorage.removeItem('rix_admin_username');
        safeLocalStorage.removeItem('rix_admin_passcode');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCalendarStatus = () => {
    const activeUser = (username || safeLocalStorage.getItem('rix_admin_username') || '').trim();
    const activePass = (passcode || safeLocalStorage.getItem('rix_admin_passcode') || '').trim();
    fetch(`/api/admin/calendar-status?username=${encodeURIComponent(activeUser)}&passcode=${encodeURIComponent(activePass)}`)
      .then((res) => res.json())
      .then((data) => setCalendarStatus(data))
      .catch((err) => console.error('Error checking calendar status:', err));
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

  const handleTogglePaid = (id: string) => {
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();
    fetch(`/api/admin/bookings/${id}/toggle-paid?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          // Update local state
          setBookings(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
        }
      })
      .catch(err => alert(err.message));
  };

  const handleDeleteBooking = (id: string) => {
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();
    fetch(`/api/admin/bookings/${id}/delete?username=${encodeURIComponent(cleanUser)}&passcode=${encodeURIComponent(cleanPass)}`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete booking');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setBookings(prev => prev.filter(b => b.id !== id));
          setConfirmDeleteId(null);
        }
      })
      .catch(err => alert(err.message));
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
      .catch(err => alert(err.message));
  };

  const handleConnectCalendar = () => {
    setLinkingCalendar(true);
    // Simulate linking calendar token config
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
      .catch(err => alert(err.message))
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
    <div className="py-24 sm:py-32 bg-neutral-950 min-h-screen text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-900 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                Owner Dashboard
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight italic mt-1">
              RIX<span className="text-brand">COMPOUND</span> MANAGER
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2.5 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Refresh lists"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold uppercase rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 1. Google Calendar Sync Manager Section */}
        <div className="bg-neutral-900/40 border border-neutral-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-white uppercase tracking-tight">
                Google Calendar Integration
              </h3>
              {calendarStatus?.linked ? (
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                  Linked to <span className="text-blue-400 font-bold">{calendarStatus.linkedEmail}</span>. New bookings automatically sync to your calendar. Last update: {new Date(calendarStatus.updatedAt || '').toLocaleString()}.
                </p>
              ) : (
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                  Connect your Google Calendar account so that bookings sync automatically in real-time.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleConnectCalendar}
            disabled={linkingCalendar}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            {calendarStatus?.linked ? 'Reconnect Calendar' : 'Connect Google Calendar'}
          </button>
        </div>

        {/* 2. Key Metrics Widgets Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total Bookings</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalBookings}</span>
              <span className="text-[10px] text-neutral-400 font-mono">slots</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Paid & Secured</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{paidBookings}</span>
              <span className="text-[10px] text-neutral-500 font-mono">({Math.round(totalBookings ? (paidBookings/totalBookings)*100 : 0)}%)</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Awaiting Payment</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">{pendingBookings}</span>
              <span className="text-[10px] text-neutral-400 font-mono">unpaid</span>
            </div>
          </div>

          <div className="bg-neutral-900 border-2 border-brand/20 p-4 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Total Revenue (Secured)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-black text-brand mr-1">R</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-brand font-mono">{totalRevenue.toLocaleString()}</span>
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand/10 rounded-full blur-xl" />
          </div>
        </div>

        {/* 3. Search and Filtering bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-850 p-4 rounded-2xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, reference, email, date, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-brand/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <span className="text-xs text-neutral-400 uppercase font-mono mr-1">Filter:</span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'paid' ? 'bg-emerald-500/25 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Paid
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'pending' ? 'bg-amber-500/25 text-amber-500 font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Unpaid
              </button>
            </div>
          </div>
        </div>

        {/* 4. Bookings Data Table */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-850 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Rider Details</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Specification</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Google Calendar</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/60 text-xs">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-neutral-500">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                          <span className="font-mono text-[10px]">Loading track records...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-lg">📂</span>
                          <span>No bookings match your query or filters.</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isConfirmingDelete = confirmDeleteId === b.id;
                    const bikeDetails = b.bikeType === "Mixed"
                      ? `${b.pitBikeQty || 0} Pit, ${b.quadBikeQty || 0} Quad`
                      : `${b.quantity} Unit(s)`;

                    return (
                      <tr key={b.id} className="hover:bg-neutral-950/30 transition-colors">
                        {/* Reference */}
                        <td className="p-4 font-mono font-bold text-brand uppercase tracking-wider">
                          {b.id}
                        </td>

                        {/* Rider Details */}
                        <td className="p-4">
                          <div className="font-bold text-white leading-normal">{b.name}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{b.phone}</div>
                          <div className="text-[10px] text-neutral-500">{b.email}</div>
                        </td>

                        {/* Schedule */}
                        <td className="p-4">
                          <div className="font-semibold text-white">
                            {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="font-mono text-[10px] text-neutral-400 mt-0.5 bg-neutral-950/80 px-2 py-0.5 rounded border border-neutral-850/50 inline-block">
                            🕒 {b.slot}
                          </div>
                        </td>

                        {/* Bike Spec */}
                        <td className="p-4">
                          <div className="font-bold text-neutral-200 capitalize">{b.bikeType}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">{bikeDetails}</div>
                          {b.packageName && (
                            <div className="text-[9px] font-mono text-brand mt-0.5 uppercase tracking-tight truncate max-w-[120px]">
                              {b.packageName}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right font-mono font-bold text-white text-sm">
                          R{b.amount.toLocaleString()}
                        </td>

                        {/* Paid status toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleTogglePaid(b.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                              b.paid
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 hover:content-["UNPAY"]'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                            }`}
                            title="Click to toggle paid status"
                          >
                            {b.paid ? 'PAID' : 'UNPAID'}
                          </button>
                        </td>

                        {/* Calendar sync status */}
                        <td className="p-4 text-center">
                          {b.syncedToCalendar ? (
                            <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <Check className="w-3 h-3" /> Synced
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSyncCalendar(b.id)}
                              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                              title="Sync to Google Calendar now"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Force Sync
                            </button>
                          )}
                        </td>

                        {/* Delete/Action Buttons */}
                        <td className="p-4 text-right">
                          {isConfirmingDelete ? (
                            <div className="flex items-center justify-end gap-1.5 animate-pulse">
                              <span className="text-[10px] text-red-400 font-bold font-mono mr-1">Confirm delete?</span>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                                title="Yes, delete"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 rounded-lg transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(b.id)}
                              className="p-2 bg-neutral-950 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 border border-neutral-850 hover:border-red-500/20 rounded-xl transition-all hover:scale-105 cursor-pointer inline-flex items-center"
                              title="Delete booking slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Close Days Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Close New Date form */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-850 p-6 rounded-2xl space-y-4">
            <h3 className="font-display text-sm font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-brand" />
              Close a Date / Timeline
            </h3>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Prevent public clients from reserving slots on a specific date or a timeline range. Closed dates are immediately disabled in the customer calendar.
            </p>

            <form onSubmit={handleCloseDay} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={closingStartDate}
                    onChange={(e) => setClosingStartDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-brand rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold flex items-center justify-between">
                    <span>End Date</span>
                    <span className="text-[8px] text-neutral-500 font-normal lowercase">optional</span>
                  </label>
                  <input
                    type="date"
                    value={closingEndDate}
                    onChange={(e) => setClosingEndDate(e.target.value)}
                    min={closingStartDate}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-brand rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {closingStartDate && closingEndDate && closingStartDate !== closingEndDate && (
                <div className="bg-neutral-950/50 border border-neutral-850 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">Timeline Mode:</span>
                  <span className="text-[10px] text-brand font-mono font-bold">
                    Entire range will be closed
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5 font-bold">
                  Reason / Event Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Private Track Day, Maintenance"
                  value={closingReason}
                  onChange={(e) => setClosingReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-brand rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submittingClose}
                className="w-full py-2.5 bg-brand hover:bg-brand-light text-black font-extrabold uppercase rounded-xl text-[10px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingClose ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Applying Closure...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apply Date/Timeline Closure</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Currently Closed Dates List */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 p-6 rounded-2xl flex flex-col">
            <h3 className="font-display text-sm font-extrabold text-white uppercase tracking-tight flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Date Closures
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-1">
              {fetchingClosedDays ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-[9px] text-neutral-500">Retrieving closures...</span>
                </div>
              ) : closedDays.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xl">✅</span>
                  <span className="text-xs font-bold text-neutral-400">All days are open</span>
                  <span className="text-[10px] text-neutral-500">No date locks have been applied.</span>
                </div>
              ) : (
                closedDays.map((item) => (
                  <div key={item.date} className="flex items-center justify-between p-3.5 bg-neutral-950/60 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-all">
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {item.reason && (
                        <div className="text-[10px] text-neutral-400 mt-1 font-semibold">
                          📝 {item.reason}
                        </div>
                      )}
                      {item.createdAt && (
                        <div className="text-[9px] text-neutral-500 mt-0.5 font-mono">
                          Locked at: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {reopenConfirmDate === item.date ? (
                      <div className="flex items-center justify-end gap-1.5 animate-pulse">
                        <span className="text-[10px] text-emerald-400 font-bold font-mono mr-1">Confirm reopen?</span>
                        <button
                          onClick={() => handleReopenDay(item.date)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors cursor-pointer"
                          title="Yes, reopen"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setReopenConfirmDate(null)}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 rounded-lg transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReopenConfirmDate(item.date)}
                        className="px-2.5 py-1.5 bg-neutral-900 hover:bg-emerald-500/10 border border-neutral-800 hover:border-emerald-500/30 text-neutral-400 hover:text-emerald-400 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
