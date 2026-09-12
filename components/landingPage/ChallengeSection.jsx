"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   CONFIGURATION & SPRING PHYSICS
   ─────────────────────────────────────────────────────── */

const BUBBLE_RADIUS = 125;

// Viscous liquid spring physics for fluid trailing & inertia
const SPRING_CONFIG = {
  stiffness: 60,
  damping: 16,
  mass: 0.9,
};

// Spring for expanding / collapsing the bubble radius on enter / leave
const RADIUS_SPRING_CONFIG = {
  stiffness: 90,
  damping: 20,
  mass: 0.8,
};

/* ─────────────────────────────────────────────────────────
   COLOR TOKENS (Site-matched warm bordeaux maroon & linen white)
   ─────────────────────────────────────────────────────── */

const COLOR_WHITE = "var(--cream-light, #f8f4ed)";
const COLOR_MAROON = "var(--maroon-accent, #a84542)";

/* ─────────────────────────────────────────────────────────
   SHORTENED EDITORIAL TEXT
   Interspersed with the site's maroon accent words.
   When hovered, each segment flips to its opposite color.
   ─────────────────────────────────────────────────────── */

const TEXT_SEGMENTS = [
  { text: "Investor Forum", type: "accent" },
  {
    text: " is an intra-school trading arena where student desks react to ",
    type: "normal",
  },
  { text: "breaking market news", type: "accent" },
  { text: ", allocate virtual capital, and build ", type: "normal" },
  { text: "real-world conviction", type: "accent" },
  { text: " under pressure — turning market theory into ", type: "normal" },
  { text: "decisive execution.", type: "accent" },
];

/* ─────────────────────────────────────────────────────────
   TOUCH DEVICE DETECTION
   Gracefully disables pointer hover on mobile & touch screens.
   ─────────────────────────────────────────────────────── */

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouch(!mq.matches);

    const handler = (e) => setIsTouch(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isTouch;
}

/* ─────────────────────────────────────────────────────────
   TEXT LAYER
   Renders exact text markup for both base & inverted states.
   Normal:   normal = White,   accent = Maroon
   Inverted: normal = Maroon,  accent = White
   ─────────────────────────────────────────────────────── */

function TextContent({ inverted = false, id }) {
  return (
    <p
      id={id}
      className="editorial-text text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.12] sm:leading-[1.08] tracking-tight w-full max-w-5xl select-none"
      aria-hidden={inverted}
      role={inverted ? "presentation" : undefined}
    >
      {TEXT_SEGMENTS.map((segment, i) => {
        const isAccent = segment.type === "accent";

        let color;
        if (inverted) {
          color = isAccent ? COLOR_WHITE : COLOR_MAROON;
        } else {
          color = isAccent ? COLOR_MAROON : COLOR_WHITE;
        }

        return (
          <span
            key={i}
            style={{ color }}
            className={isAccent ? "font-semibold" : "font-normal"}
          >
            {segment.text}
          </span>
        );
      })}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
   ─────────────────────────────────────────────────────── */

export default function ChallengeSection() {
  const sectionRef = useRef(null);
  const textContainerRef = useRef(null);
  const baseLayerRef = useRef(null);
  const invertedLayerRef = useRef(null);

  const isTouch = useIsTouchDevice();
  const [hasEntered, setHasEntered] = useState(false);

  // Motion values for smooth cursor tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);

  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);
  const springRadius = useSpring(radius, RADIUS_SPRING_CONFIG);

  /* ── Synchronize complementary masks to avoid text bleed (Batched via RAF) ── */
  useEffect(() => {
    let rafId = null;

    const renderMasks = () => {
      rafId = null;
      const base = baseLayerRef.current;
      const inv = invertedLayerRef.current;
      if (!base || !inv) return;

      const r = springRadius.get();
      const x = springX.get();
      const y = springY.get();

      if (r <= 0.5) {
        if (inv.style.opacity !== "0") {
          base.style.maskImage = "none";
          base.style.webkitMaskImage = "none";
          inv.style.maskImage = "none";
          inv.style.webkitMaskImage = "none";
          inv.style.opacity = "0";
        }
        return;
      }

      if (inv.style.opacity !== "1") {
        inv.style.opacity = "1";
      }

      // Base Layer Mask: punches a clean hole so the white text is NOT underneath the maroon text
      const baseMask = `radial-gradient(circle ${r}px at ${x}px ${y}px, transparent 0, transparent ${r}px, black ${r + 1}px)`;
      base.style.maskImage = baseMask;
      base.style.webkitMaskImage = baseMask;

      // Inverted Layer Mask: reveals inverted text ONLY inside the hole
      const invMask = `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0, black ${r}px, transparent ${r + 1}px)`;
      inv.style.maskImage = invMask;
      inv.style.webkitMaskImage = invMask;
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(renderMasks);
      }
    };

    const unsubX = springX.on("change", scheduleUpdate);
    const unsubY = springY.on("change", scheduleUpdate);
    const unsubR = springRadius.on("change", scheduleUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      unsubX();
      unsubY();
      unsubR();
    };
  }, [springX, springY, springRadius]);

  /* ── Pointer event handlers ───────────────────────── */

  const handleMouseMove = useCallback(
    (e) => {
      const rect = textContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(
    (e) => {
      const rect = textContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!hasEntered) {
        mouseX.set(x);
        mouseY.set(y);
        springX.jump(x);
        springY.jump(y);
        setHasEntered(true);
      }

      radius.set(BUBBLE_RADIUS);
    },
    [mouseX, mouseY, springX, springY, radius, hasEntered]
  );

  const handleMouseLeave = useCallback(() => {
    radius.set(0);
  }, [radius]);

  /* ── Fallback for touch devices (no hover/pointer) ── */

  if (isTouch) {
    return (
      <section
        className="relative w-full py-20 sm:py-24 md:py-28 px-5 sm:px-8 lg:px-12 border-b border-border-brown/30"
        id="about"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--maroon-accent,#a84542)]" />
            <span className="text-xs font-mono tracking-widest text-cream-muted/70 uppercase">
              The Platform
            </span>
          </div>

          <TextContent id="about-text-touch" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-24 md:py-32 px-5 sm:px-8 lg:px-12 cursor-default select-none border-b border-border-brown/30 overflow-hidden"
      id="about"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-5xl mx-auto">
        {/* Eyebrow Tag */}
        <div className="flex items-center gap-2.5 mb-6 sm:mb-8 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[var(--maroon-accent,#a84542)] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-cream-muted/70 uppercase">
            The Platform
          </span>
        </div>

        {/* 
          Text Container:
          Layer 1 (base text) has a radial mask that cuts out a hole where the cursor is.
          Layer 2 (inverted text) has a complementary mask that only shows inside that hole.
          Because Layer 1 is completely erased under the cursor, zero white text bleeds through,
          eliminating any stroke/border artifacts around the maroon text!
        */}
        <div ref={textContainerRef} className="relative w-full max-w-5xl">
          {/* Base Layer: White text with Maroon accents (punched with transparent hole on hover) */}
          <div
            ref={baseLayerRef}
            className="relative pointer-events-none select-none"
            style={{ willChange: "mask-image, -webkit-mask-image" }}
          >
            <TextContent id="about-text-normal" />
          </div>

          {/* Inverted Layer: Maroon text with White accents (rendered into the punched hole) */}
          <div
            ref={invertedLayerRef}
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
            style={{
              opacity: 0,
              willChange: "mask-image, -webkit-mask-image, opacity",
            }}
          >
            <TextContent inverted id="about-text-inverted" />
          </div>
        </div>
      </div>
    </section>
  );
}
