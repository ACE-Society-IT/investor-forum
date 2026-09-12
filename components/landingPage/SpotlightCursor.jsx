"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";

export default function SpotlightCursor({
  radius = 250,
  brightness,
  className,
}) {
  const { theme } = useTheme();
  const canvasRef = useRef(null);

  // Adapt spotlight hue to current theme
  const effectiveColor = theme === "light" ? "180, 155, 135" : "234, 224, 211";
  const effectiveBrightness = brightness !== undefined ? brightness : (theme === "light" ? 0.08 : 0.1);

  useEffect(() => {
    // 1. Check if device has coarse pointer (touch screen / mobile)
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarsePointer) {
      return;
    }

    // 2. Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let isRendering = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let targetOpacity = 0;
    let currentOpacity = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      currentOpacity += (targetOpacity - currentOpacity) * 0.08;

      ctx.clearRect(0, 0, width, height);

      if (currentOpacity > 0.005 && currentX > -500) {
        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          radius
        );

        const peakAlpha = currentOpacity * effectiveBrightness;
        gradient.addColorStop(0, `rgba(${effectiveColor}, ${peakAlpha})`);
        gradient.addColorStop(0.4, `rgba(${effectiveColor}, ${peakAlpha * 0.45})`);
        gradient.addColorStop(0.75, `rgba(${effectiveColor}, ${peakAlpha * 0.12})`);
        gradient.addColorStop(1, `rgba(${effectiveColor}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Check if cursor movement and opacity have settled
      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);
      const dOpacity = Math.abs(targetOpacity - currentOpacity);

      if (dx < 0.1 && dy < 0.1 && dOpacity < 0.001) {
        // Settled: pause loop until next mouse move to eliminate GPU/CPU idle draw
        isRendering = false;
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startRendering = () => {
      if (!isRendering) {
        isRendering = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      startRendering();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetOpacity = 1;
      startRendering();
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
      startRendering();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Initial render tick to initialize canvas
    startRendering();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [effectiveColor, radius, effectiveBrightness]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-[2] h-full w-full overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    />
  );
}
