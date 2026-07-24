import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Plus, Music2 } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Your Library", path: "/library" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-black h-full shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1DB954] flex items-center justify-center">
          <Music2 className="w-5 h-5 text-black" />
        </div>
        <span className="text-white font-heading font-bold text-lg tracking-tight">
          Proj Synth
        </span>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                active
                  ? "text-white bg-[#1a1a1a]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 h-px bg-[#282828]" />

      {/* Create Playlist */}
      <div className="px-3">
        <button className="flex items-center gap-4 px-3 py-2.5 rounded-md text-[#b3b3b3] hover:text-white transition-colors text-sm font-medium w-full">
          <div className="w-5 h-5 rounded-sm bg-[#b3b3b3] group-hover:bg-white flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5 text-black" />
          </div>
          Create Playlist
        </button>
      </div>

      {/* Spacer + bottom gradient */}
      <div className="flex-1" />
      <div className="px-6 pb-6">
        <p className="text-[10px] text-[#535353] leading-relaxed">
          © 2026 Proj Synth
        </p>
      </div>
    </aside>
  );
}