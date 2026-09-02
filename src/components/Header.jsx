import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#101010] border-b border-[#222222] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-gray-300 hover:text-white transition"
          title="Go Back"
        >
          ‹
        </button>
        <button 
          onClick={() => navigate(1)} 
          className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-gray-300 hover:text-white transition"
          title="Go Forward"
        >
          ›
        </button>
      </div>

      {/* App Title Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
          Proj Synth
        </span>
      </div>
    </header>
  );
}