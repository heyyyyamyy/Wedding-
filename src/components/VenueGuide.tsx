/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MapPin, Navigation, Plane, Train, Car, Copy, Check, ExternalLink, ShieldCheck, Sun } from 'lucide-react';

export default function VenueGuide() {
  const [copied, setCopied] = useState(false);

  const fullAddress = 'Sibbal Green, VIP Road, Vishal Nagar, Raipur, Chhattisgarh 492006';
  const mapUrl = 'https://share.google/251VEzEHu6tIjQUPY';

  const copyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 border border-gold-200/70 rounded-[32px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
          Location & Travel
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide mt-1">
          Venue & Guest Guide
        </h3>
        <p className="text-xs text-emerald-900/60 max-w-md mx-auto mt-2 font-serif italic">
          Everything you need for a comfortable and effortless arrival at Sibbal Green, Raipur.
        </p>
      </div>

      {/* Main Venue Card */}
      <div className="bg-gold-50/50 border border-gold-200/60 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 border border-gold-300 flex items-center justify-center shrink-0 shadow-inner">
            <MapPin className="w-6 h-6 text-gold-700" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gold-700 bg-gold-200/50 px-2 py-0.5 rounded-md">
              Celebration Destination
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
              Sibbal Green
            </h4>
            <p className="text-xs text-emerald-900/70 mt-1 font-sans">
              VIP Road, Vishal Nagar, Raipur, Chhattisgarh 492006
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-gold-300 hover:text-gold-200 font-sans text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-gold-400" />
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            onClick={copyAddress}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-gold-50 border border-gold-300 text-gold-800 font-sans text-xs uppercase tracking-wider font-semibold shadow-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Address Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Travel & Convenience Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Airport */}
        <div className="p-4 rounded-2xl bg-white border border-gold-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gold-600">
            <Plane className="w-4 h-4" />
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-950">
              Airport (RPR)
            </span>
          </div>
          <p className="text-xs font-serif text-emerald-900/70">
            Swami Vivekananda Airport is located just <strong className="text-emerald-950 font-sans">10-12 mins (8 km)</strong> away straight along VIP Road.
          </p>
        </div>

        {/* Railway */}
        <div className="p-4 rounded-2xl bg-white border border-gold-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gold-600">
            <Train className="w-4 h-4" />
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-950">
              Railway Station
            </span>
          </div>
          <p className="text-xs font-serif text-emerald-900/70">
            Raipur Junction is approximately <strong className="text-emerald-950 font-sans">20-25 mins (12 km)</strong> by taxi or auto-rickshaw.
          </p>
        </div>

        {/* Parking */}
        <div className="p-4 rounded-2xl bg-white border border-gold-100 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gold-600">
            <Car className="w-4 h-4" />
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-950">
              Valet & Amenities
            </span>
          </div>
          <p className="text-xs font-serif text-emerald-900/70">
            Dedicated complimentary valet parking, wheelchair accessible entrances, and conditioned facilities.
          </p>
        </div>
      </div>

      {/* October Weather & Atmosphere Note */}
      <div className="p-3.5 rounded-xl bg-gold-50/40 border border-gold-200/50 flex items-center justify-between gap-3 text-xs text-emerald-900/80">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          <span>October Weather in Raipur: Pleasant autumn breezes with temperatures around 24°C - 28°C.</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-gold-700 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security & Hospitality Staff on Venue</span>
        </div>
      </div>
    </div>
  );
}
