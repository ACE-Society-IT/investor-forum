"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Pill,
  Zap,
  ShoppingBag,
  Building2,
  Plane,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   SECTORS DATA (6 distinct market ecosystems)
   No volatility metrics as requested.
   ─────────────────────────────────────────────────────── */

const SECTORS = [
  {
    id: "tech",
    ticker: "$TECH",
    name: "AI & Technology",
    category: "GROWTH",
    badgeColor: "text-accent-green-bright bg-accent-green/20 border-accent-green/30",
    icon: Cpu,
    tagline: "Algorithmic momentum, silicon scarcity, and enterprise AI disruption.",
    beta: "1.65",
    catalysts: "GPU allocation news, Cloud earnings beats, Antitrust probes",
    stocks: [
      {
        ticker: "NVX",
        name: "NovaTech AI Corp",
        price: "145.50",
        change: "+3.93%",
        pos: true,
        points: [135, 138, 142, 140, 144, 145.5],
      },
      {
        ticker: "CLD",
        name: "Apex Cloud Systems",
        price: "82.00",
        change: "-3.53%",
        pos: false,
        points: [88, 86, 84, 85, 83, 82],
      },
      {
        ticker: "SEMI",
        name: "Hyperion Silicon",
        price: "135.60",
        change: "+5.60%",
        pos: true,
        points: [122, 126, 125, 130, 133, 135.6],
      },
    ],
  },
  {
    id: "pharma",
    ticker: "$PHRM",
    name: "Pharma & Biotech",
    category: "BINARY RISK",
    badgeColor: "text-[#ff5b4f] bg-[#ff5b4f]/10 border-[#ff5b4f]/20",
    icon: Pill,
    tagline: "Asymmetric volatility driven by clinical trials and FDA readouts.",
    beta: "2.10",
    catalysts: "Phase III trial results, FDA fast-tracks, Patent defense",
    stocks: [
      {
        ticker: "PHM",
        name: "PharmaCare Therapeutics",
        price: "210.00",
        change: "+6.06%",
        pos: true,
        points: [190, 195, 198, 204, 208, 210],
      },
      {
        ticker: "BIO",
        name: "Helix BioGenetics",
        price: "64.20",
        change: "+0.80%",
        pos: true,
        points: [62, 65, 63, 64, 63.8, 64.2],
      },
      {
        ticker: "ONCO",
        name: "Vanguard Oncology",
        price: "118.40",
        change: "-2.40%",
        pos: false,
        points: [124, 122, 120, 119, 117.5, 118.4],
      },
    ],
  },
  {
    id: "energy",
    ticker: "$ENRG",
    name: "Energy & Infrastructure",
    category: "CYCLICAL",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Zap,
    tagline: "Macro-sensitive capital goods influenced by grid demand and policy.",
    beta: "1.20",
    catalysts: "OPEC supply targets, Grid modernization, Subsidy bills",
    stocks: [
      {
        ticker: "VLT",
        name: "VoltGrid Energy",
        price: "95.80",
        change: "-6.08%",
        pos: false,
        points: [105, 104, 102, 98, 97, 95.8],
      },
      {
        ticker: "SOL",
        name: "AeroSolar Dynamics",
        price: "48.00",
        change: "+6.67%",
        pos: true,
        points: [42, 44, 45, 46, 47, 48],
      },
      {
        ticker: "HYDRO",
        name: "Neptune Clean Hydrogen",
        price: "72.30",
        change: "+1.85%",
        pos: true,
        points: [68, 69, 71, 70, 71.5, 72.3],
      },
    ],
  },
  {
    id: "fmcg",
    ticker: "$FMCG",
    name: "Consumer Goods & Retail",
    category: "DEFENSIVE",
    badgeColor: "text-cream-light bg-maroon-subtle/70 border-border-brown/60",
    icon: ShoppingBag,
    tagline: "Defensive portfolio anchors providing shelter during market swings.",
    beta: "0.75",
    catalysts: "CPI inflation reports, Supply freight rates, Retail consumer demand",
    stocks: [
      {
        ticker: "AUR",
        name: "Aura Luxury Brands",
        price: "124.00",
        change: "+3.33%",
        pos: true,
        points: [115, 118, 120, 122, 123, 124],
      },
      {
        ticker: "FDX",
        name: "PrimeFoods Global",
        price: "36.50",
        change: "-1.35%",
        pos: false,
        points: [38, 37.5, 37, 36.8, 36.6, 36.5],
      },
      {
        ticker: "BEV",
        name: "Atlas Beverage Corp",
        price: "58.90",
        change: "+0.65%",
        pos: true,
        points: [57, 57.5, 58, 58.2, 58.6, 58.9],
      },
    ],
  },
  {
    id: "finance",
    ticker: "$FINS",
    name: "Global Finance & Banking",
    category: "SYSTEMIC",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Building2,
    tagline: "Interest-rate sensitive lending, investment banking, and capital flow.",
    beta: "1.15",
    catalysts: "Central bank rate cuts, Treasury curve shifts, Credit default spreads",
    stocks: [
      {
        ticker: "APEX",
        name: "Apex Capital Holdings",
        price: "178.90",
        change: "+1.70%",
        pos: true,
        points: [172, 174, 173, 176, 177, 178.9],
      },
      {
        ticker: "STNL",
        name: "Sentinel Wealth Bank",
        price: "92.40",
        change: "+0.85%",
        pos: true,
        points: [90, 91, 91.5, 91.8, 92, 92.4],
      },
      {
        ticker: "CRE",
        name: "Sovereign Real Estate",
        price: "53.25",
        change: "-1.15%",
        pos: false,
        points: [55, 54.5, 54, 53.8, 53.5, 53.25],
      },
    ],
  },
  {
    id: "aero",
    ticker: "$AERO",
    name: "Aerospace & Defense",
    category: "MOMENTUM",
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    icon: Plane,
    tagline: "Long-cycle defense contracts, avionics tech, and satellite launches.",
    beta: "1.30",
    catalysts: "Government procurement awards, Orbital launches, Commercial backlogs",
    stocks: [
      {
        ticker: "AERO",
        name: "Vanguard Aerospace",
        price: "210.40",
        change: "+3.10%",
        pos: true,
        points: [198, 202, 204, 206, 208, 210.4],
      },
      {
        ticker: "ORBT",
        name: "Stratosphere Orbital",
        price: "84.20",
        change: "+4.45%",
        pos: true,
        points: [78, 80, 79, 82, 83, 84.2],
      },
      {
        ticker: "DEF",
        name: "Sentinel Defense Systems",
        price: "165.80",
        change: "-0.60%",
        pos: false,
        points: [168, 167, 166.5, 166, 166.2, 165.8],
      },
    ],
  },
];

