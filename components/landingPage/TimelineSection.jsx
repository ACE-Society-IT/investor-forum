import React from "react";

export default function TimelineSection() {
  const timelineStages = [
    {
      number: "01",
      title: "Market Open",
      description: "Teams log in and allocate their starting capital.",
      active: true,
    },
    {
      number: "02",
      title: "Round 1",
      description: "The first market news creates sector movements.",
      active: false,
    },
    {
      number: "03",
      title: "Half-Time",
      description: "Trading pauses and the leaderboard is revealed.",
      active: false,
    },
    {
      number: "04",
      title: "Round 2",
      description: "Major market events create the final opportunities.",
      active: false,
    },
    {
      number: "05",
      title: "Closing Bell",
      description: "Trading ends and final rankings are calculated.",
      active: true,
    },
  ];

  return (
    <section
      className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"
      id="timeline"
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3">
            The Day
          </h2>
          <p className="text-cream-muted text-base max-w-md font-normal font-sans">
            Five deliberate phases from market open to final audit.
          </p>
        </div>

        {/* Minimal Vertical Timeline with indicators */}
        <div className="relative pl-8 border-l border-border-brown/60 flex flex-col gap-10">
          {timelineStages.map((stage) => (
            <div key={stage.number} className="relative flex flex-col">
              {/* Timeline Node */}
              <div className="absolute -left-[37px] top-1 flex items-center justify-center">
                {stage.active ? (
                  <div className="w-4 h-4 rounded-full bg-accent-green/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse-slow" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-maroon-subtle flex items-center justify-center border border-border-brown">
                    <div className="w-2 h-2 rounded-full bg-cream-muted/50" />
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1">
                <span>{stage.number}</span>
                <span>•</span>
                <span>{stage.title}</span>
              </div>
              <h3 className="font-serif text-xl text-cream-light font-normal mb-1">
                {stage.title}
              </h3>
              <p className="text-sm text-cream-muted/80 leading-relaxed font-sans">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
