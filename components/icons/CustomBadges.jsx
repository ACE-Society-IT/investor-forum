"use client";

import React from "react";

// ============================================================================
// 1. BESPOKE PODIUM MEDAL SVGS (GOLD, SILVER, BRONZE)
// ============================================================================

export function GoldMedalIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="goldRibbon" x1="6" y1="2" x2="18" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="goldCoin" x1="7" y1="8" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {/* V Ribbon */}
      <path d="M7 2L12 9L17 2H14L12 6L10 2H7Z" fill="url(#goldRibbon)" />
      {/* Medal Body */}
      <circle cx="12" cy="14" r="7" fill="url(#goldCoin)" stroke="#a16207" strokeWidth="0.75" />
      {/* Inner Ring */}
      <circle cx="12" cy="14" r="5.5" stroke="#fef08a" strokeWidth="0.5" strokeDasharray="1.5 1" fill="none" opacity="0.8" />
      {/* Embossed "1" */}
      <path d="M11 11.8L12.3 11V17H11.2V12.5H11V11.8ZM10.5 17H13.5V16.2H10.5V17Z" fill="#78350f" />
    </svg>
  );
}

export function SilverMedalIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="silverRibbon" x1="6" y1="2" x2="18" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="silverCoin" x1="7" y1="8" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      {/* V Ribbon */}
      <path d="M7 2L12 9L17 2H14L12 6L10 2H7Z" fill="url(#silverRibbon)" />
      {/* Medal Body */}
      <circle cx="12" cy="14" r="7" fill="url(#silverCoin)" stroke="#64748b" strokeWidth="0.75" />
      {/* Inner Ring */}
      <circle cx="12" cy="14" r="5.5" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1.5 1" fill="none" opacity="0.9" />
      {/* Embossed "2" */}
      <path d="M10.6 12.3C10.6 11.4 11.2 10.9 12 10.9C12.8 10.9 13.4 11.4 13.4 12.2C13.4 12.9 13 13.4 12.2 14.2L11 15.4V16H13.5V16.8H10.5V15.2L12.1 13.7C12.5 13.3 12.7 12.9 12.7 12.3C12.7 11.8 12.4 11.6 12 11.6C11.6 11.6 11.3 11.8 11.3 12.3H10.6Z" fill="#1e293b" />
    </svg>
  );
}

export function BronzeMedalIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="bronzeRibbon" x1="6" y1="2" x2="18" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="bronzeCoin" x1="7" y1="8" x2="17" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="30%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>
      {/* V Ribbon */}
      <path d="M7 2L12 9L17 2H14L12 6L10 2H7Z" fill="url(#bronzeRibbon)" />
      {/* Medal Body */}
      <circle cx="12" cy="14" r="7" fill="url(#bronzeCoin)" stroke="#7c2d12" strokeWidth="0.75" />
      {/* Inner Ring */}
      <circle cx="12" cy="14" r="5.5" stroke="#ffedd5" strokeWidth="0.5" strokeDasharray="1.5 1" fill="none" opacity="0.85" />
      {/* Embossed "3" */}
      <path d="M10.8 11H13.3V11.7L12.1 13.1C12.8 13.2 13.4 13.7 13.4 14.5C13.4 15.5 12.6 16.2 11.5 16.2C10.7 16.2 10.2 15.8 10.1 15.1H10.9C11 15.4 11.3 15.6 11.6 15.6C12.1 15.6 12.5 15.2 12.5 14.6C12.5 14 12 13.6 11.4 13.6H11V13L12.1 11.6H10.8V11Z" fill="#431407" />
    </svg>
  );
}

// ============================================================================
// 2. BESPOKE SCENARIO & SECTOR SVGS
// ============================================================================

export function QuantumChipIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 9H15V15H9V9Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M2 9H5M2 15H5M19 9H22M19 15H22M9 2V5M15 2V5M9 19V22M15 19V22" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function AntitrustGavelIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M14 13L18.5 8.5C19.3 7.7 19.3 6.4 18.5 5.6C17.7 4.8 16.4 4.8 15.6 5.6L11.1 10.1" />
      <path d="M12.5 7L17 11.5" />
      <path d="M8 16L4 20" />
      <path d="M2 22H10" />
      <path d="M7 11L13 17" />
    </svg>
  );
}

export function PharmaVialIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M8 2H16M10 2V5H14V2" />
      <path d="M7 5H17C17.5 5 18 5.5 18 6V18C18 20.2 16.2 22 14 22H10C7.8 22 6 20.2 6 18V6C6 5.5 6.5 5 7 5Z" />
      <path d="M6 13H18" strokeDasharray="2 2" />
      <path d="M10 17H14M12 15V19" />
    </svg>
  );
}

export function EnergyPipelineIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 7H21V11H3V7Z" />
      <path d="M7 11V19C7 20.1 7.9 21 9 21H15C16.1 21 17 20.1 17 19V11" />
      <path d="M12 3V7" />
      <path d="M10 15L12 13L14 15" />
    </svg>
  );
}

export function SupplyCrateIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" />
      <path d="M12 3V21M3 8L12 13L21 8" />
      <path d="M7.5 10.5L16.5 15.5" strokeOpacity="0.5" />
    </svg>
  );
}
