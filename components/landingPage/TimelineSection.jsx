"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  KeyRound,
  Zap,
  PauseCircle,
  Flame,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Radio,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   COMPETITION PHASES DATA
   ─────────────────────────────────────────────────────── */

const TIMELINE_PHASES = [
  {
    id: "phase-1",
    phaseNumber: "01",
    time: "09:30 AM",
    duration: "45 MIN",
    title: "Market Open & Capital Allocation",
    stageName: "Floor Calibration",
    status: "Completed",
    icon: KeyRound,
    volatilityLevel: "Low (Positioning)",
    volatilityColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    governanceStatus: "Hardware Binding • Passcodes Verified",
    summary:
      "Desks authenticate their hardware terminals, claim their $100,000 initial capital, and analyze initial sector quotes.",
    tacticalBriefing:
      "At 09:30 AM sharp, the competition arena opens. Each team enters their credentials and individual secret activation key to bind their designated physical terminal. Desks verify their $100,000 spot cash balance, inspect the 10 active market sectors, and formulate baseline allocation strategies before the first news bulletin breaks.",
    floorDirectives: [
      "Hardware Terminal Bind & Director Sign-In Approval",
      "Initial Sector Assessment across Tech, Pharma, Energy, Finance",
      "Establish initial cash reserves ('dry powder') for incoming catalysts",
    ],
    catalystExpectation: "Baseline autonomous price ticks only; zero breaking news releases.",
  },
  {
    id: "phase-2",
    phaseNumber: "02",
    time: "10:15 AM",
    duration: "75 MIN",
    title: "Round 1: First Volatility Wave",
    stageName: "Active Trading Floor",
    status: "Live Arena",
    icon: Zap,
    volatilityLevel: "High (±4% to ±8%)",
    volatilityColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    governanceStatus: "Continuous Tape Active • News Wire Live",
    summary:
      "Initial breaking news bulletins flash across the News Wire, triggering multi-percent sector rotations.",
    tacticalBriefing:
      "The opening news wave hits the floor. Macroeconomic bulletins, biotech FDA trial outcomes, and tech earnings announcements shock equities with rapid 10-second price waves. Desks with superior reaction speeds capitalize on rapid mispricings before the autonomous engine absorbs the shock.",
    floorDirectives: [
      "Monitor the Live News Wire for immediate high-beta opportunities",
      "Deploy capital into positive catalysts; hedge or exit deteriorating sectors",
      "Maintain portfolio diversification to absorb unexpected sector pullbacks",
    ],
    catalystExpectation: "3 to 5 breaking bulletins targeting individual equities and sectors.",
  },
  {
    id: "phase-3",
    phaseNumber: "03",
    time: "11:30 AM",
    duration: "45 MIN",
    title: "Half-Time Solvency Audit & Standings Unveil",
    stageName: "Trading Freeze",
    status: "Scheduled",
    icon: PauseCircle,
    volatilityLevel: "Frozen (0.0% Movement)",
    volatilityColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    governanceStatus: "Trading Halted • Audit Reconciliation",
    summary:
      "The exchange halts order submission. The central auditorium 4K screen reveals official half-time standings.",
    tacticalBriefing:
      "Trading is paused across all desks. The central clearing engine runs an automated audit verifying zero debt and exact cash/share reconciliations. Half-time rankings flash across the auditorium 4K projector, giving teams 45 minutes to analyze their relative standing and recalibrate strategies for the high-stakes final round.",
    floorDirectives: [
      "Order entry frozen; review marked-to-market performance",
      "Analyze auditor rankings and calculate performance delta to the leaders",
      "Formulate aggressive catch-up or defensive preservation tactics for Round 2",
    ],
    catalystExpectation: "Zero news catalysts. The tape is locked for audit verification.",
  },
  {
    id: "phase-4",
    phaseNumber: "04",
    time: "12:15 PM",
    duration: "75 MIN",
    title: "Round 2: High-Impact Macro Shocks",
    stageName: "Peak Volatility",
    status: "Scheduled",
    icon: Flame,
    volatilityLevel: "Extreme (±8% to ±14%)",
    volatilityColor: "text-red-400 bg-red-500/10 border-red-500/20",
    governanceStatus: "Continuous Tape Active • Rapid News Velocity",
    summary:
      "Cross-sector geopolitical and macroeconomic shocks test risk management under institutional pressure.",
    tacticalBriefing:
      "The most intense phase of the competition. High-velocity news bulletins fire with shorter intervals, triggering cascading rallies and steep sell-offs. Trailing desks take calculated risks to close the valuation gap, while leading teams must defend their margins against sudden Black Swan events.",
    floorDirectives: [
      "Manage peak volatility and avoid catastrophic drawdown traps",
      "Liquidate underperforming assets before sector contagion spreads",
      "Execute rapid spot orders to lock in multi-percent gains",
    ],
    catalystExpectation: "Rapid-fire cross-sector news shocks with high price volatility.",
  },
  {
    id: "phase-5",
    phaseNumber: "05",
    time: "01:30 PM",
    duration: "30 MIN",
    title: "Closing Bell & Final Valuation Certification",
    stageName: "Championship Audit",
    status: "Scheduled",
    icon: Trophy,
    volatilityLevel: "Settled (Terminal Quote)",
    volatilityColor: "text-accent-green-bright bg-accent-green/20 border-accent-green/30",
    governanceStatus: "Exchange Closed • Final Certification",
    summary:
      "Trading closes permanently. Total marked-to-market portfolio net worth certifies the tournament champion.",
    tacticalBriefing:
      "The ceremonial closing bell sounds. All active trading sessions terminate instantly. The exchange ledger marks every held share to the final closing tick, adds available cash balances, and generates the certified tournament leaderboard for the awards ceremony.",
    floorDirectives: [
      "Final orders conclude; portfolio holdings freeze automatically",
      "Automated calculation of Total Net Worth = Cash + Marked Equities",
      "Official awards ceremony and trophy presentation for top-performing desks",
    ],
    catalystExpectation: "Markets closed. Final prices locked for historical ledger.",
  },
];

