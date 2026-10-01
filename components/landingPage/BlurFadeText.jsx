"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export default function BlurFadeText({
  children,
  className = "",
  as = "div",
  delay = 0,
  y = 20,
  duration = 0.5,
  threshold = 0.05,
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: "0px 0px -20px 0px",
  });

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial={{
        opacity: 0,
        y,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
              transition: {
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // Apple smooth fluid curve
              },
            }
          : {
              opacity: 0,
              y,
              transition: {
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
              },
            }
      }
      className={cn("transform-gpu will-change-[transform,opacity]", className)}
    >
      {children}
    </Component>
  );
}
