import React from "react";

export default function Equalizer() {
  return (
    <div className="flex items-end gap-0.5 h-4 w-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1 bg-[#1DB954] rounded-sm origin-bottom eq-bar"
          style={{ animationDelay: `${i * 0.15}s`, height: "100%" }}
        />
      ))}
    </div>
  );
}