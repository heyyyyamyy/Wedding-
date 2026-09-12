import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Upload, X, Download, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EVENT_CATEGORIES = ['All', 'Nikah', 'Reception', 'Baraat Swagat', 'Candid Moments'];
const UPLOAD_CATEGORIES = ['Nikah', 'Reception', 'Baraat Swagat', 'Candid Moments'];

interface PhotoItem {
  id: string;
  url: string;
  eventCategory: string;
  uploadedBy: string;
  createdAt: string;
}

export default function WeddingGallery({ onClose }: { onClose: () => void }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState('Nikah');
  const [uploaderName, setUploaderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<PhotoItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PhotoItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        url: d.data().url,
        eventCategory: d.data().eventCategory,
        uploadedBy: d.data().uploadedBy,
        createdAt: d.data().createdAt,
      }));
      setPhotos(items);
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Indicate start

    try {
      // Compress image client-side to fit within Firestore's 1MB limit
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          setUploadProgress(40); // Image loaded in memory
          
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
          
          setUploadProgress(70); // Image compressed

          // Output as jpeg, quality 0.6 (typically < 200kb)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          if (dataUrl.length > 1000000) {
             alert("Even after compression, the image is too large. Please select a smaller photo.");
             setIsUploading(false);
             return;
          }

          setUploadProgress(90); // Saving to database

          try {
            await addDoc(collection(db, 'gallery'), {
              url: dataUrl,
              eventCategory: selectedEvent,
              uploadedBy: uploaderName || 'Guest',
              createdAt: new Date().toISOString(),
            });
            
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setShowUploadModal(false);
              setUploaderName('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }, 500);
          } catch (dbError) {
             console.error("Firestore save error:", dbError);
             alert("Failed to save image to the gallery database.");
             setIsUploading(false);
          }
        };
        img.onerror = () => {
          alert("Failed to process the image file.");
          setIsUploading(false);
        };
      };
      reader.onerror = () => {
         alert("Failed to read the image file.");
         setIsUploading(false);
      };

    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("An error occurred during upload processing.");
    }
  };

  const filteredPhotos = activeTab === 'All' 
    ? photos 
    : photos.filter(p => p.eventCategory === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[150] bg-[#FAF9F6] overflow-y-auto floral-pattern selection:bg-gold-200 selection:text-emerald-950"
    >
      <div className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-gold-200/50 px-4 sm:px-8 py-4 flex items-center shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gold-200 text-emerald-900 hover:bg-gold-50 hover:border-gold-300 rounded-full transition-all cursor-pointer text-xs sm:text-sm font-sans font-semibold uppercase tracking-widest shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-gold-600" />
          Back to Invitation
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center py-12">
        <div className="text-center mb-8">
        <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600">
          Capture the Magic
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-emerald-950 font-bold tracking-wide mt-1">
          Wedding Gallery
        </h2>
        <div className="w-12 h-[2px] bg-gold-400 mx-auto mt-3" />
        <p className="text-sm font-serif italic text-emerald-900/60 mt-4 max-w-md mx-auto px-4">
          Share your favorite memories and candid moments from the celebrations with us.
        </p>
      </div>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUploadModal(true)}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-emerald-900 text-gold-50 rounded-full font-sans text-xs uppercase tracking-widest font-semibold shadow-lg hover:bg-emerald-950 transition-colors cursor-pointer"
      >
        <Camera className="w-4 h-4" />
        Upload Photo
      </motion.button>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 px-4 w-full">
        {EVENT_CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === category
                ? 'bg-gold-500 text-white shadow-md font-bold'
                : 'bg-white border border-gold-200 text-emerald-900 hover:bg-gold-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Photo Grid (Masonry using CSS Columns) */}
      <div className="w-full px-4 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        <AnimatePresence>
          {filteredPhotos.map((photo) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={photo.id}
              className="relative group break-inside-avoid rounded-2xl overflow-hidden bg-gold-50 border border-gold-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              onClick={() => setSelectedImage(photo)}
            >
              <img 
                src={photo.url} 
                alt="Wedding Moment" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-white font-serif text-sm drop-shadow-md">
                  {photo.eventCategory}
                </span>
                <span className="text-gold-200 text-[10px] font-sans tracking-wide uppercase drop-shadow-md">
                  By {photo.uploadedBy}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPhotos.length === 0 && (
        <div className="py-12 flex flex-col items-center text-center opacity-60">
          <ImageIcon className="w-12 h-12 text-gold-400 mb-3" />
          <p className="font-serif italic text-emerald-900">No photos shared yet for this event.</p>
          <p className="text-xs font-sans mt-1 text-emerald-900/60 uppercase tracking-widest">Be the first to upload!</p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FAF9F6] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative border border-gold-200"
            >
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full text-emerald-900/50 hover:text-emerald-900 hover:bg-gold-50 transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 flex flex-col gap-6 text-center pt-10">
                <div>
                  <h3 className="font-serif text-2xl text-emerald-950">Upload a Photo</h3>
                  <p className="text-xs font-sans text-emerald-900/60 mt-1 uppercase tracking-wider">
                    Add to our shared memories
                  </p>
                </div>

                <div className="flex flex-col gap-4 text-left">
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-widest text-emerald-900/70 font-semibold mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aunt Sarah"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      disabled={isUploading}
                      className="w-full bg-white border border-gold-200 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-widest text-emerald-900/70 font-semibold mb-1">
                      Which Event?
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      disabled={isUploading}
                      className="w-full bg-white border border-gold-200 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all cursor-pointer"
                    >
                      {UPLOAD_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {isUploading ? (
                      <div className="w-full h-32 border-2 border-dashed border-gold-300 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gold-50/50">
                        <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                        <div className="w-3/4 bg-gold-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gold-500 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-gold-700 uppercase tracking-widest">
                          Uploading {uploadProgress}%
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gold-400/50 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gold-50 hover:border-gold-500 transition-all cursor-pointer group bg-white"
                      >
                        <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4 text-gold-600" />
                        </div>
                        <span className="text-xs font-sans font-medium text-emerald-900">
                          Select an image from device
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox / Full Image View */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 cursor-pointer backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center relative">
              <img 
                src={selectedImage.url} 
                alt="Enlarged Wedding Moment" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white translate-y-full pt-12 flex justify-between items-end">
                <div>
                  <h4 className="font-serif text-2xl drop-shadow-md">{selectedImage.eventCategory}</h4>
                  <p className="text-sm font-sans opacity-80 uppercase tracking-widest mt-1">Uploaded by {selectedImage.uploadedBy}</p>
                </div>
                <a 
                  href={selectedImage.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-white rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-colors shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
