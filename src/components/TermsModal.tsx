import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, CheckSquare, Square, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onAccept, onClose }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAccepted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const termsList = [
    "No refunds will be issued under any circumstances.",
    "If Rix Compound closes due to unsafe weather conditions, bookings will be rescheduled to the next available suitable date.",
    "All riders must arrive 15 minutes before their booking time. Riding time starts at the scheduled time, and late arrivals will not receive extra time.",
    "All riders must have prior dirt bike riding experience. Beginners are not permitted on rental pit bikes.",
    "Riders must be 14 years or older and weigh 100 kg or less.",
    "Children under 14 with no riding experience may only ride as a passenger on a Rix Compound ATV with a parent or legal guardian, and only with prior management approval.",
    "One rider per rental vehicle. Sharing is strictly prohibited.",
    "If a rider falls twice, the rental will be stopped immediately without refund.",
    "Reckless or dangerous riding will result in the immediate termination of the ride without refund.",
    "I accept full responsibility for any loss or damage to Rix Compound’s bikes, ATVs, equipment, or property caused by myself or anyone in my booking. All repair or replacement costs must be paid before leaving the premises.",
    "I understand that all activities are undertaken entirely at my own risk. Rix Compound, its owners, management, and staff shall not be liable for any injury, loss, theft, damage, or death, except where required by law."
  ];

  const handleConfirm = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-zinc-950 border border-emerald-500/40 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-base sm:text-lg font-black uppercase text-white tracking-wider italic">
                Terms & Conditions
              </h2>
              <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                Please read and accept before proceeding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed border-b border-zinc-800 bg-zinc-950/80">
          <ul className="space-y-3">
            {termsList.map((term, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="text-zinc-300 font-medium">{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acceptance Footer */}
        <div className="p-4 sm:p-6 bg-zinc-900/80 flex flex-col gap-4">
          <label 
            onClick={() => setAccepted(!accepted)}
            className="flex items-start gap-3 cursor-pointer select-none group"
          >
            <div className="mt-0.5 flex-shrink-0 text-emerald-400">
              {accepted ? (
                <CheckSquare className="w-5 h-5 fill-emerald-500 text-black" />
              ) : (
                <Square className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              )}
            </div>
            <span className="text-xs font-mono font-bold text-zinc-200 group-hover:text-white transition-colors leading-normal">
              I confirm that the information provided is true and correct and that I voluntarily accept these Terms & Conditions.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-wider font-bold hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!accepted}
              onClick={handleConfirm}
              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                accepted 
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
              }`}
            >
              <span>I Agree & Proceed to Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
