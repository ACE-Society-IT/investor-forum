import React from "react";
import { Zap, Scale, Shield } from "lucide-react";

export default function ChallengeSection() {
  const cards = [
    {
      icon: Zap,
      title: "Analytical Speed",
      description: "React quickly to breaking market news.",
      tagLabel: "LATENCY",
      tagValue: "< 15 SEC",
    },
    {
      icon: Scale,
      title: "Portfolio Balance",
      description: "Balance opportunity and risk across sectors.",
      tagLabel: "ALLOCATION",
      tagValue: "DIVERSIFIED",
    },
    {
      icon: Shield,
      title: "Capital Discipline",
      description: "Protect your virtual capital and trade responsibly.",
      tagLabel: "PRESERVATION",
      tagValue: "CAPITAL",
    },
  ];

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"
      id="about"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3">
            The Challenge
          </h2>
          <p className="text-cream-muted text-base max-w-xl font-normal font-sans">
            Think fast, manage risk and make the right call when the market moves.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative rounded-2xl bg-maroon-subtle/50 border border-border-brown p-8 flex flex-col justify-between hover:border-border-brown/90 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/30 border border-border-brown/60 flex items-center justify-center text-cream-muted mb-6 group-hover:border-accent-green-bright/40 transition-colors">
                    <Icon className="w-5 h-5 text-cream-light stroke-[1.75]" />
                  </div>
                  <h3 className="font-serif text-2xl text-cream-light font-normal mb-2.5">
                    {card.title}
                  </h3>
                  <p className="text-cream-muted/80 text-sm leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border-brown/30 flex items-center justify-between text-xs font-mono text-cream-muted/50">
                  <span>{card.tagLabel}</span>
                  <span>{card.tagValue}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
