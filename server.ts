import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  getAvailabilityDirect, 
  createBookingDirect, 
  getBookingDirect, 
  getAllBookingsDirect 
} from "./src/lib/firebase";

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

const PORT = 3000;
const BOOKINGS_FILE = path.join(process.cwd(), "bookings.json");
const CALENDAR_TOKEN_FILE = path.join(process.cwd(), "calendar-token.json");

interface CalendarTokenData {
  accessToken: string;
  linkedEmail?: string;
  updatedAt?: string;
}

// Helper to load calendar token config
function getCalendarToken(): CalendarTokenData | null {
  try {
    if (fs.existsSync(CALENDAR_TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(CALENDAR_TOKEN_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading calendar token:", err);
  }
  return null;
}

// Helper to save calendar token config
function saveCalendarToken(data: CalendarTokenData): void {
  try {
    fs.writeFileSync(CALENDAR_TOKEN_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving calendar token:", err);
  }
}

// Helper to map slot to start/end date-times for SAST
function getSlotTimes(dateStr: string, slotStr: string) {
  const startDateTime = `${dateStr}T${slotStr}:00`;
  const endTimes: Record<string, string> = {
    "09:00": "09:45",
    "09:45": "10:30",
    "10:30": "11:15",
    "11:15": "12:00",
    "12:00": "12:45",
    "12:45": "13:30",
    "13:30": "14:15",
    "14:15": "15:00",
  };
  const endTimeStr = endTimes[slotStr] || "15:00";
  const endDateTime = `${dateStr}T${endTimeStr}:00`;
  return { startDateTime, endDateTime };
}

// Google Calendar event creation helper
async function syncBookingToGoogleCalendar(booking: Booking): Promise<string | null> {
  const tokenData = getCalendarToken();
  if (!tokenData || !tokenData.accessToken) {
    console.log("No Google Calendar access token found on server. Skipping auto-sync.");
    return null;
  }

  const { startDateTime, endDateTime } = getSlotTimes(booking.date, booking.slot);
  const bikeDetails = booking.bikeType === "Mixed"
    ? `${booking.pitBikeQty || 0} Pit Bikes, ${booking.quadBikeQty || 0} Quad Bikes`
    : `${booking.quantity} Unit(s)`;

  const description = `
Rider Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}
Reference ID: ${booking.id}
Vehicle Type: ${booking.bikeType} ${booking.packageName ? `(${booking.packageName})` : ''}
Details: ${bikeDetails}
Total Price: R${booking.amount}
Payment Status: ${booking.paid ? "PAID" : "PENDING"}
Created: ${booking.createdAt}
  `.trim();

  const eventPayload = {
    summary: `🏍️ RIX Track: ${booking.name} (${booking.bikeType})`,
    description: description,
    location: "Rix Compound, Stellenbosch, South Africa",
    start: {
      dateTime: startDateTime,
      timeZone: "Africa/Johannesburg"
    },
    end: {
      dateTime: endDateTime,
      timeZone: "Africa/Johannesburg"
    },
    reminders: {
      useDefault: true
    }
  };

  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Google Calendar API error: ${response.status} - ${errBody}`);
      return null;
    }

    const data = (await response.json()) as any;
    return data.id || null;
  } catch (err) {
    console.error("Failed to sync booking to Google Calendar:", err);
    return null;
  }
}

// Google Calendar event update helper
async function updateCalendarEvent(booking: Booking): Promise<boolean> {
  if (!booking.calendarEventId) return false;

  const tokenData = getCalendarToken();
  if (!tokenData || !tokenData.accessToken) {
    return false;
  }

  const { startDateTime, endDateTime } = getSlotTimes(booking.date, booking.slot);
  const bikeDetails = booking.bikeType === "Mixed"
    ? `${booking.pitBikeQty || 0} Pit Bikes, ${booking.quadBikeQty || 0} Quad Bikes`
    : `${booking.quantity} Unit(s)`;

  const description = `
Rider Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}
Reference ID: ${booking.id}
Vehicle Type: ${booking.bikeType} ${booking.packageName ? `(${booking.packageName})` : ''}
Details: ${bikeDetails}
Total Price: R${booking.amount}
Payment Status: ${booking.paid ? "PAID" : "PENDING"}
Created: ${booking.createdAt}
  `.trim();

  const eventPayload = {
    summary: `🏍️ RIX Track: ${booking.name} (${booking.bikeType})`,
    description: description,
    location: "Rix Compound, Stellenbosch, South Africa",
    start: {
      dateTime: startDateTime,
      timeZone: "Africa/Johannesburg"
    },
    end: {
      dateTime: endDateTime,
      timeZone: "Africa/Johannesburg"
    },
    reminders: {
      useDefault: true
    }
  };

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${booking.calendarEventId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${tokenData.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventPayload)
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to update Google Calendar event:", err);
    return false;
  }
}

// Google Calendar event deletion helper
async function deleteCalendarEvent(calendarEventId: string): Promise<boolean> {
  const tokenData = getCalendarToken();
  if (!tokenData || !tokenData.accessToken) {
    return false;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${calendarEventId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${tokenData.accessToken}`
      }
    });

    return response.ok || response.status === 404;
  } catch (err) {
    console.error("Failed to delete Google Calendar event:", err);
    return false;
  }
}

