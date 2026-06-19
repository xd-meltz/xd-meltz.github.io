import React, { useState } from "react";
import { MapPin, Navigation, Sparkles, Building, TreePine, Coffee } from "lucide-react";

interface Landmark {
  id: string;
  name: string;
  description: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  type: "cafe" | "university" | "garden" | "landmark";
}

export default function StellosMap() {
  const [hoveredLandmark, setHoveredLandmark] = useState<Landmark | null>(null);

  const landmarks: Landmark[] = [
    {
      id: "stellos",
      name: "Stellos Coffee",
      description: "100% Premium Local Coffee Bar (You are here!)",
      x: 48,
      y: 46,
      type: "cafe",
    },
    {
      id: "uni",
      name: "Stellenbosch University",
      description: "Main campus library & central square (Maties)",
      x: 75,
      y: 28,
      type: "university",
    },
    {
      id: "botanical",
      name: "Botanical Garden",
      description: "Historic glasshouses & indigenous South African flora",
      x: 20,
      y: 20,
      type: "garden",
    },
    {
      id: "dorp-st",
      name: "Dorp Street Historic District",
      description: "Oak-lined historic avenue with Cape Dutch architecture",
      x: 25,
      y: 78,
      type: "landmark",
    },
  ];

  const handleOpenGoogleMaps = () => {
    window.open(
      "https://maps.google.com/?q=Stellos+Coffee+Stellenbosch",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#D9D2C9] select-none overflow-hidden flex flex-col justify-between">
      {/* Visual Canvas Style Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{
          backgroundImage: `radial-gradient(#503420 1px, transparent 1px)`,
          backgroundSize: "16px 16px"
        }}
      ></div>

      {/* Stylized Streets & River SVG Vector Web */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Defining patterns or markers if needed */}
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#503420" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#503420" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Eerste River passing at the bottom */}
        <path 
          d="M -20,320 C 150,310 250,330 450,290 C 650,250 850,280 1100,260 L 1100,380 L -20,380 Z" 
          fill="url(#riverGradient)" 
        />
        <text x="32%" y="325" fill="#503420" fillOpacity="0.25" className="font-sans text-[9px] uppercase tracking-widest font-black italic">
          Eerste River
        </text>

        {/* ROAD NETWORK */}
        {/* Dorp Street (Horizontal main arterial) */}
        <line x1="-10" y1="260" x2="110%" y2="260" stroke="#503420" strokeWidth="18" strokeLinecap="round" strokeOpacity="0.2" />
        <line x1="-10" y1="260" x2="110%" y2="260" stroke="#D9D2C9" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
        
        {/* Plein Street (Horizontal mid) */}
        <line x1="-10" y1="130" x2="110%" y2="130" stroke="#503420" strokeWidth="14" strokeLinecap="round" strokeOpacity="0.2" />
        <line x1="-10" y1="130" x2="110%" y2="130" stroke="#D9D2C9" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />

        {/* Victoria Street (Horizontal top) */}
        <line x1="-10" y1="50" x2="110%" y2="50" stroke="#503420" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.15" />

        {/* Ryneveld Street (Vertical main connecting Stellos) */}
        <line x1="48%" y1="-10" x2="48%" y2="280" stroke="#503420" strokeWidth="16" strokeLinecap="round" strokeOpacity="0.20" />
        <line x1="48%" y1="-10" x2="48%" y2="280" stroke="#D9D2C9" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />

        {/* Bird Street (Vertical Left side) */}
        <line x1="18%" y1="-10" x2="18%" y2="280" stroke="#503420" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.15" />

        {/* Marais Street (Vertical Right side) */}
        <line x1="82%" y1="-10" x2="82%" y2="285" stroke="#503420" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.15" />

        {/* STREET LABELS */}
        <text x="3%" y="264" fill="#503420" fillOpacity="0.7" className="font-mono text-[8px] uppercase tracking-widest font-extrabold">
          Dorp St.
        </text>
        <text x="3%" y="134" fill="#503420" fillOpacity="0.7" className="font-mono text-[8px] uppercase tracking-widest font-extrabold">
          Plein St.
        </text>
        <text x="45.5%" y="90" fill="#503420" fillOpacity="0.7" transform="rotate(-90 150 90)" className="font-mono text-[8px] uppercase tracking-widest font-extrabold">
          Ryneveld St.
        </text>

        {/* Small decorative trees in Stellenbosch (Town of Oaks) */}
        {/* Draw a few subtle geometric green-brownish dots for trees */}
        <circle cx="8%" cy="110" r="4" fill="#503420" fillOpacity="0.15" />
        <circle cx="10%" cy="150" r="3" fill="#503420" fillOpacity="0.12" />
        <circle cx="35%" cy="240" r="5" fill="#503420" fillOpacity="0.18" />
        <circle cx="62%" cy="245" r="4" fill="#503420" fillOpacity="0.15" />
        <circle cx="65%" cy="110" r="4" fill="#503420" fillOpacity="0.15" />
        <circle cx="90%" cy="150" r="3" fill="#503420" fillOpacity="0.12" />
        <circle cx="45%" cy="40" r="4" fill="#503420" fillOpacity="0.15" />
        
        {/* Decorative Compass Rose / North Indicator */}
        <g transform="translate(45, 45) scale(0.6)" opacity="0.3">
          <circle cx="0" cy="0" r="20" fill="none" stroke="#503420" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="0" y1="-25" x2="0" y2="25" stroke="#503420" strokeWidth="1" />
          <line x1="-25" y1="0" x2="25" y2="0" stroke="#503420" strokeWidth="1" />
          <polygon points="0,-25 4,-5 0,0" fill="#503420" />
          <polygon points="0,-25 -4,-5 0,0" fill="#D9D2C9" stroke="#503420" strokeWidth="0.5" />
          <text x="-4" y="-28" fill="#503420" className="font-mono text-[9px] font-bold">N</text>
        </g>
      </svg>

      {/* INTERACTIVE MARKERS LAYOUT (ABSOLUTE COORDS) */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {landmarks.map((point) => {
          const isStellos = point.id === "stellos";

          return (
            <div
              key={point.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredLandmark(point)}
              onMouseLeave={() => setHoveredLandmark(null)}
              onClick={isStellos ? handleOpenGoogleMaps : undefined}
            >
              {isStellos ? (
                /* Glowing/Pulsing Stellos coffee pin */
                <div id={`marker-${point.id}`} className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-500/30 animate-ping opacity-75"></span>
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-[#503420]/30 animate-pulse"></span>
                  <div className="relative z-10 bg-[#503420] text-[#D9D2C9] p-2.5 rounded-full shadow-lg border-2 border-amber-300 hover:scale-110 active:scale-95 transition-transform duration-200">
                    <Coffee className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                /* Smaller landmarks pin */
                <div 
                  id={`marker-${point.id}`} 
                  className={`bg-[#D9D2C9] border-2 border-[#503420] text-[#503420] p-1.5 rounded-full shadow-md transition-all duration-200 ${
                    hoveredLandmark?.id === point.id ? "scale-110 bg-[#503420] text-[#D9D2C9] z-20" : "opacity-85"
                  }`}
                >
                  {point.type === "university" && <Building className="w-3.5 h-3.5" />}
                  {point.type === "garden" && <TreePine className="w-3.5 h-3.5" />}
                  {point.type === "landmark" && <MapPin className="w-3.5 h-3.5" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Header details for Stellos Map */}
      <div className="relative z-10 p-3 sm:p-4 pointer-events-none w-full flex justify-between items-start">
        <div className="bg-[#503420] text-[#D9D2C9] px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-[10px] font-sans font-bold tracking-widest uppercase">
          ✦ STELLENBOSCH MAP ✦
        </div>
      </div>

      {/* Tooltip detail element */}
      <div className="relative z-10 p-3 sm:p-4 w-full flex flex-col items-center">
        {hoveredLandmark ? (
          <div 
            className="w-full max-w-[280px] bg-[#503420] text-[#D9D2C9] px-3.5 py-2.5 rounded-xl border border-amber-400/20 shadow-xl text-center transform transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <h5 className="font-serif text-[13px] font-black tracking-wide text-amber-200">
              {hoveredLandmark.name}
            </h5>
            <p className="font-sans text-[10.5px] text-stone-300 mt-0.5 leading-tight">
              {hoveredLandmark.description}
            </p>
          </div>
        ) : (
          <button 
            type="button"
            onClick={handleOpenGoogleMaps}
            className="w-full max-w-[280px] bg-[#503420]/95 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-stone-700 hover:border-amber-400 hover:bg-[#503420] active:scale-98 text-stone-100 shadow-xl transition-all duration-200 pointer-events-auto flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 text-left">
              <div className="bg-amber-100/10 p-1.5 rounded-lg text-amber-200 group-hover:scale-110 transition-transform">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-mono text-[9px] uppercase tracking-widest text-[#D9D2C9] font-bold">Open Navigation</h5>
                <p className="font-serif text-xs font-bold text-amber-100 leading-tight">University Town Center</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-200 uppercase font-bold group-hover:translate-x-0.5 transition-transform">
              GO →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
