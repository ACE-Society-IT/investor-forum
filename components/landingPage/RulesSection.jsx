"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  DollarSign,
  Zap,
  ShieldCheck,
  ChevronDown,
  Activity,
  Scale,
  Lock,
  TrendingUp,
  Cpu,
  Calculator,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   CORE RULES ARTICLES DATA
   ─────────────────────────────────────────────────────── */

const CATEGORIES = ["All Protocols", "Capital & Solvency", "Security & Fair Play", "Execution & Valuation"];

const RULES_ARTICLES = [
  {
    id: "single-device",
    number: "01",
    category: "Security & Fair Play",
    badge: "FAIR PLAY PROTOCOL",
    icon: Laptop,
    metric: "Terminal Limit: 1",
    metricHighlight: "Hardware-Locked",
    title: "Single Device Hardware Binding",
    summary: "One designated terminal per team. Secondary or concurrent logins are blocked.",
    details:
      "To ensure pure fairness and equal operational capability across all student desks, each team must trade from exactly ONE verified terminal. The exchange authentication gateway binds the active session to the verified hardware. Concurrent logins or distributed multi-screen order entry from secondary devices are strictly rejected by the session monitor.",
    tags: ["Anti-Tamper", "Single-Session JWT", "Desk Lock"],
  },
  {
    id: "capital",
    number: "02",
    category: "Capital & Solvency",
    badge: "EQUAL STARTING GROUND",
    icon: DollarSign,
    metric: "Buying Power: $100,000",
    metricHighlight: "1.0x Spot Only",
    title: "$100,000 Virtual Solvency",
    summary: "Identical starting buying power for all teams. No debt, leverage, or margin borrowing.",
    details:
      "All student desks receive an identical starting balance of $100,000.00 USD at the opening bell. Equities may only be acquired using cleared, available cash. Margin lending, borrowing against securities, and overdrafts are disabled. Maintaining dry powder reserves allows teams to capitalize on sudden macroeconomic market sell-offs.",
    tags: ["Spot Cash", "Zero Debt", "Full Solvency"],
  },
  {
    id: "news-impact",
    number: "03",
    category: "Execution & Valuation",
    badge: "HIGH-IMPACT CATALYSTS",
    icon: Zap,
    metric: "Impact Window: ~10s",
    metricHighlight: "Multi-Percent Surge",
    title: "Macroeconomic Catalyst Shockwaves",
    summary: "Breaking news bulletins trigger sharp multi-percent price swings over ~10-second waves.",
    details:
      "Breaking news bulletins published on the exchange wire act as immediate price catalysts. Positive clinical readouts or earnings beats can spike a stock by +4% to +12%, while regulatory sanctions or supply shocks trigger steep sell-offs. Price reactions unfold over 10-second organic waves, giving vigilant desks a vital trading window.",
    tags: ["News Wire", "Wave Propagation", "Volatility"],
  },
  {
    id: "micro-ticks",
    number: "04",
    category: "Execution & Valuation",
    badge: "CONTINUOUS MOMENTUM",
    icon: Activity,
    metric: "Tick Speed: Sub-Second",
    metricHighlight: "Autonomous Discovery",
    title: "Continuous Autonomous Price Discovery",
    summary: "Markets never sit still. Autonomous micro-ticks reward tape reading and disciplined entry.",
    details:
      "Between major news bulletins, the simulated stock exchange continues active price discovery with continuous micro-ticks, minor momentum swings, and realistic liquidity pullbacks across all active sectors. Watching price action on the tape rewards calculated timing over impulsive speculation.",
    tags: ["Autonomous Engine", "Micro-Ticks", "Momentum"],
  },
  {
    id: "execution",
    number: "05",
    category: "Capital & Solvency",
    badge: "TRADING MECHANICS",
    icon: Scale,
    metric: "Slippage: 0.0%",
    metricHighlight: "Instant Settlement",
    title: "Spot Execution & Long-Only Holdings",
    summary: "Trade only what you own. Orders fill immediately at the live quote with zero slippage.",
    details:
      "All buy and sell orders execute instantly at the prevailing market price with zero execution lag or hidden commissions. Desks may only sell shares currently held in their active portfolio inventory—naked short selling is disabled. Cash balances and share quantities are validated and settled atomically.",
    tags: ["Instant Fill", "Long-Only", "Atomic Settlement"],
  },
  {
    id: "scoring",
    number: "06",
    category: "Execution & Valuation",
    badge: "TOURNAMENT RANKING",
    icon: ShieldCheck,
    metric: "Auditorium Feed: Live 4K",
    metricHighlight: "Total Net Worth",
    title: "Total Portfolio Net Worth Valuation",
    summary: "Final leaderboard standings are determined strictly by total marked-to-market net worth.",
    details:
      "Rankings stream live on the auditorium 4K projector screen throughout the event. A desk's ranking equals Cleared Cash + Total Current Market Value of all held shares (Shares × Current Market Price). The desk with the highest verified portfolio net worth at the closing bell wins the championship.",
    tags: ["Live Leaderboard", "Mark-to-Market", "Official Trophy"],
  },
];

