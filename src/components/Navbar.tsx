import React, { useState, useEffect } from "react";
import { Coffee, Clock, Compass, HelpCircle, Menu, X, MapPin, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StellosLogo from "./Logo";

interface NavbarProps {
  onScrollTo: (elementId: string) => void;
}

export default function Navbar({ onScrollTo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sastTime, setSastTime] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      // Calculate South Africa Standard Time (UTC+2)
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const sast = new Date(utc + 3600000 * 2);
      setSastTime(sast);

      const day = sast.getDay();
      const hours = sast.getHours();
      const mins = sast.getMinutes();
      const totalMins = hours * 60 + mins;

      let open = false;
      if (day !== 0) { // Not Sunday
        if (day === 6) { // Saturday: 08:00 - 14:00
          open = totalMins >= 8 * 60 && totalMins < 14 * 60;
        } else { // Monday - Friday: 07:00 - 17:00
          open = totalMins >= 7 * 60 && totalMins < 17 * 60;
        }
      }
      setIsOpen(open);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const navItems = [
    { label: "Our Menu", id: "section-menu" },
    { label: "Our Story", id: "section-story" },
    { label: "Location", id: "section-location" },
    { label: "Contact", id: "section-contact" },
  ];

  const handleNavClick = (id: string, isMobile: boolean = false) => {
    if (isMobile) {
      setMobileMenuOpen(false);
      setTimeout(() => {
        onScrollTo(id);
      }, 320); // Wait for the mobile menu exit height-collapse transition to complete
    } else {
      onScrollTo(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#F7F4F0] border-b-2 border-espresso-950 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNavClick("root")}>
            <StellosLogo iconClassName="w-11 h-11 text-espresso-950 transition-transform group-hover:scale-105 duration-300" variant="dark" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="font-serif italic font-semibold text-base text-espresso-800 hover:text-espresso-950 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-espresso-950 after:transition-all after:duration-300 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Time & Live Indicator */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Stellenbosch Local Clock */}
            {sastTime && (
              <div className="flex items-center gap-2 border border-espresso-950 px-3.5 py-1.5 bg-[#FAF8F5]">
                <Clock className="w-3.5 h-3.5 text-espresso-950 animate-pulse" />
                <span className="font-mono text-xs font-semibold text-espresso-950">
                  Stellenbosch: {formatTime(sastTime)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isOpen ? "bg-emerald-950 text-emerald-50 border border-emerald-900" : "bg-red-100 text-red-800 border border-red-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isOpen ? "bg-emerald-400" : "bg-red-500"}`}></span>
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-espresso-950 text-espresso-950 hover:bg-[#1D1D1B] hover:text-[#F7F4F0] transition-colors cursor-pointer bg-[#FAF8F5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Responsive Menu Container with Animating Height */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-[#FAF8F5] border-b-2 border-espresso-950 overflow-hidden absolute top-20 left-0 right-0 shadow-2xl z-50"
          >
            <div className="px-4 py-6 space-y-5">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, true)}
                    className="w-full text-left font-serif italic font-semibold text-lg text-espresso-800 hover:text-espresso-950 py-3 border-b border-stone-200 cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <span>{item.label}</span>
                    <span className="text-stone-300 group-hover:text-espresso-950 transition-colors text-sm">→</span>
                  </button>
                ))}
              </div>

              {/* Mobile localized clock */}
              {sastTime && (
                <div className="flex items-center justify-between bg-white border border-espresso-950 p-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-espresso-950" />
                    <span className="font-mono text-xs font-semibold text-espresso-950">
                      Stellenbosch: {formatTime(sastTime)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isOpen ? "bg-emerald-950 text-emerald-50 border border-emerald-900" : "bg-red-100 text-red-800 border border-red-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isOpen ? "bg-emerald-400" : "bg-red-500"}`}></span>
                    {isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
