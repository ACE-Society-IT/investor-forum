"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { ArrowUpRight, ArrowUp, ShieldCheck, Activity, Monitor, Trophy } from "lucide-react";

export default function Footer() {
  const sectionLinks = [
    { name: "About the Forum", href: "#about" },
    { name: "Market Sectors", href: "#sectors" },
    { name: "Competition Rules", href: "#rules" },
    { name: "Event Timeline", href: "#timeline" },
    { name: "Frequently Asked", href: "#faqs" },
  ];

  const portalLinks = [
    { name: "Trading Floor Terminal", href: "/dashboard", icon: Activity },
    { name: "Auditorium 4K Projector", href: "/projector", external: true, icon: Monitor },
    { name: "Live News Wire", href: "/news", icon: ArrowUpRight },
    { name: "Public Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  const handleScroll = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const navOffset = 88;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full bg-maroon-base/95 dark:bg-maroon-base border-t border-border-brown/50 pt-16 pb-12 px-5 sm:px-8 lg:px-12 text-cream-muted/80 text-xs transition-colors relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Top Grid: 12-column balanced layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Col 1: Brand & Operational Overview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3.5 group focus:outline-none">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border-brown flex items-center justify-center p-1.5 bg-maroon-subtle/90 shadow-sm group-hover:border-cream-muted/40 transition-all duration-300 group-hover:scale-105">
                <Logo className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-tight text-cream-light font-medium group-hover:text-white transition-colors">
                  Investor Forum
                </span>
                <span className="font-mono text-[10px] text-cream-muted/60 tracking-wider uppercase">
                  Intra-School Edition 2026
                </span>
              </div>
            </Link>

            <p className="text-xs text-cream-muted/75 leading-relaxed font-sans max-w-sm">
              An institutional intra-school stock trading simulation arena. Student desks react
              to live macroeconomic news catalysts, allocate virtual capital, and master portfolio
              strategy under real-time market velocity.
            </p>

            {/* Arena Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-subtle/70 border border-border-brown/60 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse" />
              <span className="text-cream-light font-medium">Competition Arena: Live</span>
            </div>
          </div>

          {/* Col 2: Navigation with Smooth Scroll (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3.5">
            <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-widest font-semibold">
              Event Navigation
            </div>
            <ul className="space-y-2.5 font-sans text-xs">
              {sectionLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                    className="text-cream-muted/75 hover:text-cream-light transition-colors flex items-center gap-1.5 cursor-pointer group"
                  >
                    <span className="text-cream-muted/40 group-hover:text-cream-light group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Live Portals & Security Protocols (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3.5">
              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-widest font-semibold">
                Trading Floor Portals
              </div>
              <ul className="space-y-2.5 font-sans text-xs">
                {portalLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-2 text-cream-muted/75 hover:text-cream-light transition-colors group"
                      >
                        <Icon className="w-3.5 h-3.5 text-cream-muted/50 group-hover:text-accent-green-bright transition-colors" />
                        <span>{link.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-cream-muted/40 group-hover:text-cream-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-auto" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-2 border-t border-border-brown/30 flex items-center gap-2 text-[11px] font-mono text-cream-muted/60">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-green-bright shrink-0" />
              <span>Single-Device Desk Lock Enforced</span>
            </div>
          </div>
        </div>

        {/* Bottom Colophon, Credits & Back to Top Bar */}
        <div className="pt-6 border-t border-border-brown/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-cream-muted/60">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© 2026 Investor Forum.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span>Organized by</span>
              <span className="text-cream-light font-semibold font-sans">
                ACE Society
              </span>
            </div>

            {/* Back to Top Smooth Button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Smooth scroll to top"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-brown/60 hover:border-cream-muted/40 bg-maroon-subtle/50 hover:bg-maroon-subtle text-cream-muted/80 hover:text-cream-light transition-all cursor-pointer active:scale-95"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
