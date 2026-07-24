import React, { useState } from "react";
import { Play, MoreHorizontal, Plus, Clock } from "lucide-react";

export default function SongRow({ index, title, artist, duration, cover }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group grid grid-cols-[24px_1fr_auto] md:grid-cols-[24px_1fr_auto_auto] items-center gap-3 md:gap-4 px-2 md:px-3 py-2 rounded-md hover:bg-[#ffffff1a] transition-colors cursor-pointer">
      {/* Index / Play */}
      <div className="w-6 flex items-center justify-center">
        <span className="text-[#b3b3b3] text-sm tabular-nums group-hover:hidden">
          {index}
        </span>
        <Play className="w-3.5 h-3.5 text-white hidden group-hover:block ml-0.5" />
      </div>

      {/* Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={cover}
          alt={title}
          className="w-10 h-10 rounded shrink-0 object-cover"
        />
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <p className="text-[#b3b3b3] text-xs truncate">{artist}</p>
        </div>
      </div>

      {/* Duration */}
      <div className="hidden md:flex items-center gap-2 text-[#b3b3b3] text-sm tabular-nums">
        <Clock className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
        {duration}
      </div>

      {/* Add to playlist menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((m) => !m);
          }}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors rounded-full opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-40 w-44 bg-[#282828] rounded-md shadow-2xl border border-[#3a3a3a] py-1 text-sm">
              <button className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-white hover:bg-[#3a3a3a] transition-colors">
                <Plus className="w-4 h-4" /> Add to playlist
              </button>
              <button className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white transition-colors">
                <Play className="w-4 h-4" /> Play next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}