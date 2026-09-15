"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import SpinningBorderButton from "./SpinningBorderButton";
import Logo from "./Logo";
import BlurFadeText from "./BlurFadeText";

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
        {/* Official Website Logo Emblem with Blur Fade */}
        <BlurFadeText delay={0.05} blur={12} y={20}>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-maroon-subtle/80 border border-border-brown/80 flex items-center justify-center p-3 shadow-lg mb-6 ring-1 ring-cream-light/10 hover:scale-105 transition-transform duration-300">
            <Logo className="w-full h-full object-contain" />
          </div>
        </BlurFadeText>

        <BlurFadeText as="h2" delay={0.1} blur={12} y={24} className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4">
          Ready for the Opening Bell?
        </BlurFadeText>

        <BlurFadeText as="p" delay={0.18} blur={8} y={20} className="font-sans text-base sm:text-lg text-cream-muted/90 font-normal mb-8">
          Your capital is equal. Your decisions aren&apos;t.
        </BlurFadeText>

        {/* Final CTA with spinning-border effect */}
        <BlurFadeText delay={0.24} blur={8} y={16}>
          <SpinningBorderButton href="/dashboard" variant="primary" size="lg">
            <span>Enter the Trading Floor</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </SpinningBorderButton>
        </BlurFadeText>
      </div>
    </section>
  );
}
