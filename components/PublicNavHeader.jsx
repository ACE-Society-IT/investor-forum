"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Monitor, ExternalLink, Activity } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function PublicNavHeader({ activePage = "" }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/stocks", label: "Trading Floor", id: "stocks" },
    { href: "/news", label: "News Wire", id: "news" },
    { href: "/rules", label: "Tournament Rules", id: "rules" },
    { href: "/leaderboard", label: "Live Leaderboard", id: "leaderboard" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--canvas)]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.png"
            alt="Investor Forum Logo"
            className="h-10 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-150 drop-shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">
                INVESTOR FORUM
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#402b28] text-[#f8f4ed] dark:bg-[#303d37] dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]">
                ACE SOCIETY IT
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Arena
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] hidden sm:block">
              High-Frequency Simulation Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || activePage === link.id;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? "text-[#402b28] dark:text-[#eae0d3] font-bold border-b-2 border-[#402b28] dark:border-[#eae0d3]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          <ThemeToggle />

          <Link
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Projector ↗</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-semibold shadow-[0_0_0_1px_var(--border-color)] active:scale-95 transition-all duration-150"
          >
            <span>Trading Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
