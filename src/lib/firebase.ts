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
export async function getAvailabilityDirect(date: string): Promise<Record<string, { pitbikes: number; quadbikes: number }>> {
  const availabilityMap: Record<string, { pitbikes: number; quadbikes: number }> = {};
  
  // Set default availability
  DEFAULT_SLOTS.forEach((slot) => {
    availabilityMap[slot] = { pitbikes: 8, quadbikes: 2 };
  });

  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    const bookings: FirestoreBooking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBooking);
    });

    // Subtract booked slots
    bookings.forEach((b) => {
      const slot = b.slot;
      if (!availabilityMap[slot]) return;

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
    paid: bookingData.paid !== undefined ? bookingData.paid : true // Mark paid by default on creation/redirection
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
