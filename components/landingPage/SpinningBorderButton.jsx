"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary: {
    inner:
      "bg-cream-muted text-maroon-base hover:bg-cream-light font-medium shadow-[0_4px_20px_rgba(234,224,211,0.1)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(234,224,211,0.22)]",
    beam:
      "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, rgb(234, 224, 211) 120deg, #ffffff 140deg, transparent 185deg)",
    staticBorder: "border-border-brown/70 group-hover:border-transparent",
  },
  accent: {
    inner:
      "bg-accent-green hover:bg-[#384841] text-cream-light font-medium shadow-[0_0_15px_rgba(95,168,134,0.18)]",
    glow: "group-hover:shadow-[0_0_24px_rgba(95,168,134,0.3)]",
    beam:
      "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, #5fa886 120deg, rgb(234, 224, 211) 140deg, transparent 185deg)",
    staticBorder: "border-border-brown/80 group-hover:border-transparent",
  },
  secondary: {
    inner:
      "bg-maroon-subtle/80 hover:bg-maroon-subtle text-cream-light font-medium",
    glow: "group-hover:shadow-[0_0_20px_rgba(64,43,40,0.4)]",
    beam:
      "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, rgb(234, 224, 211) 120deg, rgb(248, 244, 237) 140deg, transparent 185deg)",
    staticBorder: "border-border-brown group-hover:border-transparent",
  },
};

const sizeStyles = {
  sm: "text-xs px-4 py-1.5",
  md: "text-sm px-7 py-3",
  lg: "text-sm px-8 py-3.5",
};

export const SpinningBorderButton = forwardRef(
  (
    {
      href,
      variant = "primary",
      size = "md",
      children,
      className,
      innerClassName,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const currentVariant = variantStyles[variant] || variantStyles.primary;
    const currentSize = sizeStyles[size] || sizeStyles.md;

    const wrapperClasses = cn(
      "group relative inline-flex items-center justify-center rounded-full p-[1px] overflow-hidden transition-all duration-300 select-none",
      currentVariant.glow,
      disabled && "opacity-50 pointer-events-none",
      className
    );

    const innerClasses = cn(
      "relative z-10 inline-flex items-center justify-center gap-2 rounded-full w-full h-full transition-colors duration-200 font-sans",
      currentSize,
      currentVariant.inner,
      innerClassName
    );

    const content = <span className={innerClasses}>{children}</span>;

    if (href) {
      return (
        <Link href={href} ref={ref} className={wrapperClasses} {...props}>
          {/* Static Border (visible normally) */}
          <span
            className={cn(
              "absolute inset-0 rounded-full border transition-colors duration-300 pointer-events-none",
              currentVariant.staticBorder
            )}
          />

          {/* Spinning Conic Border Beam (illuminates on hover) */}
          <span
            className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: currentVariant.beam }}
            aria-hidden="true"
          />

          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={wrapperClasses}
        {...props}
      >
        {/* Static Border (visible normally) */}
        <span
          className={cn(
            "absolute inset-0 rounded-full border transition-colors duration-300 pointer-events-none",
            currentVariant.staticBorder
          )}
        />

        {/* Spinning Conic Border Beam (illuminates on hover) */}
        <span
          className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: currentVariant.beam }}
          aria-hidden="true"
        />

        {content}
      </button>
    );
  }
);

SpinningBorderButton.displayName = "SpinningBorderButton";

export default SpinningBorderButton;
