"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, ArrowUpRight, ArrowDownRight, Lock, Activity, CheckCircle2, Clock, Timer, Calendar } from "lucide-react";
import { GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from "./icons/CustomBadges";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ThemeToggle from "./ThemeToggle";
import { getRoundTimingInfo } from "../lib/roundTimer";

export default function ProjectorLeaderboard() {
  const [gameState, setGameState] = useState({
    current_round: "Round 1 - Active",
    is_market_open: true,
    is_results_revealed: false
  });
  const [teams, setTeams] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  const loadData = async () => {
    try {
      const [gsRes, sRes, tRes, pRes] = await Promise.all([
        supabase.from("game_state").select("*").single(),
        supabase.from("stocks").select("*").order("ticker"),
        supabase.from("teams").select("id, name, cash_balance, is_admin, is_banned"),
        supabase.from("portfolio").select("team_id, stock_id, shares, avg_buy_price")
      ]);

      if (gsRes?.data) setGameState(gsRes.data);
      if (sRes?.data) setStocks(sRes.data);
      if (tRes?.data) setTeams(tRes.data.filter((t) => !t.is_admin));
      if (pRes?.data) setPortfolios(pRes.data);
    } catch (err) {
      console.error("Error loading projector data:", err);
    }
  };

  useEffect(() => {
    loadData();

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const pollTimer = setInterval(() => {
      loadData();
    }, 2500);

    if (!isSupabaseConfigured) {
      return () => {
        clearInterval(clockTimer);
        clearInterval(pollTimer);
      };
    }

    const channel = supabase
      .channel("projector-realtime-live")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      clearInterval(clockTimer);
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute leaderboard
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safePortfolios = Array.isArray(portfolios) ? portfolios : [];
  const safeStocks = Array.isArray(stocks) ? stocks : [];

  const rankedTeams = safeTeams
    .map((team) => {
      const teamHoldings = safePortfolios.filter((p) => p && p.team_id === team?.id && Number(p.shares) > 0);
      const stockValue = teamHoldings.reduce((sum, item) => {
        const stock = safeStocks.find((s) => s && s.id === item.stock_id);
        const currentPrice = Number(stock?.price) || 0;
        return sum + (Number(item?.shares) || 0) * currentPrice;
      }, 0);

      const cash = Number(team?.cash_balance) || 0;
      const netWorth = Number((cash + stockValue).toFixed(2));
      const pnl = Number((netWorth - 100000).toFixed(2));
      const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

      return {
        ...team,
        cash,
        stockValue,
        netWorth,
        pnl,
        pnlPercent
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  const top1 = rankedTeams[0];
  const top2 = rankedTeams[1];
  const top3 = rankedTeams[2];

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805]"
    >
      {/* 1. TOP AUDITORIUM HEADER */}
      <header className="bg-[var(--canvas)] border-b border-[var(--border-color)] px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum Logo" className="h-12 sm:h-16 w-auto object-contain shrink-0 drop-shadow-md" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="truncate">INVESTOR FORUM</span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] shadow-[0_0_0_1px_var(--accent-maroon-border)] shrink-0">
                  ACE SOCIETY IT
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] shadow-[0_0_0_1px_var(--accent-maroon-border)] font-mono font-bold shrink-0">
                  AUDITORIUM
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs font-mono text-[var(--text-secondary)] mt-0.5 hidden sm:block truncate">
                Official Live Trading Championship Standings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs shrink-0">
            <ThemeToggle />

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg vercel-card">
              <span className="text-[var(--text-tertiary)] text-[10px]">CLOCK:</span>
              <span className="font-bold text-[var(--text-primary)] tnum">{currentTime || "LIVE"}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs ${
                gameState.is_market_open
                  ? "bg-[#00d68f]/10 text-[#00d68f] shadow-[0_0_0_1px_rgba(0,214,143,0.25)]"
                  : "bg-[#f5a623]/10 text-[#f5a623] shadow-[0_0_0_1px_rgba(245,166,35,0.25)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  gameState.is_market_open ? "bg-[#00d68f] animate-ping" : "bg-[#f5a623]"
                }`}
              />
              <span className="truncate max-w-[100px] sm:max-w-none">
                {gameState.is_market_open ? gameState.current_round : "PAUSED"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTINUOUS TICKER TAPE */}
      {stocks.length > 0 && (
        <div className="bg-[var(--canvas-subtle)] border-b border-[var(--border-color)] overflow-hidden py-2 px-6 font-mono text-xs whitespace-nowrap select-none">
          <div className="animate-marquee gap-8">
            {stocks.map((stock) => {
              const isPos = Number(stock.change_percent) >= 0;
              return (
                <div key={`proj-tick-a-${stock.id}`} className="inline-flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                  <span className="tnum text-[var(--text-secondary)]">${Number(stock.price).toFixed(2)}</span>
                  <span
                    className={`inline-flex items-center font-semibold tnum ${
                      isPos ? "text-[#00d68f]" : "text-[#ff5b4f]"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                  </span>
                  <span className="text-[var(--text-tertiary)] ml-4">•</span>
                </div>
              );
            })}
            {stocks.map((stock) => {
              const isPos = Number(stock.change_percent) >= 0;
              return (
                <div key={`proj-tick-b-${stock.id}`} className="inline-flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                  <span className="tnum text-[var(--text-secondary)]">${Number(stock.price).toFixed(2)}</span>
                  <span
                    className={`inline-flex items-center font-semibold tnum ${
                      isPos ? "text-[#00d68f]" : "text-[#ff5b4f]"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                  </span>
                  <span className="text-[var(--text-tertiary)] ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PODIUM + RANKINGS DISPLAY OR SUSPENSE AUDIT SCREEN */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 sm:p-8 space-y-8 font-mono">
        {!gameState.is_results_revealed ? (
          /* ========================================================================= */
          /* SUSPENSE AUDIT SCREEN (RESULTS NOT OUT YET) */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in py-4">
            
            {/* Grand Dramatic Hero Banner */}
            <div className="vercel-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border-2 border-[var(--accent-maroon-border)] bg-gradient-to-b from-[var(--surface-1)] via-[var(--canvas)] to-[var(--surface-1)] shadow-2xl">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--accent-maroon-subtle)] rounded-full blur-3xl pointer-events-none" />
              
              {/* Animated Lock & Emblem Status */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Glowing Radar Rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-maroon-border)] animate-ping opacity-25" />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[var(--accent-maroon-subtle)] to-[var(--surface-2)] shadow-[0_0_24px_rgba(74,21,27,0.15)] dark:shadow-[0_0_24px_rgba(74,21,27,0.35)] flex items-center justify-center p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Logo.png" alt="Investor Forum Logo" className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] shadow-[0_0_0_1px_var(--accent-maroon-border)] mb-4 animate-pulse">
                  <Lock className="w-3.5 h-3.5" />
                  <span>OFFICIAL AUDIT UNDERWAY • STANDINGS SEALED</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight max-w-3xl leading-tight">
                  OFFICIAL TOURNAMENT RESULTS NOT RELEASED YET
                </h2>

                <p className="text-xs sm:text-base text-[var(--text-secondary)] max-w-2xl mt-4 font-sans leading-relaxed">
                  The Competition Directors and Auditing Desk are currently validating final trade settlements, liquidity ledgers, and portfolio valuations. Stand by for the grand podium winner announcement.
                </p>

                {/* Dynamic Round & Countdown Timer Status Row */}
                {(() => {
                  const timing = getRoundTimingInfo(gameState);
                  return (
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 pt-6 border-t border-[var(--border-color)] text-xs font-mono">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
                        <Calendar className="w-4 h-4 text-[var(--accent-maroon-text)]" />
                        <span className="font-bold text-[var(--text-primary)]">
                          ROUND {timing.currentRoundNum} OF {timing.totalRounds}
                        </span>
                      </div>

                      {timing.hasActiveTimer && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] animate-pulse">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">
                            {timing.roundTimeFormatted} REMAINING IN ROUND {timing.currentRoundNum}
                          </span>
                        </div>
                      )}

                      {timing.isIntermission && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] animate-pulse">
                          <Timer className="w-4 h-4" />
                          <span className="font-bold">
                            NEXT ROUND STARTS IN {timing.nextRoundTimeFormatted}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                        <Activity className="w-4 h-4 text-[#00d68f]" />
                        <span>{gameState.is_market_open ? "LIVE TRADING OPEN" : "MARKET PAUSED"}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* MYSTERY LOCKED PODIUM PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Mystery Rank 2 */}
              <div className="vercel-card rounded-2xl p-6 shadow-xl order-2 md:order-1 relative overflow-hidden border border-[var(--border-color)] opacity-90">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-md bg-[var(--surface-3)] text-[var(--text-secondary)] text-xs font-bold flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-slate-400" />
                    <span>RANK #2 (SILVER)</span>
                  </span>
                  <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
                <div className="h-8 bg-[var(--surface-2)] rounded-lg animate-pulse w-3/4 mb-4" />
                <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Valuation</span>
                    <span className="text-lg font-bold text-[var(--text-secondary)] tracking-widest">?????? USD</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-tertiary)] font-bold">
                    SEALED
                  </span>
                </div>
              </div>

              {/* Mystery Rank 1 - Champion */}
              <div className="vercel-card rounded-2xl p-8 shadow-2xl border-2 border-[#402b28]/40 dark:border-[#eae0d3]/40 order-1 md:order-2 bg-[var(--surface-1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#402b28] dark:via-[#eae0d3] to-transparent" />
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 rounded-lg bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] text-sm font-black flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#402b28] dark:text-[#eae0d3]" />
                    <span>CHAMPION #1 (GOLD)</span>
                  </span>
                  <div className="w-3 h-3 rounded-full bg-[#402b28] dark:bg-[#eae0d3] animate-ping" />
                </div>
                <div className="h-10 bg-[var(--surface-2)] rounded-lg animate-pulse w-4/5 mb-6" />
                <div className="pt-5 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Grand Champion Net Worth</span>
                    <span className="text-2xl font-black text-[#402b28] dark:text-[#eae0d3] tracking-widest">?????? USD</span>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-md bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] font-bold shadow-[0_0_0_1px_var(--border-color)]">
                    CONFIDENTIAL
                  </span>
                </div>
              </div>

              {/* Mystery Rank 3 */}
              <div className="vercel-card rounded-2xl p-6 shadow-xl order-3 relative overflow-hidden border border-[var(--border-color)] opacity-90">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-md bg-[#7928ca]/10 text-[#7928ca] text-xs font-bold flex items-center gap-1.5">
                    <Medal className="w-4 h-4" />
                    <span>RANK #3 (BRONZE)</span>
                  </span>
                  <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
                <div className="h-8 bg-[var(--surface-2)] rounded-lg animate-pulse w-2/3 mb-4" />
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Valuation</span>
                    <span className="text-lg font-bold text-[var(--text-secondary)] tracking-widest">?????? USD</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-tertiary)] font-bold">
                    SEALED
                  </span>
                </div>
              </div>
            </div>

            {/* Locked Standings Notice Card */}
            <div className="vercel-card rounded-2xl p-6 text-center">
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                {rankedTeams.length} registered participant desks will be ranked in the official order upon director authorization.
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* REVEALED OFFICIAL WINNERS PODIUM + STANDINGS */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in">
            {/* Victory Announcement Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center shadow-[0_0_0_1px_var(--border-color)]">
                  <Trophy className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    OFFICIAL TOURNAMENT CHAMPIONS & FINAL STANDINGS
                  </h2>
                  <p className="text-xs font-mono text-[var(--text-secondary)]">
                    Audited and certified by Competition Directors.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>OFFICIAL RESULTS</span>
              </span>
            </div>

            {/* PODIUM CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Rank 2 */}
              {top2 && (
                <div className="vercel-card rounded-2xl p-6 shadow-xl order-2 md:order-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-md bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] text-xs font-bold flex items-center gap-1.5">
                      <Medal className="w-4 h-4" />
                      <span>RANK #2</span>
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] font-bold">SILVER PODIUM</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] truncate">{top2.name}</h3>
                  <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--text-tertiary)] block uppercase">Net Worth</span>
                      <span className="text-xl font-bold text-[var(--text-primary)] tnum">
                        ${Number(top2.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded ${
                        top2.pnlPercent >= 0
                          ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                      }`}
                    >
                      {top2.pnlPercent >= 0 ? "+" : ""}{top2.pnlPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 1 - Champion */}
              {top1 && (
                <div className="vercel-card rounded-2xl p-8 shadow-2xl shadow-[#402b28]/10 dark:shadow-[#eae0d3]/5 shadow-[0_0_0_1px_rgba(64,43,40,0.4)] dark:shadow-[0_0_0_1px_rgba(234,224,211,0.4)] order-1 md:order-2 bg-[var(--surface-1)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-1.5 rounded-xl bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[0_0_0_1px_rgba(64,43,40,0.4)] text-sm font-black flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#f8f4ed] dark:text-[#1b0805]" />
                      <span>CHAMPION #1</span>
                    </span>
                    <span className="text-xs text-[#402b28] dark:text-[#eae0d3] font-bold">GOLD PODIUM</span>
                  </div>
                  <h3 className="text-3xl font-black text-[var(--text-primary)] truncate tracking-tight">{top1.name}</h3>
                  <div className="mt-8 pt-5 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--text-tertiary)] block uppercase">Total Net Worth</span>
                      <span className="text-2xl font-black text-[var(--text-primary)] tnum">
                        ${Number(top1.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <span
                      className={`text-base font-bold px-3.5 py-1 rounded-xl ${
                        top1.pnlPercent >= 0
                          ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                      }`}
                    >
                      {top1.pnlPercent >= 0 ? "+" : ""}{top1.pnlPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {top3 && (
                <div className="vercel-card rounded-2xl p-6 shadow-xl order-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-md bg-[#7928ca]/10 text-[#7928ca] shadow-[0_0_0_1px_rgba(121,40,202,0.2)] text-xs font-bold flex items-center gap-1.5">
                      <Medal className="w-4 h-4" />
                      <span>RANK #3</span>
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] font-bold">BRONZE PODIUM</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] truncate">{top3.name}</h3>
                  <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--text-tertiary)] block uppercase">Net Worth</span>
                      <span className="text-xl font-bold text-[var(--text-primary)] tnum">
                        ${Number(top3.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-xl ${
                        top3.pnlPercent >= 0
                          ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                      }`}
                    >
                      {top3.pnlPercent >= 0 ? "+" : ""}{top3.pnlPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FULL RANKINGS TABLE */}
            <div className="vercel-card rounded-2xl p-6 overflow-x-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
                <h3 className="text-sm font-bold uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
                  <span>Official Tournament Standings</span>
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">{rankedTeams.length}&nbsp;Participating Desks</span>
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="pb-3 font-semibold text-center w-16">Rank</th>
                    <th className="pb-3 font-semibold">Trading Desk</th>
                    <th className="pb-3 font-semibold text-right">Cash Balance</th>
                    <th className="pb-3 font-semibold text-right">Stock Valuation</th>
                    <th className="pb-3 font-semibold text-right">Total Net Worth</th>
                    <th className="pb-3 font-semibold text-right">Return on Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {rankedTeams.map((team, idx) => {
                    const isPos = team.pnlPercent >= 0;
                    return (
                      <tr key={team.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="py-4 text-center font-bold text-base font-mono">
                          {idx === 0 ? (
                            <div className="inline-flex items-center justify-center p-1 rounded-full bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]">
                              <GoldMedalIcon className="w-6 h-6 drop-shadow" />
                            </div>
                          ) : idx === 1 ? (
                            <div className="inline-flex items-center justify-center p-1 rounded-full bg-slate-400/10 shadow-[0_0_0_1px_rgba(203,213,225,0.25)]">
                              <SilverMedalIcon className="w-6 h-6 drop-shadow" />
                            </div>
                          ) : idx === 2 ? (
                            <div className="inline-flex items-center justify-center p-1 rounded-full bg-amber-700/10 shadow-[0_0_0_1px_rgba(180,83,9,0.25)]">
                              <BronzeMedalIcon className="w-6 h-6 drop-shadow" />
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold text-[var(--text-muted)] bg-[var(--surface-2)]">
                              #{idx + 1}
                            </span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-base text-[var(--text-primary)]">{team.name}</td>
                        <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                          ${Number(team.cash_balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                          ${Number(team.stockValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-4 text-right font-black text-lg text-[var(--text-primary)] tnum">
                          ${Number(team.netWorth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-right font-bold tnum">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded text-xs ${
                              isPos
                                ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                                : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                            }`}
                          >
                            {isPos ? "+" : ""}{team.pnlPercent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--canvas)] px-8 py-3 font-mono text-xs text-[var(--text-secondary)] flex items-center justify-between">
        <span>Investor Forum Live Simulation</span>
        <span className="flex items-center gap-1.5 text-[#00d68f]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d68f]" />
          <span>Real-time Sync Active</span>
        </span>
      </footer>
    </div>
  );
}
