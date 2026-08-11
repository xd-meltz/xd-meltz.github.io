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
      status: "UNDER UPGRADES"
    }
  ];

  return (
    <section id="track" className="py-8 sm:py-12 bg-black border-b border-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
            Compound Circuits
          </span>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
            The Tracks
          </h2>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tracks.map((track, idx) => {
            const isPitbike = track.title === "PitBike Track";
            
            return (
              <div 
                key={idx}
                className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4 relative"
              >
                {/* Image */}
                <div className="relative aspect-[1.7] overflow-hidden border border-zinc-900 bg-zinc-900">
                  <img 
                    src={track.image} 
                    alt={track.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      !isPitbike ? 'opacity-30 grayscale' : ''
                    }`}
                  />
                  {!isPitbike && (
                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                      <div className="bg-red-600 text-white p-1 rounded-none mb-1 shadow-md animate-pulse">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <span className="bg-red-600 text-white font-mono font-bold text-[10px] sm:text-xs px-2 py-0.5 uppercase tracking-wider border border-red-400">
                        UNDER CONSTRUCTION
                      </span>
                      <span className="font-mono text-[9px] text-red-200 uppercase tracking-wider font-bold mt-0.5 bg-black/80 px-1.5 py-0.5">
                        NO RIDING ALLOWED
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Banner directly underneath the image */}
                {isPitbike ? (
                  <div className={`py-1.5 px-3 border flex items-center justify-between ${
                    pitbikeStatus.isOpen
                      ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {pitbikeStatus.isOpen ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="font-mono text-xs font-black tracking-wider uppercase text-emerald-400">
                            OPEN
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <div className="font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1 flex-wrap">
                            <span className="text-zinc-400">OPEN IN</span>
                            {pitbikeStatus.days !== undefined && pitbikeStatus.days > 0 && (
                              <>
                                <span className="text-emerald-400 text-xs font-black">{pitbikeStatus.days}</span>
                                <span className="text-zinc-400">{pitbikeStatus.days > 1 ? 'DAYS' : 'DAY'}</span>
                              </>
                            )}
                            {pitbikeStatus.hours !== undefined && pitbikeStatus.hours > 0 && (
                              <>
                                <span className="text-emerald-400 text-xs font-black">{pitbikeStatus.hours}</span>
                                <span className="text-zinc-400">{pitbikeStatus.hours > 1 ? 'HRS' : 'HR'}</span>
                              </>
                            )}
                            {pitbikeStatus.mins !== undefined && pitbikeStatus.mins > 0 && (pitbikeStatus.days === 0 || pitbikeStatus.days === undefined) && (
                              <>
                                <span className="text-emerald-400 text-xs font-black">{pitbikeStatus.mins}</span>
                                <span className="text-zinc-400">{pitbikeStatus.mins > 1 ? 'MINS' : 'MIN'}</span>
                              </>
                            )}
                            {(!pitbikeStatus.days && !pitbikeStatus.hours && !pitbikeStatus.mins) && (
                              <span className="text-zinc-400">{pitbikeStatus.text.replace('OPEN IN', '').trim() || pitbikeStatus.text}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    {pitbikeStatus.isOpen && (
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider hidden sm:inline text-emerald-400/80">
                        LIVE STATUS
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="py-1 px-2.5 bg-red-950/80 border border-red-500/50 flex items-center justify-between text-red-400">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="font-mono text-[10px] sm:text-xs font-extrabold tracking-wider uppercase">
                        UNDER CONSTRUCTION — NO RIDING ALLOWED
                      </span>
                    </div>
                  </div>
                )}

                {/* Text */}
                <div>
                  <h3 className="font-mono text-base font-bold uppercase text-white mb-1.5 flex items-center gap-2">
                    {track.title}
                    {!isPitbike && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 uppercase font-bold">
                        CLOSED
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {track.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Tour Feature */}
        <div className="max-w-3xl mx-auto">
          <div className="border border-zinc-800 bg-zinc-950 p-2">
            <div 
              onClick={() => setIsPlayingVideo(true)}
              className="relative aspect-video border border-zinc-900 bg-zinc-900 cursor-pointer overflow-hidden group"
            >
              <img 
                src="https://img.youtube.com/vi/vgHBEpjlTRU/maxresdefault.jpg" 
                alt="Track video tour thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-10 h-10 bg-brand text-black rounded-none flex items-center justify-center">
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                </div>
                <span className="mt-3 font-mono text-[10px] tracking-widest uppercase bg-black px-2 py-0.5 text-brand font-bold border border-zinc-800">
                  Play Video Tour
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {isPlayingVideo && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setIsPlayingVideo(false)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 p-2 rounded-none transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-full max-w-2xl aspect-video border border-zinc-800 bg-black">
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
