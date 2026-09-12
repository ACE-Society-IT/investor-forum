"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { validateTradeSecurity } from "../lib/security";
import Sparkline from "./Sparkline";

export default function TradeModal({ stock, team, portfolioItem, isMarketPaused, onClose, onExecuteTrade }) {
  const [tradeType, setTradeType] = useState("BUY"); // "BUY" | "SELL"
  const [sharesCount, setSharesCount] = useState(10);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceNotice, setPriceNotice] = useState("");

  if (!stock) return null;

  const ownedShares = portfolioItem ? portfolioItem.shares : 0;
  const currentPrice = Number(stock.price) || 0;
  const changePct = Number(stock.change_percent) || 0;
  const dollarDelta = currentPrice * (changePct / 100);
  const totalCost = Number((sharesCount * currentPrice).toFixed(2));
  const availableCash = Number(team?.cash_balance) || 0;

  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (prevPriceRef.current !== currentPrice && prevPriceRef.current > 0) {
      const diff = currentPrice - prevPriceRef.current;
      const isUp = diff > 0;
      setPriceNotice(`Market quote updated: $${currentPrice.toFixed(2)} (${isUp ? "+" : ""}$${diff.toFixed(2)})`);
      setErrorMsg(""); // Clear stale errors on new price
      const t = setTimeout(() => setPriceNotice(""), 4000);
      prevPriceRef.current = currentPrice;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  const maxBuyShares = Math.max(0, Math.floor(availableCash / currentPrice));
  const maxSellShares = ownedShares;

  const handleSharesChange = (val) => {
    const cleanNum = parseInt(val, 10);
    const num = isNaN(cleanNum) ? 0 : Math.max(0, cleanNum);
    setSharesCount(num);
    setErrorMsg("");
  };

  const handleQuickAdd = (amount) => {
    if (amount === "MAX") {
      setSharesCount(tradeType === "BUY" ? Math.max(1, maxBuyShares) : Math.max(1, maxSellShares));
    } else {
      setSharesCount((prev) => Math.max(1, prev + amount));
    }
    setErrorMsg("");
  };

  // Perform Security Validation
  const validationResult = validateTradeSecurity({
    stock,
    teamCash: availableCash,
    ownedShares,
    tradeType,
    sharesCount,
    isMarketPaused
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validationResult.isValid) {
      setErrorMsg(validationResult.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onExecuteTrade({
        stockId: stock.id,
        ticker: stock.ticker,
        type: tradeType,
        shares: validationResult.cleanShares,
        pricePerShare: validationResult.pricePerShare,
        totalAmount: validationResult.totalCost
      });

      setSuccessMsg({
        type: tradeType,
        shares: validationResult.cleanShares,
        ticker: stock.ticker,
        total: validationResult.totalCost
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to execute trade order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPos = changePct >= 0;
  const priceHistory =
    Array.isArray(stock.price_history) && stock.price_history.length >= 2
      ? stock.price_history
      : [
          currentPrice * (1 - changePct / 100),
          currentPrice * (1 - changePct / 180),
          currentPrice * (1 - changePct / 300),
          currentPrice
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono overflow-y-auto">
      <div className="vercel-card w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header: Instrument & Close */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">{stock.ticker}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)] font-medium">
                {stock.sector}
              </span>
            </div>
            <h4 className="text-xs text-[var(--text-secondary)] mt-0.5">{stock.name}</h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Sparkline data={priceHistory} isPositive={isPos} width={60} height={20} />
            </div>

            <div className="text-right">
              <span className="text-base font-bold text-[var(--text-primary)] tnum">${currentPrice.toFixed(2)}</span>
              <span
                className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                  isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isPos ? <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
                <span>{isPos ? "+" : ""}{changePct.toFixed(2)}% ({isPos ? "+" : ""}${Math.abs(dollarDelta).toFixed(2)})</span>
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confirmation Screen */}
        {successMsg ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.25)] flex items-center justify-center text-[#059669] dark:text-[#00d68f] mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Trade Executed Successfully</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                {successMsg.type === "BUY" ? "Purchased" : "Sold"} {successMsg.shares} shares of {successMsg.ticker} for $
                {successMsg.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-[0_0_0_1px_var(--border-color)] transition-colors duration-150"
            >
              Done
            </button>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* BUY / SELL Switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTradeType("BUY");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-colors duration-150 ${
                  tradeType === "BUY"
                    ? "bg-[#00d68f] text-[#000000] shadow-sm font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Buy Shares
              </button>
              <button
                type="button"
                onClick={() => {
                  setTradeType("SELL");
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg transition-colors duration-150 ${
                  tradeType === "SELL"
                    ? "bg-[#ff5b4f] text-[#ffffff] shadow-sm font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Sell Shares
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5">
                <label htmlFor="shares-input" className="font-bold">Quantity</label>
                <span>
                  {tradeType === "BUY"
                    ? `Max Buy: ${maxBuyShares} shs`
                    : `Owned: ${ownedShares} shs`}
                </span>
              </div>

              <div className="relative">
                <input
                  id="shares-input"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  value={sharesCount}
                  onChange={(e) => handleSharesChange(e.target.value)}
                  className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl px-4 py-2.5 text-base font-bold text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3] text-right pr-14 tnum"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] font-bold">
                  SHARES
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[10, 50, 100, "MAX"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickAdd(preset)}
                    className="py-1.5 rounded-lg text-xs font-bold bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                  >
                    {preset === "MAX" ? "MAX" : `+${preset}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Execution Price:</span>
                <span className="text-[var(--text-primary)] font-bold tnum">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total Order Value:</span>
                <span className="text-[var(--text-primary)] font-bold text-sm tnum">
                  ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex justify-between text-[var(--text-secondary)] text-[11px]">
                <span>Cash After Order:</span>
                <span className="text-[var(--text-primary)] font-bold tnum">
                  ${Math.max(
                    0,
                    tradeType === "BUY" ? availableCash - totalCost : availableCash + totalCost
                  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Price Live Update Notice */}
            {priceNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>{priceNotice}</span>
              </div>
            )}

            {/* Market Paused Warning Banner */}
            {isMarketPaused && (
              <div className="p-3 rounded-lg bg-amber-500/15 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Market is currently paused by organizers or the round timer has ended. Order submissions are disabled.</span>
              </div>
            )}

            {/* Error Feedback */}
            {(errorMsg || (!validationResult.isValid && sharesCount > 0)) && (
              <div className="p-3 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.25)] flex items-start gap-2 text-xs text-[#e11d48] dark:text-[#ff5b4f]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg || validationResult.error}</span>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !validationResult.isValid || isMarketPaused}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-2 ${
                tradeType === "BUY"
                  ? "bg-[#00d68f] hover:bg-[#00d68f]/90 text-[#000000] shadow-[0_0_0_1px_rgba(0,214,143,0.3)] disabled:bg-[var(--surface-3)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed"
                  : "bg-[#ff5b4f] hover:bg-[#ff5b4f]/90 text-[#ffffff] shadow-[0_0_0_1px_rgba(255,91,79,0.3)] disabled:bg-[var(--surface-3)] disabled:text-[var(--text-tertiary)] disabled:shadow-none disabled:cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Order…</span>
                </>
              ) : (
                <span>
                  Confirm {tradeType === "BUY" ? "Buy" : "Sell"} Order (${totalCost.toLocaleString()})
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
