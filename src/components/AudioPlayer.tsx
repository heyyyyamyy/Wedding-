/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Pause, 
  Play, 
  RotateCcw,
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Youtube,
  Tv,
  Disc,
  Headphones
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YOUTUBE_VIDEO_ID = '1LVpuWpRs3I';
const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=1LVpuWpRs3I';
const SONG_TITLE = 'Din Shagna Da';
const ARTIST_NAME = 'Jasleen Royal • Phillauri (Wedding Theme)';
const START_SECONDS = 24; // Starts from 0:24 timestamp

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const playerRef = useRef<any>(null);
  const hasTriggeredPlay = useRef(false);

  // Play audio helper with safety checks
  const playSong = useCallback((seekToStart = false) => {
    if (!playerRef.current) return;
    try {
      if (seekToStart && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(START_SECONDS, true);
      }
      if (typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(Math.round(volume * 100));
      }
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
      setIsPlaying(true);
      setIsAutoplayBlocked(false);
    } catch (err) {
      console.warn('Playback error:', err);
    }
  }, [volume]);

  // Initialize YouTube IFrame API and auto-play on load
  useEffect(() => {
    let checkInterval: any = null;

    const initPlayer = () => {
      if (playerRef.current) return;
      try {
        if (!window.YT || !window.YT.Player) return;

        playerRef.current = new window.YT.Player('youtube-bg-audio-container', {
          height: '200',
          width: '320',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 1,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            playsinline: 1,
            start: START_SECONDS,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setIsReady(true);
              try {
                event.target.setVolume(Math.round(volume * 100));
                event.target.seekTo(START_SECONDS, true);
                
                // Attempt instant autoplay
                const playResult = event.target.playVideo();
                // Check if browser blocked audio autoplay
                if (playResult && typeof playResult.catch === 'function') {
                  playResult
                    .then(() => {
                      setIsPlaying(true);
                      setIsAutoplayBlocked(false);
                    })
                    .catch(() => {
                      setIsAutoplayBlocked(true);
                    });
                } else {
                  setIsPlaying(true);
                }
              } catch {
                setIsAutoplayBlocked(true);
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
                setIsAutoplayBlocked(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Loop continuously starting from "Din Shagna Da"
                event.target.seekTo(START_SECONDS, true);
                event.target.playVideo();
                setIsPlaying(true);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player notification:', err);
            },
          },
        });
      } catch (err) {
        console.warn('Error setting up YouTube player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [volume]);

  // BROWSER AUTOPLAY POLICY UNLOCKER:
  // Browsers block audio until the first user gesture (touch, click, scroll).
  // This listener immediately begins/unmutes "Din Shagna Da" on the very first interaction anywhere.
  useEffect(() => {
    const handleUserGesture = () => {
      if (hasTriggeredPlay.current) return;
      hasTriggeredPlay.current = true;

      if (playerRef.current) {
        playSong(false);
      }
    };

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('scroll', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('scroll', handleUserGesture);
    };
  }, [playSong]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playSong(false);
      }
    } catch (e) {
      console.warn('Toggle play error:', e);
    }
  };

  const restartFromDinShagnaDa = () => {
    playSong(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted) setIsMuted(false);

    if (playerRef.current && playerRef.current.setVolume) {
      try {
        if (playerRef.current.unMute) playerRef.current.unMute();
        playerRef.current.setVolume(Math.round(newVol * 100));
      } catch {}
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        setIsMuted(false);
        if (playerRef.current.unMute) playerRef.current.unMute();
        if (playerRef.current.setVolume) playerRef.current.setVolume(Math.round(volume * 100));
      } else {
        setIsMuted(true);
        if (playerRef.current.mute) playerRef.current.mute();
      }
    } catch {}
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {/* PERSISTENT YOUTUBE AUDIO CONTAINER
          Note: Maintained at non-zero dimensions with ultra-low opacity off-screen
          so YouTube Iframe API never throttles or pauses background playback. */}
      <div 
        className={
          showVideo && isExpanded
            ? 'hidden' // When expanded in custom preview frame
            : 'fixed -bottom-[9999px] -right-[9999px] w-[320px] h-[200px] opacity-[0.001] pointer-events-none'
        }
      >
        <div id="youtube-bg-audio-container" className="w-full h-full" />
      </div>

      {/* Floating Header Audio Pill */}
      <div className="flex items-center gap-2">
        {/* If browser blocked autoplay before user click, show gentle pulsing invitation to activate sound */}
        {isAutoplayBlocked && !isPlaying && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => playSong(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 text-emerald-950 font-serif font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-gold-300 cursor-pointer animate-pulse"
            title="Click to play wedding music"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950 animate-spin" />
            <span>Tap to Play <strong>Din Shagna Da</strong></span>
          </motion.button>
        )}

        {/* Main Floating Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex items-center"
        >
          <button
            onClick={togglePlay}
            className={`h-11 px-3.5 sm:px-4 rounded-full border shadow-lg cursor-pointer transition-all duration-300 flex items-center gap-2.5 relative group ${
              isPlaying
                ? 'bg-emerald-950 border-gold-400 text-gold-200 shadow-gold-500/20 shadow-xl'
                : 'bg-white/95 backdrop-blur-md border-gold-300 hover:border-gold-500 text-emerald-950 hover:bg-gold-50/50'
            }`}
            title={isPlaying ? 'Pause Din Shagna Da' : 'Play Din Shagna Da (Always-Playing Wedding Song)'}
          >
            {/* Live Equalizer Animation when playing */}
            {isPlaying ? (
              <div className="flex items-end gap-[3px] h-4">
                <span className="w-[3px] bg-gold-400 rounded-full animate-[bounce_0.8s_infinite] h-3" />
                <span className="w-[3px] bg-gold-300 rounded-full animate-[bounce_0.6s_infinite_0.2s] h-4" />
                <span className="w-[3px] bg-gold-400 rounded-full animate-[bounce_0.9s_infinite_0.4s] h-2.5" />
                <span className="w-[3px] bg-gold-300 rounded-full animate-[bounce_0.7s_infinite_0.1s] h-3.5" />
              </div>
            ) : (
              <Music className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform" />
            )}

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-serif font-bold tracking-wide leading-tight flex items-center gap-1">
                {isPlaying ? 'Playing: Din Shagna Da' : 'Din Shagna Da'}
              </span>
              <span className="text-[9px] font-sans uppercase tracking-widest text-gold-500 font-semibold hidden sm:block">
                {isPlaying ? 'Continuous Background Music' : 'Wedding Song'}
              </span>
            </div>

            {/* Ripple ring animation */}
            {isPlaying && (
              <span className="absolute -inset-1 rounded-full border border-gold-400/40 animate-ping pointer-events-none" />
            )}
          </button>

          {/* Quick toggle to expand track control */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 p-2 bg-white/90 hover:bg-gold-50 border border-gold-200 rounded-full shadow-md text-gold-700 cursor-pointer transition-colors"
            title="Music Settings & YouTube Track"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Expandable Music Player Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mt-3 w-80 sm:w-96 bg-white/98 backdrop-blur-md border border-gold-200/90 rounded-2xl shadow-2xl p-4 text-emerald-950 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Disc className={`w-4 h-4 text-gold-600 ${isPlaying ? 'animate-spin' : ''}`} />
                <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-gold-700">
                  Always-Playing Wedding Song
                </span>
              </div>
              <a
                href={YOUTUBE_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                title="Open on YouTube"
              >
                <Youtube className="w-3.5 h-3.5 text-rose-600" />
                <span>YouTube</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>

            {/* Current Song Details Card */}
            <div className="bg-gradient-to-r from-gold-50/70 via-gold-50/40 to-emerald-50/40 border border-gold-200/70 rounded-xl p-3 mb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-serif font-bold text-emerald-950">
                    {SONG_TITLE}
                  </h4>
                  <p className="text-[11px] text-emerald-900/70 mt-0.5 font-sans">
                    {ARTIST_NAME}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
                      <Youtube className="w-2.5 h-2.5" /> Official Wedding Track
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <Headphones className="w-2.5 h-2.5" /> Auto-Loop
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-emerald-950 hover:bg-emerald-900 text-gold-300 shadow-md transition-all cursor-pointer hover:scale-105"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 translate-x-0.5" />
                    )}
                  </button>

                  <button
                    onClick={restartFromDinShagnaDa}
                    className="p-1.5 text-xs text-gold-700 hover:text-gold-900 rounded-lg hover:bg-gold-100/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Restart from beginning (0:24)"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[10px] font-sans">0:24</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action: Restart explicitly from 0:24 timestamp */}
            <div className="mb-3">
              <button
                onClick={restartFromDinShagnaDa}
                className="w-full py-2 px-3 rounded-xl bg-gold-100/70 hover:bg-gold-200/70 text-emerald-950 border border-gold-300 text-xs font-serif font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gold-700" />
                <span>Restart from 0:24</span>
              </button>
            </div>

            {/* Optional Embedded Video Screen Preview */}
            {showVideo ? (
              <div className="mb-3 rounded-xl overflow-hidden border border-gold-200 aspect-video bg-black shadow-inner">
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&enablejsapi=1&start=${START_SECONDS}`}
                  title="Din Shagna Da - Jasleen Royal"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Controls Bar: Video Toggle & Volume */}
            <div className="space-y-2.5 pt-1 border-t border-gold-100">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium text-emerald-900/70 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 text-gold-600" />
                  <span>{showVideo ? 'Hide Video Preview' : 'Show Video Preview'}</span>
                </button>

                <span className="text-[10px] font-mono text-emerald-900/60 font-medium">
                  {isPlaying ? '● Continuous Playing' : '○ Paused'}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={toggleMute}
                  className="text-gold-600 hover:text-gold-800 cursor-pointer transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-gold-500 h-1.5 bg-gold-100 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-emerald-900/60 w-7 text-right">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
