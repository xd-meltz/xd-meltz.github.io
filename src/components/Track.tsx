import React, { useState, useEffect } from 'react';
import { Play, X, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getClosedDatesDirect, getClosedSlotsDirect } from '../lib/firebase';

const getSASTTime = (): Date => {
  const now = new Date();
  // Get UTC time in milliseconds, then add South Africa offset (+2 hours = +7200000 ms)
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + 2 * 60 * 60 * 1000);
};

const getDaySlots = (dayOfWeek: number): string[] => {
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

export interface PitbikeStatus {
  isOpen: boolean;
  text: string;
  days?: number;
  hours?: number;
  mins?: number;
}

const getPitbikeStatus = (
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
    // Check if current time falls within an active open slot for today
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

  // Calculate hours until next available open slot
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

export default function Track() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [closedSlots, setClosedSlots] = useState<Set<string>>(new Set());
  const [pitbikeStatus, setPitbikeStatus] = useState(() => getPitbikeStatus());

  useEffect(() => {
    // Fetch closed dates and closed slots from Firestore on mount
    Promise.all([getClosedDatesDirect(), getClosedSlotsDirect()])
      .then(([closedDatesData, closedSlotsData]) => {
        const datesSet = new Set(closedDatesData.map(item => item.date));
        const slotsSet = new Set(closedSlotsData.map(item => `${item.date}_${item.slot}`));
        setClosedDates(datesSet);
        setClosedSlots(slotsSet);
        setPitbikeStatus(getPitbikeStatus(datesSet, slotsSet));
      })
      .catch((err) => {
        console.error('Failed to fetch closed dates/slots for track:', err);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPitbikeStatus(getPitbikeStatus(closedDates, closedSlots));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [closedDates, closedSlots]);

  const tracks = [
    {
      title: "PitBike Track",
      description: "Professionally designed turns, rhythmic sections, and dirt obstacles engineered for both junior and adult riders.",
      image: "https://i.postimg.cc/J44p3K6T/Chat-GPT-Image-Jan-7-2026-03-01-22-PM.png",
      status: "OPEN"
    },
    {
      title: "Flat Track",
      description: "Practice your sliding, drifting, and precise throttle controls in a secure, fast, wide-open winelands setup. Full-size Big Bikes are welcome here!",
      image: "https://i.postimg.cc/xdmTR1fj/Chat-GPT-Image-Mar-4-2026-10-12-06-AM.png",
      status: "OPEN"
    }
  ];

  return (
    <section id="track" className="py-8 sm:py-12 bg-white border-b border-zinc-200 text-zinc-900">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <span className="font-sans text-xs sm:text-sm uppercase tracking-widest text-brand font-black block mb-1.5">
            COMPOUND CIRCUITS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight italic text-zinc-950">
            The Tracks
          </h2>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {tracks.map((track, idx) => {
            return (
              <div 
                key={idx} 
                className="border-2 border-zinc-900 bg-white shadow-md p-5 flex flex-col gap-4 relative"
              >
                {/* Image */}
                <div className="relative aspect-[1.7] overflow-hidden bg-zinc-100">
                  <img 
                    src={track.image} 
                    alt={track.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Status Banner directly underneath the image */}
                <div className={`py-2 px-3.5 border-2 flex items-center justify-between ${
                  pitbikeStatus.isOpen
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {pitbikeStatus.isOpen ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-700">
                          OPEN FOR RIDING
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        <div className="font-sans text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5 flex-wrap">
                          <span className="text-zinc-700">OPEN IN</span>
                          {pitbikeStatus.days !== undefined && pitbikeStatus.days > 0 && (
                            <>
                              <span className="text-emerald-700 text-sm font-black">{pitbikeStatus.days}</span>
                              <span className="text-zinc-700">{pitbikeStatus.days > 1 ? 'DAYS' : 'DAY'}</span>
                            </>
                          )}
                          {pitbikeStatus.hours !== undefined && pitbikeStatus.hours > 0 && (
                            <>
                              <span className="text-emerald-700 text-sm font-black">{pitbikeStatus.hours}</span>
                              <span className="text-zinc-700">{pitbikeStatus.hours > 1 ? 'HRS' : 'HR'}</span>
                            </>
                          )}
                          {pitbikeStatus.mins !== undefined && pitbikeStatus.mins > 0 && (pitbikeStatus.days === 0 || pitbikeStatus.days === undefined) && (
                            <>
                              <span className="text-emerald-700 text-sm font-black">{pitbikeStatus.mins}</span>
                              <span className="text-zinc-700">{pitbikeStatus.mins > 1 ? 'MINS' : 'MIN'}</span>
                            </>
                          )}
                          {(!pitbikeStatus.days && !pitbikeStatus.hours && !pitbikeStatus.mins) && (
                            <span className="text-zinc-700">{pitbikeStatus.text.replace('OPEN IN', '').trim() || pitbikeStatus.text}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {pitbikeStatus.isOpen && (
                    <span className="font-sans text-xs font-black uppercase tracking-wider hidden sm:inline text-emerald-800">
                      LIVE STATUS
                    </span>
                  )}
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-sans text-lg sm:text-xl font-black uppercase text-zinc-950 mb-2 flex items-center gap-2">
                    {track.title}
                    <span className="text-xs font-sans px-2 py-0.5 bg-emerald-100 border border-emerald-500 text-emerald-900 uppercase font-black">
                      ACTIVE TRACK
                    </span>
                  </h3>
                  <p className="text-sm text-zinc-800 leading-relaxed font-sans font-bold">
                    {track.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Tour Feature */}
        <div className="max-w-3xl mx-auto">
          <div className="border border-zinc-200 bg-white p-2 shadow-sm">
            <div 
              onClick={() => setIsPlayingVideo(true)}
              className="relative aspect-video border border-zinc-200 bg-zinc-100 cursor-pointer overflow-hidden group"
            >
              <img 
                src="https://img.youtube.com/vi/vgHBEpjlTRU/maxresdefault.jpg" 
                alt="Track video tour thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-10 h-10 bg-brand text-white rounded-none flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                <span className="mt-3 font-mono text-[10px] tracking-widest uppercase bg-white px-2.5 py-1 text-brand font-bold border border-zinc-200 shadow-sm">
                  Play Video Tour
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {isPlayingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setIsPlayingVideo(false)}
            className="absolute top-4 right-4 text-zinc-700 hover:text-black bg-white border border-zinc-300 p-2 rounded-none transition-colors shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-full max-w-2xl aspect-video border border-zinc-200 bg-black shadow-2xl">
            <iframe 
              src="https://www.youtube.com/embed/vgHBEpjlTRU?autoplay=1"
              title="Rix Compound Track Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
