"use client";

import React from "react";
import dynamic from "next/dynamic";
import BackgroundAmbient from "@/components/landingPage/BackgroundAmbient";
import SpotlightCursor from "@/components/landingPage/SpotlightCursor";
import Navbar from "@/components/landingPage/Navbar";
import Hero from "@/components/landingPage/Hero";
import ScrollInteractSection from "@/components/landingPage/ScrollInteractSection";
import SmoothScrollProvider from "@/components/landingPage/SmoothScrollProvider";

// Dynamically load below-the-fold components to slash initial JavaScript bundle size (Est savings ~250+ KiB)
const TradingViewLiveChart = dynamic(() => import("@/components/landingPage/TradingViewLiveChart"));
const ChallengeSection = dynamic(() => import("@/components/landingPage/ChallengeSection"));
const MarketSection = dynamic(() => import("@/components/landingPage/MarketSection"));
const RulesSection = dynamic(() => import("@/components/landingPage/RulesSection"));
const TimelineSection = dynamic(() => import("@/components/landingPage/TimelineSection"));
const FaqSection = dynamic(() => import("@/components/landingPage/FaqSection"));
const CtaSection = dynamic(() => import("@/components/landingPage/CtaSection"));
const Footer = dynamic(() => import("@/components/landingPage/Footer"));

export default function Home() {
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-maroon-base text-cream-light selection:bg-accent-green selection:text-cream-light overflow-x-hidden transition-colors duration-200">
        {/* 1. Subtle Living Background (TopologyField, Grid, Ambient glows) */}
        <BackgroundAmbient />

        {/* 2. Global Spotlight Cursor layer (illuminates area around cursor, z-[2] pointer-events-none) */}
        <SpotlightCursor />

        {/* 3. Sticky Navbar (z-50) */}
        <Navbar />

        {/* 4. Main Content Flow (z-10) with Bidirectional Scroll Interactivity */}
        <main className="relative z-10 flex flex-col w-full">
          {/* Hero */}
          <ScrollInteractSection threshold={0.04}>
            <Hero />
          </ScrollInteractSection>

          {/* Live Institutional TradingView Terminal (Non-Interactive) */}
          <ScrollInteractSection threshold={0.06}>
            <TradingViewLiveChart />
          </ScrollInteractSection>

          {/* The Challenge */}
          <ScrollInteractSection threshold={0.08}>
            <ChallengeSection />
          </ScrollInteractSection>

          {/* The Market / Sectors */}
          <ScrollInteractSection threshold={0.05}>
            <MarketSection />
          </ScrollInteractSection>

          {/* The Rules */}
          <ScrollInteractSection threshold={0.05}>
            <RulesSection />
          </ScrollInteractSection>

          {/* The Day / Timeline */}
          <ScrollInteractSection threshold={0.05}>
            <TimelineSection />
          </ScrollInteractSection>

          {/* FAQ */}
          <ScrollInteractSection threshold={0.08}>
            <FaqSection />
          </ScrollInteractSection>

          {/* Final CTA */}
          <ScrollInteractSection threshold={0.08}>
            <CtaSection />
          </ScrollInteractSection>
        </main>

        {/* 5. Footer */}
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
