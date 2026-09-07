/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Sparkles, Utensils, Heart, Camera, PartyPopper } from 'lucide-react';

interface TimelineItem {
  time: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Sparkles;
  badge: 'Nikah' | 'Reception';
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    time: '01:00 PM',
    title: 'Baraat Swagat & Arrival',
    subtitle: 'Sibbal Green Grand Portico',
    description: 'A traditional warm welcome with rose water sprinkles, ittar, and greetings by the bride\'s family.',
    icon: PartyPopper,
    badge: 'Nikah',
  },
  {
    time: '01:30 PM',
    title: 'Sacred Nikah Ceremony',
    subtitle: 'Main Air-conditioned Royal Hall',
    description: 'Solemn recitation of the Khutbah-e-Nikah, Ijab-o-Qubool, signing of the Nikahnama, followed by collective Duas for marital bliss.',
    icon: Heart,
    badge: 'Nikah',
  },
  {
    time: '02:30 PM',
    title: 'Royal Dastarkhwan Banquet',
    subtitle: 'Imperial Dining Area',
    description: 'An authentic traditional feast featuring exquisite culinary specialties, aromatic biryanis, gravies, and heritage sweet desserts.',
    icon: Utensils,
    badge: 'Nikah',
  },
  {
    time: '08:00 PM',
    title: 'Grand Walima Reception Entry',
    subtitle: 'Illuminated Green Lawns',
    description: 'The newlyweds Saima & Sohail make their regal evening grand entrance accompanied by celebratory lights and warm greetings.',
    icon: Sparkles,
    badge: 'Reception',
  },
  {
    time: '08:45 PM',
    title: 'Stage Felicitations & Portraits',
    subtitle: 'Floral Stage Canopy',
    description: 'An open invitation for family, esteemed guests, and friends to meet the couple, extend blessings, and capture cherished photographs.',
    icon: Camera,
    badge: 'Reception',
  },
  {
    time: '09:30 PM',
    title: 'Gala Dinner Celebration',
    subtitle: 'Open Garden Buffet Lounge',
    description: 'A grand evening gastronomic experience with live stations, gourmet delicacies, and celebration desserts under the autumn sky.',
    icon: Utensils,
    badge: 'Reception',
  },
];

export default function TimelineSchedule() {
  const [filter, setFilter] = useState<'all' | 'Nikah' | 'Reception'>('all');

  const filteredItems = filter === 'all' 
    ? TIMELINE_DATA 
    : TIMELINE_DATA.filter(item => item.badge === filter);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 border border-gold-200/70 rounded-[32px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Subtle floral flourish background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
          Flow of The Blessed Day
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide mt-1">
          Wedding Day Itinerary
        </h3>
        <p className="text-xs text-emerald-900/60 max-w-md mx-auto mt-2 font-serif italic">
          Sunday, 18 October 2026 • Timings & sequence of ceremonies
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-950 text-gold-300 shadow-sm'
                : 'bg-gold-50/80 text-emerald-900 hover:bg-gold-100 border border-gold-200/50'
            }`}
          >
            Complete Day
          </button>
          <button
            onClick={() => setFilter('Nikah')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
              filter === 'Nikah'
                ? 'bg-gold-600 text-white shadow-sm'
                : 'bg-gold-50/80 text-emerald-900 hover:bg-gold-100 border border-gold-200/50'
            }`}
          >
            Afternoon Nikah (1 PM)
          </button>
          <button
            onClick={() => setFilter('Reception')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
              filter === 'Reception'
                ? 'bg-emerald-900 text-gold-300 shadow-sm'
                : 'bg-gold-50/80 text-emerald-900 hover:bg-gold-100 border border-gold-200/50'
            }`}
          >
            Evening Reception (8 PM)
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-gold-300 before:via-gold-400 before:to-gold-300 space-y-6 sm:space-y-8 relative z-10">
        {filteredItems.map((item, index) => {
          const IconComponent = item.icon;
          const isNikah = item.badge === 'Nikah';

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative flex items-start gap-4 sm:gap-6 group"
            >
              {/* Timeline Pin Node */}
              <div className="absolute -left-[30px] sm:-left-[35px] top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-gold-400 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
              </div>

              {/* Timeline Card */}
              <div className="flex-1 bg-gold-50/40 hover:bg-gold-50/80 border border-gold-200/60 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-gold-700 bg-gold-100/60 px-2.5 py-0.5 rounded-full border border-gold-300/40">
                      <Clock className="w-3 h-3 text-gold-600" />
                      {item.time}
                    </span>
                    <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isNikah ? 'bg-amber-100/80 text-amber-900' : 'bg-emerald-100/80 text-emerald-900'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-emerald-900/60">
                    {item.subtitle}
                  </span>
                </div>

                <h4 className="font-serif text-base sm:text-lg font-bold text-emerald-950 group-hover:text-gold-800 transition-colors">
                  {item.title}
                </h4>
                
                <p className="text-xs font-serif text-emerald-900/70 leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
