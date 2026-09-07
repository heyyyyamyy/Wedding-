/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Check, Copy, Share2, X, Sparkles } from 'lucide-react';

export default function WhatsAppInviteShare() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : '';

  const inviteText = `Assalamu Alaikum! 🌸
You are cordially invited to celebrate the Nikah Ceremony & Grand Reception of:

🕊️ Saima Fatima & Sohail Rawani 🕊️

📅 Date: Sunday, 18 October 2026
🕌 Nikah: 01:00 PM
✨ Reception: 08:00 PM
📍 Venue: Sibbal Green, VIP Road, Raipur

View complete invitation, venue navigation & RSVP:
${cleanUrl}

We look forward to having you with us in our moments of joy and barakah!`;

  const handleWhatsAppSend = () => {
    const encoded = encodeURIComponent(inviteText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-950 hover:bg-emerald-900 border border-gold-400/40 text-gold-300 font-sans text-xs uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
        title="Share with Friends & Family on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
        <span>Share on WhatsApp</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white border border-gold-300/80 rounded-3xl p-6 shadow-2xl relative text-emerald-950"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gold-50 text-gray-400 hover:text-emerald-950 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-gold-600 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-sans font-bold uppercase tracking-wider">
                  Invite Family & Loved Ones
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-emerald-950 mb-1">
                Share Wedding Invitation
              </h3>
              <p className="text-xs font-serif text-emerald-900/60 mb-4">
                Send the formatted wedding announcement and venue link directly to WhatsApp contacts or family groups.
              </p>

              {/* Message Preview Box */}
              <div className="p-3.5 bg-gold-50/50 border border-gold-200/60 rounded-xl text-xs font-serif text-emerald-900/80 whitespace-pre-line max-h-48 overflow-y-auto mb-5 leading-relaxed">
                {inviteText}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsAppSend}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Open WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-gold-50 border border-gold-300 text-gold-800 font-sans text-xs uppercase tracking-wider font-semibold shadow-xs transition-all cursor-pointer"
                  title="Copy formatted message"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
