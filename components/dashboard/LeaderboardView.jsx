"use client";

import React from "react";
import { Trophy, Medal, Crown } from "lucide-react";

export default function LeaderboardView({ leaderboard = [], currentTeamId }) {
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* 1. TOP 3 PODIUM DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        {top2 && (
          <div
            className={`vercel-card rounded-xl p-5 flex flex-col justify-between order-2 md:order-1 ${
              top2.id === currentTeamId ? "shadow-[0_0_0_1px_rgba(250,204,21,0.5)]" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] text-xs font-bold">
                  <Medal className="w-3.5 h-3.5" />
                  <span>Rank #2</span>
                </span>
                {top2.id === currentTeamId && (
                  <span className="text-[10px] bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] px-2 py-0.5 rounded font-bold shadow-[0_0_0_1px_rgba(250,204,21,0.3)]">
                    Your Desk
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{top2.name}</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Trading Desk</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-bold">Total Net Worth</span>
                <span className="text-sm font-bold text-[var(--text-primary)] tnum">
                  ${Number(top2.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  top2.pnlPercent >= 0
                    ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                    : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                }`}
              >
                {top2.pnlPercent >= 0 ? "+" : ""}{top2.pnlPercent}%
              </span>
            </div>
          </div>
        )}

        {/* 1st Place - Gold Champion */}
        {top1 && (
          <div
            className={`vercel-card rounded-xl p-6 flex flex-col justify-between order-1 md:order-2 ${
              top1.id === currentTeamId ? "shadow-[0_0_0_1px_rgba(250,204,21,0.6)]" : "shadow-[0_0_0_1px_rgba(250,204,21,0.3)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] shadow-[0_0_0_1px_rgba(250,204,21,0.4)] text-xs font-black">
                  <Crown className="w-4 h-4 text-[#facc15]" />
                  <span>Leader #1</span>
                </span>
                {top1.id === currentTeamId && (
                  <span className="text-[10px] bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] px-2 py-0.5 rounded font-bold shadow-[0_0_0_1px_rgba(250,204,21,0.3)]">
                    Your Desk
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[var(--text-primary)] truncate">{top1.name}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Tournament Leader</p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-bold">Total Net Worth</span>
                <span className="text-base font-black text-[var(--text-primary)] tnum">
                  ${Number(top1.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  top1.pnlPercent >= 0
                    ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                    : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                }`}
              >
                {top1.pnlPercent >= 0 ? "+" : ""}{top1.pnlPercent}%
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div
            className={`vercel-card rounded-xl p-5 flex flex-col justify-between order-3 ${
              top3.id === currentTeamId ? "shadow-[0_0_0_1px_rgba(250,204,21,0.5)]" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7928ca]/10 text-[#7c3aed] dark:text-[#7928ca] shadow-[0_0_0_1px_rgba(121,40,202,0.2)] text-xs font-bold">
                  <Medal className="w-3.5 h-3.5" />
                  <span>Rank #3</span>
                </span>
                {top3.id === currentTeamId && (
                  <span className="text-[10px] bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] px-2 py-0.5 rounded font-bold shadow-[0_0_0_1px_rgba(250,204,21,0.3)]">
                    Your Desk
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{top3.name}</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Trading Desk</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-bold">Total Net Worth</span>
                <span className="text-sm font-bold text-[var(--text-primary)] tnum">
                  ${Number(top3.netWorth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  top3.pnlPercent >= 0
                    ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                    : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
                }`}
              >
                {top3.pnlPercent >= 0 ? "+" : ""}{top3.pnlPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. FULL STANDINGS TABLE */}
      <div className="vercel-card rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
          <h3 className="text-xs font-bold uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-[#facc15]" />
            <span>Tournament Standings</span>
          </h3>
          <span className="text-[10px] text-[var(--text-secondary)]">{leaderboard.length}&nbsp;Competitors</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
              <th className="pb-3 font-bold text-center w-12">Rank</th>
              <th className="pb-3 font-bold">Team Desk</th>
              <th className="pb-3 font-bold text-right">Available Cash</th>
              <th className="pb-3 font-bold text-right">Stock Valuation</th>
              <th className="pb-3 font-bold text-right">Total Net Worth</th>
              <th className="pb-3 font-bold text-right">Return on Capital</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {leaderboard.map((team, idx) => {
              const isCurrent = team.id === currentTeamId;
              const isPos = team.pnlPercent >= 0;
              return (
                <tr
                  key={team.id}
                  className={`transition-colors duration-150 ${
                    isCurrent
                      ? "bg-[#facc15]/10 font-bold"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="py-3.5 text-center font-bold">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-primary)] text-sm font-bold">{team.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#facc15]/20 text-[#ca8a04] dark:text-[#facc15] shadow-[0_0_0_1px_rgba(250,204,21,0.3)] font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 text-right text-[var(--text-secondary)] tnum">
                    ${Number(team.cash_balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3.5 text-right text-[var(--text-secondary)] tnum">
                    ${Number(team.portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3.5 text-right font-black text-[var(--text-primary)] text-sm tnum">
                    ${Number(team.netWorth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right font-bold tnum">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] ${
                        isPos
                          ? "text-[#059669] dark:text-[#00d68f] bg-[#00d68f]/10 shadow-[0_0_0_1px_rgba(0,214,143,0.2)]"
                          : "text-[#e11d48] dark:text-[#ff5b4f] bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.2)]"
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
    </div>
  );
}
