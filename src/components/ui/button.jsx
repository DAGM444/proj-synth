import React from "react";

export function Button({ children, className = "", variant, size, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`px-4 py-2 rounded font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
