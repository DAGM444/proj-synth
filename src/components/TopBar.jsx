import React from "react";
import { ChevronLeft, ChevronRight, Search, User } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 md:px-8 py-3 bg-transparent sticky top-0 z-20">
      {/* Navigation arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727272]" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full bg-[#1a1a1a] text-white text-sm rounded-full pl-10 pr-4 py-2.5 placeholder:text-[#727272] focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-all"
          />
        </div>
      </div>

      {/* User avatar */}
      <button className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center hover:bg-[#333] transition-colors shrink-0">
        <User className="w-4 h-4 text-[#b3b3b3]" />
      </button>
    </header>
  );
}