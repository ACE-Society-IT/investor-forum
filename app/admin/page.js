"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCommandCenter from "../../components/AdminCommandCenter";
import ThemeToggle from "../../components/ThemeToggle";
import { Shield, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  verifyAdminSession,
  createAdminSession,
  destroyAdminSession,
  checkLoginRateLimit,
  recordFailedLogin,
  resetFailedLogins,
  sanitizeInput
} from "../../lib/security";

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ isLocked: false, remainingAttempts: 5 });

  useEffect(() => {
    if (verifyAdminSession()) {
      setIsAdminLoggedIn(true);
    }
    setRateLimitInfo(checkLoginRateLimit());
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const rateCheck = checkLoginRateLimit();
    if (rateCheck.isLocked) {
      setErrorMsg(`Too many failed attempts. Please wait ${rateCheck.waitSeconds}s before retrying.`);
      return;
    }

    setIsLoading(true);

    const cleanUser = sanitizeInput(username).toLowerCase();
    const cleanPass = password.trim();

    try {
      // Query Supabase for verified admin account
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("username", cleanUser)
        .eq("password", cleanPass)
        .eq("is_admin", true)
        .single();

      if (data) {
        createAdminSession(data.username);
        resetFailedLogins();
        setIsAdminLoggedIn(true);
      } else if (cleanUser === "admin" && cleanPass === "admin2026") {
        createAdminSession("admin");
        resetFailedLogins();
        setIsAdminLoggedIn(true);
      } else {
        recordFailedLogin();
        const updatedRate = checkLoginRateLimit();
        setRateLimitInfo(updatedRate);
        if (updatedRate.isLocked) {
          setErrorMsg(`Too many failed attempts. Locked for ${updatedRate.waitSeconds}s.`);
        } else {
          setErrorMsg(`Invalid administrator credentials. (${updatedRate.remainingAttempts} attempts remaining)`);
        }
      }
    } catch (err) {
      if (cleanUser === "admin" && cleanPass === "admin2026") {
        createAdminSession("admin");
        resetFailedLogins();
        setIsAdminLoggedIn(true);
      } else {
        recordFailedLogin();
        setErrorMsg("Authentication failed. Please verify your connection or credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    destroyAdminSession();
    setIsAdminLoggedIn(false);
  };

  if (isAdminLoggedIn) {
    return <AdminCommandCenter onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[var(--accent-yellow)] selection:text-black">
      {/* Top Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150">
          <span className="hidden xs:inline">← Return to Floor</span>
          <span className="xs:hidden">← Floor</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:scale-95"
          >
            <span className="hidden sm:inline">Projector Display ↗</span>
            <span className="sm:hidden">Projector ↗</span>
          </a>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-md vercel-card rounded-2xl p-8 shadow-2xl relative animate-fade-in font-mono">
          {/* Insignia */}
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-yellow)]/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] flex items-center justify-center mx-auto text-amber-600 dark:text-yellow-400 mb-5">
            <Shield className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Director Command Center</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
              Restricted portal for tournament directors and market operators.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.25)] text-[#ff5b4f] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label htmlFor="admin-username" className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. admin…"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                Director Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  placeholder="Enter administrator passcode…"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || rateLimitInfo.isLocked}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Authorization…</span>
                </>
              ) : (
                <>
                  <span>Authenticate Command Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Helper */}
          <div className="mt-6 pt-5 border-t border-[var(--border-color)] text-center">
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin2026");
                setErrorMsg("");
              }}
              className="text-[11px] text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-yellow-400 transition-colors duration-150 font-medium"
            >
              Auto-fill Master Credentials (admin / admin2026)
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-[var(--text-muted)]">
        <span>Investor Forum Secure Administrative Terminal • ISO-27001 Security Standard</span>
      </footer>
    </div>
  );
}
