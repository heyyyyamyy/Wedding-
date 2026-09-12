/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  Download,
  Trash2,
  Share2,
  X,
  ArrowLeft,
  Grid,
  LayoutList,
  Sparkles,
  Check,
  Plus,
  AlertCircle,
  Clock,
  Tag,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PhotoItem {
  id: string;
  url: string;
  eventCategory: string;
  uploadedBy: string;
  caption?: string;
  likes?: number;
  createdAt: string;
}

const EVENT_CHIPS = [
  { id: 'All', label: 'All Moments', emoji: '✨' },
  { id: 'Nikah', label: 'Sacred Nikah', emoji: '💍' },
  { id: 'Reception', label: 'Grand Reception', emoji: '👑' },
  { id: 'Baraat Swagat', label: 'Baraat Arrival', emoji: '🎺' },
  { id: 'Candid Moments', label: 'Candid Vibes', emoji: '📸' }
];

const UPLOAD_CATEGORIES = ['Nikah', 'Reception', 'Baraat Swagat', 'Candid Moments'];

export default function WeddingGallery({ onClose }: { onClose: () => void }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');

  // Likes tracking in localStorage
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('Nikah');
  const [uploaderName, setUploaderName] = useState('');
  const [captionText, setCaptionText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox / Detail view state
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  // Copy share link feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Double-tap heart animation indicator
  const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
  const lastTapRef = useRef<{ [key: string]: number }>({});

  // 1. Subscribe to Firestore Gallery
  useEffect(() => {
    // Load local likes
    try {
      const saved = localStorage.getItem('wedding_gallery_likes');
      if (saved) {
        setLikedMap(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: PhotoItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          url: d.data().url,
          eventCategory: d.data().eventCategory || 'Nikah',
          uploadedBy: d.data().uploadedBy || 'Guest',
          caption: d.data().caption || '',
          likes: typeof d.data().likes === 'number' ? d.data().likes : 0,
          createdAt: d.data().createdAt || new Date().toISOString()
        }));
        setPhotos(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore gallery listener notice:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Toggle Like Handler
  const handleToggleLike = async (photo: PhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = likedMap[photo.id] || false;
    const newLiked = !isLiked;

    // Optimistic local state update
    const updatedMap = { ...likedMap, [photo.id]: newLiked };
    setLikedMap(updatedMap);
    try {
      localStorage.setItem('wedding_gallery_likes', JSON.stringify(updatedMap));
    } catch {
      // ignore
    }

    // Update in Firestore
    try {
      const photoRef = doc(db, 'gallery', photo.id);
      await updateDoc(photoRef, {
        likes: increment(newLiked ? 1 : -1)
      });
    } catch (error) {
      console.warn('Error updating likes count:', error);
    }
  };

  // Double tap to like
  const handleImageTouch = (photo: PhotoItem) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[photo.id] || 0;
    if (now - lastTap < 300) {
      // Double tap detected!
      setAnimatingHeartId(photo.id);
      setTimeout(() => setAnimatingHeartId(null), 900);

      if (!likedMap[photo.id]) {
        handleToggleLike(photo);
      }
    }
    lastTapRef.current[photo.id] = now;
  };

  // Delete Photo Handler
  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'gallery', photoToDelete.id));

      // Close modal and detail view if open
      if (selectedPhoto?.id === photoToDelete.id) {
        setSelectedPhoto(null);
      }
      setPhotoToDelete(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Could not delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // File selection and local compression for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Compress & Save to Firestore
  const handlePublishPost = async () => {
    if (!previewImage) {
      alert('Please select a photo first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const img = new Image();
      img.src = previewImage;
      img.onload = async () => {
        setUploadProgress(45);

        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        setUploadProgress(75);

        // Compress to JPEG with 0.65 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);

        if (dataUrl.length > 950000) {
          alert('The image is too large even after compression. Please try another photo.');
          setIsUploading(false);
          return;
        }

        setUploadProgress(90);

        await addDoc(collection(db, 'gallery'), {
          url: dataUrl,
          eventCategory: selectedEvent,
          uploadedBy: uploaderName.trim() || 'Guest',
          caption: captionText.trim() || '',
          likes: 0,
          createdAt: new Date().toISOString()
        });

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setShowUploadModal(false);
          setPreviewImage(null);
          setUploaderName('');
          setCaptionText('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 400);
      };

      img.onerror = () => {
        alert('Failed to process image file.');
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('An error occurred during upload.');
    }
  };

  // Direct download photo
  const handleDownload = (photo: PhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `WeddingMoment_${photo.eventCategory}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(photo.url, '_blank');
    }
  };

  // Share photo
  const handleShare = async (photo: PhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wedding Moment - Saima & Sohail`,
          text: `Check out this photo from ${photo.eventCategory} on Saima & Sohail's wedding gallery!`
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedId(photo.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // ignore
    }
  };

  // Filtered photos
  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((p) => p.eventCategory === activeCategory);

  // Total likes sum
  const totalLikes = photos.reduce((acc, p) => acc + (p.likes || 0), 0);

  // Event category badge styles
  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Nikah':
        return 'bg-emerald-900/10 text-emerald-900 border-emerald-800/20';
      case 'Reception':
        return 'bg-rose-900/10 text-rose-900 border-rose-800/20';
      case 'Baraat Swagat':
        return 'bg-amber-900/10 text-amber-900 border-amber-800/20';
      default:
        return 'bg-gold-900/10 text-gold-900 border-gold-800/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-[#FAF9F6] overflow-y-auto floral-pattern selection:bg-gold-200 selection:text-emerald-950 flex flex-col"
    >
      {/* 1. TOP SOCIAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-gold-200/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gold-200 text-emerald-950 hover:bg-gold-50 hover:border-gold-300 rounded-full transition-all cursor-pointer text-xs font-sans font-semibold uppercase tracking-wider shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gold-600" />
          <span className="hidden sm:inline">Back to Invitation</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Center Title / Branding */}
        <div className="flex flex-col items-center">
          <span className="font-script text-2xl sm:text-3xl text-emerald-950 leading-tight">
            Saima & Sohail
          </span>
          <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-gold-600 font-bold -mt-0.5">
            Wedding Feed
          </span>
        </div>

        {/* View Switcher & Post CTA */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white border border-gold-200 rounded-full p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-emerald-950 text-gold-100 shadow-xs'
                  : 'text-emerald-900/60 hover:text-emerald-950'
              }`}
              title="Feed View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              Feed
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-950 text-gold-100 shadow-xs'
                  : 'text-emerald-900/60 hover:text-emerald-950'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              Grid
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-full font-sans text-xs uppercase tracking-wider font-bold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </header>

      {/* 2. SOCIAL HEADER PROFILE & STATS BANNER */}
      <section className="w-full max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="bg-white/80 backdrop-blur-sm border border-gold-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[3px] shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <span className="font-script text-2xl sm:text-3xl text-emerald-950">
                    S&S
                  </span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-gold-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]">
                💍
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl text-emerald-950 font-bold">
                  Saima & Sohail
                </h1>
                <Sparkles className="w-4 h-4 text-gold-500 fill-gold-400" />
              </div>
              <p className="text-xs font-sans text-emerald-900/60 mt-0.5">
                @SaimaAndSohail2026 • Wedding Memories
              </p>
              <p className="text-xs font-serif italic text-emerald-900/80 mt-1">
                "Cherishing every sacred smile, Dua, and celebration."
              </p>
            </div>
          </div>

          {/* Social Stats Counters */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-gold-100 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-center">
              <span className="block font-serif text-lg font-bold text-emerald-950">
                {photos.length}
              </span>
              <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-900/50">
                Moments
              </span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-lg font-bold text-emerald-950">
                {totalLikes}
              </span>
              <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-900/50">
                Hearts
              </span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-lg font-bold text-emerald-950">
                {new Set(photos.map((p) => p.uploadedBy)).size || 1}
              </span>
              <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-900/50">
                Guests
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STORIES / EVENT FILTER BUBBLE CAROUSEL */}
      <section className="w-full max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {EVENT_CHIPS.map((chip) => {
            const count =
              chip.id === 'All'
                ? photos.length
                : photos.filter((p) => p.eventCategory === chip.id).length;
            const isSelected = activeCategory === chip.id;

            return (
              <button
                key={chip.id}
                onClick={() => setActiveCategory(chip.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950 text-gold-100 shadow-md font-semibold border border-gold-400'
                    : 'bg-white border border-gold-200 text-emerald-900/70 hover:border-gold-300 hover:bg-gold-50/50'
                }`}
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-gold-500 text-white'
                      : 'bg-gold-100 text-emerald-900'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. "SHARE A MEMORY" SOCIAL PROMPT BAR */}
      <section className="w-full max-w-2xl mx-auto px-4 pb-4">
        <div
          onClick={() => setShowUploadModal(true)}
          className="bg-white border border-gold-200/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-gold-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center text-gold-700 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-sans text-emerald-950/60 group-hover:text-emerald-950 transition-colors">
              Captured a special moment? Tap to share with everyone...
            </span>
          </div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gold-700 px-3 py-1.5 bg-gold-50 rounded-lg border border-gold-200 group-hover:bg-gold-500 group-hover:text-white transition-colors">
            Post Photo
          </span>
        </div>
      </section>

      {/* Mobile view toggle */}
      <div className="sm:hidden flex justify-center mb-3">
        <div className="flex items-center bg-white border border-gold-200 rounded-full p-0.5 shadow-xs">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-4 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'feed'
                ? 'bg-emerald-950 text-gold-100 font-semibold'
                : 'text-emerald-900/60'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Feed
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1 rounded-full text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-emerald-950 text-gold-100 font-semibold'
                : 'text-emerald-900/60'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid
          </button>
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gold-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-sans uppercase tracking-widest text-emerald-900/50">
              Loading wedding moments...
            </p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="py-16 px-6 bg-white/70 border border-dashed border-gold-200 rounded-3xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg text-emerald-950 font-bold">
              No photos in {activeCategory} yet
            </h3>
            <p className="text-xs font-sans text-emerald-900/60 max-w-sm">
              Be the very first guest to capture and upload a photo from this part of the wedding!
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-2 px-5 py-2.5 bg-emerald-950 text-gold-100 rounded-full font-sans text-xs uppercase tracking-wider font-semibold shadow-sm hover:bg-emerald-900 transition-colors"
            >
              Upload First Photo
            </button>
          </div>
        ) : viewMode === 'feed' ? (
          /* ========================================================
             FEED VIEW (Social Media Post Cards)
             ======================================================== */
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {filteredPhotos.map((photo) => {
                const isLiked = likedMap[photo.id] || false;
                const heartActive = animatingHeartId === photo.id;

                return (
                  <motion.article
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white border border-gold-200/90 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Post Header: User, Badge, Delete action */}
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-gold-100/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 p-[2px] shadow-xs">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-emerald-950 font-serif font-bold text-sm uppercase">
                            {photo.uploadedBy ? photo.uploadedBy[0] : 'G'}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-semibold text-xs text-emerald-950">
                              {photo.uploadedBy}
                            </span>
                            <span
                              className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(
                                photo.eventCategory
                              )}`}
                            >
                              {photo.eventCategory}
                            </span>
                          </div>
                          <span className="text-[10px] font-sans text-emerald-900/50 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(photo.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Direct Delete Button with Tooltip */}
                      <button
                        onClick={() => setPhotoToDelete(photo)}
                        className="flex items-center gap-1 px-2.5 py-1 text-rose-600/70 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-full text-xs font-sans transition-all cursor-pointer group"
                        title="Delete this photo"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium hidden sm:inline">
                          Delete
                        </span>
                      </button>
                    </div>

                    {/* Post Image with Double-Tap Heart Support */}
                    <div
                      className="relative w-full bg-black/5 overflow-hidden select-none cursor-pointer flex items-center justify-center min-h-[280px]"
                      onClick={() => handleImageTouch(photo)}
                      onDoubleClick={() => {
                        setAnimatingHeartId(photo.id);
                        setTimeout(() => setAnimatingHeartId(null), 900);
                        if (!likedMap[photo.id]) handleToggleLike(photo);
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={`Wedding moment uploaded by ${photo.uploadedBy}`}
                        className="w-full max-h-[580px] object-contain object-center"
                        loading="lazy"
                      />

                      {/* Double Tap Floating Heart Animation */}
                      <AnimatePresence>
                        {heartActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0.5, 1.3, 1], opacity: [0, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                          >
                            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-xl" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Post Action Bar */}
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={(e) => handleToggleLike(photo, e)}
                          className="flex items-center gap-1.5 text-xs font-sans transition-all cursor-pointer group"
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            className={`w-5 h-5 transition-all duration-300 ${
                              isLiked
                                ? 'text-rose-500 fill-rose-500 scale-110'
                                : 'text-emerald-950/70 group-hover:text-rose-500 group-hover:scale-110'
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isLiked ? 'text-rose-600' : 'text-emerald-950/80'
                            }`}
                          >
                            {photo.likes || 0}
                          </span>
                        </button>

                        {/* Download Photo */}
                        <button
                          onClick={(e) => handleDownload(photo, e)}
                          className="flex items-center gap-1 text-xs font-sans text-emerald-950/70 hover:text-gold-700 transition-colors cursor-pointer"
                          title="Download photo"
                          aria-label="Download"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline text-[11px]">Save</span>
                        </button>

                        {/* Share */}
                        <button
                          onClick={(e) => handleShare(photo, e)}
                          className="flex items-center gap-1 text-xs font-sans text-emerald-950/70 hover:text-emerald-950 transition-colors cursor-pointer"
                          title="Share memory"
                          aria-label="Share"
                        >
                          {copiedId === photo.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline text-[11px]">
                            {copiedId === photo.id ? 'Copied' : 'Share'}
                          </span>
                        </button>
                      </div>

                      {/* Expand / View High Res */}
                      <button
                        onClick={() => setSelectedPhoto(photo)}
                        className="text-[11px] font-sans text-gold-700 hover:text-gold-800 font-medium cursor-pointer"
                      >
                        Enlarge view
                      </button>
                    </div>

                    {/* Post Caption & Details */}
                    <div className="px-4 pb-4 pt-1">
                      {photo.caption ? (
                        <p className="text-xs sm:text-sm font-sans text-emerald-950 leading-relaxed">
                          <span className="font-bold mr-1.5">{photo.uploadedBy}</span>
                          {photo.caption}
                        </p>
                      ) : (
                        <p className="text-xs font-serif italic text-emerald-900/60">
                          Shared a cherished moment from {photo.eventCategory}.
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-sans text-gold-600/90 font-medium">
                          #SaimaAndSohail2026
                        </span>
                        <span className="text-[10px] font-sans text-emerald-900/50">
                          #{photo.eventCategory.replace(/\s+/g, '')}
                        </span>
                        <span className="text-[10px] font-sans text-emerald-900/50">
                          #FamilyMemories
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* ========================================================
             GRID VIEW (Instagram Profile 3-Column Grid)
             ======================================================== */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <AnimatePresence>
              {filteredPhotos.map((photo) => {
                const isLiked = likedMap[photo.id] || false;

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative group aspect-square rounded-2xl overflow-hidden bg-gold-50 border border-gold-200/80 shadow-xs cursor-pointer"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Wedding moment'}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Social Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 text-white">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                          {photo.eventCategory}
                        </span>

                        {/* Quick Delete icon in Grid */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(photo);
                          }}
                          className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-1">
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLiked ? 'text-rose-400 fill-rose-400' : 'text-white'
                            }`}
                          />
                          <span>{photo.likes || 0}</span>
                        </div>
                        <span className="text-[10px] opacity-80 truncate max-w-[80px]">
                          {photo.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ========================================================
          UPLOAD POST MODAL
          ======================================================== */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF9F6] w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative border border-gold-200 my-8"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gold-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gold-600" />
                  <h3 className="font-serif text-lg text-emerald-950 font-bold">
                    Create New Post
                  </h3>
                </div>
                <button
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  className="p-1.5 rounded-full text-emerald-950/50 hover:text-emerald-950 hover:bg-gold-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 flex flex-col gap-4">
                {/* Image Picker / Live Preview */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gold-300 max-h-64 bg-black/5 flex items-center justify-center group">
                      <img
                        src={previewImage}
                        alt="Upload preview"
                        className="max-h-64 w-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer shadow-md"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-44 border-2 border-dashed border-gold-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gold-50/70 hover:border-gold-500 transition-all cursor-pointer bg-white group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-gold-600" />
                      </div>
                      <span className="text-xs font-sans font-semibold text-emerald-950">
                        Choose photo from phone or computer
                      </span>
                      <span className="text-[10px] font-sans text-emerald-900/50 uppercase tracking-wider">
                        Auto-optimized for instant sharing
                      </span>
                    </button>
                  )}
                </div>

                {/* Event Category Selector */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest text-emerald-900/70 font-semibold mb-1.5">
                    Which Wedding Event?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {UPLOAD_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedEvent(cat)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                          selectedEvent === cat
                            ? 'bg-emerald-950 text-gold-100 font-semibold border border-gold-400 shadow-xs'
                            : 'bg-white border border-gold-200 text-emerald-900/70 hover:bg-gold-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Name */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest text-emerald-900/70 font-semibold mb-1">
                    Your Name / Relation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Farhan, Groom's Cousin"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-white border border-gold-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-emerald-950 focus:outline-none focus:border-gold-500 transition-all"
                  />
                </div>

                {/* Caption / Memory Note */}
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-widest text-emerald-900/70 font-semibold mb-1">
                    Caption or Dua (Optional)
                  </label>
                  <textarea
                    placeholder="Write a lovely memory, quote, or blessing for Saima & Sohail..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    disabled={isUploading}
                    rows={2}
                    className="w-full bg-white border border-gold-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-emerald-950 focus:outline-none focus:border-gold-500 transition-all resize-none"
                  />
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="w-full flex flex-col gap-1.5 pt-2">
                    <div className="w-full bg-gold-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gold-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-sans text-center text-gold-700 font-semibold uppercase tracking-wider">
                      Publishing to wedding feed... {uploadProgress}%
                    </span>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  onClick={handlePublishPost}
                  disabled={isUploading || !previewImage}
                  className="w-full mt-2 py-3 bg-emerald-950 hover:bg-emerald-900 disabled:opacity-50 text-gold-100 font-sans text-xs uppercase tracking-widest font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-300" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  )}
                  <span>Post to Wedding Feed</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          DELETE CONFIRMATION DIALOG
          ======================================================== */}
      <AnimatePresence>
        {photoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gold-200 text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-serif text-lg text-emerald-950 font-bold">
                  Delete this photo?
                </h4>
                <p className="text-xs font-sans text-emerald-900/60 mt-1.5 leading-relaxed">
                  Are you sure you want to remove this memory from the wedding gallery? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-full border border-gold-200 text-xs font-sans font-semibold text-emerald-950 hover:bg-gold-50 transition-colors cursor-pointer"
                >
                  Keep Photo
                </button>

                <button
                  type="button"
                  onClick={confirmDeletePhoto}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-sans font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          FULL SCREEN LIGHTBOX / ENLARGED VIEW
          ======================================================== */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20 cursor-pointer backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Preview */}
            <div className="w-full max-w-3xl max-h-[75vh] flex flex-col items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt="Enlarged wedding moment"
                className="max-w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Bottom Meta & Actions */}
            <div className="w-full max-w-3xl mt-4 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold">
                    {selectedPhoto.uploadedBy}
                  </span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/30 text-gold-300 border border-gold-400/30">
                    {selectedPhoto.eventCategory}
                  </span>
                </div>
                {selectedPhoto.caption && (
                  <p className="text-xs font-sans opacity-85 mt-0.5">
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleToggleLike(selectedPhoto, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-xs font-sans transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedMap[selectedPhoto.id]
                        ? 'text-rose-400 fill-rose-400'
                        : 'text-white'
                    }`}
                  />
                  <span>{selectedPhoto.likes || 0}</span>
                </button>

                <button
                  onClick={(e) => handleDownload(selectedPhoto, e)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-white rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    setPhotoToDelete(selectedPhoto);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/70 hover:bg-rose-600 rounded-full text-xs font-sans transition-colors cursor-pointer"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
