/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, signInWithPopup, GoogleAuthProvider, signOut, type User } from './firebase';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let cachedAccessToken: string | null = null;

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

interface SyncBookingData {
  id: string;
  date: string;
  timeSlot: string;
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
}

export const createGoogleCalendarEvent = async (
  booking: SyncBookingData,
  accessToken: string
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  try {
    // Standard event duration: 45m for individual, 1.5h for group
    const isGroup = booking.type === 'group';
    const durationMinutes = isGroup ? 90 : 45;

    // Parse start date and time.
    // booking.date is 'YYYY-MM-DD', booking.timeSlot is 'HH:MM'
    const startDateTime = `${booking.date}T${booking.timeSlot}:00`;
    
    // Calculate end time
    const [hours, minutes] = booking.timeSlot.split(':').map(Number);
    const startDate = new Date(booking.date);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    const endDateTime = `${booking.date}T${endHours}:${endMinutes}:00`;

    const description = `
Rix Compound Booking Confirmation
Ticket Ref: #${booking.id}
Rider: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}
Package: ${booking.packageName}

Gear Summary:
${booking.bikes.pitBikes > 0 ? `- ${booking.bikes.pitBikes}x Pit Bike Rental(s)\n` : ''}${booking.bikes.quads > 0 ? `- ${booking.bikes.quads}x Quad ATV Rental(s)\n` : ''}${booking.bikes.ownBikes > 0 ? `- ${booking.bikes.ownBikes}x Bring Your Own Bike\n` : ''}
Total Paid: R${booking.totalPaid.toLocaleString('en-ZA')}

⚠️ Note: Arrive 15 minutes prior to your time slot for setup. No refunds waiver active.
    `.trim();

    const eventBody = {
      summary: `Rix Compound Ride Session - ${booking.name}`,
      location: 'Rix Compound, South Africa',
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'Africa/Johannesburg',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Africa/Johannesburg',
      },
      attendees: [
        { email: booking.email, responseStatus: 'accepted' },
        { email: 'rixcompoundgithub@gmail.com' }
      ],
      reminders: {
        useDefault: true,
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const eventData = await response.json();
    return { success: true, eventId: eventData.id };
  } catch (error: any) {
    console.error('Failed to create calendar event:', error);
    return { success: false, error: error.message || String(error) };
  }
};
