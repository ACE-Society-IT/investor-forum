"use client";

import React from "react";
import BackgroundAmbient from "@/components/landingPage/BackgroundAmbient";
import SpotlightCursor from "@/components/landingPage/SpotlightCursor";
import Navbar from "@/components/landingPage/Navbar";
import Hero from "@/components/landingPage/Hero";
import ChallengeSection from "@/components/landingPage/ChallengeSection";
import MarketSection from "@/components/landingPage/MarketSection";
import RulesSection from "@/components/landingPage/RulesSection";
import TimelineSection from "@/components/landingPage/TimelineSection";
import FaqSection from "@/components/landingPage/FaqSection";
import CtaSection from "@/components/landingPage/CtaSection";
import Footer from "@/components/landingPage/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-maroon-base text-cream-light selection:bg-accent-green selection:text-cream-light overflow-x-hidden transition-colors duration-200">
      {/* 1. Subtle Living Background (TopologyField, Grid, Ambient glows) */}
      <BackgroundAmbient />

      {/* 2. Global Spotlight Cursor layer (illuminates area around cursor, z-[2] pointer-events-none) */}
      <SpotlightCursor />

      {/* 3. Sticky Navbar (z-50) */}
      <Navbar />

      {/* 4. Main Content Flow (z-10) */}
      <main className="relative z-10 flex flex-col w-full">
        {/* Hero */}
        <Hero />

        {/* The Challenge */}
        <ChallengeSection />

        {/* The Market / Sectors */}
        <MarketSection />

        {/* The Rules */}
        <RulesSection />

        {/* The Day / Timeline */}
        <TimelineSection />

        {/* FAQ */}
        <FaqSection />

        {/* Final CTA */}
        <CtaSection />
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
