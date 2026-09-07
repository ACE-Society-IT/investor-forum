"use client";

import React, { useState } from "react";
import { Radio, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function NewsFeedView({ news = [] }) {
  const [selectedSector, setSelectedSector] = useState("ALL");

  const sectors = ["ALL", "Technology", "Pharmaceuticals", "Energy", "Consumer Goods"];

  const filteredNews = news.filter((item) => {
    if (selectedSector === "ALL") return true;
    return item.sector.toLowerCase() === selectedSector.toLowerCase();
  });

  const sectorColors = {
    Technology: "text-amber-500 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] dark:text-yellow-400 dark:bg-yellow-400/10",
    Pharmaceuticals: "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]",
    Energy: "text-[#f5a623] bg-[#f5a623]/10 shadow-[0_0_0_1px_rgba(245,166,35,0.2)]",
    "Consumer Goods": "text-[#7928ca] bg-[#7928ca]/10 shadow-[0_0_0_1px_rgba(121,40,202,0.2)]",
    ALL: "text-[var(--text-primary)] bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]"
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Sector Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--border-color)]">
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 shrink-0 ${
              selectedSector === sec
                ? "bg-[var(--accent-yellow)] text-black font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
                : "bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* News Feed Timeline */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 vercel-card rounded-xl">
            <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-primary)] text-sm font-semibold">No News Bulletins in this Sector</p>
            <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
              Tournament organizers will transmit market news headlines and shocks in real time.
            </p>
          </div>
        ) : (
          filteredNews.map((item, idx) => {
            const isPositive = (item.impact_percent || 0) >= 0;
            return (
              <div
                key={item.id || idx}
                className="vercel-card rounded-xl p-4 transition-all duration-150"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        sectorColors[item.sector] || sectorColors.ALL
                      }`}
                    >
                      {item.sector}
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

                  {item.impact_percent !== undefined && item.impact_percent !== null && (
                    <span
                      className={`font-medium flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                        isPositive
                          ? "bg-[#00d68f]/10 text-[#00d68f] shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "bg-[#ff5b4f]/10 text-[#ff5b4f] shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? "+" : ""}{Number(item.impact_percent).toFixed(1)}% Sector Shift</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                  {item.headline}
                </h4>
                {item.body && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed font-sans">
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
