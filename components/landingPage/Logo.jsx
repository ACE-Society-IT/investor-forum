import React from "react";

export default function Logo({ className = "w-8 h-8", alt = "Investor Forum Logo" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo.png"
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] select-none transition-transform duration-300"
      />
    </div>
  );
}
