import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ExternalLink, Heart, Sparkles } from 'lucide-react';

export default function EventCard() {
  const events = [
    {
      type: 'Nikah',
      title: 'Nikah Ceremony',
      time: '1:00 PM',
      date: 'Sunday, 18 October 2026',
      venue: 'Sibbal Green',
      location: 'VIP Road, pure gold luxury event lawn, Raipur, Chhattisgarh',
      description: 'The sacred union under Islamic tradition, followed by elegant luncheon blessing the newlywed couple.',
      color: 'from-emerald-950 to-emerald-900',
      tagline: 'The Sacred Union'
    },
    {
      type: 'Reception',
      title: 'Grand Reception',
      time: '8:00 PM',
      date: 'Sunday, 18 October 2026',
      venue: 'Sibbal Green',
      location: 'VIP Road, pure gold luxury event lawn, Raipur, Chhattisgarh',
      description: 'An evening of celebration, delightful dinner, music, and congratulations as we embark on our journey.',
      color: 'from-emerald-950 via-emerald-900 to-emerald-950',
      tagline: 'The Celebration'
    }
  ];

  const VENUE_MAP_URL = 'https://share.google/251VEzEHu6tIjQUPY';

  const handleOpenMap = () => {
    window.open(VENUE_MAP_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event, index) => (
          <motion.div
            key={event.type}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="group relative bg-white border border-gold-200/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-gold-400 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Elegant corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-400/40 rounded-tl-3xl group-hover:border-gold-500 transition-colors duration-300" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-400/40 rounded-tr-3xl group-hover:border-gold-500 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-400/40 rounded-bl-3xl group-hover:border-gold-500 transition-colors duration-300" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-400/40 rounded-br-3xl group-hover:border-gold-500 transition-colors duration-300" />

            <div className="p-6 sm:p-8 flex-grow">
              {/* Event Type Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600 bg-gold-50 border border-gold-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {event.tagline}
                </span>
                {event.type === 'Nikah' ? (
                  <Heart className="w-5 h-5 text-gold-500 fill-gold-400/20" />
                ) : (
                  <Sparkles className="w-5 h-5 text-gold-500" />
                )}
              </div>

              {/* Title */}
              <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-semibold mb-6 tracking-wide relative inline-block">
                {event.title}
                <div className="w-12 h-[2px] bg-gradient-to-r from-gold-400 to-transparent mt-2" />
              </h3>

              {/* Detail Items */}
              <div className="space-y-4 mb-6">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-gold-50 border border-gold-100 mt-0.5">
                    <Calendar className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-sans text-emerald-900/50 uppercase tracking-wider">Date</span>
                    <span className="font-serif text-base text-emerald-950 font-medium">{event.date}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-gold-50 border border-gold-100 mt-0.5">
                    <Clock className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-sans text-emerald-900/50 uppercase tracking-wider">Time</span>
                    <span className="font-serif text-base text-gold-600 font-semibold">{event.time}</span>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-gold-50 border border-gold-100 mt-0.5">
                    <MapPin className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-sans text-emerald-900/50 uppercase tracking-wider">Venue</span>
                    <span className="font-serif text-base text-emerald-950 font-semibold">{event.venue}</span>
                    <span className="block text-xs text-emerald-900/70 mt-0.5 leading-relaxed">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-emerald-900/80 italic leading-relaxed border-l-2 border-gold-200/50 pl-4 py-1">
                "{event.description}"
              </p>
            </div>

            {/* Bottom Button Panel */}
            <div className="p-6 bg-gold-50/40 border-t border-gold-100/60 rounded-b-3xl">
              <a
                href={VENUE_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gold-300 bg-white hover:bg-gold-500 hover:text-white text-gold-700 font-sans text-xs uppercase tracking-widest font-semibold shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                Navigate to Venue
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
