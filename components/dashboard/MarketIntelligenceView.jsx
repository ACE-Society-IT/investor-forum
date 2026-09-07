"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";

export default function MarketIntelligenceView({ stocks = [] }) {
  const sectors = ["Technology", "Pharmaceuticals", "Energy", "Consumer Goods"];

  // Compute sector statistics
  const sectorMetrics = sectors.map((sec) => {
    const secStocks = stocks.filter((s) => s.sector === sec);
    const avgChange =
      secStocks.length > 0
        ? secStocks.reduce((sum, s) => sum + Number(s.change_percent), 0) / secStocks.length
        : 0;
    const totalMarketCap = secStocks.reduce((sum, s) => sum + Number(s.price), 0);
    const gainersCount = secStocks.filter((s) => Number(s.change_percent) >= 0).length;
    const declinersCount = secStocks.filter((s) => Number(s.change_percent) < 0).length;

    return {
      sector: sec,
      stocks: secStocks,
      avgChange: Number(avgChange.toFixed(2)),
      totalMarketCap,
      gainersCount,
      declinersCount
    };
  });

  const overallMarketGainers = stocks.filter((s) => Number(s.change_percent) >= 0).length;
  const overallMarketDecliners = stocks.filter((s) => Number(s.change_percent) < 0).length;
  const totalStocks = stocks.length || 1;
  const advancePercent = (overallMarketGainers / totalStocks) * 100;
  const declinePercent = (overallMarketDecliners / totalStocks) * 100;

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* 1. SECTOR HEATMAP OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectorMetrics.map((sec) => {
          const isPositive = sec.avgChange >= 0;
          return (
            <div
              key={sec.sector}
              className="vercel-card-interactive rounded-xl p-4"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase font-bold text-[var(--text-primary)] tracking-wider text-[11px]">{sec.sector}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isPositive
                      ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                      : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {sec.avgChange}%
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] text-[11px]">Advancing / Declining:</span>
                <span className="text-[var(--text-primary)] font-bold">
                  <span className="text-[#059669] dark:text-[#00d68f]">{sec.gainersCount} ▲</span>&nbsp;/&nbsp;
                  <span className="text-[#e11d48] dark:text-[#ff5b4f]">{sec.declinersCount} ▼</span>
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] flex justify-between">
                <span>Components:</span>
                <span className="text-[var(--text-primary)]">{sec.stocks.length} Companies</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MARKET BREADTH & SENTIMENT GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="vercel-card rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
            <h3 className="text-xs font-bold uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#facc15]" />
              <span>Market Breadth</span>
            </h3>
            <span className="text-[10px] text-[#ca8a04] dark:text-[#facc15] font-bold">REAL-TIME</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#059669] dark:text-[#00d68f] font-bold">{overallMarketGainers}&nbsp;Advancing</span>
                <span className="text-[#e11d48] dark:text-[#ff5b4f] font-bold">{overallMarketDecliners}&nbsp;Declining</span>
              </div>

              <div className="w-full h-2 rounded-full bg-[var(--surface-3)] overflow-hidden flex shadow-[0_0_0_1px_var(--border-color)]">
                <div style={{ width: `${advancePercent}%` }} className="bg-[#00d68f] transition-[width] duration-300" />
                <div style={{ width: `${declinePercent}%` }} className="bg-[#ff5b4f] transition-[width] duration-300" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total Active Equities:</span>
                <span className="text-[var(--text-primary)] font-bold">{stocks.length}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Advancing Ratio:</span>
                <span className="text-[#059669] dark:text-[#00d68f] font-bold">{advancePercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Declining Ratio:</span>
                <span className="text-[#e11d48] dark:text-[#ff5b4f] font-bold">{declinePercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECTOR VOLATILITY BREAKDOWN */}
        <div className="lg:col-span-2 vercel-card rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
            <h3 className="text-xs font-bold uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#ca8a04] dark:text-[#facc15]" />
              <span>Sector Volatility Breakdown</span>
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)]">Weighted Averages</span>
          </div>

          <div className="space-y-2.5">
            {sectorMetrics.map((sec) => {
              const isPositive = sec.avgChange >= 0;
              return (
                <div
                  key={sec.sector}
                  className="p-3 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#facc15]" />
                    <span className="font-bold text-xs text-[var(--text-primary)]">{sec.sector}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-[var(--text-secondary)] hidden sm:block">
                      {sec.gainersCount}&nbsp;Up / {sec.declinersCount}&nbsp;Down
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isPositive
                          ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {sec.avgChange}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
