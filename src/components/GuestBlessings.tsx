/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Sparkles, MessageCircleHeart, Check, Clock } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BlessingItem } from '../types';

const QUICK_DUAS = [
  'Bārakallāhu lakumā wa bāraka \'alaykumā wa jama\'a baynakumā fī khayr 🤲',
  'May Allah bless your union with eternal love, harmony, and peace.',
  'Heartiest congratulations to Saima and Sohail! Wishing you a blessed life ahead.',
  'May your new journey together be illuminated with joy and barakah.',
];

export default function GuestBlessings() {
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time blessings from Firestore
  useEffect(() => {
    // Load local likes
    try {
      const savedLikes = localStorage.getItem('wedding_blessings_likes');
      if (savedLikes) {
        setLikedIds(JSON.parse(savedLikes));
      }
    } catch {
      // ignore
    }

    // Firestore real-time listener
    const q = query(collection(db, 'blessings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: BlessingItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          sender: d.data().sender || 'Guest',
          city: d.data().city || '',
          message: d.data().message || '',
          likes: typeof d.data().likes === 'number' ? d.data().likes : 0,
          createdAt: d.data().createdAt || new Date().toISOString(),
        })).filter(item => !item.sender.includes('Amaan - nayab ka papa'));
        setBlessings(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore live blessings subscription note:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLike = async (id: string) => {
    const isAlreadyLiked = likedIds.includes(id);
    const nextLiked = isAlreadyLiked
      ? likedIds.filter((i) => i !== id)
      : [...likedIds, id];

    setLikedIds(nextLiked);
    localStorage.setItem('wedding_blessings_likes', JSON.stringify(nextLiked));

    // Optimistic UI update
    setBlessings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, likes: Math.max(0, b.likes + (isAlreadyLiked ? -1 : 1)) }
          : b
      )
    );

    // Sync to Firestore
    try {
      const blessingRef = doc(db, 'blessings', id);
      await updateDoc(blessingRef, {
        likes: increment(isAlreadyLiked ? -1 : 1),
      });
    } catch (e) {
      console.error('Error updating like count:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const blessingPayload = {
      sender: name.trim(),
      city: city.trim() || '',
      message: message.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'blessings'), blessingPayload);
      setName('');
      setCity('');
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving blessing to Firestore:', err);
      // Fallback local update if network hiccups
      const fallbackItem: BlessingItem = {
        id: `local-${Date.now()}`,
        ...blessingPayload,
      };
      setBlessings((prev) => [fallbackItem, ...prev]);
      setName('');
      setCity('');
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 border border-gold-200/70 rounded-[32px] p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Subtle flourish background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
          Messages of Love & Duas
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide mt-1">
          Blessings & Duas Wall
        </h3>
        <p className="text-xs text-emerald-900/60 max-w-md mx-auto mt-2 font-serif italic">
          Leave a cherished prayer or congratulatory wish for Saima & Sohail as they embark on this sacred journey.
        </p>
      </div>

      {/* Form & Quick Pickers */}
      <div className="bg-gold-50/40 border border-gold-200/60 rounded-2xl p-5 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Uncle Tariq & Family"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-emerald-950 placeholder-emerald-900/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-1">
                City or Relation (Optional)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Raipur / Family Friend"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-emerald-950 placeholder-emerald-900/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-1">
              Your Blessing or Dua *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your heartfelt Dua or auspicious congratulations..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gold-200 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-emerald-950 placeholder-emerald-900/40 resize-none"
            />
          </div>

          {/* Quick Duas Preset Picker */}
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-gold-700 font-semibold block mb-2">
              Or Choose a Traditional Blessing:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_DUAS.map((dua, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(dua)}
                  className="text-[11px] text-left px-3 py-1.5 rounded-lg border border-gold-200 bg-white/80 hover:bg-gold-50 text-emerald-900/80 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  {dua}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Your Dua was shared live on the wall! JazakAllah Khair.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !message.trim()}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white font-sans text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Blessing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Blessings Live Wall / Blank State */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-emerald-900/50">
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-serif italic">Loading live blessings...</span>
        </div>
      ) : blessings.length === 0 ? (
        <div className="py-12 px-6 border-2 border-dashed border-gold-200/80 rounded-2xl text-center bg-gold-50/20">
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 mx-auto mb-3">
            <MessageCircleHeart className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg text-emerald-950 font-bold mb-1">
            Wall Is Ready for Your Duas
          </h4>
          <p className="text-xs text-emerald-900/60 font-serif italic max-w-sm mx-auto">
            Be the very first guest to bestow a prayer & prayerful congratulations for Saima Fatima & Sohail Rawani!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blessings.map((b) => {
            const isLiked = likedIds.includes(b.id);

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white border border-gold-100/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-serif text-sm font-bold text-emerald-950">
                        {b.sender}
                      </h5>
                      {b.city && (
                        <span className="text-[10px] font-sans text-emerald-900/50 block">
                          {b.city}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-900/40 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(b.createdAt)}
                    </span>
                  </div>

                  <p className="font-serif text-xs italic text-emerald-900/80 leading-relaxed">
                    "{b.message}"
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gold-100/50 flex items-center justify-between">
                  <span className="text-[10px] text-gold-600 font-sans flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    Barakah & Prayers
                  </span>

                  <button
                    onClick={() => handleLike(b.id)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50/50'
                    }`}
                    title={isLiked ? 'Ameen / Liked' : 'Send Ameen / Like'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span className="text-[11px] font-mono font-medium">{b.likes}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-6">
        <span className="text-[11px] font-serif italic text-emerald-900/40 flex items-center justify-center gap-1.5">
          <MessageCircleHeart className="w-3.5 h-3.5 text-gold-500" />
          Every prayer adds to the barakah of their union
        </span>
      </div>
    </div>
  );
}
