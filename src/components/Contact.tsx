import React, { useState, useEffect } from 'react';
import { Mail, Calendar, MapPin, Send, CheckCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { Inquiry } from '../types';

interface ContactProps {
  preFilledPhotoTitle: string | null;
  clearPreFilledPhoto: () => void;
  onNewInquirySubmitted: () => void;
}

export default function Contact({
  preFilledPhotoTitle,
  clearPreFilledPhoto,
  onNewInquirySubmitted
}: ContactProps) {
  const WHATSAPP_NUMBER = "27619280584"; // Igor's direct WhatsApp number

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Private Photoshoot',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string>('');

  // Auto-fill from print request
  useEffect(() => {
    if (preFilledPhotoTitle) {
      setFormData((prev) => ({
        ...prev,
        subject: 'Custom Canvas Print',
        message: `Hi Igor, I would love to inquire about purchasing a bespoke custom canvas print of your work: "${preFilledPhotoTitle}". Please let me know the available framing dimensions, pricing tiers, and estimated shipping to my address.`
      }));
    }
  }, [preFilledPhotoTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim()) {
      alert('Please enter your Name, Email, and Inquiry Subject.');
      return;
    }

    setIsSubmitting(true);

    const messageText = formData.message.trim();
    const text = `Hi Igor,\n\nI am transmitting an official inquiry via RixVisuals:\n\n👤 Name: ${formData.name.trim()}\n📧 Email: ${formData.email.trim()}\n📌 Subject: ${formData.subject.trim()}${messageText ? `\n\n📝 Optical Brief / Message:\n${messageText}` : ''}${preFilledPhotoTitle ? `\n\n🖼️ Photo Choice: ${preFilledPhotoTitle}` : ''}`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    setLastWhatsAppUrl(waUrl);

    setTimeout(() => {
      // Build inquiry object
      const newInquiry: Inquiry = {
        id: 'inq_' + Math.random().toString(36).substring(2, 9),
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: messageText || '(No message included)',
        photoChoice: preFilledPhotoTitle || undefined,
        createdAt: new Date().toISOString(),
        status: 'unread'
      };

      // Retrieve existing entries from localStorage
      const existingInquiries: Inquiry[] = JSON.parse(localStorage.getItem('rixvisuals_inbox') || '[]');
      
      // Store back to localStorage
      localStorage.setItem('rixvisuals_inbox', JSON.stringify([newInquiry, ...existingInquiries]));

      // Open WhatsApp chat directly
      window.open(waUrl, '_blank');

      setIsSubmitting(false);
      setSubmitSuccess(true);
      clearPreFilledPhoto();
      
      // Notify parent to update badge counts/dashboard
      onNewInquirySubmitted();

      // Reset form fields
      setFormData({
        name: '',
        email: '',
        subject: 'Private Photoshoot',
        message: ''
      });
    }, 800);
  };

  return (
    <section className="py-20 bg-white" id="contact-section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Details Panel on Left */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 block uppercase mb-1">
                COMMISSION / HELLO
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 font-sans uppercase">
                LET'S SHAPE SPEEDS
              </h2>
              <div className="w-12 h-0.5 bg-black mt-3" />
            </div>

            <p className="text-sm text-neutral-500 font-sans font-light leading-relaxed">
              Available for bespoke automotive commercial campaigns, gallery feature license inquiries, collection documentation, and high-end framed print purchases.
            </p>

            <div className="space-y-6 font-sans text-xs text-neutral-600 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded text-neutral-700 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-0.5">BASE LOCATION</h4>
                  <p className="font-light">Stellenbosch, South Africa</p>
                  <p className="text-neutral-400 font-mono text-[10px]">Worldwide bookings accepted seasonally</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded text-neutral-700 mt-0.5">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-0.5">DIRECT WHATSAPP</h4>
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-light underline hover:text-black transition-colors"
                  >
                    +27 61 928 0584
                  </a>
                  <p className="text-neutral-400 font-mono text-[10px]">Instant optical dispatch via WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded text-neutral-700 mt-0.5">
                  <Mail size={15} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-0.5">DIRECT EMAIL</h4>
                  <a href="mailto:igorrix344@gmail.com" className="font-light underline hover:text-black transition-colors">
                    igorrix344@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded text-neutral-700 mt-0.5">
                  <Clock size={15} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-0.5">TYPICAL DISPATCH</h4>
                  <p className="font-light">Replies within 24-48 business hours.</p>
                  <p className="text-neutral-400 font-mono text-[10px]">All glass is pre-calibrated before bookings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form on Right */}
          <div className="lg:col-span-7 bg-white p-8 border border-neutral-100 shadow-sm rounded-2xl relative" id="contact-form-container">
            {submitSuccess ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 uppercase font-sans">
                  INQUIRY TRANSMITTED VIA WHATSAPP
                </h3>
                <p className="text-xs text-neutral-500 font-sans font-light max-w-sm mx-auto leading-relaxed">
                  Thank you! Your official inquiry has been generated and dispatched to Igor's direct WhatsApp line (+27 61 928 0584).
                </p>
                
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  {lastWhatsAppUrl && (
                    <a
                      href={lastWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto font-mono text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>OPEN WHATSAPP CHAT</span> <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="w-full sm:w-auto font-mono text-xs tracking-widest border border-neutral-200 hover:border-black text-neutral-600 hover:text-black px-6 py-3 rounded-lg transition-all"
                  >
                    NEW INQUIRY
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name-input" className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                      YOUR FULL NAME *
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Julian Vance"
                      className="w-full text-sm font-sans px-4 py-3 border border-neutral-200 focus:border-black focus:ring-0 rounded-lg outline-none transition-all placeholder:text-neutral-300"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email-input" className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. vance@performance.com"
                      className="w-full text-sm font-sans px-4 py-3 border border-neutral-200 focus:border-black focus:ring-0 rounded-lg outline-none transition-all placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                {/* Subject / Purpose field */}
                <div className="space-y-2">
                  <label htmlFor="subject-input" className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                    INQUIRY DEPT / SUBJECT *
                  </label>
                  <select
                    id="subject-input"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full text-sm font-sans px-4 py-3 border border-neutral-200 focus:border-black focus:ring-0 rounded-lg bg-white outline-none transition-all"
                  >
                    <option value="Private Photoshoot">Private Photoshoot</option>
                    <option value="Custom Canvas Print">Custom Canvas Print</option>
                    <option value="Commercial Campaign">Commercial Campaign</option>
                    <option value="Gallery Licensing">Gallery Licensing</option>
                  </select>
                </div>

                {/* Message field (OPTIONAL) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="message-input" className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                      OPTICAL BRIEF / MESSAGE
                    </label>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">(OPTIONAL)</span>
                  </div>
                  <textarea
                    id="message-input"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your automotive machine, location, deadline or print frame dimensions..."
                    className="w-full text-sm font-sans px-4 py-3 border border-neutral-200 focus:border-black focus:ring-0 rounded-lg outline-none transition-all placeholder:text-neutral-300 resize-y"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-mono text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl transition-all uppercase font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      CONNECTING TO WHATSAPP...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      TRANSMIT OFFICIAL INQUIRY VIA WHATSAPP
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

