import React from "react";
import { Play } from "lucide-react";

export default function QuickAccessCard({ image, title }) {
  return (
    <div className="group flex items-center gap-3 bg-[#ffffff0d] hover:bg-[#ffffff1a] rounded-md overflow-hidden cursor-pointer transition-colors">
      <div className="w-12 h-12 shrink-0 bg-[#282828] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <span className="text-white text-sm font-semibold truncate flex-1 pr-2">
        {title}
      </span>
      <button className="mr-3 w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hover:scale-105 shrink-0">
        <Play className="w-3.5 h-3.5 text-black ml-0.5" />
      </button>
    </div>
  );
}