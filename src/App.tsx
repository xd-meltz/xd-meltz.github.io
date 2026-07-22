/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Globe, ArrowRight, Instagram, Youtube, Mail, Cpu, Eye, ExternalLink, X, ShoppingBag } from 'lucide-react';
import Header from './components/Header';
import Gallery from './components/Gallery';
import About from './components/About';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import PrintInquiry from './components/PrintInquiry';
import { Inquiry } from './types';
import { photosData, aboutContent } from './data';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [preFilledPhoto, setPreFilledPhoto] = useState<string | null>(null);
  const [inboxCount, setInboxCount] = useState<number>(0);
  const [inquiriesUpdatedTrigger, setInquiriesUpdatedTrigger] = useState<number>(0);
  
  // Localized state for the hero image to support custom upload directly
  const [userHeroImg, setUserHeroImg] = useState<string>(() => {
    return localStorage.getItem('rixvisuals_hero_image') || aboutContent.avatarUrl || '/avatar.jpg';
  });

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setUserHeroImg(base64Data);
        localStorage.setItem('rixvisuals_hero_image', base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetHeroImage = () => {
    setUserHeroImg(aboutContent.avatarUrl || '/avatar.jpg');
    localStorage.removeItem('rixvisuals_hero_image');
  };
  
  // Search parameters for gallery items
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Cart/Shopping Bag tracker for bespoke prints
  const [printCart, setPrintCart] = useState<{ title: string; imageUrl?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Sync inbox counts for unread badge
  const updateInboxBadgeCount = () => {
    try {
      const rawInquiries = localStorage.getItem('rixvisuals_inbox');
      if (rawInquiries) {
        const parsed: Inquiry[] = JSON.parse(rawInquiries);
        const unreadCount = parsed.filter((item) => item.status === 'unread').length;
        setInboxCount(unreadCount);
      } else {
        setInboxCount(0);
      }
    } catch (err) {
      console.error('Error parsing localStorage badge counts:', err);
    }
  };

  useEffect(() => {
    updateInboxBadgeCount();
    // Load print cart from local storage
    const savedCart = localStorage.getItem('rixvisuals_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((item: any) => {
            if (typeof item === 'string') {
              return { title: item };
            }
            return item;
          });
          setPrintCart(sanitized);
        }
      } catch (err) {
        console.error('Error parsing cart from storage:', err);
      }
    }
  }, [inquiriesUpdatedTrigger]);

  const handleOrderPrint = (photoTitle: string, imageUrl?: string) => {
    // Add to cart bag avoiding duplicates
    const filtered = printCart.filter(item => item.title !== photoTitle);
    const updatedCart = [...filtered, { title: photoTitle, imageUrl }];
    setPrintCart(updatedCart);
    localStorage.setItem('rixvisuals_cart', JSON.stringify(updatedCart));

    setIsCartOpen(true);
  };

  const handleInquiriesUpdated = () => {
    setInquiriesUpdatedTrigger((prev) => prev + 1);
  };

  const handleRemoveCartItem = (title: string) => {
    const updated = printCart.filter((item) => item.title !== title);
    setPrintCart(updated);
    localStorage.setItem('rixvisuals_cart', JSON.stringify(updated));
    if (preFilledPhoto === title) {
      setPreFilledPhoto(updated.length > 0 ? updated[0].title : null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col justify-between" id="approot">
      
      {/* Dynamic Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        inboxCount={inboxCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        printRequestsCount={printCart.length}
        onOpenCartInfo={() => {
          setActiveTab('print-inquiry');
          setShowDashboard(false);
          setIsCartOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* Dynamic State Layout (Owner Dashboard takes priority if on) */}
        {showDashboard ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              inquiriesUpdatedTrigger={inquiriesUpdatedTrigger}
              onInquiriesUpdated={handleInquiriesUpdated}
            />
          </motion.div>
        ) : (
          <div>
            
            {/* Visual Screen switcher using React states */}
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  
                  {/* BRAND HERO SECTION (Drawn 1:1 to exact layout in the screenshot upload) */}
                  <section className="bg-white py-12 md:py-24" id="brand-hero-section">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                      
                      {/* Left Column: Image of Igor with high-speed focus (matching photo dimensions & corners) */}
                      <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm bg-neutral-100">
                        <img
                          src={userHeroImg}
                          alt="Igor - Automotive Photographer & Lead Director"
                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-700 ease-out"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Right Column: Giant display typography matching screenshot exactly */}
                      <div className="space-y-8 text-left">
                        <h1 className="font-sans text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]" style={{ wordBreak: 'keep-all' }}>
                          Hi, I'm Igor - a photographer and content creator with a huge passion for cars.
                        </h1>
                        
                        <div>
                          <button
                            onClick={() => setActiveTab('portfolio')}
                            className="font-sans text-xs tracking-widest border border-neutral-300 hover:border-black text-neutral-800 hover:text-black py-3 px-8 rounded-full transition-all duration-300 bg-transparent hover:bg-neutral-50/50 uppercase font-semibold"
                          >
                            View products
                          </button>
                        </div>
                      </div>

                    </div>
                  </section>

                  {/* WHO IS RIXVISUALS SECTION (Image 1 layout matching 1:1) */}
                  <section className="py-20 bg-white border-t border-neutral-100" id="who-is-section">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                    
                      {/* Left Column: Overlapping images simulating Ben's gorgeous Life Through Optics template */}
                      <div className="lg:col-span-6 flex justify-center lg:justify-start">
                        <div className="relative w-full max-w-[480px] h-[450px] sm:h-[550px]">
                          
                          {/* Back Image (Driver steering cockpit perspective) */}
                          <div className="absolute right-0 top-4 w-[60%] aspect-[3/4] overflow-hidden rounded-2xl shadow-xl border border-neutral-100 z-10 transition-transform hover:scale-102">
                            <img
                              src={aboutContent.portfolioOwnerPhotoRight}
                              alt="First person perspective driver"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Front Image (Green Alfa Romeo Quadrifoglio on a forest route) */}
                          <div className="absolute left-0 bottom-4 w-[65%] aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border-4 border-white z-20 transition-transform hover:scale-102">
                            <img
                              src={aboutContent.portfolioOwnerPhotoLeft}
                              alt="Alfa Romeo Giulia green racer"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Melbourne geolocation signature coordinate badge */}
                          <div className="absolute bottom-10 right-4 bg-black text-white font-mono text-[9px] tracking-[0.25em] px-4 py-2 border border-neutral-800 rounded z-30 shadow-lg">
                            37.8136° S, 144.9631° E
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Bio text matching screenshot font, spacing and weight exactly */}
                      <div className="lg:col-span-6 space-y-6 text-left">
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 font-sans leading-none">
                          {aboutContent.storyTitle}
                        </h2>
                        
                        <div className="space-y-5 text-neutral-700 font-sans text-sm sm:text-base leading-relaxed font-light pt-4 border-neutral-100">
                          {aboutContent.paragraphs.map((p, idx) => (
                            <p key={idx} className={idx === 1 || idx === 2 ? "font-normal text-neutral-900" : ""}>
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>

                    </div>
                  </section>

                </motion.div>
              )}

              {activeTab === 'portfolio' && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="py-6">
                    <Gallery 
                      onOrderPrint={handleOrderPrint} 
                      searchQuery={searchQuery}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <Contact
                    preFilledPhotoTitle={preFilledPhoto}
                    clearPreFilledPhoto={() => setPreFilledPhoto(null)}
                    onNewInquirySubmitted={handleInquiriesUpdated}
                  />
                </motion.div>
              )}

              {activeTab === 'print-inquiry' && (
                <motion.div
                  key="print-inquiry"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <PrintInquiry
                    cartItems={printCart}
                    onRemoveItem={handleRemoveCartItem}
                    onNavigateToPortfolio={() => setActiveTab('portfolio')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </main>

      {/* Aesthetic Minimalist Footer */}
      <footer className="bg-white border-t border-neutral-100 py-12" id="main-footer">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-sans text-xs sm:text-sm font-bold tracking-[0.25em] text-neutral-800 uppercase">
            Copyright 2026 Rixvisuals
          </p>
        </div>
      </footer>

      {/* Shopping Cart Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-100"
              >
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                    <div className="flex items-center gap-2 text-black">
                      <ShoppingBag size={18} />
                      <h3 className="font-sans font-bold text-sm tracking-widest uppercase">
                        Active Print Requests
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-neutral-400 hover:text-black p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {printCart.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <p className="text-xs text-neutral-400 font-mono tracking-wider">
                        YOUR PRINT SELECTIONS ARE CURRENTLY EMPTY
                      </p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          const el = document.getElementById('gallery-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-mono text-black underline uppercase tracking-widest font-bold"
                      >
                        Explore Captures
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-500 font-sans font-light leading-relaxed">
                        The following masterpieces have been selected for bespoke framing queries. Click on any item below to load its booking parameters.
                      </p>
                      
                      <div className="space-y-3">
                        {printCart.map((item) => {
                          const photo = photosData.find((p) => p.title === item.title);
                          return (
                            <div key={item.title} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex gap-4 items-center justify-between">
                              <div className="flex items-center gap-3">
                                {(photo?.imageUrl || item.imageUrl) && (
                                  <div className="w-12 h-8 rounded overflow-hidden border border-neutral-200">
                                    <img src={photo?.imageUrl || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-neutral-900">
                                    {item.title}
                                  </h4>
                                  <span className="text-[10px] text-neutral-400 font-mono block">Museum Cotton Baryta Rag</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveCartItem(item.title)}
                                className="text-xs font-mono text-red-500 hover:text-red-700 underline uppercase"
                              >
                                REMOVE
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {printCart.length > 0 && (
                  <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-4">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setActiveTab('print-inquiry');
                        setShowDashboard(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-black text-white py-3.5 font-mono text-xs tracking-widest font-bold hover:bg-neutral-800 transition-colors uppercase rounded"
                    >
                      PROCEED TO PRINT INQUIRY Form
                    </button>
                    <p className="text-[10px] text-neutral-400 font-mono text-center tracking-wide">
                      Pricing and frame sizes are hand-calculated per client location.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
