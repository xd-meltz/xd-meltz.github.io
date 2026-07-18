/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyD2WmWajGqgAK_xu6Ey-h6QkbPAKMZAD2c",
  authDomain: "sound-vial-wttsj.firebaseapp.com",
  projectId: "sound-vial-wttsj",
  storageBucket: "sound-vial-wttsj.firebasestorage.app",
  messagingSenderId: "1044994878274",
  appId: "1:1044994878274:web:6426bfdd8f0d7ea9a2b6db"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific named database ID
export const db = initializeFirestore(app, {}, "ai-studio-rixcompound-7aca96af-088b-44d0-8b67-6e7c89062000");

/**
 * Safely parse any date value (String, Timestamp, Date object, etc.) to a millisecond timestamp
 */
export function parseSafeTime(val: any): number {
  if (!val) return 0;
  if (typeof val === 'string') {
    return Date.parse(val) || 0;
  }
  if (typeof val === 'number') {
    return val;
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  if (val && typeof val === 'object') {
    if (typeof val.toMillis === 'function') {
      return val.toMillis();
    }
    if (typeof val.seconds === 'number') {
      return val.seconds * 1000 + Math.floor((val.nanoseconds || 0) / 1000000);
    }
  }
  return 0;
}

export interface FirestoreBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slot: string;
  bikeType: 'PitBike' | 'QuadBike' | 'GroupPackage' | 'Mixed';
  packageName: string;
  quantity: number;
  pitBikeQty?: number;
  quadBikeQty?: number;
  amount: number;
  paid: boolean;
  createdAt: string;
  calendarEventId?: string;
  syncedToCalendar?: boolean;
}

const DEFAULT_SLOTS = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "12:00",
  "12:45",
  "13:30",
  "14:15",
];

/**
 * Fetch availability directly from Firestore for a given date
 */
export async function getAvailabilityDirect(date: string): Promise<Record<string, { pitbikes: number; quadbikes: number; isClosed?: boolean }>> {
  const availabilityMap: Record<string, { pitbikes: number; quadbikes: number; isClosed?: boolean }> = {};
  
  // Parse date safely to avoid timezone misalignment
  const [year, month, day] = date.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 is Sunday, 6 is Saturday, 5 is Friday

  // Set default availability
  DEFAULT_SLOTS.forEach((slot) => {
    // Sundays: Close at 2:30 PM (14:30) maximum, so exclude the 14:15 slot which runs to 15:00
    if (dayOfWeek === 0 && slot === "14:15") {
      return;
    }
    availabilityMap[slot] = { pitbikes: 8, quadbikes: 2, isClosed: false };
  });

  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    const bookings: FirestoreBooking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBooking);
    });

    // Subtract booked slots (only paid bookings block slots)
    bookings.forEach((b) => {
      const slot = b.slot;
      if (!availabilityMap[slot]) return;

      // Unpaid bookings do not reserve slots
      if (!b.paid) {
        return;
      }

      let bookedPit = 0;
      let bookedQuad = 0;

      if (b.bikeType === "PitBike") {
        bookedPit += b.quantity;
      } else if (b.bikeType === "QuadBike") {
        bookedQuad += b.quantity;
      } else if (b.bikeType === "GroupPackage") {
        if (b.quantity >= 10) {
          bookedPit += 8;
          bookedQuad += 2;
        } else {
          bookedPit += b.quantity;
        }
      } else if (b.bikeType === "Mixed") {
        bookedPit += b.pitBikeQty || 0;
        bookedQuad += b.quadBikeQty || 0;
      }

      availabilityMap[slot].pitbikes = Math.max(0, availabilityMap[slot].pitbikes - bookedPit);
      availabilityMap[slot].quadbikes = Math.max(0, availabilityMap[slot].quadbikes - bookedQuad);
    });

    // Fetch and apply closed slots for this date
    try {
      const closedSlotsCol = collection(db, 'closed_slots');
      const csQuery = query(closedSlotsCol, where('date', '==', date));
      const csSnapshot = await getDocs(csQuery);
      csSnapshot.forEach((csSnap) => {
        const data = csSnap.data();
        const slot = data.slot;
        if (availabilityMap[slot]) {
          availabilityMap[slot].pitbikes = 0;
          availabilityMap[slot].quadbikes = 0;
          availabilityMap[slot].isClosed = true;
        }
      });
    } catch (csErr) {
      console.error('Error fetching closed slots in availability calculation:', csErr);
    }

  } catch (error) {
    console.error('Error fetching availability from Firestore:', error);
  }

  return availabilityMap;
}

