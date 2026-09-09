"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardHeader from "./dashboard/DashboardHeader";
import OverviewView from "./dashboard/OverviewView";
import TradingFloorView from "./dashboard/TradingFloorView";
import PortfolioView from "./dashboard/PortfolioView";
import MarketIntelligenceView from "./dashboard/MarketIntelligenceView";
import LeaderboardView from "./dashboard/LeaderboardView";
import NewsFeedView from "./dashboard/NewsFeedView";
import RulesView from "./dashboard/RulesView";
import TradeModal from "./TradeModal";
import Sparkline from "./Sparkline";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { X, Search, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Layers, ChevronRight } from "lucide-react";

export default function StudentDashboard({ currentTeam, onSignOut }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSector, setSelectedSector] = useState("All");

  // Core Data States
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [gameState, setGameState] = useState({
    current_round: "Round 1 - Active",
    is_market_open: true
  });
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allPortfolios, setAllPortfolios] = useState([]);
  const [teamCash, setTeamCash] = useState(currentTeam?.cash_balance || 100000);

  // Interactive Modals
  const [selectedStock, setSelectedStock] = useState(null);
  const [isStockSelectorOpen, setIsStockSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [selectorFilter, setSelectorFilter] = useState("ALL"); // "ALL" | "GAINERS" | "LOSERS"

  const loadData = useCallback(async () => {
    try {
      const isValidUuid = (str) =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      const hasValidTeam = Boolean(currentTeam?.id && isValidUuid(currentTeam.id) && isSupabaseConfigured);

      // Ultra-fast Concurrent Cloud Queries via Promise.all
      const [
        gsRes,
        stocksRes,
        newsRes,
        allTeamsRes,
        allPortRes,
        teamRes,
        portRes,
        txRes
      ] = await Promise.all([
        supabase.from("game_state").select("*").single(),
        supabase.from("stocks").select("*").order("ticker"),
        supabase.from("news_feed").select("*").order("created_at", { ascending: false }).limit(30),
        supabase.from("teams").select("id, name, cash_balance, is_admin, is_banned"),
        supabase.from("portfolio").select("team_id, stock_id, shares, avg_buy_price"),
        hasValidTeam ? supabase.from("teams").select("cash_balance, is_banned").eq("id", currentTeam.id).single() : Promise.resolve({ data: null }),
        hasValidTeam ? supabase.from("portfolio").select("*, stock:stocks(*)").eq("team_id", currentTeam.id) : Promise.resolve({ data: null }),
        hasValidTeam ? supabase.from("transactions").select("*").eq("team_id", currentTeam.id).order("created_at", { ascending: false }).limit(60) : Promise.resolve({ data: null })
      ]);

      if (gsRes?.data) setGameState(gsRes.data);
      if (stocksRes?.data && stocksRes.data.length > 0) setStocks(stocksRes.data);
      if (newsRes?.data) setNews(newsRes.data);
      if (allTeamsRes?.data) setAllTeams(allTeamsRes.data.filter((t) => !t.is_admin));
      if (allPortRes?.data) setAllPortfolios(allPortRes.data);
      if (teamRes?.data) setTeamCash(Number(teamRes.data.cash_balance));
      if (portRes?.data) setPortfolio(portRes.data.filter((p) => p.shares > 0));
      if (txRes?.data) setTransactions(txRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, [currentTeam]);

  useEffect(() => {
    loadData();

    // Continuous smooth background polling (zero flicker)
    const pollInterval = setInterval(() => {
      loadData();
    }, 3000);

    if (!isSupabaseConfigured) {
      return () => clearInterval(pollInterval);
    }

    // Supabase Real-time Channel (Only when valid anon key configured)
    const channel = supabase
      .channel("student-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Trade Execution
  const handleExecuteTrade = async (trade) => {
    if (currentTeam?.is_banned) {
      alert("Trading Privileges Suspended: Your team account is currently frozen by the Competition Director.");
      return;
    }

    const { stockId, type, shares, pricePerShare, totalAmount } = trade;

    const newCash = type === "BUY" ? teamCash - totalAmount : teamCash + totalAmount;
    setTeamCash(newCash);

    const existingIndex = portfolio.findIndex((p) => p.stock_id === stockId);
    let updatedShares = 0;
    let newAvgPrice = pricePerShare;

    if (existingIndex >= 0) {
      const existing = portfolio[existingIndex];
      if (type === "BUY") {
        const totalOldCost = existing.shares * Number(existing.avg_buy_price);
        const totalNewCost = totalOldCost + totalAmount;
        updatedShares = existing.shares + shares;
        newAvgPrice = totalNewCost / updatedShares;
      } else {
        updatedShares = Math.max(0, existing.shares - shares);
        newAvgPrice = existing.avg_buy_price;
      }
    } else {
      updatedShares = shares;
      newAvgPrice = pricePerShare;
    }

    // Optimistically update local portfolio & transactions state
    let updatedPortfolio = [...portfolio];
    if (existingIndex >= 0) {
      if (updatedShares > 0) {
        updatedPortfolio[existingIndex] = {
          ...updatedPortfolio[existingIndex],
          shares: updatedShares,
          avg_buy_price: newAvgPrice
        };
      } else {
        updatedPortfolio.splice(existingIndex, 1);
      }
    } else if (updatedShares > 0) {
      const stockObj = stocks.find((s) => s.id === stockId);
      updatedPortfolio.push({
        id: `local-port-${Date.now()}`,
        team_id: currentTeam?.id,
        stock_id: stockId,
        shares: updatedShares,
        avg_buy_price: newAvgPrice,
        stock: stockObj
      });
    }
    setPortfolio(updatedPortfolio);

    const newTx = {
      id: `local-tx-${Date.now()}`,
      team_id: currentTeam?.id,
      stock_id: stockId,
      type: type,
      shares: shares,
      price_per_share: pricePerShare,
      total_amount: totalAmount,
      created_at: new Date().toISOString()
    };
    setTransactions([newTx, ...transactions]);

    const isValidUuid = (str) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured && currentTeam?.id && isValidUuid(currentTeam.id)) {
      try {
        await supabase.from("transactions").insert([
          {
            team_id: currentTeam.id,
            stock_id: stockId,
            type: type,
            shares: shares,
            price_per_share: pricePerShare,
            total_amount: totalAmount
          }
        ]);

        await supabase
          .from("teams")
          .update({ cash_balance: newCash })
          .eq("id", currentTeam.id);

        if (updatedShares > 0) {
          await supabase.from("portfolio").upsert(
            {
              team_id: currentTeam.id,
              stock_id: stockId,
              shares: updatedShares,
              avg_buy_price: newAvgPrice
            },
            { onConflict: "team_id,stock_id" }
          );
        } else {
          await supabase
            .from("portfolio")
            .delete()
            .match({ team_id: currentTeam.id, stock_id: stockId });
        }

        await loadData();
      } catch (err) {
        console.error("Error executing trade cloud sync:", err);
      }
    }
  };

  // Portfolio Calculations
  const portfolioHoldings = portfolio.map((item) => {
    const stock = stocks.find((s) => s.id === item.stock_id) || item.stock || {};
    const currentPrice = Number(stock.price) || 0;
    const marketValue = Number((item.shares * currentPrice).toFixed(2));
    const costBasis = Number((item.shares * Number(item.avg_buy_price || currentPrice)).toFixed(2));
    const pnl = Number((marketValue - costBasis).toFixed(2));
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      ...item,
      stock,
      currentPrice,
      marketValue,
      costBasis,
      pnl,
      pnlPercent
    };
  });

  const totalPortfolioValue = portfolioHoldings.reduce((acc, curr) => acc + curr.marketValue, 0);
  const totalNetWorth = Number((teamCash + totalPortfolioValue).toFixed(2));
  const totalPnL = totalNetWorth - 100000;
  const totalPnLPercent = ((totalPnL / 100000) * 100).toFixed(2);
  const isMarketPaused = !gameState.is_market_open;

  // Leaderboard Ranking computation
  const safeAllTeams = Array.isArray(allTeams) && allTeams.length > 0 ? allTeams : (currentTeam ? [currentTeam] : []);
  const safeAllPortfolios = Array.isArray(allPortfolios) ? allPortfolios : [];
  const safeStocks = Array.isArray(stocks) ? stocks : [];

  const rankedLeaderboard = safeAllTeams.map((team) => {
    const teamHoldings = safeAllPortfolios.filter((p) => p && p.team_id === team?.id && Number(p.shares) > 0);
    const pVal = teamHoldings.reduce((sum, item) => {
      const stock = safeStocks.find((s) => s && s.id === item.stock_id);
      const price = Number(stock?.price) || 0;
      return sum + (Number(item?.shares) || 0) * price;
    }, 0);

    const cash = Number(team?.cash_balance) || 0;
    const netWorth = Number((cash + pVal).toFixed(2));
    const pnl = Number((netWorth - 100000).toFixed(2));
    const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

    return {
      ...team,
      portfolioValue: pVal,
      netWorth,
      pnl,
      pnlPercent
    };
  }).sort((a, b) => b.netWorth - a.netWorth);

  const filteredSelectorStocks = safeStocks.filter((s) => {
    const matchesSearch =
      (s.ticker || "").toLowerCase().includes((selectorSearch || "").toLowerCase()) ||
      (s.name || "").toLowerCase().includes((selectorSearch || "").toLowerCase()) ||
      (s.sector && s.sector.toLowerCase().includes((selectorSearch || "").toLowerCase()));

    if (!matchesSearch) return false;
    if (selectorFilter === "GAINERS") return Number(s.change_percent) >= 0;
    if (selectorFilter === "LOSERS") return Number(s.change_percent) < 0;
    return true;
  });

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805]"
    >
      {/* 1. SIDEBAR NAVIGATION */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTeam={currentTeam}
        teamCash={teamCash}
        totalNetWorth={totalNetWorth}
        isMarketPaused={isMarketPaused}
        onSignOut={onSignOut}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Continuous Ticker Tape */}
        {stocks.length > 0 && (
          <div className="bg-[var(--surface-1)] border-b border-[var(--border-color)] overflow-hidden py-1.5 px-4 font-mono text-[11px] whitespace-nowrap select-none">
            <div className="animate-marquee gap-6">
              {stocks.map((stock) => {
                const isPos = Number(stock.change_percent) >= 0;
                return (
                  <div
                    key={`ticker-a-${stock.id}`}
                    onClick={() => setSelectedStock(stock)}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors duration-150"
                  >
                    <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                    <span className="tnum text-[var(--text-primary)]">${Number(stock.price).toFixed(2)}</span>
                    <span
                      className={`inline-flex items-center font-medium tnum ${
                        isPos ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                    </span>
                    <span className="text-[var(--text-muted)] ml-3">•</span>
                  </div>
                );
              })}
              {stocks.map((stock) => {
                const isPos = Number(stock.change_percent) >= 0;
                return (
                  <div
                    key={`ticker-b-${stock.id}`}
                    onClick={() => setSelectedStock(stock)}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors duration-150"
                  >
                    <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                    <span className="tnum text-[var(--text-primary)]">${Number(stock.price).toFixed(2)}</span>
                    <span
                      className={`inline-flex items-center font-medium tnum ${
                        isPos ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                    </span>
                    <span className="text-[var(--text-muted)] ml-3">•</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Header */}
        <DashboardHeader
          activeTab={activeTab}
          gameState={gameState}
          teamCash={teamCash}
          totalNetWorth={totalNetWorth}
          totalPnL={totalPnL}
          totalPnLPercent={totalPnLPercent}
          isRefreshing={isRefreshing}
          onManualRefresh={handleManualRefresh}
          onOpenTradeModal={() => setIsStockSelectorOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewView
              gameState={gameState}
              teamCash={teamCash}
              totalPortfolioValue={totalPortfolioValue}
              totalNetWorth={totalNetWorth}
              totalPnL={totalPnL}
              totalPnLPercent={totalPnLPercent}
              portfolioHoldings={portfolioHoldings}
              stocks={stocks}
              news={news}
              onSelectStock={(s) => setSelectedStock(s)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              isMarketPaused={isMarketPaused}
            />
          )}

          {activeTab === "stocks" && (
            <TradingFloorView
              stocks={stocks}
              selectedSector={selectedSector}
              setSelectedSector={setSelectedSector}
              onSelectStock={(s) => setSelectedStock(s)}
              isMarketPaused={isMarketPaused}
            />
          )}

          {activeTab === "portfolio" && (
            <PortfolioView
              portfolioHoldings={portfolioHoldings}
              transactions={transactions}
              totalPortfolioValue={totalPortfolioValue}
              onSelectStock={(s) => setSelectedStock(s)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              isMarketPaused={isMarketPaused}
            />
          )}

          {activeTab === "market" && (
            <MarketIntelligenceView stocks={stocks} />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardView
              leaderboard={rankedLeaderboard}
              currentTeamId={currentTeam?.id}
              isResultsRevealed={Boolean(gameState?.is_results_revealed)}
            />
          )}

          {activeTab === "news" && (
            <NewsFeedView news={news} />
          )}

          {activeTab === "rules" && (
            <RulesView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </main>
      </div>

      {/* QUICK STOCK SELECTOR MODAL */}
      {isStockSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in font-mono">
          <div className="vercel-card w-full max-w-2xl rounded-2xl p-6 sm:p-7 shadow-2xl relative border border-[var(--border-color)] bg-[var(--surface-1)] max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsStockSelectorOpen(false)}
              aria-label="Close selector"
              className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-12">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">
                  Select Stock To Trade
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
                  {filteredSelectorStocks.length} Assets
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                Choose any listed instrument to inspect real-time performance and place a BUY or SELL order.
              </p>
            </div>

            {/* Search and Quick Filters */}
            <div className="space-y-3 mb-4 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search ticker, company name, or sector…"
                  value={selectorSearch}
                  onChange={(e) => setSelectorSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                />
                {selectorSearch && (
                  <button
                    onClick={() => setSelectorSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Filter Tabs */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setSelectorFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 font-bold ${
                    selectorFilter === "ALL"
                      ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
                      : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
                  }`}
                >
                  All ({stocks.length})
                </button>
                <button
                  onClick={() => setSelectorFilter("GAINERS")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 font-bold ${
                    selectorFilter === "GAINERS"
                      ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-md"
                      : "bg-[var(--surface-2)] text-emerald-600 dark:text-emerald-400 hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Gainers ({stocks.filter((s) => Number(s.change_percent) >= 0).length})</span>
                </button>
                <button
                  onClick={() => setSelectorFilter("LOSERS")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 font-bold ${
                    selectorFilter === "LOSERS"
                      ? "bg-rose-500 text-white shadow-rose-500/20 shadow-md"
                      : "bg-[var(--surface-2)] text-rose-600 dark:text-rose-400 hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Losers ({stocks.filter((s) => Number(s.change_percent) < 0).length})</span>
                </button>
              </div>
            </div>

            {/* Stocks Interactive List */}
            <div className="space-y-2.5 overflow-y-auto flex-1 p-1 pr-2">
              {filteredSelectorStocks.length === 0 ? (
                <div className="py-10 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-2)] rounded-xl border border-dashed border-[var(--border-color)]">
                  No market instruments matched &quot;{selectorSearch}&quot;
                </div>
              ) : (
                filteredSelectorStocks.map((s) => {
                  const isPos = Number(s.change_percent) >= 0;
                  const priceNum = Number(s.price) || 0;
                  const changePct = Number(s.change_percent) || 0;
                  const dollarDelta = priceNum * (changePct / 100);
                  const priceHistory =
                    Array.isArray(s.price_history) && s.price_history.length >= 2
                      ? s.price_history
                      : [
                          priceNum * (1 - changePct / 100),
                          priceNum * (1 - changePct / 180),
                          priceNum * (1 - changePct / 300),
                          priceNum
                        ];

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStock(s);
                        setIsStockSelectorOpen(false);
                      }}
                      className="group w-full p-3.5 sm:p-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] hover:shadow-[0_0_0_1px_#402b28] dark:hover:shadow-[0_0_0_1px_#eae0d3] flex items-center justify-between text-xs text-left transition-all duration-150 active:scale-[0.99] gap-3"
                    >
                      {/* Left: Ticker, Name & Sector */}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)] text-sm sm:text-base tracking-tight group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] transition-colors">
                            {s.ticker}
                          </span>
                          {s.sector && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)] font-normal truncate max-w-[120px]">
                              {s.sector}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-1 font-sans">
                          {s.name}
                        </p>
                      </div>

                      {/* Middle: Mini Sparkline Trend Graph */}
                      <div className="hidden xs:flex sm:flex items-center justify-center px-3 py-1 shrink-0">
                        <Sparkline data={priceHistory} isPositive={isPos} width={80} height={24} />
                      </div>

                      {/* Right: Price & Signed Value Change */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <div className="font-bold text-[var(--text-primary)] text-sm sm:text-base tnum">
                            ${priceNum.toFixed(2)}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold tnum px-2 py-0.5 rounded mt-1 ${
                              isPos
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
                            }`}
                          >
                            {isPos ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                            <span>
                              {isPos ? "+" : ""}{changePct.toFixed(2)}% ({isPos ? "+" : ""}${Math.abs(dollarDelta).toFixed(2)})
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] group-hover:translate-x-0.5 transition-all duration-150 hidden sm:block shrink-0" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRADE EXECUTION MODAL */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          team={{ cash_balance: teamCash }}
          portfolioItem={portfolio.find((p) => p.stock_id === selectedStock.id)}
          isMarketPaused={isMarketPaused}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
}
