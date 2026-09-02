import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 border rounded bg-transparent text-white outline-none ${className}`}
      {...props}
    />
  );
}
