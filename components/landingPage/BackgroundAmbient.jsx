"use client";

import React from "react";
import TopologyField from "./TopologyField";
import { useTheme } from "@/lib/ThemeContext";

export default function BackgroundAmbient() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Global TopologyField 3D Network Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-50 sm:opacity-65">
        <TopologyField mode={theme} className="w-full h-full pointer-events-none" />
      </div>

      {/* 2. Faint geometric grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-35 pointer-events-none" />

      {/* 3. Soft ambient light orbs (GPU composited) */}
      <div className="absolute -top-36 left-1/4 w-[650px] h-[500px] rounded-full bg-cream-muted filter blur-[100px] opacity-[0.05] dark:opacity-[0.04] animate-float-glow transform-gpu will-change-transform pointer-events-none" />
      <div
        className="absolute top-1/3 -right-28 w-[600px] h-[600px] rounded-full bg-accent-green filter blur-[110px] opacity-[0.06] dark:opacity-[0.07] animate-float-glow [animation-delay:-8s] transform-gpu will-change-transform pointer-events-none"
      />
      <div
        className="absolute bottom-16 left-12 w-[550px] h-[450px] rounded-full bg-cream-muted filter blur-[110px] opacity-[0.04] dark:opacity-[0.03] animate-float-glow [animation-delay:-14s] transform-gpu will-change-transform pointer-events-none"
      />
    </div>
  );
}
