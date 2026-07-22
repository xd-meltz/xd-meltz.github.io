import React, { useState } from 'react';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showDashboard?: boolean;
  setShowDashboard?: (show: boolean) => void;
  inboxCount?: number;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isSearchOpen?: boolean;
  setIsSearchOpen?: (isOpen: boolean) => void;
  printRequestsCount: number;
  onOpenCartInfo: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  showDashboard = false,
  setShowDashboard,
  printRequestsCount,
  onOpenCartInfo
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', action: 'home' },
    { id: 'portfolio', label: 'Portfolio', action: 'portfolio' },
    { id: 'contact', label: 'Contact', action: 'contact' }
  ];

  const handleTabClick = (tab: { id: string; label: string; action: string }) => {
    setMobileMenuOpen(false);
    if (setShowDashboard) setShowDashboard(false);

    setActiveTab(tab.action);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActiveTabLabel = () => {
    if (showDashboard) return 'Dashboard';
    const found = tabs.find((t) => t.action === activeTab);
    return found ? found.label : 'Portfolio';
  };

  return (
    <>
      {/* ================= MOBILE MODE ONLY: LIQUID GLASS DYNAMIC ISLAND ================= */}
      <div className="md:hidden fixed top-3 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
        <motion.div
          layout
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`pointer-events-auto w-full max-w-sm backdrop-blur-2xl bg-neutral-950/85 text-white border border-white/20 shadow-[0_16px_45px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden ${
            mobileMenuOpen ? 'rounded-[32px] p-4' : 'rounded-full px-3.5 py-2'
          }`}
        >
          {/* Glass Top Highlight / Reflection Ring */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none rounded-[inherit]" />

          {/* Collapsed Pill Header Controls */}
          <div className="flex items-center justify-between relative z-10">
            
            {/* Left: Brand Pill */}
            <button
              onClick={() => {
                setActiveTab('home');
                if (setShowDashboard) setShowDashboard(false);
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-amber-400 animate-pulse" />
              <span className="font-sans text-[11px] font-black tracking-[0.25em] uppercase">RIX</span>
            </button>

            {/* Center: Dynamic Island Active Mode Indicator & Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-200 transition-all cursor-pointer font-mono text-[10px] tracking-widest uppercase"
            >
              <span className="text-white font-bold">{getActiveTabLabel()}</span>
              <ChevronDown size={11} className={`text-neutral-400 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Right: Cart & Menu Expand Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCartInfo();
                }}
                className="p-2 text-white/90 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/10 relative transition-all cursor-pointer"
                aria-label="Print Cart"
              >
                <ShoppingBag size={14} />
                {printRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-500 to-pink-500 text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-xs animate-pulse">
                    {printRequestsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:text-amber-300 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
                aria-label="Toggle Dynamic Island Menu"
              >
                {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>

          {/* Expanded Dynamic Island Actions & Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-white/15 pt-3 space-y-2 relative z-10"
              >
                <div className="flex flex-col gap-1.5">
                  {tabs.map((tab) => {
                    const isTabActive = activeTab === tab.action && !showDashboard;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`w-full text-left font-sans text-xs font-bold tracking-[0.25em] py-3 px-4 rounded-xl transition-all uppercase flex items-center justify-between border ${
                          isTabActive
                            ? 'bg-white text-black border-white shadow-lg font-black'
                            : 'border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isTabActive && (
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer bar inside Dynamic Island */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
                  <a
                    href="https://instagram.com/_rix.visuals_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-pink-400 hover:text-pink-300 uppercase py-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>@_RIX.VISUALS_</span>
                  </a>

                  <button
                    onClick={() => {
                      onOpenCartInfo();
                      setMobileMenuOpen(false);
                    }}
                    className="font-mono text-[10px] tracking-wider text-amber-300 hover:text-amber-200 uppercase flex items-center gap-1.5 py-1 font-bold"
                  >
                    <span>PRINT CART ({printRequestsCount})</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ================= DESKTOP HEADER NAVBAR ================= */}
      <header className="hidden md:block bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all border-b border-neutral-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Signature */}
          <div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab('home');
                if (setShowDashboard) setShowDashboard(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-sans text-xs font-black tracking-[0.3em] text-black uppercase cursor-pointer"
            >
              RIXVISUALS
            </motion.button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center space-x-8 lg:space-x-10">
            {tabs.map((tab) => {
              const isTabActive = activeTab === tab.action && !showDashboard;

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabClick(tab)}
                  className={`font-sans text-xs tracking-[0.2em] uppercase font-semibold transition-colors hover:text-black relative py-2 cursor-pointer ${
                    isTabActive
                      ? 'text-black font-black'
                      : 'text-neutral-400'
                  }`}
                >
                  {tab.label}
                  {isTabActive && (
                    <motion.span
                      layoutId="headerActiveTab"
                      className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Right Side: Instagram & Shopping Bag */}
          <div className="flex items-center space-x-5 text-neutral-700">
            
            {/* Instagram Logo */}
            <motion.a
              whileHover={{ scale: 1.2, rotate: 8 }}
              whileTap={{ scale: 0.85 }}
              href="https://instagram.com/_rix.visuals_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 relative inline-flex items-center justify-center transition-transform cursor-pointer"
              aria-label="Visit real Instagram feed"
              title="Real Instagram Feed"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="realInstaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#realInstaGrad)" strokeWidth="2.4"/>
                <circle cx="12" cy="12" r="4.2" stroke="url(#realInstaGrad)" strokeWidth="2.4"/>
                <circle cx="17.5" cy="6.5" r="1.3" fill="url(#realInstaGrad)"/>
              </svg>
            </motion.a>

            {/* Shopping Bag Icon -> Active Print Requests */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenCartInfo}
              className="hover:text-black transition-colors p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 relative cursor-pointer"
              aria-label="Active print requests list"
            >
              <ShoppingBag size={19} strokeWidth={2} />
              {printRequestsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-600 to-pink-600 text-white text-[10px] font-mono rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-bounce"
                >
                  {printRequestsCount}
                </motion.span>
              )}
            </motion.button>

          </div>
        </div>
      </header>
    </>
  );
}

