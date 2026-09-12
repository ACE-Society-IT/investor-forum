"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SpinningBorderButton from "./SpinningBorderButton";

const tickerItems = [
  { ticker: "$TECH", name: "Tech & AI", price: "142.80", change: "+4.8%", pos: true },
  { ticker: "$PHRM", name: "Pharma", price: "89.40", change: "-1.3%", pos: false },
  { ticker: "$ENRG", name: "Clean Energy", price: "114.20", change: "+2.2%", pos: true },
  { ticker: "$FMCG", name: "Consumer Goods", price: "64.50", change: "+0.4%", pos: true },
  { ticker: "$FINS", name: "Global Finance", price: "178.90", change: "+1.7%", pos: true },
  { ticker: "$AUTO", name: "Clean Mobility", price: "92.15", change: "-0.8%", pos: false },
  { ticker: "$AERO", name: "Aerospace", price: "210.40", change: "+3.1%", pos: true },
  { ticker: "$SEMI", name: "Semiconductors", price: "135.60", change: "+5.6%", pos: true },
  { ticker: "$COMM", name: "Commodities", price: "48.20", change: "-1.9%", pos: false },
  { ticker: "$REIT", name: "Real Estate", price: "53.25", change: "+0.9%", pos: true },
];

export default function Hero() {
  return (
    <section className="relative w-full pt-36 pb-20 md:pt-48 md:pb-28 flex flex-col items-center justify-center text-center overflow-hidden">
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
      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center">
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
      </div>

      {/* Continuous Animated Market Marquee Ticker - 100% Full Width Edge-to-Edge */}
      <div className="w-full mt-14 sm:mt-16 py-3 border-y border-border-brown/25 bg-maroon-subtle/25 dark:bg-maroon-subtle/15 overflow-hidden relative marquee-wrapper select-none">
        {/* Marquee Track: flows from right to left across full width, pauses on hover, resumes when hover removed */}
        <div className="animate-marquee items-center gap-3 sm:gap-4 text-xs font-mono py-1">
          {[...tickerItems, ...tickerItems].map((stock, i) => (
            <div
              key={`${stock.ticker}-${i}`}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-maroon-subtle/50 dark:bg-maroon-subtle/40 border border-border-brown/50 hover:border-cream-muted/40 hover:bg-maroon-subtle/80 hover:scale-[1.02] transition-all duration-200 cursor-default shrink-0 shadow-xs"
            >
              <span className="font-bold text-cream-light tracking-wide">{stock.ticker}</span>
              <span className="text-cream-muted/60 text-[11px] hidden md:inline">{stock.name}</span>
              <span className="text-cream-muted font-medium tnum">${stock.price}</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5",
                  stock.pos
                    ? "text-accent-green-bright bg-accent-green/20 border border-accent-green/30"
                    : "text-[#ff5b4f] bg-[#ff5b4f]/10 border border-[#ff5b4f]/20"
                )}
              >
                <span className="text-[9px]">{stock.pos ? "▲" : "▼"}</span>
                <span>{stock.change}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
