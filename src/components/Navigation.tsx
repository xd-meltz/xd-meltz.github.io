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
    { name: 'Pricing & Packages', href: '#pricing' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'My Bookings', href: '?page=mybookings', page: 'mybookings' },
    { name: 'About & Contact', href: '#about' },
  ];

  return (
    <>
      {/* Hidden SVG Filter for logo transparency & Instagram Gradient */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="transparent-logo" colorInterpolationFilters="sRGB">
            <feColorMatrix 
              type="matrix" 
              values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  -0.333 -0.333 -0.333 0 1" 
            />
          </filter>
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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b bg-[#121212] ${
          isScrolled
            ? 'border-neutral-800/70 shadow-lg shadow-neutral-950/20 py-2.5'
            : 'border-neutral-800/40 py-3.5'
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
            {/* Real isolated Monogram from the official Logo */}
            <div className="relative w-[52px] h-7 overflow-hidden bg-transparent flex-shrink-0">
              <img 
                src="https://i.postimg.cc/RV690snh/Rix-Compound-Logo-1.webp" 
                alt="Rix Compound RC Logo"
                className="absolute max-w-none"
                style={{ 
                  width: '69px',
                  height: '53px',
                  left: '-6.5px',
                  top: '-4.8px',
                  filter: 'url(#transparent-logo)',
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Wordmark next to the Monogram */}
            <div className="flex flex-col justify-center leading-none">
              <span className="font-sans font-black text-xs sm:text-sm uppercase italic tracking-wider text-[#F8F9FA] leading-tight">
                RIX <span className={currentPage === 'booking' ? 'text-emerald-500' : 'text-brand'}>COMPOUND</span>
              </span>
              <span className="font-mono text-[6px] sm:text-[7px] uppercase tracking-[0.16em] text-neutral-400 font-medium leading-none">
                JUNIOR MX & PIT BIKE TRACK
              </span>
            </div>
          </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link)}
              className="text-[11px] xl:text-xs font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => navigateTo('booking')}
            className="px-2.5 py-1 bg-emerald-500 text-black font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/10 whitespace-nowrap flex-shrink-0"
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
            <Instagram className="w-4 h-4" stroke="url(#ig-nav-gradient)" />
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
            <Instagram className="w-4.5 h-4.5" stroke="url(#ig-nav-gradient)" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-400 hover:text-white focus:outline-none p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#121212] border-b border-neutral-800 shadow-2xl flex flex-col p-5 gap-4 z-40">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavLinkClick(e, link);
              }}
              className="text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white py-1"
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-zinc-900 my-1" />
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigateTo('booking');
            }}
            className="w-full text-center py-2 bg-emerald-500 text-black font-mono text-[11px] font-bold tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/10"
          >
            Book Track Slot
          </button>
        </div>
      )}
    </nav>
    </>
  );
}
