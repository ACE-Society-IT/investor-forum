"use client";

import React, { useState } from "react";
import {
  Briefcase,
  History,
  Download,
  Search,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export default function PortfolioView({
  portfolioHoldings = [],
  transactions = [],
  totalPortfolioValue = 0,
  onSelectStock,
  onNavigateTab,
  isMarketPaused
}) {
  const [activeSubTab, setActiveSubTab] = useState("holdings");
  const [ledgerFilter, setLedgerFilter] = useState("ALL");
  const [searchLedger, setSearchLedger] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = ledgerFilter === "ALL" || tx.type === ledgerFilter;
    const matchesSearch =
      (tx.ticker || "").toLowerCase().includes(searchLedger.toLowerCase()) ||
      (tx.type || "").toLowerCase().includes(searchLedger.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportCSV = () => {
    if (!transactions.length) return;
    try {
      const headers = ["Timestamp,Type,Ticker,Shares,PricePerShare,TotalAmount\n"];
      const rows = transactions.map((tx) => {
        const timeStr = tx.created_at ? new Date(tx.created_at).toISOString() : new Date().toISOString();
        return `"${timeStr}","${tx.type || 'TRADE'}","${tx.ticker || ''}",${Number(tx.shares) || 0},${Number(tx.price_per_share) || 0},${Number(tx.total_amount) || 0}`;
      });
      const blob = new Blob([headers.concat(rows.join("\n"))], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trade_ledger_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Sub-tab Switcher & Valuation Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-tab pills */}
        <div className="flex items-center bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl p-1">
          <button
            onClick={() => setActiveSubTab("holdings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeSubTab === "holdings"
                ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Positions ({portfolioHoldings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeSubTab === "ledger"
                ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>
        </div>

        {/* Total Stock Valuation */}
        <div className="vercel-card rounded-xl px-4 py-2.5 flex items-center justify-between sm:justify-end gap-3 text-xs border border-[var(--border-color)]">
          <span className="text-[var(--text-secondary)] font-medium">Stock Portfolio Value:</span>
          <span className="font-bold text-[var(--text-primary)] tnum text-sm">
            ${Number(totalPortfolioValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 1. HOLDINGS TAB */}
      {activeSubTab === "holdings" && (
        <div className="space-y-4">
          {portfolioHoldings.length === 0 ? (
            <div className="vercel-card rounded-2xl p-12 text-center border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--text-tertiary)] flex items-center justify-center mx-auto mb-3 shadow-[0_0_0_1px_var(--border-color)]">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Active Positions</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mb-5 font-sans">
                You do not currently hold shares in any company. Use the Trading Floor to place buy orders.
              </p>
              <button
                onClick={() => onNavigateTab("stocks")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all duration-150 inline-flex items-center gap-2 active:scale-95"
              >
                <span>Go to Trading Floor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="vercel-card rounded-2xl p-5 overflow-x-auto border border-[var(--border-color)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="pb-3 font-bold">Instrument</th>
                    <th className="pb-3 font-bold">Sector</th>
                    <th className="pb-3 font-bold text-right">Shares Owned</th>
                    <th className="pb-3 font-bold text-right">Current Price</th>
                    <th className="pb-3 font-bold text-right">Market Value</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {portfolioHoldings.map((item) => (
                    <tr key={item.stock_id || item.stock?.id} className="hover:bg-[var(--surface-2)]/50 transition-colors duration-150">
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-[var(--text-primary)] text-sm">{item.stock?.ticker}</span>
                          <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">{item.stock?.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)] font-bold">
                          {item.stock?.sector || "General"}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-[var(--text-primary)] text-sm tnum">
                        {Number(item.shares || 0).toLocaleString()}&nbsp;shs
                      </td>
                      <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                        ${Number(item.stock?.price || 0).toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-bold text-[var(--text-primary)] text-sm tnum">
                        ${Number(item.marketValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          disabled={isMarketPaused}
                          onClick={() => onSelectStock(item.stock)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            isMarketPaused
                              ? "bg-[var(--surface-3)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
                              : "bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-sm active:scale-[0.98]"
                          }`}
                        >
                          Trade Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. TRANSACTION LEDGER TAB */}
      {activeSubTab === "ledger" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="vercel-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-[var(--border-color)]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Filter ticker or type…"
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                />
              </div>

              <div className="flex items-center bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl p-1 text-xs">
                {["ALL", "BUY", "SELL"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLedgerFilter(type)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 font-bold ${
                      ledgerFilter === type
                        ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={exportCSV}
              disabled={transactions.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <div className="vercel-card rounded-2xl p-12 text-center border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)]">No executed transactions match the criteria.</p>
            </div>
          ) : (
            <div className="vercel-card rounded-2xl p-5 overflow-x-auto border border-[var(--border-color)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="pb-3 font-bold">Timestamp</th>
                    <th className="pb-3 font-bold">Type</th>
                    <th className="pb-3 font-bold">Instrument</th>
                    <th className="pb-3 font-bold text-right">Shares</th>
                    <th className="pb-3 font-bold text-right">Price</th>
                    <th className="pb-3 font-bold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id || `${tx.created_at}-${tx.ticker}`} className="hover:bg-[var(--surface-2)]/50 transition-colors duration-150">
                      <td className="py-3 text-[var(--text-secondary)] text-[11px]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === "BUY"
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                              : "text-rose-600 dark:text-rose-400 bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[var(--text-primary)]">{tx.ticker}</td>
                      <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">{Number(tx.shares || 0).toLocaleString()}&nbsp;shs</td>
                      <td className="py-3 text-right text-[var(--text-secondary)] tnum">${Number(tx.price_per_share || 0).toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">
                        ${Number(tx.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
