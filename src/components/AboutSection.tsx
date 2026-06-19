import React from "react";
import { Coffee, MapPin, Sparkles, Utensils, Heart, ThumbsUp } from "lucide-react";
import StellosMap from "./StellosMap";

export default function AboutSection() {
  return (
    <section id="section-story" className="scroll-mt-24 pt-8 pb-20 sm:pt-12 sm:pb-24 bg-espresso-50 relative cursor-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bento Grid Concept Story Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Beautiful text columns (Span 7) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8c5a3c] font-bold">The Stellos Coffee Story</span>
            
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-espresso-950 tracking-tight leading-none">
              A Warm Corner in <span className="italic font-normal text-espresso-700">Stellenbosch</span>
            </h2>
            
            <div className="font-sans text-stone-700 space-y-5 text-sm md:text-base font-light leading-relaxed max-w-2xl">
              <p>
                Nestled on the shaded avenues of South Africa's historic university town, Stellos Coffee was founded with a singular purpose: to craft beautiful daily moments through exceptional caffeine and pure baking indulgence. 
              </p>
              <p>
                From our premium signature <strong>100% Arabica espresso beans</strong> to our selection of decadent treats like <strong>Portuguese Pastéis de Nata</strong> and original <strong>Lindt Chocolate creations</strong>, everything on our chalkboard menu is selected with strict devotion to flavor.
              </p>
              <p>
                But what truly has the town buzzing is our bakery's ultimate highlight—<strong>The Crookie</strong>. This croissant-cookie hybrid combines a freshly rolled flaky croissant stuffed to the brim with chocolate chip cookie dough, baked to a warm gooey center in Nutella and Lotus Biscoff variations.
              </p>
            </div>

            {/* Core Values / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              <div className="flex gap-4 p-4 rounded-xl bg-white border border-espresso-100/50">
                <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center text-espresso-900 shrink-0">
                  <Coffee className="w-5 h-5 text-[#8c5a3c]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-espresso-950">Micro-Batch Roasting</h4>
                  <p className="font-sans text-[11px] text-stone-500 mt-0.5 leading-normal">
                    Strict temperature profile logs for rich crema, nutty undertones, and velvet finish.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-white border border-espresso-100/50">
                <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center text-espresso-900 shrink-0">
                  <Utensils className="w-5 h-5 text-[#8c5a3c]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-espresso-950">Baked on Command</h4>
                  <p className="font-sans text-[11px] text-stone-500 mt-0.5 leading-normal">
                    Croissants rolled fresh twice daily. Baked constantly so your croissant is always hot.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Modern Grid Layout cards (Span 5) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            
            <div className="space-y-4">
              
              {/* Card 1: Map details */}
              <div id="section-location" className="scroll-mt-24 bg-[#D9D2C9] text-[#503420] rounded-2xl relative overflow-hidden text-left min-h-[300px] h-80 flex flex-col justify-between group border border-[#503420]/10 shadow-sm col-span-1 sm:col-span-2">
                <StellosMap />
              </div>

              {/* Card 2: Student Spot */}
              <div className="bg-white border border-espresso-100 p-6 rounded-2xl text-left min-h-[240px] h-auto flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-[#8c5a3c]">
                  <Sparkles className="w-6 h-6 fill-[#8c5a3c]/10" />
                  <span className="font-mono text-[9px] font-bold uppercase py-0.5 px-2 bg-espresso-100 rounded-full">Atmosphere</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-espresso-950">Oak Shaded Vibe</h4>
                  <p className="font-sans text-xs text-stone-500 leading-normal">
                    Spacious student-friendly workstations, high-speed fiber WiFi, and warm ambient study music.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-stone-400 font-semibold uppercase tracking-wider">• open mon-sat</div>
              </div>

            </div>

            <div className="space-y-4 sm:pt-8">
              
              {/* Card 3: Coffee Addict quote */}
              <div className="bg-white border border-espresso-100 p-6 rounded-2xl text-left min-h-[256px] h-auto flex flex-col justify-between shadow-sm">
                <div className="text-amber-500 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => <Heart key={s} className="w-4.5 h-4.5 fill-current text-amber-500" />)}
                </div>
                <div>
                  <p className="font-serif text-sm text-espresso-950 italic leading-relaxed">
                    "The Biscoff Crookie is an absolute masterpiece! Stellos is hands down the best place to study between Stellenbosch lectures."
                  </p>
                  <span className="font-sans text-[11px] text-stone-500 block font-semibold mt-3">
                    — Jean, Maties Student
                  </span>
                </div>
                <div className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start border border-emerald-100">
                  Verified Local Review
                </div>
              </div>

              {/* Card 4: Hours summaries */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-left min-h-[176px] h-auto flex flex-col justify-between shadow-sm">
                <ThumbsUp className="w-6 h-6 text-[#8c5a3c]" />
                <div>
                  <h4 className="font-display font-bold text-xs text-espresso-950 uppercase tracking-wide">Daily Freshness</h4>
                  <p className="font-sans text-[11.5px] text-stone-600 mt-1 leading-normal">
                    We open early at <strong>07:00 AM</strong> to get you fueled for your morning commutes and early classes!
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
