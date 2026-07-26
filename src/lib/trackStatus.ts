import { getClosedDatesDirect, getClosedSlotsDirect } from './firebase';

export interface PitbikeStatus {
  isOpen: boolean;
  text: string;
  days?: number;
  hours?: number;
  mins?: number;
}

export const getSASTTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + 2 * 60 * 60 * 1000);
};

export const getDaySlots = (dayOfWeek: number): string[] => {
  // Friday (5) & Saturday (6)
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15"];
  }
  // Sunday (0)
  if (dayOfWeek === 0) {
    return ["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30"];
  }
  return [];
};

export const getPitbikeStatus = (
  closedDatesSet?: Set<string>,
  closedSlotsSet?: Set<string>
): PitbikeStatus => {
  const now = getSASTTime();
  const currentYyyy = now.getFullYear();
  const currentMm = String(now.getMonth() + 1).padStart(2, '0');
  const currentDd = String(now.getDate()).padStart(2, '0');
  const currentDateString = `${currentYyyy}-${currentMm}-${currentDd}`;

  const currentDayOfWeek = now.getDay();
  const currentDaySlots = getDaySlots(currentDayOfWeek);

  let isOpen = false;

  // Check if current date is in closed dates
  const isDateClosed = closedDatesSet ? closedDatesSet.has(currentDateString) : false;

  if (!isDateClosed && currentDaySlots.length > 0) {
    for (const slotStr of currentDaySlots) {
      const [h, m] = slotStr.split(':').map(Number);
      const slotStart = new Date(now);
      slotStart.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 45 * 60 * 1000);

      if (now.getTime() >= slotStart.getTime() && now.getTime() < slotEnd.getTime()) {
        const slotKey = `${currentDateString}_${slotStr}`;
        if (!closedSlotsSet || !closedSlotsSet.has(slotKey)) {
          isOpen = true;
        }
        break;
      }
    }
  }

  if (isOpen) {
    return { isOpen: true, text: 'OPEN' };
  }

  // Calculate time until next available open slot
  let nextOpening: Date | null = null;

  for (let i = 0; i <= 30; i++) {
    const testDate = new Date(now);
    testDate.setDate(now.getDate() + i);

    const tyyyy = testDate.getFullYear();
    const tmm = String(testDate.getMonth() + 1).padStart(2, '0');
    const tdd = String(testDate.getDate()).padStart(2, '0');
    const testDateString = `${tyyyy}-${tmm}-${tdd}`;

    if (closedDatesSet && closedDatesSet.has(testDateString)) {
      continue; // Whole day is closed
    }

    const daySlots = getDaySlots(testDate.getDay());
    if (daySlots.length === 0) continue;

    for (const slotStr of daySlots) {
      const [h, m] = slotStr.split(':').map(Number);
      const slotStart = new Date(testDate);
      slotStart.setHours(h, m, 0, 0);

      const slotKey = `${testDateString}_${slotStr}`;
      const isSlotClosed = closedSlotsSet ? closedSlotsSet.has(slotKey) : false;

      if (slotStart.getTime() > now.getTime() && !isSlotClosed) {
        nextOpening = slotStart;
        break;
      }
    }

    if (nextOpening) break;
  }

  if (nextOpening) {
    const diffMs = nextOpening.getTime() - now.getTime();
    const totalMins = Math.max(1, Math.ceil(diffMs / (1000 * 60)));
    const totalHours = Math.floor(totalMins / 60);
    const days = Math.floor(totalHours / 24);

    if (days >= 1) {
      const remHours = totalHours % 24;
      let text = `OPEN IN ${days} DAY${days > 1 ? 'S' : ''}`;
      if (remHours > 0) {
        text += ` ${remHours} HR${remHours > 1 ? 'S' : ''}`;
      }
      return {
        isOpen: false,
        text,
        days,
        hours: remHours,
        mins: 0
      };
    } else {
      const mins = totalMins % 60;
      let text = `OPEN IN `;
      if (totalHours > 0) {
        text += `${totalHours} HR${totalHours > 1 ? 'S' : ''}`;
        if (mins > 0) text += ` ${mins} MIN${mins > 1 ? 'S' : ''}`;
      } else {
        text += `${mins} MIN${mins > 1 ? 'S' : ''}`;
      }
      return {
        isOpen: false,
        text,
        days: 0,
        hours: totalHours,
        mins
      };
    }
  }

  return { isOpen: false, text: 'CLOSED' };
};
