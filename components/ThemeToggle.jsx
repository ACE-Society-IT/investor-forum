"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={cn("w-8 h-8 rounded-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]", className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "White Theme" : "Dark Mode"}`}
      className={cn(
        "p-2 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 flex items-center justify-center shrink-0 active:scale-95",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-amber-600 hover:text-amber-700" />
      )}
    </button>
  );
}
