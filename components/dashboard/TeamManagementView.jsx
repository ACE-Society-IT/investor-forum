"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  User,
  Crown,
  Mail,
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  Wallet,
  Briefcase
} from "lucide-react";

export default function TeamManagementView({
  allTeams = [],
  allTeamMembers = [],
  allPortfolios = [],
  allTransactions = [],
  stocks = [],
  currentTeam = null
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get active team members list
  const members = useMemo(() => {
    const safeMembers = Array.isArray(allTeamMembers) ? allTeamMembers : [];
    if (!currentTeam?.id) return safeMembers;
    return safeMembers.filter((m) => m.team_id === currentTeam.id);
  }, [allTeamMembers, currentTeam]);

  // Identify designated team leader
  const designatedLeaderName = currentTeam?.leader_name || "";
  const leaderMember = useMemo(() => {
    return (
      members.find(
        (m) =>
          m.role === "Team Leader" ||
          m.role === "Lead Trader" ||
          (m.role && m.role.toLowerCase().includes("lead")) ||
          (designatedLeaderName && m.name.toLowerCase().includes(designatedLeaderName.toLowerCase()))
      ) || null
    );
  }, [members, designatedLeaderName]);

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 1. MASTHEAD & TEAM HERO */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#402b28]/15 to-[#800020]/20 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center font-black text-xl sm:text-2xl shadow-[0_0_0_1px_var(--border-color)] shrink-0">
              {currentTeam?.name ? currentTeam.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {currentTeam?.name || "Official Trading Team"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                  OFFICIAL DESK
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--text-secondary)] font-mono mt-1">
                <span>@{currentTeam?.username || "team"}</span>
                <span>•</span>
                <span className="text-[var(--text-muted)]">Desk Email: {currentTeam?.username ? `${currentTeam.username}@alpha.com` : "assigned"}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authorized Live</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border-color)]">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Desk Capital</div>
              <div className="text-sm sm:text-base font-bold font-mono text-[var(--text-primary)] tnum">
                PKR {Number(currentTeam?.cash_balance || 100000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DESIGNATED TEAM LEADER HERO CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-[var(--surface-1)] to-[var(--surface-1)] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Crown className="w-32 h-32 text-amber-500" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-3">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>DESIGNATED TEAM LEADER / LEAD TRADER</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-500/30 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {designatedLeaderName || leaderMember?.name || "Designated Lead Trader"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Head of Desk Trading & Execution</span>
                  <span>•</span>
                  <span>{leaderMember?.email || `${currentTeam?.username || "team"}@alpha.com`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold border border-amber-500/25 self-start sm:self-center">
              <ShieldCheck className="w-4 h-4" />
              <span>Primary Decision Maker</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TEAM MEMBERS ROSTER SECTION */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Registered Team Members Roster</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-secondary)]">
                {members.length} Total
              </span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Official roster of students and analysts authorized to trade on this desk.
            </p>
          </div>

          {/* Search bar */}
          {members.length > 3 && (
            <div className="relative sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name…"
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Member Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)]">
            {members.length === 0
              ? "No member details recorded yet. Team leader is active."
              : "No members match your search criteria."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {filteredMembers.map((member, index) => {
              const isLeader =
                member.role === "Team Leader" ||
                member.role === "Lead Trader" ||
                (member.role && member.role.toLowerCase().includes("lead")) ||
                (designatedLeaderName && member.name.toLowerCase().includes(designatedLeaderName.toLowerCase()));

              return (
                <div
                  key={member.id || `mem-${index}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isLeader
                      ? "bg-amber-500/10 border-amber-500/30 shadow-sm"
                      : "bg-[var(--surface-2)]/60 border-[var(--border-color)] hover:border-[var(--border-color)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isLeader
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {isLeader ? <Crown className="w-4 h-4 fill-current" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                          {member.name}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase mt-0.5 ${
                            isLeader
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {member.role || "Trader"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{member.email || `${currentTeam?.username || "team"}@alpha.com`}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      Authorized
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
