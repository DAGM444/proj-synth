import React from "react";
import { Play } from "lucide-react";

export default function ContentCard({ image, title, subtitle }) {
  return (
    <div className="group bg-[#181818] hover:bg-[#282828] rounded-lg p-3 md:p-4 transition-all duration-200 cursor-pointer relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-[#282828]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105">
          <Play className="w-4 h-4 text-black ml-0.5" />
        </button>
      </div>
      <p className="text-white text-sm font-semibold truncate">{title}</p>
      <p className="text-[#b3b3b3] text-xs mt-0.5 truncate">{subtitle}</p>
    </div>
  );
}