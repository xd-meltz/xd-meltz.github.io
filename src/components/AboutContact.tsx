import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ShieldAlert, Bike, Mail, Instagram } from 'lucide-react';
import { navigateTo } from '../App';

export default function AboutContact() {
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const socialInstagramHandle = "rix.compound.mini.dirt.track";
  const emailAddress = "rixcompound@gmail.com";
  const phoneFormatted = "0768299919";
  const whatsappLink = "https://wa.me/27768299919";

  const [loadMap, setLoadMap] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadMap(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    const validClicks = [...clickTimestamps, now].filter(t => now - t < 1000);
    if (validClicks.length >= 5) {
      setClickTimestamps([]);
      navigateTo('admin');
    } else {
      setClickTimestamps(validClicks);
    }
  };

  return (
    <div className="bg-black text-white">
      
      {/* About & Location Section */}
      <section id="about" className="py-12 bg-black border-b border-zinc-900 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand font-bold block mb-1">
              Location & Details
            </span>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight italic">
              About & Location
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-5xl mx-auto">
            
            {/* Box 1: Text Details */}
            <div className="lg:col-span-7 border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase text-white mb-3">
                  The Cape Winelands Dirt Arena
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Nestled in the heart of Stellenbosch, Rix Compound is a premier private tracks playground built specifically for managed, confidence-building fun.
                </p>

                <div className="p-4 bg-zinc-900/50 border border-zinc-850 mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-brand font-mono text-[10px] font-bold uppercase">
                    <ShieldAlert className="w-3.5 h-3.5" /> Keep It Clean & Safe
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Designed strictly for pit bikes, quads, and junior MX vehicles. Please note that full-size Big Bikes are allowed on our Flat Track only.
                  </p>
                </div>
              </div>

              {/* Direct Contacts row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900 pt-4 text-xs">
                <div>
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider mb-0.5">Email</span>
                  <a href={`mailto:${emailAddress}`} className="text-zinc-300 hover:text-brand font-mono transition-colors">
                    {emailAddress}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 font-mono block text-[9px] uppercase tracking-wider mb-0.5">Instagram</span>
                  <a 
                    href={`https://www.instagram.com/${socialInstagramHandle}?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-zinc-300 hover:text-brand font-mono transition-colors"
                  >
                    @{socialInstagramHandle}
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2: Map */}
            <div className="lg:col-span-5 border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
              <div className="mb-3">
                <div className="flex items-center gap-1 text-brand font-mono text-[9px] uppercase font-bold tracking-widest mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Bottelary Road, Cape Town
                </div>
                <h4 className="text-zinc-200 font-mono text-[10px] uppercase font-extrabold">
                  Protea Farms, Stellenbosch Area
                </h4>
              </div>

              <div className="relative border border-zinc-900 bg-black aspect-[1.5] flex items-center justify-center overflow-hidden">
                {loadMap ? (
                  <iframe 
                    src="https://www.google.com/maps?q=Rix+Compound+Bottelary+Road+Protea+Farms+Cape+Town&output=embed"
                    allowFullScreen
                    loading="lazy"
                    title="Google maps location"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0 absolute inset-0"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-5 h-5 rounded-none border-2 border-brand/30 border-t-brand animate-spin" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Loading Map...
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Support Details */}
      <section id="contact" className="py-12 bg-black border-b border-zinc-900 scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-md mx-auto border border-zinc-800 bg-zinc-950 p-6 text-center">
            <Phone className="w-5 h-5 text-brand mx-auto mb-3" />
            <h3 className="font-mono text-xs uppercase font-extrabold text-white mb-2">
              Live Booking Support
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
              Need to check weather conditions, live track availability, or arrange custom private groups? Chat with us directly on WhatsApp.
            </p>

            <a 
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-brand/40 text-zinc-350 hover:text-white transition-colors text-xs font-mono uppercase"
            >
              <span>{phoneFormatted}</span>
              <span className="text-[9px] px-1 py-0.5 bg-emerald-950 text-emerald-400 font-mono uppercase border border-emerald-500/15">Chat Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 text-center relative z-10 font-sans">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          
          {/* Logo & secret trigger */}
          <div className="flex flex-col items-center gap-1.5">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform"
              title="Click 5 times to access Admin Panel"
            >
              <Bike className="w-4 h-4 text-brand" />
              <h4 className="font-mono font-black text-white uppercase tracking-widest text-xs italic">
                RIX<span className="text-brand">COMPOUND</span>
              </h4>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              Ride • Race • Repeat
            </p>
          </div>

          <div className="w-12 h-px bg-zinc-900 mx-auto" />

          {/* Copyright info */}
          <div className="space-y-1 text-[10px] text-zinc-600 font-mono uppercase tracking-tight">
            <p>© 2026 Rix Compound. All rights reserved.</p>
            <p className="normal-case">Made for motorsport enthusiasts in Stellenbosch, Western Cape, South Africa.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
