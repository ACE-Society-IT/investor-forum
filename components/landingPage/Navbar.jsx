"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Menu, X, Monitor, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SpotlightLoginButton from "./SpotlightLoginButton";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Sectors", href: "#sectors" },
    { name: "Rules", href: "#rules" },
    { name: "Timeline", href: "#timeline" },
    { name: "FAQs", href: "#faqs" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 py-4 sm:py-5 px-4 sm:px-6 lg:px-10 pointer-events-none transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-[68px] px-4 sm:px-7 rounded-full bg-maroon-base/80 dark:bg-maroon-base/85 backdrop-blur-2xl border border-border-brown/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-cream-light/5 pointer-events-auto transition-all">
        {/* Left: Brand Identity & Edition Badge */}
        <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group focus:outline-none shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-border-brown flex items-center justify-center p-1 bg-maroon-subtle/90 shadow-sm group-hover:border-cream-muted/40 transition-all duration-300 group-hover:scale-105">
            <Logo className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
            <span className="font-serif text-lg sm:text-xl tracking-tight text-cream-light font-medium group-hover:text-white transition-colors">
              Investor Forum
            </span>
            
          </div>
        </Link>

        {/* Center: Editorial Navigation Capsule (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-maroon-subtle/50 dark:bg-maroon-base/60 border border-border-brown/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 text-xs font-medium tracking-wide text-cream-muted hover:text-cream-light hover:bg-cream-muted/10 rounded-full transition-all duration-200 font-sans"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Actions Cluster (Theme Toggle, Projector, Login CTA) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle className="rounded-full" />

          {/* Projector Screen Button */}
          <Link
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Auditorium 4K Projector Display"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-border-brown/80 bg-maroon-subtle/60 hover:bg-maroon-subtle hover:border-cream-muted/30 text-cream-muted hover:text-cream-light text-xs font-sans font-medium transition-all duration-200 shadow-sm active:scale-95 group"
          >
            <Monitor className="w-3.5 h-3.5 text-accent-green-bright group-hover:scale-110 transition-transform" />
            <span>Projector</span>
            <span className="text-[10px] text-cream-muted/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </Link>

          {/* Interactive Brown Spotlight Team Login CTA */}
          <SpotlightLoginButton href="/login" />

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-cream-muted hover:text-cream-light hover:bg-border-brown/30 focus:outline-none transition-colors ml-0.5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2.5 rounded-3xl bg-maroon-base/95 backdrop-blur-2xl border border-border-brown p-5 shadow-2xl pointer-events-auto transition-all animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-cream-muted hover:text-cream-light hover:bg-border-brown/30 rounded-xl transition-colors font-medium font-sans flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-xs text-cream-muted/40 font-mono">→</span>
              </a>
            ))}

            <div className="h-[1px] bg-border-brown/50 my-2" />

            {/* Mobile Actions: Projector & Full Login */}
            <Link
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-maroon-subtle/80 border border-border-brown text-sm font-sans font-medium text-cream-light hover:bg-maroon-subtle transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="w-4 h-4 text-accent-green-bright" />
                <span>Auditorium Projector 4K</span>
              </div>
              <span className="text-xs font-mono text-cream-muted/60">↗</span>
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-1 px-4 py-3 rounded-xl bg-gradient-to-b from-[#4d332f] to-[#36211e] border border-[#5f423d] text-cream-light text-sm font-sans font-semibold shadow-md active:scale-98 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse" />
              <span>Team Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
