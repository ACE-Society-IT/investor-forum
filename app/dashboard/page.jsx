"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { sanitizeInput } from "@/lib/security";
import StudentDashboard from "@/components/StudentDashboard";
import ThemeToggle from "@/components/ThemeToggle";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get("tab") || "overview";
  const [currentTeam, setCurrentTeam] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");


  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingApprovalData, setPendingApprovalData] = useState(null);
  const [lockedData, setLockedData] = useState(null);
  const [memberId, setMemberId] = useState("");
  const [availableMembers, setAvailableMembers] = useState([]);

  // Auto-restore stored participant session on client mount with server validation
  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem("if_team_session");
        const token = localStorage.getItem("if_team_session_token");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.name) {
            // Verify with database that this session is still active (not unlocked by admin)
            if (token) {
              const res = await fetch(`/api/auth/student-session-check?teamId=${parsed.id}&token=${token}`);
              const checkData = await res.json();
              if (checkData.valid) {
                setCurrentTeam(parsed);
                return;
              }
            }
            // If invalid or unlocked by admin, clear local storage cleanly
            localStorage.removeItem("if_team_session");
            localStorage.removeItem("if_team_session_token");
            setErrorMsg("Your desk session was unlocked by the competition director. You may now sign in on this or another device.");
          }
        }
      } catch (_) {
        localStorage.removeItem("if_team_session");
        localStorage.removeItem("if_team_session_token");
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, []);

  // Poll and listen for Director approval when in waiting state
  useEffect(() => {
    if (!pendingApprovalData?.requestId) return;

    let isMounted = true;
    const reqId = pendingApprovalData.requestId;

    const checkApproval = async () => {
      try {
        const res = await fetch(`/api/auth/login-approval?requestId=${reqId}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.status === "approved" && data.sessionToken) {
          const teamData = data.team || {
            id: pendingApprovalData.teamId,
            name: pendingApprovalData.teamName
          };
          localStorage.setItem("if_team_session", JSON.stringify(teamData));
          localStorage.setItem("if_team_session_token", data.sessionToken);
          setPendingApprovalData(null);
          setCurrentTeam(teamData);
        } else if (data.status === "rejected") {
          setPendingApprovalData(null);
          setErrorMsg("Login request rejected by Competition Director.");
        }
      } catch (err) {
        console.error("Approval polling error:", err);
      }
    };

    const interval = setInterval(checkApproval, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pendingApprovalData]);

  const handleSignIn = async (e, forceOverride = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanUser = sanitizeInput(username).trim();
    const cleanPass = password.trim();
    const cleanKey = sanitizeInput(secretKey).trim().toUpperCase();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Please enter both username and passcode.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
          secretKey: cleanKey,
          memberId: memberId || undefined,
          forceOverride
        })
      });

      const data = await res.json();

      if (res.status === 409 && data.isLocked) {
        setLockedData(data);
        if (data.members && data.members.length > 0) {
          setAvailableMembers(data.members);
        }
        setErrorMsg(data.error || "This team desk has an active station session.");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      setLockedData(null);

      if (data.pendingApproval) {
        setPendingApprovalData({
          requestId: data.requestId,
          teamName: data.teamName,
          memberName: data.memberName,
          memberRole: data.memberRole
        });
        return;
      }

      const teamData = data.team;
      const token = data.sessionToken;
      localStorage.setItem("if_team_session", JSON.stringify(teamData));
      if (token) localStorage.setItem("if_team_session_token", token);

      setCurrentTeam(teamData);
    } catch (err) {
      setErrorMsg(err.message || "Invalid team credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async (msg) => {
    try {
      if (currentTeam?.id) {
        await fetch("/api/auth/student-logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: currentTeam.id })
        });
      }
    } catch (err) {
      console.error("Sign out session cleanup error:", err);
    } finally {
      localStorage.removeItem("if_team_session");
      localStorage.removeItem("if_team_session_token");
      setCurrentTeam(null);
      if (typeof msg === "string" && msg) {
        setErrorMsg(msg);
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">Connecting to Market Floor…</span>
        </div>
      </div>
    );
  }

  if (currentTeam) {
    return <StudentDashboard currentTeam={currentTeam} onSignOut={handleSignOut} initialTab={initialTabParam} />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-sand)] selection:text-[#1b0805] font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="glow-ambient w-[500px] h-[500px] bg-[#402b28]/25 top-[-100px] left-[-100px] animate-pulse-slow" />
      <div className="glow-ambient w-[450px] h-[450px] bg-[#303d37]/20 bottom-[-100px] right-[-100px] animate-pulse-slow" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#402b28]/10 dark:bg-[#eae0d3]/15 shadow-[0_0_0_1px_var(--border-color)] text-[#402b28] dark:text-[#eae0d3] text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#402b28] dark:bg-[#eae0d3] animate-pulse" />
            <span>Trading Terminal Session v2.4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
            Real-Time Trading. <br />
            High-Frequency Decisions.
          </h1>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Access institutional multi-asset order execution, monitor real-time sector sparklines, respond to AI macroeconomic shockwaves, and compete for top podium standings.
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
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Security Gate</span>
              <span className="font-semibold text-sm text-[#402b28] dark:text-[#eae0d3] tnum mt-0.5 block">1-DEVICE LOCK</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="w-full lg:w-[420px]">
          <div className="vercel-card rounded-2xl p-6 sm:p-7 shadow-2xl relative border border-[var(--border-color)]">
            {pendingApprovalData ? (
              <div className="space-y-5 text-center py-2">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 relative z-10 shadow-lg">
                    <ShieldCheck className="w-7 h-7 animate-pulse" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>AWAITING DIRECTOR APPROVAL</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Device Authorization Request Sent
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                    The Competition Director has been notified on the Admin Console. Stand by while your desk credentials are authenticated.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-left font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Trading Desk:</span>
                    <span className="font-bold text-[var(--text-primary)]">{pendingApprovalData.teamName}</span>
                  </div>
                  {pendingApprovalData.memberName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Trader Name:</span>
                      <span className="font-bold text-amber-500">{pendingApprovalData.memberName}</span>
                    </div>
                  )}
                  {pendingApprovalData.memberRole && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Assigned Role:</span>
                      <span className="font-bold text-[var(--text-primary)]">{pendingApprovalData.memberRole}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Pending Signal</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingApprovalData(null);
                      setErrorMsg("");
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
                  >
                    Cancel Request &amp; Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Participant Sign In</h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>DEVICE LOCKED</span>
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your team credentials &amp; one-time activation key.</p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-[#ff5b4f]/10 shadow-[0_0_0_1px_rgba(255,91,79,0.25)] flex items-start gap-2 text-xs text-[#ff5b4f]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span>{errorMsg}</span>
                      {lockedData && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => handleSignIn(e, true)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#ff5b4f] text-white hover:bg-[#e0483c] transition-colors flex items-center gap-1.5"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                            <span>Claim / Reconnect Station</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={(e) => handleSignIn(e, false)} className="space-y-4">
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
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter team passcode…"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-11 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                    aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Member Selector / Member ID (Optional) */}
              {availableMembers.length > 0 ? (
                <div>
                  <label htmlFor="member-select" className="block text-xs font-mono text-[var(--text-secondary)] uppercase mb-1.5">
                    Select Member Profile (Optional)
                  </label>
                  <select
                    id="member-select"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl px-4 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                  >
                    <option value="">-- Main Team Desk --</option>
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.role ? `(${m.role})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="member-id-input" className="block text-xs font-mono text-[var(--text-secondary)] uppercase mb-1.5">
                    Member ID / Key (Optional)
                  </label>
                  <input
                    id="member-id-input"
                    type="text"
                    placeholder="e.g. Lead Trader Member ID"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl px-4 py-2.5 text-base sm:text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                  />
                </div>
              )}

              {/* One-Time Secret Activation Key */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="team-secret" className="block text-xs font-mono text-[var(--text-secondary)] uppercase">
                    One-Time Secret Key
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Activation
                  </span>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    id="team-secret"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. KEY-9X42-7B10 (from Director)"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs font-mono font-bold tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] uppercase focus-visible:ring-2 focus-visible:ring-[#402b28] dark:focus-visible:ring-[#eae0d3]"
                  />
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                  Required for initial desk activation. Single-use token issued by Director.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl text-xs font-bold font-mono bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-[0_0_0_1px_var(--border-color)] shadow-stone-950/20 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Desk Station…</span>
                  </>
                ) : (
                  <>
                    <span>Activate & Enter Floor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
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

export default function ParticipantLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] flex items-center justify-center animate-pulse">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">Connecting to Market Floor…</span>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
