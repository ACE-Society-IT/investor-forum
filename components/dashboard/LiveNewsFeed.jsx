"use client";

import React from "react";
import { Activity, Clock, ArrowUpRight, ArrowDownRight, Newspaper, ArrowRight, Radio } from "lucide-react";
import SecureCrisisViewer from "../SecureCrisisViewer";

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
            <SecureCrisisViewer
              headline={latestItem.headline}
              body={latestItem.body}
              timestamp={latestItem.created_at}
              isWindowFocused={true}
              allowFullscreen={false}
            />
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
