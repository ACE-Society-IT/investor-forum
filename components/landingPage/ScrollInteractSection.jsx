"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

export default function ScrollInteractSection({
  children,
  className = "",
  id,
  threshold = 0.12,
  margin = "-40px 0px -40px 0px",
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    amount: threshold,
    margin,
  });

  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current + 2) {
            setScrollDirection("down");
          } else if (currentScrollY < lastScrollY.current - 2) {
            setScrollDirection("up");
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, filter: "blur(14px)", y: 48, scale: 0.985 }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              scale: 1,
              transition: {
                duration: 0.7,
                delay,
                ease: [0.16, 1, 0.3, 1], // Apple-grade spring ease
              },
            }
          : {
              opacity: 0,
              filter: "blur(12px)",
              y: scrollDirection === "down" ? 48 : -48,
              scale: 0.985,
              transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              },
            }
      }
      className={className}
    >
      {children}
    </motion.section>
  );
}
