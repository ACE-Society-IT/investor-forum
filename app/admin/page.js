"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCommandCenter from "../../components/AdminCommandCenter";
import ThemeToggle from "../../components/ThemeToggle";
import { Shield, Lock, User, ArrowRight, AlertCircle, Loader2, KeyRound } from "lucide-react";
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
  const [authMode, setAuthMode] = useState("credentials"); // "credentials" | "key"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
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

    try {
      if (authMode === "key") {
        const cleanKey = adminKey.trim();
        if (!cleanKey) {
          setErrorMsg("Please enter your Director Master Key.");
          setIsLoading(false);
          return;
        }

        // 1. Check admin_keys table in Supabase
        const { data: keyRecord, error: keyErr } = await supabase
          .from("admin_keys")
          .select("*")
          .eq("key_code", cleanKey)
          .eq("is_active", true)
          .single();

        if (keyRecord) {
          createAdminSession(keyRecord.key_name || "master_director");
          resetFailedLogins();
          setIsAdminLoggedIn(true);
        } else {
          recordFailedLogin();
          const updatedRate = checkLoginRateLimit();
          setRateLimitInfo(updatedRate);
          setErrorMsg(
            updatedRate.isLocked
              ? `Too many failed attempts. Locked for ${updatedRate.waitSeconds}s.`
              : `Invalid Director Key. (${updatedRate.remainingAttempts} attempts remaining)`
          );
        }
      } else {
        const cleanUser = sanitizeInput(username).toLowerCase();
        const cleanPass = password.trim();

        if (!cleanUser || !cleanPass) {
          setErrorMsg("Please provide both username and password.");
          setIsLoading(false);
          return;
        }

        // 2. Check teams table for verified admin
        const { data: adminRecord, error: adminErr } = await supabase
          .from("teams")
          .select("*")
          .eq("username", cleanUser)
          .eq("password", cleanPass)
          .eq("is_admin", true)
          .single();

        if (adminRecord) {
          createAdminSession(adminRecord.username);
          resetFailedLogins();
          setIsAdminLoggedIn(true);
        } else {
          recordFailedLogin();
          const updatedRate = checkLoginRateLimit();
          setRateLimitInfo(updatedRate);
          setErrorMsg(
            updatedRate.isLocked
              ? `Too many failed attempts. Locked for ${updatedRate.waitSeconds}s.`
              : `Invalid administrator credentials. (${updatedRate.remainingAttempts} attempts remaining)`
          );
        }
      }
    } catch (err) {
      recordFailedLogin();
      setErrorMsg("Authentication failed. Please verify your connection and database setup.");
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
        <div className="w-full max-w-md vercel-card rounded-2xl p-8 shadow-2xl relative animate-fade-in font-mono border border-[var(--border-color)]">
          {/* Insignia */}
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum Logo" className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Director Command Center</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
              Restricted portal for tournament directors and market operators.
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl text-xs font-bold mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("credentials");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                authMode === "credentials"
                  ? "bg-[var(--accent-yellow)] text-black shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("key");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                authMode === "key"
                  ? "bg-[var(--accent-yellow)] text-black shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Master Key</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.25)] text-[#ff5b4f] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {authMode === "key" ? (
              <div>
                <label htmlFor="admin-key-input" className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                  Director Master Key Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="admin-key-input"
                    type="password"
                    required
                    placeholder="Enter master key code (e.g. IF-ADMIN-KEY-2026)…"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)]"
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || rateLimitInfo.isLocked}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold bg-[var(--accent-yellow)] text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] shadow-amber-950/25 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-[var(--text-muted)]">
        <span>Investor Forum Secure Administrative Terminal • ISO-27001 Security Standard</span>
      </footer>
    </div>
  );
}
