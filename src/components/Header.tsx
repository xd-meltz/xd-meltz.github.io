import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
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

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Signature Logo - Left */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveTab('home');
            if (setShowDashboard) setShowDashboard(false);
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-sans text-sm sm:text-xs font-black tracking-[0.28em] sm:tracking-[0.3em] text-black uppercase cursor-pointer"
        >
          RIXVISUALS
        </motion.button>

        {/* Desktop Navigation Links - Center */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
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
                    className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-black rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Right Actions: Instagram, Shopping Bag & Mobile Hamburger */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-neutral-800">
          
          {/* Instagram Link Button */}
          <motion.a
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            href="https://instagram.com/_rix.visuals_"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-800"
            aria-label="Instagram Feed"
            title="Instagram @_rix.visuals_"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="instaHeaderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instaHeaderGrad)" strokeWidth="2.4"/>
              <circle cx="12" cy="12" r="4.2" stroke="url(#instaHeaderGrad)" strokeWidth="2.4"/>
              <circle cx="17.5" cy="6.5" r="1.3" fill="url(#instaHeaderGrad)"/>
            </svg>
          </motion.a>

          {/* Print Requests Shopping Bag Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCartInfo}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black transition-colors relative cursor-pointer"
            aria-label="Active Print Requests"
          >
            <ShoppingBag size={18} strokeWidth={2} />
            {printRequestsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold"
              >
                {printRequestsCount}
              </motion.span>
            )}
          </motion.button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-neutral-100 text-black hover:bg-neutral-200 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown Panel - Identical clean white styling to PC */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-neutral-100 shadow-xl overflow-hidden"
          >
            <div className="px-6 py-6 space-y-3">
              {tabs.map((tab) => {
                const isTabActive = activeTab === tab.action && !showDashboard;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`w-full text-left font-sans text-xs font-bold tracking-[0.25em] py-3 px-4 rounded-xl transition-all uppercase flex items-center justify-between border ${
                      isTabActive
                        ? 'bg-black text-white border-black font-black'
                        : 'border-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isTabActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-sans">
                <a
                  href="https://instagram.com/_rix.visuals_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-neutral-800 hover:text-black uppercase tracking-wider flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-amber-500" />
                  <span>@_RIX.VISUALS_</span>
                </a>

                {printRequestsCount > 0 && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCartInfo();
                    }}
                    className="font-mono text-[11px] text-neutral-900 font-bold uppercase underline tracking-wider"
                  >
                    Cart ({printRequestsCount})
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
