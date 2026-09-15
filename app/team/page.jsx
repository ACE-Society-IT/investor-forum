"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowRight, Lock, Activity } from "lucide-react";
import PublicNavHeader from "@/components/PublicNavHeader";
import StudentDashboard from "@/components/StudentDashboard";

export default function TeamManagementPage() {
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
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading Team Management…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the Team tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="team" />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="team" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center mx-auto shadow-sm border border-[#402b28]/20 dark:border-[#eae0d3]/30">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-color)]">
              <Lock className="w-3 h-3 text-[var(--gold)]" />
              AUTHENTICATION REQUIRED
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Team Management & Roster
            </h1>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto text-sm sm:text-base">
              Sign in with your syndicate credentials to view your team roster, member trading breakdown, stock holdings, buy/sell volumes, and profit &amp; loss analytics.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-sand)] text-[#1b0805] font-semibold text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Sign In to Your Desk
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/stocks"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--surface-2)] transition-all"
            >
              Explore Market Intelligence
            </Link>
          </div>
        </main>
      </div>

      <footer className="border-t border-[var(--border-color)] py-6 text-center text-xs font-mono text-[var(--text-muted)]">
        INVESTOR FORUM 2026 • LIVE SYNDICATE SIMULATION ENGINE
      </footer>
    </div>
  );
}
