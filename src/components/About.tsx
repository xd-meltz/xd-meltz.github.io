import React from 'react';
import { Camera, ShieldCheck, Heart, Layers, Eye } from 'lucide-react';
import { aboutContent, gearBag } from '../data';

export default function About() {
  return (
    <section className="py-20 bg-white" id="about-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Core Profile Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-28">
          
          {/* Overlapping portrait layouts matching Ben's style exactly */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[480px] h-[450px] sm:h-[550px]" id="overlapping-images">
              
              {/* Back Image (Driver view) */}
              <div className="absolute right-0 top-4 w-[60%] aspect-[3/4] overflow-hidden rounded-2xl shadow-xl border border-neutral-100 z-10 transition-transform hover:scale-102">
                <img
                  src={aboutContent.portfolioOwnerPhotoRight}
                  alt="Igor behind the wheel"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Front Image (Igor standing with green car) */}
              <div className="absolute left-0 bottom-4 w-[65%] aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border-4 border-white z-20 transition-transform hover:scale-102">
                <img
                  src={aboutContent.portfolioOwnerPhotoLeft}
                  alt="Igor with Alfa Romeo Giulia Quadrifoglio"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Minimal decorative coordinates badge */}
              <div className="absolute bottom-10 right-4 bg-black text-white font-mono text-[9px] tracking-[0.25em] px-4 py-2 border border-neutral-800 rounded z-35 shadow-lg">
                37.8136° S, 144.9631° E
              </div>
            </div>
          </div>

          {/* Right Core Description Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 block uppercase">
              FOUNDER & LEAD OPTICIAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              {aboutContent.storyTitle}
            </h2>
            
            <div className="w-16 h-[2px] bg-black my-4" />

            <div className="space-y-4 text-neutral-600 font-sans text-sm sm:text-base leading-relaxed font-light">
              {aboutContent.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Quick credentials blocks */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-100">
              <div>
                <span className="text-lg font-bold text-black font-sans block">900K+</span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">CREATIVE REACH</span>
              </div>
              <div>
                <span className="text-lg font-bold text-black font-sans block">6-FIGURE</span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">ANNUAL CAMPAIGNS</span>
              </div>
              <div>
                <span className="text-lg font-bold text-black font-sans block">61.0 MP</span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">EXIF PRECISION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Cards of RixVisuals */}
        <div className="border-t border-b border-neutral-100 py-16 mb-24 grid grid-cols-1 md:grid-cols-3 gap-12" id="philosophy">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <Camera size={18} />
            </div>
            <h3 className="font-sans text-xs tracking-widest font-bold uppercase text-neutral-900">OPTICAL HONESTY</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              We focus on actual optical captures using Leica glass and premium prime focal lengths, reducing heavy filters and digital manipulation down to absolute zero.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <Layers size={18} />
            </div>
            <h3 className="font-sans text-xs tracking-widest font-bold uppercase text-neutral-900">DYNAMIC SPACE</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Emphasizing the silence and power of negative space. The surrounding atmosphere tells a story far deeper than the car model alone.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-sans text-xs tracking-widest font-bold uppercase text-neutral-900">BESPOKE DELIVERY</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Crafting museum-grade silver halide prints for high-end individual garages, collectors, and corporate showrooms worldwide.
            </p>
          </div>
        </div>

        {/* Modern Gear Bag section explaining cameras & details */}
        <div className="bg-neutral-50 p-8 sm:p-12 rounded-2xl border border-neutral-100" id="gear-section">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 block uppercase">
                THE SYSTEM
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-sans">
                Inside Igor's Optical Lens Bag
              </h3>
              <p className="text-xs text-neutral-500 font-sans font-light max-w-lg mx-auto leading-relaxed">
                A premium selection of dedicated analog rangefinders, high-speed workhorses, and ultra-rare fast lenses calibrated for speed and light.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {gearBag.map((item, idx) => (
                <div key={idx} className="bg-white p-5 border border-neutral-100 shadow-sm rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[9px] font-mono tracking-wider font-semibold text-neutral-400 uppercase bg-neutral-100 px-2 py-0.5 rounded block w-fit mb-2">
                      {item.type}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 font-sans tracking-wide">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-500 font-sans font-light mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
