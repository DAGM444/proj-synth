import React from "react";

export function Slider({ value = [0], onValueChange, max = 100, step = 1, className = "" }) {
  const val = Array.isArray(value) ? value[0] : value;
  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={val ?? 0}
      onChange={(e) => onValueChange && onValueChange([Number(e.target.value)])}
      className={`w-full cursor-pointer accent-[#1DB954] ${className}`}
    />
  );
}
