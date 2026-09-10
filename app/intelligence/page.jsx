"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, ArrowRight, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicNavHeader from "@/components/PublicNavHeader";
import MarketIntelligenceView from "@/components/dashboard/MarketIntelligenceView";
import StudentDashboard from "@/components/StudentDashboard";

export default function IntelligencePage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, newsRes] = await Promise.all([
          supabase.from("stocks").select("*").order("ticker"),
          supabase.from("news_feed").select("*").order("created_at", { ascending: false }).limit(20)
        ]);
        if (stocksRes.data) setStocks(stocksRes.data);
        if (newsRes.data) setNews(newsRes.data);
      } catch (err) {
        console.error("Error fetching intelligence data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel("public-intel-stocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stocks" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading Market Intelligence…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the Market Intelligence tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="market" />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="intelligence" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/10 dark:via-transparent dark:to-[#eae0d3]/5 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[#402b28]/20 dark:border-[#eae0d3]/30">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Institutional Sector Analytics</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Market Intelligence Desk
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                  Analyze sector breakdowns, relative market capitalization weightings, and real-time gainers vs losers.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98] shrink-0"
              >
                <span>Enter Trading Floor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Intelligence Component */}
          {isLoading ? (
            <div className="text-center py-16 vercel-card rounded-2xl">
              <Activity className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-mono text-[var(--text-muted)]">Synthesizing macro sector data…</p>
            </div>
          ) : (
            <MarketIntelligenceView stocks={stocks} news={news} />
          )}
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
