"use client";

import React from "react";
import { Radio, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function BreakingNewsFeed({ news = [] }) {
  const sectorColors = {
    Technology: "text-[#402b28] border-[#402b28]/30 bg-[#402b28]/10 dark:text-[#eae0d3] dark:border-[#eae0d3]/30 dark:bg-[#eae0d3]/10",
    Pharmaceuticals: "text-emerald-600 border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-400",
    Energy: "text-[#303d37] border-[#303d37]/30 bg-[#303d37]/10 dark:text-[#eae0d3] dark:border-[#eae0d3]/30 dark:bg-[#eae0d3]/10",
    "Consumer Goods": "text-purple-600 border-purple-500/30 bg-purple-500/10 dark:text-purple-400",
    All: "text-zinc-600 border-zinc-300 bg-zinc-100 dark:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
  };

  return (
    <div className="surface-card rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-rose-500" />
            Breaking News Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Live Broadcast</span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 flex-1">
        {news.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-xs font-mono">
            No news announcements yet. Organizers will broadcast market updates here.
          </div>
        ) : (
          news.map((item, idx) => {
            const isPositive = (item.impact_percent || 0) >= 0;
            return (
              <div
                key={item.id || idx}
                className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded border ${sectorColors[item.sector] || sectorColors.All}`}>
                    {item.sector}
                  </span>
                  <span className="text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time || (item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now")}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-primary)] leading-snug font-medium">
                  {item.headline}
                </p>

                {item.impact_percent !== undefined && item.impact_percent !== 0 && (
                  <div className="mt-2 pt-1.5 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--text-muted)]">Sector Impact:</span>
                    <span className={`font-bold flex items-center gap-0.5 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? "+" : ""}{Number(item.impact_percent).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
