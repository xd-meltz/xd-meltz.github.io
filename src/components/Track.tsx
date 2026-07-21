import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { getClosedDatesDirect } from '../lib/firebase';

const getSASTTime = (): Date => {
  const now = new Date();
  // Get UTC time in milliseconds, then add South Africa offset (+2 hours = +7200000 ms)
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + 2 * 60 * 60 * 1000);
};

const getPitbikeStatus = (closedDatesSet?: Set<string>): { isOpen: boolean; text: string } => {
  const now = getSASTTime();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeDecimal = hour + min / 60;

  // Friday: 9am - 3pm (9.0 to 15.0)
  // Saturday: 9am - 3pm (9.0 to 15.0)
  // Sunday: 9am - 2:30pm (9.0 to 14.5)
  let isOpen = false;
  if (day === 5 && timeDecimal >= 9.0 && timeDecimal < 15.0) {
    isOpen = true;
  } else if (day === 6 && timeDecimal >= 9.0 && timeDecimal < 15.0) {
    isOpen = true;
  } else if (day === 0 && timeDecimal >= 9.0 && timeDecimal < 14.5) {
    isOpen = true;
  }

  // Check if current date is in closed dates
  const currentYyyy = now.getFullYear();
  const currentMm = String(now.getMonth() + 1).padStart(2, '0');
  const currentDd = String(now.getDate()).padStart(2, '0');
  const currentDateString = `${currentYyyy}-${currentMm}-${currentDd}`;

  if (closedDatesSet && closedDatesSet.has(currentDateString)) {
    isOpen = false;
  }

  if (isOpen) {
    return { isOpen: true, text: 'OPEN' };
  }

  // Calculate hours until next opening
  // Find next opening: can be Friday, Saturday, or Sunday at 9:00 AM
  let nextOpening: Date | null = null;
  for (let i = 0; i <= 30; i++) { // Check up to 30 days to bypass any closed holidays/weekends
    const testDate = new Date(now);
    testDate.setDate(now.getDate() + i);
    testDate.setHours(9, 0, 0, 0);

    const testDay = testDate.getDay();
    if (testDay === 5 || testDay === 6 || testDay === 0) {
      // Check if this day is closed
      const tyyyy = testDate.getFullYear();
      const tmm = String(testDate.getMonth() + 1).padStart(2, '0');
      const tdd = String(testDate.getDate()).padStart(2, '0');
      const testDateString = `${tyyyy}-${tmm}-${tdd}`;

      if (closedDatesSet && closedDatesSet.has(testDateString)) {
        continue; // This opening is closed, skip it
      }

      if (testDate.getTime() > now.getTime()) {
        nextOpening = testDate;
        break;
      }
    }
  }

  if (nextOpening) {
    const diffMs = nextOpening.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    return { isOpen: false, text: `OPEN IN ${diffHours} HOUR${diffHours > 1 ? 'S' : ''}` };
  }

  return { isOpen: false, text: 'CLOSED' };
};

export default function Track() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [pitbikeStatus, setPitbikeStatus] = useState(() => getPitbikeStatus());

  useEffect(() => {
    // Fetch closed dates from Firestore on mount
    getClosedDatesDirect()
      .then((data) => {
        const dateSet = new Set(data.map(item => item.date));
        setClosedDates(dateSet);
        setPitbikeStatus(getPitbikeStatus(dateSet));
      })
      .catch((err) => {
        console.error('Failed to fetch closed dates for track:', err);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPitbikeStatus(getPitbikeStatus(closedDates));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [closedDates]);

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
    <section id="track" className="py-12 bg-black border-b border-zinc-900 text-white">
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
          {tracks.map((track, idx) => (
            <div 
              key={idx}
              className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4 relative"
            >
              <div className="absolute top-6 right-6 z-10">
                <span className={`px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider ${
                  (track.title === "PitBike Track" ? pitbikeStatus.isOpen : track.status === 'OPEN')
                    ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-950/80 border border-amber-500/30 text-amber-400'
                }`}>
                  {track.title === "PitBike Track" ? pitbikeStatus.text : track.status}
                </span>
              </div>

              {/* Image */}
              <div className="relative aspect-[1.7] overflow-hidden border border-zinc-900 bg-zinc-900">
                <img 
                  src={track.image} 
                  alt={track.title}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    track.status === 'UNDER UPGRADES' ? 'opacity-40' : ''
                  }`}
                />
              </div>

              {/* Text */}
              <div>
                <h3 className="font-mono text-sm font-bold uppercase text-white mb-1.5">
                  {track.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {track.description}
                </p>
                {track.status !== 'OPEN' && (
                  <p className="mt-2 font-mono text-[10px] text-amber-400 uppercase tracking-tight">
                    * Big Bike upgrades in progress. Pay on-site during build phase.
                  </p>
                )}
              </div>
            </div>
          ))}
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
