"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sparkline from "./Sparkline";

export default function StockCard({ stock, onSelectStock, isMarketPaused }) {
  const isPositive = Number(stock.change_percent) >= 0;
  const [flashDirection, setFlashDirection] = React.useState(null);
  const prevPriceRef = React.useRef(stock.price);

  React.useEffect(() => {
    if (prevPriceRef.current !== undefined && prevPriceRef.current !== stock.price) {
      const dir = Number(stock.price) > Number(prevPriceRef.current) ? "up" : "down";
      setFlashDirection(dir);
      const timer = setTimeout(() => setFlashDirection(null), 900);
      prevPriceRef.current = stock.price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = stock.price;
  }, [stock.price]);

  const sectorStyles = {
    Technology: "text-[#402b28] dark:text-[#eae0d3] bg-[#402b28]/10 dark:bg-[#eae0d3]/10 shadow-[0_0_0_1px_rgba(64,43,40,0.25)] dark:shadow-[0_0_0_1px_rgba(234,224,211,0.25)]",
    Pharmaceuticals: "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.25)]",
    Energy: "text-[#303d37] dark:text-[#eae0d3] bg-[#303d37]/10 dark:bg-[#eae0d3]/10 shadow-[0_0_0_1px_rgba(48,61,55,0.25)]",
    "Consumer Goods": "text-[#7c3aed] dark:text-[#7928ca] bg-[#7928ca]/10 shadow-[0_0_0_1px_rgba(121,40,202,0.25)]"
  };

  const currentSectorStyle = sectorStyles[stock.sector] || "text-[var(--text-secondary)] bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]";

  return (
    <div
      onClick={() => onSelectStock(stock)}
      className={`vercel-card-interactive rounded-2xl p-4 cursor-pointer flex flex-col justify-between group relative border transition-all duration-300 ${
        flashDirection === "up"
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)] bg-emerald-500/5"
          : flashDirection === "down"
            ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35)] bg-rose-500/5"
            : "border-[var(--border-color)] hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40"
      }`}
    >
      <div>
        {/* Header: Ticker, Sector Tag, Price & Change */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[var(--text-primary)] group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] transition-colors duration-150 tracking-tight">
                {stock.ticker}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${currentSectorStyle}`}>
                {stock.sector}
              </span>
            </div>
            <h4 className="text-xs font-normal text-[var(--text-secondary)] mt-1 line-clamp-1 group-hover:text-[var(--text-primary)] transition-colors duration-150">
              {stock.name}
            </h4>
          </div>

          <div className="text-right">
            <span
              className={`text-sm font-bold font-mono tnum block transition-colors duration-300 ${
                flashDirection === "up"
                  ? "text-emerald-600 dark:text-emerald-400 font-black scale-105"
                  : flashDirection === "down"
                    ? "text-rose-600 dark:text-rose-400 font-black scale-105"
                    : "text-[var(--text-primary)]"
              }`}
            >
              ${Number(stock.price).toFixed(2)}
            </span>
            <div
              className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold mt-0.5 px-1.5 py-0.5 rounded transition-all duration-300 ${
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
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 active:scale-95 ${
            isMarketPaused
              ? "bg-[var(--surface-3)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
              : "bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-sm active:scale-[0.98]"
          }`}
        >
          {isMarketPaused ? "Paused" : "Trade"}
        </button>
      </div>
    </div>
  );
}
