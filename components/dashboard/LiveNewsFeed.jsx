"use client";

import React from "react";
import { Activity, Clock, ArrowUpRight, ArrowDownRight, Newspaper } from "lucide-react";

export default function LiveNewsFeed({ news = [] }) {
  return (
    <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-1.5">
            <Newspaper className="w-4 h-4" />
            Live News Wire
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
          {news.length} Updates
        </span>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {news.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
            <Activity className="w-8 h-8 text-[var(--text-muted)] mb-3" />
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              No active market alerts.<br />
              Monitoring incoming data...
            </p>
          </div>
        ) : (
          news.map((item, index) => {
            const impact = Number(item.impact_percent || 0);
            const isPos = impact > 0;
            const isNeg = impact < 0;
            const isNew = index === 0; // Highlight the very first news item

            return (
              <div
                key={item.id || index}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isNew
                    ? "bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] border-l-2 border-l-rose-500"
                    : "hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border-color)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.sector && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] font-bold">
                        {item.sector}
                      </span>
                    )}
                    {impact !== 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${
                          isPos
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(impact)}%
                      </span>
                    )}
                  </div>
                </div>
                <h4 className={`font-bold text-xs leading-snug ${isNew ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  {item.headline}
                </h4>
                {item.body && item.body !== item.headline && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
