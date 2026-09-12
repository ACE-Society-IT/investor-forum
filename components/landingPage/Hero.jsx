"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import SpinningBorderButton from "./SpinningBorderButton";

export default function Hero() {
  return (
    <section className="relative w-full pt-36 pb-24 md:pt-48 md:pb-32 px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Faint animated market curves drifting across hero backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 overflow-hidden">
        <svg
          className="w-full max-w-6xl h-96 animate-curve-drift"
          fill="none"
          viewBox="0 0 1000 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroCurveGradient" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#402b28" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#eae0d3" stopOpacity="0.35" />
              <stop offset="65%" stopColor="#5fa886" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#402b28" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="heroFillGradient" x1="0" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#eae0d3" stopOpacity="0.025" />
              <stop offset="100%" stopColor="#1b0805" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Soft shaded area under curve */}
          <path
            d="M 0 320 C 140 310, 220 220, 340 260 C 460 300, 520 140, 640 160 C 760 180, 840 80, 1000 110 L 1000 400 L 0 400 Z"
            fill="url(#heroFillGradient)"
          />

          {/* Secondary dashed curve */}
          <path
            d="M 0 320 C 140 310, 220 220, 340 260 C 460 300, 520 140, 640 160 C 760 180, 840 80, 1000 110"
            stroke="#402b28"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {/* Primary animated flowing curve */}
          <path
            className="animate-market-flow"
            d="M 0 320 C 140 310, 220 220, 340 260 C 460 300, 520 140, 640 160 C 760 180, 840 80, 1000 110"
            stroke="url(#heroCurveGradient)"
            strokeWidth="1.75"
          />

          {/* Highlight data coordinate circles */}
          <circle cx="340" cy="260" r="2.5" fill="#eae0d3" opacity="0.6" />
          <circle cx="640" cy="160" r="2.5" fill="#5fa886" opacity="0.75" />
          <circle cx="1000" cy="110" r="3" fill="#eae0d3" opacity="0.7" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
       

        {/* H1 Main Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-cream-light tracking-tight leading-[1.1] mb-6">
          Where Market Instinct Meets Real-Time Pressure.
        </h1>

        {/* Supporting description */}
        <p className="font-sans text-base sm:text-lg text-cream-muted/90 max-w-2xl leading-relaxed mb-10 font-normal">
          An intra-school stock trading simulation where teams react to breaking market news,
          manage virtual capital and compete to maximize their net worth.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <SpinningBorderButton
            href="/dashboard"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
          >
            <span>Access Trading Floor</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </SpinningBorderButton>

          <SpinningBorderButton
            href="#rules"
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
          >
            <span>Read the Rules</span>
          </SpinningBorderButton>
        </div>

        {/* Understated market ticker ribbon */}
        <div className="mt-16 pt-6 border-t border-border-brown/30 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-mono text-cream-muted/70">
          <span className="flex items-center gap-1.5">
            <span className="text-cream-light">$TECH</span>
            <span className="text-accent-green-bright">+4.8%</span>
          </span>
          <span className="text-border-brown">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-cream-light">$PHRM</span>
            <span className="text-cream-muted/60">-1.3%</span>
          </span>
          <span className="text-border-brown">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-cream-light">$ENRG</span>
            <span className="text-accent-green-bright">+2.2%</span>
          </span>
          <span className="text-border-brown">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-cream-light">$FMCG</span>
            <span className="text-accent-green-bright">+0.4%</span>
          </span>
        </div>
      </div>
    </section>
  );
}
