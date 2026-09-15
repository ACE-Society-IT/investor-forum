"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import TradingChart from "@/components/dashboard/TradingChart";
import { Activity, Lock, TrendingUp, ShieldCheck, Cpu, RefreshCw } from "lucide-react";

// Fallback stock telemetry if Supabase database is empty or connecting
const DEFAULT_LANDING_STOCKS = [
  {
    id: "tech-nvda",
    ticker: "NVX",
    name: "NovaTech AI Corp",
    sector: "Tech & AI",
    price: 145.50,
    change_percent: 4.82,
    previous_price: 138.80,
    spark_data: [132.40, 135.10, 134.80, 138.20, 141.00, 140.50, 143.90, 145.50],
    spark_timestamps: [
      new Date(Date.now() - 7 * 60000).toISOString(),
      new Date(Date.now() - 6 * 60000).toISOString(),
      new Date(Date.now() - 5 * 60000).toISOString(),
      new Date(Date.now() - 4 * 60000).toISOString(),
      new Date(Date.now() - 3 * 60000).toISOString(),
      new Date(Date.now() - 2 * 60000).toISOString(),
      new Date(Date.now() - 1 * 60000).toISOString(),
      new Date().toISOString(),
    ],
  },
  {
    id: "pharma-phm",
    ticker: "PHM",
    name: "PharmaCare Therapeutics",
    sector: "Pharma & Biotech",
    price: 89.40,
    change_percent: -1.32,
    previous_price: 90.60,
    spark_data: [93.10, 92.50, 91.80, 91.20, 90.40, 89.80, 89.10, 89.40],
    spark_timestamps: [
      new Date(Date.now() - 7 * 60000).toISOString(),
      new Date(Date.now() - 6 * 60000).toISOString(),
      new Date(Date.now() - 5 * 60000).toISOString(),
      new Date(Date.now() - 4 * 60000).toISOString(),
      new Date(Date.now() - 3 * 60000).toISOString(),
      new Date(Date.now() - 2 * 60000).toISOString(),
      new Date(Date.now() - 1 * 60000).toISOString(),
      new Date().toISOString(),
    ],
  },
  {
    id: "energy-enrg",
    ticker: "ENRG",
    name: "Clean Energy Dynamics",
    sector: "Clean Energy",
    price: 114.20,
    change_percent: 2.24,
    previous_price: 111.70,
    spark_data: [108.50, 109.80, 110.20, 111.50, 112.40, 113.10, 113.80, 114.20],
    spark_timestamps: [
      new Date(Date.now() - 7 * 60000).toISOString(),
      new Date(Date.now() - 6 * 60000).toISOString(),
      new Date(Date.now() - 5 * 60000).toISOString(),
      new Date(Date.now() - 4 * 60000).toISOString(),
      new Date(Date.now() - 3 * 60000).toISOString(),
      new Date(Date.now() - 2 * 60000).toISOString(),
      new Date(Date.now() - 1 * 60000).toISOString(),
      new Date().toISOString(),
    ],
  },
  {
    id: "finance-fins",
    ticker: "FINS",
    name: "Global Finance Apex",
    sector: "Finance",
    price: 178.90,
    change_percent: 1.71,
    previous_price: 175.90,
    spark_data: [172.00, 173.50, 174.20, 175.80, 176.40, 177.10, 178.20, 178.90],
    spark_timestamps: [
      new Date(Date.now() - 7 * 60000).toISOString(),
      new Date(Date.now() - 6 * 60000).toISOString(),
      new Date(Date.now() - 5 * 60000).toISOString(),
      new Date(Date.now() - 4 * 60000).toISOString(),
      new Date(Date.now() - 3 * 60000).toISOString(),
      new Date(Date.now() - 2 * 60000).toISOString(),
      new Date(Date.now() - 1 * 60000).toISOString(),
      new Date().toISOString(),
    ],
  },
  {
    id: "semi-semi",
    ticker: "SEMI",
    name: "Hyperion Silicon",
    sector: "Semiconductors",
    price: 135.60,
    change_percent: 5.60,
    previous_price: 128.40,
    spark_data: [122.00, 124.50, 126.80, 128.20, 131.00, 133.40, 134.80, 135.60],
    spark_timestamps: [
      new Date(Date.now() - 7 * 60000).toISOString(),
      new Date(Date.now() - 6 * 60000).toISOString(),
      new Date(Date.now() - 5 * 60000).toISOString(),
      new Date(Date.now() - 4 * 60000).toISOString(),
      new Date(Date.now() - 3 * 60000).toISOString(),
      new Date(Date.now() - 2 * 60000).toISOString(),
      new Date(Date.now() - 1 * 60000).toISOString(),
      new Date().toISOString(),
    ],
  },
];

