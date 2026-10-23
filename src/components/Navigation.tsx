import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { navigateTo } from '../App';
import SprocketLogo from './SprocketLogo';

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
    { name: 'Pricing', href: '#pricing' },
    { name: 'The Tracks', href: '#track' },
    { name: 'Rider Requirements', href: '#rental-requirements' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'My Bookings', href: '?page=mybookings', page: 'mybookings' },
    { name: 'About & Contact', href: '#about' },
  ];

  return (
    <>
      {/* Hidden SVG Filter for Instagram Gradient (Red to Blue) */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <linearGradient id="ig-nav-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <nav
        id="mainNav"
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-xl"
      >
        <div className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'
        }`}>
          {/* Brand Logo: Animated Sprocket & Roller Chain */}
          <a
            href="#home"
            onClick={(e) => {
              if (currentPage !== 'home') {
                e.preventDefault();
                navigateTo('home');
              }
            }}
            className="flex items-center group z-10 origin-left hover:opacity-95 transition-opacity"
            title="Rix Compound Home"
          >
            {/* 
              USER LOGO NOTE:
              To replace the circle image inside the large drive sprocket,
              pass circleLogoSrc="/your-logo.png" or update circleLogoSrc in SprocketLogo.tsx!
            */}
            <SprocketLogo className="h-13 sm:h-16 w-auto" />
          </a>

        {/* Desktop Links (No Book Online Button At Top) */}
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

      {/* Mobile / Tablet Drawer (No Book Online Button) */}
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
        </div>
      )}
    </nav>
    </>
  );
}