// Helper to load bookings
function getBookings(): Booking[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading bookings file:", err);
    return [];
  }
}

// Helper to save bookings
function saveBookings(bookings: Booking[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Error writing bookings file:", err);
  }
}

// Helper to generate a standardized iCalendar (.ics) feed
function generateICSFeed(bookings: Booking[]): string {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rix Compound//Bookings Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Rix Compound Bookings",
    "X-WR-TIMEZONE:Africa/Johannesburg"
  ];

  for (const b of bookings) {
    if (!b.date || !b.slot) continue;
    
    // Clean date: YYYY-MM-DD -> YYYYMMDD
    const cleanDate = b.date.replace(/-/g, "");
    
    // Convert Africa/Johannesburg slots (UTC+2) to standard UTC times for universal client compatibility.
    // This resolves timezone parser mismatches and prevents Apple Calendar validation errors.
    const startUtcMap: Record<string, string> = {
      "09:00": "070000Z",
      "09:45": "074500Z",
      "10:30": "083000Z",
      "11:15": "091500Z",
      "12:00": "100000Z",
      "12:45": "104500Z",
      "13:30": "113000Z",
      "14:15": "121500Z",
    };
    
    const endUtcMap: Record<string, string> = {
      "09:00": "074500Z",
      "09:45": "083000Z",
      "10:30": "091500Z",
      "11:15": "100000Z",
      "12:00": "104500Z",
      "12:45": "113000Z",
      "13:30": "121500Z",
      "14:15": "130000Z",
    };

    const cleanStart = startUtcMap[b.slot] || (b.slot.replace(/:/g, "") + "00Z");
    const cleanEnd = endUtcMap[b.slot] || (b.slot.replace(/:/g, "") + "00Z");

    const bikeDetails = b.bikeType === "Mixed"
      ? `${b.pitBikeQty || 0} Pit Bikes, ${b.quadBikeQty || 0} Quad Bikes`
      : `${b.quantity} Unit(s)`;

    const escapeText = (str: string) => {
      if (!str) return "";
      return str
        .replace(/\\/g, "\\\\")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;")
        .replace(/\n/g, "\\n");
    };

    const description = [
      `Rider Name: ${b.name}`,
      `Phone: ${b.phone}`,
      `Email: ${b.email}`,
      `Reference ID: ${b.id}`,
      `Vehicle Type: ${b.bikeType} ${b.packageName ? `(${b.packageName})` : ""}`,
      `Details: ${bikeDetails}`,
      `Total Price: R${b.amount}`,
      `Payment Status: ${b.paid ? "PAID" : "PENDING"}`,
      `Created At: ${b.createdAt}`
    ].map(escapeText).join("\\n");

    const uid = `${b.id}@rixcompound.co.za`;
    
    // Strict ISO 8601 UTC timestamp formatting to ensure no space characters are in DTSTAMP
    let dtstamp = "20260101T000000Z";
    if (b.createdAt) {
      try {
        const dateObj = new Date(b.createdAt);
        if (!isNaN(dateObj.getTime())) {
          dtstamp = dateObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        }
      } catch (e) {
        // fallback
      }
    }

    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${dtstamp}`);
    ics.push(`DTSTART:${cleanDate}T${cleanStart}`);
    ics.push(`DTEND:${cleanDate}T${cleanEnd}`);
    ics.push(`SUMMARY:🏍️ Rix: ${escapeText(b.name)} (${b.bikeType})`);
    ics.push(`DESCRIPTION:${description}`);
    ics.push("LOCATION:Rix Compound\\, Stellenbosch\\, South Africa");
    ics.push("END:VEVENT");
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

async function startServer() {
  const app = express();

  // Parse JSON and form-urlencoded payloads (Payfast sends form URL encoded data for ITN)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes

  // Public calendar feed (iCalendar format)
  app.options("/api/calendar.ics", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  app.get("/api/calendar.ics", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    try {
      const bookings = await getAllBookingsDirect();
      const icsContent = generateICSFeed(bookings as any);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="rix-bookings.ics"');
      res.send(icsContent);
    } catch (err) {
      console.warn("Firestore fetch for ICS failed, using local file backup:", err);
      const bookings = getBookings();
      const icsContent = generateICSFeed(bookings);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="rix-bookings.ics"');
      res.send(icsContent);
    }
  });

  // Get availability for a specific date
  app.get("/api/availability", async (req, res) => {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      res.status(400).json({ error: "Date parameter is required" });
      return;
    }

    try {
      const availabilityMap = await getAvailabilityDirect(date);
      res.json(availabilityMap);
    } catch (err) {
      console.warn("Firestore fetch for availability failed, using local file backup:", err);
      const bookings = getBookings();
      const dateBookings = bookings.filter((b) => b.date === date);

      // Initial default capacity for 45-minute slots from 9 AM to 3 PM
      const slots = [
        "09:00",
        "09:45",
        "10:30",
        "11:15",
        "12:00",
        "12:45",
        "13:30",
        "14:15",
      ];

      const availabilityMap: Record<string, { pitbikes: number; quadbikes: number }> = {};

      slots.forEach((slot) => {
        // Base capacities
        let bookedPitbikes = 0;
        let bookedQuadbikes = 0;

        const slotBookings = dateBookings.filter((b) => b.slot === slot);
        slotBookings.forEach((b) => {
          if (b.bikeType === "PitBike") {
            bookedPitbikes += b.quantity;
          } else if (b.bikeType === "QuadBike") {
            bookedQuadbikes += b.quantity;
          } else if (b.bikeType === "GroupPackage") {
            if (b.quantity >= 10) {
              bookedPitbikes += 8;
              bookedQuadbikes += 2;
            } else {
              bookedPitbikes += b.quantity; // usually 5
            }
          } else if (b.bikeType === "Mixed") {
            bookedPitbikes += b.pitBikeQty || 0;
            bookedQuadbikes += b.quadBikeQty || 0;
          }
        });

        availabilityMap[slot] = {
          pitbikes: Math.max(0, 8 - bookedPitbikes),
          quadbikes: Math.max(0, 2 - bookedQuadbikes),
        };
      });

      res.json(availabilityMap);
    }
  });

  // Create a pending booking
  app.post("/api/bookings", (req, res) => {
    const { name, email, phone, date, slot, bikeType, packageName, quantity, amount } = req.body;

    if (!name || !email || !phone || !date || !slot || !bikeType || quantity === undefined || !amount) {
      res.status(400).json({ error: "Missing required booking details" });
      return;
    }

    // Double check availability
    const bookings = getBookings();
    const dateBookings = bookings.filter((b) => b.date === date && b.slot === slot);
    
    let bookedPitbikes = 0;
    let bookedQuadbikes = 0;

    dateBookings.forEach((b) => {
      if (b.bikeType === "PitBike") {
        bookedPitbikes += b.quantity;
      } else if (b.bikeType === "QuadBike") {
        bookedQuadbikes += b.quantity;
      } else if (b.bikeType === "GroupPackage") {
        if (b.quantity >= 10) {
          bookedPitbikes += 8;
          bookedQuadbikes += 2;
        } else {
          bookedPitbikes += b.quantity;
        }
      } else if (b.bikeType === "Mixed") {
        bookedPitbikes += b.pitBikeQty || 0;
        bookedQuadbikes += b.quadBikeQty || 0;
      }
    });

    const availPitbikes = Math.max(0, 8 - bookedPitbikes);
    const availQuadbikes = Math.max(0, 2 - bookedQuadbikes);

    if (bikeType === "Mixed") {
      const pbQty = Number(req.body.pitBikeQty || 0);
      const qbQty = Number(req.body.quadBikeQty || 0);
      if (pbQty === 0 && qbQty === 0) {
        res.status(400).json({ error: "Please select at least one bike to book." });
        return;
      }
      if (pbQty > availPitbikes) {
        res.status(400).json({ error: `Not enough pit bikes available. Only ${availPitbikes} remaining.` });
        return;
      }
      if (qbQty > availQuadbikes) {
        res.status(400).json({ error: `Not enough quad bikes available. Only ${availQuadbikes} remaining.` });
        return;
      }
    } else {
      const q = Number(quantity);
      if (bikeType === "PitBike") {
        if (q > availPitbikes) {
          res.status(400).json({ error: `Not enough pit bikes available. Only ${availPitbikes} remaining.` });
          return;
        }
      } else if (bikeType === "QuadBike") {
        if (q > availQuadbikes) {
          res.status(400).json({ error: `Not enough quad bikes available. Only ${availQuadbikes} remaining.` });
          return;
        }
      } else if (bikeType === "GroupPackage") {
        if (q >= 10) {
          if (availPitbikes < 8 || availQuadbikes < 2) {
            res.status(400).json({ error: "The track does not have full 10-bike capacity available for this slot." });
            return;
          }
        } else {
          if (availPitbikes < q) {
            res.status(400).json({ error: `The track does not have enough capacity for ${q} group bikes at this slot.` });
            return;
          }
        }
      }
    }

    // Generate custom booking ID
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: bookingId,
      name,
      email,
      phone,
      date,
      slot,
      bikeType,
      packageName,
      quantity: Number(quantity),
      pitBikeQty: req.body.pitBikeQty ? Number(req.body.pitBikeQty) : undefined,
      quadBikeQty: req.body.quadBikeQty ? Number(req.body.quadBikeQty) : undefined,
      amount: Number(amount),
      paid: false,
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    // Sync to Google Calendar in background (non-blocking)
    syncBookingToGoogleCalendar(newBooking).then((eventId) => {
      if (eventId) {
        const latestBookings = getBookings();
        const bIdx = latestBookings.findIndex((b) => b.id === bookingId);
        if (bIdx !== -1) {
          latestBookings[bIdx].calendarEventId = eventId;
          latestBookings[bIdx].syncedToCalendar = true;
          saveBookings(latestBookings);
        }
      }
    }).catch((err) => console.error("Auto sync to Google Calendar error:", err));

    res.status(201).json(newBooking);
  });

  // Retrieve a booking by ID
  app.get("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const bookings = getBookings();
    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.json(booking);
  });

  // Confirm booking (fallback success redirect handler)
  app.post("/api/bookings/:id/confirm", (req, res) => {
    const { id } = req.params;
    const bookings = getBookings();
    const bookingIndex = bookings.findIndex((b) => b.id === id);

    if (bookingIndex === -1) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    bookings[bookingIndex].paid = true;
    saveBookings(bookings);

    // Sync status update on Google Calendar in background
    const updatedBooking = bookings[bookingIndex];
    if (updatedBooking.calendarEventId) {
      updateCalendarEvent(updatedBooking).catch((err) => console.error("Error updating calendar event on confirm:", err));
    } else {
      syncBookingToGoogleCalendar(updatedBooking).then((eventId) => {
        if (eventId) {
          const latestBookings = getBookings();
          const bIdx = latestBookings.findIndex((b) => b.id === id);
          if (bIdx !== -1) {
            latestBookings[bIdx].calendarEventId = eventId;
            latestBookings[bIdx].syncedToCalendar = true;
            saveBookings(latestBookings);
          }
        }
      }).catch((err) => console.error("Error syncing calendar event on confirm:", err));
    }

    res.json({ success: true, booking: bookings[bookingIndex] });
  });

  // Admin: Get all bookings (passcode protected)
  app.get("/api/admin/bookings", (req, res) => {
    const { passcode } = req.query;
    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized. Incorrect admin passcode." });
      return;
    }

    const bookings = getBookings();
    // Sort bookings by date descending, then slot descending
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.slot.localeCompare(a.slot);
    });

    res.json(sortedBookings);
  });

  // Admin: Toggle paid status of a booking
  app.post("/api/admin/bookings/:id/toggle-paid", (req, res) => {
    const { passcode } = req.query;
    const { id } = req.params;
    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bookings = getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    bookings[idx].paid = !bookings[idx].paid;
    saveBookings(bookings);

    // Sync status update on Google Calendar in background
    const updatedBooking = bookings[idx];
    if (updatedBooking.calendarEventId) {
      updateCalendarEvent(updatedBooking).catch((err) => console.error("Error updating calendar event on toggle:", err));
    } else {
      syncBookingToGoogleCalendar(updatedBooking).then((eventId) => {
        if (eventId) {
          const latestBookings = getBookings();
          const bIdx = latestBookings.findIndex((b) => b.id === id);
          if (bIdx !== -1) {
            latestBookings[bIdx].calendarEventId = eventId;
            latestBookings[bIdx].syncedToCalendar = true;
            saveBookings(latestBookings);
          }
        }
      }).catch((err) => console.error("Error syncing calendar event on toggle:", err));
    }

    res.json({ success: true, booking: bookings[idx] });
  });

  // Admin: Delete a booking
  app.post("/api/admin/bookings/:id/delete", (req, res) => {
    const { passcode } = req.query;
    const { id } = req.params;
    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bookings = getBookings();
    const bookingToDelete = bookings.find((b) => b.id === id);
    const filtered = bookings.filter((b) => b.id !== id);
    if (bookings.length === filtered.length) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    saveBookings(filtered);

    // Delete calendar event in background if it exists
    if (bookingToDelete && bookingToDelete.calendarEventId) {
      deleteCalendarEvent(bookingToDelete.calendarEventId).catch((err) =>
        console.error("Error deleting calendar event:", err)
      );
    }

    res.json({ success: true });
  });

  // Payfast ITN endpoint
  app.post("/api/payfast-itn", (req, res) => {
    // Payfast posts information about transaction
    const { m_payment_id, payment_status } = req.body;

    console.log("Received Payfast ITN payload:", req.body);

    if (!m_payment_id) {
      res.status(400).send("No payment ID provided");
      return;
    }

    const bookings = getBookings();
    const bookingIndex = bookings.findIndex((b) => b.id === m_payment_id);

    if (bookingIndex === -1) {
      res.status(404).send("Booking not found");
      return;
    }

    // In a real sandbox/live env, we check for payment_status === 'COMPLETE'
    if (payment_status === "COMPLETE") {
      bookings[bookingIndex].paid = true;
      saveBookings(bookings);
      console.log(`Booking ${m_payment_id} successfully marked as PAID via Payfast ITN.`);

      // Sync status update on Google Calendar in background
      const updatedBooking = bookings[bookingIndex];
      if (updatedBooking.calendarEventId) {
        updateCalendarEvent(updatedBooking).catch((err) =>
          console.error("Error updating calendar event on ITN:", err)
        );
      } else {
        syncBookingToGoogleCalendar(updatedBooking).then((eventId) => {
          if (eventId) {
            const latestBookings = getBookings();
            const bIdx = latestBookings.findIndex((b) => b.id === m_payment_id);
            if (bIdx !== -1) {
              latestBookings[bIdx].calendarEventId = eventId;
              latestBookings[bIdx].syncedToCalendar = true;
              saveBookings(latestBookings);
            }
          }
        }).catch((err) => console.error("Error syncing calendar event on ITN:", err));
      }
    }

    // Payfast expects an HTTP 200 OK response
    res.status(200).send("OK");
  });

  // Admin: Get Google Calendar Integration status
  app.get("/api/admin/calendar-status", (req, res) => {
    const { passcode } = req.query;
    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tokenData = getCalendarToken();
    if (!tokenData || !tokenData.accessToken) {
      res.json({ linked: false });
    } else {
      res.json({
        linked: true,
        linkedEmail: tokenData.linkedEmail,
        updatedAt: tokenData.updatedAt
      });
    }
  });

  // Admin: Link or refresh owner's Google Calendar OAuth token
  app.post("/api/admin/set-calendar-token", (req, res) => {
    const { passcode } = req.query;
    const { accessToken, linkedEmail } = req.body;

    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!accessToken) {
      res.status(400).json({ error: "Access token is required" });
      return;
    }

    const tokenData: CalendarTokenData = {
      accessToken,
      linkedEmail: linkedEmail || "Owner Account",
      updatedAt: new Date().toISOString()
    };

    saveCalendarToken(tokenData);

    // Sync all currently unsynced bookings to Google Calendar in the background
    const bookings = getBookings();
    const unsynced = bookings.filter((b) => !b.syncedToCalendar);

    let syncedCount = 0;
    if (unsynced.length > 0) {
      Promise.all(
        unsynced.map(async (b) => {
          try {
            const eventId = await syncBookingToGoogleCalendar(b);
            if (eventId) {
              b.calendarEventId = eventId;
              b.syncedToCalendar = true;
              syncedCount++;
            }
          } catch (e) {
            console.error(`Failed to bulk sync booking ${b.id}:`, e);
          }
        })
      ).then(() => {
        if (syncedCount > 0) {
          saveBookings(bookings);
          console.log(`Bulk synced ${syncedCount} bookings to Google Calendar.`);
        }
      });
    }

    res.json({ success: true, syncedCount });
  });

  // Admin: Manually force sync a single booking to Google Calendar
  app.post("/api/admin/bookings/:id/sync-calendar", async (req, res) => {
    const { passcode } = req.query;
    const { id } = req.params;

    if (passcode !== "rix344") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bookings = getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const booking = bookings[idx];
    try {
      let eventId: string | null = booking.calendarEventId || null;
      let success = false;

      if (eventId) {
        success = await updateCalendarEvent(booking);
        // If update failed (e.g. event deleted on Google side), retry by creating it new
        if (!success) {
          eventId = await syncBookingToGoogleCalendar(booking);
          success = !!eventId;
        }
      } else {
        eventId = await syncBookingToGoogleCalendar(booking);
        success = !!eventId;
      }

      if (success && eventId) {
        bookings[idx].calendarEventId = eventId;
        bookings[idx].syncedToCalendar = true;
        saveBookings(bookings);
        res.json({ success: true, booking: bookings[idx] });
      } else {
        res.status(500).json({ error: "Failed to sync event to Google Calendar. Verify that owner calendar is connected and active." });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Error syncing with Google Calendar" });
    }
  });

  // Vite or Production Static Asset Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
