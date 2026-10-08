"use client";

import React, { useState } from "react";
import {
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  Zap,
  Trophy,
  Lightbulb,
  Compass,
  Sparkles,
  PieChart,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  Newspaper,
  Layers,
  ChevronDown,
  ChevronUp,
  Radio,
  Lock,
  Activity,
  Wallet,
  Scale,
  BarChart3,
  Timer
} from "lucide-react";

export default function RulesView({ onNavigateTab }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const keyParameters = [
    {
      icon: DollarSign,
      label: "Starting Capital",
      value: "PKR 200,000",
      sub: "Simulated Cash Allocation"
    },
    {
      icon: Clock,
      label: "Phase 1: Analysis",
      value: "~4 Minutes",
      sub: "Trading Paused · Study News"
    },
    {
      icon: Activity,
      label: "Phase 2: Trading",
      value: "~5 Minutes",
      sub: "Trading Floor Open"
    },
    {
      icon: ShieldCheck,
      label: "Execution Engine",
      value: "Instant (0% Fee)",
      sub: "Zero Slippage & No Fees"
    }
  ];

  const roundPhases = [
    {
      phaseNum: "01",
      name: "Crisis Analysis Phase",
      duration: "~4 Minutes (Designated)",
      status: "MARKET PAUSED",
      statusColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      icon: Clock,
      desc: "A breaking economic crisis news bulletin is broadcast by the Director. Trading is paused across all student terminals. Use this time to read the catalyst, discuss with your team, identify impacted sectors, and plan your buy/sell orders.",
      actionTab: "news",
      actionLabel: "View News Wire"
    },
    {
      phaseNum: "02",
      name: "Active Trading Window",
      duration: "~5 Minutes (Designated)",
      status: "TRADING OPEN",
      statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: Activity,
      desc: "The trading floor buzzer sounds and the market unlocks! Rapidly submit Buy and Sell orders for equities before the round timer reaches 00:00. Use quick cash shortcuts (25%, 50%, 75%, 100%) for swift capital allocation.",
      actionTab: "stocks",
      actionLabel: "Open Trading Floor"
    },
    {
      phaseNum: "03",
      name: "Trading Paused & Price Shockwave",
      duration: "Instant Lockout",
      status: "ORDERS LOCKED",
      statusColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      icon: Lock,
      desc: "When the countdown ends, trading immediately pauses. The engine calculates macroeconomic shockwaves based on the crisis, updating stock valuations. A dismissible notification informs teams that shockwave prices are applied.",
      actionTab: "portfolio",
      actionLabel: "Check Portfolio"
    },
    {
      phaseNum: "04",
      name: "Round Ended & Market Standby",
      duration: "Intermission",
      status: "STANDBY",
      statusColor: "text-stone-600 dark:text-stone-300 bg-stone-500/10 border-stone-500/20",
      icon: Trophy,
      desc: "The round concludes. Inspect your updated portfolio valuation, realized/unrealized PnL, and check your tournament ranking on the Live Leaderboard while the Director prepares the next crisis catalyst.",
      actionTab: "leaderboard",
      actionLabel: "View Leaderboard"
    }
  ];

  const tradingSteps = [
    {
      num: "1",
      title: "Explore Equities & Sectors",
      desc: "Navigate to the Trading Floor or Market Intelligence tab to view all listed companies, live prices, percentage changes, and price trend sparklines across Tech, Banks, Energy, Pharma, and Cement."
    },
    {
      num: "2",
      title: "Place a Buy Order",
      desc: "Click 'Order' in the top bar or click any stock card. Enter the quantity of shares or use quick allocation (25%, 50%, 75%, Max Cash). Confirm your order to instantly receive shares in your portfolio."
    },
    {
      num: "3",
      title: "Monitor Portfolio & Unrealized PnL",
      desc: "Head to the Portfolio tab to track total net worth, individual position market values, average buy price, and live PnL percentages as market prices adjust."
    },
    {
      num: "4",
      title: "Liquidate & Secure Realized Gains",
      desc: "When a stock surges or you wish to pivot into another sector, open the Sell order panel from your Portfolio to convert shares back into cash buying power."
    }
  ];

  const proTips = [
    {
      title: "Maintain Cash Reserves ('Dry Powder')",
      desc: "Avoid investing 100% of your PKR 200,000 in a single trade. Keeping 25%–35% in liquid cash gives your team flexibility to capitalize on unexpected news dips in subsequent rounds."
    },
    {
      title: "Analyze Ripple Effects Across Sectors",
      desc: "Macroeconomic news impacts entire sectors and supply chains. For example, interest rate hikes impact commercial banking spreads and tech valuations differently."
    },
    {
      title: "Lock In Profits (Realize Gains)",
      desc: "Gains are theoretical until shares are sold. If a stock surges +10% to +20% following a positive catalyst, consider selling a portion to lock in realized tournament gains."
    },
    {
      title: "Collaborate Actively Within Your Team",
      desc: "Assign team roles during the 4-minute analysis window (e.g., one analyst reads the news wire, another monitors stock valuations, and the lead trader prepares order quantities)."
    }
  ];

  const faqs = [
    {
      q: "What is each team's starting budget?",
      a: "Every team is allocated exactly PKR 200,000 in virtual capital at the start of the tournament. Your total net worth is calculated as Cash Balance + Market Value of all held shares."
    },
    {
      q: "Can we place trades during the Crisis Analysis phase?",
      a: "No. During the ~4-minute Crisis Analysis phase, the trading floor is paused. This ensures all teams have equal time to read the news report, analyze affected sectors, and coordinate strategy before the floor opens."
    },
    {
      q: "When does trading open and how long does it last?",
      a: "Once the analysis timer finishes, the trading window unlocks for approximately 5 minutes (or the time set by the Competition Director). During this window, all buy and sell orders execute instantly."
    },
    {
      q: "What happens when the trading window timer reaches 00:00?",
      a: "Trading is automatically paused. The exchange locks orders and applies macroeconomic price adjustments based on the crisis catalyst. A notification will appear, allowing you to dismiss it and view your updated portfolio."
    },
    {
      q: "Are there any trading transaction fees or slippage?",
      a: "No. Orders execute with zero slippage and 0% commission fees at the exact price shown on the trading board, provided your team has sufficient cash balance."
    },
    {
      q: "How is the tournament winner determined?",
      a: "The tournament winner is determined by Total Net Worth (Available Cash + Total Market Value of Stocks) at the conclusion of all tournament rounds, displayed in real-time on the Projector Leaderboard."
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in font-sans pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/10 dark:via-transparent dark:to-[#eae0d3]/5 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[#402b28]/20 dark:border-[#eae0d3]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Student Trading Rules &amp; Tournament Guide</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Investor Forum Competition Arena
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Step onto the virtual exchange floor. Each team is endowed with <span className="font-bold text-[var(--text-primary)] font-mono">PKR 200,000</span> in simulated capital. Analyze breaking economic crisis catalysts, execute timely trades across active sectors, and compete for top standing on the live tournament leaderboard.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto shrink-0 font-mono">
            <button
              onClick={() => onNavigateTab("stocks")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98]"
            >
              <span>Go to Trading Floor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("news")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-color)] transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span>View News Wire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Parameters Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        {keyParameters.map((param, idx) => {
          const Icon = param.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] shadow-sm space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                  {param.label}
                </span>
                <Icon className="w-4 h-4 text-[var(--accent-maroon-text)]" />
              </div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {param.value}
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-sans">
                {param.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Timed Crisis Round Workflow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[var(--accent-maroon-text)]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
              Timed Crisis Round Structure &amp; Workflow
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
            4-PHASE CYCLE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundPhases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between space-y-4 hover:border-[var(--accent-maroon)]/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-color)]">
                      PHASE {phase.phaseNum}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${phase.statusColor}`}>
                      {phase.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] shrink-0 text-[var(--accent-maroon-text)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {phase.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {phase.duration}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    {phase.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)]/60 font-mono">
                  <button
                    onClick={() => onNavigateTab(phase.actionTab)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-maroon-text)] transition-colors"
                  >
                    <span>{phase.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step: How to Trade */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--accent-maroon-text)]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            How to Execute Trades: 4 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {tradingSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] shadow-sm space-y-2 relative"
            >
              <span className="font-mono text-xs font-bold text-[var(--accent-maroon-text)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                STEP {step.num}
              </span>
              <h3 className="text-xs font-bold text-[var(--text-primary)] pt-1">
                {step.title}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Strategy Playbook */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Strategy Playbook: Maximizing Net Worth
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{tip.title}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-7">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[var(--accent-maroon-text)]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer CTA */}
      <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[var(--border-color)] bg-gradient-to-r from-[#402b28]/5 via-[var(--surface-1)] to-transparent dark:from-[#eae0d3]/5 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono">
            Ready to Enter the Exchange Floor?
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Inspect the live listed equities, analyze sector distribution, or check the leaderboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          <button
            onClick={() => onNavigateTab("portfolio")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] transition-all active:scale-95"
          >
            My Portfolio
          </button>
          <button
            onClick={() => onNavigateTab("leaderboard")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] transition-all active:scale-95"
          >
            Leaderboard
          </button>
          <button
            onClick={() => onNavigateTab("stocks")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-95"
          >
            <span>Trading Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
