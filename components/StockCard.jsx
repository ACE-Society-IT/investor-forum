"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sparkline from "./Sparkline";

export default function StockCard({ stock, onSelectStock, isMarketPaused }) {
  const isPositive = Number(stock.change_percent) >= 0;

  const sectorStyles = {
    Technology: "text-[#ca8a04] dark:text-[#facc15] bg-[#facc15]/10 shadow-[0_0_0_1px_rgba(250,204,21,0.25)]",
    Pharmaceuticals: "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.25)]",
    Energy: "text-[#d97706] dark:text-[#f5a623] bg-[#f5a623]/10 shadow-[0_0_0_1px_rgba(245,166,35,0.25)]",
    "Consumer Goods": "text-[#7c3aed] dark:text-[#7928ca] bg-[#7928ca]/10 shadow-[0_0_0_1px_rgba(121,40,202,0.25)]"
  };

  const currentSectorStyle = sectorStyles[stock.sector] || "text-[var(--text-secondary)] bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]";

  return (
    <div
      onClick={() => onSelectStock(stock)}
      className="vercel-card-interactive rounded-xl p-4 cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        {/* Header: Ticker, Sector Tag, Price & Change */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[var(--text-primary)] group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15] transition-colors duration-150 tracking-tight">
                {stock.ticker}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${currentSectorStyle}`}>
                {stock.sector}
              </span>
            </div>
            <h4 className="text-xs font-normal text-[var(--text-secondary)] mt-1 line-clamp-1 group-hover:text-[var(--text-primary)] transition-colors duration-150">
              {stock.name}
            </h4>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-[var(--text-primary)] font-mono tnum block">
              ${Number(stock.price).toFixed(2)}
            </span>
            <div
              className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold mt-0.5 px-1.5 py-0.5 rounded ${
                isPositive
                  ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                  : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{isPositive ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Sparkline & Action Button */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkline
            data={stock.spark_data || [100, 102, 98, 105, 110]}
            isPositive={isPositive}
            width={80}
            height={20}
          />
        </div>

        <button
          disabled={isMarketPaused}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStock(stock);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors duration-150 ${
            isMarketPaused
              ? "bg-[var(--surface-3)] text-[var(--text-tertiary)] cursor-not-allowed"
              : "bg-[#facc15] text-[#000000] hover:bg-[#eab308] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] active:scale-[0.98]"
          }`}
        >
          {isMarketPaused ? "Paused" : "Trade"}
        </button>
      </div>
    </div>
  );
}
