"use client";

import React, { useState, useEffect } from "react";
import StudentDashboard from "../components/StudentDashboard";
import ThemeToggle from "../components/ThemeToggle";
import { Lock, User, ArrowRight, AlertCircle, Loader2, Shield, Activity } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const demoTeams = {
    team1: { id: "00000000-0000-0000-0000-000000000001", name: "Alpha Traders", username: "team1", cash_balance: 100000 },
    team2: { id: "00000000-0000-0000-0000-000000000002", name: "Wall Street Wolves", username: "team2", cash_balance: 100000 },
    team3: { id: "00000000-0000-0000-0000-000000000003", name: "Quantum Fund", username: "team3", cash_balance: 100000 },
    team4: { id: "00000000-0000-0000-0000-000000000004", name: "Bullish Titans", username: "team4", cash_balance: 100000 }
  };

  useEffect(() => {
    const saved = localStorage.getItem("if_team_session");
    if (saved) {
      try {
        const teamObj = JSON.parse(saved);
        // Automatically migrate legacy non-UUID demo IDs
        if (teamObj?.id && teamObj.id.startsWith("demo-")) {
          const matched = demoTeams[teamObj.username?.toLowerCase()];
          if (matched) {
            teamObj.id = matched.id;
            localStorage.setItem("if_team_session", JSON.stringify(teamObj));
          }
        }
        setCurrentTeam(teamObj);
      } catch (e) {
        localStorage.removeItem("if_team_session");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("username", username.trim().toLowerCase())
        .eq("password", password.trim())
        .single();

      if (data) {
        if (data.is_banned) {
          setErrorMsg(`Access Denied: Team "${data.name}" has been frozen / disqualified by the Competition Director.`);
          return;
        }
        setCurrentTeam(data);
        localStorage.setItem("if_team_session", JSON.stringify(data));
      } else {
        if (demoTeams[username.trim().toLowerCase()] && password.trim() === "pass123") {
          const fallbackTeam = demoTeams[username.trim().toLowerCase()];
          if (fallbackTeam.is_banned) {
            setErrorMsg(`Access Denied: Team "${fallbackTeam.name}" is currently frozen.`);
            return;
          }
          setCurrentTeam(fallbackTeam);
          localStorage.setItem("if_team_session", JSON.stringify(fallbackTeam));
        } else {
          setErrorMsg("Invalid credentials. Please verify your team ID and password with tournament directors.");
        }
      }
    } catch (err) {
      if (demoTeams[username.trim().toLowerCase()] && password.trim() === "pass123") {
        const fallbackTeam = demoTeams[username.trim().toLowerCase()];
        setCurrentTeam(fallbackTeam);
        localStorage.setItem("if_team_session", JSON.stringify(fallbackTeam));
      } else {
        setErrorMsg("Unable to connect to trading floor server. Please check your internet connection.");
      }
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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-yellow)] selection:text-black font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--surface-1)]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 relative z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-yellow)] text-black flex items-center justify-center font-black text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.1)] shrink-0">
              <svg width="14" height="12" viewBox="0 0 115 100" fill="currentColor">
                <path d="M57.5 0L115 100H0L57.5 0Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-[var(--text-primary)] tracking-tight leading-none block truncate">Investor Forum</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] hidden xs:block">Live Arena System</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 font-mono text-xs shrink-0">
            <ThemeToggle />
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all duration-150 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400 shrink-0" />
              <span className="hidden xs:inline sm:inline">Admin Desk</span>
              <span className="xs:hidden">Admin</span>
            </a>
            <a
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all duration-150 hidden sm:flex active:scale-95"
            >
              <span>Projector Display ↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        {/* Left Column: Platform Brief & Market Stats */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-yellow)]/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] text-amber-600 dark:text-yellow-400 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)] animate-pulse" />
            <span>Market Simulation Terminal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
            Real-Time Trading. <br />
            High-Frequency Decisions.
          </h1>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Experience institutional stock trading, breaking economic shocks, portfolio rebalancing, and live leaderboard competitions on an ultra-fast simulation engine.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Starting Capital</span>
              <span className="font-semibold text-sm text-[var(--text-primary)] tnum mt-0.5 block">$100,000.00 USD</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)]">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Execution Speed</span>
              <span className="font-semibold text-sm text-emerald-500 tnum mt-0.5 block">Sub-Second Live</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="w-full lg:w-[420px]">
          <div className="vercel-card rounded-2xl p-7 shadow-2xl relative">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Participant Sign In</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your team credentials to access the trading floor.</p>
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
                  Team Identifier
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="team-username"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g. team1…"
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
                className="w-full mt-2 py-3 rounded-xl text-xs font-semibold font-mono bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
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

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-2">
                Quick Select Demo Teams
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                {[
                  { id: "team1", name: "Team 1" },
                  { id: "team2", name: "Team 2" },
                  { id: "team3", name: "Team 3" },
                  { id: "team4", name: "Team 4" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setUsername(t.id);
                      setPassword("pass123");
                      setErrorMsg("");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors duration-150"
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{t.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">pass: pass123</span>
                  </button>
                ))}
              </div>
            </div>
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
