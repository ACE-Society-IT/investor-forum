"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RulesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const rules = [
    {
      title: "Starting Capital",
      description: "Every team begins with the same virtual starting capital.",
    },
    {
      title: "Order Execution",
      description: "Buy and sell orders execute at the current market price.",
    },
    {
      title: "Short Selling",
      description: "Teams may only sell shares they currently hold.",
    },
    {
      title: "Trading Halts",
      description: "Administrators may pause trading during rounds or announcements.",
    },
    {
      title: "Winning Condition",
      description: "Final rankings are based on Total Net Worth.",
    },
  ];

  const toggleRule = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"
      id="rules"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3">
            The Rules
          </h2>
          <p className="text-cream-muted text-base max-w-xl font-normal font-sans">
            Fair play. Same starting point. Every decision counts.
          </p>
        </div>

        {/* Core Valuation Standard Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-maroon-subtle/70 border border-border-brown text-center flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cream-muted/[0.04] to-transparent pointer-events-none" />
          <span className="font-mono text-[10px] text-cream-muted/60 uppercase tracking-widest">
            Core Valuation Standard
          </span>
          <div className="font-mono text-base sm:text-xl md:text-2xl text-cream-light font-medium tracking-tight py-2">
            Total Net Worth = Cash + Market Value of Holdings
          </div>
          <p className="text-xs text-cream-muted/70 font-sans">
            Portfolios update automatically as live prices fluctuate across trading rounds.
          </p>
        </div>

        {/* Clean Interactive Accordion for 5 Rules */}
        <div className="divide-y divide-border-brown/40 border-y border-border-brown/40">
          {rules.map((rule, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={rule.title} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleRule(idx)}
                  className="w-full flex items-center justify-between text-left text-cream-light select-none focus:outline-none group"
                >
                  <span className="font-serif text-lg md:text-xl font-normal group-hover:text-cream-muted transition-colors">
                    {rule.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-cream-muted/60 transform transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-cream-light" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-2 text-sm text-cream-muted/80 leading-relaxed font-sans animate-fadeIn">
                    {rule.description}
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
