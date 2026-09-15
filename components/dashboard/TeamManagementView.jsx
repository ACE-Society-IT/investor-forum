"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  User,
  Crown,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Layers,
  DollarSign,
  Activity,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Filter,
  X
} from "lucide-react";

export default function TeamManagementView({
  allTeams = [],
  allTeamMembers = [],
  allPortfolios = [],
  allTransactions = [],
  stocks = [],
  currentTeam = null,
  onSelectStock
}) {
  const [filterMode, setFilterMode] = useState("ALL"); // "ALL" | "MY_TEAM" | "SOLO" | "TEAMS"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("RANK"); // "RANK" | "PNL" | "VOLUME" | "NAME"
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);

  // Compute rich financial and trading metrics for each team
  const teamsWithMetrics = useMemo(() => {
    const safeTeams = Array.isArray(allTeams) ? allTeams : [];
    const safeMembers = Array.isArray(allTeamMembers) ? allTeamMembers : [];
    const safePortfolios = Array.isArray(allPortfolios) ? allPortfolios : [];
    const safeTransactions = Array.isArray(allTransactions) ? allTransactions : [];
    const safeStocks = Array.isArray(stocks) ? stocks : [];

    return safeTeams.map((team) => {
      // 1. Members
      const members = safeMembers.filter((m) => m.team_id === team.id);
      const leadTrader = members.find((m) => m.role === "Lead Trader") || null;
      const regularTraders = members.filter((m) => m.role !== "Lead Trader");

      // 2. Portfolio Holdings
      const holdings = safePortfolios
        .filter((p) => p.team_id === team.id && Number(p.shares) > 0)
        .map((p) => {
          const stock = safeStocks.find((s) => s.id === p.stock_id) || {};
          const currentPrice = Number(stock.price) || 0;
          const marketValue = Number((p.shares * currentPrice).toFixed(2));
          const costBasis = Number((p.shares * Number(p.avg_buy_price || currentPrice)).toFixed(2));
          const pnl = Number((marketValue - costBasis).toFixed(2));
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

          return {
            ...p,
            stock,
            ticker: stock.ticker || "UNKNOWN",
            name: stock.name || "Stock",
            sector: stock.sector || "General",
            currentPrice,
            marketValue,
            costBasis,
            pnl,
            pnlPercent
          };
        });

      const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
      const cash = Number(team.cash_balance) || 0;
      const netWorth = Number((cash + totalPortfolioValue).toFixed(2));
      const startingCapital = 100000;
      const netPnL = Number((netWorth - startingCapital).toFixed(2));
      const pnlPercent = Number(((netPnL / startingCapital) * 100).toFixed(2));

      // 3. Transactions: Buy / Sell Volumes
      const teamTransactions = safeTransactions.filter((tx) => tx.team_id === team.id);
      let totalBought = 0;
      let totalSold = 0;
      let sharesBought = 0;
      let sharesSold = 0;

      teamTransactions.forEach((tx) => {
        const amt = Number(tx.total_amount) || Number(tx.shares) * Number(tx.price || tx.price_per_share || 0);
        const sh = Number(tx.shares) || 0;
        if (tx.type === "BUY") {
          totalBought += amt;
          sharesBought += sh;
        } else if (tx.type === "SELL") {
          totalSold += amt;
          sharesSold += sh;
        }
      });

      const totalTradeVolume = totalBought + totalSold;
      const totalTradesCount = teamTransactions.length;

      return {
        ...team,
        isCurrentTeam: currentTeam?.id === team.id,
        members,
        leadTrader,
        regularTraders,
        holdings,
        totalPortfolioValue,
        cash,
        netWorth,
        netPnL,
        pnlPercent,
        totalBought,
        totalSold,
        sharesBought,
        sharesSold,
        totalTradeVolume,
        totalTradesCount,
        recentTransactions: teamTransactions.slice(0, 10)
      };
    });
  }, [allTeams, allTeamMembers, allPortfolios, allTransactions, stocks, currentTeam]);

  // Sort teams
  const rankedTeams = useMemo(() => {
    const sorted = [...teamsWithMetrics].sort((a, b) => {
      if (sortBy === "PNL") return b.netPnL - a.netPnL;
      if (sortBy === "VOLUME") return b.totalTradeVolume - a.totalTradeVolume;
      if (sortBy === "NAME") return (a.name || "").localeCompare(b.name || "");
      // Default: RANK (Net Worth)
      return b.netWorth - a.netWorth;
    });

    return sorted.map((team, idx) => ({
      ...team,
      rank: idx + 1
    }));
  }, [teamsWithMetrics, sortBy]);

  // Filter teams by tab & search query
  const filteredTeams = useMemo(() => {
    return rankedTeams.filter((team) => {
      // Tab filter
      if (filterMode === "MY_TEAM") {
        if (currentTeam?.id && team.id !== currentTeam.id) return false;
      } else if (filterMode === "SOLO") {
        if (team.participant_type !== "individual") return false;
      } else if (filterMode === "TEAMS") {
        if (team.participant_type === "individual") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTeam = team.name?.toLowerCase().includes(q) || team.username?.toLowerCase().includes(q);
        const matchMember = team.members.some((m) => m.name?.toLowerCase().includes(q));
        const matchStock = team.holdings.some((h) => h.ticker.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
        return matchTeam || matchMember || matchStock;
      }

      return true;
    });
  }, [rankedTeams, filterMode, searchQuery, currentTeam]);

  // Global floor statistics
  const floorStats = useMemo(() => {
    const totalMembersCount = (allTeamMembers || []).length;
    const totalVolume = teamsWithMetrics.reduce((sum, t) => sum + t.totalTradeVolume, 0);
    const totalTrades = teamsWithMetrics.reduce((sum, t) => sum + t.totalTradesCount, 0);
    const topPerformer = rankedTeams[0] || null;

    return {
      totalTeams: teamsWithMetrics.length,
      totalMembers: totalMembersCount,
      totalVolume,
      totalTrades,
      topPerformer
    };
  }, [teamsWithMetrics, allTeamMembers, rankedTeams]);

  const activeTeamObj = teamsWithMetrics.find((t) => t.isCurrentTeam) || null;

  return (
    <div className="space-y-6">
      {/* 1. MASTHEAD & HEADER */}
      <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold tracking-wider uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Tournament Roster & Member Performance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
            Team Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time member rosters, portfolio holdings, trading volumes, and performance rankings.
          </p>
        </div>

        {activeTeamObj && (
          <div className="p-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] flex items-center gap-3 shrink-0 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              {activeTeamObj.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Your Desk Rank</div>
              <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="text-amber-500 font-mono">#{activeTeamObj.rank || 1}</span>
                <span>{activeTeamObj.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    activeTeamObj.netPnL >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  ({activeTeamObj.netPnL >= 0 ? "+" : ""}{activeTeamObj.pnlPercent}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUMMARY METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium block">Total Teams / Desks</span>
          <div className="text-2xl font-bold font-serif text-[var(--text-primary)] mt-1 tnum">
            {floorStats.totalTeams}
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5 block">
            {floorStats.totalMembers} Active Traders
          </span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium block">Floor Trading Volume</span>
          <div className="text-2xl font-bold font-serif text-[var(--text-primary)] mt-1 tnum">
            ${floorStats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5 block">
            {floorStats.totalTrades} Executed Trades
          </span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium block">Top Performing Syndicate</span>
          <div className="text-base font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {floorStats.topPerformer ? floorStats.topPerformer.name : "—"}
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5 block">
            Net Worth: ${Number(floorStats.topPerformer?.netWorth || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[var(--text-muted)] font-medium block">Syndicate Privileges</span>
          <div className="text-xs font-bold text-[var(--text-primary)] mt-1.5 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>1 Lead Trader</span>
            <span className="text-[var(--text-muted)] font-normal">+ Multiple Traders</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5 block">
            Shared buying power & pooled portfolio
          </span>
        </div>
      </div>

      {/* 3. CONTROLS: FILTER TABS, SEARCH & SORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--surface-1)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm">
        {/* Segmented Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === "ALL"
                ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Participants ({rankedTeams.length})
          </button>

          {currentTeam && (
            <button
              onClick={() => setFilterMode("MY_TEAM")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterMode === "MY_TEAM"
                  ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>My Team Desk</span>
            </button>
          )}

          <button
            onClick={() => setFilterMode("TEAMS")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterMode === "TEAMS"
                ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>Teams ({rankedTeams.filter((t) => t.participant_type !== "individual").length})</span>
          </button>

          <button
            onClick={() => setFilterMode("SOLO")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterMode === "SOLO"
                ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>Solo Traders ({rankedTeams.filter((t) => t.participant_type === "individual").length})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, member, stock…"
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
          >
            <option value="RANK">Sort by Rank</option>
            <option value="PNL">Sort by Profit & Loss</option>
            <option value="VOLUME">Sort by Trade Volume</option>
            <option value="NAME">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN TEAMS & MEMBERS CARDS LIST */}
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface-1)] rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-mono">
            No participants found matching your filter or search query.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isIndividual = team.participant_type === "individual";
            const isPositive = team.netPnL >= 0;
            const isMyTeam = team.isCurrentTeam;

            return (
              <div
                key={team.id}
                className={`bg-[var(--surface-1)] border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
                  isMyTeam
                    ? "border-blue-500/50 ring-1 ring-blue-500/20 shadow-md"
                    : team.rank === 1
                    ? "border-amber-500/40"
                    : team.rank === 2
                    ? "border-slate-400/40"
                    : team.rank === 3
                    ? "border-amber-700/40"
                    : "border-[var(--border-color)] hover:border-[var(--border-color-hover,var(--border-color))]"
                }`}
              >
                {/* Header Row: Rank Badge, Team Name, Badges & Net Worth */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3.5">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-sm ${
                        team.rank === 1
                          ? "bg-amber-500 text-black font-extrabold"
                          : team.rank === 2
                          ? "bg-slate-300 text-black font-extrabold"
                          : team.rank === 3
                          ? "bg-amber-700 text-white font-extrabold"
                          : "bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-color)]"
                      }`}
                    >
                      #{team.rank}
                    </div>

                    {/* Team Identity */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--text-primary)]">
                          {team.name}
                        </h3>

                        {isMyTeam && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            YOUR DESK
                          </span>
                        )}

                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            isIndividual
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                          }`}
                        >
                          {isIndividual ? "Solo Trader" : `${team.members.length} Members`}
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)] font-mono flex items-center gap-2 mt-0.5">
                        <span>@{team.username}</span>
                        {isIndividual && team.trader_title && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400">{team.trader_title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Net Worth & P&L Summary */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">
                        Total Net Worth
                      </span>
                      <span className="text-base sm:text-lg font-bold font-mono text-[var(--text-primary)] tnum">
                        ${team.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold border flex items-center gap-1 ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>
                        {isPositive ? "+" : ""}${Math.abs(team.netPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="opacity-75 text-[10px]">({isPositive ? "+" : ""}{team.pnlPercent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Body Grid: Members Roster | Stocks Held | Buy / Sell Activity */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3.5">
                  {/* Column 1: Team Members Roster (4 Cols) */}
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                      Roster Members ({team.members.length})
                    </span>

                    {isIndividual ? (
                      <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-[var(--text-primary)] truncate">{team.name}</div>
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                            Independent Prop Trader
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {team.members.length === 0 ? (
                          <div className="p-2.5 rounded-lg bg-[var(--surface-2)] text-[11px] text-[var(--text-muted)] font-mono text-center">
                            No individual names registered
                          </div>
                        ) : (
                          team.members
                            .sort((a, b) => (a.role === "Lead Trader" ? -1 : b.role === "Lead Trader" ? 1 : 0))
                            .map((member) => {
                              const isLead = member.role === "Lead Trader";
                              return (
                                <div
                                  key={member.id}
                                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                                    isLead
                                      ? "bg-amber-500/10 border-amber-500/30"
                                      : "bg-[var(--surface-2)] border-[var(--border-color)]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        isLead
                                          ? "bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40"
                                          : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                      }`}
                                    >
                                      {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                                        {member.name}
                                      </div>
                                      <div className="text-[9px] font-mono text-[var(--text-muted)] truncate">
                                        Account: {team.name} (@{team.username})
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold shrink-0 ${
                                      isLead
                                        ? "text-amber-600 dark:text-amber-400 bg-amber-500/15"
                                        : "text-blue-600 dark:text-blue-400 bg-blue-500/10"
                                    }`}
                                  >
                                    {isLead ? "👑 Lead" : "Trader"}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Stocks Currently Held (4 Cols) */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                        Stocks Held ({team.holdings.length})
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)] tnum">
                        ${team.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {team.holdings.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[var(--surface-2)] text-[11px] text-[var(--text-muted)] font-mono text-center">
                          100% Cash Reserves (${team.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                        </div>
                      ) : (
                        team.holdings.map((h) => {
                          const isHoldingPos = h.pnl >= 0;
                          return (
                            <div
                              key={h.stock_id}
                              onClick={() => onSelectStock && onSelectStock(h.stock)}
                              className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40 cursor-pointer transition-all text-xs"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[var(--text-primary)]">
                                    {h.ticker}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                    {h.shares} sh
                                  </span>
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] truncate">
                                  ${h.currentPrice.toFixed(2)} / sh
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-mono font-bold text-[var(--text-primary)] tnum">
                                  ${h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div
                                  className={`text-[10px] font-mono font-bold ${
                                    isHoldingPos ? "text-emerald-500" : "text-rose-500"
                                  }`}
                                >
                                  {isHoldingPos ? "+" : ""}{h.pnlPercent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Column 3: Trading Volume: Bought vs Sold (4 Cols) */}
                  <div className="md:col-span-4 space-y-2">
                    <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                      Trading Activity
                    </span>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Total Bought</span>
                        </span>
                        <span className="font-bold text-[var(--text-primary)] tnum">
                          ${team.totalBought.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">({team.sharesBought} sh)</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                          <span>Total Sold</span>
                        </span>
                        <span className="font-bold text-[var(--text-primary)] tnum">
                          ${team.totalSold.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">({team.sharesSold} sh)</span>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Available Cash</span>
                        <span className="font-bold text-[var(--text-primary)] tnum">
                          ${team.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTeamDetail(team)}
                        className="w-full mt-1 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-sans font-medium text-xs transition-all active:scale-95 flex items-center justify-center gap-1 border border-[var(--border-color)]"
                      >
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span>View Order History ({team.totalTradesCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. TEAM DETAIL & ORDER LOG MODAL */}
      {selectedTeamDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-2xl p-6 max-w-2xl w-full text-xs shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  #{selectedTeamDetail.rank}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    {selectedTeamDetail.name} · Trade Activity
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    @{selectedTeamDetail.username} · {selectedTeamDetail.totalTradesCount} Total Orders Executed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTeamDetail(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-xs font-mono">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">Cash Balance</span>
                <span className="font-bold text-[var(--text-primary)]">
                  ${selectedTeamDetail.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">Stock Valuation</span>
                <span className="font-bold text-[var(--text-primary)]">
                  ${selectedTeamDetail.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">Net P&L</span>
                <span
                  className={`font-bold ${
                    selectedTeamDetail.netPnL >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {selectedTeamDetail.netPnL >= 0 ? "+" : ""}${selectedTeamDetail.netPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div>
              <h4 className="font-bold text-[var(--text-primary)] font-serif text-sm mb-2">
                Recent Executed Orders
              </h4>

              {selectedTeamDetail.recentTransactions.length === 0 ? (
                <div className="p-6 text-center text-[var(--text-muted)] font-mono bg-[var(--surface-2)] rounded-xl">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-semibold">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3 text-right">Shares</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] font-mono text-xs">
                      {selectedTeamDetail.recentTransactions.map((tx) => {
                        const isBuy = tx.type === "BUY";
                        const stockObj = stocks.find((s) => s.id === tx.stock_id);
                        return (
                          <tr key={tx.id} className="hover:bg-[var(--surface-2)]/50">
                            <td className="py-2.5 px-3 font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] ${
                                  isBuy ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[var(--text-primary)] font-sans">
                              {stockObj?.ticker || "STOCK"}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[var(--text-secondary)] tnum">
                              {tx.shares}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[var(--text-secondary)] tnum">
                              ${Number(tx.price || tx.price_per_share || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[var(--text-primary)] tnum">
                              ${Number(tx.total_amount || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[11px] text-[var(--text-muted)]">
                              {tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeamDetail(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium hover:bg-[var(--surface-3)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