/* ─────────────────────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────────────────── */

export default function RulesSection() {
  const [activeCategory, setActiveCategory] = useState("All Protocols");
  const [expandedId, setExpandedId] = useState("single-device");

  const filteredRules =
    activeCategory === "All Protocols"
      ? RULES_ARTICLES
      : RULES_ARTICLES.filter((r) => r.category === activeCategory);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden"
      id="rules"
    >
      {/* Soft ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-cream-muted filter blur-[150px] opacity-[0.03] dark:opacity-[0.025] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-14 relative z-10">
        {/* Section Header with Scroll-triggered Fade */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-maroon-subtle/80 border border-border-brown/80 backdrop-blur-md shadow-xs mb-4">
            <Lock className="w-3.5 h-3.5 text-accent-green-bright" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cream-light font-medium">
              Exchange Governance • Fair Play Charter
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4 text-balance">
            The Trading Floor Rules
          </h2>

          <p className="text-cream-muted/80 text-base sm:text-lg max-w-2xl font-normal font-sans text-balance leading-relaxed">
            Six institutional mandates enforced by the exchange ledger to guarantee equal execution
            footing, zero-debt solvency, and an authentic trading arena showdown.
          </p>
        </motion.div>

        {/* Top 3 Featured Protocol Bento Highlight Cards (Scroll-based Load) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Bento 1: Hardware Binding (6 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-6 rounded-2xl bg-gradient-to-b from-maroon-subtle/80 to-maroon-subtle/40 border border-border-brown/70 p-6 sm:p-7 flex flex-col justify-between hover:border-border-brown/95 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Laptop className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-medium uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Article 01 • Security</span>
                </div>
              </div>

              <div className="font-mono text-xs text-cream-muted/60 uppercase tracking-wider mb-1">
                Hardware Binding Protocol
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-cream-light font-medium mb-3">
                1 Device Per Desk
              </h3>
              <p className="text-xs sm:text-sm text-cream-muted/80 leading-relaxed font-sans mb-6">
                Each team operates strictly through one physical terminal. The exchange token locks to
                the primary device to prohibit distributed multi-user order splitting.
              </p>
            </div>

            <div className="pt-4 border-t border-border-brown/40 flex items-center justify-between text-xs font-mono">
              <span className="text-cream-muted/60">Session Binding:</span>
              <span className="text-amber-400 font-semibold">Verified Hardware Lock</span>
            </div>
          </motion.div>

          {/* Bento 2: $100,000 Liquid Solvency (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-3 rounded-2xl bg-gradient-to-b from-maroon-subtle/80 to-maroon-subtle/40 border border-border-brown/70 p-6 flex flex-col justify-between hover:border-border-brown/95 transition-all shadow-md group"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-accent-green/20 border border-accent-green/40 flex items-center justify-center text-accent-green-bright mb-5 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5 stroke-[2]" />
              </div>

              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                Cleared Buying Power
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-cream-light mb-2">
                $100,000
              </div>
              <p className="text-xs text-cream-muted/75 leading-relaxed font-sans mb-4">
                Strict spot solvency. Zero margin debt or short borrowing allowed.
              </p>
            </div>

            <div className="pt-3 border-t border-border-brown/40 font-mono text-[11px] text-accent-green-bright flex items-center gap-1.5">
              <span>●</span> Leverage: 1.0x Spot
            </div>
          </motion.div>

          {/* Bento 3: Macro Catalyst Shockwaves (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-3 rounded-2xl bg-gradient-to-b from-maroon-subtle/80 to-maroon-subtle/40 border border-border-brown/70 p-6 flex flex-col justify-between hover:border-border-brown/95 transition-all shadow-md group"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 stroke-[2]" />
              </div>

              <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                News Impact Engine
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-cream-light mb-2">
                10s Waves
              </div>
              <p className="text-xs text-cream-muted/75 leading-relaxed font-sans mb-4">
                Catalyst bulletins trigger multi-percent swings across live market sectors.
              </p>
            </div>

            <div className="pt-3 border-t border-border-brown/40 font-mono text-[11px] text-red-400 flex items-center gap-1.5">
              <span>●</span> High-Impact Waves
            </div>
          </motion.div>
        </div>

        {/* Category Navigation Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 flex-wrap"
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all cursor-pointer",
                  isActive
                    ? "bg-cream-muted text-maroon-base font-semibold shadow-sm scale-105"
                    : "bg-maroon-subtle/70 text-cream-muted/80 hover:text-cream-light hover:bg-maroon-subtle border border-border-brown/60"
                )}
              >
                {category}
              </button>
            );
          })}
        </motion.div>

        {/* Comprehensive Interactive Articles Matrix (Scroll-Based Load) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRules.map((rule, idx) => {
              const isExpanded = expandedId === rule.id;
              const Icon = rule.icon;

              return (
                <motion.div
                  layout
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between",
                    isExpanded
                      ? "bg-maroon-subtle/85 dark:bg-maroon-base/90 border-border-brown/90 shadow-xl ring-1 ring-cream-light/10"
                      : "bg-maroon-subtle/40 dark:bg-maroon-subtle/25 border-border-brown/50 hover:border-border-brown/80 hover:bg-maroon-subtle/60"
                  )}
                >
                  <div className="p-5 sm:p-6">
                    {/* Header line: Number, Badge, and Metric */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-cream-muted/50 bg-maroon-subtle/80 px-2 py-0.5 rounded border border-border-brown/40">
                          {rule.number}
                        </span>
                        <span className="font-mono text-[10px] text-cream-muted/70 uppercase tracking-wider">
                          {rule.badge}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-maroon-subtle/80 border border-border-brown/50 text-accent-green-bright font-medium">
                        {rule.metricHighlight}
                      </span>
                    </div>

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3.5 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-maroon-subtle/90 border border-border-brown/70 flex items-center justify-center text-cream-light shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl text-cream-light font-normal leading-snug">
                        {rule.title}
                      </h4>
                    </div>

                    {/* Summary */}
                    <p className="text-xs sm:text-[13px] text-cream-muted/80 leading-relaxed font-sans mb-3 pl-12.5">
                      {rule.summary}
                    </p>

                    {/* Expandable Clause Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden pl-12.5"
                        >
                          <div className="pt-3 pb-2 text-xs text-cream-muted/75 leading-relaxed font-sans border-t border-border-brown/40 mt-3">
                            <p className="mb-3">{rule.details}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {rule.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-maroon-base/80 border border-border-brown/50 text-cream-muted/60"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Toggle inspect button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(rule.id)}
                    className="w-full px-5 py-2.5 border-t border-border-brown/40 bg-maroon-base/40 hover:bg-maroon-subtle/50 text-cream-muted hover:text-cream-light text-[11px] font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Official Clause" : "Inspect Full Protocol Clause"}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isExpanded && "rotate-180 text-cream-light"
                      )}
                    />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Institutional Valuation Standard Console Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl sm:rounded-3xl bg-maroon-subtle/50 dark:bg-maroon-base/85 border border-border-brown/70 p-6 sm:p-8 relative overflow-hidden shadow-lg backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cream-muted/60 uppercase tracking-widest">
                <Calculator className="w-4 h-4 text-accent-green-bright" />
                <span>Auditorium Mark-to-Market Valuation Standard</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-cream-light font-normal tracking-tight">
                Net Worth = Cash + Σ (Shares × Live Price)
              </h3>
              <p className="text-xs sm:text-sm text-cream-muted/75 font-sans leading-relaxed">
                Rankings update continuously in sub-second cycles on the central auditorium 4K
                projector display. Trades execute and settle instantaneously with verified ledger audits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-xl bg-maroon-base/80 border border-border-brown/60 text-left">
                <span className="block font-mono text-[10px] text-cream-muted/50 uppercase">
                  Projector Feed
                </span>
                <span className="font-mono text-xs font-semibold text-accent-green-bright flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="px-4 py-3 rounded-xl bg-maroon-base/80 border border-border-brown/60 text-left">
                <span className="block font-mono text-[10px] text-cream-muted/50 uppercase">
                  Closing Bell Audit
                </span>
                <span className="font-mono text-xs font-semibold text-cream-light mt-0.5">
                  Automated Net Worth
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
