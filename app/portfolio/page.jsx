"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, Lock, Activity } from "lucide-react";
import PublicNavHeader from "@/components/PublicNavHeader";
import StudentDashboard from "@/components/StudentDashboard";

export default function PortfolioPage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("if_team_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.name) {
          setCurrentTeam(parsed);
        }
      }
    } catch (_) {
      // ignore
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("if_team_session");
    setCurrentTeam(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading Portfolio…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the Portfolio tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="portfolio" />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="portfolio" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center mx-auto shadow-sm border border-[#402b28]/20 dark:border-[#eae0d3]/30">
            <Briefcase className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Participant Portfolio & Ledger
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Sign in with your team credentials to view your live cash buying power, open positions, asset allocations, and historical transaction ledger.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold font-mono bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Participant Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>

      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-6 font-mono text-xs text-[var(--text-muted)] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Investor Forum Simulation Engine</span>
          <div className="flex items-center gap-4">
            <Link href="/news" className="hover:text-[var(--text-primary)] transition-colors">News Wire</Link>
            <Link href="/rules" className="hover:text-[var(--text-primary)] transition-colors">Tournament Rules</Link>
            <Link href="/stocks" className="hover:text-[var(--text-primary)] transition-colors">Trading Floor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
