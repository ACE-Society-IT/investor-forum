"use client";

import React from "react";
import { Trophy, Medal, Crown, Lock, Activity, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function LeaderboardView({ leaderboard = [], currentTeamId, isResultsRevealed = false }) {
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const myTeam = leaderboard.find((t) => t.id === currentTeamId);

  if (!isResultsRevealed) {
    return (
      <div className="space-y-6 animate-fade-in font-mono">
        {/* Suspense Headline Banner */}
        <div className="vercel-card rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)] shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] flex items-center justify-center mb-4 animate-pulse">
              <Lock className="w-7 h-7" />
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] mb-3">
              OFFICIAL AUDIT IN PROGRESS
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              TOURNAMENT RESULTS NOT OUT YET
            </h2>

            <p className="text-xs text-[var(--text-secondary)] max-w-lg mt-2 font-sans leading-relaxed">
              The Tournament Directors are currently auditing all trade settlements, cash flows, and portfolio valuations. The official standings and winner podium will be revealed shortly on the main auditorium projector and this trading desk.
            </p>

            {myTeam && (
              <div className="mt-6 p-4 rounded-xl bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] max-w-md w-full text-left flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Your Trading Desk</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{myTeam.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Your Valuation</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] tnum">
                    ${Number(myTeam.netWorth).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mystery Locked Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="vercel-card rounded-xl p-5 border border-[var(--border-color)] order-2 md:order-1 opacity-80">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-3)] text-[var(--text-secondary)] text-xs font-bold">
                <Medal className="w-3.5 h-3.5 text-slate-400" />
                <span>Rank #2</span>
              </span>
              <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            </div>
            <div className="h-6 bg-[var(--surface-2)] rounded-md animate-pulse w-3/4 mb-3" />
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--text-muted)]">Net Worth</span>
              <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wider">?????? USD</span>
            </div>
          </div>

          <div className="vercel-card rounded-xl p-6 border-2 border-[var(--accent-yellow)]/30 order-1 md:order-2 bg-[var(--surface-1)]">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--accent-yellow)]/20 text-[#ca8a04] dark:text-[#facc15] text-xs font-black">
                <Crown className="w-4 h-4 text-[#facc15]" />
                <span>Leader #1</span>
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-yellow)] animate-ping" />
            </div>
            <div className="h-7 bg-[var(--surface-2)] rounded-md animate-pulse w-4/5 mb-4" />
            <div className="pt-3.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--text-muted)]">Champion Net Worth</span>
              <span className="text-sm font-bold text-[#ca8a04] dark:text-[#facc15] tracking-wider">?????? USD</span>
            </div>
          </div>

          <div className="vercel-card rounded-xl p-5 border border-[var(--border-color)] order-3 opacity-80">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7928ca]/10 text-[#7c3aed] dark:text-[#7928ca] text-xs font-bold">
                <Medal className="w-3.5 h-3.5" />
                <span>Rank #3</span>
              </span>
              <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            </div>
            <div className="h-6 bg-[var(--surface-2)] rounded-md animate-pulse w-2/3 mb-3" />
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--text-muted)]">Net Worth</span>
              <span className="text-xs font-bold text-[var(--text-secondary)] tracking-wider">?????? USD</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
