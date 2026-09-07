"use client";

import React, { useState } from "react";
import {
  Briefcase,
  History,
  Download,
  Search
} from "lucide-react";

export default function PortfolioView({
  portfolioHoldings,
  transactions,
  totalPortfolioValue,
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
      tx.ticker?.toLowerCase().includes(searchLedger.toLowerCase()) ||
      tx.type?.toLowerCase().includes(searchLedger.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportCSV = () => {
    if (!transactions.length) return;
    const headers = ["Timestamp,Type,Ticker,Shares,PricePerShare,TotalAmount\n"];
    const rows = transactions.map(
      (tx) =>
        `"${new Date(tx.created_at).toISOString()}","${tx.type}","${tx.ticker}",${tx.shares},${tx.price_per_share},${tx.total_amount}`
    );
    const blob = new Blob([headers.concat(rows.join("\n"))], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trade_ledger_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Sub-tab Switcher & Valuation Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-tab pills */}
        <div className="flex items-center bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-lg p-1">
          <button
            onClick={() => setActiveSubTab("holdings")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors duration-150 ${
              activeSubTab === "holdings"
                ? "bg-[#facc15] text-[#000000] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Positions ({portfolioHoldings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors duration-150 ${
              activeSubTab === "ledger"
                ? "bg-[#facc15] text-[#000000] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>
        </div>

        {/* Total Stock Valuation */}
        <div className="vercel-card rounded-lg px-3.5 py-1.5 flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-[var(--text-secondary)] font-bold">Stock Portfolio Value:</span>
          <span className="font-bold text-[var(--text-primary)] tnum">
            ${Number(totalPortfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 1. HOLDINGS TAB */}
      {activeSubTab === "holdings" && (
        <div className="space-y-4">
          {portfolioHoldings.length === 0 ? (
            <div className="vercel-card rounded-xl p-12 text-center">
              <Briefcase className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Active Positions</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mb-4 font-sans">
                You do not currently hold shares in any company. Use the Trading Floor to place buy orders.
              </p>
              <button
                onClick={() => onNavigateTab("stocks")}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#facc15] text-[#000000] hover:bg-[#eab308] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] transition-colors duration-150"
              >
                Go to Trading Floor →
              </button>
            </div>
          ) : (
            <div className="vercel-card rounded-xl p-5 overflow-x-auto">
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
                    <tr key={item.stock_id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-[var(--text-primary)] text-sm">{item.stock?.ticker}</span>
                          <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">{item.stock?.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)] font-bold">
                          {item.stock?.sector}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-[var(--text-primary)] text-sm tnum">
                        {item.shares}&nbsp;shs
                      </td>
                      <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                        ${Number(item.stock?.price).toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-bold text-[var(--text-primary)] text-sm tnum">
                        ${Number(item.marketValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          disabled={isMarketPaused}
                          onClick={() => onSelectStock(item.stock)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors duration-150 ${
                            isMarketPaused
                              ? "bg-[var(--surface-3)] text-[var(--text-tertiary)] cursor-not-allowed"
                              : "bg-[#facc15] text-[#000000] hover:bg-[#eab308] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] active:scale-[0.98]"
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
          <div className="vercel-card rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Filter ticker…"
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus-visible:ring-2 focus-visible:ring-[#facc15]"
                />
              </div>

              <div className="flex items-center bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-lg p-0.5 text-xs">
                {["ALL", "BUY", "SELL"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLedgerFilter(type)}
                    className={`px-2.5 py-1 rounded-md transition-colors duration-150 ${
                      ledgerFilter === type ? "bg-[#facc15] text-[#000000] font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-colors duration-150 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <div className="vercel-card rounded-xl p-12 text-center">
              <p className="text-xs text-[var(--text-secondary)]">No executed transactions found.</p>
            </div>
          ) : (
            <div className="vercel-card rounded-xl p-5 overflow-x-auto">
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
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-3 text-[var(--text-secondary)] text-[11px]">
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === "BUY"
                              ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                              : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[var(--text-primary)]">{tx.ticker}</td>
                      <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">{tx.shares}&nbsp;shs</td>
                      <td className="py-3 text-right text-[var(--text-secondary)] tnum">${Number(tx.price_per_share).toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-[var(--text-primary)] tnum">
                        ${Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
