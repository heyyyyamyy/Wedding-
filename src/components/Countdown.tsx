import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { CountdownTime } from '../types';

interface CountdownProps {
  targetDate: string; // ISO string or parsable date
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  if (timeLeft.isCompleted) {
    return (
      <div className="text-center py-6">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-serif text-2xl md:text-3xl text-gold-600 tracking-wide font-semibold"
        >
          The Wedding Celebration is Live! 🎉
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6 flex items-center gap-2"
      >
        <Clock className="w-5 h-5 text-gold-500 animate-pulse" />
        <span className="text-xs tracking-[0.25em] font-sans uppercase font-medium text-emerald-800/80">
          Counting Down to the Big Day
        </span>
      </motion.div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-xl w-full px-2">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            {/* Countdown card */}
            <div className="relative w-full aspect-square sm:aspect-auto sm:h-28 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm border border-gold-200/50 rounded-2xl shadow-md p-2 sm:p-4 overflow-hidden group hover:border-gold-400/80 transition-colors duration-300">
              {/* Decorative soft gold inner glow/shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold-50/10 to-gold-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-emerald-950 tracking-tight z-10">
                {String(unit.value).padStart(2, '0')}
              </span>
              
              <div className="w-6 h-[1px] bg-gold-300/60 my-1 sm:my-2 z-10" />
              
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase font-sans font-medium text-emerald-900/60 z-10">
                {unit.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
