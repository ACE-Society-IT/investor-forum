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
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { X, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

  const loadData = useCallback(async () => {
    try {
      // 1. Game State
      const { data: gsData } = await supabase.from("game_state").select("*").single();
      if (gsData) setGameState(gsData);

      // 2. Stocks
      const { data: stocksData } = await supabase.from("stocks").select("*").order("ticker");
      if (stocksData && stocksData.length > 0) setStocks(stocksData);

      // 3. News Feed
      const { data: newsData } = await supabase
        .from("news_feed")
        .select("*")
        .order("created_at", { ascending: false });
      if (newsData) setNews(newsData);

      // 4. Team details
      const isValidUuid = (str) =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      if (currentTeam?.id && isValidUuid(currentTeam.id) && isSupabaseConfigured) {
        const { data: tData } = await supabase
          .from("teams")
          .select("*")
          .eq("id", currentTeam.id)
          .single();
        if (tData) setTeamCash(Number(tData.cash_balance));

        // 5. Team's Portfolio
        const { data: portData } = await supabase
          .from("portfolio")
          .select("*, stock:stocks(*)")
          .eq("team_id", currentTeam.id);
        if (portData) {
          setPortfolio(portData.filter((p) => p.shares > 0));
        }

        // 6. Team's Transactions
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("team_id", currentTeam.id)
          .order("created_at", { ascending: false });
        if (txData) setTransactions(txData);
      }

      // 7. All teams and portfolios for Leaderboard
      const { data: allTeamsData } = await supabase.from("teams").select("*");
      if (allTeamsData) setAllTeams(allTeamsData.filter((t) => !t.is_admin));

      const { data: allPortData } = await supabase.from("portfolio").select("*");
      if (allPortData) setAllPortfolios(allPortData);
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
  const rankedLeaderboard = (allTeams.length > 0 ? allTeams : [currentTeam]).map((team) => {
    const teamHoldings = allPortfolios.filter((p) => p.team_id === team.id && p.shares > 0);
    const pVal = teamHoldings.reduce((sum, item) => {
      const stock = stocks.find((s) => s.id === item.stock_id);
      const price = Number(stock?.price) || 0;
      return sum + item.shares * price;
    }, 0);

    const netWorth = Number((Number(team.cash_balance) + pVal).toFixed(2));
    const pnl = netWorth - 100000;
    const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

    return {
      ...team,
      portfolioValue: pVal,
      netWorth,
      pnl,
      pnlPercent
    };
  }).sort((a, b) => b.netWorth - a.netWorth);

  const filteredSelectorStocks = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(selectorSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex font-sans selection:bg-[var(--accent-yellow)] selection:text-black">
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
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono">
          <div className="vercel-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsStockSelectorOpen(false)}
              aria-label="Close selector"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase mb-3">
              Select Stock To Trade
            </h3>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search ticker or company…"
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
              />
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {filteredSelectorStocks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStock(s);
                    setIsStockSelectorOpen(false);
                  }}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-between text-xs text-left transition-colors duration-150"
                >
                  <div>
                    <span className="font-bold text-[var(--text-primary)] mr-2">{s.ticker}</span>
                    <span className="text-[var(--text-muted)] font-normal">{s.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)] tnum">${Number(s.price).toFixed(2)}</span>
                </button>
              ))}
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
