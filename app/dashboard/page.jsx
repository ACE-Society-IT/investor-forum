"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentDashboard from "../../components/StudentDashboard";
import ThemeToggle from "../../components/ThemeToggle";
import { Lock, User, ArrowRight, AlertCircle, Loader2, Activity, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("if_team_session");
    if (saved) {
      try {
        const teamObj = JSON.parse(saved);
        if (teamObj?.id) {
          setCurrentTeam(teamObj);
        }
      } catch (e) {
        localStorage.removeItem("if_team_session");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Please enter your team identifier and passcode.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("username", cleanUser)
        .eq("password", cleanPass)
        .single();

      if (data) {
        if (data.is_banned) {
          setErrorMsg(`Access Denied: Team "${data.name}" has been disqualified/frozen by the Competition Director.`);
          return;
        }
        setCurrentTeam(data);
        localStorage.setItem("if_team_session", JSON.stringify(data));
      } else {
        setErrorMsg("Invalid credentials. Please verify your team ID and passcode with tournament organizers.");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to trading floor server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("if_team_session");
    setCurrentTeam(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-yellow)] text-black flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">Connecting to Market Floor…</span>
        </div>
      </div>
    );
  }

  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-yellow)] selection:text-black font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="glow-ambient w-[500px] h-[500px] bg-amber-500/15 top-[-100px] left-[-100px] animate-pulse-slow" />
      <div className="glow-ambient w-[450px] h-[450px] bg-yellow-500/10 bottom-[-100px] right-[-100px] animate-pulse-slow" />

      {/* Top Navbar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--surface-1)]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 relative z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Home Overview</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Investor Forum Logo" className="h-9 sm:h-11 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-xs text-[var(--text-primary)] tracking-tight leading-none block truncate">Investor Forum</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] hidden xs:block">Participant Trading Floor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 font-mono text-xs shrink-0">
            <ThemeToggle />
            <Link
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all duration-150 active:scale-95"
            >
              <span>Projector Display ↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative z-10">
        {/* Left Column: Platform Brief & Market Stats */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-yellow)]/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] text-amber-600 dark:text-yellow-400 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)] animate-pulse" />
            <span>Trading Terminal Session v2.4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
            Real-Time Trading. <br />
            High-Frequency Decisions.
          </h1>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Access institutional multi-asset order execution, monitor real-time sector sparklines, respond to Gemma AI macroeconomic shockwaves, and compete for top podium standings.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Starting Capital</span>
              <span className="font-semibold text-sm text-[var(--text-primary)] tnum mt-0.5 block">$100,000.00</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Execution Latency</span>
              <span className="font-semibold text-sm text-emerald-500 tnum mt-0.5 block">&lt; 10ms Realtime</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] col-span-2 sm:col-span-1">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">AI Shock Engine</span>
              <span className="font-semibold text-sm text-amber-500 dark:text-yellow-400 tnum mt-0.5 block">Gemma 26B</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="w-full lg:w-[420px]">
          <div className="vercel-card rounded-2xl p-6 sm:p-7 shadow-2xl relative border border-[var(--border-color)]">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Participant Sign In</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your team credentials assigned by the Competition Director.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.25)] flex items-start gap-2 text-xs text-[#ff5b4f]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="team-username" className="block text-xs font-mono text-[var(--text-secondary)] uppercase mb-1.5">
                  Team Identifier / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="team-username"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g. alphatraders…"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="team-password" className="block text-xs font-mono text-[var(--text-secondary)] uppercase mb-1.5">
                  Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="team-password"
                    type="password"
                    required
                    placeholder="Enter team passcode…"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl text-xs font-bold font-mono bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] shadow-amber-950/20 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Trading Floor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--surface-1)] px-6 py-4 relative z-10 font-mono text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Investor Forum Simulation Engine</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Realtime Engine Active</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
