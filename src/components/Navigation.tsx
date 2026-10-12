import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { navigateTo } from '../App';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'ticket' | 'mybookings'>('home');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam === 'ticket') {
      setCurrentPage('ticket');
    } else if (pageParam === 'booking') {
      setCurrentPage('booking');
    } else if (pageParam === 'mybookings') {
      setCurrentPage('mybookings');
    }

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.page) {
        setCurrentPage(customEvent.detail.page);
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { name: string; href: string; page?: string }) => {
    e.preventDefault();
    if (link.page) {
      navigateTo(link.page as any);
    } else {
      if (currentPage !== 'home') {
        navigateTo('home');
        setTimeout(() => {
          const targetId = link.href.replace('#', '');
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const targetId = link.href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'The Track', href: '#track' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'My Bookings', href: '?page=mybookings', page: 'mybookings' },
    { name: 'About & Contact', href: '#about' },
  ];

  return (
    <>
      {/* Hidden SVG Filter for Instagram Gradient */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <linearGradient id="ig-nav-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="20%" stopColor="#f09433" />
            <stop offset="40%" stopColor="#e6683c" />
            <stop offset="60%" stopColor="#dc2743" />
            <stop offset="80%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
      </svg>

      <nav
        id="mainNav"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b bg-zinc-950/90 backdrop-blur-md ${
          isScrolled
            ? 'border-zinc-800 shadow-xl py-2.5'
            : 'border-zinc-800/80 py-3.5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Brand Logo & Monogram Container */}
          <a
            href="#home"
            onClick={(e) => {
              if (currentPage !== 'home') {
                e.preventDefault();
                navigateTo('home');
              }
            }}
            className="flex items-center gap-2.5 group z-10 scale-90 sm:scale-100 origin-left"
          >
            {/* Real isolated RC Monogram */}
            <div className="relative h-8 sm:h-9 flex items-center justify-center flex-shrink-0 bg-white/10 p-1 border border-zinc-700/60">
              <img 
                src="/rc-monogram.png" 
                alt="Rix Compound RC Monogram"
                className="h-7 sm:h-8 w-auto object-contain block invert"
              />
            </div>
            
            {/* Wordmark next to the Monogram */}
            <div className="flex flex-col justify-center leading-none">
              <span className="font-sans font-black text-sm sm:text-base uppercase italic tracking-wider text-white leading-tight">
                RIX <span className={currentPage === 'booking' ? 'text-emerald-400' : 'text-brand-light'}>COMPOUND</span>
              </span>
              <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-zinc-400 font-extrabold leading-none mt-0.5">
                JUNIOR MX & PIT BIKE TRACK
              </span>
            </div>
          </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link)}
              className="text-xs xl:text-sm font-sans tracking-wide uppercase text-zinc-300 hover:text-white transition-colors whitespace-nowrap font-bold"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => navigateTo('booking')}
            className="px-3.5 py-1.5 bg-emerald-500 text-black font-sans text-xs sm:text-sm font-black tracking-wider uppercase hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            Book Now
          </button>
          <a
            href="https://www.instagram.com/rix.compound.mini.dirt.track?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="p-1 hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0"
            title="Instagram"
          >
            <Instagram className="w-4.5 h-4.5" stroke="url(#ig-nav-gradient)" />
          </a>
        </div>

        {/* Mobile / Tablet Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <a
            href="https://www.instagram.com/rix.compound.mini.dirt.track?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="p-1.5 hover:scale-110 transition-transform flex items-center justify-center"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" stroke="url(#ig-nav-gradient)" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-200 hover:text-white focus:outline-none p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950/98 border-b border-zinc-800 shadow-2xl flex flex-col p-5 gap-3.5 z-40">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavLinkClick(e, link);
              }}
              className="text-sm font-sans font-bold tracking-wider uppercase text-zinc-200 hover:text-white py-1"
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-zinc-800 my-1" />
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigateTo('booking');
            }}
            className="w-full text-center py-2.5 bg-emerald-500 text-black font-sans text-xs sm:text-sm font-black tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            Book Track Slot
          </button>
        </div>
      )}
    </nav>
    </>
  );
}
