"use client";

import React from "react";
import { BookOpen, ShieldCheck, DollarSign, Trophy, ArrowRight, AlertTriangle } from "lucide-react";

export default function RulesView({ onNavigateTab }) {
  const rules = [
    {
      icon: DollarSign,
      title: "Initial Capital Allocation",
      desc: "Every registered participant team starts with exactly $100,000.00 USD in liquid simulated cash buying power."
    },
    {
      icon: ShieldCheck,
      title: "Market Execution Rules",
      desc: "All buy and sell orders execute instantly at current quoted market prices with zero slippage or execution commissions."
    },
    {
      icon: AlertTriangle,
      title: "Real-Time News Shocks",
      desc: "Organizers can broadcast unscheduled breaking economic news and sector shocks that immediately revalue equities across affected industries."
    },
    {
      icon: Trophy,
      title: "Scoring & Championship Formula",
      desc: "Final standings are determined strictly by Total Portfolio Net Worth (Available Cash + Value of All Held Shares) at tournament close."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      {/* Introduction Card */}
      <div className="vercel-card rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <BookOpen className="w-4 h-4 text-[var(--accent-yellow)]" />
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
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-yellow)]/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] flex items-center justify-center text-[var(--accent-yellow)]">
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-all duration-150 active:scale-[0.98]"
        >
          <span>Open Trading Floor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
