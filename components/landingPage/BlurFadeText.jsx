"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

export default function BlurFadeText({
  children,
  className = "",
  as = "div",
  delay = 0,
  blur = 12,
  y = 22,
  duration = 0.65,
  threshold = 0.05,
  once = false,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: "0px 0px -20px 0px",
  });

  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastScrollY.current + 2) {
            setScrollDirection("down");
          } else if (currentY < lastScrollY.current - 2) {
            setScrollDirection("up");
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial={{
        opacity: 0,
        filter: `blur(${blur}px)`,
        y,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: {
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // Apple smooth fluid curve
              },
            }
          : {
              opacity: 0,
              filter: `blur(${blur}px)`,
              y: scrollDirection === "down" ? y : -y,
              transition: {
                duration: 0.45,
                ease: [0.4, 0, 0.2, 1],
              },
            }
      }
      className={className}
    >
      {children}
    </Component>
  );
}
