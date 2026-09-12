"use client";

import React, { useState } from "react";
import {
  Laptop,
  DollarSign,
  Zap,
  ShieldCheck,
  ChevronDown,
  Activity,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   CORE RULES DATA
   ─────────────────────────────────────────────────────── */

const CORE_RULES = [
  {
    id: "single-device",
    icon: Laptop,
    badge: "FAIR PLAY PROTOCOL",
    title: "Single Device Per Team",
    summary:
      "One designated terminal per team. Multi-device logins are strictly restricted.",
    details:
      "To ensure pure fairness and equal operational capability across all student desks, each registered team must trade from exactly ONE device. Multi-screen automation, concurrent session logins, or parallel trading from secondary devices are monitored by the exchange audit ledger.",
  },
  {
    id: "capital",
    icon: DollarSign,
    badge: "EQUAL STARTING GROUND",
    title: "$100,000 Virtual Capital",
    summary: "Every team begins with exactly $100,000 in simulated buying power.",
    details:
      "All student desks receive identical starting cash of $100,000 at the opening bell. You can only purchase equities using cleared available funds—no margin borrowing or negative balances are permitted. Keeping cash reserves ('dry powder') allows you to capitalize on sudden market sell-offs.",
  },
  {
    id: "news-impact",
    icon: Zap,
    badge: "HIGH-IMPACT CATALYSTS",
    title: "Breaking News Shockwaves",
    summary: "Bulletins trigger large multi-percent price swings over ~10-second waves.",
    details:
      "Every time a breaking bulletin flashes across the News Wire, expect significant volatility. Positive clinical readouts or earnings beats can spike a stock by +4% to +10%, while regulatory sanctions or supply shocks trigger sharp sell-offs. Reactions occur in real-time waves, giving vigilant desks a window to capitalize.",
  },
  {
    id: "micro-ticks",
    icon: Activity,
    badge: "CONTINUOUS MOMENTUM",
    title: "Live Market Ticks & Organic Waves",
    summary: "Keep eyes on the tape: constant micro-ticks create entry and exit windows.",
    details:
      "The market never sits still between news events. Continuous autonomous price discovery creates realistic micro-ticks, minor momentum shifts, and organic pullbacks across all 6 sectors. Watching price action closely rewards disciplined timing over blind guessing.",
  },
  {
    id: "execution",
    icon: Scale,
    badge: "TRADING MECHANICS",
    title: "Spot Execution & No Short Selling",
    summary: "Trade only what you own. Orders execute instantly at the live quote.",
    details:
      "All trades execute with zero slippage or hidden exchange fees at the prevailing market price. Teams may only sell shares they currently hold in their portfolio—naked short selling is disabled. Solvency is validated instantly on every transaction.",
  },
  {
    id: "scoring",
    icon: ShieldCheck,
    badge: "TOURNAMENT RANKING",
    title: "Total Net Worth Valuation",
    summary:
      "Final leaderboard rankings are determined purely by Total Portfolio Net Worth.",
    details:
      "Standings update in sub-second intervals on the auditorium projector screen. Your tournament ranking equals Available Cash + Total Current Market Value of Held Shares. The desk with the highest verified net worth at the closing bell wins the championship.",
  },
];

/* ─────────────────────────────────────────────────────────
   MAIN RULES COMPONENT
   ─────────────────────────────────────────────────────── */

export default function RulesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleRule = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden"
      id="rules"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4 text-balance">
            The Trading Floor Rules
          </h2>

          <p className="text-cream-muted/80 text-base max-w-xl font-normal font-sans text-balance">
            One device per team. $100,000 starting cash. Real-time market velocity. Fair
            play guarantees an authentic trading floor showdown.
          </p>
        </div>

        {/* 3 Key Pillar Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: $100,000 Cash */}
          <div className="rounded-2xl bg-maroon-subtle/50 border border-border-brown/60 p-6 flex flex-col justify-between hover:border-border-brown/90 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-green/20 border border-accent-green/30 flex items-center justify-center text-accent-green-bright mb-4">
                <DollarSign className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                Starting Capital
              </div>
              <div className="font-mono text-3xl font-bold text-cream-light mb-2">
                $100,000
              </div>
              <p className="text-xs text-cream-muted/80 leading-relaxed font-sans">
                Equal virtual capital distributed to every competing team. No debt,
                margin, or external funds.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-brown/30 font-mono text-[10px] text-accent-green-bright flex items-center gap-1.5">
              <span>●</span> Strict Zero-Debt Solvency
            </div>
          </div>

          {/* Card 2: 1 Device Policy */}
          <div className="rounded-2xl bg-maroon-subtle/50 border border-border-brown/60 p-6 flex flex-col justify-between hover:border-border-brown/90 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Laptop className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                Hardware Policy
              </div>
              <div className="font-mono text-3xl font-bold text-cream-light mb-2">
                1 Device
              </div>
              <p className="text-xs text-cream-muted/80 leading-relaxed font-sans">
                Each team operates strictly from one designated device. Concurrent
                multi-device logins are blocked.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-brown/30 font-mono text-[10px] text-amber-400 flex items-center gap-1.5">
              <span>●</span> Fair Play Ledger Monitored
            </div>
          </div>

          {/* Card 3: News Impact & Ticks */}
          <div className="rounded-2xl bg-maroon-subtle/50 border border-border-brown/60 p-6 flex flex-col justify-between hover:border-border-brown/90 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--maroon-accent)]/20 border border-[var(--maroon-accent)]/40 flex items-center justify-center text-cream-light mb-4">
                <Zap className="w-5 h-5 text-[var(--maroon-accent-bright,#bf5653)] stroke-[2]" />
              </div>
              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                Price Velocity
              </div>
              <div className="font-mono text-3xl font-bold text-cream-light mb-2">
                Live Shocks
              </div>
              <p className="text-xs text-cream-muted/80 leading-relaxed font-sans">
                Breaking news creates heavy multi-percent waves. Constant small ticks
                reward disciplined market eyes.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border-brown/30 font-mono text-[10px] text-cream-muted/70 flex items-center gap-1.5">
              <span>●</span> Real-Time Wave Propagation
            </div>
          </div>
        </div>

        {/* Valuation Standard Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-maroon-subtle/40 border border-border-brown/70 text-center flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm">
          <span className="font-mono text-[10px] text-cream-muted/60 uppercase tracking-widest">
            Auditorium Valuation Standard
          </span>
          <div className="font-mono text-base sm:text-lg md:text-xl text-cream-light font-medium tracking-tight py-1">
            Total Net Worth = Available Cash + Σ (Shares Held × Live Market Price)
          </div>
          <p className="text-xs text-cream-muted/70 font-sans max-w-xl">
            Rankings stream live on the projector screen. Trades and liquidations settle
            instantaneously at the current exchange quote.
          </p>
        </div>

        {/* Comprehensive Rules Accordion */}
        <div className="rounded-2xl bg-maroon-subtle/30 border border-border-brown/50 divide-y divide-border-brown/40 overflow-hidden">
          {CORE_RULES.map((rule, idx) => {
            const isOpen = openIndex === idx;
            const Icon = rule.icon;

            return (
              <div key={rule.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleRule(idx)}
                  className="w-full p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 text-left select-none cursor-pointer group hover:bg-maroon-subtle/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        isOpen
                          ? "bg-maroon-base border-cream-muted/40 text-cream-light"
                          : "bg-maroon-subtle/70 border-border-brown/60 text-cream-muted group-hover:border-cream-muted/30"
                      )}
                    >
                      <Icon className="w-4 h-4 stroke-[1.75]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-serif text-lg sm:text-xl font-normal text-cream-light group-hover:text-cream-light transition-colors">
                          {rule.title}
                        </span>
                        <span className="hidden sm:inline-block font-mono text-[9px] px-2 py-0.5 rounded border border-border-brown/60 text-cream-muted/60 uppercase">
                          {rule.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-cream-muted/70 font-sans line-clamp-1">
                        {rule.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1 sm:pt-0">
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-cream-muted/60 transform transition-transform duration-200",
                        isOpen && "rotate-180 text-cream-light"
                      )}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cream-muted/85 leading-relaxed font-sans border-t border-border-brown/20 bg-maroon-base/30">
                    <p>{rule.details}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
