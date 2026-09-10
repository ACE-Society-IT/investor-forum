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
  ChevronUp 
} from "lucide-react";

export default function RulesView({ onNavigateTab }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const steps = [
    {
      num: "01",
      title: "Explore the Market & Sectors",
      desc: "Check the Trading Floor and Market Intelligence desk. Analyze sector trends (Tech, Energy, Healthcare, Finance, Consumer) to identify promising companies.",
      tab: "stocks",
      actionLabel: "View Market"
    },
    {
      num: "02",
      title: "Build a Balanced Portfolio",
      desc: "Use your $100,000 starting cash wisely. Spread your capital across multiple stocks instead of betting everything on a single ticker to manage risk.",
      tab: "portfolio",
      actionLabel: "View Portfolio"
    },
    {
      num: "03",
      title: "Capitalize on Breaking News",
      desc: "Watch for breaking news wire flashes! Macro shocks and corporate announcements trigger gradual 10-second price waves—react quickly to seize profits.",
      tab: "news",
      actionLabel: "Read News Wire"
    }
  ];

  const coreMechanics = [
    {
      icon: DollarSign,
      badge: "Starting Fund",
      title: "$100,000 Virtual Capital",
      desc: "Every student or team begins with exactly $100,000 in simulated buying power. Your goal is to maximize this capital by trading actively before the tournament buzzer."
    },
    {
      icon: TrendingUp,
      badge: "Realistic Dynamics",
      title: "Autonomous Price Waves",
      desc: "Stock prices fluctuate organically with realistic macro market momentum—creating higher-highs during bull runs and natural pullback dips for entry opportunities."
    },
    {
      icon: Zap,
      badge: "Live Catalysts",
      title: "Breaking News Impact",
      desc: "Headlines move stock prices in real-time waves (+2% to +8% on positive catalysts, or -2% to -8% on setbacks). Prices shift smoothly over ~10 seconds so you can react."
    },
    {
      icon: Trophy,
      badge: "Scoring",
      title: "Portfolio Net Worth Ranking",
      desc: "Your tournament rank is determined by Total Net Worth = Available Cash + Total Market Value of Held Shares. High returns and smart cash management win the cup."
    },
    {
      icon: ShieldCheck,
      badge: "Execution",
      title: "Instant Execution & Solvency",
      desc: "Orders execute instantaneously at current market prices with zero slippage or hidden trading fees. You can only buy with available cash—no negative balances allowed."
    },
    {
      icon: AlertTriangle,
      badge: "Fair Play",
      title: "Automated Ledger Auditing",
      desc: "Every transaction is securely verified against your portfolio balance in real time. Fair competition is guaranteed for all participants."
    }
  ];

  const proTips = [
    {
      title: "Keep a Cash Reserve ('Dry Powder')",
      desc: "Avoid putting 100% of your funds into stocks at once. Keeping 20%–30% in cash gives you the flexibility to instantly buy undervalued stocks when surprise negative news dips prices."
    },
    {
      title: "Lock In Your Profits",
      desc: "Remember: gains are only theoretical until you sell! If a stock surges +10% or +15% after a major headline, consider selling a portion of your shares to secure realized profits."
    },
    {
      title: "Avoid Chasing the Peak (FOMO)",
      desc: "If a stock has already climbed +20% and the news wave is ending, buying at the very top is risky. Look for stable stocks that haven't surged yet or wait for a healthy pullback."
    },
    {
      title: "Think in Sectors",
      desc: "News rarely affects just one company. A breakthrough in AI might boost all Tech and Semiconductor stocks, while green energy subsidies could boost Clean Tech and pressure Fossil Fuels."
    }
  ];

  const faqs = [
    {
      q: "What happens if a stock I own drops in price?",
      a: "Don't panic! A drop is an 'unrealized loss' until you click Sell. You can choose to hold on until the sector rebounds, or sell immediately to stop further losses and reallocate your cash into a rising stock."
    },
    {
      q: "Can I trade as many times as I want?",
      a: "Yes! There are no limits on the number of buy or sell orders you can place during active competition rounds. You can trade actively as news breaks or hold long-term positions."
    },
    {
      q: "How does the Live Leaderboard calculate my position?",
      a: "The leaderboard tracks your Total Net Worth (Cash + Value of all stocks at current live prices) in real-time. As stock prices climb, your rank rises automatically!"
    },
    {
      q: "What should I do in the first 2 minutes of the competition?",
      a: "Start by reviewing all available stocks and their current prices. Buy 3 to 5 strong companies across different sectors with 60% of your cash, keeping the remaining 40% ready for breaking news catalysts."
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in font-sans pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/10 dark:via-transparent dark:to-[#eae0d3]/5 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[#402b28]/20 dark:border-[#eae0d3]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Trading Masterclass & Tournament Guide</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome to the Investor Forum Trading Arena
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Step onto the virtual trading floor! You have been granted <span className="font-semibold text-[var(--text-primary)]">$100,000 in starting cash</span> to trade simulated equities, capitalize on breaking news shockwaves, and compete for the highest net worth on the real-time leaderboard.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigateTab("stocks")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98]"
            >
              <span>Go to Trading Floor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("news")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[var(--text-primary)] border border-[var(--border-color)] transition-all"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>View News Wire</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Quickstart Walkthrough */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Compass className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            How to Play: 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="vercel-card rounded-xl p-5 flex flex-col justify-between hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3]">
                    STEP {step.num}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600/70 dark:text-emerald-400/70" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[var(--border-color)]/60">
                <button
                  onClick={() => onNavigateTab(step.tab)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#402b28] dark:text-[#eae0d3] hover:underline"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Rules & Trading Mechanics */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Core Rules & Market Mechanics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreMechanics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="vercel-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#402b28]/10 dark:bg-[#eae0d3]/15 shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-center text-[#402b28] dark:text-[#eae0d3]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Tips & Winning Strategy Playbook */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-white/40 dark:bg-[#1a1412]/40 backdrop-blur-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Student Strategy Playbook (How to Win)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proTips.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-[#251c19]/60 border border-[var(--border-color)]/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
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
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <HelpCircle className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="vercel-card rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Navigation Footer */}
      <div className="vercel-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#402b28]/20 dark:border-[#eae0d3]/20 bg-gradient-to-r from-[#402b28]/5 to-transparent dark:from-[#eae0d3]/5">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Ready to Build Your Portfolio?
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Jump to the trading floor, check the market intelligence, or inspect current leaderboard standings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab("intelligence")}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[var(--text-primary)] transition-all"
          >
            Market Intelligence
          </button>
          <button
            onClick={() => onNavigateTab("leaderboard")}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border-color)] bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[var(--text-primary)] transition-all"
          >
            Live Leaderboard
          </button>
          <button
            onClick={() => onNavigateTab("stocks")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-md transition-all active:scale-[0.98]"
          >
            <span>Open Trading Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

