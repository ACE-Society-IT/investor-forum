"use client";

import React from "react";
import { Activity, Clock, ArrowUpRight, ArrowDownRight, Newspaper, ArrowRight, Radio } from "lucide-react";

export default function LiveNewsFeed({ news = [], onNavigateTab }) {
  const latestItem = news && news.length > 0 ? news[0] : null;

  const impact = Number(latestItem?.impact_percent || 0);
  const isPos = impact > 0;
  const isNeg = impact < 0;

  return (
    <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            Latest Bulletin
          </h3>
        </div>
        {latestItem?.sector && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
            {latestItem.sector}
          </span>
        )}
      </div>

      {/* Main Latest News Content */}
      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
        {!latestItem ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <Activity className="w-8 h-8 text-[var(--text-muted)] mb-3 animate-pulse" />
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              No active market alerts.<br />
              Monitoring incoming feeds…
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Meta bar: Time & Impact */}
            <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                <Clock className="w-3.5 h-3.5" />
                {new Date(latestItem.created_at || Date.now()).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
              {impact !== 0 && (
                <span
                  className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[11px] ${
                    isPos
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
                  }`}
                >
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPos ? "+" : ""}{impact}% Impact
                </span>
              )}
            </div>

            {/* Headline */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] border-l-4 border-l-rose-500 shadow-sm">
              <h4 className="font-bold text-sm leading-snug text-[var(--text-primary)]">
                {latestItem.headline}
              </h4>
            </div>

            {/* Story Body */}
            {latestItem.body && latestItem.body !== latestItem.headline && (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans px-1">
                {latestItem.body}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation to Full News Wire */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-2)]/60 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
          {news.length > 1 ? `+${news.length - 1} archived on Wire` : "Live Feed"}
        </span>
        {onNavigateTab ? (
          <button
            onClick={() => onNavigateTab("news")}
            className="text-[11px] font-mono font-bold text-[#402b28] dark:text-[#eae0d3] hover:underline inline-flex items-center gap-1"
          >
            News Wire <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">News Wire</span>
        )}
      </div>
    </div>
  );
}
