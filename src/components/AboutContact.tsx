import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ShieldAlert, Bike, Mail, Instagram } from 'lucide-react';
import { navigateTo } from '../App';
import { getShuffledPhoto } from '../lib/backgroundPhotos';

export default function AboutContact() {
  const aboutBgPhoto = getShuffledPhoto(7);
  const contactBgPhoto = getShuffledPhoto(8);
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
    <div className="relative text-white">
      
      {/* About & Location Section */}
      <section id="about" className="relative py-10 sm:py-16 border-b border-zinc-800 text-white scroll-mt-16 overflow-hidden">
        {/* Background photo from Google Drive - dynamic shuffled */}
        <div className="absolute inset-0 z-0">
          <img 
            src={aboutBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight italic text-white">
              About & Location
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-5xl mx-auto">
            
            {/* Box 1: Text Details */}
            <div className="lg:col-span-7 border-2 border-zinc-700 bg-zinc-900/90 p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md text-white">
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-black uppercase text-white mb-3">
                  The Cape Winelands Dirt Arena
                </h3>
                <p className="text-sm sm:text-base text-zinc-200 font-bold leading-relaxed mb-5">
                  Nestled in the heart of Stellenbosch, Rix Compound is a premier private tracks playground built specifically for managed, confidence-building fun.
                </p>

                <div className="p-4 sm:p-5 bg-zinc-950/80 border-2 border-zinc-700 mb-5">
                  <div className="flex items-center gap-2 mb-2 text-brand-light font-sans text-xs sm:text-sm font-black uppercase">
                    <ShieldAlert className="w-5 h-5" /> Keep It Clean & Safe
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 font-bold leading-relaxed font-sans">
                    Designed strictly for pit bikes, quads, and junior MX vehicles. Please note that full-size Big Bikes are allowed on our Flat Track only.
                  </p>
                </div>
              </div>

              {/* Direct Contacts row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-zinc-800 pt-5 text-sm">
                <div>
                  <span className="text-zinc-400 font-sans block text-xs uppercase tracking-wider mb-1 font-black">Email</span>
                  <a href={`mailto:${emailAddress}`} className="text-white hover:text-brand-light font-sans transition-colors font-extrabold text-sm sm:text-base">
                    {emailAddress}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-400 font-sans block text-xs uppercase tracking-wider mb-1 font-black">Instagram</span>
                  <a 
                    href={`https://www.instagram.com/${socialInstagramHandle}?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-white hover:text-brand-light font-sans transition-colors font-extrabold text-sm sm:text-base"
                  >
                    @{socialInstagramHandle}
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2: Map */}
            <div className="lg:col-span-5 border-2 border-zinc-700 bg-zinc-900/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md text-white">
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-brand-light font-sans text-xs uppercase font-black tracking-wider mb-1">
                  <MapPin className="w-4 h-4" /> Bottelary Road, Cape Town
                </div>
                <h4 className="text-white font-sans text-sm sm:text-base uppercase font-black">
                  Protea Farms, Stellenbosch Area
                </h4>
              </div>

              <div className="relative border-2 border-zinc-700 bg-zinc-950 aspect-[1.5] flex items-center justify-center overflow-hidden">
                {loadMap ? (
                  <iframe 
                    src="https://www.google.com/maps?q=Rix+Compound+Bottelary+Road+Protea+Farms+Cape+Town&output=embed"
                    allowFullScreen
                    loading="lazy"
                    title="Google maps location"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0 absolute inset-0 contrast-125 brightness-95 transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-6 h-6 border-2 border-brand/30 border-t-brand animate-spin" />
                    <span className="text-xs font-sans text-zinc-400 uppercase tracking-widest font-bold">
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
      <section id="contact" className="relative py-12 sm:py-16 border-b border-zinc-800 text-white scroll-mt-16 overflow-hidden">
        {/* Background photo from Google Drive - dynamic shuffled */}
        <div className="absolute inset-0 z-0">
          <img 
            src={contactBgPhoto.url} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/70 sm:bg-zinc-950/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="max-w-lg mx-auto border-2 border-zinc-700 bg-zinc-900/90 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md">
            <Phone className="w-7 h-7 text-brand-light mx-auto mb-3" />
            <h3 className="font-sans text-base sm:text-lg uppercase font-black text-white mb-2">
              Live Booking Support
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed mb-5 font-bold">
              Need to check weather conditions, live track availability, or arrange custom private groups? Chat with us directly on WhatsApp.
            </p>

            <a 
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-950 border-2 border-zinc-700 hover:border-brand text-white hover:text-brand-light transition-colors text-sm sm:text-base font-sans uppercase font-black shadow-lg"
            >
              <span>{phoneFormatted}</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-950/80 text-emerald-300 font-sans uppercase border border-emerald-500 font-black">Chat Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950/95 backdrop-blur-md py-12 text-center relative z-10 font-sans border-t-2 border-zinc-800 text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          
          {/* Logo & secret trigger */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
              title="Click 5 times to access Admin Panel"
            >
              <img src="/rc-monogram.png" alt="RC" className="h-6 w-auto inline-block invert" />
              <h4 className="font-sans font-black text-white uppercase tracking-wider text-base sm:text-lg italic">
                RIX<span className="text-brand-light">COMPOUND</span>
              </h4>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-black">
              Ride • Race • Repeat
            </p>
          </div>

          <div className="w-16 h-0.5 bg-zinc-800 mx-auto my-3" />

          {/* Copyright info */}
          <div className="space-y-1.5 text-xs text-zinc-400 font-sans uppercase font-bold">
            <p>© 2026 Rix Compound. All rights reserved.</p>
            <p className="normal-case text-zinc-500">Made for motorsport enthusiasts in Stellenbosch, Western Cape, South Africa.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