export default function TradingViewLiveChart() {
  const [stocks, setStocks] = useState(DEFAULT_LANDING_STOCKS);
  const [activeTicker, setActiveTicker] = useState("NVX");
  const [isLive, setIsLive] = useState(true);

  // Sync real-time stocks from Supabase database if available
  useEffect(() => {
    let channel;
    async function fetchStocks() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from("stocks")
          .select("*")
          .order("ticker");
        if (!error && data && data.length > 0) {
          setStocks(data);
          // Default to first stock or NVX
          const hasNvx = data.find((s) => s.ticker === "NVX");
          if (!hasNvx && data[0]) {
            setActiveTicker(data[0].ticker);
          }
        }
      } catch (e) {
        console.warn("Using default stock telemetry for landing page graph");
      }
    }

    fetchStocks();

    if (isSupabaseConfigured) {
      channel = supabase
        .channel("landing-live-stocks")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "stocks" },
          (payload) => {
            if (payload.new) {
              setStocks((prev) =>
                prev.map((s) => (s.id === payload.new.id ? payload.new : s))
              );
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const activeStock = useMemo(() => {
    return (
      stocks.find((s) => s.ticker === activeTicker) ||
      stocks[0] ||
      DEFAULT_LANDING_STOCKS[0]
    );
  }, [stocks, activeTicker]);

  return (
    <div className="w-full max-w-6xl mx-auto my-12 sm:my-16 px-4 sm:px-6">
      {/* Terminal Bezel */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-maroon-subtle/85 dark:bg-maroon-base/90 border border-border-brown/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.65)] ring-1 ring-cream-light/5 overflow-hidden transition-all duration-300">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border-brown/60 bg-maroon-base/60 dark:bg-maroon-subtle/40">
          {/* Left: Terminal live status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-green/20 border border-accent-green/40">
              <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-accent-green-bright">
                Platform Telemetry Feed
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-cream-muted/70">
              <TrendingUp className="w-3.5 h-3.5 text-cream-muted/60" />
              <span>Native Recharts Terminal</span>
            </div>
          </div>

          {/* Center: Instrument Selector (Switch between native instruments) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {stocks.map((item) => {
              const isSelected = activeTicker === item.ticker;
              return (
                <button
                  key={item.id || item.ticker}
                  type="button"
                  onClick={() => setActiveTicker(item.ticker)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-cream-muted text-maroon-base font-semibold shadow-sm"
                      : "bg-maroon-subtle/70 text-cream-muted/80 hover:text-cream-light hover:bg-maroon-subtle border border-border-brown/40"
                  }`}
                >
                  ${item.ticker}
                </button>
              );
            })}
          </div>

          {/* Right: Read-only Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cream-muted/60 shrink-0">
            <Lock className="w-3 h-3 text-cream-muted/50" />
            <span className="hidden lg:inline">Arena Stream</span>
            <span className="px-1.5 py-0.5 rounded bg-maroon-subtle/80 border border-border-brown/50 text-[10px] text-cream-muted/70">
              Desk Verified
            </span>
          </div>
        </div>

        {/* Native Dashboard TradingChart Component */}
        <div className="relative w-full p-2 sm:p-4 bg-maroon-base/40">
          <div className="w-full h-[380px] sm:h-[420px] md:h-[460px]">
            <TradingChart stock={activeStock} />
          </div>

          {/* Watermark Badge */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-md bg-maroon-base/90 dark:bg-maroon-base/95 border border-border-brown/60 backdrop-blur-md shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-green-bright" />
            <span className="text-[11px] font-mono text-cream-muted/90 font-medium">
              Investor Forum Exchange Telemetry
            </span>
          </div>
        </div>

        {/* Bottom Status Footer */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-border-brown/50 bg-maroon-base/50 dark:bg-maroon-subtle/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-cream-muted/60">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-accent-green-bright shrink-0" />
            <span className="truncate">
              Live native chart rendering platform prices &amp; order-book sparklines
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span>Latency: &lt;5ms</span>
            <span className="text-border-brown">•</span>
            <span>Feed: Supabase Realtime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