// Tripled array to enable seamless, never-ending infinite wrap
const EXTENDED_SECTORS = [...SECTORS, ...SECTORS, ...SECTORS];

/* ─────────────────────────────────────────────────────────
   MINI SPARKLINE COMPONENT
   Smooth SVG bezier curves with positive/negative gradient fills
   ─────────────────────────────────────────────────────── */

function MiniSparkline({ points, pos, width = 72, height = 28, className }) {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const strokeColor = pos ? "#5fa886" : "#ff5b4f";
  const fillColor = pos ? "rgba(95, 168, 134, 0.15)" : "rgba(255, 91, 79, 0.15)";
  const gradientId = `spk-${pos ? "pos" : "neg"}-${points.join("-").slice(0, 6)}`;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - 4) + 2;
    const y = height - 4 - ((p - min) / range) * (height - 8);
    return { x, y };
  });

  const pathD = coords.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible select-none shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SECTOR CARD COMPONENT
   Expansive layout showing 3 equities per sector (no volatility)
   ─────────────────────────────────────────────────────── */

function SectorCard({ sector }) {
  const Icon = sector.icon;

  return (
    <div className="h-full rounded-2xl bg-maroon-subtle/50 border border-border-brown/60 hover:border-cream-muted/30 hover:bg-maroon-subtle/70 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)] select-none">
      <div>
        {/* Header Row: Icon + Ticker + Category */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-maroon-base/90 border border-border-brown/80 flex items-center justify-center text-cream-light shrink-0">
              <Icon className="w-5 h-5 text-cream-light stroke-[1.75]" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-cream-light tracking-wide block">
                {sector.ticker}
              </span>
              <span className="text-[11px] font-sans text-cream-muted/60">
                {sector.stocks.length} Liquid Assets
              </span>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider",
              sector.badgeColor
            )}
          >
            {sector.category}
          </span>
        </div>

        {/* Sector Title & Narrative Tagline */}
        <h3 className="font-serif text-2xl sm:text-3xl text-cream-light font-normal mb-2 tracking-tight">
          {sector.name}
        </h3>
        <p className="text-xs sm:text-[13px] text-cream-muted/75 leading-relaxed font-sans mb-6">
          {sector.tagline}
        </p>

        {/* 3 Underlying Equities */}
        <div className="space-y-2 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cream-muted/50 pb-1 flex items-center justify-between border-b border-border-brown/30">
            <span>Asset / Firm</span>
            <span>Live Price</span>
          </div>

          {sector.stocks.map((stock) => (
            <div
              key={stock.ticker}
              className="flex items-center justify-between p-2.5 rounded-xl bg-maroon-base/50 border border-border-brown/40 hover:border-border-brown/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-xs font-bold text-cream-light">
                  {stock.ticker}
                </span>
                <span className="text-xs text-cream-muted/70 truncate max-w-[130px] sm:max-w-[170px]">
                  {stock.name}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <MiniSparkline points={stock.points} pos={stock.pos} width={56} height={22} />
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-cream-light tnum">
                    ${stock.price}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5",
                      stock.pos ? "text-accent-green-bright" : "text-[#ff5b4f]"
                    )}
                  >
                    <span>{stock.pos ? "▲" : "▼"}</span>
                    <span>{stock.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Beta & Key News Catalysts (Zero Volatility Meter) */}
      <div className="pt-4 border-t border-border-brown/40 flex items-center justify-between text-[11px] font-mono text-cream-muted/60">
        <span className="truncate max-w-[240px] sm:max-w-[320px]">
          Catalysts: <span className="text-cream-muted/80">{sector.catalysts}</span>
        </span>
        <span className="text-cream-light font-bold shrink-0 ml-2">Beta: {sector.beta}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN CAROUSEL COMPONENT
   - Shows exactly 2 cards at a time (1 on mobile)
   - Clicking Left/Right advances by exactly 1 card
   - Never ends: loops infinitely and seamlessly
   ─────────────────────────────────────────────────────── */

export default function MarketSection() {
  const containerRef = useRef(null);

  // Start at the middle set of the tripled array so backwards navigation is infinite
  const startIndex = SECTORS.length;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [cardStepWidth, setCardStepWidth] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Measure card width + gap dynamically
  const updateMetrics = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const isDesktop = window.innerWidth >= 768;
    const gap = 24; // gap-6 in pixels

    if (isDesktop) {
      // 2 cards at a time: card width = (container - gap) / 2
      const cardWidth = (containerWidth - gap) / 2;
      setCardStepWidth(cardWidth + gap);
    } else {
      // 1 card at a time on mobile
      setCardStepWidth(containerWidth + gap);
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, [updateMetrics]);

  // Navigate right by 1 card
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  // Navigate left by 1 card
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // Infinite wrapping: reset index silently to middle set when reaching outer boundaries
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    if (currentIndex >= SECTORS.length * 2) {
      setCurrentIndex(currentIndex - SECTORS.length);
    } else if (currentIndex < SECTORS.length) {
      setCurrentIndex(currentIndex + SECTORS.length);
    }
  };

  // Current human-readable sector number (1 to 6)
  const activeSectorNumber = (currentIndex % SECTORS.length) + 1;

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden"
      id="sectors"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header with Carousel Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-3">
              The Trading Floor Sectors
            </h2>

            <p className="text-cream-muted/80 text-sm sm:text-base max-w-xl font-normal font-sans">
              Six liquid market ecosystems. Eighteen actively simulated equities.
              React to macro bulletins and rotate capital before the tape moves.
            </p>
          </div>

          {/* Carousel Navigation Controller */}
          <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
            {/* Step Counter */}
            <div className="font-mono text-xs text-cream-muted/70 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maroon-subtle/60 border border-border-brown/50">
              <span className="text-cream-light font-bold">
                0{activeSectorNumber}
              </span>
              <span>/</span>
              <span>0{SECTORS.length}</span>
            </div>

            {/* Left/Right Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Sector"
                className="w-10 h-10 rounded-full bg-maroon-subtle/80 hover:bg-maroon-subtle border border-border-brown/70 hover:border-cream-muted/40 flex items-center justify-center text-cream-light transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2]" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Sector"
                className="w-10 h-10 rounded-full bg-maroon-subtle/80 hover:bg-maroon-subtle border border-border-brown/70 hover:border-cream-muted/40 flex items-center justify-center text-cream-light transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Viewport Container (2 cards visible on desktop, 1 on mobile) */}
        <div ref={containerRef} className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{
              x: -currentIndex * cardStepWidth,
            }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 28,
              mass: 0.8,
            }}
            onAnimationComplete={handleAnimationComplete}
          >
            {EXTENDED_SECTORS.map((sector, index) => (
              <div
                key={`${sector.id}-${index}`}
                className="w-full md:w-[calc(50%-12px)] shrink-0"
              >
                <SectorCard sector={sector} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {SECTORS.map((sector, i) => {
            const isActive = i === activeSectorNumber - 1;
            return (
              <button
                key={sector.id}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  // Jump to target sector in the middle set
                  setCurrentIndex(SECTORS.length + i);
                }}
                aria-label={`Jump to ${sector.name}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  isActive
                    ? "w-8 bg-cream-light"
                    : "w-2 bg-border-brown hover:bg-cream-muted/40"
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
