"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ArrowRight, TrendingUp, TrendingDown, Layers, Filter, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicNavHeader from "@/components/PublicNavHeader";
import StudentDashboard from "@/components/StudentDashboard";
import Sparkline from "@/components/Sparkline";

export default function StocksPage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);

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
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase
          .from("stocks")
          .select("*")
          .order("ticker");
        if (!error && data) {
          setStocks(data);
        }
      } catch (err) {
        console.error("Error fetching stocks:", err);
      } finally {
        setIsLoadingStocks(false);
      }
    };

    fetchStocks();

    // Subscribe to live price ticks
    const channel = supabase
      .channel("public-stocks-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stocks" },
        (payload) => {
          if (payload.new) {
            setStocks((prev) =>
              prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
            );
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
          <span className="font-mono text-xs text-[var(--text-muted)]">Loading Trading Floor…</span>
        </div>
      </div>
    );
  }

  // If student is signed in, render the full integrated dashboard on the Stocks tab
  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab="stocks" />;
  }

  const sectors = ["All", ...Array.from(new Set(stocks.map((s) => s.sector).filter(Boolean)))];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSector = selectedSector === "All" || stock.sector === selectedSector;
    const matchesSearch =
      !searchQuery ||
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stock.company_name && stock.company_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSector && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] flex flex-col justify-between">
      <div>
        <PublicNavHeader activePage="stocks" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/10 dark:via-transparent dark:to-[#eae0d3]/5 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[#402b28]/20 dark:border-[#eae0d3]/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Equities Market Floor</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Live Trading Floor & Asset Quotes
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                  Track live equity valuations, momentum sparklines, and percentage changes across institutional market sectors.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98] shrink-0"
              >
                <span>Sign In to Place Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {sectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-150 shrink-0 ${
                    selectedSector === sec
                      ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-sm"
                      : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter symbol or company…"
                className="w-full sm:w-60 bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#402b28] dark:focus:ring-[#eae0d3]"
              />
            </div>
          </div>

          {/* Equities Grid */}
          {isLoadingStocks ? (
            <div className="text-center py-16 vercel-card rounded-2xl">
              <Activity className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-mono text-[var(--text-muted)]">Connecting to market liquidity…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks.map((stock) => {
                const change = Number(stock.change_percent || 0);
                const isPositive = change >= 0;
                return (
                  <div
                    key={stock.id}
                    className="vercel-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between space-y-4 hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-[var(--text-primary)]">
                              {stock.ticker}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                              {stock.sector || "Equity"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                            {stock.company_name || stock.name || stock.ticker}
                          </p>
                        </div>

                        <span
                          className={`font-mono text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-[#ff5b4f]/10 text-[#ff5b4f] border border-[#ff5b4f]/20"
                          }`}
                        >
                          {isPositive ? "+" : ""}{change.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mt-3 font-mono">
                        <span className="text-2xl font-bold text-[var(--text-primary)] tnum">
                          ${Number(stock.current_price).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">USD</span>
                      </div>

                      {/* Sparkline Graphic */}
                      {stock.price_history && stock.price_history.length > 1 && (
                        <div className="h-12 w-full mt-3">
                          <Sparkline data={stock.price_history} isPositive={isPositive} />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Vol: {Number(stock.volume || 1420).toLocaleString()}
                      </span>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#402b28] dark:text-[#eae0d3] hover:underline"
                      >
                        <span>Trade Stock</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-6 font-mono text-xs text-[var(--text-muted)] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Investor Forum Simulation Engine</span>
          <div className="flex items-center gap-4">
            <Link href="/news" className="hover:text-[var(--text-primary)] transition-colors">News Wire</Link>
            <Link href="/rules" className="hover:text-[var(--text-primary)] transition-colors">Tournament Rules</Link>
            <Link href="/leaderboard" className="hover:text-[var(--text-primary)] transition-colors">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
