"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Monitor, Laptop, ShieldAlert, Copy, Check, Trophy, ArrowRight, ExternalLink } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function DesktopOnlyGate() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + "/dashboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-sand)] selection:text-[#1b0805] font-sans relative overflow-hidden px-4 py-6">
      {/* Background Ambience */}
      <div className="glow-ambient w-[450px] h-[450px] bg-rose-500/10 top-[-100px] left-[-100px] animate-pulse-slow pointer-events-none" />
      <div className="glow-ambient w-[400px] h-[400px] bg-amber-500/10 bottom-[-100px] right-[-100px] animate-pulse-slow pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[var(--border-color)] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            IF
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Investor Forum</h1>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Official Tournament Floor</p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Notice Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8 relative z-10">
        <div className="vercel-card rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border border-[var(--border-color)] backdrop-blur-xl">
          {/* Visual Icon Badge */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-[var(--surface-2)] shadow-[0_0_0_1px_rgba(244,63,94,0.35)] flex items-center justify-center text-rose-500">
              <Monitor className="w-8 h-8 stroke-[1.75]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
              <span>Restricted Device</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Desktop Workstation Required
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The Investor Forum Trading Floor is strictly restricted to designated desktop and laptop computers for tournament integrity.
            </p>
          </div>

          {/* Notice Points */}
          <div className="bg-[var(--surface-2)] rounded-2xl p-4 text-left space-y-3 text-xs border border-[var(--border-color)]">
            <div className="flex items-start gap-2.5">
              <Laptop className="w-4 h-4 text-[var(--text-primary)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--text-primary)] block">Desktop Terminal Only</span>
                <span className="text-[var(--text-secondary)] text-[11px] leading-tight block">
                  Mobile phones and iPads/tablets are strictly blocked from signing in or placing trades.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--text-primary)] block">Single-Device Lock</span>
                <span className="text-[var(--text-secondary)] text-[11px] leading-tight block">
                  Access your team desk from your authorized competition laptop to ensure your session is registered.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold font-mono text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Link Copied! Send to Your Laptop</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Desk Link for Laptop</span>
                </>
              )}
            </button>

            <Link
              href="/leaderboard"
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs flex items-center justify-center gap-1.5 transition-all border border-[var(--border-color)]"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>View Public Standings</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-[10px] font-mono text-[var(--text-muted)] pt-6 relative z-10">
        Investor Forum Terminal · Competition Proctors Active
      </footer>
    </div>
  );
}
