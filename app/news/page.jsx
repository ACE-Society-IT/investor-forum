"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Clock, TrendingUp, TrendingDown, ArrowRight, Activity, Filter, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicNavHeader from "@/components/PublicNavHeader";
import StudentDashboard from "@/components/StudentDashboard";

export default function NewsPage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [news, setNews] = useState([]);
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  const sectors = ["ALL", "Technology", "Pharmaceuticals", "Energy", "Consumer Goods"];

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
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news_feed")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && data) {
          setNews(data);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setIsLoadingNews(false);
      }
    };

    fetchNews();

    // Subscribe to real-time news updates
    const channel = supabase
      .channel("public-news-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_feed" },
        (payload) => {
          if (payload.new) {
            setNews((prev) => [payload.new, ...prev.filter((n) => n.id !== payload.new.id)]);
          }
        }
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
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading News Wire…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the News tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="news" />;
  }

  const filteredNews = news.filter((item) => {
    if (selectedSector === "ALL") return true;
    return item.sector?.toLowerCase() === selectedSector.toLowerCase();
  });

  const sectorColors = {
    Technology: "text-[#402b28] bg-[#402b28]/10 shadow-[0_0_0_1px_rgba(64,43,40,0.25)] dark:text-[#eae0d3] dark:bg-[#eae0d3]/15",
    Pharmaceuticals: "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]",
    Energy: "text-[#303d37] bg-[#303d37]/10 shadow-[0_0_0_1px_rgba(48,61,55,0.2)] dark:text-[#eae0d3] dark:bg-[#303d37]/30",
    "Consumer Goods": "text-[#7928ca] bg-[#7928ca]/10 shadow-[0_0_0_1px_rgba(121,40,202,0.2)]",
    ALL: "text-[var(--text-primary)] bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]"
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="news" />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/10 dark:via-transparent dark:to-[#eae0d3]/5 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[#402b28]/20 dark:border-[#eae0d3]/30">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Real-Time Institutional News Wire</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Live Market Catalysts & Breaking News
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                  Headlines broadcast in real time with macroeconomic shockwaves. Price movements develop smoothly over 10-second waves.
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

          {/* Sector Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)]">
            <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0 ml-1" />
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 shrink-0 ${
                  selectedSector === sec
                    ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-semibold shadow-sm"
                    : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* News Timeline List */}
          <div className="space-y-3.5">
            {isLoadingNews ? (
              <div className="text-center py-16 vercel-card rounded-2xl">
                <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-mono text-[var(--text-muted)]">Connecting to live feed…</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-16 vercel-card rounded-2xl">
                <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-[var(--text-primary)] text-sm font-semibold">No News Bulletins in this Sector</p>
                <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
                  Tournament organizers will broadcast news bulletins in real time.
                </p>
              </div>
            ) : (
              filteredNews.map((item, idx) => {
                const isPositive = (item.impact_percent || 0) >= 0;
                return (
                  <div
                    key={item.id || idx}
                    className="vercel-card rounded-xl p-5 transition-all duration-150 border border-[var(--border-color)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-medium ${
                            sectorColors[item.sector] || sectorColors.ALL
                          }`}
                        >
                          {item.sector || "General"}
                        </span>
                        <span className="text-[var(--text-muted)] text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </span>
                      </div>

                      {item.impact_percent !== undefined && item.impact_percent !== null && (
                        <span
                          className={`font-mono font-medium flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-[#ff5b4f]/10 text-[#ff5b4f] border border-[#ff5b4f]/20"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isPositive ? "+" : ""}{Number(item.impact_percent).toFixed(1)}% Sector Shift</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                      {item.headline}
                    </h3>
                    {item.body && (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                        {item.body}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-6 font-mono text-xs text-[var(--text-muted)] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Investor Forum Simulation Engine</span>
          <div className="flex items-center gap-4">
            <Link href="/rules" className="hover:text-[var(--text-primary)] transition-colors">Tournament Rules</Link>
            <Link href="/leaderboard" className="hover:text-[var(--text-primary)] transition-colors">Leaderboard</Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Trading Floor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
