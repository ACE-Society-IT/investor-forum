"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SpotlightLoginButton({
  href = "/login",
  className = "",
}) {
  const buttonRef = useRef(null);
  const targetPos = useRef({ x: 50, y: 20 });
  const currentPos = useRef({ x: 50, y: 20 });
  const [pos, setPos] = useState({ x: 50, y: 20 });
  const [isHovered, setIsHovered] = useState(false);
  const animFrameId = useRef(null);

  // Viscous fluid lerp loop for liquid surface tension motion
  const animate = useCallback(() => {
    const dx = targetPos.current.x - currentPos.current.x;
    const dy = targetPos.current.y - currentPos.current.y;

    currentPos.current.x += dx * 0.2;
    currentPos.current.y += dy * 0.2;

    setPos({
      x: Math.round(currentPos.current.x * 10) / 10,
      y: Math.round(currentPos.current.y * 10) / 10,
    });

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || isHovered) {
      animFrameId.current = requestAnimationFrame(animate);
    }
  }, [isHovered]);

  useEffect(() => {
    if (isHovered) {
      animFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isHovered, animate]);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    targetPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseEnter = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPos.current = { x, y };
    currentPos.current = { x, y };
    setPos({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Compact, feathered liquid mask (radius ~32px, soft diffusion)
  const liquidMaskStyle = {
    WebkitMaskImage: `radial-gradient(circle 32px at ${pos.x}px ${pos.y}px, black 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.3) 75%, transparent 100%)`,
    maskImage: `radial-gradient(circle 32px at ${pos.x}px ${pos.y}px, black 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.3) 75%, transparent 100%)`,
  };

  return (
    <Link
      ref={buttonRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden select-none active:scale-[0.97] transition-transform duration-150 group shrink-0",
        className
      )}
    >
      {/* 1. Base Brown Layer (Institutional Mahogany Palette) */}
      <div className="relative z-10 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-b from-[#4d332f] to-[#36211e] border border-[#5f423d] shadow-[0_4px_16px_rgba(27,8,5,0.35)] text-[#f8f4ed] text-xs sm:text-sm font-sans font-semibold tracking-tight transition-colors duration-200">
        <span className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse shrink-0" />
        <span>Team Login</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#eae0d3] group-hover:translate-x-0.5 transition-transform" />
      </div>

      {/* 2. Ambient Organic Cream Sheen (Soft liquid glow below the mask) */}
      <div
        className="absolute inset-0 z-15 pointer-events-none rounded-full transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#f8f4ed]/25 blur-sm pointer-events-none"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
          }}
        />
      </div>

      {/* 3. Liquid Linen Cream Overlay (Feathered organic fluid bead, NOT a harsh cutout) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none rounded-full transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          ...liquidMaskStyle,
        }}
      >
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f8f4ed] text-[#1b0805] text-xs sm:text-sm font-sans font-semibold tracking-tight w-full h-full justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          <span>Team Login</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#1b0805] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
