"use client";

import React from "react";
import {
  LayoutDashboard,
  Activity,
  Briefcase,
  BarChart3,
  Trophy,
  Radio,
  BookOpen,
  LogOut,
  ExternalLink,
  Shield,
  X
} from "lucide-react";

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  currentTeam,
  teamCash,
  totalNetWorth,
  isMarketPaused,
  onSignOut,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
    { id: "stocks", label: "Trading Floor", icon: Activity, badge: "Live" },
    { id: "portfolio", label: "Portfolio & Ledger", icon: Briefcase },
    { id: "market", label: "Market Intelligence", icon: BarChart3 },
    { id: "leaderboard", label: "Tournament Standings", icon: Trophy },
    { id: "news", label: "News Wire", icon: Radio },
    { id: "rules", label: "Rules & Guide", icon: BookOpen }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[var(--canvas)] border-r border-[var(--border-color)] flex flex-col justify-between transition-transform duration-150 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Investor Forum Logo" className="h-10 w-auto object-contain shrink-0" />
              <div>
                <span className="font-bold text-xs text-[var(--text-primary)] tracking-tight leading-none block">INVESTOR FORUM</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[var(--accent-maroon-subtle)] text-[var(--accent-maroon-text)] shadow-[0_0_0_1px_var(--accent-maroon-border)] inline-block mt-1">
                  ACE SOCIETY IT
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Desk Badge */}
          <div className="p-3 mx-3 my-3 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-1">
              <span>ACTIVE DESK</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d68f]" />
                <span className="text-[9px] text-[#059669] dark:text-[#00d68f] font-bold">CONNECTED</span>
              </span>
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
              {currentTeam?.name || "Participant Desk"}
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--text-secondary)]">Buying Power</span>
              <span className="text-[var(--text-primary)] font-bold tnum">
                ${Number(teamCash).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-0.5 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                    isActive
                      ? "bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] font-bold shadow-[0_0_0_1px_rgba(64,43,40,0.3)] dark:shadow-[0_0_0_1px_rgba(234,224,211,0.3)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#402b28] dark:text-[#eae0d3]" : "text-[var(--text-secondary)]"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00d68f]/10 text-[#059669] dark:text-[#00d68f] shadow-[0_0_0_1px_rgba(0,214,143,0.2)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Utilities & Sign Out */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-1">
          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors duration-150 font-mono"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Projector Display</span>
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">↗</span>
          </a>

          <a
            href="/admin"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors duration-150 font-mono"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#ff5b4f]" />
              <span>Admin Desk</span>
            </span>
          </a>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#ff5b4f] hover:bg-[#ff5b4f]/10 transition-colors duration-150 mt-2 font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>
    </>
  );
}
