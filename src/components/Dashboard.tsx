import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Database, Reply, RefreshCw, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { Inquiry } from '../types';

interface DashboardProps {
  inquiriesUpdatedTrigger: number;
  onInquiriesUpdated: () => void;
}

const DEFAULT_MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_mock1',
    name: 'Julian Vance',
    email: 'vance@apexcollectors.com',
    subject: 'Bespoke Print Order',
    message: 'Hey Igor, I saw your Porsche RWB "Shumokuzame" frame from Mount Donna Buang. I want to buy a large format signed physical cotton rag print. Do you do customized white oak wooden frames? It would look spectacular in my private gallery alongside our actual aircooled JDM collection.',
    photoChoice: 'PORSCHE RWB "SHUMOKUZAME"',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    status: 'unread'
  },
  {
    id: 'inq_mock2',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@classic-classica.org',
    subject: 'Commercial Photography',
    message: 'Hi RixVisuals team, we are organizing the Targa Classica Yarra Valley Event for next season. We absolutely loved your medium format aesthetics on the classic car rally. We would like to commission you for a complete official media campaign covering the main paddock, time trials, and bespoke driver portraits. Please send over your day-rate sheet and camera configuration limits.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    status: 'unread'
  },
  {
    id: 'inq_mock3',
    name: 'Kenji Sato',
    email: 'kenji.sato@shibuya-neons.co.jp',
    subject: 'Brand Collaboration',
    message: 'Greetings from Shibuya! We are launching a new street culture lifestyle book Series and want to license 3 of your wet-neon high-octane night JDM captures. Let\'s collaborate on a limited run publication. Let us know if you have licensing slots available for 2026.',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    status: 'replied'
  }
];

