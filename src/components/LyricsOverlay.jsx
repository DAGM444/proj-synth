import React from "react";
import { X } from "lucide-react";

const lines = [
  { time: "0:00", text: "City lights blur in the rear view", active: false },
  { time: "0:12", text: "Engine hums a quiet tune for two", active: false },
  { time: "0:24", text: "We were chasing something brighter", active: false },
  { time: "0:36", text: "Underneath a violet sky", active: false },
  { time: "0:48", text: "Every mile a small reminder", active: false },
  { time: "1:02", text: "Of the dreams we left behind", active: true },
  { time: "1:14", text: "Midnight drive, hold the night", active: false },
  { time: "1:26", text: "Let the highway be our guide", active: false },
  { time: "1:38", text: "And the stars fall like rain", active: false },
  { time: "1:50", text: "Washing over every pain", active: false },
  { time: "2:04", text: "So we ride, so we ride", active: false },
  { time: "2:18", text: "Through the dark we come alive", active: false },
];

export default function LyricsOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[80vh] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-[#282828] flex flex-col overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pt-6 pb-3 border-b border-[#282828]">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop"
              alt="Album"
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <p className="text-white font-heading font-bold text-lg">
                Midnight Drive
              </p>
              <p className="text-[#b3b3b3] text-xs">Neon Waves</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-3">
          {lines.map((l) => (
            <div
              key={l.time}
              className={`flex items-start gap-4 transition-colors ${
                l.active ? "text-white" : "text-[#727272]"
              }`}
            >
              <span className="text-xs tabular-nums pt-1 shrink-0 text-[#535353]">
                {l.time}
              </span>
              <p
                className={`text-base leading-relaxed ${
                  l.active ? "font-bold scale-105 origin-left" : ""
                }`}
              >
                {l.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}