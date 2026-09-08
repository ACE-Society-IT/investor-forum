"use client";

import React from "react";
import {
  Menu,
  RefreshCw,
  Plus,
  AlertTriangle,
  Activity,
  TrendingUp,
  Wallet,
  BarChart3,
  Award,
  Newspaper,
  HelpCircle,
  Clock,
  Timer,
  Calendar
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { getRoundTimingInfo } from "../../lib/roundTimer";

export default function DashboardHeader({
  activeTab,
  gameState,
  teamCash,
  totalNetWorth,
  totalPnL,
  totalPnLPercent,
  isRefreshing,
  onManualRefresh,
  onOpenTradeModal,
  onToggleSidebar
}) {
  const metaMap = {
    overview: {
      title: "Overview",
      subtitle: "Portfolio metrics & capital allocation",
      icon: Activity
    },
    stocks: {
      title: "Trading Floor",
      subtitle: "Live order execution & market board",
      icon: TrendingUp
    },
    portfolio: {
      title: "Portfolio",
      subtitle: "Active positions & fill logs",
      icon: Wallet
    },
    market: {
      title: "Intelligence",
      subtitle: "Sector metrics & fundamentals",
      icon: BarChart3
    },
    leaderboard: {
      title: "Standings",
      subtitle: "Tournament net worth leaderboard",
      icon: Award
    },
    news: {
      title: "News Wire",
      subtitle: "Economic shockwaves & catalysts",
      icon: Newspaper
    },
    rules: {
      title: "Rules & Guide",
      subtitle: "Exchange mechanics & parameters",
      icon: HelpCircle
    }
  };

  const currentMeta = metaMap[activeTab] || metaMap.overview;
  const ActiveIcon = currentMeta.icon;
  const isMarketPaused = !gameState.is_market_open;
  const isPnLPositive = (totalPnL || 0) >= 0;
  const timing = getRoundTimingInfo(gameState);

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface-1)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-2.5 sm:px-5 lg:px-7 py-2 sm:py-2.5 transition-colors duration-150">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3 max-w-7xl mx-auto w-full">
        {/* Left: Mobile Trigger & View Identifier */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile Sidebar Hamburger Trigger */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden transition-all duration-150 shrink-0 active:scale-95"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Active Section Branding */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="hidden sm:flex w-7 h-7 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] items-center justify-center text-[#4a151b] dark:text-[#d8a4a7] shrink-0">
              <ActiveIcon className="w-3.5 h-3.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-[var(--text-primary)] tracking-tight truncate leading-none">
                  {currentMeta.title}
                </h1>

                {/* Mobile-only status badge */}
                <div className="flex sm:hidden items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--surface-2)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]">
                    R{timing.currentRoundNum}/{timing.totalRounds}
                  </span>
                  {timing.hasActiveTimer && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] animate-pulse">
                      {timing.roundTimeFormatted}
                    </span>
                  )}
                  {timing.isIntermission && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] animate-pulse">
                      BREAK {timing.nextRoundTimeFormatted}
                    </span>
                  )}
                  {isMarketPaused && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]">
                      PAUSED
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-mono hidden md:block truncate mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Tablet & Desktop Round & Timer Status Pill */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#4a151b] dark:text-[#d8a4a7]" />
            <span>ROUND {timing.currentRoundNum} OF {timing.totalRounds}</span>
          </div>

          {timing.hasActiveTimer && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{timing.roundTimeFormatted} LEFT</span>
            </div>
          )}

          {timing.isIntermission && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] text-amber-600 dark:text-amber-400 font-bold animate-pulse">
              <Timer className="w-3.5 h-3.5" />
              <span>NEXT ROUND IN {timing.nextRoundTimeFormatted}</span>
            </div>
          )}

          {isMarketPaused && !timing.isIntermission && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>PAUSED</span>
            </div>
          )}
        </div>

        {/* Right: Net Worth Metric, Quick Order, Theme & Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono shrink-0">
          {/* Available Cash (Large screens only) */}
          <div className="hidden xl:block text-right pr-2">
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block leading-none">
              Cash Power
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] tnum mt-0.5 block">
              ${Number(teamCash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-color)] hidden xl:block" />

          {/* Unified Net Worth Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
            <div className="text-right">
              <span className="text-[8px] sm:text-[9px] text-[var(--text-muted)] uppercase tracking-wider block leading-none">
                Net Worth
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tnum mt-0.5 block">
                ${Number(totalNetWorth).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            <span
              className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded flex items-center shrink-0 ${
                isPnLPositive
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "text-rose-600 dark:text-rose-400 bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)]"
              }`}
            >
              {isPnLPositive ? "+" : ""}{totalPnLPercent}%
            </span>
          </div>

          {/* Quick Trade / Order Action */}
          <button
            onClick={onOpenTradeModal}
            disabled={isMarketPaused}
            title={isMarketPaused ? "Market is paused" : "Open Order Window"}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 shrink-0 ${
              isMarketPaused
                ? "bg-[var(--surface-3)] text-[var(--text-muted)] cursor-not-allowed opacity-60"
                : "bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] shadow-rose-950/20"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Order</span>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Manual Sync / Refresh */}
          <button
            onClick={onManualRefresh}
            aria-label="Refresh market data"
            title="Refresh Live Data"
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500 dark:text-yellow-400" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
