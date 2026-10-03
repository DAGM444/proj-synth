import React, { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const lines = [
  { time: 0, text: "City lights blur in the rear view" },
  { time: 12, text: "Engine hums a quiet tune for two" },
  { time: 24, text: "We were chasing something brighter" },
  { time: 36, text: "Underneath a violet sky" },
  { time: 48, text: "Every mile a small reminder" },
  { time: 62, text: "Of the dreams we left behind" },
  { time: 74, text: "Midnight drive, hold the night" },
  { time: 86, text: "Let the highway be our guide" },
  { time: 98, text: "And the stars fall like rain" },
  { time: 110, text: "Washing over every pain" },
  { time: 124, text: "So we ride, so we ride" },
  { time: 138, text: "Through the dark we come alive" },
  { time: 152, text: "Hold the night, hold the night" },
  { time: 166, text: "Till the morning breaks the silence" },
];

export default function FullScreenLyrics({ open, onClose, track }) {
  const activeRef = useRef(null);
  const activeIndex = 7;

  // Keyboard shortcut listener (Escape to close) with cleanup
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Smooth scroll active lyric into view with timer and animation frame cleanup
  useEffect(() => {
    if (!open || !activeRef.current) return;

    let animFrameId = null;
    const timerId = setTimeout(() => {
      animFrameId = requestAnimationFrame(() => {
        if (activeRef.current) {
          activeRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [open, activeIndex]);

  if (!open) return null;

  const trackData = track || {
    title: "Midnight Drive",
    artist: "Neon Waves",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop",
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Dynamic blurred ambient background from track thumbnail */}
      <div
        className="absolute inset-0 scale-125 blur-3xl bg-cover bg-center opacity-50 transition-all duration-700"
        style={{ backgroundImage: `url(${trackData.cover})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Track context header */}
        <header className="flex items-center justify-between px-5 md:px-8 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={trackData.cover}
              alt={trackData.title}
              className="w-10 h-10 rounded-md object-cover shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {trackData.title}
              </p>
              <p className="text-white/60 text-xs truncate">{trackData.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
            aria-label="Close lyrics"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </header>

        {/* Synced lyrics */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6">
          <div className="min-h-full flex flex-col justify-center items-center py-16 gap-5 md:gap-7">
            {lines.map((l, i) => {
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              return (
                <p
                  key={i}
                  ref={isActive ? activeRef : null}
                  className={`text-center text-2xl md:text-4xl lg:text-5xl font-heading leading-snug max-w-2xl transition-all duration-300 ${
                    isActive
                      ? "text-white font-bold scale-105"
                      : isPast
                      ? "text-white/30 font-medium"
                      : "text-white/40 font-medium"
                  }`}
                >
                  {l.text}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}