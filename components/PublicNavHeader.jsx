"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Monitor, ExternalLink, Activity, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function PublicNavHeader({ activePage = "" }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/stocks", label: "Trading Floor", id: "stocks" },
    { href: "/news", label: "News Wire", id: "news" },
    { href: "/rules", label: "Tournament Rules", id: "rules" },
    { href: "/leaderboard", label: "Live Leaderboard", id: "leaderboard" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--canvas)]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-all">
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

        {/* Desktop Navigation Links */}
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
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-semibold shadow-[0_0_0_1px_var(--border-color)] active:scale-95 transition-all duration-150"
          >
            <span className="hidden xs:inline sm:inline">Trading Desk</span>
            <span className="xs:hidden">Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] md:hidden transition-all duration-150 active:scale-95 shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 mt-3 border-t border-[var(--border-color)] font-mono text-xs animate-fade-in">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || activePage === link.id;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors duration-150 flex items-center justify-between ${
                    isActive
                      ? "bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] font-bold shadow-[0_0_0_1px_rgba(64,43,40,0.3)] dark:shadow-[0_0_0_1px_rgba(234,224,211,0.3)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </Link>
              );
            })}
            <Link
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5" />
                <span>Auditorium Projector</span>
              </span>
              <span>↗</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
