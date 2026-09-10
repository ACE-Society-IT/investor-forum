"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Monitor,
  Shield,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles, 
  Radio,
  BookOpen,
  Trophy,
  ShieldCheck,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const marqueeStocks = [
    { ticker: "NVDA", price: 128.45, change: 4.82, positive: true },
    { ticker: "TSLA", price: 242.80, change: -2.35, positive: false },
    { ticker: "AAPL", price: 232.10, change: 1.24, positive: true },
    { ticker: "PLTR", price: 34.60, change: 6.40, positive: true },
    { ticker: "MSFT", price: 448.20, change: -0.85, positive: false },
    { ticker: "AMZN", price: 186.50, change: 2.10, positive: true },
    { ticker: "AMD", price: 154.30, change: -1.15, positive: false },
    { ticker: "META", price: 512.90, change: 3.45, positive: true }
  ];

  const tournamentRules = [
    {
      icon: DollarSign,
      title: "1. Starting Capital ($100,000)",
      desc: "Each team starts with $100,000 USD in virtual funds. Trade freely across Tech, Energy, Healthcare, and Finance equities."
    },
    {
      icon: TrendingUp,
      title: "2. Autonomous Market Waves",
      desc: "Stock prices fluctuate dynamically with macro market momentum, exhibiting natural higher-highs and pullback entry points."
    },
    {
      icon: Zap,
      title: "3. 10-Second News Shocks",
      desc: "Breaking news catalysts cause realistic +2% to +8% rallies or -2% to -8% dips, transitioning smoothly over 10 seconds."
    },
    {
      icon: Trophy,
      title: "4. Net Worth Scoring",
      desc: "Ranking is determined by Total Net Worth (Cash + Live Value of Held Shares). The highest audited portfolio at final bell wins."
    },
    {
      icon: ShieldCheck,
      title: "5. Zero Debt & Solvency",
      desc: "Short selling without shares is prohibited. Orders execute instantly with zero slippage and no overdraft balances allowed."
    },
    {
      icon: AlertTriangle,
      title: "6. Fair Play & Circuit Breakers",
      desc: "All transactions are cryptographically verified in database ledgers. Tampering leads to immediate disqualification."
    }
  ];

  const proTips = [
    {
      num: "01",
      title: "Hold Cash ('Dry Powder')",
      desc: "Keep 20–30% in cash to buy sudden news dips at bargain prices."
    },
    {
      num: "02",
      title: "Lock In Realized Profits",
      desc: "Sell a portion of shares after sharp +10% or +15% surges to secure gains."
    },
    {
      num: "03",
      title: "Avoid Peak FOMO",
      desc: "Don't buy at the top of a huge rally; wait for pullbacks or look for lagging stocks."
    },
    {
      num: "04",
      title: "Diversify Across Sectors",
      desc: "Hold 3–5 non-correlated sectors so one bad headline won't wipe your portfolio."
    }
  ];

  const features = [
    {
      title: "Participant Desk & Real-Time Orders",
      desc: "Instant BUY and SELL orders with sub-second WebSocket database sync, continuous margin verification, and instant portfolio ledger valuation.",
      icon: TrendingUp,
      route: "/dashboard",
      badge: "Student Workspace",
      actionText: "Open Trading Desk"
    },
    {
      title: "Auditorium Broadcast Stage",
      desc: "Designed for 4K projector displays. Autonomous 30-second cycle between Top 10 Leaderboard podiums, Market Heatmaps, and AI Breaking News Flashes.",
      icon: Monitor,
      route: "/projector",
      badge: "Auditorium Projector",
      actionText: "Launch 4K Screen"
    },
    {
      title: "AI News Shocks Engine",
      desc: "Autonomous AI market analyst broadcasting macroeconomic shocks, breaking geopolitical updates, and calculating sector volatility in real time.",
      icon: Zap,
      route: "/dashboard",
      badge: "AI Market Engine",
      actionText: "Inspect AI Feed"
    },
    {
      title: "Director Command Center",
      desc: "Administrative control center for live price overrides, circuit breakers, team disqualifications, round timers, and confidential victory reveals.",
      icon: Shield,
      route: "/admin",
      badge: "Organizer Suite",
      actionText: "Director Portal"
    }
  ];

  const tournamentSteps = [
    {
      step: "01",
      title: "Team Desk Check-In",
      desc: "Syndicates sign in securely with their unique credentials and starting liquidity balance of $100,000 USD."
    },
    {
      step: "02",
      title: "High-Frequency Execution",
      desc: "Analyze price action, bid/ask spreads, and sparkline momentum. Build a high-yield portfolio across Tech, Energy, and Finance."
    },
    {
      step: "03",
      title: "AI Shock Reactivity",
      desc: "React instantly to breaking macroeconomic flashes that trigger realistic price elasticity swings."
    },
    {
      step: "04",
      title: "Championship Reveal",
      desc: "Live podium reveal on the main auditorium stage with net worth calculations, PnL ratios, and verified tournament rankings."
    }
  ];

  const faqs = [
    {
      q: "How does the live trading simulation work?",
      a: "Every team receives a starting balance of $100,000 in virtual capital. Teams execute real-time market orders against dynamic live prices that fluctuate continuously based on market momentum and AI breaking news shocks."
    },
    {
      q: "How does the AI calculate market impact?",
      a: "When breaking news is broadcast, our serverless AI engine analyzes sentiment, identifies affected market sectors, and applies realistic price elasticity delta curves across equities."
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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805] relative overflow-x-hidden">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="glow-ambient w-[600px] h-[600px] bg-[#402b28]/35 top-[-150px] left-[-150px] animate-pulse-slow" />
      <div className="glow-ambient w-[550px] h-[550px] bg-[#303d37]/25 top-[20%] right-[-120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="glow-ambient w-[650px] h-[650px] bg-[#1b0805]/40 top-[45%] left-[-180px] animate-pulse-slow" style={{ animationDelay: "3s" }} />
      <div className="glow-ambient w-[700px] h-[700px] bg-[#eae0d3]/15 bottom-[10%] right-[-200px] animate-pulse-slow" style={{ animationDelay: "4s" }} />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none" />

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
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#402b28] text-[#f8f4ed] dark:bg-[#303d37] dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]">
                  ACE SOCIETY IT
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
            <a href="#rules" className="hover:text-[var(--text-primary)] transition-colors">Tournament Rules</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How to Play</a>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
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
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-semibold shadow-[0_0_0_1px_var(--border-color)] active:scale-95 transition-all duration-150"
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
          <Sparkles className="w-3.5 h-3.5 text-[#eae0d3] dark:text-[#eae0d3]" />
          <span className="text-[var(--text-primary)] font-semibold">Live AI Market Shocks</span>
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
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold text-sm shadow-[0_4px_20px_rgba(64,43,40,0.4)] dark:shadow-[0_4px_20px_rgba(234,224,211,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2.5"
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
            <Monitor className="w-4 h-4 text-[#eae0d3] dark:text-[#eae0d3]" />
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
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">AI Shock Engine</span>
            <span className="text-lg sm:text-xl font-bold text-[#402b28] dark:text-[#eae0d3] mt-1 block tnum">Neural Matrix</span>
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
          <span className="text-xs font-mono uppercase text-[#402b28] dark:text-[#eae0d3] font-semibold tracking-wider">
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
              <div className="w-2.5 h-2.5 rounded-full bg-[#eae0d3]" />
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
                  <span className="font-bold text-[#402b28] dark:text-[#eae0d3] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>AI News Flash</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#402b28]/10 dark:bg-[#eae0d3]/10 text-[#402b28] dark:text-[#eae0d3]">Live Reaction</span>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] font-sans">
                    &ldquo;Global Semiconductor Alliance announces breakthrough in 2nm foundry yields.&rdquo;
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
                    AI Engine predicts +5.2% sector shockwave across hardware manufacturers.
                  </p>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-[var(--text-muted)] flex justify-between">
                <span>Engine: Institutional AI</span>
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
                    <span className="w-4 h-4 rounded-full bg-[var(--surface-3)] text-center text-[10px] font-bold text-[#402b28] dark:text-[#eae0d3]">
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
          <span className="text-xs font-mono uppercase text-[#402b28] dark:text-[#eae0d3] font-semibold tracking-wider">
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
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="vercel-card rounded-2xl p-7 border border-[var(--border-color)] hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-center text-[#402b28] dark:text-[#eae0d3] group-hover:scale-110 transition-transform duration-150">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#402b28] dark:group-hover:text-[#eae0d3] transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                    {f.desc}
                  </p>
                </div>

                <Link
                  href={f.route}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)] hover:text-[#402b28] dark:hover:text-[#eae0d3] transition-colors pt-4 border-t border-[var(--border-color)]"
                >
                  <span>{f.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Official Tournament Rules & Student Guide */}
      <section id="rules" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-xs font-mono text-[var(--text-secondary)] mb-4">
            <BookOpen className="w-3.5 h-3.5 text-[#402b28] dark:text-[#eae0d3]" />
            <span className="text-[var(--text-primary)] font-semibold">Official Rulebook</span>
            <span className="text-[var(--text-tertiary)]">•</span>
            <span>Collegiate Trading Standards</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Tournament Rules & Market Guidelines
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto mt-3">
            Every team operates under strict institutional solvency rules, real-time market momentum, and autonomous AI macroeconomic catalysts.
          </p>
        </div>

        {/* 6 Core Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {tournamentRules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="vercel-card rounded-2xl p-6 border border-[var(--border-color)] hover:border-[#402b28]/40 dark:hover:border-[#eae0d3]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-center text-[#402b28] dark:text-[#eae0d3] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 font-sans">
                    {rule.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro Tips / Strategy Playbook Box */}
        <div className="rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[#402b28]/5 via-transparent to-[#402b28]/10 dark:from-[#eae0d3]/5 dark:via-transparent dark:to-[#eae0d3]/10 p-6 sm:p-10 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2.5 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-sans">
              Student Strategy Playbook (How to Win)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
            {proTips.map((tip) => (
              <div key={tip.num} className="p-4 rounded-xl bg-white/70 dark:bg-[#251c19]/70 border border-[var(--border-color)] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {tip.num}
                  </span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{tip.title}</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-8">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Tournament Flow / How It Works */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase text-[#402b28] dark:text-[#eae0d3] font-semibold tracking-wider">
            Tournament Roadmap
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mt-2">
            Four Steps to the Championship Podium
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {tournamentSteps.map((step) => (
            <div key={step.step} className="p-6 rounded-2xl vercel-card border border-[var(--border-color)] relative">
              <span className="text-3xl font-black text-[#402b28]/40 dark:text-[#eae0d3]/30 block mb-3">{step.step}</span>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 font-sans">{step.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 max-w-4xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-[#402b28] dark:text-[#eae0d3] font-semibold tracking-wider">
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
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-[var(--text-primary)] hover:text-[#402b28] dark:hover:text-[#eae0d3] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#402b28] dark:text-[#eae0d3]" : "text-[var(--text-secondary)]"}`} />
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
          <div className="glow-ambient w-96 h-96 bg-[#402b28]/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight relative z-10">
            Ready to Enter the Arena?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8 relative z-10">
            Launch your syndicate&apos;s trading desk now or project the live leaderboard onto the auditorium stage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 font-mono text-xs">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold text-sm shadow-[0_4px_20px_rgba(64,43,40,0.4)] dark:shadow-[0_4px_20px_rgba(234,224,211,0.25)] active:scale-95 transition-all"
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
            <a href="#rules" className="hover:text-[var(--text-primary)] transition-colors">Tournament Rules</a>
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
