"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import SpinningBorderButton from "./SpinningBorderButton";

export default function CtaSection() {
  return (
    <section className="relative w-full py-28 md:py-36 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Subtle background curve */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <svg
          className="w-full max-w-5xl h-72 animate-curve-drift text-cream-muted"
          fill="none"
          viewBox="0 0 800 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="animate-market-flow"
            d="M 0 180 C 150 120, 300 240, 450 130 C 600 20, 700 210, 800 120"
            stroke="currentColor"
            strokeDasharray="6 4"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Soft center glow */}
      <div className="absolute w-[450px] h-[300px] rounded-full bg-cream-muted filter blur-[140px] opacity-[0.05] dark:opacity-[0.035] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4">
          Ready for the Opening Bell?
        </h2>
        <p className="font-sans text-base sm:text-lg text-cream-muted/90 font-normal mb-8">
          Your capital is equal. Your decisions aren&apos;t.
        </p>

        {/* Final CTA with spinning-border effect */}
        <SpinningBorderButton href="/dashboard" variant="primary" size="lg">
          <span>Enter the Trading Floor</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </SpinningBorderButton>
      </div>
    </section>
  );
}
