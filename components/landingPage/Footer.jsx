"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const sectionLinks = [
    { name: "About the Forum", href: "#about" },
    { name: "Market Sectors", href: "#sectors" },
    { name: "Competition Rules", href: "#rules" },
    { name: "Event Timeline", href: "#timeline" },
    { name: "Frequently Asked", href: "#faqs" },
  ];

  const portalLinks = [
    { name: "Trading Floor Access", href: "/dashboard" },
    { name: "Auditorium Projector Display", href: "/projector", external: true },
    { name: "Real-Time News Wire", href: "/news" },
    { name: "Live Leaderboard", href: "/leaderboard" },
  ];

  return (
    <footer className="w-full bg-maroon-base border-t border-border-brown/40 pt-16 pb-12 px-5 sm:px-8 lg:px-12 text-cream-muted/80 text-xs transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Top Grid: 12-column balanced layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Col 1: Brand & Operational Overview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-border-brown flex items-center justify-center p-1 bg-maroon-subtle/90 shadow-sm group-hover:border-cream-muted/40 transition-all duration-300 group-hover:scale-105">
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

            <p className="text-xs text-cream-muted/70 leading-relaxed font-sans max-w-sm">
              An intra-school stock trading simulation arena. Teams react to live market
              catalysts, deploy virtual capital, and master portfolio strategy under
              institutional velocity.
            </p>

           
          </div>

          {/* Col 2: Platform Navigation (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3.5">
            <div className="font-mono text-[11px] text-cream-muted/50 uppercase tracking-widest font-semibold">
              Navigation
            </div>
            <ul className="space-y-2.5 font-sans text-xs">
              {sectionLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-cream-muted/75 hover:text-cream-light transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Live Portals & Desks (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-3.5">
            <div className="font-mono text-[11px] text-cream-muted/50 uppercase tracking-widest font-semibold">
              Trading Desks &amp; Screens
            </div>
            <ul className="space-y-2.5 font-sans text-xs">
              {portalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-cream-muted/75 hover:text-cream-light transition-colors group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 text-cream-muted/40 group-hover:text-cream-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Colophon & Credits Bar */}
        <div className="pt-6 border-t border-border-brown/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-cream-muted/50">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© 2026 Investor Forum.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-center sm:text-right">
            <span>Organized by</span>
            <span className="text-cream-muted/80 font-sans">
              ACE Society
            </span>
           
          </div>
        </div>
      </div>
    </footer>
  );
}
