import React from "react";

export default function MarketSection() {
  const sectors = [
    {
      ticker: "$PHRM",
      name: "Pharma & Healthcare",
      category: "HIGH VOLATILITY",
      description: "High-volatility sector influenced by clinical trials, regulations and patents.",
      sparkline: "M 0 20 L 25 12 L 40 24 L 60 5 L 80 18 L 100 8",
    },
    {
      ticker: "$TECH",
      name: "AI & Technology",
      category: "GROWTH",
      description: "Growth-oriented sector driven by innovation and technology developments.",
      sparkline: "M 0 24 L 20 20 L 45 16 L 65 19 L 85 8 L 100 4",
    },
    {
      ticker: "$ENRG",
      name: "Energy & Infrastructure",
      category: "CYCLICAL",
      description: "Value-oriented sector affected by supply shocks and raw material prices.",
      sparkline: "M 0 14 L 30 18 L 50 10 L 70 22 L 88 15 L 100 12",
    },
    {
      ticker: "$FMCG",
      name: "Consumer Retail",
      category: "DEFENSIVE",
      description: "Defensive sector designed to provide portfolio stability during market swings.",
      sparkline: "M 0 16 L 25 15 L 50 17 L 75 14 L 90 15 L 100 13",
    },
  ];

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"
      id="sectors"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3">
            The Market
          </h2>
          <p className="text-cream-muted text-base max-w-xl font-normal font-sans">
            Four sectors. Different risks. One objective.
          </p>
        </div>

        {/* 4 Sector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sectors.map((sector) => (
            <div
              key={sector.ticker}
              className="group rounded-2xl bg-maroon-subtle/40 border border-border-brown p-6 flex flex-col justify-between hover:border-border-brown/90 hover:bg-maroon-subtle/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-accent-green-bright font-medium px-2 py-0.5 rounded bg-accent-green/20 border border-accent-green/30">
                    {sector.ticker}
                  </span>
                  <span className="text-[10px] font-mono text-cream-muted/60 tracking-wider">
                    {sector.category}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-cream-light font-normal mb-2">
                  {sector.name}
                </h3>
                <p className="text-xs text-cream-muted/80 leading-relaxed font-sans">
                  {sector.description}
                </p>
              </div>

              {/* Delicate minimal line */}
              <div className="mt-8 pt-4 border-t border-border-brown/30">
                <svg
                  className="w-full h-8 overflow-visible opacity-50 group-hover:opacity-85 transition-opacity text-cream-muted"
                  fill="none"
                  viewBox="0 0 100 28"
                  aria-hidden="true"
                >
                  <path
                    d={sector.sparkline}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
