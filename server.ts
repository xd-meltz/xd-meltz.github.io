/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // PayFast dynamic runtime configuration endpoint
  app.get('/api/payfast-config', (req, res) => {
    res.json({
      merchantId: process.env.VITE_PAYFAST_MERCHANT_ID || "10051106",
      merchantKey: process.env.VITE_PAYFAST_MERCHANT_KEY || "w3q3a42d6my8m",
      processUrl: process.env.VITE_PAYFAST_PROCESS_URL || "https://sandbox.payfast.co.za/eng/process"
    });
  });

  // ICS Calendar feed endpoint
  app.get('/api/bookings.ics', async (req, res) => {
    try {
      const bookingsCol = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsCol);
      const bookings: any[] = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });

      // Build iCalendar string
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Rix Compound//Ride Session Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Rix Compound Bookings',
        'X-WR-TIMEZONE:Africa/Johannesburg',
      ];

      bookings.forEach((booking) => {
        if (!booking.date || !booking.timeSlot) return;

        try {
          const dateClean = booking.date.replace(/-/g, ''); // YYYYMMDD
          const [hoursStr, minutesStr] = booking.timeSlot.split(':');
          const hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);

          const startHrsStr = String(hours).padStart(2, '0');
          const startMinsStr = String(minutes).padStart(2, '0');
          const dtStart = `${dateClean}T${startHrsStr}${startMinsStr}00`;

          const isGroup = booking.type === 'group';
          const durationMinutes = isGroup ? 90 : 45;
          const startDateObj = new Date(`${booking.date}T${booking.timeSlot}:00`);
          const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);

          const endYear = endDateObj.getFullYear();
          const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
          const endDay = String(endDateObj.getDate()).padStart(2, '0');
          const endHrs = String(endDateObj.getHours()).padStart(2, '0');
          const endMins = String(endDateObj.getMinutes()).padStart(2, '0');
          const dtEnd = `${endYear}${endMonth}${endDay}T${endHrs}${endMins}00`;

          const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

          const pitBikes = booking.bikes?.pitBikes || 0;
          const quads = booking.bikes?.quads || 0;
          const ownBikes = booking.bikes?.ownBikes || 0;

          const description = [
            `Rider: ${booking.name}`,
            `Phone: ${booking.phone}`,
            `Email: ${booking.email}`,
            `Package: ${booking.packageName}`,
            `Bikes: PitBikes(${pitBikes})\\, Quads(${quads})\\, Own(${ownBikes})`,
            `Total Paid: R${booking.totalPaid || 0}`,
            `Payment: ${booking.paid ? 'PAID & CONFIRMED' : 'PENDING PAYMENT'}`,
            `Ticket ID: #${booking.id}`
          ].join('\\n');

          icsContent.push(
            'BEGIN:VEVENT',
            `UID:booking-${booking.id}@rixcompound.com`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART;TZID=Africa/Johannesburg:${dtStart}`,
            `DTEND;TZID=Africa/Johannesburg:${dtEnd}`,
            `SUMMARY:Rix: ${booking.name} (${booking.type === 'group' ? 'Group' : 'Individual'})`,
            `DESCRIPTION:${description}`,
            'LOCATION:Rix Compound\\, South Africa',
            'STATUS:CONFIRMED',
            'END:VEVENT'
          );
        } catch (err) {
          console.error('Error formatting booking for calendar feed', booking.id, err);
        }
      });

      icsContent.push('END:VCALENDAR');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.ics"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.send(icsContent.join('\r\n'));
    } catch (error: any) {
      console.error('Error serving bookings.ics:', error);
      res.status(500).send('Error generating calendar feed');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