/**
 * Save booking directly to Firestore
 */
export async function createBookingDirect(bookingId: string, bookingData: any): Promise<void> {
  const docRef = doc(db, 'bookings', bookingId);
  const dataToSave = {
    ...bookingData,
    id: bookingId,
    createdAt: bookingData.createdAt || new Date().toISOString(),
    paid: bookingData.paid !== undefined ? bookingData.paid : false // Default to false (unpaid) on creation/redirection
  };
  await setDoc(docRef, dataToSave);
}

/**
 * Get booking details directly from Firestore
 */
export async function getBookingDirect(bookingId: string): Promise<FirestoreBooking | null> {
  const docRef = doc(db, 'bookings', bookingId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreBooking;
  }
  return null;
}

/**
 * Get all bookings from Firestore (used for Admin / ICS Calendars)
 */
export async function getAllBookingsDirect(): Promise<FirestoreBooking[]> {
  const bookingsCol = collection(db, 'bookings');
  const querySnapshot = await getDocs(bookingsCol);
  const bookings: FirestoreBooking[] = [];
  querySnapshot.forEach((docSnap) => {
    bookings.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBooking);
  });
  return bookings;
}

export interface FirestoreClosedDate {
  date: string;
  reason?: string;
  createdAt: string;
}

/**
 * Fetch all closed dates from Firestore
 */
export async function getClosedDatesDirect(): Promise<FirestoreClosedDate[]> {
  try {
    const colRef = collection(db, 'closed_dates');
    const querySnapshot = await getDocs(colRef);
    const closedDates: FirestoreClosedDate[] = [];
    querySnapshot.forEach((docSnap) => {
      closedDates.push({ date: docSnap.id, ...docSnap.data() } as FirestoreClosedDate);
    });
    return closedDates.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching closed dates from Firestore:', error);
    return [];
  }
}

/**
 * Save a closed date to Firestore
 */
export async function addClosedDateDirect(date: string, reason?: string): Promise<void> {
  const docRef = doc(db, 'closed_dates', date);
  await setDoc(docRef, {
    date,
    reason: reason || '',
    createdAt: new Date().toISOString()
  });
}

/**
 * Remove a closed date from Firestore
 */
export async function removeClosedDateDirect(date: string): Promise<void> {
  const docRef = doc(db, 'closed_dates', date);
  await deleteDoc(docRef);
}

export interface FirestoreClosedSlot {
  id: string; // "YYYY-MM-DD_HH:MM"
  date: string;
  slot: string;
  reason?: string;
  createdAt: string;
}

/**
 * Fetch all closed slots from Firestore
 */
export async function getClosedSlotsDirect(): Promise<FirestoreClosedSlot[]> {
  try {
    const colRef = collection(db, 'closed_slots');
    const querySnapshot = await getDocs(colRef);
    const closedSlots: FirestoreClosedSlot[] = [];
    querySnapshot.forEach((docSnap) => {
      closedSlots.push({ id: docSnap.id, ...docSnap.data() } as FirestoreClosedSlot);
    });
    return closedSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.slot.localeCompare(b.slot);
    });
  } catch (error) {
    console.error('Error fetching closed slots from Firestore:', error);
    return [];
  }
}

/**
 * Save a closed slot to Firestore
 */
export async function addClosedSlotDirect(date: string, slot: string, reason?: string): Promise<void> {
  const docId = `${date}_${slot}`;
  const docRef = doc(db, 'closed_slots', docId);
  await setDoc(docRef, {
    date,
    slot,
    reason: reason || '',
    createdAt: new Date().toISOString()
  });
}

/**
 * Remove a closed slot from Firestore
 */
export async function removeClosedSlotDirect(date: string, slot: string): Promise<void> {
  const docId = `${date}_${slot}`;
  const docRef = doc(db, 'closed_slots', docId);
  await deleteDoc(docRef);
}
