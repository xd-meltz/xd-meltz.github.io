/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { navigateTo } from '../App';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'ticket' | 'mybookings'>('home');

  useEffect(() => {
    // Sync current page on load
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

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { name: string; href: string; page?: string }) => {
    triggerTurbo();
    e.preventDefault();
    if (link.page) {
      navigateTo(link.page as any);
    } else {
      if (currentPage !== 'home') {
        navigateTo('home');
        // Scroll to the targeted section after a tiny timeout to let the home page mount
        setTimeout(() => {
          const targetId = link.href.replace('#', '');
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 250);
      } else {
        const targetId = link.href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Sprocket & Chain Animation Refs
  const bigSprocketRef = useRef<SVGGElement>(null);
  const smallSprocketRef = useRef<SVGGElement>(null);
  const chainRef = useRef<SVGPathElement>(null);

  const angleRef = useRef(0);
  const speedRef = useRef(0.43); // base target speed: ~0.43 degrees per frame
  const targetSpeed = 0.43;

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      // Smooth deceleration back to base speed
      if (speedRef.current > targetSpeed) {
        speedRef.current = speedRef.current - (speedRef.current - targetSpeed) * 0.03; // decay factor
        if (speedRef.current - targetSpeed < 0.01) {
          speedRef.current = targetSpeed;
        }
      }

      // Rotate/Move
      angleRef.current = (angleRef.current + speedRef.current) % 360000;

      const bigAngle = angleRef.current;
      const smallAngle = bigAngle * (20 / 6.5);
      const chainOffset = (bigAngle / 360) * -127.5;

      // Apply style transforms directly to elements for performance
      if (bigSprocketRef.current) {
        bigSprocketRef.current.style.transform = `rotate(${bigAngle}deg)`;
      }
      if (smallSprocketRef.current) {
        smallSprocketRef.current.style.transform = `rotate(${smallAngle}deg)`;
      }
      if (chainRef.current) {
        chainRef.current.style.strokeDashoffset = `${chainOffset}px`;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const triggerTurbo = () => {
    speedRef.current = 6.5; // Instant high speed acceleration
  };

  useEffect(() => {
    let lastScrolled = false;
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'The Track', href: '#track' },
    { name: 'Pricing & Packages', href: '#pricing' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'My Bookings', href: '?page=mybookings', page: 'mybookings' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        id="mainNav"
        className={`fixed top-0 left-0 w-full z-50 transition-[height,background-color,border-color,box-shadow] duration-200 backdrop-blur-md ${
          isScrolled
            ? 'h-16 bg-neutral-950/95 border-b border-brand/20 shadow-lg shadow-black/40'
            : 'h-20 bg-neutral-950/40 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Profile Container */}
          <a
            href="#home"
            onClick={(e) => {
              triggerTurbo();
              if (currentPage !== 'home') {
                e.preventDefault();
                navigateTo('home');
              }
            }}
            className="relative w-[184px] h-12 flex-shrink-0 group z-10"
          >
            {/* Master Sprocket and Chain SVG Container */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" viewBox="0 0 184 48">
              {/* Mathematics for exact external tangents */}
              {(() => {
                const bigSprocketX = 24;
                const smallSprocketX = 94.5;
                const cy = 24;
                const r1 = 20; // Big sprocket radius
                const r2 = 6.5; // Small sprocket radius

                const d = smallSprocketX - bigSprocketX;
                const angleRad = Math.asin((r1 - r2) / d);
                const cosA = Math.cos(angleRad);
                const sinA = Math.sin(angleRad);

                // Tangents on Big Sprocket
                const tx1_top = bigSprocketX + r1 * sinA;
                const ty1_top = cy - r1 * cosA;
                const tx1_bot = bigSprocketX + r1 * sinA;
                const ty1_bot = cy + r1 * cosA;

                // Tangents on Small Sprocket
                const tx2_top = smallSprocketX + r2 * sinA;
                const ty2_top = cy - r2 * cosA;
                const tx2_bot = smallSprocketX + r2 * sinA;
                const ty2_bot = cy + r2 * cosA;

                // Closed path wrapping clockwise around both sprockets
                const pathD = `M ${tx1_top},${ty1_top} L ${tx2_top},${ty2_top} A ${r2},${r2} 0 0,1 ${tx2_bot},${ty2_bot} L ${tx1_bot},${ty1_bot} A ${r1},${r1} 0 1,1 ${tx1_top},${ty1_top}`;

                return (
                  <>
                    {/* 1. Underlying Inner Chain Plate (Dark Base Link Structure) */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#141414"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />

                    {/* 2. Outer Chain Plates / Rollers (Dashed Moving Line) */}
                    <path
                      ref={chainRef}
                      d={pathD}
                      fill="none"
                      stroke="#ff8c00"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="5 3.5"
                      style={{ willChange: 'stroke-dashoffset', transform: 'translate3d(0,0,0)' }}
                    />

                    {/* 3. Big Sprocket Group (Behind we go, centered at 24, 24) */}
                    <g ref={bigSprocketRef} style={{ transformOrigin: '24px 24px', willChange: 'transform', transform: 'translate3d(0,0,0)' }}>
                      {/* Sprocket Base Ring */}
                      <circle cx="24" cy="24" r="18" fill="none" stroke="#ff8c00" strokeWidth="1" className="opacity-90" />
                      <circle cx="24" cy="24" r="14.5" fill="none" stroke="#ff8c00" strokeWidth="0.75" className="opacity-75" />
                      
                      {/* Weight reduction drill holes */}
                      {Array.from({ length: 6 }).map((_, i) => {
                        const angle = (i * 360) / 6;
                        const rad = (angle * Math.PI) / 180;
                        return (
                          <circle
                            key={i}
                            cx={24 + 11 * Math.cos(rad)}
                            cy={24 + 11 * Math.sin(rad)}
                            r="1.75"
                            fill="none"
                            stroke="#ff8c00"
                            strokeWidth="0.75"
                            className="opacity-80"
                          />
                        );
                      })}

                      {/* Big sprocket high-visibility solid teeth */}
                      {Array.from({ length: 18 }).map((_, i) => {
                        const angle = (i * 360) / 18;
                        const angleWidth = 6.2;
                        const radBaseLeft = ((angle - angleWidth) * Math.PI) / 180;
                        const radBaseRight = ((angle + angleWidth) * Math.PI) / 180;
                        const radTip = (angle * Math.PI) / 180;
                        const rBase = 16.5;
                        const rTip = 22.0;
                        return (
                          <polygon
                            key={i}
                            points={`
                              ${24 + rBase * Math.cos(radBaseLeft)},${24 + rBase * Math.sin(radBaseLeft)}
                              ${24 + rTip * Math.cos(radTip)},${24 + rTip * Math.sin(radTip)}
                              ${24 + rBase * Math.cos(radBaseRight)},${24 + rBase * Math.sin(radBaseRight)}
                            `}
                            fill="#ff8c00"
                            className="opacity-100"
                          />
                        );
                      })}
                    </g>

                    {/* 4. Small Sprocket Group (Centered at 94.5, 24) */}
                    <g ref={smallSprocketRef} style={{ transformOrigin: '94.5px 24px', willChange: 'transform', transform: 'translate3d(0,0,0)' }}>
                      <circle cx="94.5" cy="24" r="5" fill="none" stroke="#ff8c00" strokeWidth="1" />
                      <circle cx="94.5" cy="24" r="2.5" fill="none" stroke="#ff8c00" strokeWidth="0.75" />
                      
                      {/* Small Sprocket Teeth */}
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 360) / 8;
                        const angleWidth = 14.5;
                        const radBaseLeft = ((angle - angleWidth) * Math.PI) / 180;
                        const radBaseRight = ((angle + angleWidth) * Math.PI) / 180;
                        const radTip = (angle * Math.PI) / 180;
                        const rBase = 4.25;
                        const rTip = 7.5;
                        return (
                          <polygon
                            key={i}
                            points={`
                              ${94.5 + rBase * Math.cos(radBaseLeft)},${24 + rBase * Math.sin(radBaseLeft)}
                              ${94.5 + rTip * Math.cos(radTip)},${24 + rTip * Math.sin(radTip)}
                              ${94.5 + rBase * Math.cos(radBaseRight)},${24 + rBase * Math.sin(radBaseRight)}
                            `}
                            fill="#ff8c00"
                            className="opacity-100"
                          />
                        );
                      })}
                    </g>

                    {/* 5. Mathematically aligned SVG typography */}
                    <text
                      x="83.5"
                      y="29.5"
                      textAnchor="end"
                      fill="#ffffff"
                      className="font-sans font-black text-[13px] sm:text-sm uppercase italic tracking-tight"
                    >
                      RIX <tspan fill="#ff8c00">C</tspan>
                    </text>

                    <text
                      x="105.5"
                      y="29.5"
                      textAnchor="start"
                      fill="#ff8c00"
                      className="font-sans font-black text-[13px] sm:text-sm uppercase italic tracking-tight"
                    >
                      MPOUND
                    </text>
                  </>
                );
              })()}
            </svg>

            {/* Profile Image - Centered exactly inside the Big Sprocket */}
            <img
              src="https://i.postimg.cc/GhTnJcSP/social-cat-instagram-instagram-5.jpg"
              alt="Rix Compound Logo"
              className="absolute left-[6px] top-[6px] w-[36px] h-[36px] rounded-full border-1.5 border-neutral-900 object-cover z-20 pointer-events-none"
            />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link)}
                className="relative px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-black rounded-full transition-all duration-300 overflow-hidden group"
              >
                {/* Background sliding hover effect */}
                <span className="absolute inset-0 bg-brand rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] z-[-1]" />
                <span className="relative z-10">{link.name}</span>
              </a>
            ))}
            <a
              href="https://www.instagram.com/rix.compound.mini.dirt.track?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="ml-2 p-2 text-neutral-300 hover:text-brand transition-colors rounded-full border border-neutral-800 hover:border-brand/40 bg-neutral-900/40"
              title="Follow @rix.compound.mini.dirt.track on Instagram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z"/>
              </svg>
            </a>
          </div>

          {/* Hamburger Mobile Toggle & Small Always-on Mobile Instagram Link */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="https://www.instagram.com/rix.compound.mini.dirt.track?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="p-2 text-neutral-300 hover:text-brand transition-colors rounded-full border border-neutral-850 bg-neutral-900/40"
              title="Follow @rix.compound.mini.dirt.track on Instagram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z"/>
              </svg>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-300 hover:text-brand focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-950/98 flex flex-col justify-start overflow-y-auto pt-24 pb-12 transition-all duration-500 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center gap-5 px-6 pb-6">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavLinkClick(e, link);
              }}
              className={`font-display text-2xl font-bold tracking-tight text-white hover:text-brand transition-all duration-300 flex items-center gap-2 ${
                mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: `${idx * 75}ms` }}
            >
              {link.name === 'Home' && <Home className="w-5 h-5 text-brand" />}
              <span>{link.name}</span>
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              triggerTurbo();
              navigateTo('booking');
            }}
            className={`mt-4 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wide rounded-full text-center w-full max-w-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer ${
              mobileMenuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            style={{ transitionDelay: `${navLinks.length * 75}ms` }}
          >
            Book Online
          </button>

          {/* Expanded Instagram link in Mobile Tray */}
          <a
            href="https://www.instagram.com/rix.compound.mini.dirt.track?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className={`inline-flex items-center gap-2 px-6 py-2 border border-neutral-800 hover:border-brand rounded-full text-xs font-mono tracking-wider uppercase text-neutral-300 transition-all ${
              mobileMenuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            style={{ transitionDelay: `${(navLinks.length + 1) * 75}ms` }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-brand">
              <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z"/>
            </svg>
            @rix.compound.mini.dirt.track
          </a>
        </div>
      </div>
    </>
  );
}
