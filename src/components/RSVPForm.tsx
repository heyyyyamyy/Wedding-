import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, UserCheck, Users, MessageSquare, Edit2, Sparkles, AlertCircle } from 'lucide-react';
import { RSVPInfo } from '../types';

export default function RSVPForm() {
  const [rsvp, setRsvp] = useState<RSVPInfo>({
    name: '',
    email: '',
    phone: '',
    attending: 'unconfirmed',
    guestsCount: 1,
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load from local storage if existing
  useEffect(() => {
    const savedRSVP = localStorage.getItem('wedding_rsvp');
    if (savedRSVP) {
      try {
        const parsed = JSON.parse(savedRSVP);
        setRsvp(parsed);
        setSubmitted(true);
      } catch (e) {
        console.error('Error parsing saved RSVP', e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rsvp.name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (rsvp.attending === 'unconfirmed') {
      setError('Please let us know if you will be attending.');
      return;
    }

    setLoading(true);

    // Simulate database saving
    setTimeout(() => {
      const submission = {
        ...rsvp,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem('wedding_rsvp', JSON.stringify(submission));
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  const handleEdit = () => {
    setSubmitted(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gold-200/50 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden"
          >
            {/* Elegant Floral/Gold Watermark Pattern */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-50/40 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gold-50/40 pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-semibold text-gold-600 block mb-2">
                Join Our Celebration
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide">
                Kindly RSVP
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900/60 mt-2">
                Please respond by October 10, 2026, to help us prepare.
              </p>
              <div className="w-16 h-[1px] bg-gold-300 mx-auto mt-4" />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Name field */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-emerald-950">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-500">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={rsvp.name}
                    onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-emerald-50/20 border border-gold-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded-xl py-3 pl-11 pr-4 text-emerald-950 text-sm placeholder-emerald-900/40 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Guest status choices */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-emerald-950">
                  Will you join us? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvp({ ...rsvp, attending: 'yes' })}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-semibold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      rsvp.attending === 'yes'
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                        : 'bg-white text-emerald-950 border-gold-200 hover:border-gold-400'
                    }`}
                  >
                    Joyfully Attend
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvp({ ...rsvp, attending: 'no' })}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-semibold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      rsvp.attending === 'no'
                        ? 'bg-rose-950 text-white border-rose-950 shadow-md'
                        : 'bg-white text-emerald-950 border-gold-200 hover:border-rose-300'
                    }`}
                  >
                    Regretfully Decline
                  </button>
                </div>
              </div>

              {/* Guests Count (Only show if attending) */}
              <AnimatePresence>
                {rsvp.attending === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-emerald-950">
                      Number of Guests (including yourself)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-500">
                        <Users className="w-4 h-4" />
                      </span>
                      <select
                        value={rsvp.guestsCount}
                        onChange={(e) => setRsvp({ ...rsvp, guestsCount: Number(e.target.value) })}
                        className="w-full bg-emerald-50/20 border border-gold-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded-xl py-3 pl-11 pr-4 text-emerald-950 text-sm appearance-none transition-all duration-300"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-900/40 text-xs">
                        ▼
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optional Message Field */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-emerald-950 font-medium">
                  Warm Wishes / Dietary Notes (Optional)
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-gold-500">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <textarea
                    value={rsvp.message}
                    onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })}
                    placeholder="Send a beautiful blessing or special request..."
                    rows={4}
                    className="w-full bg-emerald-50/20 border border-gold-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded-xl py-3 pl-11 pr-4 text-emerald-950 text-sm placeholder-emerald-900/40 transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-700 hover:to-gold-700 text-white font-sans text-xs uppercase tracking-widest font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send RSVP Response
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-950 text-white border border-gold-400/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden"
          >
            {/* Soft decorative gold background glows */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-gold-400/10 blur-3xl" />
            <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 rounded-full bg-emerald-800/20 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-4 bg-gold-500/10 border border-gold-400/40 rounded-full text-gold-400 mb-6 relative">
                <CheckCircle2 className="w-12 h-12" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 text-gold-300"
                >
                  <Sparkles className="w-5 h-5 fill-gold-300" />
                </motion.div>
              </div>

              <h3 className="font-serif text-3xl text-gold-100 font-bold mb-3 tracking-wide">
                Thank You, {rsvp.name}!
              </h3>
              
              <p className="text-emerald-100/80 text-sm max-w-md mx-auto leading-relaxed mb-6">
                {rsvp.attending === 'yes'
                  ? `We are absolutely thrilled that you are joining us to celebrate our wedding! We have registered ${rsvp.guestsCount} ${rsvp.guestsCount === 1 ? 'guest' : 'guests'} under your name.`
                  : 'We are saddened that you cannot make it, but your warm wishes are deeply appreciated and will stay in our hearts.'}
              </p>

              {rsvp.message && (
                <div className="bg-emerald-900/60 border border-gold-500/10 p-4 rounded-2xl max-w-lg mb-8 italic text-xs text-emerald-100/90 leading-relaxed text-left relative">
                  <span className="text-gold-400 font-serif text-3xl absolute -top-2 left-3">“</span>
                  <p className="pl-6 pr-4 pt-1">"{rsvp.message}"</p>
                </div>
              )}

              <button
                onClick={handleEdit}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl border border-gold-300/40 bg-emerald-900/40 hover:bg-gold-500 text-gold-300 hover:text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Update My Response
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
