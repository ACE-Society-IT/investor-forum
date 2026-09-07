"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ThemeToggle from "./ThemeToggle";

export default function ProjectorLeaderboard() {
  const [gameState, setGameState] = useState({
    current_round: "Round 1 - Active",
    is_market_open: true
  });
  const [teams, setTeams] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  const loadData = async () => {
    try {
      const { data: gsData } = await supabase.from("game_state").select("*").single();
      if (gsData) setGameState(gsData);

      const { data: sData } = await supabase.from("stocks").select("*").order("ticker");
      if (sData) setStocks(sData);

      const { data: tData } = await supabase.from("teams").select("*");
      if (tData) setTeams(tData.filter((t) => !t.is_admin));

      const { data: pData } = await supabase.from("portfolio").select("*");
      if (pData) setPortfolios(pData);
    } catch (err) {
      console.error("Error loading projector data:", err);
    }
  };

  useEffect(() => {
    loadData();

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const pollTimer = setInterval(() => {
      loadData();
    }, 2500);

    if (!isSupabaseConfigured) {
      return () => {
        clearInterval(clockTimer);
        clearInterval(pollTimer);
      };
    }

    const channel = supabase
      .channel("projector-realtime-live")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      clearInterval(clockTimer);
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute leaderboard
  const rankedTeams = teams
    .map((team) => {
      const teamHoldings = portfolios.filter((p) => p.team_id === team.id && p.shares > 0);
      const stockValue = teamHoldings.reduce((sum, item) => {
        const stock = stocks.find((s) => s.id === item.stock_id);
        const currentPrice = Number(stock?.price) || 0;
        return sum + item.shares * currentPrice;
      }, 0);

      const netWorth = Number((Number(team.cash_balance) + stockValue).toFixed(2));
      const pnl = netWorth - 100000;
      const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

      return {
        ...team,
        cash: Number(team.cash_balance),
        stockValue,
        netWorth,
        pnl,
        pnlPercent
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  const top1 = rankedTeams[0];
  const top2 = rankedTeams[1];
  const top3 = rankedTeams[2];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between font-sans selection:bg-[#facc15] selection:text-black">
      {/* 1. TOP AUDITORIUM HEADER */}
      <header className="bg-[var(--canvas)] border-b border-[var(--border-color)] px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#facc15] text-[#000000] flex items-center justify-center font-black text-sm shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
              <svg width="18" height="16" viewBox="0 0 115 100" fill="currentColor">
                <path d="M57.5 0L115 100H0L57.5 0Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2.5 leading-none">
                <span className="truncate">INVESTOR FORUM</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-[#facc15]/15 text-[#ca8a04] dark:text-[#facc15] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] font-mono font-bold shrink-0">
                  AUDITORIUM
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs font-mono text-[var(--text-secondary)] mt-0.5 hidden sm:block truncate">
                Official Live Trading Championship Standings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs shrink-0">
            <ThemeToggle />

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg vercel-card">
              <span className="text-[var(--text-tertiary)] text-[10px]">CLOCK:</span>
              <span className="font-bold text-[var(--text-primary)] tnum">{currentTime || "LIVE"}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs ${
                gameState.is_market_open
                  ? "bg-[#00d68f]/10 text-[#00d68f] shadow-[0_0_0_1px_rgba(0,214,143,0.25)]"
                  : "bg-[#f5a623]/10 text-[#f5a623] shadow-[0_0_0_1px_rgba(245,166,35,0.25)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  gameState.is_market_open ? "bg-[#00d68f] animate-ping" : "bg-[#f5a623]"
                }`}
              />
              <span className="truncate max-w-[100px] sm:max-w-none">
                {gameState.is_market_open ? gameState.current_round : "PAUSED"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTINUOUS TICKER TAPE */}
      {stocks.length > 0 && (
        <div className="bg-[var(--canvas-subtle)] border-b border-[var(--border-color)] overflow-hidden py-2 px-6 font-mono text-xs whitespace-nowrap select-none">
          <div className="animate-marquee gap-8">
            {stocks.map((stock) => {
              const isPos = Number(stock.change_percent) >= 0;
              return (
                <div key={`proj-tick-a-${stock.id}`} className="inline-flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                  <span className="tnum text-[var(--text-secondary)]">${Number(stock.price).toFixed(2)}</span>
                  <span
                    className={`inline-flex items-center font-semibold tnum ${
                      isPos ? "text-[#00d68f]" : "text-[#ff5b4f]"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                  </span>
                  <span className="text-[var(--text-tertiary)] ml-4">•</span>
                </div>
              );
            })}
            {stocks.map((stock) => {
              const isPos = Number(stock.change_percent) >= 0;
              return (
                <div key={`proj-tick-b-${stock.id}`} className="inline-flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                  <span className="tnum text-[var(--text-secondary)]">${Number(stock.price).toFixed(2)}</span>
                  <span
                    className={`inline-flex items-center font-semibold tnum ${
                      isPos ? "text-[#00d68f]" : "text-[#ff5b4f]"
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                  </span>
                  <span className="text-[var(--text-tertiary)] ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PODIUM + RANKINGS DISPLAY */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 space-y-8 font-mono">
        {/* PODIUM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Rank 2 */}
          {top2 && (
            <div className="vercel-card rounded-2xl p-6 shadow-xl order-2 md:order-1">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-md bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] text-xs font-bold flex items-center gap-1.5">
                  <Medal className="w-4 h-4" />
                  <span>RANK #2</span>
                </span>
                <span className="text-xs text-[var(--text-tertiary)] font-bold">SILVER PODIUM</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] truncate">{top2.name}</h3>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--text-tertiary)] block uppercase">Net Worth</span>
                  <span className="text-xl font-bold text-[var(--text-primary)] tnum">
                    ${Number(top2.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded ${
                    top2.pnlPercent >= 0
                      ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                      : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                  }`}
                >
                  {top2.pnlPercent >= 0 ? "+" : ""}{top2.pnlPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 - Champion */}
          {top1 && (
            <div className="vercel-card rounded-2xl p-8 shadow-2xl shadow-[#facc15]/10 shadow-[0_0_0_1px_rgba(250,204,21,0.4)] order-1 md:order-2 bg-[var(--surface-1)]">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-lg bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] shadow-[0_0_0_1px_rgba(250,204,21,0.4)] text-sm font-black flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#facc15]" />
                  <span>CHAMPION #1</span>
                </span>
                <span className="text-xs text-[#ca8a04] dark:text-[#facc15] font-bold">GOLD PODIUM</span>
              </div>
              <h3 className="text-3xl font-black text-[var(--text-primary)] truncate tracking-tight">{top1.name}</h3>
              <div className="mt-8 pt-5 border-t border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--text-tertiary)] block uppercase">Total Net Worth</span>
                  <span className="text-2xl font-black text-[var(--text-primary)] tnum">
                    ${Number(top1.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <span
                  className={`text-base font-bold px-3.5 py-1 rounded ${
                    top1.pnlPercent >= 0
                      ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                      : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                  }`}
                >
                  {top1.pnlPercent >= 0 ? "+" : ""}{top1.pnlPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {top3 && (
            <div className="vercel-card rounded-2xl p-6 shadow-xl order-3">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-md bg-[#7928ca]/10 text-[#7928ca] shadow-[0_0_0_1px_rgba(121,40,202,0.2)] text-xs font-bold flex items-center gap-1.5">
                  <Medal className="w-4 h-4" />
                  <span>RANK #3</span>
                </span>
                <span className="text-xs text-[var(--text-tertiary)] font-bold">BRONZE PODIUM</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] truncate">{top3.name}</h3>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--text-tertiary)] block uppercase">Net Worth</span>
                  <span className="text-xl font-bold text-[var(--text-primary)] tnum">
                    ${Number(top3.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded ${
                    top3.pnlPercent >= 0
                      ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                      : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                  }`}
                >
                  {top3.pnlPercent >= 0 ? "+" : ""}{top3.pnlPercent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* FULL RANKINGS TABLE */}
        <div className="vercel-card rounded-2xl p-6 overflow-x-auto shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
            <h3 className="text-sm font-bold uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#facc15]" />
              <span>Official Tournament Standings</span>
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">{rankedTeams.length}&nbsp;Participating Desks</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="pb-3 font-semibold text-center w-16">Rank</th>
                <th className="pb-3 font-semibold">Trading Desk</th>
                <th className="pb-3 font-semibold text-right">Cash Balance</th>
                <th className="pb-3 font-semibold text-right">Stock Valuation</th>
                <th className="pb-3 font-semibold text-right">Total Net Worth</th>
                <th className="pb-3 font-semibold text-right">Return on Capital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {rankedTeams.map((team, idx) => {
                const isPos = team.pnlPercent >= 0;
                return (
                  <tr key={team.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-4 text-center font-bold text-base">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </td>
                    <td className="py-4 font-bold text-base text-[var(--text-primary)]">{team.name}</td>
                    <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                      ${Number(team.cash_balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right text-[var(--text-secondary)] tnum">
                      ${Number(team.stockValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right font-black text-lg text-[var(--text-primary)] tnum">
                      ${Number(team.netWorth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right font-bold tnum">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded text-xs ${
                          isPos
                            ? "text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                            : "text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                        }`}
                      >
                        {isPos ? "+" : ""}{team.pnlPercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--canvas)] px-8 py-3 font-mono text-xs text-[var(--text-secondary)] flex items-center justify-between">
        <span>Investor Forum Live Simulation</span>
        <span className="flex items-center gap-1.5 text-[#00d68f]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d68f]" />
          <span>Real-time Sync Active</span>
        </span>
      </footer>
    </div>
  );
}
