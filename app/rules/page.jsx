"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import PublicNavHeader from "@/components/PublicNavHeader";
import RulesView from "@/components/dashboard/RulesView";
import StudentDashboard from "@/components/StudentDashboard";

export default function RulesPage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

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

  const handleNavigateTab = (tab) => {
    const routeMap = {
      stocks: "/stocks",
      portfolio: "/portfolio",
      market: "/intelligence",
      intelligence: "/intelligence",
      leaderboard: "/leaderboard",
      news: "/news",
      rules: "/rules"
    };
    router.push(routeMap[tab] || `/dashboard?tab=${tab}`);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading Rules & Guidelines…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the Rules tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="rules" />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="rules" />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <RulesView onNavigateTab={handleNavigateTab} />
        </main>
      </div>

      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-6 font-mono text-xs text-[var(--text-muted)] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Investor Forum Simulation Engine</span>
          <div className="flex items-center gap-4">
            <Link href="/news" className="hover:text-[var(--text-primary)] transition-colors">News Wire</Link>
            <Link href="/leaderboard" className="hover:text-[var(--text-primary)] transition-colors">Leaderboard</Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Trading Floor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
