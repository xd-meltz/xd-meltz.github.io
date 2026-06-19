import React from "react";
import { ArrowDown, Flame, CornerDownRight, Star } from "lucide-react";

interface HeroProps {
  onExploreMenu: () => void;
}

export default function Hero({ onExploreMenu }: HeroProps) {
  return (
    <header id="section-hero" className="relative overflow-hidden bg-[#F7F4F0] py-10 lg:py-16 border-b-2 border-espresso-950 cursor-default">
      {/* Background Decorative Text S */}
      <div className="absolute inset-x-0 top-0 bottom-0 flex items-start lg:items-center justify-center opacity-[0.04] pointer-events-none select-none z-0 pt-6 lg:pt-0">
        <span className="text-[350px] sm:text-[600px] font-serif font-black italic -rotate-12 translate-y-4 sm:translate-y-12 select-none">S</span>
      </div>
      
      {/* Split Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 border-2 border-espresso-950 px-3.5 py-1 text-espresso-950 bg-amber-500/10">
              <Star className="w-3.5 h-3.5 fill-espresso-950 text-espresso-950" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Est. Stellenbosch, South Africa</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="font-serif text-6xl sm:text-7xl lg:text-[100px] font-black italic leading-[0.8] tracking-tighter text-espresso-950 mb-4">
                Stellos<br /><span className="ml-12 text-[#55524B]">Coffee</span>
              </h1>
              <p className="font-serif text-2xl italic text-espresso-800 leading-snug">
                Crafting daily joys in oak-lined streets.
              </p>
              <p className="font-sans text-espresso-700 text-sm md:text-base font-light leading-relaxed max-w-2xl">
                Stellos Coffee brings high-quality micro-roasted espresso, gourmet croissants, and our famous fresh-baked Crookies directly to the historic heart of Stellenbosch. Explore our modern interactive chalkboard console below.
              </p>
            </div>

            {/* Quick Badges in sleek table outline style */}
            <div className="grid grid-cols-3 gap-6 max-w-lg border-y-2 border-espresso-950 py-5">
              <div>
                <dt className="text-espresso-950 font-mono text-[10px] uppercase tracking-widest font-black opacity-60">Barista Roast</dt>
                <dd className="font-serif italic font-bold text-espresso-950 text-lg mt-1">100% Arabica</dd>
              </div>
              <div>
                <dt className="text-espresso-950 font-mono text-[10px] uppercase tracking-widest font-black opacity-60">Iconic Bakery</dt>
                <dd className="font-serif italic font-bold text-espresso-950 text-lg mt-1">Gourmet Crookies</dd>
              </div>
              <div>
                <dt className="text-espresso-950 font-mono text-[10px] uppercase tracking-widest font-black opacity-60">Stellenbosch</dt>
                <dd className="font-serif italic font-bold text-espresso-950 text-lg mt-1">Single Origin</dd>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreMenu}
                className="cursor-pointer bg-espresso-950 hover:bg-[#EAE6DF] hover:text-espresso-950 border border-espresso-950 text-[#F7F4F0] font-mono text-xs uppercase font-extrabold tracking-wider px-7 py-4 transition-all duration-300 flex items-center gap-2"
              >
                <span>View Menu</span>
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>

          {/* Right Image Feature Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              {/* Image Group Frame - matches the exact dimensions of the previous single image */}
              <div className="relative overflow-hidden border-2 border-espresso-950 bg-[#1D1A16] w-full h-[380px] sm:h-[450px]">
                {/* 3x3 Grid of 9 Different Coffee & Bakery Delights */}
                <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full p-[2px] bg-espresso-950">
                  {[
                    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=300&auto=format&fit=crop", // Barista brewing with steam
                    "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop", // Warm cup of latte art
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop", // Fresh espresso crema extraction
                    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop", // Freshly baked golden croissants
                    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=300&auto=format&fit=crop", // Roasted coffee beans close up
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop", // Slow pour-over drip filter
                    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=300&auto=format&fit=crop", // Stellenbosch street-side cafe seating
                    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&auto=format&fit=crop", // Melting chocolate chunk crookie/cookie
                    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop"  // Iced caramel frappe shake
                  ].map((src, idx) => (
                    <div key={idx} className="relative overflow-hidden w-full h-full bg-stone-900 group/grid">
                      <img
                        src={src}
                        alt={`Stellos Coffee Delicacy #${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/grid:scale-115"
                      />
                      <div className="absolute inset-0 bg-espresso-950/20 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
                
                {/* Chalkboard Accent tag - High Contrast Solid Design floating on top of grid */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#F7F4F0]/95 backdrop-blur-xs border-2 border-espresso-950 p-4 max-w-sm text-left shadow-lg pointer-events-none">
                  <div className="flex items-center gap-2 text-espresso-950 mb-1">
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest">Local Favourite</span>
                  </div>
                  <h4 className="font-serif font-bold italic text-base text-espresso-950">Nutella Crookie & Hot Cappuccino</h4>
                  <p className="font-sans text-[11px] text-espresso-700 mt-1 leading-normal font-light">
                    Indulgent flaky croissant filled and baked with rich cookie dough, melting with original local Nutella spread.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
