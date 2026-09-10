"use client";

import { useState, useMemo, useEffect } from "react";
import LiveNewsFeed from "./LiveNewsFeed";
import TradingChart from "./TradingChart";
import { Search, RotateCcw, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sparkline from "../Sparkline";

export default function TradingFloorView({
  stocks = [],
  news = [],
  selectedSector,
  setSelectedSector,
  onSelectStock,
  isMarketPaused
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedStock, setFocusedStock] = useState(null);

  const sectors = ["All", "Technology", "Pharmaceuticals", "Energy", "Consumer Goods"];

  // Filter stocks safely
  const filteredStocks = useMemo(() => {
    return (stocks || []).filter((stock) => {
      const matchesSector = selectedSector === "All" || stock.sector === selectedSector;
      const q = (searchQuery || "").toLowerCase();
      const matchesSearch =
        (stock.ticker || "").toLowerCase().includes(q) ||
        (stock.name || "").toLowerCase().includes(q) ||
        (stock.sector || "").toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });
  }, [stocks, selectedSector, searchQuery]);

  // Set initial focused stock
  useEffect(() => {
    if (!focusedStock && filteredStocks.length > 0) {
      setFocusedStock(filteredStocks[0]);
    }
  }, [filteredStocks, focusedStock]);

  // Keep focusedStock synced with latest real-time price data
  useEffect(() => {
    if (focusedStock && stocks.length > 0) {
      const updated = stocks.find((s) => s.id === focusedStock.id);
      if (updated && (updated.price !== focusedStock.price || updated.spark_data !== focusedStock.spark_data)) {
        setFocusedStock(updated);
      }
    }
  }, [stocks, focusedStock]);

  return (
    <div className="space-y-5 animate-fade-in font-sans flex flex-col h-[calc(100vh-140px)]">

      {/* Top Controls: Search & Sectors */}
      <div className="vercel-card rounded-2xl p-4 border border-[var(--border-color)] shrink-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search ticker, company or sector…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-9 pr-4 py-2 text-sm sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3] transition-all duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sectors.map((sec) => {
              const count = sec === "All" ? stocks.length : stocks.filter((s) => s.sector === sec).length;
              const isSelected = selectedSector === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                      : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] hover:bg-[var(--surface-3)]"
                  }`}
                >
                  {sec}&nbsp;<span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Split View: Chart (left) & News (right) */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Chart — takes the majority of space */}
        <div className="w-full lg:flex-1 h-full min-w-0 order-2 lg:order-1">
          <TradingChart stock={focusedStock} />
        </div>
        {/* Live News Feed — right side */}
        <div className="w-full lg:w-[30%] xl:w-[26%] h-full shrink-0 order-1 lg:order-2">
          <LiveNewsFeed news={news} />
        </div>
      </div>

      {/* Bottom Horizontal Stock Strip */}
      <div className="shrink-0">
        {filteredStocks.length === 0 ? (
          <div className="vercel-card rounded-2xl py-8 flex items-center justify-center border border-[var(--border-color)] bg-[var(--surface-1)]">
            <div className="text-center">
              <p className="text-sm font-mono text-[var(--text-secondary)]">No equities matched your search.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSector("All");
                }}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 pr-4 snap-x snap-mandatory">
            {filteredStocks.map((stock) => {
              const isFocused = focusedStock?.id === stock.id;
              const currentPrice = Number(stock.price || 0);
              const changePct = Number(stock.change_percent || 0);
              const isPos = changePct >= 0;

              return (
                <div
                  key={stock.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setFocusedStock(stock)}
                  onKeyDown={(e) => { if (e.key === "Enter") setFocusedStock(stock); }}
                  className={`flex-shrink-0 w-[220px] rounded-2xl p-3.5 cursor-pointer select-none snap-start transition-all duration-200 ${
                    isFocused
                      ? "bg-[var(--surface-1)] shadow-[0_0_0_2px_#402b28] dark:shadow-[0_0_0_2px_#eae0d3]"
                      : "bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)] hover:bg-[var(--surface-3)] opacity-90 hover:opacity-100"
                  }`}
                >
                  {/* Top row: ticker + price */}
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="min-w-0">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm tracking-tight">{stock.ticker}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[100px]">{stock.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-[var(--text-primary)] text-sm tnum">${currentPrice.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold tnum flex items-center justify-end gap-0.5 ${isPos ? "text-emerald-500" : "text-rose-500"}`}>
                        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPos ? "+" : ""}{changePct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: sparkline + trade button */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="w-[70px] h-[18px]">
                      <Sparkline
                        data={stock.spark_data || [100, 102, 98, 105, 110]}
                        isPositive={isPos}
                        width={70}
                        height={18}
                      />
                    </div>
                    <button
                      disabled={isMarketPaused}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(stock);
                      }}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold font-mono bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      TRADE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
