import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library } from "lucide-react";

const items = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-[72px] left-0 right-0 z-40 bg-gradient-to-t from-black to-black/95 px-6 py-2 flex items-center justify-around">
      {items.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
              active ? "text-white" : "text-[#b3b3b3]"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}