"use client";

import React from "react";
import { BookOpen, AlertTriangle, ShieldCheck, Clock, TrendingUp, ArrowRight, Zap, Trophy } from "lucide-react";

export default function RulesView({ onNavigateTab }) {
  const rules = [
    {
      icon: TrendingUp,
      title: "1. Starting Capital & Allocation",
      desc: "Each team is granted $100,000 in virtual starting cash. You may allocate capital across any listed equity, hold cash reserves, or diversify across sectors."
    },
    {
      icon: Clock,
      title: "2. Real-Time Market Ticks",
      desc: "Stock prices update in real time with continuous micro-movements. Execution is instant with zero slippage during active market hours."
    },
    {
      icon: Zap,
      title: "3. AI Breaking News Shocks",
      desc: "Unpredictable macroeconomic and company events will be broadcast throughout the round by the AI Market Engine, causing immediate sector-wide price fluctuations."
    },
    {
      icon: ShieldCheck,
      title: "4. Solvency & Trading Controls",
      desc: "Short selling without holding shares is strictly prohibited. Orders must be positive whole integers and cannot exceed your available buying power."
    },
    {
      icon: Trophy,
      title: "5. Winning Condition",
      desc: "Tournament ranking is determined strictly by Total Portfolio Net Worth (Cash + Stock Holdings Value at market close) at the conclusion of the final round."
    },
    {
      icon: AlertTriangle,
      title: "6. Fair Play & Solvency Checks",
      desc: "All trade executions undergo automatic database verification. Attempted balance tampering or illicit exploits will result in immediate disqualification."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      {/* Introduction Card */}
      <div className="vercel-card rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">Tournament Rules & Guidelines</h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Welcome to the Investor Forum Live Stock Trading Competition. Teams compete in real time on this simulated institutional trading platform. Read the operational parameters below carefully before placing orders.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div key={idx} className="vercel-card rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#402b28]/10 dark:bg-[#eae0d3]/15 shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-center text-[#402b28] dark:text-[#eae0d3]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">{rule.title}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {rule.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="vercel-card rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-primary)]">Ready to begin trading?</h4>
          <p className="text-[11px] text-[var(--text-secondary)]">Navigate to the trading floor and build your portfolio.</p>
        </div>

        <button
          onClick={() => onNavigateTab("stocks")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-[0_0_0_1px_var(--border-color)] transition-all duration-150 active:scale-[0.98]"
        >
          <span>Open Trading Floor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
