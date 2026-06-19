import React, { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Heart, Check, Send, Sparkles } from "lucide-react";
import { FeedbackFormInput } from "../types";
import StellosLogo from "./Logo";

export default function Footer() {
  const [feedback, setFeedback] = useState<FeedbackFormInput>({
    name: "",
    email: "",
    rating: 5,
    message: ""
  });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.message.trim()) {
      alert("Please fill in all the details before sending!");
      return;
    }
    // Simulate API call
    setFormSent(true);
    setFeedback({ name: "", email: "", rating: 5, message: "" });
    setTimeout(() => {
      setFormSent(false);
    }, 4000);
  };

  return (
    <footer id="section-contact" className="scroll-mt-24 bg-espresso-950 text-espresso-50 relative overflow-hidden pt-20 pb-10 border-t-2 border-espresso-900 cursor-default">
      <div className="absolute inset-0 bg-radial-at-b from-espresso-900/40 to-transparent pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left mb-16">
          
          {/* Logo Brand & Hours Column (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center">
              <StellosLogo iconClassName="w-11 h-11 text-espresso-50" variant="light" />
            </div>
            
            <p className="font-sans text-xs text-espresso-300 font-light leading-relaxed">
              Serving the finest micro-batch roasted coffees, gourmet hand-laminated croissants, and decadent cookies. Stop by early for class or lectures.
            </p>

            {/* Operating hours list */}
            <div className="space-y-2 border-t border-espresso-800 pt-5">
              <h4 className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold">Hours of Brewing</h4>
              <div className="space-y-1 font-sans text-xs text-espresso-200">
                <div className="flex justify-between">
                  <span>Monday — Friday</span>
                  <span className="font-mono font-semibold">07:00 AM — 17:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-mono font-semibold">08:00 AM — 14:00 PM</span>
                </div>
                <div className="flex justify-between border-t border-espresso-800/40 pt-1.5 mt-1.5 text-espresso-400">
                  <span>Sunday</span>
                  <span className="font-mono uppercase font-bold tracking-wider">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Column (Span 3) */}
          <div className="lg:col-span-3 space-y-6 lg:pl-4">
            <h4 className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold border-b border-espresso-800 pb-2">Get in touch</h4>
            
            <div className="space-y-4 font-sans text-xs text-espresso-200">
              {/* Address details */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-espresso-50 block">Our Location</span>
                  <p className="font-light text-espresso-300 mt-1 leading-normal">
                    44 Ryneveld St, Stellenbosch Central,<br />
                    Stellenbosch, 7600, South Africa
                  </p>
                </div>
              </div>
            </div>
            
            {/* Social handles */}
            <div className="pt-2">
              <span className="font-mono text-[9px] text-[#A67C52] block uppercase font-bold mb-2">Follow our updates</span>
              <a 
                href="https://www.instagram.com/stellos_coffee.co?igsh=cjFmaHdiazB0cmkx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-espresso-900 border border-espresso-800 hover:border-amber-400/50 hover:bg-espresso-850 px-3 py-1.5 rounded-lg text-espresso-200 hover:text-espresso-50 transition-all text-[11px]"
              >
                <Instagram className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-semibold">@stellos_coffee.co</span>
              </a>
            </div>
          </div>

          {/* Feedback & Barista Notes Column (Span 5) */}
          <div className="lg:col-span-5 space-y-4 bg-espresso-900/50 p-6 rounded-2xl border border-espresso-900 shadow-inner">
            <div className="flex gap-2 items-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-display font-bold text-sm text-espresso-50">Write to the Baristas</h4>
            </div>
            <p className="font-sans text-[11px] text-espresso-300 leading-normal font-light">
              We highly value suggestions or questions! Write a direct note to our Stellenbosch coffeemakers.
            </p>

            {formSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center space-y-2 animate-pulse">
                <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                <h5 className="font-display font-extrabold text-sm text-emerald-300">Note Sent to Counter!</h5>
                <p className="font-sans text-[11px] text-emerald-200 font-light">
                  Thank you for your warm words. We will read it at our morning briefing!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    className="bg-espresso-950/80 text-espresso-50 placeholder-espresso-400 px-3.5 py-2 rounded-xl text-xs font-sans border border-espresso-800 filter focus:outline-none focus:ring-1 focus:ring-amber-400 w-full"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    className="bg-espresso-950/80 text-espresso-50 placeholder-espresso-400 px-3.5 py-2 rounded-xl text-xs font-sans border border-espresso-800 filter focus:outline-none focus:ring-1 focus:ring-amber-400 w-full"
                  />
                </div>

                <div className="flex items-center justify-between bg-espresso-950/40 p-2.5 rounded-xl border border-espresso-800/40">
                  <label className="font-display text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Your Coffee Rating:</label>
                  <div className="flex gap-1.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, rating: s })}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${feedback.rating >= s ? "fill-amber-400" : "text-stone-500"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Type your message, query or croissant rating here..."
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className="bg-espresso-950/80 text-espresso-50 placeholder-espresso-400 px-3.5 py-2 rounded-xl text-xs font-sans border border-espresso-800 filter focus:outline-none focus:ring-1 focus:ring-amber-400 w-full resize-none"
                />

                <button
                  type="submit"
                  className="w-full cursor-pointer bg-amber-500 hover:bg-amber-600 font-display font-bold text-espresso-950 text-xs py-2.5 rounded-xl transition-all shadow shadow-amber-500/5 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Note To Shop</span>
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Footer Base bar */}
        <div className="border-t border-espresso-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-espresso-400">
          <p>© {new Date().getFullYear()} Stellos Coffee Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> for the Stellenbosch Community
          </p>
        </div>

      </div>
    </footer>
  );
}
