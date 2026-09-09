"use client";

import React, { useState, useMemo } from "react";
import StockCard from "../StockCard";
import { Search, LayoutGrid, List, ArrowUpDown, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";
import Sparkline from "../Sparkline";

export default function TradingFloorView({
  stocks = [],
  selectedSector,
  setSelectedSector,
  onSelectStock,
  isMarketPaused
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [sortBy, setSortBy] = useState("default");

  const sectors = ["All", "Technology", "Pharmaceuticals", "Energy", "Consumer Goods"];

  // Filter and sort stocks safely
  const filteredStocks = useMemo(() => {
    let list = (stocks || []).filter((stock) => {
      const matchesSector = selectedSector === "All" || stock.sector === selectedSector;
      const q = (searchQuery || "").toLowerCase();
      const matchesSearch =
        (stock.ticker || "").toLowerCase().includes(q) ||
        (stock.name || "").toLowerCase().includes(q) ||
        (stock.sector || "").toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });

    if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "change-desc") {
      list.sort((a, b) => Number(b.change_percent || 0) - Number(a.change_percent || 0));
    } else if (sortBy === "change-asc") {
      list.sort((a, b) => Number(a.change_percent || 0) - Number(b.change_percent || 0));
    }

    return list;
  }, [stocks, selectedSector, searchQuery, sortBy]);

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Search, Sector Pills, View Toggle, Sorting Controls */}
      <div className="vercel-card rounded-2xl p-4 sm:p-5 space-y-4 border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
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
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Grid/Table Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto font-mono text-xs">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl px-3 py-1.5 text-[var(--text-secondary)]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="default" className="bg-[var(--surface-1)] text-[var(--text-primary)]">Default Order</option>
                <option value="change-desc" className="bg-[var(--surface-1)] text-[var(--text-primary)]">% Gainers First</option>
                <option value="change-asc" className="bg-[var(--surface-1)] text-[var(--text-primary)]">% Decliners First</option>
                <option value="price-desc" className="bg-[var(--surface-1)] text-[var(--text-primary)]">Price: High to Low</option>
                <option value="price-asc" className="bg-[var(--surface-1)] text-[var(--text-primary)]">Price: Low to High</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid layout"
                title="Grid Cards"
                className={`p-1.5 rounded-lg transition-all duration-150 ${
                  viewMode === "grid" ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                aria-label="Table layout"
                title="Institutional Table"
                className={`p-1.5 rounded-lg transition-all duration-150 ${
                  viewMode === "table" ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]">
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

      {/* Stocks Display */}
      {filteredStocks.length === 0 ? (
        <div className="vercel-card rounded-2xl p-12 text-center border border-[var(--border-color)]">
          <p className="text-sm font-mono text-[var(--text-secondary)]">No equities matched your search filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSector("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all duration-150 inline-flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              onSelectStock={onSelectStock}
              isMarketPaused={isMarketPaused}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="vercel-card rounded-2xl p-5 overflow-x-auto font-mono text-xs border border-[var(--border-color)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="pb-3 font-bold">Instrument</th>
                <th className="pb-3 font-bold">Sector</th>
                <th className="pb-3 font-bold text-right">Price</th>
                <th className="pb-3 font-bold text-right">24h Change</th>
                <th className="pb-3 font-bold text-center">Trend</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredStocks.map((stock) => {
                const isPos = Number(stock.change_percent || 0) >= 0;
                return (
                  <tr
                    key={stock.id}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-[var(--surface-2)]/50 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-[var(--text-primary)] group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] transition-colors duration-150 text-sm">
                          {stock.ticker}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">{stock.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)] font-bold">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[var(--text-primary)] text-sm tnum">
                      ${Number(stock.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-bold tnum">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isPos
                            ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                            : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                        }`}
                      >
                        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPos ? "+" : ""}{Number(stock.change_percent || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <Sparkline
                        data={stock.spark_data || [100, 102, 98, 105, 110]}
                        isPositive={isPos}
                        width={70}
                        height={18}
                      />
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        disabled={isMarketPaused}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 ${
                          isMarketPaused
                            ? "bg-[var(--surface-3)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
                            : "bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-sm active:scale-[0.98]"
                        }`}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
