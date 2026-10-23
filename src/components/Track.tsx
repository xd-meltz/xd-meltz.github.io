import React, { useState, useEffect } from 'react';
import { Play, X, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getClosedDatesDirect, getClosedSlotsDirect } from '../lib/firebase';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

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

  const trackBgPhoto = getShuffledPhoto(3);

  return (
    <section id="track" className="relative py-6 sm:py-12 border-b border-zinc-800 text-white overflow-hidden">
      {/* Background photo from Google Drive - optimized without backdrop blur */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <img 
          src={trackBgPhoto.url} 
          alt="" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
        
        {/* Section Header */}
        <div className="mb-4 sm:mb-8">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight italic text-white">
            The Tracks
          </h2>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 mb-6 sm:mb-10">
          {tracks.map((track, idx) => {
            return (
              <div 
                key={idx} 
                className="border sm:border-2 border-zinc-700 bg-zinc-900/90 shadow-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 relative"
              >
                {/* Image */}
                <div className="relative aspect-[1.7] overflow-hidden bg-zinc-950">
                  <img 
                    src={track.image} 
                    alt={track.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Status Banner directly underneath the image */}
                <div className={`py-1.5 sm:py-2 px-2.5 sm:px-3.5 border sm:border-2 flex items-center justify-between ${
                  pitbikeStatus.isOpen
                    ? 'bg-blue-950/70 border-blue-500 text-blue-100'
                    : 'bg-zinc-950/80 border-zinc-700 text-zinc-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {pitbikeStatus.isOpen ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <span className="font-sans text-xs sm:text-sm font-black tracking-wider uppercase text-blue-300">
                          OPEN FOR RIDING
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <div className="font-sans text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5 flex-wrap">
                          <span className="text-zinc-300">OPEN IN</span>
                          {pitbikeStatus.days !== undefined && pitbikeStatus.days > 0 && (
                            <>
                              <span className="text-blue-400 text-sm font-black">{pitbikeStatus.days}</span>
                              <span className="text-zinc-300">{pitbikeStatus.days > 1 ? 'DAYS' : 'DAY'}</span>
                            </>
                          )}
                          {pitbikeStatus.hours !== undefined && pitbikeStatus.hours > 0 && (
                            <>
                              <span className="text-blue-400 text-sm font-black">{pitbikeStatus.hours}</span>
                              <span className="text-zinc-300">{pitbikeStatus.hours > 1 ? 'HRS' : 'HR'}</span>
                            </>
                          )}
                          {pitbikeStatus.mins !== undefined && pitbikeStatus.mins > 0 && (pitbikeStatus.days === 0 || pitbikeStatus.days === undefined) && (
                            <>
                              <span className="text-blue-400 text-sm font-black">{pitbikeStatus.mins}</span>
                              <span className="text-zinc-300">{pitbikeStatus.mins > 1 ? 'MINS' : 'MIN'}</span>
                            </>
                          )}
                          {(!pitbikeStatus.days && !pitbikeStatus.hours && !pitbikeStatus.mins) && (
                            <span className="text-zinc-300">{pitbikeStatus.text.replace('OPEN IN', '').trim() || pitbikeStatus.text}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {pitbikeStatus.isOpen && (
                    <span className="font-sans text-xs font-black uppercase tracking-wider hidden sm:inline text-blue-400">
                      LIVE STATUS
                    </span>
                  )}
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-sans text-base sm:text-xl font-black uppercase text-white flex items-center gap-2">
                    {track.title}
                    <span className="text-[10px] sm:text-xs font-sans px-2 py-0.5 bg-blue-950/80 border border-blue-500 text-blue-300 uppercase font-black">
                      ACTIVE TRACK
                    </span>
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Tour Feature */}
        <div className="max-w-3xl mx-auto">
          <div className="border sm:border-2 border-zinc-700 bg-zinc-900/90 p-1.5 sm:p-3 shadow-2xl">
            <div 
              onClick={() => setIsPlayingVideo(true)}
              className="relative aspect-video border border-zinc-700 bg-zinc-950 cursor-pointer overflow-hidden group"
            >
              <img 
                src="https://img.youtube.com/vi/vgHBEpjlTRU/maxresdefault.jpg" 
                alt="Track video tour thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand text-white rounded-none flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                <span className="mt-2.5 sm:mt-3 font-mono text-[10px] tracking-widest uppercase bg-zinc-900 px-2 sm:px-2.5 py-1 text-brand-light font-black border border-zinc-700 shadow-md">
                  Play Video Tour
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {isPlayingVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setIsPlayingVideo(false)}
            className="absolute top-4 right-4 text-zinc-300 hover:text-white bg-zinc-900 border-2 border-zinc-700 p-2 rounded-none transition-colors shadow-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-full max-w-2xl aspect-video border-2 border-zinc-700 bg-black shadow-2xl">
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
