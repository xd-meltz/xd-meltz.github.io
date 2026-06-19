import React, { useState } from "react";
import { Search, Info, AlertCircle, Sparkles } from "lucide-react";
import { MenuItem, SpecialCombo } from "../types";
import { HOT_DRINKS, STELLOS_FREEZE, ICE_COFFEE, MUFFINS, CROISSANTS, OTHER_TREATS, SPECIALS } from "../menuData";

export default function ChalkboardMenu() {
  const [searchQuery, setSearchQuery] = useState("");

  // Search Filter
  const matchesSearch = (text: string) => {
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const getFilteredItems = <T extends MenuItem>(items: T[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      matchesSearch(item.name) || 
      (item.description && matchesSearch(item.description))
    );
  };

  const getFilteredSpecials = (items: SpecialCombo[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      matchesSearch(item.name) || 
      matchesSearch(item.description) || 
      matchesSearch(item.includes)
    );
  };

  const selectedHotDrinks = HOT_DRINKS;
  const selectedFreezes = STELLOS_FREEZE;
  const selectedIceCoffee = ICE_COFFEE;
  const selectedMuffins = MUFFINS;
  const selectedCroissants = CROISSANTS;
  const selectedOtherTreats = OTHER_TREATS;
  const selectedSpecials = SPECIALS;

  return (
    <section id="section-menu" className="scroll-mt-24 pt-12 pb-4 sm:pt-16 sm:pb-6 bg-[#faf8f5] relative cursor-default">
      
      {/* Decorative background vines/leaves to mimic Stellenbosch cafe garden feel */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-stone-200/50 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3 mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#8c5a3c] font-bold">Stellenbosch Tradition</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-espresso-950 tracking-tight">
            Our Menu
          </h2>
          <p className="font-sans text-stone-600 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            Take a look at what we're serving today on Dorp Street. Hand-drawn daily by our baristas with premium local ingredients.
          </p>
        </div>

        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-stone-200/60 mb-10 max-w-2xl mx-auto shadow-sm">
          
          {/* Elegant Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter menu (e.g. Lindt, Latte, Croissant...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8c5a3c] text-xs font-sans transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 text-stone-500 text-[10px] uppercase font-mono tracking-wider shrink-0">
            <Info className="w-3.5 h-3.5 text-[#8c5a3c]" />
            <span>Stellenbosch Board</span>
          </div>

        </div>

        {/* ======================= TACTILE BLACKBOARD EMBED ======================= */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.2)] border-[8px] sm:border-[16px] border-stone-800 bg-[#161718]">
          
          {/* Realistic Wood Grain Frame Overlay highlights */}
          <div className="absolute inset-x-0 top-0 h-1 bg-white/10 pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 left-0 w-1 bg-white/5 pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-1 bg-black/40 pointer-events-none z-10"></div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60 pointer-events-none z-10"></div>

          {/* Chalkboard Slate Dust Slate texture with customized gradients */}
          <div className="absolute inset-0 bg-radial-at-t from-[#242728] via-[#17181a] to-[#0f1011] opacity-98 pointer-events-none"></div>
          
          {/* Textured chalk dust background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none Mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.0) 80%), 
                                url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          ></div>

          {/* Actual blackboard interior */}
          <div className="relative w-full p-6 sm:p-10 lg:p-14 text-stone-100 font-caveat text-[17px] sm:text-[19px] lg:text-[21px] tracking-wider selection:bg-stone-700 selection:text-white leading-relaxed select-none">
            
            {/* Header / Crest */}
            <div className="w-full text-center pb-2 mb-8">
              <span 
                className="font-sketch text-5xl sm:text-7xl lg:text-8xl font-bold text-amber-100 tracking-widest block select-none animate-fade-in"
                style={{ 
                  textShadow: "0 0 4px rgba(253,243,219,0.4), -1px -1px 1px rgba(255,255,255,0.2), 1px 1px 2px rgba(0,0,0,0.8)"
                }}
              >
                Stellos Coffee
              </span>
            </div>

            {/* Grid structure: columns stack on mobile, 2 columns on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* ================= COLUMN 1: HOT BEVERAGES ================= */}
              <div className="w-full space-y-9">
                <div>
                  <div className="flex items-baseline justify-between border-b-2 border-stone-600/70 pb-2 mb-4">
                    <h3 
                      className="font-sketch font-bold text-xl sm:text-2xl lg:text-3xl text-stone-100 tracking-widest uppercase select-none"
                      style={{ textShadow: "0 0 1px rgba(255,255,255,0.8)" }}
                    >
                      Brewed Coffee
                    </h3>
                    <div className="flex gap-8 sm:gap-10 text-xs sm:text-sm font-bold text-amber-200 font-sketch tracking-wider">
                      <span className="w-6 text-center">MED</span>
                      <span className="w-6 text-center">LRG</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedHotDrinks.map((item) => {
                      const isMatch = searchQuery ? matchesSearch(item.name) : true;
                      const isNoMatchFade = searchQuery && !isMatch;
                      return (
                        <div 
                          key={item.id} 
                          className={`flex flex-col py-1 border-b border-stone-800/20 transition-all duration-300 ${isNoMatchFade ? "opacity-15 blur-[0.5px]" : "hover:bg-white/5"} rounded px-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-stone-100 font-medium tracking-wider flex items-center text-lg sm:text-xl lg:text-2xl">
                              {item.name}
                              {item.popular && (
                                <span className="ml-2 text-[9px] font-sans font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 py-0.5 rounded-sm uppercase tracking-wider">
                                  Fav
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-8 sm:gap-10 text-right text-amber-100 font-bold text-lg sm:text-xl lg:text-2xl">
                              <span className="w-6 text-center">{item.priceM !== undefined ? `R${item.priceM}` : "—"}</span>
                              <span className="w-6 text-center">{item.priceL !== undefined ? `R${item.priceL}` : "—"}</span>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm sm:text-base text-stone-400 text-left mt-0.5 italic leading-tight">
                              {item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* STELLOS FREEZE */}
                <div>
                  <div className="flex items-baseline justify-between border-b-2 border-stone-600/70 pb-2 mb-3">
                    <h3 
                      className="font-sketch font-bold text-xl sm:text-2xl lg:text-3xl text-amber-200 tracking-widest uppercase select-none"
                      style={{ textShadow: "0 0 1px rgba(251,191,36,0.3)" }}
                    >
                      Ice Freezes
                    </h3>
                    <div className="flex gap-8 sm:gap-10 text-xs sm:text-sm font-bold text-amber-200 font-sketch tracking-wider">
                      <span className="w-6 text-center">MED</span>
                      <span className="w-6 text-center">LRG</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-400 italic mb-3 leading-normal text-left">
                    Rich, thick frost blend topped with fresh whipped cream:
                  </p>
                  <div className="space-y-4">
                    {selectedFreezes.map((item) => {
                      const isMatch = searchQuery ? matchesSearch(item.name) : true;
                      const isNoMatchFade = searchQuery && !isMatch;
                      return (
                        <div 
                          key={item.id} 
                          className={`flex flex-col py-1 border-b border-stone-800/20 transition-all duration-300 ${isNoMatchFade ? "opacity-15 blur-[0.5px]" : "hover:bg-white/5"} rounded px-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-stone-200 font-medium tracking-wider text-lg sm:text-xl lg:text-2xl">
                              {item.name.replace(" Freeze", "")}
                            </span>
                            <div className="flex items-center gap-8 sm:gap-10 text-right text-amber-100 font-bold text-lg sm:text-xl lg:text-2xl">
                              <span className="w-6 text-center">R{item.priceM}</span>
                              <span className="w-6 text-center">R{item.priceL}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ================= COLUMN 2: COFFEE ICE, ADDONS, CROISSANTS ================= */}
              <div className="w-full space-y-9 text-left">
                
                {/* ICE COFFEE */}
                <div>
                  <div className="flex items-baseline justify-between border-b-2 border-stone-600/70 pb-2 mb-4">
                    <h3 
                      className="font-sketch font-bold text-xl sm:text-2xl lg:text-3xl text-stone-100 tracking-widest uppercase select-none"
                      style={{ textShadow: "0 0 1px rgba(255,255,255,0.8)" }}
                    >
                      Ice Coffee
                    </h3>
                    <div className="flex gap-8 sm:gap-10 text-xs sm:text-sm font-bold text-amber-200 font-sketch tracking-wider">
                      <span className="w-6 text-center">MED</span>
                      <span className="w-6 text-center">LRG</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedIceCoffee.map((item) => {
                      const isMatch = searchQuery ? matchesSearch(item.name) : true;
                      const isNoMatchFade = searchQuery && !isMatch;
                      return (
                        <div 
                          key={item.id} 
                          className={`flex flex-col py-1 border-b border-stone-800/20 transition-all duration-300 ${isNoMatchFade ? "opacity-15 blur-[0.5px]" : "hover:bg-white/5"} rounded px-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-stone-200 font-medium tracking-wider text-lg sm:text-xl lg:text-2xl">
                              {item.name.replace("Ice Coffee w/ ", "w/ ")}
                            </span>
                            <div className="flex items-center gap-8 sm:gap-10 text-right text-amber-100 font-bold text-lg sm:text-xl lg:text-2xl">
                              <span className="w-6 text-center">R{item.priceM}</span>
                              <span className="w-6 text-center">R{item.priceL}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COFFEE ADDONS */}
                <div className="bg-stone-900/40 p-4 border border-stone-800/60 rounded-xl font-caveat text-lg sm:text-xl">
                  <div className="flex items-baseline justify-between border-b border-stone-700 pb-1 mb-2">
                    <h3 className="font-sketch font-bold text-lg text-amber-200 tracking-widest uppercase select-none">Custom Addons</h3>
                    <span className="text-xs text-stone-500 font-sans uppercase">Rate</span>
                  </div>

                  <div className="space-y-2 text-stone-300">
                    <div className="flex justify-between">
                      <span>• Espresso Shot / Cream</span>
                      <span className="text-amber-100 font-bold">R9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Syrups (Vanilla/Hazelnut/Caramel)</span>
                      <span className="text-amber-100 font-bold">R10 M / R11 L</span>
                    </div>
                    
                    <div className="text-amber-300 font-bold tracking-wider mt-3 font-sketch uppercase">Milk Alternatives:</div>
                    <div className="pl-2 space-y-1 text-stone-400">
                      <div className="flex justify-between">
                        <span>Oat Milk</span>
                        <span className="text-stone-300 font-bold">+ R9 M / R11 L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Soy Milk</span>
                        <span className="text-stone-300 font-bold">+ R9 M / R11 L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Almond Milk</span>
                        <span className="text-stone-300 font-bold">+ R11 M / R13 L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Macadamia Milk</span>
                        <span className="text-stone-300 font-bold">+ R13 M / R15 L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CROISSANTS & MUFFINS */}
                <div className="space-y-6">
                  
                  {/* CROISSANTS */}
                  <div>
                    <div className="flex items-baseline justify-between border-b-2 border-stone-600/70 pb-2 mb-3">
                      <h3 
                        className="font-sketch font-bold text-xl sm:text-2xl lg:text-3xl text-stone-100 tracking-widest uppercase select-none"
                        style={{ textShadow: "0 0 1px rgba(255,255,255,0.8)" }}
                      >
                        Bakery & Treats
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-amber-200 font-sketch tracking-wider">PRICE</span>
                    </div>
                    <div className="space-y-3">
                      {selectedCroissants.map((item) => {
                        const isMatch = searchQuery ? matchesSearch(item.name) : true;
                        const isNoMatchFade = searchQuery && !isMatch;
                        return (
                          <div 
                            key={item.id} 
                            className={`flex flex-col py-1 border-b border-stone-800/10 transition-all duration-300 ${isNoMatchFade ? "opacity-15 blur-[0.5px]" : "hover:bg-white/5"} rounded px-1`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-stone-200 font-medium tracking-wider text-lg sm:text-xl lg:text-2xl">
                                {item.name}
                              </span>
                              <span className="text-amber-100 font-bold text-lg sm:text-xl lg:text-2xl">R{item.priceM}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm sm:text-base text-stone-400 text-left mt-0.5 italic leading-tight">
                                {item.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* MUFFINS BRIEF & OTHER TREATS */}
                  <div className="space-y-3 pt-1 border-t border-stone-800/35">
                    {/* MUFFINS SUMMARY */}
                    <div className="flex justify-between items-center py-1 text-lg sm:text-xl lg:text-2xl text-stone-200">
                      <span className="font-medium tracking-wider">Freshly Baked Muffins</span>
                      <span className="text-amber-100 font-bold">R35</span>
                    </div>
                    
                    {/* OTHER TREATS */}
                    <div className="space-y-3">
                      {selectedOtherTreats.map((item) => {
                        const isMatch = searchQuery ? matchesSearch(item.name) : true;
                        const isNoMatchFade = searchQuery && !isMatch;
                        return (
                          <div 
                            key={item.id} 
                            className={`flex justify-between items-center py-1 border-t border-stone-800/20 text-lg sm:text-xl lg:text-2xl transition-all duration-300 ${isNoMatchFade ? "opacity-15 blur-[0.5px]" : ""}`}
                          >
                            <span className="text-stone-300 font-medium tracking-wider">
                              {item.name}
                            </span>
                            <span className="text-amber-100 font-bold">R{item.priceM}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Empty result view */}
            {searchQuery && 
             selectedHotDrinks.filter(i => matchesSearch(i.name)).length === 0 && 
             selectedFreezes.filter(i => matchesSearch(i.name)).length === 0 && 
             selectedCroissants.filter(i => matchesSearch(i.name)).length === 0 && 
             selectedSpecials.filter(i => matchesSearch(i.name)).length === 0 && (
              <div className="text-center py-12 bg-stone-900/50 rounded-xl border border-dashed border-stone-800 mt-6">
                <AlertCircle className="w-8 h-8 text-amber-200/50 mx-auto mb-2" />
                <h4 className="font-display font-medium text-stone-300">No matching chalk lines found</h4>
                <p className="font-sans text-[11px] text-stone-500 mt-0.5">Try searching for other words like "Espresso", "Crookie" or "Lindt".</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
