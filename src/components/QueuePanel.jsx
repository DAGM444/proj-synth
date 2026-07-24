import React from "react";
import { X } from "lucide-react";

const queue = [
  { title: "Solar Flare", artist: "Cosmos", duration: "3:12" },
  { title: "Urban Echo", artist: "City Lights", duration: "4:05" },
  { title: "Arctic Dawn", artist: "Polar Sound", duration: "2:58" },
  { title: "Velvet Hour", artist: "Lounge Set", duration: "3:40" },
];

export default function QueuePanel({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/50"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm h-full bg-[#181818] border-l border-[#282828] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828]">
          <h2 className="text-white font-heading font-bold text-lg">Queue</h2>
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-[#282828]">
          <p className="text-[10px] uppercase tracking-wider text-[#b3b3b3] mb-1">
            Now playing
          </p>
          <p className="text-white text-sm font-medium">Midnight Drive</p>
          <p className="text-[#b3b3b3] text-xs">Neon Waves</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
          <p className="text-[10px] uppercase tracking-wider text-[#b3b3b3] px-3 py-2">
            Next up
          </p>
          {queue.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#282828] transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{t.title}</p>
                <p className="text-[#b3b3b3] text-xs truncate">{t.artist}</p>
              </div>
              <span className="text-[#b3b3b3] text-xs tabular-nums">
                {t.duration}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}