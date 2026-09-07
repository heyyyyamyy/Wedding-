/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Music, Music2, Share2, Check, Copy, MapPin, Calendar, Compass, Phone } from 'lucide-react';
import Countdown from './components/Countdown';
import EventCard from './components/EventCard';
import RSVPForm from './components/RSVPForm';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-set target wedding date: 18 October 2026, 1:00 PM (13:00)
  const weddingDate = '2026-10-18T13:00:00';

  useEffect(() => {
    // Create soft, relaxing acoustic/traditional background music track
    audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-244.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.45;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
    }
    setIsPlaying(!isPlaying);
  };

  const copyInvitationLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-emerald-950 flex flex-col items-center justify-between relative overflow-hidden floral-pattern selection:bg-gold-200 selection:text-emerald-950">
      
      {/* Decorative Ornate Background Overlays */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#FAF4E6]/80 via-[#FAF9F6]/40 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[#F4EFE0]/50 to-transparent pointer-events-none z-0" />

      {/* FLOATING AUDIO CONTROLLER */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleMusic}
          className={`p-3.5 rounded-full border shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center relative group ${
            isPlaying 
              ? 'bg-emerald-900 border-gold-400 text-gold-300' 
              : 'bg-white border-gold-200 hover:border-gold-400 text-emerald-800'
          }`}
          title={isPlaying ? "Mute Music" : "Play Wedding Ambient Music"}
        >
          {isPlaying ? (
            <>
              <Music2 className="w-5 h-5 animate-bounce" />
              {/* Music pulse waves */}
              <span className="absolute inline-flex h-full w-full rounded-full a-ping bg-gold-400/20 opacity-75 animate-ping -z-10" />
            </>
          ) : (
            <Music className="w-5 h-5 text-gold-600" />
          )}
        </motion.button>
      </div>

      {/* FLOATING QUICK SHARE LINK FOR MOBILE / WHATSAPP */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={copyInvitationLink}
          className="p-3.5 bg-white border border-gold-300 rounded-full shadow-lg hover:shadow-xl hover:border-gold-500 text-gold-700 cursor-pointer transition-all duration-300 flex items-center justify-center relative group"
          title="Share Invitation Link"
        >
          <AnimatePresence mode="wait">
            {copiedLink ? (
              <motion.div
                key="checked"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="absolute right-12 bg-emerald-900 text-white text-[10px] font-sans font-bold tracking-wider px-2.5 py-1 rounded-md shadow-md pointer-events-none uppercase">
                  Copied!
                </span>
              </motion.div>
            ) : (
              <motion.div key="share" className="flex items-center">
                <Share2 className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="w-full max-w-5xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center gap-16">
        
        {/* HERO SECTION / DIGITAL CARD COVER */}
        <section className="w-full text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-50 border border-gold-200/60 rounded-full text-xs font-sans font-semibold tracking-widest text-gold-600 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 fill-gold-300" />
              Bismillah-ir-Rahman-ir-Rahim
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="w-full max-w-3xl bg-white border border-gold-200/50 rounded-[40px] p-8 sm:p-14 md:p-16 shadow-xl relative mt-4 overflow-hidden"
          >
            {/* Elegant corner flourishes */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-gold-400/40 rounded-tl-xl" />
            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-gold-400/40 rounded-tr-xl" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-gold-400/40 rounded-bl-xl" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-gold-400/40 rounded-br-xl" />

            <div className="flex flex-col items-center gap-4 relative z-10">
              <span className="text-[11px] tracking-[0.35em] font-sans uppercase font-bold text-gold-600">
                Together with their families
              </span>
              
              <p className="text-sm font-serif italic text-emerald-900/60 leading-relaxed max-w-md mx-auto">
                We invite you to share the bliss of our celebrations and witness the sacred union of
              </p>

              {/* Groom & Bride Names */}
              <div className="py-6 flex flex-col items-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="font-script text-5xl sm:text-6xl md:text-7xl gold-gradient-text leading-tight text-center"
                >
                  Sohail Rawani
                </motion.h1>
                <div className="my-1 flex items-center justify-center gap-4 w-full">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-400" />
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-400" />
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="font-script text-5xl sm:text-6xl md:text-7xl gold-gradient-text leading-tight text-center"
                >
                  Saima Fatima
                </motion.h1>
              </div>

              {/* Central Details Banner */}
              <div className="bg-gold-50/50 border border-gold-200/40 px-6 py-4 rounded-2xl max-w-lg w-full flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-gold-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-serif text-sm sm:text-base font-semibold">Sunday, 18 October 2026</span>
                </div>
                <div className="h-[1px] w-full bg-gold-200/40" />
                <div className="flex items-center justify-center gap-2 text-emerald-900/80">
                  <MapPin className="w-4 h-4 text-gold-500" />
                  <span className="font-sans text-xs tracking-wide uppercase font-semibold">Sibbal Green, VIP Road, Raipur</span>
                </div>
              </div>

              {/* Custom Traditional Welcome Line */}
              <p className="text-xs text-emerald-900/60 tracking-widest uppercase mt-4">
                Nikah: 1:00 PM • Reception: 8:00 PM
              </p>
            </div>
          </motion.div>
        </section>

        {/* COUNTDOWN TIMER SECTION */}
        <section className="w-full text-center">
          <Countdown targetDate={weddingDate} />
        </section>

        {/* SCHEDULE / EVENT DETAILS CARD */}
        <section className="w-full">
          <div className="text-center mb-4">
            <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
              The Celebrations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-emerald-950 font-bold tracking-wide mt-1">
              Events Details
            </h2>
            <div className="w-12 h-[2px] bg-gold-400 mx-auto mt-3" />
          </div>
          <EventCard />
        </section>

        {/* RSVP FORM SECTION */}
        <section className="w-full">
          <RSVPForm />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full py-12 px-4 border-t border-gold-100 bg-white text-center relative z-10 flex flex-col items-center gap-4">
        {/* Ornamental End Line */}
        <div className="flex items-center gap-2.5">
          <div className="h-[1px] w-16 bg-gold-300" />
          <Heart className="w-4 h-4 text-gold-500 fill-gold-400/20" />
          <div className="h-[1px] w-16 bg-gold-300" />
        </div>

        <p className="font-serif text-lg text-emerald-950 italic">
          "And We created you in pairs" — Surah An-Naba 78:8
        </p>
        
        <p className="text-xs font-sans text-emerald-900/50 uppercase tracking-widest mt-2">
          We look forward to celebrating with you.
        </p>

        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-xs font-sans font-semibold text-emerald-900/70 tracking-widest uppercase">
            Startup solution
          </p>
          <p className="text-[10px] font-mono text-emerald-900/40">
            © 2026 Sohail Rawani & Saima Fatima Wedding
          </p>
        </div>
      </footer>
    </div>
  );
}
