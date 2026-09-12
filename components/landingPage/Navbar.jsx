"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import SpinningBorderButton from "./SpinningBorderButton";
import ThemeToggle from "@/components/ThemeToggle";

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
    <header className="fixed top-0 inset-x-0 z-50 py-3.5 px-4 sm:px-6 lg:px-12 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6 rounded-full bg-maroon-base/85 backdrop-blur-md border border-border-brown shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] pointer-events-auto">
        {/* Brand & Edition Tag */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-brown/80 flex items-center justify-center p-0.5 bg-maroon-subtle">
            <Logo className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-lg tracking-tight text-cream-light font-medium">
              Investor Forum
            </span>
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-border-brown/40 border border-border-brown text-cream-muted/90">
              Intra-School Edition 2026
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-maroon-base/60 border border-border-brown/40">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1 text-xs text-cream-muted hover:text-cream-light rounded-full transition-colors font-medium font-sans"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action & Theme Toggle & Mobile Trigger */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Action button with spinning-border effect */}
          <SpinningBorderButton href="/dashboard" variant="accent" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green-bright animate-pulse" />
            <span>Team Login</span>
          </SpinningBorderButton>

          {/* Mobile hamburger toggle button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-cream-muted hover:text-cream-light hover:bg-border-brown/30 focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl bg-maroon-base/95 backdrop-blur-xl border border-border-brown p-4 shadow-2xl pointer-events-auto transition-all">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-cream-muted hover:text-cream-light hover:bg-border-brown/20 rounded-lg transition-colors font-medium font-sans"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
