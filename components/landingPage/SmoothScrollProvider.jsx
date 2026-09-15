"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    // Initialize Lenis luxury smooth inertia scrolling
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious exponential decay
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      infinite: false,
    });

    // Expose Lenis instance globally so anchor buttons and custom scrolls can target it
    window.__lenis = lenis;

    let animId;
    function raf(time) {
      lenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    // Intercept internal hash links (#rules, #timeline, etc.) for luxury Lenis smooth scroll
    const handleHashClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href !== "#") {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -88, duration: 1.4 });
        }
      }
    };

    document.addEventListener("click", handleHashClick);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("click", handleHashClick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
