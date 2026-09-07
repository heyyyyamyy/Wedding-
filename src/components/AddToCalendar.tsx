/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Download, ExternalLink, Clock, Check, ChevronDown } from 'lucide-react';

export default function AddToCalendar() {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const venueAddress = 'Sibbal Green, VIP Road, Raipur, Chhattisgarh';
  const mapLink = 'https://share.google/251VEzEHu6tIjQUPY';

  // Events setup: Nikah (1:00 PM to 4:00 PM) & Reception (8:00 PM to 11:30 PM) on 18 Oct 2026
  // Raipur is UTC+5:30 (IST).
  // 1:00 PM IST = 07:30 UTC
  // 4:00 PM IST = 10:30 UTC
  // 8:00 PM IST = 14:30 UTC
  // 11:30 PM IST = 18:00 UTC

  const createGoogleCalendarUrl = (title: string, startIso: string, endIso: string, desc: string) => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${startIso}/${endIso}`,
      details: `${desc}\n\nVenue Map: ${mapLink}`,
      location: venueAddress,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const nikahGoogleUrl = createGoogleCalendarUrl(
    'Saima & Sohail - Nikah Ceremony',
    '20261018T073000Z',
    '20261018T103000Z',
    'Nikah Ceremony & Dastarkhwan lunch celebrations of Saima Fatima and Sohail Rawani at Sibbal Green, Raipur.'
  );

  const receptionGoogleUrl = createGoogleCalendarUrl(
    'Saima & Sohail - Grand Reception',
    '20261018T143000Z',
    '20261018T180000Z',
    'Grand Reception (Walima) and dinner banquet celebrations of Saima Fatima and Sohail Rawani at Sibbal Green, Raipur.'
  );

  const generateIcsFile = (type: 'nikah' | 'reception' | 'both') => {
    let eventsContent = '';

    if (type === 'nikah' || type === 'both') {
      eventsContent += `BEGIN:VEVENT
SUMMARY:Saima Fatima & Sohail Rawani - Nikah Ceremony
DESCRIPTION:Sacred Nikah Ceremony and traditional Dastarkhwan feast celebrating Saima & Sohail. Map: ${mapLink}
LOCATION:${venueAddress}
DTSTART:20261018T073000Z
DTEND:20261018T103000Z
STATUS:CONFIRMED
END:VEVENT
`;
    }

    if (type === 'reception' || type === 'both') {
      eventsContent += `BEGIN:VEVENT
SUMMARY:Saima Fatima & Sohail Rawani - Grand Wedding Reception
DESCRIPTION:Grand Walima Reception and Gala Dinner celebrating Saima & Sohail. Map: ${mapLink}
LOCATION:${venueAddress}
DTSTART:20261018T143000Z
DTEND:20261018T180000Z
STATUS:CONFIRMED
END:VEVENT
`;
    }

    const icsString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Startup solution//Saima & Sohail Wedding//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${eventsContent}END:VCALENDAR`;

    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Saima-Sohail-Wedding-${type}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDownloaded(type);
    setTimeout(() => setDownloaded(null), 2500);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gold-300 hover:border-gold-500 shadow-sm hover:shadow-md text-emerald-950 hover:text-gold-700 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer group"
      >
        <Calendar className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform" />
        <span>Save Date to Calendar</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gold-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-3 w-80 bg-white border border-gold-200 rounded-2xl shadow-2xl p-4 z-40 text-emerald-950"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gold-100">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Select Event
              </span>
              <span className="text-[10px] text-emerald-900/50">18 Oct 2026</span>
            </div>

            <div className="space-y-2.5">
              {/* Nikah Option */}
              <div className="p-2.5 rounded-xl bg-gold-50/50 border border-gold-200/50 flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-emerald-950">Nikah Ceremony</h4>
                    <p className="text-[11px] text-emerald-900/60">01:00 PM IST</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={nikahGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-gold-500 hover:text-white border border-gold-200 text-gold-800 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Google</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <button
                    onClick={() => generateIcsFile('nikah')}
                    className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-emerald-900 hover:text-white border border-gold-200 text-emerald-900 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {downloaded === 'nikah' ? <Check className="w-3 h-3 text-emerald-500" /> : <Download className="w-2.5 h-2.5" />}
                    <span>Apple/iCal</span>
                  </button>
                </div>
              </div>

              {/* Reception Option */}
              <div className="p-2.5 rounded-xl bg-gold-50/50 border border-gold-200/50 flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-emerald-950">Grand Reception</h4>
                    <p className="text-[11px] text-emerald-900/60">08:00 PM IST</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={receptionGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-gold-500 hover:text-white border border-gold-200 text-gold-800 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Google</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <button
                    onClick={() => generateIcsFile('reception')}
                    className="flex-1 text-center py-1.5 px-2 bg-white hover:bg-emerald-900 hover:text-white border border-gold-200 text-emerald-900 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {downloaded === 'reception' ? <Check className="w-3 h-3 text-emerald-500" /> : <Download className="w-2.5 h-2.5" />}
                    <span>Apple/iCal</span>
                  </button>
                </div>
              </div>

              {/* All Events Combined */}
              <button
                onClick={() => generateIcsFile('both')}
                className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-gold-300 hover:text-gold-200 rounded-xl text-xs font-sans font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {downloaded === 'both' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download Both Events (.ics)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
