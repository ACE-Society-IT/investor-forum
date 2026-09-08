"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import {
  TrendingUp,
  Activity,
  Shield,
  Monitor,
  Zap,
  Cpu,
  Award,
  ChevronDown,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  Flame,
  Globe2,
  Lock,
  Clock,
  Radio,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [simulatedTick, setSimulatedTick] = useState(0);

  // Simulated live ticker pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTick((prev) => (prev + 1) % 1000);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const marqueeStocks = [
    { ticker: "NVDA", name: "NVIDIA Corp", price: 128.45, change: +4.82, positive: true },
    { ticker: "AAPL", name: "Apple Inc", price: 232.10, change: +1.24, positive: true },
    { ticker: "TSLA", name: "Tesla Inc", price: 242.80, change: -2.35, positive: false },
    { ticker: "MSFT", name: "Microsoft", price: 448.90, change: +0.95, positive: true },
    { ticker: "PLTR", name: "Palantir Tech", price: 34.60, change: +6.40, positive: true },
    { ticker: "AMZN", name: "Amazon.com", price: 186.20, change: +1.65, positive: true },
    { ticker: "GOOGL", name: "Alphabet Inc", price: 179.30, change: -0.80, positive: false },
    { ticker: "META", name: "Meta Platforms", price: 512.40, change: +3.10, positive: true }
  ];

  const features = [
    {
      icon: Monitor,
      title: "Auditorium Stage Projector",
      badge: "4K Stage Screen",
      desc: "Designed for grand auditorium projection with automated cycling views, live leaderboard podium, marquee ticker tape, and breaking news banners.",
      route: "/projector",
      actionText: "Preview Projector"
    },
    {
      icon: TrendingUp,
      title: "Student Trading Floor",
      badge: "Sub-Second Orders",
      desc: "High-frequency trading terminal with dynamic portfolio valuation, localized SVG sparkline charts, and instant buy/sell solvency verification.",
      route: "/dashboard",
      actionText: "Enter Trading Floor"
    },
    {
      icon: Cpu,
      title: "Gemma AI News Reactor",
      badge: "Google AI Powered",
      desc: "Autonomous macroeconomic shock engine powered by Gemma-4-26b. Automatically evaluates breaking news sentiment and triggers sectoral market shocks.",
      route: "/admin",
      actionText: "Explore AI Engine"
    },
    {
      icon: Shield,
      title: "Admin Command Center",
      badge: "Organizer Suite",
      desc: "Full administrative control with emergency market circuit breakers, team disqualification controls, live stock pricing overrides, and news broadcasting.",
      route: "/admin",
      actionText: "Access Admin Console"
    }
  ];

  const tournamentSteps = [
    {
      step: "01",
      title: "Team Setup & Capital Allocation",
      desc: "Each competing syndicate receives $100,000.00 USD in starting simulated cash capital and secure access credentials."
    },
    {
      step: "02",
      title: "Market Open & Asset Discovery",
      desc: "Syndicates analyze sector weights, examine data room pitch decks, and build balanced multi-asset portfolios."
    },
    {
      step: "03",
      title: "Gemma AI Shockwaves & Black Swans",
      desc: "Live breaking economic news hits the wire. AI recalculates asset valuations in real time, testing team risk management."
    },
    {
      step: "04",
      title: "Market Close & Podium Ceremony",
      desc: "Trading halts instantly on organizer command. The auditorium projector displays the final championship podium."
    }
  ];

  const faqs = [
    {
      q: "How does real-time synchronization work without lag or flicker?",
      a: "The platform pairs Supabase Realtime WebSockets with optimized local state reconciliation and SVG ID isolation, allowing dozens of student devices and stage projectors to update simultaneously with zero visual stutter."
    },
    {
      q: "How does Google Gemma AI calculate market impact?",
      a: "When breaking news is broadcast, our serverless AI route calls the Google Gemma-4-26b-a4b-it model to analyze sentiment, identify affected market sectors, and apply realistic price elasticity delta curves across equities."
    },
    {
      q: "What anti-cheat and solvency protections are built-in?",
      a: "Every transaction undergoes client and database solvency validation: blocking negative or fractional share counts, disallowing short-selling without stock inventory, capping order sizes, and enforcing market freeze flags."
    },
    {
      q: "Can the auditorium projector run independently on a separate screen?",
      a: "Yes! Open `/projector` on any projector display or TV in full-screen mode (F11). It operates completely autonomously with automated cycling, live timekeeping, and real-time leaderboard polling."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-yellow)] selection:text-black relative overflow-x-hidden">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="glow-ambient w-[600px] h-[600px] bg-amber-500/15 top-[-150px] left-[-150px] animate-pulse-slow" />
      <div className="glow-ambient w-[550px] h-[550px] bg-yellow-500/10 top-[20%] right-[-120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="glow-ambient w-[700px] h-[700px] bg-emerald-500/10 bottom-[10%] left-[-200px] animate-pulse-slow" style={{ animationDelay: "4s" }} />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--canvas)]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.png"
              alt="Investor Forum Logo"
              className="h-11 sm:h-13 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-150 drop-shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">
                  INVESTOR FORUM
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Arena
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] hidden sm:block">
                High-Frequency Simulation Platform
              </span>
            </div>
          </Link>

          {/* Navigation Anchors & Quick Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">Tournament Flow</a>
            <a href="#architecture" className="hover:text-[var(--text-primary)] transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
          </nav>

          {/* Actions & Launch CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
            <ThemeToggle />

            <Link
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Projector ↗</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[var(--accent-yellow)] text-black font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.15)] hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              <span>Launch Floor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-14 pb-12 sm:pt-24 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-xs font-mono text-[var(--text-secondary)] mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-[var(--text-primary)] font-semibold">Gemma-4-26b AI Shocks</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>Next.js 16 Realtime</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] max-w-5xl leading-[1.08] mb-6">
          Where High-Frequency Trading Meets Stadium Spectacle.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-10 font-normal">
          Simulate institutional equities, react in real time to autonomous AI macroeconomic news shocks, execute split-second orders with zero lag, and broadcast tournament standings live to 4K auditorium screens.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto font-mono text-xs">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[var(--accent-yellow)] text-black font-bold text-sm shadow-[0_4px_20px_rgba(250,204,21,0.35)] hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Enter Student Trading Floor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-semibold text-sm hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Monitor className="w-4 h-4 text-amber-500" />
            <span>Open Stage Projector</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </Link>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-16 w-full max-w-4xl font-mono text-left">
          <div className="p-4 rounded-xl vercel-card">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">Starting Capital</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1 block tnum">$100,000</span>
            <span className="text-[10px] text-emerald-500 mt-0.5 block">Allocated per Team</span>
          </div>

          <div className="p-4 rounded-xl vercel-card">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">Order Execution</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-500 mt-1 block tnum">&lt; 10ms</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">Zero-Lag WebSocket</span>
          </div>

          <div className="p-4 rounded-xl vercel-card">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">Gemma AI Engine</span>
            <span className="text-lg sm:text-xl font-bold text-amber-500 dark:text-yellow-400 mt-1 block tnum">26B Params</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">Macro Shock Waves</span>
          </div>

          <div className="p-4 rounded-xl vercel-card">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">Screen Modes</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1 block tnum">4K Stage + Desk</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">Auto-Cycling Sync</span>
          </div>
        </div>
      </section>

      {/* 3. Live Animated Market Ticker Banner */}
      <div className="w-full border-y border-[var(--border-color)] bg-[var(--surface-1)] py-2.5 overflow-hidden relative z-20">
        <div className="animate-marquee flex items-center gap-8 font-mono text-xs">
          {[...marqueeStocks, ...marqueeStocks, ...marqueeStocks].map((stock, i) => (
            <div key={`${stock.ticker}-${i}`} className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
              <span className="text-[var(--text-secondary)] tnum">${stock.price.toFixed(2)}</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  stock.positive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-[#ff5b4f]/10 text-[#ff5b4f]"
                }`}
              >
                {stock.positive ? "+" : ""}{stock.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Simulated Preview Deck */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-amber-500 font-semibold tracking-wider">
            Live Tournament Interface
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mt-2">
            Built for High-Stakes Institutional Action
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2">
            Experience the synchronized ecosystem spanning auditorium stages, student trading desks, and admin controls.
          </p>
        </div>

        {/* Mock Interactive Terminal Window */}
        <div className="vercel-card rounded-2xl p-1 sm:p-2 border border-[var(--border-color)] shadow-2xl overflow-hidden">
          {/* Top Bar of Window */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border-color)] rounded-t-xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5b4f]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#00d68f]" />
              <span className="text-[var(--text-muted)] text-[11px] ml-2 hidden sm:inline">
                investor-forum-terminal.io • LIVE FEED
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Market Open</span>
              </span>
              <span className="tnum font-bold text-[var(--text-primary)]">14:32:08 UTC</span>
            </div>
          </div>

          {/* Body of Terminal Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 sm:p-4 bg-[var(--canvas)]">
            {/* Left: Live Stock Watchlist */}
            <div className="p-4 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-primary)]">Equities Watchlist</span>
                <span className="text-[10px] text-[var(--text-muted)]">7 Assets Active</span>
              </div>
              <div className="space-y-2">
                {[
                  { ticker: "NVDA", price: "$128.45", change: "+4.82%", pos: true },
                  { ticker: "TSLA", price: "$242.80", change: "-2.35%", pos: false },
                  { ticker: "AAPL", price: "$232.10", change: "+1.24%", pos: true },
                  { ticker: "PLTR", price: "$34.60", change: "+6.40%", pos: true }
                ].map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="font-bold text-[var(--text-primary)]">{s.ticker}</span>
                    <span className="tnum text-[var(--text-secondary)]">{s.price}</span>
                    <span className={`text-[11px] font-bold ${s.pos ? "text-emerald-500" : "text-[#ff5b4f]"}`}>
                      {s.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Breaking AI News Flash */}
            <div className="p-4 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] font-mono text-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="font-bold text-amber-500 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Gemma AI News Flash</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">Live Reaction</span>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] font-sans">
                    &ldquo;Global Semiconductor Alliance announces breakthrough in 2nm foundry yields.&rdquo;
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
                    Gemma AI predicts +5.2% sector shockwave across hardware manufacturers.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-[var(--text-muted)] flex justify-between">
                <span>Model: gemma-4-26b-a4b-it</span>
                <span>Latency: 412ms</span>
              </div>
            </div>

            {/* Right: Tournament Podium Standings */}
            <div className="p-4 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-primary)]">Leaderboard Podium</span>
                <span className="text-[10px] text-emerald-500">Stage Sync</span>
              </div>
              <div className="space-y-2">
                {[
                  { rank: "1", team: "Alpha Traders", val: "$114,820", pnl: "+14.8%" },
                  { rank: "2", team: "Wall Street Wolves", val: "$108,450", pnl: "+8.4%" },
                  { rank: "3", team: "Quantum Fund", val: "$103,120", pnl: "+3.1%" },
                  { rank: "4", team: "Bullish Titans", val: "$98,700", pnl: "-1.3%" }
                ].map((t) => (
                  <div key={t.rank} className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)]">
                    <span className="w-4 h-4 rounded-full bg-[var(--surface-3)] text-center text-[10px] font-bold text-amber-500">
                      {t.rank}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[100px]">{t.team}</span>
                    <span className="tnum font-bold text-[var(--text-primary)]">{t.val}</span>
                    <span className={`text-[10px] ${t.pnl.startsWith("+") ? "text-emerald-500" : "text-[#ff5b4f]"}`}>
                      {t.pnl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Architectural Pillars (Features Grid) */}
      <section id="features" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase text-amber-500 font-semibold tracking-wider">
            Architecture & Components
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mt-2">
            Engineered for High-Pressure Arenas
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto mt-3">
            Four specialized modules working in seamless synchronization to deliver the ultimate collegiate finance tournament experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="vercel-card rounded-2xl p-7 border border-[var(--border-color)] hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-150">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-amber-500 dark:group-hover:text-yellow-400 transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                    {f.desc}
                  </p>
                </div>

                <Link
                  href={f.route}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)] hover:text-amber-500 transition-colors pt-4 border-t border-[var(--border-color)]"
                >
                  <span>{f.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Tournament Flow / How It Works */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase text-amber-500 font-semibold tracking-wider">
            Tournament Roadmap
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mt-2">
            Four Steps to the Championship Podium
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {tournamentSteps.map((step) => (
            <div key={step.step} className="p-6 rounded-2xl vercel-card border border-[var(--border-color)] relative">
              <span className="text-3xl font-black text-amber-500/40 block mb-3">{step.step}</span>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 font-sans">{step.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-amber-500 font-semibold tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-2">
            Tournament Rules & Technical Details
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={faq.q}
                className="vercel-card rounded-xl border border-[var(--border-color)] overflow-hidden transition-all duration-150"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-[var(--text-primary)] hover:text-amber-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : "text-[var(--text-secondary)]"}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 vercel-card border border-[var(--border-color)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)] text-center relative overflow-hidden shadow-2xl">
          <div className="glow-ambient w-96 h-96 bg-amber-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight relative z-10">
            Ready to Enter the Arena?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8 relative z-10">
            Launch your syndicate&apos;s trading desk now or project the live leaderboard onto the auditorium stage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 font-mono text-xs">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--accent-yellow)] text-black font-bold text-sm shadow-[0_4px_20px_rgba(250,204,21,0.4)] hover:bg-amber-400 active:scale-95 transition-all"
            >
              Launch Trading Floor →
            </Link>
            <Link
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-[var(--text-primary)] font-bold text-sm shadow-[0_0_0_1px_var(--border-color)] active:scale-95 transition-all"
            >
              Launch Auditorium Projector ↗
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-8 relative z-10 font-mono text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum" className="h-9 w-auto object-contain shrink-0" />
            <span>© 2026 Investor Forum Simulation Engine</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Trading Floor</Link>
            <Link href="/projector" className="hover:text-[var(--text-primary)] transition-colors">Auditorium Screen</Link>
            <a
              href="https://github.com/ACE-Society-IT/investor-forum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
