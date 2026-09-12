import React from "react";

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-label="Investor Forum Logo"
    >
      <rect width="120" height="120" rx="28" fill="#240E0B" stroke="#402B28" strokeWidth="2" />
      <path
        d="M30 84 L48 56 L64 68 L90 32"
        fill="none"
        stroke="#EAE0D3"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="90" cy="32" r="6" fill="#5FA886" />
      <path d="M34 84 L86 84" fill="none" stroke="#402B28" strokeWidth="3" strokeDasharray="4 4" />
      <rect x="30" y="66" width="6" height="18" rx="2" fill="#5FA886" opacity="0.4" />
      <rect x="46" y="52" width="6" height="32" rx="2" fill="#EAE0D3" opacity="0.6" />
      <rect x="62" y="62" width="6" height="22" rx="2" fill="#5FA886" opacity="0.5" />
      <rect x="78" y="40" width="6" height="44" rx="2" fill="#EAE0D3" opacity="0.8" />
    </svg>
  );
}