/* ─────────────────────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────────────────── */

export default function TimelineSection() {
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(1); // Default to Round 1 (Live Arena)
  const currentPhase = TIMELINE_PHASES[selectedPhaseIndex];
  const IconComponent = currentPhase.icon;

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden"
      id="timeline"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-cream-muted filter blur-[140px] opacity-[0.035] dark:opacity-[0.025] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-14 relative z-10">
        {/* Section Header with Scroll-based Entry */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-maroon-subtle/80 border border-border-brown/80 backdrop-blur-md shadow-xs mb-4">
            <Clock className="w-3.5 h-3.5 text-accent-green-bright" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cream-light font-medium">
              Event Architecture • Chronological Order
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4 text-balance">
            The Competition Timeline
          </h2>

          <p className="text-cream-muted/80 text-base sm:text-lg max-w-2xl font-normal font-sans text-balance leading-relaxed">
            Five synchronized operational phases spanning the opening bell to the final certified net
            worth audit. Explore each phase&apos;s directives and volatility profile below.
          </p>
        </motion.div>

        {/* Phase Navigator Bar (Desktop & Mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl sm:rounded-3xl bg-maroon-subtle/60 dark:bg-maroon-base/80 border border-border-brown/70 p-2 sm:p-3 backdrop-blur-xl shadow-lg overflow-x-auto scrollbar-none"
        >
          <div className="grid grid-cols-5 gap-2 min-w-[620px] sm:min-w-0">
            {TIMELINE_PHASES.map((phase, idx) => {
              const isSelected = selectedPhaseIndex === idx;
              const PhaseIcon = phase.icon;

              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setSelectedPhaseIndex(idx)}
                  className={cn(
                    "flex flex-col items-start p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 text-left cursor-pointer relative",
                    isSelected
                      ? "bg-maroon-subtle dark:bg-maroon-subtle/90 border border-border-brown shadow-md scale-[1.02] ring-1 ring-cream-light/10"
                      : "hover:bg-maroon-subtle/40 border border-transparent text-cream-muted/70 hover:text-cream-light"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        isSelected ? "text-accent-green-bright" : "text-cream-muted/50"
                      )}
                    >
                      {phase.phaseNumber}
                    </span>
                    <span className="font-mono text-[10px] text-cream-muted/60">{phase.time}</span>
                  </div>

                  <span
                    className={cn(
                      "font-serif text-sm sm:text-base font-normal line-clamp-1 mb-1",
                      isSelected ? "text-cream-light font-medium" : "text-cream-muted/80"
                    )}
                  >
                    {phase.stageName}
                  </span>

                  <div className="flex items-center gap-1.5 mt-auto">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        phase.status === "Live Arena"
                          ? "bg-accent-green-bright animate-pulse"
                          : phase.status === "Completed"
                          ? "bg-cream-muted/40"
                          : "bg-amber-400/60"
                      )}
                    />
                    <span className="text-[10px] font-mono text-cream-muted/60 tracking-tight">
                      {phase.duration}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Phase Tactical Briefing Console (Interactive Spotlight Card) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-3xl bg-gradient-to-b from-maroon-subtle/90 to-maroon-subtle/50 dark:from-maroon-base/90 dark:to-maroon-base/70 border border-border-brown/80 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl ring-1 ring-cream-light/5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left Details Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                <div>
                  {/* Phase Eyebrow & Badges */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-base/80 border border-border-brown text-xs font-mono">
                      <span className="font-bold text-accent-green-bright">
                        PHASE {currentPhase.phaseNumber}
                      </span>
                      <span className="text-border-brown">•</span>
                      <span className="text-cream-light">{currentPhase.time}</span>
                    </div>

                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-mono font-medium border",
                        currentPhase.volatilityColor
                      )}
                    >
                      {currentPhase.volatilityLevel}
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-maroon-base/60 border border-border-brown/60 text-[10px] font-mono text-cream-muted/70">
                      Duration: {currentPhase.duration}
                    </div>
                  </div>

                  {/* Title & Tactical Briefing */}
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-cream-light font-normal tracking-tight mb-4">
                    {currentPhase.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-cream-muted/85 leading-relaxed font-sans mb-6">
                    {currentPhase.tacticalBriefing}
                  </p>
                </div>

                {/* Floor Directives Checklist */}
                <div className="p-4 sm:p-5 rounded-2xl bg-maroon-base/70 dark:bg-maroon-base/90 border border-border-brown/60">
                  <div className="font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-green-bright" />
                    <span>Tactical Directives for Competing Desks</span>
                  </div>
                  <ul className="space-y-2 font-sans text-xs sm:text-[13px] text-cream-muted/80">
                    {currentPhase.floorDirectives.map((directive, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="font-mono text-accent-green-bright text-xs shrink-0 mt-0.5">
                          0{i + 1}.
                        </span>
                        <span>{directive}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Technical Status Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-maroon-base/50 dark:bg-maroon-base/70 border border-border-brown/60">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-brown/40">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-maroon-subtle flex items-center justify-center text-cream-light border border-border-brown">
                        <IconComponent className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-cream-light uppercase">
                        Floor Status
                      </span>
                    </div>
                    <span className="font-mono text-xs text-accent-green-bright flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse" />
                      {currentPhase.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-cream-muted/50 uppercase tracking-wider">
                      Governance Protocol
                    </span>
                    <span className="font-mono text-xs text-cream-light font-medium">
                      {currentPhase.governanceStatus}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-cream-muted/50 uppercase tracking-wider">
                      Expected News Volatility
                    </span>
                    <span className="font-mono text-xs text-cream-muted/85">
                      {currentPhase.catalystExpectation}
                    </span>
                  </div>
                </div>

                {/* Quick Interactive Floor Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-border-brown/40">
                  <Link
                    href="/dashboard"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#4d332f] to-[#36211e] hover:from-[#5c3e39] hover:to-[#402b28] border border-[#5f423d] text-cream-light text-xs font-sans font-semibold tracking-tight transition-all active:scale-95 shadow-sm"
                  >
                    <span>Desk Sign-In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/projector"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-maroon-subtle/80 hover:bg-maroon-subtle border border-border-brown text-cream-muted hover:text-cream-light text-xs font-mono transition-all active:scale-95"
                  >
                    <span>Auditorium 4K</span>
                    <ExternalLink className="w-3 h-3 text-cream-muted/60" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All 5 Chronological Stages Cards with Scroll-Based Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {TIMELINE_PHASES.map((stage, idx) => {
            const isCurrent = selectedPhaseIndex === idx;
            const StageIcon = stage.icon;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setSelectedPhaseIndex(idx)}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group",
                  isCurrent
                    ? "bg-maroon-subtle/80 dark:bg-maroon-base/90 border-border-brown/95 shadow-lg ring-1 ring-cream-light/10"
                    : "bg-maroon-subtle/35 dark:bg-maroon-subtle/20 border-border-brown/50 hover:border-border-brown/80 hover:bg-maroon-subtle/50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-cream-muted/50 group-hover:text-cream-light transition-colors">
                      {stage.phaseNumber}
                    </span>
                    <span className="font-mono text-[11px] text-cream-muted/70">{stage.time}</span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-maroon-subtle/90 border border-border-brown/60 flex items-center justify-center text-cream-light mb-3 group-hover:scale-105 transition-transform">
                    <StageIcon className="w-4 h-4 stroke-[2]" />
                  </div>

                  <h4 className="font-serif text-base sm:text-lg text-cream-light font-normal mb-1.5 leading-snug">
                    {stage.stageName}
                  </h4>

                  <p className="text-xs text-cream-muted/70 line-clamp-2 font-sans mb-3">
                    {stage.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-border-brown/30 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cream-muted/50">{stage.duration}</span>
                  <span className="text-cream-muted/80 group-hover:text-cream-light transition-colors">
                    Details →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
