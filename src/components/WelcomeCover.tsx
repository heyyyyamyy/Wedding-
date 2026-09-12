import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Heart } from 'lucide-react';

export default function WelcomeCover({ onOpen }: { onOpen: () => void }) {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    setIsOpened(true);
    // Give time for the ribbon to untie and doors to open before triggering main app
    setTimeout(() => {
      onOpen();
    }, 1500); 
  };

  return (
    <AnimatePresence>
      {!isOpened && (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col items-center justify-center overflow-hidden floral-pattern"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
        >
          {/* Top and Bottom Decorative Overlays */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#FAF4E6] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#F4EFE0] to-transparent pointer-events-none" />

          {/* Left Door */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#FAF9F6] border-r border-gold-200/50 shadow-2xl floral-pattern z-10"
            exit={{ x: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Left Ribbon */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 left-0 h-8 bg-gold-200/40 border-y border-gold-300 shadow-sm" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#FAF9F6] border-l border-gold-200/50 shadow-2xl floral-pattern z-10"
            exit={{ x: '100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          >
             {/* Right Ribbon */}
             <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-gold-200/40 border-y border-gold-300 shadow-sm" />
          </motion.div>

          {/* Center Content & Knot (sits above the doors) */}
          <motion.div
            className="relative z-20 flex flex-col items-center gap-12 p-8"
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          >
            <div className="text-center">
              <p className="text-xs sm:text-sm tracking-[0.3em] font-sans uppercase font-bold text-gold-600 mb-6 drop-shadow-sm">
                You are invited
              </p>
              <h1 className="font-script text-6xl sm:text-7xl md:text-8xl gold-gradient-text drop-shadow-md pb-2">
                Saima & Sohail
              </h1>
            </div>

            {/* The Knot Button */}
            <div className="relative">
              {/* Outer decorative ring */}
              <div className="absolute inset-[-10px] rounded-full border border-dashed border-gold-400/60 animate-[spin_10s_linear_infinite]" />
              
              <button
                onClick={handleOpen}
                className="relative group flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF9F6] border-2 border-gold-400 shadow-xl hover:shadow-gold-500/30 transition-all duration-500 cursor-pointer hover:scale-110 overflow-hidden"
              >
                {/* Ribbon tails purely for decoration */}
                <div className="absolute -left-3 bottom-2 w-8 h-8 bg-gold-100 rounded-sm border border-gold-300 rotate-45 -z-10 group-hover:-translate-x-1 transition-transform" />
                <div className="absolute -right-3 bottom-2 w-8 h-8 bg-gold-100 rounded-sm border border-gold-300 -rotate-45 -z-10 group-hover:translate-x-1 transition-transform" />
                
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-gold-500 fill-gold-100 mb-1 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-widest text-emerald-950 font-semibold group-hover:text-gold-700 transition-colors">
                  Open
                </span>
              </button>
            </div>
            
            <p className="text-[10px] sm:text-xs font-sans text-emerald-900/50 uppercase tracking-[0.2em] animate-pulse drop-shadow-sm">
              Tap to untie ribbon
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
