"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, KeyRound, User, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import AdminCommandCenter from "@/components/AdminCommandCenter";
import ThemeToggle from "@/components/ThemeToggle";
import {
  createAdminSession,
  verifyAdminSession,
  destroyAdminSession,
  sanitizeInput,
  checkAdminRateLimit,
  recordFailedAdminAttempt,
  resetAdminAttempts
} from "@/lib/security";

export default function AdminPortalPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("credentials"); // "credentials" | "key"
  const [adminKey, setAdminKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ isLocked: false, remainingSec: 0 });

  // Auto-restore admin session if active & unexpired
  useEffect(() => {
    if (verifyAdminSession()) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    const rateCheck = checkAdminRateLimit();
    if (rateCheck.isLocked) {
      setErrorMsg(`Too many failed attempts. Security lockout active for ${rateCheck.remainingSec}s.`);
      setRateLimitInfo(rateCheck);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload =
        authMode === "key"
          ? { authMode: "key", adminKey: adminKey.trim() }
          : { authMode: "credentials", username: sanitizeInput(username).trim(), password: password.trim() };

      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        recordFailedAdminAttempt();
        const updatedRate = checkAdminRateLimit();
        setRateLimitInfo(updatedRate);
        throw new Error(data.error || "Authentication rejected.");
      }

      resetAdminAttempts();
      createAdminSession(data.session?.user || "director", data.session?.token);
      setIsAdminLoggedIn(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to authenticate administrator access.");
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
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805]"
    >
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 py-3 border-b border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <span>←</span>
          <span>Back to Trading Floor</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            Projector View ↗
          </a>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-md bg-[var(--surface-1)] rounded-2xl p-7 sm:p-9 border border-[var(--border-color)] shadow-xl relative animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6 pb-6 border-b border-[var(--border-color)]">
            <div className="flex justify-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Investor Forum Logo" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Admin Sign In
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Sign in to manage the market, teams, news, and live timers.
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl text-xs mb-5 font-mono">
            <button
              type="button"
              onClick={() => {
                setAuthMode("credentials");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium ${
                authMode === "credentials"
                  ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Username & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("key");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium ${
                authMode === "key"
                  ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Key</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-mono">
            {authMode === "key" ? (
              <div>
                <label htmlFor="admin-key-input" className="text-[var(--text-secondary)] block mb-1.5 text-xs font-medium">
                  Admin Access Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="admin-key-input"
                    type={showAdminKey ? "text" : "password"}
                    required
                    placeholder="Enter key..."
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl pl-10 pr-11 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                    aria-label={showAdminKey ? "Hide key" : "Show key"}
                  >
                    {showAdminKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="admin-username" className="text-[var(--text-secondary)] block mb-1.5 text-xs font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="admin-username"
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="text-[var(--text-secondary)] block mb-1.5 text-xs font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl pl-10 pr-11 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || rateLimitInfo.isLocked}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold font-sans bg-[#402b28] hover:bg-[#281815] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] border border-[var(--border-color)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[var(--text-muted)] gap-2">
        <span>Investor Forum Admin</span>
        <span>Secure Admin Session</span>
      </footer>
    </div>
  );
}
