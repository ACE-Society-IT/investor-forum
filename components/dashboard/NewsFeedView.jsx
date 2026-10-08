"use client";

import React, { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import SecureCrisisViewer from "../SecureCrisisViewer";

export default function NewsFeedView({ news = [] }) {
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const handleBlur = () => setIsWindowFocused(false);
    const handleFocus = () => setIsWindowFocused(true);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

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
      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-16 vercel-card rounded-xl">
            <Radio className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-primary)] text-sm font-semibold">No Broadcast Bulletins Yet</p>
            <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
              Tournament organizers will transmit market news headlines and catalyst stories in real time.
            </p>
          </div>
        ) : (
          news.map((item, idx) => (
            <SecureCrisisViewer
              key={item.id || idx}
              headline={item.headline}
              body={item.body}
              timestamp={item.created_at}
              isWindowFocused={isWindowFocused}
              allowFullscreen={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

