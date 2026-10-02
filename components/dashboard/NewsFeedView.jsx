"use client";

import React, { useState } from "react";
import { Radio, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function NewsFeedView({ news = [] }) {
  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* News Feed Timeline Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Institutional News Wire</h3>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {news.length} Broadcast{news.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* News Feed Timeline */}
      <div className="space-y-3">
        {news.length === 0 ? (
          <div className="text-center py-16 vercel-card rounded-xl">
            <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-primary)] text-sm font-semibold">No Broadcast Bulletins Yet</p>
            <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
              Tournament organizers will transmit market news headlines and catalyst stories in real time.
            </p>
          </div>
        ) : (
          news.map((item, idx) => {
            return (
              <div
                key={item.id || idx}
                className="vercel-card rounded-xl p-4 sm:p-5 transition-all duration-150 border border-[var(--border-color)] space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Official Catalyst
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
                </div>

                <h4 className="text-xs sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                  {item.headline}
                </h4>
                {item.body && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed font-sans whitespace-pre-line">
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