export default function Dashboard({
  inquiriesUpdatedTrigger,
  onInquiriesUpdated
}: DashboardProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [replyingInquiryId, setReplyingInquiryId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [repliedNotify, setRepliedNotify] = useState<string | null>(null);

  // Sync inquiries from localStorage
  const loadInquiries = () => {
    const raw = localStorage.getItem('rixvisuals_inbox');
    if (raw) {
      setInquiries(JSON.parse(raw));
    } else {
      setInquiries([]);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [inquiriesUpdatedTrigger]);

  const saveInquiries = (updated: Inquiry[]) => {
    localStorage.setItem('rixvisuals_inbox', JSON.stringify(updated));
    setInquiries(updated);
    onInquiriesUpdated(); // update trigger
  };

  const seedMockData = () => {
    saveInquiries(DEFAULT_MOCK_INQUIRIES);
  };

  const clearAllInquiries = () => {
    if (confirm('Are you sure you want to purge all inbox inquiry transcripts? This action is irreversible.')) {
      saveInquiries([]);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    const updated = inquiries.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    saveInquiries(updated);
  };

  const handleDelete = (id: string) => {
    const updated = inquiries.filter((item) => item.id !== id);
    saveInquiries(updated);
  };

  const handleOpenReply = (inquiry: Inquiry) => {
    setReplyingInquiryId(inquiry.id);
    setReplyMessage(`Hi ${inquiry.name.split(' ')[0]},\n\nThank you for reaching out to RixVisuals. Your brief for "${inquiry.subject}" sounds incredible.\n\n[Your custom response here...]\n\nBest regards,\nIgor\nRixVisuals Optics Lab`);
    if (inquiry.status === 'unread') {
      handleUpdateStatus(inquiry.id, 'read');
    }
  };

  const handleSendMockReply = (id: string) => {
    if (!replyMessage.trim()) return;
    
    const updated = inquiries.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'replied' as const };
      }
      return item;
    });
    
    saveInquiries(updated);
    setReplyingInquiryId(null);
    setRepliedNotify(`Mock reply email dispatched to the client.`);
    setTimeout(() => setRepliedNotify(null), 3500);
  };

  const filteredList = inquiries.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const counts = {
    all: inquiries.length,
    unread: inquiries.filter((i) => i.status === 'unread').length,
    read: inquiries.filter((i) => i.status === 'read').length,
    replied: inquiries.filter((i) => i.status === 'replied').length
  };

  return (
    <section className="py-12 bg-neutral-50 border-b border-neutral-100 min-h-[70vh]" id="dashboard-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Dashboard panel */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-neutral-200 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-lg">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-xl font-sans font-extrabold tracking-wider uppercase text-neutral-900">
                OWNER BRIEF PORTAL & INBOX
              </h2>
              <p className="text-[10px] font-mono tracking-widest text-neutral-400 mt-0.5">
                SECURE CLIENT CONVERSATIONS ENGINE (LOCAL MEMORY DIRECT)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={seedMockData}
              className="font-mono text-[10px] tracking-wider px-3.5 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 border border-neutral-800"
            >
              <RefreshCw size={11} />
              SEED DUMMY INBOX DATA
            </button>
            <button
              onClick={clearAllInquiries}
              className="font-mono text-[10px] tracking-wider px-3.5 py-2 rounded text-red-600 hover:text-white hover:bg-red-600 border border-red-100 hover:border-red-600 transition-all flex items-center gap-2"
            >
              <Trash2 size={11} />
              PURGE ALL IN BOX
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {repliedNotify && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-sans text-xs flex items-center gap-3 mb-6 animate-fade-in">
            <CheckCircle size={16} />
            <span>{repliedNotify}</span>
          </div>
        )}

        {/* Dashboard Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List Navigation Tabs left */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-5 border border-neutral-200 rounded-xl space-y-2">
              <h3 className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                MAILBOX FILTERS
              </h3>
              
              <div className="space-y-1 pt-2 font-mono text-xs">
                {(['all', 'unread', 'read', 'replied'] as const).map((filter) => {
                  const filterLabels = {
                    all: 'ALL DISPATCHES',
                    unread: 'UNREAD BRIEFS',
                    read: 'OPENED TRANSCRIPTS',
                    replied: 'REPLIED RECORDS'
                  };
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`w-full text-left px-3 py-2.5 rounded flex items-center justify-between tracking-wide transition-colors ${
                        activeFilter === filter
                          ? 'bg-neutral-950 text-white font-bold'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                      }`}
                    >
                      <span className="uppercase">{filterLabels[filter]}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        activeFilter === filter ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {counts[filter]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-neutral-900 text-neutral-400 p-5 border border-neutral-850 rounded-xl space-y-2 font-sans text-xs">
              <div className="flex items-center gap-1.5 text-orange-400 font-mono text-[10px] tracking-wider mb-2 font-bold">
                <ShieldAlert size={12} />
                ADMIN SECURITY NOTES
              </div>
              <p className="font-light leading-relaxed">
                This inbox represents live client forms stored inside the secure client sandboxed workspace via local storage mechanism keys.
              </p>
              <p className="font-light leading-relaxed">
                Test the client interface by filling out the Booking tab or requesting a bespoke print in the gallery – it will register instantly here.
              </p>
            </div>
          </div>

          {/* Messages Column right */}
          <div className="lg:col-span-9 space-y-6">
            {filteredList.length === 0 ? (
              <div className="bg-white p-16 text-center border border-neutral-200 rounded-xl space-y-3">
                <AlertCircle size={28} className="text-neutral-300 mx-auto" />
                <h3 className="font-sans font-bold text-sm tracking-widest text-neutral-700 uppercase">
                  NO DISPATCHES CURRENTLY FOUND
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans font-light leading-relaxed">
                  Seed some dynamic client records by clicking "SEED DUMMY INBOX DATA" above or head over to the Booking Form tab to submit a custom client pitch.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className={`bg-white border text-neutral-900 rounded-2xl shadow-sm transition-all relative overflow-hidden ${
                      inquiry.status === 'unread'
                        ? 'border-neutral-950 shadow-md ring-1 ring-black/5'
                        : 'border-neutral-200'
                    }`}
                    id={`dashboard-card-${inquiry.id}`}
                  >
                    {/* Unread subtle header glow */}
                    {inquiry.status === 'unread' && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-black" />
                    )}

                    {/* Card Content info */}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-sans font-bold text-sm text-neutral-900 tracking-wide">
                              {inquiry.name}
                            </h4>
                            <span className="text-neutral-300 font-light font-mono text-xs">|</span>
                            <span className="font-mono text-xs text-neutral-400">
                              {inquiry.email}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="font-sans text-xs font-semibold uppercase text-neutral-700">
                              {inquiry.subject}
                            </span>
                            {inquiry.photoChoice && (
                              <span className="bg-neutral-100 text-neutral-500 font-mono text-[9px] px-2 py-0.5 rounded tracking-wide font-medium">
                                PHOTO: {inquiry.photoChoice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="text-[10px] font-mono text-neutral-400">
                            {new Date(inquiry.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {/* Badge Status */}
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 uppercase border rounded ${
                            inquiry.status === 'unread'
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : inquiry.status === 'read'
                              ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                      </div>

                      {/* Message Pitch text block */}
                      <div className="bg-neutral-50/50 p-4 border border-neutral-100 rounded-xl text-xs sm:text-sm text-neutral-700 font-sans font-light leading-relaxed mb-4 whitespace-pre-line">
                        {inquiry.message}
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReply(inquiry)}
                            className="font-mono text-[10px] tracking-wider px-3 py-1.5 rounded text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 transition-colors flex items-center gap-1.5"
                          >
                            <Reply size={12} />
                            COMPOSE RESPONSE (MOCK)
                          </button>

                          {inquiry.status === 'unread' && (
                            <button
                              onClick={() => handleUpdateStatus(inquiry.id, 'read')}
                              className="font-mono text-[10px] tracking-wider px-3 py-1.5 rounded text-neutral-750 hover:bg-neutral-50 border border-neutral-200 transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle size={12} />
                              MARK VISITED
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="font-mono text-[10px] tracking-wider text-red-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          DELETE RECORD
                        </button>
                      </div>
                    </div>

                    {/* Compose Reply Drawer */}
                    {replyingInquiryId === inquiry.id && (
                      <div className="bg-neutral-950 text-white border-t border-neutral-900 p-6 space-y-4 animate-slide-down">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Reply size={14} className="text-cyan-400" />
                            <h5 className="font-sans font-bold text-xs tracking-wider uppercase text-white">
                              REPLY TO CLIENT: {inquiry.name}
                            </h5>
                          </div>
                          <button
                            onClick={() => setReplyingInquiryId(null)}
                            className="text-neutral-500 hover:text-white transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block">
                            PREPARED OUTCOMING DISPATCH COMPOSITION (EMAIL CLIENT ROUTE)
                          </label>
                          <textarea
                            value={replyMessage}
                            rows={6}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full font-mono text-xs p-4 bg-neutral-900 border border-neutral-800 text-white rounded outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            onClick={() => setReplyingInquiryId(null)}
                            className="font-mono text-[10px] tracking-wider text-neutral-400 py-1.5 px-4 hover:text-white transition-colors"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => handleSendMockReply(inquiry.id)}
                            className="font-mono text-[10px] tracking-wider py-2 px-6 rounded bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
                          >
                            SIMULATE EMAIL SEND
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
