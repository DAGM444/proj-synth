import React from "react";

const colors = [
  "from-pink-600 to-rose-500",
  "from-orange-500 to-amber-400",
  "from-violet-600 to-purple-500",
  "from-green-600 to-emerald-500",
  "from-blue-600 to-cyan-500",
  "from-red-600 to-orange-500",
  "from-fuchsia-600 to-pink-500",
  "from-teal-600 to-green-500",
];

export default function CategoryCard({ label, index }) {
  const gradient = colors[index % colors.length];
  return (
    <div
      className={`group relative h-24 md:h-28 rounded-lg bg-gradient-to-br ${gradient} overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40`}
    >
      <span className="absolute top-3 left-4 text-white font-heading font-bold text-lg md:text-xl">
        {label}
      </span>
      <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-md bg-black/20 rotate-25 shadow-xl group-hover:rotate-12 transition-transform" />
    </div>
  );
}