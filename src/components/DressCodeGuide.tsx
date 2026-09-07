/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Shirt } from 'lucide-react';

export default function DressCodeGuide() {
  const nikahColors = [
    { name: 'Ivory & Cream', hex: '#F9F6EE', text: 'text-amber-950' },
    { name: 'Soft Sage', hex: '#D2DEC9', text: 'text-emerald-950' },
    { name: 'Blush Rose', hex: '#F4D3D5', text: 'text-rose-950' },
    { name: 'Subtle Gold', hex: '#F2D56E', text: 'text-amber-950' },
  ];

  const receptionColors = [
    { name: 'Royal Emerald', hex: '#064E3B', text: 'text-white' },
    { name: 'Midnight Navy', hex: '#1E293B', text: 'text-white' },
    { name: 'Champagne Gold', hex: '#ECC03F', text: 'text-amber-950' },
    { name: 'Velvet Plum', hex: '#4A154B', text: 'text-white' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 border border-gold-200/70 rounded-[32px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
          Style & Color Inspiration
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide mt-1">
          Wedding Attire Palette
        </h3>
        <p className="text-xs text-emerald-900/60 max-w-md mx-auto mt-2 font-serif italic">
          We invite our cherished guests to grace the celebrations in coordinated elegance.
        </p>
      </div>

      {/* Two columns: Nikah vs Reception */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nikah Style Card */}
        <div className="bg-gold-50/40 border border-gold-200/60 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                Afternoon Nikah (1:00 PM)
              </span>
              <Shirt className="w-4 h-4 text-gold-600" />
            </div>
            
            <h4 className="font-serif text-lg font-bold text-emerald-950 mt-1">
              Pastel Grace & Ethnic Elegance
            </h4>
            <p className="text-xs font-serif text-emerald-900/70 mt-1 leading-relaxed">
              Traditional Indian ethnic wear in delicate daylight tones. Sherwanis, Kurta-Pajamas, and elegant Anarkalis or Salwar Kameez.
            </p>

            {/* Color Swatches */}
            <div className="mt-4 pt-3 border-t border-gold-200/50">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-emerald-900/50 block mb-2">
                Recommended Shades
              </span>
              <div className="grid grid-cols-2 gap-2">
                {nikahColors.map(color => (
                  <div key={color.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-gold-100 shadow-2xs">
                    <span 
                      className="w-5 h-5 rounded-full border border-black/10 shadow-inner shrink-0" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] font-sans font-medium text-emerald-950 truncate">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 flex items-center gap-1.5 text-[11px] text-gold-700/90 font-sans">
            <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
            <span>Light, breathable fabrics ideal for afternoon banquet lawns</span>
          </div>
        </div>

        {/* Reception Style Card */}
        <div className="bg-emerald-950/5 border border-emerald-900/15 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                Evening Reception (8:00 PM)
              </span>
              <Sparkles className="w-4 h-4 text-gold-600" />
            </div>

            <h4 className="font-serif text-lg font-bold text-emerald-950 mt-1">
              Regal Evening Glamour
            </h4>
            <p className="text-xs font-serif text-emerald-900/70 mt-1 leading-relaxed">
              Formal evening finery and majestic celebration attire. Bandhgala, Tuxedos, Indo-Western suits, embroidered Lehengas and Sarees.
            </p>

            {/* Color Swatches */}
            <div className="mt-4 pt-3 border-t border-emerald-900/10">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-emerald-900/50 block mb-2">
                Recommended Shades
              </span>
              <div className="grid grid-cols-2 gap-2">
                {receptionColors.map(color => (
                  <div key={color.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-emerald-900/10 shadow-2xs">
                    <span 
                      className="w-5 h-5 rounded-full border border-black/10 shadow-inner shrink-0" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] font-sans font-medium text-emerald-950 truncate">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-sans">
            <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
            <span>Opulent jewelry and evening celebration attire welcome</span>
          </div>
        </div>

      </div>
    </div>
  );
}
