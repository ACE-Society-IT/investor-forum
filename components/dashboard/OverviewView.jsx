"use client";

import React from "react";
import {
  Wallet,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Activity,
  PieChart,
  Clock,
  Timer,
  Calendar,
  Zap
} from "lucide-react";
import Sparkline from "../Sparkline";
import { getRoundTimingInfo } from "../../lib/roundTimer";

export default function OverviewView({
  gameState = {},
  teamCash,
  totalPortfolioValue,
  totalNetWorth,
  totalPnL,
  totalPnLPercent,
  portfolioHoldings,
  stocks,
  news,
  onSelectStock,
  onNavigateTab,
  isMarketPaused
}) {
  const sortedStocks = [...stocks].sort((a, b) => Number(b.change_percent) - Number(a.change_percent));
  const topGainers = sortedStocks.slice(0, 3);
  const topLosers = [...sortedStocks].reverse().slice(0, 3);

  const sectorAllocation = portfolioHoldings.reduce((acc, item) => {
    const sector = item.stock?.sector || "Other";
    acc[sector] = (acc[sector] || 0) + item.marketValue;
    return acc;
  }, {});

  const sectorColors = {
    Technology: "bg-[#facc15] text-[#ca8a04] dark:text-[#facc15]",
    Pharmaceuticals: "bg-[#00d68f] text-[#059669] dark:text-[#00d68f]",
    Energy: "bg-[#f5a623] text-[#d97706] dark:text-[#f5a623]",
    "Consumer Goods": "bg-[#7928ca] text-[#7c3aed] dark:text-[#7928ca]",
    Cash: "bg-[#888888] text-[var(--text-secondary)]"
  };

  const cashPercent = totalNetWorth > 0 ? (teamCash / totalNetWorth) * 100 : 100;
  const equityPercent = totalNetWorth > 0 ? (totalPortfolioValue / totalNetWorth) * 100 : 0;
  const timing = getRoundTimingInfo(gameState);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 0. TOURNAMENT ROUND PROGRESS & LIVE TIMER BANNER */}
      <div className="vercel-card rounded-2xl p-4 sm:p-5 font-mono border-l-4 border-l-[var(--accent-maroon-border-strong)] shadow-lg bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] flex items-center justify-center shrink-0 shadow-[0_0_0_1px_var(--accent-maroon-border)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                  Tournament Schedule
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] shadow-[0_0_0_1px_var(--accent-maroon-border)]">
                  ROUND {timing.currentRoundNum} OF {timing.totalRounds}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {timing.currentRoundName}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {timing.hasActiveTimer && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] animate-pulse">
                <Clock className="w-4 h-4" />
                <div>
                  <span className="text-[10px] uppercase block text-[var(--text-tertiary)] leading-none">Time Remaining</span>
                  <span className="text-sm font-bold tnum">{timing.roundTimeFormatted}</span>
                </div>
              </div>
            )}

            {timing.isIntermission && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] animate-pulse">
                <Timer className="w-4 h-4" />
                <div>
                  <span className="text-[10px] uppercase block text-[var(--text-tertiary)] leading-none">Next Round In</span>
                  <span className="text-sm font-bold tnum">{timing.nextRoundTimeFormatted}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
              <span className={`w-2 h-2 rounded-full ${gameState.is_market_open ? "bg-[#00d68f] animate-ping" : "bg-[#f5a623]"}`} />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {gameState.is_market_open ? "EXCHANGE LIVE" : "EXCHANGE PAUSED"}
              </span>
            </div>
          </div>
        </div>

        {/* Round Progress Visual Dots */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold shrink-0">Rounds:</span>
          <div className="flex items-center gap-2 flex-1">
            {Array.from({ length: timing.totalRounds }, (_, i) => i + 1).map((rNum) => {
              const isPast = rNum < timing.currentRoundNum;
              const isCurrent = rNum === timing.currentRoundNum;
              return (
                <div
                  key={`round-indicator-${rNum}`}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-[var(--accent-yellow)] shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                      : isPast
                      ? "bg-emerald-500"
                      : "bg-[var(--surface-3)] opacity-40"
                  }`}
                  title={`Round ${rNum} ${isCurrent ? "(Current)" : isPast ? "(Completed)" : "(Upcoming)"}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. EXECUTIVE METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Total Net Worth */}
        <div className="vercel-card rounded-xl p-4">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-1.5">
            <span className="uppercase font-bold tracking-wider text-[10px]">Total Net Worth</span>
            <Activity className="w-3.5 h-3.5 text-[#ca8a04] dark:text-[#facc15]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tnum tracking-tight">
            ${Number(totalNetWorth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`font-bold ${totalPnL >= 0 ? "text-[#059669] dark:text-[#00d68f]" : "text-[#e11d48] dark:text-[#ff5b4f]"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[var(--text-tertiary)] text-[11px]">({totalPnL >= 0 ? "+" : ""}{totalPnLPercent}%)</span>
          </div>
        </div>

        {/* Liquid Cash */}
        <div className="vercel-card rounded-xl p-4">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-1.5">
            <span className="uppercase font-bold tracking-wider text-[10px]">Available Cash</span>
            <Wallet className="w-3.5 h-3.5 text-[#059669] dark:text-[#00d68f]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tnum tracking-tight">
            ${Number(teamCash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            {cashPercent.toFixed(1)}% liquid reserves
          </div>
        </div>

        {/* Stock Holdings Valuation */}
        <div className="vercel-card rounded-xl p-4">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-1.5">
            <span className="uppercase font-bold tracking-wider text-[10px]">Stock Holdings</span>
            <Briefcase className="w-3.5 h-3.5 text-[#7c3aed] dark:text-[#7928ca]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tnum tracking-tight">
            ${Number(totalPortfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            {portfolioHoldings.length} active positions ({equityPercent.toFixed(1)}%)
          </div>
        </div>

        {/* Return on Capital */}
        <div className="vercel-card rounded-xl p-4">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-1.5">
            <span className="uppercase font-bold tracking-wider text-[10px]">Return on Capital</span>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#059669] dark:text-[#00d68f]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#e11d48] dark:text-[#ff5b4f]" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tnum tracking-tight">
            {totalPnL >= 0 ? "+" : ""}{totalPnLPercent}%
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            Baseline: $100,000.00 USD
          </div>
        </div>
      </div>

      {/* 2. CAPITAL ALLOCATION & BREAKING NEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Capital Allocation Bar */}
        <div className="lg:col-span-2 vercel-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#ca8a04] dark:text-[#facc15]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Capital Allocation
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              Total Assets: ${Number(totalNetWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="w-full h-3 rounded-md bg-[var(--surface-3)] overflow-hidden flex shadow-[0_0_0_1px_var(--border-color)]">
            <div
              style={{ width: `${Math.max(2, cashPercent)}%` }}
              className="bg-[#888888] transition-[width] duration-300 relative"
              title={`Cash: ${cashPercent.toFixed(1)}%`}
            />
            {Object.entries(sectorAllocation).map(([sec, val]) => {
              const pct = totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;
              const colorClass = sectorColors[sec] ? sectorColors[sec].split(" ")[0] : "bg-[#facc15]";
              return (
                <div
                  key={sec}
                  style={{ width: `${Math.max(1, pct)}%` }}
                  className={`${colorClass} transition-[width] duration-300`}
                  title={`${sec}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#888888]" />
              <span className="text-[var(--text-secondary)]">Liquid Cash ({cashPercent.toFixed(1)}%)</span>
            </div>
            {Object.entries(sectorAllocation).map(([sec, val]) => {
              const pct = totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;
              const colorClass = sectorColors[sec] ? sectorColors[sec].split(" ")[0] : "bg-[#facc15]";
              return (
                <div key={sec} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />
                  <span className="text-[var(--text-secondary)]">{sec} ({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breaking News Card */}
        <div className="vercel-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#ff5b4f] animate-pulse" />
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                  News Wire
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("news")}
                className="text-[11px] font-mono text-[#ca8a04] dark:text-[#facc15] hover:opacity-80 transition-opacity"
              >
                View All →
              </button>
            </div>

            {news && news.length > 0 ? (
              <div className="p-3 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                  <span className="px-1.5 py-0.2 rounded bg-[#ff5b4f]/10 text-[#e11d48] dark:text-[#ff5b4f] shadow-[0_0_0_1px_rgba(255,91,79,0.2)] font-bold">
                    {news[0].sector || "MARKET"}
                  </span>
                  <span>{new Date(news[0].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{news[0].headline}</h4>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-1 font-sans">{news[0].body}</p>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] font-mono py-4">No breaking market bulletins yet.</p>
            )}
          </div>

          <button
            onClick={() => onNavigateTab("news")}
            className="w-full mt-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[var(--text-primary)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] transition-colors duration-150"
          >
            Open Live News Wire
          </button>
        </div>
      </div>

      {/* 3. MARKET MOVERS (GAINERS & DECLINERS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Gainers */}
        <div className="vercel-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d68f]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Top Gainers
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#059669] dark:text-[#00d68f] font-bold">Bullish</span>
          </div>

          <div className="space-y-2">
            {topGainers.map((stock) => (
              <div
                key={stock.id}
                onClick={() => onSelectStock(stock)}
                className="p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] hover:shadow-[0_0_0_1px_rgba(0,214,143,0.3)] transition-all duration-150 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)] flex items-center justify-center font-mono font-bold text-xs text-[#059669] dark:text-[#00d68f]">
                    {stock.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-[var(--text-primary)] group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15] transition-colors duration-150">
                      {stock.ticker}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] block truncate max-w-[120px] sm:max-w-[160px]">
                      {stock.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-right">
                  <Sparkline data={stock.spark_data || [100, 105, 108]} isPositive={true} width={50} height={16} />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] tnum block">${Number(stock.price).toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-[#059669] dark:text-[#00d68f] tnum">+{Number(stock.change_percent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="vercel-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#ff5b4f]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Top Decliners
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#e11d48] dark:text-[#ff5b4f] font-bold">Bearish</span>
          </div>

          <div className="space-y-2">
            {topLosers.map((stock) => (
              <div
                key={stock.id}
                onClick={() => onSelectStock(stock)}
                className="p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] hover:shadow-[0_0_0_1px_rgba(255,91,79,0.3)] transition-all duration-150 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)] flex items-center justify-center font-mono font-bold text-xs text-[#e11d48] dark:text-[#ff5b4f]">
                    {stock.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-[var(--text-primary)] group-hover:text-[#e11d48] dark:group-hover:text-[#ff5b4f] transition-colors duration-150">
                      {stock.ticker}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] block truncate max-w-[120px] sm:max-w-[160px]">
                      {stock.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-right">
                  <Sparkline data={stock.spark_data || [108, 104, 98]} isPositive={false} width={50} height={16} />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] tnum block">${Number(stock.price).toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-[#e11d48] dark:text-[#ff5b4f] tnum">{Number(stock.change_percent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ACTIVE PORTFOLIO HOLDINGS SNAPSHOT */}
      <div className="vercel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#7c3aed] dark:text-[#7928ca]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
              Current Stock Holdings
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("portfolio")}
            className="text-[11px] font-mono text-[#ca8a04] dark:text-[#facc15] hover:opacity-80 transition-opacity"
          >
            View Full Ledger →
          </button>
        </div>

        {portfolioHoldings && portfolioHoldings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">Instrument</th>
                  <th className="pb-2.5 font-bold text-right">Position</th>
                  <th className="pb-2.5 font-bold text-right">Market Price</th>
                  <th className="pb-2.5 font-bold text-right">Market Value</th>
                  <th className="pb-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {portfolioHoldings.map((item) => (
                  <tr key={item.stock_id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{item.stock?.ticker}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] hidden sm:inline">{item.stock?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">{item.shares}&nbsp;shs</td>
                    <td className="py-3 text-right text-[var(--text-secondary)] tnum">${Number(item.stock?.price).toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">
                      ${Number(item.marketValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectStock(item.stock)}
                        disabled={isMarketPaused}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#facc15] text-[#000000] hover:bg-[#eab308] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] transition-colors duration-150"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs text-[var(--text-secondary)] font-mono">No active equity positions.</p>
            <button
              onClick={() => onNavigateTab("stocks")}
              className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#facc15] text-[#000000] hover:bg-[#eab308] shadow-sm transition-colors duration-150"
            >
              Browse Trading Floor →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
