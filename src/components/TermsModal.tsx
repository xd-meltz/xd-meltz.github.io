import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, CheckSquare, Square, FileText, ArrowDown } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onAccept, onClose }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 35) {
      setHasScrolledToBottom(true);
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAccepted(false);
      setHasScrolledToBottom(false);
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          const { scrollHeight, clientHeight } = scrollContainerRef.current;
          if (scrollHeight <= clientHeight + 30) {
            setHasScrolledToBottom(true);
          }
        }
      }, 200);

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const termsList = [
    "No refunds will be issued under any circumstances.",
    "If Rix Compound closes due to unsafe weather conditions, bookings will be rescheduled to the next available suitable date.",
    "All riders must arrive 15 minutes before their booking time. Riding time starts at the scheduled time, and late arrivals will not receive extra time.",
    "All pit bike riders must have prior experience riding on dirt and changing gears (semi-automatic / clutch manual). Beginners who cannot ride on dirt or change gears are strictly NOT permitted on rental pit bikes.",
    "Riders must be 14 years or older and weigh 100 kg or less.",
    "Children under 14 with no riding experience may only ride as a passenger on a Rix Compound ATV with a parent or legal guardian, and only with prior management approval.",
    "One rider per rental vehicle. Sharing is strictly prohibited.",
    "If a rider falls twice, the rental will be stopped immediately without refund.",
    "Reckless or dangerous riding will result in the immediate termination of the ride without refund.",
    "I accept full responsibility for any loss or damage to Rix Compound’s bikes, ATVs, equipment, or property caused by myself or anyone in my booking. All repair or replacement costs must be paid before leaving the premises.",
    "I understand that all activities are undertaken entirely at my own risk. Rix Compound, its owners, management, and staff shall not be liable for any injury, loss, theft, damage, or death, except where required by law."
  ];

  const handleConfirm = () => {
    if (accepted && hasScrolledToBottom) {
      onAccept();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-950 text-white overflow-hidden animate-fade-in select-none">
      {/* Top Accent Line */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 flex-shrink-0" />

      {/* Full-Screen Modal Header */}
      <header className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/95 flex-shrink-0 flex items-center justify-between">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-400">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-sans text-base sm:text-xl font-black uppercase text-white tracking-tight italic">
                Terms & Conditions
              </h2>
              <p className="text-[10px] sm:text-xs font-sans text-zinc-400 uppercase tracking-wider font-extrabold">
                Rix Compound Safety & Rental Agreement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Terms Content */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-950"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="p-3 sm:p-4 bg-zinc-900/80 border border-zinc-800 text-xs sm:text-sm font-sans font-bold text-zinc-300">
            Please read the agreement below carefully before proceeding to your track booking. You must scroll through the conditions to enable agreement acceptance.
          </div>

          <ul className="space-y-3.5 sm:space-y-4 font-sans text-sm sm:text-base text-zinc-200 leading-relaxed">
            {termsList.map((term, index) => (
              <li key={index} className="flex items-start gap-3 bg-zinc-900/40 p-3 sm:p-4 border border-zinc-800/80">
                <span className="text-emerald-400 font-black flex-shrink-0 text-base sm:text-lg">•</span>
                <span className="text-zinc-200 font-bold">{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Scroll Indicator Prompt if not at bottom */}
      {!hasScrolledToBottom && (
        <div className="px-4 py-2 bg-amber-950/80 border-t border-amber-800 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm font-sans font-bold text-amber-200">
            <span className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
              Scroll to the bottom of the terms to enable acceptance
            </span>
            <button
              type="button"
              onClick={scrollToBottom}
              className="text-xs font-black uppercase underline hover:text-white cursor-pointer flex-shrink-0"
            >
              Scroll Down
            </button>
          </div>
        </div>
      )}

      {/* Acceptance Footer */}
      <footer className="p-4 sm:p-6 bg-zinc-900/95 border-t border-zinc-800 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <label 
            onClick={() => {
              if (hasScrolledToBottom) {
                setAccepted(!accepted);
              }
            }}
            className={`flex items-start gap-3 select-none ${
              hasScrolledToBottom ? 'cursor-pointer group' : 'cursor-not-allowed opacity-60'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0 text-emerald-400">
              {accepted && hasScrolledToBottom ? (
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-500 text-black" />
              ) : (
                <Square className={`w-5 h-5 sm:w-6 sm:h-6 ${hasScrolledToBottom ? 'text-zinc-500 group-hover:text-emerald-400' : 'text-zinc-700'} transition-colors`} />
              )}
            </div>
            <span className="text-xs sm:text-sm font-sans font-black text-zinc-200 leading-normal">
              I confirm that the information provided is true and correct and that I voluntarily accept these Terms & Conditions.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-zinc-950 border border-zinc-700 text-zinc-300 font-sans text-xs sm:text-sm uppercase tracking-wider font-black hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!accepted || !hasScrolledToBottom}
              onClick={handleConfirm}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 font-sans text-xs sm:text-sm uppercase tracking-wider font-black transition-all flex items-center gap-2 cursor-pointer ${
                accepted && hasScrolledToBottom
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
              }`}
            >
              <span>I Agree & Proceed to Booking</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
