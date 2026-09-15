"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  Radio,
  Sliders,
  DollarSign,
  Users,
  Trophy,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Edit2,
  RefreshCw,
  ExternalLink,
  Key,
  KeyRound,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Check,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Unlock,
  LogOut,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Timer,
  Calendar,
  FastForward,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Ban,
  UserCheck,
  UserX,
  User,
  UserPlus,
  PlusCircle,
  Briefcase,
  BadgeCheck,
  Flame,
  Activity,
  AlertCircle,
  Bot,
  Menu,
  X
} from "lucide-react";
import {
  GoldMedalIcon,
  SilverMedalIcon,
  BronzeMedalIcon,
  QuantumChipIcon,
  AntitrustGavelIcon,
  PharmaVialIcon,
  EnergyPipelineIcon,
  SupplyCrateIcon
} from "./icons/CustomBadges";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ThemeToggle from "./ThemeToggle";
import { sanitizeInput } from "../lib/security";
import { getRoundTimingInfo, formatSecondsToTime } from "../lib/roundTimer";
import { executeGradualMarketShock } from "../lib/marketTransition";

const calculateFutureIso = (minutes) => {
  const mins = Math.max(0, Number(minutes) || 0);
  return new Date(Date.now() + mins * 60 * 1000).toISOString();
};

const calculateExtendedIso = (currentEndsAt, minsToAdd) => {
  const parsed = currentEndsAt ? new Date(currentEndsAt).getTime() : NaN;
  const base = !isNaN(parsed) ? Math.max(Date.now(), parsed) : Date.now();
  const mins = Math.max(0, Number(minsToAdd) || 0);
  return new Date(base + mins * 60 * 1000).toISOString();
};

const generateSecretKey = () => {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KEY-${p1}-${p2}`;
};

export default function AdminCommandCenter({ onSignOut }) {
  // Global Game State
  const [gameState, setGameState] = useState({
    id: 1,
    current_round: "Round 1 - Active",
    current_round_number: 1,
    total_rounds: 3,
    round_ends_at: null,
    next_round_starts_at: null,
    round_duration_minutes: 15,
    is_market_open: true,
    is_results_revealed: false
  });

  // Local Round Scheduler Form States
  const [roundDurationInput, setRoundDurationInput] = useState(15);
  const [customBreakInput, setCustomBreakInput] = useState(5);
  const [totalRoundsInput, setTotalRoundsInput] = useState(3);
  const [customRoundTitle, setCustomRoundTitle] = useState("");
  const [nowTime, setNowTime] = useState(0);

  // Stocks & News
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);

  // Gradual 10-Second Market Transition State
  const [transitionState, setTransitionState] = useState(null);

  // Teams & Portfolios for Leaderboard
  const [teams, setTeams] = useState([]);
  const [teamSessions, setTeamSessions] = useState([]);
  const [isUnlockingSession, setIsUnlockingSession] = useState(false);
  const [isUnlockingAllSessions, setIsUnlockingAllSessions] = useState(false);
  const [portfolios, setPortfolios] = useState([]);

  // Module 2 Form: Publish News & Shock
  const [newsHeadline, setNewsHeadline] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [targetSector, setTargetSector] = useState("Technology");
  const [targetScope, setTargetScope] = useState("sector"); // 'sector' | 'stocks'
  const [selectedStockIds, setSelectedStockIds] = useState([]);
  const [shockPercent, setShockPercent] = useState(10);
  const [stockShocks, setStockShocks] = useState({}); // { [stockId]: number }
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState(null);

  // AI News Engine
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiNewsResult, setAiNewsResult] = useState(null);

  // Autonomous Market Simulation Engine (Auto-Ticker)
  const [isAutoTickerActive, setIsAutoTickerActive] = useState(false);
  const [tickerSpeedMs, setTickerSpeedMs] = useState(4000); // 4 seconds
  const [tickerVolatility, setTickerVolatility] = useState(1.0); // 1.0x normal
  const [marketRegime, setMarketRegime] = useState("BALANCED"); // 'BULL' | 'BALANCED' | 'VOLATILE' | 'SIDEWAYS' | 'BEAR'
  const [tickCount, setTickCount] = useState(0);
  const [lastTickAt, setLastTickAt] = useState(null);
  const autoTickerIntervalRef = useRef(null);

  // Module 3 Form: Direct Stock Override, IPO & Delete
  const [editingStock, setEditingStock] = useState(null);
  const [newStockPrice, setNewStockPrice] = useState("");
  const [isIpoModalOpen, setIsIpoModalOpen] = useState(false);
  const [deletingStock, setDeletingStock] = useState(null);
  const [ipoForm, setIpoForm] = useState({
    ticker: "",
    name: "",
    sector: "Technology",
    price: 50.0
  });

  // Module 4 Form: Team & Individual Trader Management
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isCreateIndividualModalOpen, setIsCreateIndividualModalOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [participantFilter, setParticipantFilter] = useState("ALL"); // 'ALL' | 'TEAMS' | 'INDIVIDUALS'
  const [participantSearch, setParticipantSearch] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // Team Form with Dynamic Initial Members
  const [newTeamForm, setNewTeamForm] = useState({
    name: "",
    username: "",
    password: "password123",
    cash_balance: 100000,
    secret_key: generateSecretKey()
  });
  const [newTeamInitialMembers, setNewTeamInitialMembers] = useState([
    { name: "", role: "Lead Trader" },
    { name: "", role: "Trader" }
  ]);

  // Individual Trader Form
  const [newIndividualForm, setNewIndividualForm] = useState({
    name: "",
    username: "",
    password: "password123",
    cash_balance: 100000,
    trader_title: "Independent Prop Trader",
    secret_key: generateSecretKey()
  });

  // Roster Management Modal State
  const [managingRosterTeam, setManagingRosterTeam] = useState(null);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    role: "Trader",
    email: ""
  });
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingMemberForm, setEditingMemberForm] = useState({
    name: "",
    role: "Trader",
    email: ""
  });

  const [adjustingTeam, setAdjustingTeam] = useState(null);
  const [cashAdjustmentAmount, setCashAdjustmentAmount] = useState(5000);
  const [resettingTeam, setResettingTeam] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");

  // Module 6 Form: Director Master Keys & Security Credentials
  const [adminKeys, setAdminKeys] = useState([]);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [newKeyForm, setNewKeyForm] = useState({
    key_name: "",
    key_code: "",
    is_active: true
  });

  // Login Approvals & Presence States
  const [loginRequests, setLoginRequests] = useState([]);
  const [isActioningRequest, setIsActioningRequest] = useState(null);
  const [presenceFilter, setPresenceFilter] = useState("ALL"); // 'ALL' | 'ONLINE' | 'OFFLINE'

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("gamestate"); // 'gamestate' | 'news' | 'stocks' | 'teams' | 'leaderboard' | 'keys'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadAdminKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/keys");
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setAdminKeys(data.keys);
      }
    } catch (err) {
      console.error("Failed to load admin master keys:", err);
    }
  }, []);

  // Load all competition data
  const loadAdminData = useCallback(async () => {
    try {
      const [gsRes, sRes, nRes, tRes, pRes, sessRes, tmRes, reqRes] = await Promise.all([
        supabase.from("game_state").select("*").single(),
        supabase.from("stocks").select("*").order("ticker"),
        supabase.from("news_feed").select("*").order("created_at", { ascending: false }).limit(40),
        supabase.from("teams").select("id, name, username, cash_balance, is_admin, is_banned, participant_type, trader_title, secret_key, secret_key_used, secret_key_used_at, locked_ip, locked_device_info, created_at").order("name"),
        supabase.from("portfolio").select("id, team_id, stock_id, shares, avg_buy_price"),
        supabase.from("team_sessions").select("team_id, session_token, ip_address, user_agent, created_at, last_seen_at"),
        supabase.from("team_members").select("*").order("created_at", { ascending: true }),
        supabase.from("login_requests").select("*").order("created_at", { ascending: false }).limit(50)
      ]);

      if (gsRes?.data) setGameState(gsRes.data);
      if (sRes?.data) setStocks(sRes.data);
      if (nRes?.data) setNews(nRes.data);
      if (tRes?.data) setTeams(tRes.data.filter((t) => !t.is_admin));
      if (pRes?.data) setPortfolios(pRes.data);
      if (sessRes?.data) setTeamSessions(sessRes.data);
      if (tmRes?.data) setTeamMembers(tmRes.data);
      if (reqRes?.data) setLoginRequests(reqRes.data);

      await loadAdminKeys();
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  }, [loadAdminKeys]);

  useEffect(() => {
    loadAdminData();

    // Continuous smooth background polling (zero flicker)
    const pollInterval = setInterval(() => {
      loadAdminData();
    }, 3000);

    if (!isSupabaseConfigured) {
      return () => clearInterval(pollInterval);
    }

    // Supabase Real-time Channel
    const channel = supabase
      .channel("admin-command-live")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadAdminData();
      })
      .subscribe();

    const clockTimer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(clockTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // -------------------------------------------------------------
  // ROUND SCHEDULING & COUNTDOWN TIMERS
  // -------------------------------------------------------------
  const handleSetTotalRounds = async (count) => {
    const total = Math.max(1, Math.min(20, Number(count) || 3));
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ total_rounds: total })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, total_rounds: total }));
        showNotification(`Tournament set to ${total} total rounds.`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({ ...prev, total_rounds: total }));
      showNotification(`Set to ${total} total rounds (local).`, "warning");
    }
  };

  const handleSelectRoundNumber = async (roundNum, roundTitle) => {
    const title = roundTitle || (roundNum <= (gameState.total_rounds || 3) ? `Round ${roundNum} - Active` : "Tournament Concluded");
    try {
      const { error } = await supabase
        .from("game_state")
        .update({
          current_round_number: roundNum,
          current_round: title
        })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({
          ...prev,
          current_round_number: roundNum,
          current_round: title
        }));
        showNotification(`Current round switched to: ${title}`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({
        ...prev,
        current_round_number: roundNum,
        current_round: title
      }));
      showNotification(`Switched to: ${title}`, "warning");
    }
  };

  const handleStartRoundTimer = async (minutes) => {
    const mins = Math.max(1, Number(minutes) || 15);
    const endTimestamp = calculateFutureIso(mins);
    try {
      const { error } = await supabase
        .from("game_state")
        .update({
          round_ends_at: endTimestamp,
          next_round_starts_at: null,
          round_duration_minutes: mins
        })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({
          ...prev,
          round_ends_at: endTimestamp,
          next_round_starts_at: null,
          round_duration_minutes: mins
        }));
        showNotification(`Round timer started for ${mins} minutes!`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({
        ...prev,
        round_ends_at: endTimestamp,
        next_round_starts_at: null,
        round_duration_minutes: mins
      }));
      showNotification(`Round timer started for ${mins}m (local).`, "warning");
    }
  };

  const handleExtendRoundTimer = async (minsToAdd) => {
    const endTimestamp = calculateExtendedIso(gameState.round_ends_at, minsToAdd);
    try {
      const { error } = await supabase
        .from("game_state")
        .update({
          round_ends_at: endTimestamp
        })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, round_ends_at: endTimestamp }));
        showNotification(`Added +${minsToAdd} minutes to the active round!`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({ ...prev, round_ends_at: endTimestamp }));
      showNotification(`Extended +${minsToAdd} mins.`, "warning");
    }
  };

  const handleClearRoundTimer = async () => {
    try {
      const { error } = await supabase
        .from("game_state")
        .update({
          round_ends_at: null
        })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, round_ends_at: null }));
        showNotification("Round timer cleared / stopped.", "success");
      }
    } catch (err) {
      setGameState((prev) => ({ ...prev, round_ends_at: null }));
    }
  };

  const handleSetIntermission = async (breakMinutes) => {
    const mins = Math.max(1, Number(breakMinutes) || 5);
    const nextStartTimestamp = calculateFutureIso(mins);
    try {
      const { error } = await supabase
        .from("game_state")
        .update({
          next_round_starts_at: nextStartTimestamp,
          round_ends_at: null
        })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({
          ...prev,
          next_round_starts_at: nextStartTimestamp,
          round_ends_at: null
        }));
        showNotification(`Intermission scheduled: Next round starts in ${mins}m.`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({
        ...prev,
        next_round_starts_at: nextStartTimestamp,
        round_ends_at: null
      }));
    }
  };

  const handleClearIntermission = async () => {
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ next_round_starts_at: null })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, next_round_starts_at: null }));
        showNotification("Intermission timer cleared.", "success");
      }
    } catch (err) {
      setGameState((prev) => ({ ...prev, next_round_starts_at: null }));
    }
  };

  // -------------------------------------------------------------
  // AUTONOMOUS MARKET SIMULATION LOOP (Continuous Fluctuations)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isAutoTickerActive || !gameState.is_market_open) {
      if (autoTickerIntervalRef.current) {
        clearInterval(autoTickerIntervalRef.current);
        autoTickerIntervalRef.current = null;
      }
      return;
    }

    const executeMarketTick = async () => {
      try {
        const res = await fetch("/api/market/tick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volatility: tickerVolatility,
            regime: marketRegime,
            isMarketOpen: gameState.is_market_open
          })
        });
        const data = await res.json();
        if (data.success && data.stocks) {
          setStocks(data.stocks);
          setTickCount((prev) => prev + 1);
          setLastTickAt(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Auto-ticker tick error:", err);
      }
    };

    // Execute first tick immediately, then set interval
    executeMarketTick();
    autoTickerIntervalRef.current = setInterval(executeMarketTick, tickerSpeedMs);

    return () => {
      if (autoTickerIntervalRef.current) {
        clearInterval(autoTickerIntervalRef.current);
      }
    };
  }, [isAutoTickerActive, tickerSpeedMs, tickerVolatility, marketRegime, gameState.is_market_open]);

  const handleToggleAutoTicker = () => {
    setIsAutoTickerActive((prev) => {
      const next = !prev;
      showNotification(
        next
          ? `Autonomous Market Ticker ENABLED (${marketRegime} Regime active).`
          : "Auto-Ticker HALTED.",
        next ? "success" : "warning"
      );
      return next;
    });
  };

  const handleManualTickNow = async () => {
    try {
      const res = await fetch("/api/market/tick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volatility: tickerVolatility,
          regime: marketRegime,
          isMarketOpen: gameState.is_market_open
        })
      });
      const data = await res.json();
      if (data.success && data.stocks) {
        setStocks(data.stocks);
        setTickCount((prev) => prev + 1);
        setLastTickAt(new Date().toLocaleTimeString());
        showNotification(`Executed realistic market tick (${marketRegime} regime).`, "success");
      }
    } catch (err) {
      console.error("Manual tick error:", err);
      showNotification("Failed to execute market tick step.", "error");
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadAdminData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // 1. Panic Pause / Resume Market
  const handleToggleMarket = async () => {
    const newState = !gameState.is_market_open;
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ is_market_open: newState })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, is_market_open: newState }));
        showNotification(
          newState ? "Trading floor RESUMED. Orders active." : "PANIC FREEZE: Trading floor PAUSED.",
          newState ? "success" : "warning"
        );
      }
    } catch (err) {
      showNotification("Failed to toggle market state.", "error");
    }
  };

  // 1b. Update Round Name
  const handleUpdateRound = async (roundName) => {
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ current_round: roundName })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, current_round: roundName }));
        showNotification(`Advanced to ${roundName}`, "success");
      }
    } catch (err) {
      showNotification("Failed to update round.", "error");
    }
  };

  // 1c. Reveal or Hide Final Results
  const handleToggleResultsReveal = async () => {
    const newState = !gameState.is_results_revealed;
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ is_results_revealed: newState })
        .eq("id", gameState.id || 1);

      if (!error) {
        setGameState((prev) => ({ ...prev, is_results_revealed: newState }));
        showNotification(
          newState
            ? "TOURNAMENT RESULTS REVEALED TO PROJECTOR & ALL DESKS!"
            : "Results HIDDEN. Suspense audit screen activated on Projector.",
          newState ? "success" : "warning"
        );
      } else {
        // Safe fallback if column not yet added
        setGameState((prev) => ({ ...prev, is_results_revealed: newState }));
        showNotification(`Results set to ${newState ? "REVEALED" : "HIDDEN"} (local state).`, "warning");
      }
    } catch (err) {
      setGameState((prev) => ({ ...prev, is_results_revealed: newState }));
      showNotification("Results toggle updated.", "warning");
    }
  };

  // -------------------------------------------------------------
  // AI BREAKING NEWS CATALYST (10s Gradual Transition)
  // -------------------------------------------------------------
  const handleTriggerAINewsCatalyst = async (generateFromScratch = false) => {
    if (!generateFromScratch && !newsHeadline.trim()) {
      showNotification("Please enter a news headline to analyze.", "error");
      return;
    }

    setIsAIGenerating(true);
    try {
      const targetStocksToSend = (targetScope === "stocks" && selectedStockIds.length > 0)
        ? stocks.filter((s) => selectedStockIds.includes(s.id))
        : stocks;

      const sectorOrTickers = targetScope === "stocks" && selectedStockIds.length > 0
        ? targetStocksToSend.map((s) => s.ticker).join(", ")
        : targetSector;

      const res = await fetch("/api/ai/news-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: sanitizeInput(newsHeadline),
          newsBody: sanitizeInput(newsBody),
          targetSector: sectorOrTickers,
          generateFromScratch,
          applyToDatabase: "gradual",
          gradual: true
        })
      });

      const data = await res.json();
      if (data.success && data.aiResult) {
        setAiNewsResult(data.aiResult);
        const headlineText = data.aiResult.headline;
        setNewsHeadline("");
        setNewsBody("");

        const targetList = data.stockTargets || [];
        if (targetList.length > 0) {
          setTransitionState({
            isActive: true,
            headline: headlineText,
            sector: data.aiResult.sector || sectorOrTickers,
            impactPercent: data.aiResult.stockImpacts?.[0]?.priceChangePercent || 0,
            stocksCount: targetList.length,
            secondsRemaining: 10,
            progressPercent: 0,
            currentStep: 0,
            totalSteps: 10
          });

          showNotification(
            `AI News Broadcasted! Live 10-second gradual price adjustment active across ${targetList.length} equities...`,
            "info"
          );

          await executeGradualMarketShock({
            stocksList: targetList,
            durationSeconds: 10,
            steps: 10,
            onTick: (tickInfo) => {
              setTransitionState({
                isActive: true,
                headline: headlineText,
                sector: data.aiResult.sector || sectorOrTickers,
                impactPercent: 0,
                stocksCount: targetList.length,
                currentStep: tickInfo.step,
                totalSteps: tickInfo.totalSteps,
                progressPercent: tickInfo.progressPercent,
                secondsRemaining: tickInfo.secondsRemaining,
                activePrices: tickInfo.activePrices
              });
            },
            onComplete: async () => {
              setTransitionState(null);
              showNotification(
                `AI Market Shock Complete: ${targetList.length} equities reached final target prices.`,
                "success"
              );
              await loadAdminData();
            }
          });
        } else {
          showNotification(`AI Catalyst Broadcasted: "${headlineText}"`, "success");
          await loadAdminData();
        }
      } else {
        showNotification(data.error || "Failed to generate AI news impact.", "error");
      }
    } catch (err) {
      console.error("AI News Engine error:", err);
      showNotification("AI News Engine network error.", "error");
      setTransitionState(null);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Stock Selection & Per-Stock Separate Value Helpers for News Creation
  const handleToggleStockSelection = (stockId) => {
    setSelectedStockIds((prev) => {
      const isCurrentlySelected = prev.includes(stockId);
      if (isCurrentlySelected) {
        return prev.filter((id) => id !== stockId);
      } else {
        // Initialize this stock's shock to current shockPercent if not yet customized
        setStockShocks((shocks) => ({
          ...shocks,
          [stockId]: shocks[stockId] !== undefined ? shocks[stockId] : shockPercent
        }));
        return [...prev, stockId];
      }
    });
  };

  const handleUpdateStockShock = (stockId, value) => {
    setStockShocks((prev) => ({
      ...prev,
      [stockId]: value === "" ? "" : Number(value)
    }));
  };

  const handleDeltaStockShock = (stockId, delta) => {
    setStockShocks((prev) => {
      const current = prev[stockId] !== undefined && prev[stockId] !== ""
        ? Number(prev[stockId])
        : Number(shockPercent);
      return {
        ...prev,
        [stockId]: Number((current + delta).toFixed(1))
      };
    });
  };

  const handleApplyShockToAllSelected = (percentVal) => {
    const val = Number(percentVal) || 0;
    const targetIds = targetScope === "stocks"
      ? (selectedStockIds.length > 0 ? selectedStockIds : stocks.map((s) => s.id))
      : stocks.filter((s) => s.sector === targetSector).map((s) => s.id);

    setStockShocks((prev) => {
      const updated = { ...prev };
      targetIds.forEach((id) => {
        updated[id] = val;
      });
      return updated;
    });
    showNotification(`Applied ${val >= 0 ? "+" : ""}${val}% shift to ${targetIds.length} equities.`, "info");
  };

  const handleResetStockShocks = () => {
    setStockShocks({});
    showNotification("Reset all per-stock shifts to standard baseline.", "info");
  };

  const handleSelectAllInSector = () => {
    const sectorStockIds = stocks.filter((s) => s.sector === targetSector).map((s) => s.id);
    setSelectedStockIds(sectorStockIds);
    setStockShocks((prev) => {
      const updated = { ...prev };
      sectorStockIds.forEach((id) => {
        if (updated[id] === undefined) updated[id] = shockPercent;
      });
      return updated;
    });
  };

  const handleSelectAllStocks = () => {
    const allIds = stocks.map((s) => s.id);
    setSelectedStockIds(allIds);
    setStockShocks((prev) => {
      const updated = { ...prev };
      allIds.forEach((id) => {
        if (updated[id] === undefined) updated[id] = shockPercent;
      });
      return updated;
    });
  };

  const handleClearSelectedStocks = () => {
    setSelectedStockIds([]);
  };

  // 2. Manual Broadcast News & Gradual 10s Sector/Stock Shock
  const handlePublishNewsAndShock = async (e) => {
    e.preventDefault();
    if (!newsHeadline.trim()) {
      showNotification("Please enter a news bulletin headline.", "error");
      return;
    }

    let targetStocks = [];
    if (targetScope === "stocks") {
      if (selectedStockIds.length === 0) {
        showNotification("Please select at least one specific stock to increase/decrease, or switch to Sector scope.", "error");
        return;
      }
      targetStocks = stocks.filter((s) => selectedStockIds.includes(s.id));
    } else {
      targetStocks = stocks.filter((s) => s.sector === targetSector);
    }

    if (targetStocks.length === 0) {
      showNotification("No stocks found matching the target criteria.", "error");
      return;
    }

    setIsPublishingNews(true);
    const cleanHeadline = sanitizeInput(newsHeadline);
    const cleanBody = sanitizeInput(newsBody);
    const displaySector = targetScope === "stocks"
      ? targetStocks.map((s) => s.ticker).join(", ")
      : targetSector;

    // 1. Prepare target stocks with individual separate prices
    const stocksListWithTargets = targetStocks.map((stock) => {
      const currentP = Number(stock.price);
      const customPct = stockShocks[stock.id];
      const effectivePercent = (customPct !== undefined && customPct !== "" && !isNaN(customPct))
        ? Number(customPct)
        : Number(shockPercent);
      const finalTarget = Number(Math.max(1.0, currentP * (1 + effectivePercent / 100)).toFixed(2));
      return {
        ...stock,
        effectivePercent,
        targetPrice: finalTarget
      };
    });

    const avgImpact = stocksListWithTargets.length > 0
      ? Number((stocksListWithTargets.reduce((acc, s) => acc + s.effectivePercent, 0) / stocksListWithTargets.length).toFixed(2))
      : shockPercent;

    const summaryDetails = stocksListWithTargets.length <= 6
      ? stocksListWithTargets.map((s) => `${s.ticker} (${s.effectivePercent >= 0 ? "+" : ""}${s.effectivePercent}%)`).join(", ")
      : `${stocksListWithTargets.slice(0, 4).map((s) => `${s.ticker} (${s.effectivePercent >= 0 ? "+" : ""}${s.effectivePercent}%)`).join(", ")} +${stocksListWithTargets.length - 4} more`;

    const autoBody = cleanBody || `${displaySector} market adjustment: ${summaryDetails}`;

    try {
      // 2. Insert news bulletin immediately so screens show the breaking alert
      await supabase.from("news_feed").insert([
        {
          headline: cleanHeadline,
          body: autoBody,
          sector: displaySector,
          impact_percent: avgImpact
        }
      ]);

      setNewsHeadline("");
      setNewsBody("");

      // 3. Initiate gradual 10-second transition
      setTransitionState({
        isActive: true,
        headline: cleanHeadline,
        sector: displaySector,
        impactPercent: avgImpact,
        stocksCount: targetStocks.length,
        secondsRemaining: 10,
        progressPercent: 0,
        currentStep: 0,
        totalSteps: 10
      });

      showNotification(
        `News Broadcasted! Live 10-second gradual price adjustment active across ${targetStocks.length} equities...`,
        "info"
      );

      // Execute smooth 10s price shift
      await executeGradualMarketShock({
        stocksList: stocksListWithTargets,
        durationSeconds: 10,
        steps: 10,
        onTick: (tickInfo) => {
          setTransitionState({
            isActive: true,
            headline: cleanHeadline,
            sector: displaySector,
            impactPercent: shockPercent,
            stocksCount: targetStocks.length,
            currentStep: tickInfo.step,
            totalSteps: tickInfo.totalSteps,
            progressPercent: tickInfo.progressPercent,
            secondsRemaining: tickInfo.secondsRemaining,
            activePrices: tickInfo.activePrices
          });
        },
        onComplete: async () => {
          setTransitionState(null);
          showNotification(
            `Gradual transition complete: ${targetStocks.length} equities settled at final valuation (${shockPercent >= 0 ? "+" : ""}${shockPercent}%).`,
            "success"
          );
          await loadAdminData();
        }
      });
    } catch (err) {
      console.error("Error publishing news & gradual shock:", err);
      showNotification("Failed to publish news and execute shock.", "error");
      setTransitionState(null);
    } finally {
      setIsPublishingNews(false);
    }
  };

  // 2b. Delete News Bulletin
  const handleDeleteNews = async (newsId) => {
    if (!newsId) return;
    if (!confirm("Are you sure you want to delete this news bulletin? This will remove it from all screens in real time.")) return;

    setDeletingNewsId(newsId);
    try {
      // 1. Execute via Server API route (bypasses restrictive client RLS)
      const apiRes = await fetch(`/api/admin/news?id=${newsId}`, { method: "DELETE" });
      const apiData = await apiRes.json().catch(() => ({}));

      // 2. Also attempt direct client Supabase deletion
      const { error } = await supabase
        .from("news_feed")
        .delete()
        .eq("id", newsId);

      if (error && !apiRes.ok) {
        throw new Error(apiData.error || error.message || "Failed to delete from database.");
      }

      setNews((prev) => prev.filter((item) => item.id !== newsId));
      showNotification("News bulletin permanently deleted.", "success");
      await loadAdminData();
    } catch (err) {
      console.error("Error deleting news:", err);
      showNotification(err.message || "Failed to delete news bulletin. Check Supabase RLS policy.", "error");
    } finally {
      setDeletingNewsId(null);
    }
  };

  // 2c. Clear All News Bulletins
  const handleClearAllNews = async () => {
    if (!news || news.length === 0) return;
    if (!confirm(`Are you sure you want to purge all ${news.length} news bulletins? This action cannot be undone.`)) return;

    setIsPublishingNews(true);
    try {
      const apiRes = await fetch("/api/admin/news?all=true", { method: "DELETE" });
      const { error } = await supabase
        .from("news_feed")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error && !apiRes.ok) {
        throw new Error("Failed to purge news feed.");
      }

      setNews([]);
      showNotification("All news bulletins permanently purged.", "success");
      await loadAdminData();
    } catch (err) {
      console.error("Error purging news archive:", err);
      showNotification("Failed to purge news archive.", "error");
    } finally {
      setIsPublishingNews(false);
    }
  };

  // 3. Direct Stock Price Override
  const handleSaveStockPrice = async (stockId) => {
    const p = parseFloat(newStockPrice);
    if (isNaN(p) || p <= 0) {
      showNotification("Please enter a valid stock price.", "error");
      return;
    }

    try {
      const stock = stocks.find((s) => s.id === stockId);
      const oldPrice = Number(stock?.price) || p;
      const changePct = oldPrice > 0 ? Number((((p - oldPrice) / oldPrice) * 100).toFixed(2)) : 0;

      const nowIso = new Date().toISOString();
      const existingTimestamps = Array.isArray(stock?.spark_timestamps) ? stock.spark_timestamps : [];
      const updatedTimestamps = [...existingTimestamps.slice(-9), nowIso];

      await supabase
        .from("stocks")
        .update({
          previous_price: oldPrice,
          price: p,
          change_percent: changePct,
          spark_data: stock?.spark_data ? [...stock.spark_data.slice(-9), p] : [p],
          spark_timestamps: updatedTimestamps,
          updated_at: nowIso
        })
        .eq("id", stockId);

      setEditingStock(null);
      setNewStockPrice("");
      showNotification(`Updated ${stock?.ticker} price to $${p.toFixed(2)}`, "success");
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to update stock price.", "error");
    }
  };

  // 3b. Launch Stock IPO
  const handleLaunchIpo = async (e) => {
    e.preventDefault();
    const cleanTicker = sanitizeInput(ipoForm.ticker).toUpperCase();
    const cleanName = sanitizeInput(ipoForm.name);
    const cleanPrice = parseFloat(ipoForm.price);

    if (!cleanTicker || !cleanName || isNaN(cleanPrice) || cleanPrice <= 0) {
      showNotification("Please provide valid IPO details.", "error");
      return;
    }

    try {
      const nowIso = new Date().toISOString();
      await supabase.from("stocks").insert([
        {
          ticker: cleanTicker,
          name: cleanName,
          sector: ipoForm.sector,
          price: cleanPrice,
          previous_price: cleanPrice,
          change_percent: 0,
          spark_data: [cleanPrice, cleanPrice],
          spark_timestamps: [nowIso, nowIso],
          updated_at: nowIso
        }
      ]);

      setIsIpoModalOpen(false);
      setIpoForm({ ticker: "", name: "", sector: "Technology", price: 50.0 });
      showNotification(`Successfully listed IPO for ${cleanTicker} at $${cleanPrice.toFixed(2)}`, "success");
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to launch IPO.", "error");
    }
  };

  // 3c. Delete Stock
  const handleConfirmDeleteStock = async () => {
    if (!deletingStock) return;
    try {
      await supabase.from("portfolio").delete().eq("stock_id", deletingStock.id);
      await supabase.from("transactions").delete().eq("stock_id", deletingStock.id);
      const { error } = await supabase.from("stocks").delete().eq("id", deletingStock.id);

      if (!error) {
        setStocks((prev) => prev.filter((s) => s.id !== deletingStock.id));
        showNotification(`Stock ${deletingStock.ticker} deleted successfully.`, "success");
        setDeletingStock(null);
        await loadAdminData();
      } else {
        showNotification("Failed to delete stock from database.", "error");
      }
    } catch (err) {
      showNotification("Error deleting stock.", "error");
    }
  };

  // 4. Create New Team (with optional initial members)
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeInput(newTeamForm.name);
    const cleanUser = sanitizeInput(newTeamForm.username).toLowerCase();
    const cleanPass = newTeamForm.password.trim();
    const cleanCash = parseFloat(newTeamForm.cash_balance) || 100000;
    const cleanSecretKey = (newTeamForm.secret_key || generateSecretKey()).trim().toUpperCase();

    if (!cleanName || !cleanUser || !cleanPass) {
      showNotification("Please fill in all team credentials.", "error");
      return;
    }

    try {
      const { data: createdTeams, error } = await supabase
        .from("teams")
        .insert([
          {
            name: cleanName,
            username: cleanUser,
            password: cleanPass,
            cash_balance: cleanCash,
            participant_type: "team",
            secret_key: cleanSecretKey,
            secret_key_used: false,
            is_admin: false,
            is_banned: false
          }
        ])
        .select();

      if (!error && createdTeams && createdTeams.length > 0) {
        const teamId = createdTeams[0].id;
        
        // Insert any valid initial team members ensuring at most one Lead Trader
        let hasLead = false;
        const validMembers = newTeamInitialMembers
          .filter((m) => sanitizeInput(m.name).length > 0)
          .map((m) => {
            const isLead = m.role === "Lead Trader";
            let finalRole = "Trader";
            if (isLead) {
              if (!hasLead) {
                hasLead = true;
                finalRole = "Lead Trader";
              } else {
                finalRole = "Trader";
              }
            }
            return {
              team_id: teamId,
              name: sanitizeInput(m.name),
              role: finalRole,
              secret_key: generateSecretKey().replace("KEY-", "TRD-"),
              secret_key_used: false
            };
          });

        // If members exist but none was marked Lead Trader, designate the first one as Lead Trader
        if (!hasLead && validMembers.length > 0) {
          validMembers[0].role = "Lead Trader";
        }

        if (validMembers.length > 0) {
          await supabase.from("team_members").insert(validMembers);
        }

        setIsCreateTeamModalOpen(false);
        setNewTeamForm({
          name: "",
          username: "",
          password: "password123",
          cash_balance: 100000,
          secret_key: generateSecretKey()
        });
        setNewTeamInitialMembers([
          { name: "", role: "Lead Trader" },
          { name: "", role: "Trader" }
        ]);
        showNotification(`Registered new participant team: ${cleanName} (Key: ${cleanSecretKey})`, "success");
        await loadAdminData();
      } else {
        showNotification("Failed to register team. Username or team name may already exist.", "error");
      }
    } catch (err) {
      showNotification("Failed to create team.", "error");
    }
  };

  // 4a-2. Create Individual Trader
  const handleCreateIndividualTrader = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeInput(newIndividualForm.name);
    const cleanUser = sanitizeInput(newIndividualForm.username).toLowerCase();
    const cleanPass = newIndividualForm.password.trim();
    const cleanCash = parseFloat(newIndividualForm.cash_balance) || 100000;
    const cleanTitle = sanitizeInput(newIndividualForm.trader_title) || "Independent Prop Trader";
    const cleanSecretKey = (newIndividualForm.secret_key || generateSecretKey()).trim().toUpperCase();

    if (!cleanName || !cleanUser || !cleanPass) {
      showNotification("Please fill in all trader credentials.", "error");
      return;
    }

    try {
      const { error } = await supabase.from("teams").insert([
        {
          name: cleanName,
          username: cleanUser,
          password: cleanPass,
          cash_balance: cleanCash,
          participant_type: "individual",
          trader_title: cleanTitle,
          secret_key: cleanSecretKey,
          secret_key_used: false,
          is_admin: false,
          is_banned: false
        }
      ]);

      if (!error) {
        setIsCreateIndividualModalOpen(false);
        setNewIndividualForm({
          name: "",
          username: "",
          password: "password123",
          cash_balance: 100000,
          trader_title: "Independent Prop Trader",
          secret_key: generateSecretKey()
        });
        showNotification(`Registered new Individual Trader: ${cleanName} (Key: ${cleanSecretKey})`, "success");
        await loadAdminData();
      } else {
        showNotification("Failed to register trader. Handle or name may already exist.", "error");
      }
    } catch (err) {
      showNotification("Failed to create individual trader.", "error");
    }
  };

  // 4a-2b. Regenerate One-Time Secret Key for Team / Individual
  const handleRegenerateSecretKey = async (team) => {
    const newKey = generateSecretKey();
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          secret_key: newKey,
          secret_key_used: false,
          secret_key_used_at: null,
          locked_ip: null,
          locked_device_info: null
        })
        .eq("id", team.id);

      // Unlock active desk session
      await supabase.from("team_sessions").delete().eq("team_id", team.id);

      if (!error) {
        showNotification(`Re-issued One-Time Key for ${team.name}: ${newKey}`, "success");
        await loadAdminData();
      } else {
        showNotification("Failed to regenerate secret key.", "error");
      }
    } catch (err) {
      showNotification("Error regenerating secret key.", "error");
    }
  };

  // 4a-3. Add Team Member to Existing Team
  const handleAddTeamMember = async (teamId) => {
    const cleanName = sanitizeInput(newMemberForm.name);
    if (!cleanName) {
      showNotification("Please enter a member name.", "error");
      return;
    }

    const targetRole = newMemberForm.role === "Lead Trader" ? "Lead Trader" : "Trader";

    try {
      // If new member is assigned Lead Trader, demote any current Lead Trader on this team
      if (targetRole === "Lead Trader") {
        await supabase
          .from("team_members")
          .update({ role: "Trader" })
          .eq("team_id", teamId)
          .eq("role", "Lead Trader");
      }

      const memberKey = generateSecretKey().replace("KEY-", "TRD-");
      const { error } = await supabase.from("team_members").insert([
        {
          team_id: teamId,
          name: cleanName,
          role: targetRole,
          email: sanitizeInput(newMemberForm.email) || null,
          secret_key: memberKey,
          secret_key_used: false
        }
      ]);

      if (!error) {
        setNewMemberForm({ name: "", role: "Trader", email: "" });
        showNotification(
          targetRole === "Lead Trader"
            ? `Added ${cleanName} as Lead Trader.`
            : `Added ${cleanName} to team roster.`,
          "success"
        );
        await loadAdminData();
      } else {
        showNotification("Failed to add member to team.", "error");
      }
    } catch (err) {
      showNotification("Error adding member.", "error");
    }
  };

  // 4a-4. Update Team Member Role / Name
  const handleUpdateTeamMember = async (memberId) => {
    const cleanName = sanitizeInput(editingMemberForm.name);
    if (!cleanName) {
      showNotification("Member name cannot be empty.", "error");
      return;
    }

    const targetRole = editingMemberForm.role === "Lead Trader" ? "Lead Trader" : "Trader";

    try {
      // If updating this member to Lead Trader, demote any other Lead Trader in this team
      if (targetRole === "Lead Trader" && managingRosterTeam) {
        await supabase
          .from("team_members")
          .update({ role: "Trader" })
          .eq("team_id", managingRosterTeam.id)
          .neq("id", memberId)
          .eq("role", "Lead Trader");
      }

      const { error } = await supabase
        .from("team_members")
        .update({
          name: cleanName,
          role: targetRole,
          email: sanitizeInput(editingMemberForm.email) || null
        })
        .eq("id", memberId);

      if (!error) {
        setEditingMemberId(null);
        showNotification(
          targetRole === "Lead Trader"
            ? `Updated ${cleanName} to Lead Trader.`
            : "Updated member details.",
          "success"
        );
        await loadAdminData();
      } else {
        showNotification("Failed to update member.", "error");
      }
    } catch (err) {
      showNotification("Error updating member.", "error");
    }
  };

  // 4a-5. Delete Team Member
  const handleDeleteTeamMember = async (memberId, memberName) => {
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", memberId);

      if (!error) {
        showNotification(`Removed ${memberName || "member"} from roster.`, "success");
        await loadAdminData();
      } else {
        showNotification("Failed to remove member.", "error");
      }
    } catch (err) {
      showNotification("Error deleting member.", "error");
    }
  };

  // 4b. Adjust Team Cash Balance
  const handleAdjustCash = async (teamId) => {
    const amount = parseFloat(cashAdjustmentAmount);
    if (isNaN(amount) || amount === 0) {
      showNotification("Please specify a non-zero adjustment amount.", "error");
      return;
    }

    try {
      const targetTeam = teams.find((t) => t.id === teamId);
      if (!targetTeam) {
        showNotification("Team record not found.", "error");
        return;
      }
      const newCash = Number(((Number(targetTeam.cash_balance) || 0) + amount).toFixed(2));

      await supabase
        .from("teams")
        .update({ cash_balance: newCash })
        .eq("id", teamId);

      setAdjustingTeam(null);
      showNotification(
        `Adjusted ${targetTeam.name || "Team"} cash by ${amount >= 0 ? "+$" : "-$"}${Math.abs(amount).toLocaleString()} (New: $${newCash.toLocaleString()})`,
        "success"
      );
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to adjust cash balance.", "error");
    }
  };

  // 4c. Reset Team Password
  const handleResetPassword = async (teamId) => {
    if (!newPasswordVal.trim()) {
      showNotification("Please enter a new passcode.", "error");
      return;
    }

    try {
      await supabase
        .from("teams")
        .update({ password: newPasswordVal.trim() })
        .eq("id", teamId);

      setResettingTeam(null);
      setNewPasswordVal("");
      showNotification("Team passcode updated successfully.", "success");
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to reset password.", "error");
    }
  };

  // 4d. Ban / Freeze Team
  const handleToggleBanTeam = async (team) => {
    if (!team?.id) return;
    const nextBanned = !team.is_banned;
    try {
      const { error } = await supabase
        .from("teams")
        .update({ is_banned: nextBanned })
        .eq("id", team.id);

      if (!error) {
        setTeams((prev) =>
          prev.map((t) => (t.id === team.id ? { ...t, is_banned: nextBanned } : t))
        );
        showNotification(
          nextBanned
            ? `Team "${team.name || "Participant"}" is now FROZEN (Trading Privileges Suspended).`
            : `Team "${team.name || "Participant"}" trading privileges RESTORED.`,
          nextBanned ? "warning" : "success"
        );
        await loadAdminData();
      }
    } catch (err) {
      showNotification("Failed to update team ban status.", "error");
    }
  };

  // 4e. Delete Team
  const handleConfirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    try {
      await supabase.from("portfolio").delete().eq("team_id", deletingTeam.id);
      await supabase.from("transactions").delete().eq("team_id", deletingTeam.id);
      const { error } = await supabase.from("teams").delete().eq("id", deletingTeam.id);

      if (!error) {
        setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id));
        showNotification(`Team "${deletingTeam.name}" deleted successfully.`, "success");
        setDeletingTeam(null);
        await loadAdminData();
      } else {
        showNotification("Failed to delete team from database.", "error");
      }
    } catch (err) {
      showNotification("Error deleting team.", "error");
    }
  };

  // 4f. Live Presence Helpers & Status
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const isMemberOnline = (member) => {
    if (!member || !member.last_seen_at) return false;
    const elapsed = nowTimestamp - new Date(member.last_seen_at).getTime();
    return elapsed < 45000; // Only mark online if heartbeat ping received in last 45 seconds
  };

  const isTeamLoggedIn = (teamId) => {
    if (Array.isArray(teamSessions)) {
      const sess = teamSessions.find((s) => s.team_id === teamId);
      if (sess && sess.last_seen_at) {
        const elapsed = nowTimestamp - new Date(sess.last_seen_at).getTime();
        if (elapsed < 45000) return true;
      }
    }
    return teamMembers.some((m) => m.team_id === teamId && isMemberOnline(m));
  };

  const getTeamLastSeen = (teamId) => {
    const sess = Array.isArray(teamSessions) ? teamSessions.find((s) => s.team_id === teamId) : null;
    if (sess?.last_seen_at) return sess.last_seen_at;
    const members = teamMembers.filter((m) => m.team_id === teamId && m.last_seen_at);
    if (members.length > 0) {
      members.sort((a, b) => new Date(b.last_seen_at) - new Date(a.last_seen_at));
      return members[0].last_seen_at;
    }
    return null;
  };

  const formatPresenceTime = (timestamp) => {
    if (!timestamp) return "Never";
    const ms = nowTimestamp - new Date(timestamp).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 45) return "Active now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  };

  // 4g. Sign-In Approval Actions
  const handleApproveLoginRequest = async (requestId) => {
    try {
      setIsActioningRequest(requestId);
      const res = await fetch("/api/auth/login-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "approve" })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Approval failed");
      }
      showNotification("Device sign-in APPROVED. Trading floor unlocked.", "success");
      await loadAdminData();
    } catch (err) {
      showNotification(err.message || "Failed to approve login.", "error");
    } finally {
      setIsActioningRequest(null);
    }
  };

  const handleRejectLoginRequest = async (requestId) => {
    try {
      setIsActioningRequest(requestId);
      const res = await fetch("/api/auth/login-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject" })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Rejection failed");
      }
      showNotification("Sign-in request REJECTED.", "info");
      await loadAdminData();
    } catch (err) {
      showNotification(err.message || "Failed to reject login.", "error");
    } finally {
      setIsActioningRequest(null);
    }
  };

  const handleToggleRequireApproval = async () => {
    const current = gameState?.require_login_approval !== false;
    const nextVal = !current;
    try {
      const { error } = await supabase
        .from("game_state")
        .update({ require_login_approval: nextVal })
        .eq("id", 1);
      if (error) throw error;
      setGameState((prev) => ({ ...prev, require_login_approval: nextVal }));
      showNotification(
        nextVal
          ? "Director Approval Gate ENABLED: All sign-ins require manual review."
          : "Director Approval Gate DISABLED: Participants can log in directly.",
        "success"
      );
    } catch (err) {
      showNotification("Failed to toggle approval requirement.", "error");
    }
  };

  // 4h. Member One-Time Secret Key & Device Lock Management
  const handleRegenerateMemberKey = async (memberId, memberName) => {
    const newKey = generateSecretKey().replace("KEY-", "TRD-");
    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          secret_key: newKey,
          secret_key_used: false,
          secret_key_used_at: null,
          locked_ip: null,
          locked_device_info: null
        })
        .eq("id", memberId);
      if (error) throw error;
      showNotification(`Generated new key for ${memberName}: ${newKey}`, "success");
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to regenerate member key.", "error");
    }
  };

  const handleResetMemberDeviceLock = async (memberId, memberName) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          secret_key_used: false,
          secret_key_used_at: null,
          locked_ip: null,
          locked_device_info: null,
          is_online: false
        })
        .eq("id", memberId);
      if (error) throw error;
      showNotification(`Device station unlocked for ${memberName}.`, "success");
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to reset member lock.", "error");
    }
  };

  // 4i. Single Team Force Unlock (Emergency Desk Reset)
  const handleForceUnlockTeam = async (team) => {
    if (!team || !team.id) return;
    try {
      setIsUnlockingSession(true);
      const res = await fetch("/api/auth/student-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to unlock team desk.");
      }
      setTeamSessions((prev) => prev.filter((s) => s.team_id !== team.id));
      showNotification(`Desk session unlocked for Team "${team.name}". Backup device can now log in.`, "success");
      await loadAdminData();
    } catch (err) {
      console.error("Force unlock error:", err);
      showNotification(err.message || "Failed to unlock team desk.", "error");
    } finally {
      setIsUnlockingSession(false);
    }
  };

  // 4g. Emergency Reset All Desks
  const handleUnlockAllDesks = async () => {
    const activeCount = Array.isArray(teamSessions) ? teamSessions.length : 0;
    if (activeCount === 0) {
      showNotification("No participant desks are currently locked.", "info");
      return;
    }

    const confirmReset = window.confirm(
      `Are you sure you want to unlock ALL ${activeCount} active desk sessions?\n\nThis will remove device locks across the competition floor and allow any team to log in on a new device.`
    );
    if (!confirmReset) return;

    try {
      setIsUnlockingAllSessions(true);
      const res = await fetch("/api/auth/student-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset all desk sessions.");
      }
      setTeamSessions([]);
      showNotification("All team desk sessions have been unlocked successfully.", "success");
      await loadAdminData();
    } catch (err) {
      console.error("Reset all sessions error:", err);
      showNotification(err.message || "Failed to reset all desk sessions.", "error");
    } finally {
      setIsUnlockingAllSessions(false);
    }
  };

  // Module 6: Director Master Keys Handlers
  const generateRandomAdminKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = (len) => Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return `IF-ADM-${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const handleCreateAdminKey = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeInput(newKeyForm.key_name).trim() || "Director Master Key";
    const cleanCode = sanitizeInput(newKeyForm.key_code).trim();

    if (!cleanCode || cleanCode.length < 4) {
      showNotification("Master Key must be at least 4 characters long.", "error");
      return;
    }

    setIsCreatingKey(true);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key_name: cleanName,
          key_code: cleanCode,
          is_active: newKeyForm.is_active
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create master key.");
      }

      showNotification(`Master key "${cleanName}" registered successfully.`, "success");
      setIsCreateKeyModalOpen(false);
      setNewKeyForm({ key_name: "", key_code: "", is_active: true });
      await loadAdminKeys();
    } catch (err) {
      showNotification(err.message || "Failed to create master key.", "error");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleToggleAdminKey = async (keyRecord) => {
    if (!keyRecord?.id) return;
    try {
      const res = await fetch("/api/admin/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: keyRecord.id,
          is_active: !keyRecord.is_active
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update key status.");
      }

      showNotification(`Key "${keyRecord.key_name || "Master Key"}" set to ${!keyRecord.is_active ? "ACTIVE" : "REVOKED"}.`, "success");
      await loadAdminKeys();
    } catch (err) {
      showNotification(err.message || "Failed to update key status.", "error");
    }
  };

  const handleConfirmDeleteKey = async () => {
    if (!deletingKey?.id) return;
    try {
      const res = await fetch(`/api/admin/keys?id=${deletingKey.id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete key.");
      }

      showNotification(`Key "${deletingKey.key_name || "Master Key"}" deleted permanently.`, "success");
      setDeletingKey(null);
      await loadAdminKeys();
    } catch (err) {
      showNotification(err.message || "Failed to delete master key.", "error");
    }
  };

  const copyKeyToClipboard = (text, id) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2500);
      showNotification("Master Key copied to clipboard.", "success");
    }
  };

  const toggleKeyReveal = (id) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute Leaderboard
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safePortfolios = Array.isArray(portfolios) ? portfolios : [];
  const safeStocks = Array.isArray(stocks) ? stocks : [];

  const rankedTeams = safeTeams
    .map((team) => {
      const teamHoldings = safePortfolios.filter((p) => p && p.team_id === team?.id && Number(p.shares) > 0);
      const stockValue = teamHoldings.reduce((sum, item) => {
        const stock = safeStocks.find((s) => s && s.id === item.stock_id);
        const currentPrice = Number(stock?.price) || 0;
        return sum + (Number(item?.shares) || 0) * currentPrice;
      }, 0);

      const cash = Number(team?.cash_balance) || 0;
      const netWorth = Number((cash + stockValue).toFixed(2));
      const pnl = Number((netWorth - 100000).toFixed(2));
      const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

      return {
        ...team,
        cash,
        stockValue,
        netWorth,
        pnl,
        pnlPercent,
        positionsCount: teamHoldings.length
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  const isMarketPaused = !gameState.is_market_open;

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col lg:flex-row font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805]"
    >
      {/* 1. NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`fixed top-4 right-4 sm:right-6 z-50 p-3.5 sm:p-4 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-fade-in ${notification.type === "warning"
            ? "bg-[#402b28]/15 border border-[#402b28]/30 text-[#402b28] dark:bg-[#eae0d3]/15 dark:border-[#eae0d3]/30 dark:text-[#eae0d3]"
            : notification.type === "error"
              ? "bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* 2. MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* 3. SIDEBAR NAVIGATION (Desktop Sticky & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-72 xl:w-76 bg-[var(--surface-1)] border-r border-[var(--border-color)] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-30 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Content Top */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Header & Logo */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Investor Forum Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm text-[var(--text-primary)] tracking-tight">
                    Investor Forum
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isMarketPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                  Admin Dashboard
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close navigation"
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Status Box */}
          <div className="p-3 mx-3 my-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Market Status</span>
              {isMarketPaused ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Paused</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Trading Open</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Round</span>
              <span className="text-[var(--text-primary)] font-bold truncate max-w-[130px]">
                {gameState.current_round}
              </span>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs font-mono">
              <div className="p-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Teams</span>
                <span className="font-bold text-[var(--text-primary)]">{teams.length}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Stocks</span>
                <span className="font-bold text-[var(--text-primary)]">{stocks.length}</span>
              </div>
            </div>

            {isAutoTickerActive && (
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-purple-600 dark:text-purple-400">
                <span className="flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> Auto Ticker
                </span>
                <span className="font-bold">Step #{tickCount}</span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <div className="px-3 py-1">
            <div className="px-2 py-1 text-[10px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Navigation
            </div>
            <nav className="space-y-1 mt-1">
              {[
                { id: "gamestate", num: "01", label: "Market & Timer", desc: "Market status and round clock", icon: Sliders },
                { id: "news", num: "02", label: "News & Shocks", desc: "Publish news and price shifts", icon: Sparkles },
                { id: "stocks", num: "03", label: "Stocks & Prices", desc: "Manage stocks and IPOs", icon: DollarSign },
                { id: "teams", num: "04", label: "Participants & Teams", desc: "Teams, solo traders and keys", icon: Users },
                { id: "leaderboard", num: "05", label: "Leaderboard", desc: "Rankings and portfolio totals", icon: Trophy },
                { id: "keys", num: "06", label: "Admin Keys", desc: "Manage admin access keys", icon: KeyRound }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-all text-left active:scale-[0.99] group ${
                      isActive
                        ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-white/15 dark:bg-black/15 text-current"
                            : "bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">
                          {tab.label}
                        </div>
                        <div className={`text-[10px] truncate ${isActive ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                          {tab.desc}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isActive ? "bg-white/20 dark:bg-black/20" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tab.num}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-1)] space-y-2 shrink-0">
          {/* Results visibility toggle */}
          <button
            onClick={handleToggleResultsReveal}
            title={gameState.is_results_revealed ? "Leaderboard is Visible to Students (Click to Hide)" : "Leaderboard is Hidden (Click to Show)"}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              gameState.is_results_revealed
                ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                : "bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border border-[var(--border-color)]"
            }`}
          >
            <div className="flex items-center gap-2">
              {gameState.is_results_revealed ? <Trophy className="w-3.5 h-3.5 text-amber-400 fill-current" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Leaderboard Visibility</span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-black/15 dark:bg-white/15">
              {gameState.is_results_revealed ? "Visible" : "Hidden"}
            </span>
          </button>

          {/* Quick Utilities Row */}
          <div className="grid grid-cols-3 gap-1.5">
            <a
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Big-Screen Projector Display"
              className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs transition-all"
            >
              <span>Projector</span>
              <span className="text-[10px] text-[var(--text-muted)]">↗</span>
            </a>

            <button
              onClick={handleManualRefresh}
              aria-label="Refresh operational state"
              title="Sync Admin Data"
              className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs transition-all active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#402b28] dark:text-[#eae0d3]" : ""}`} />
              <span>Sync</span>
            </button>

            <div className="flex items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)]">
              <ThemeToggle />
            </div>
          </div>

          {/* Sign Out CTA */}
          <button
            onClick={onSignOut}
            title="Sign Out of Admin"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 4. MAIN WORKSPACE COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-[var(--surface-1)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-2.5 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-color)] active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum Logo" className="h-7 w-auto object-contain shrink-0" />
            <span className="font-serif font-bold text-xs text-[var(--text-primary)] truncate">Admin Panel</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {isMarketPaused ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
                Paused
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop Context Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-[var(--surface-1)] border-b border-[var(--border-color)] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
              <span className="font-serif font-bold text-[var(--text-primary)] text-sm tracking-tight">Investor Forum Admin</span>
              <span>/</span>
              <span className="text-[var(--text-secondary)] font-medium">
                {activeTab === "gamestate" && "Market & Timer"}
                {activeTab === "news" && "News & Price Shocks"}
                {activeTab === "stocks" && "Stocks & Prices"}
                {activeTab === "teams" && "Participants & Teams"}
                {activeTab === "leaderboard" && "Leaderboard & Results"}
                {activeTab === "keys" && "Admin Security Keys"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[11px] text-[var(--text-muted)]">
              {teams.length} Teams · {stocks.length} Stocks · {news.length} News Posts
            </span>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#402b28] dark:text-[#eae0d3]" : ""}`} />
              <span className="text-xs font-bold">Sync Data</span>
            </button>
          </div>
        </div>

        {/* Main Admin Workspace Modules */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">

          {/* ========================================================================= */}
          {/* MODULE 1: MARKET CONTROLS & TIMERS */}
          {/* ========================================================================= */}
          {activeTab === "gamestate" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-[var(--border-color)] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                    Market Controls & Timer
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Control market status, round timers, breaks, and auto-ticker.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* 1. Market Status Card */}
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-[var(--text-muted)] font-medium block">
                          Trading Status
                        </span>
                        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                          Market Execution
                        </h2>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                          gameState.is_market_open
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            gameState.is_market_open ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}
                        />
                        <span>{gameState.is_market_open ? "Market is Open" : "Market is Paused"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                      {gameState.is_market_open
                        ? "Students can place buy and sell orders. Click below to pause all order placements."
                        : "Trading floor is paused. Students cannot place orders until you resume the market."}
                    </p>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleToggleMarket}
                      className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] border ${
                        gameState.is_market_open
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border-amber-500/30"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500/40 shadow-sm"
                      }`}
                    >
                      {gameState.is_market_open ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause Market (Halt Orders)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Open Market (Allow Orders)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Overview Stats Card */}
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-[var(--text-muted)] font-medium block">
                          Overview
                        </span>
                        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                          Trading Floor Numbers
                        </h2>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {teams.length} Teams
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3.5">
                      <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)]">
                        <span className="text-xs text-[var(--text-muted)] block">Total Cash on Floor</span>
                        <span className="text-base font-bold text-[var(--text-primary)] font-mono tnum block mt-0.5">
                          ${(Array.isArray(teams) ? teams : []).reduce((sum, t) => sum + (Number(t?.cash_balance) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)]">
                        <span className="text-xs text-[var(--text-muted)] block">Listed Stocks</span>
                        <span className="text-base font-bold text-[var(--text-primary)] font-mono tnum block mt-0.5">
                          {stocks.length} Companies
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Big Screen:</span>
                    <a
                      href="/projector"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#402b28] dark:text-[#eae0d3] font-bold hover:underline font-mono"
                    >
                      <span>Open Projector View</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                {/* 3. Tournament Round & Live Countdown Timer */}
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 md:col-span-2 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        <Timer className="w-4 h-4 text-[#402b28] dark:text-[#eae0d3]" />
                        <span>Round Controls & Countdown Timer</span>
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Synchronized live timer displayed on all student screens and projector.
                      </p>
                    </div>

                    {/* Live Timer Status Pill */}
                    {(() => {
                      const timing = getRoundTimingInfo(gameState);
                      return (
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[var(--text-secondary)]">Current:</span>
                          <span className="px-2.5 py-1 rounded-lg font-bold bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-color)]">
                            Round {timing.currentRoundNum} of {timing.totalRounds}
                          </span>
                          {timing.hasActiveTimer && (
                            <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{timing.roundTimeFormatted} remaining</span>
                            </span>
                          )}
                          {timing.isIntermission && (
                            <span className="px-2.5 py-1 rounded-lg font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[var(--border-color)] animate-pulse flex items-center gap-1.5">
                              <span>Break: {timing.nextRoundTimeFormatted} left</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Total Rounds */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2.5">
                      <span className="text-xs text-[var(--text-primary)] block font-bold">
                        1. Total Rounds
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        How many rounds in this competition?
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 font-mono text-xs">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleSetTotalRounds(num)}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${(gameState.total_rounds || 3) === num
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Switch Active Round */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2.5">
                      <span className="text-xs text-[var(--text-primary)] block font-bold">
                        2. Active Round
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Select which round is currently active.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-xs">
                        {Array.from({ length: gameState.total_rounds || 3 }, (_, i) => i + 1).map((roundNum) => (
                          <button
                            key={roundNum}
                            onClick={() => handleSelectRoundNumber(roundNum, `Round ${roundNum} - Active`)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${(gameState.current_round_number || 1) === roundNum
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                              }`}
                          >
                            <span>Round {roundNum}</span>
                            {(gameState.current_round_number || 1) === roundNum && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                        ))}
                        <button
                          onClick={() => handleSelectRoundNumber((gameState.total_rounds || 3) + 1, "Tournament Concluded")}
                          className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${gameState.current_round === "Tournament Concluded"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          Concluded
                        </button>
                      </div>
                    </div>

                    {/* 3. Start Timer */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2.5">
                      <span className="text-xs text-[var(--text-primary)] block font-bold">
                        3. Start Round Timer
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Start countdown for the active round.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-xs">
                        {[5, 10, 15, 20, 30].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => handleStartRoundTimer(mins)}
                            className="px-2 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold transition-all"
                          >
                            {mins}m
                          </button>
                        ))}
                        <button
                          onClick={() => handleExtendRoundTimer(2)}
                          title="Add 2 minutes"
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all"
                        >
                          +2m
                        </button>
                        <button
                          onClick={() => handleExtendRoundTimer(5)}
                          title="Add 5 minutes"
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all"
                        >
                          +5m
                        </button>
                        <button
                          onClick={handleClearRoundTimer}
                          title="Stop and clear timer"
                          className="px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/25 transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. Scheduled Break */}
                  <div className="p-3.5 rounded-xl bg-[var(--surface-3)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-xs text-[var(--text-primary)] block font-bold">
                        Break Between Rounds
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Show a countdown break on student screens before the next round begins.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        onClick={() => handleSetIntermission(2)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        2m Break
                      </button>
                      <button
                        onClick={() => handleSetIntermission(5)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        5m Break
                      </button>
                      <button
                        onClick={() => handleSetIntermission(10)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        10m Break
                      </button>
                      <button
                        onClick={handleClearIntermission}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 font-bold"
                      >
                        End Break
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Leaderboard Visibility Card */}
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 md:col-span-2 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[var(--border-color)] ${
                        gameState.is_results_revealed
                          ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805]"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                      }`}>
                        {gameState.is_results_revealed ? <Trophy className="w-4 h-4 fill-current text-amber-400" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif text-base font-bold text-[var(--text-primary)] tracking-tight">
                            Leaderboard Visibility
                          </h2>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            gameState.is_results_revealed
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] border border-[var(--border-color)]"
                          }`}>
                            {gameState.is_results_revealed ? "Results Visible" : "Hidden (Suspense Mode)"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {gameState.is_results_revealed
                            ? "Final standings and winner podium are currently visible to all participants and on the projector."
                            : "Results are hidden with a suspense screen. Reveal only at the end of the competition."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleResultsReveal}
                      className={`px-4 py-2 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 border ${
                        gameState.is_results_revealed
                          ? "bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] border-[var(--border-color)]"
                          : "bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] border-[var(--border-color)] shadow-sm"
                      }`}
                    >
                      {gameState.is_results_revealed ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Hide Results (Suspense Mode)</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-3.5 h-3.5 fill-current text-amber-400" />
                          <span>Reveal Results to Students</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* AUTOMATIC PRICE TICKER */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-base font-bold text-[var(--text-primary)] tracking-tight">
                          Automatic Price Ticker
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          {isAutoTickerActive ? "Running" : "Stopped"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Simulates live realistic price changes and charts automatically in the background.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 font-mono text-xs">
                    <button
                      onClick={handleManualTickNow}
                      disabled={isAutoTickerActive}
                      className="px-3 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Single Step</span>
                    </button>

                    <button
                      onClick={handleToggleAutoTicker}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 border ${
                        isAutoTickerActive
                          ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-sm"
                      }`}
                    >
                      {isAutoTickerActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Auto Ticker</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Auto Ticker</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Market Climate Choices */}
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">
                      Market Mood & Trend
                    </span>
                    <span className="text-[var(--text-muted)] font-mono text-[11px]">
                      Choose how the market moves
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                    {[
                      {
                        id: "BULL",
                        label: "Bull Market",
                        badge: "Upward",
                        desc: "Smooth upward growth. Great for beginner rounds."
                      },
                      {
                        id: "BALANCED",
                        label: "Balanced",
                        badge: "Normal",
                        desc: "Realistic market movement and steady momentum."
                      },
                      {
                        id: "VOLATILE",
                        label: "High Volatility",
                        badge: "Fast",
                        desc: "Wider swings and fast price moves for active trading."
                      },
                      {
                        id: "SIDEWAYS",
                        label: "Sideways",
                        badge: "Range",
                        desc: "Prices bounce inside a tight predictable channel."
                      },
                      {
                        id: "BEAR",
                        label: "Bear Market",
                        badge: "Downward",
                        desc: "Downward trend testing risk management."
                      }
                    ].map((regime) => {
                      const isSelected = marketRegime === regime.id;
                      return (
                        <button
                          key={regime.id}
                          type="button"
                          onClick={() => {
                            setMarketRegime(regime.id);
                            showNotification(`Switched market trend to ${regime.label}.`, "info");
                          }}
                          className={`p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-between border ${
                            isSelected
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-sm border-purple-500/50"
                              : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] border-[var(--border-color)]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs">{regime.label}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                isSelected
                                  ? "bg-white/20 dark:bg-black/20"
                                  : "bg-[var(--surface-3)] text-[var(--text-muted)]"
                              }`}>
                                {regime.badge}
                              </span>
                            </div>
                            <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? "opacity-90" : "text-[var(--text-muted)]"}`}>
                              {regime.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ticker Speed & Intensity */}
                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  {/* Speed */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--text-muted)] block">
                      Tick Speed
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { ms: 2000, label: "2s Fast" },
                        { ms: 4000, label: "4s Normal" },
                        { ms: 8000, label: "8s Slow" }
                      ].map((spd) => (
                        <button
                          key={spd.ms}
                          onClick={() => setTickerSpeedMs(spd.ms)}
                          className={`py-1.5 rounded-lg text-center transition-all ${
                            tickerSpeedMs === spd.ms
                              ? "bg-purple-600 text-white font-bold"
                              : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                          }`}
                        >
                          {spd.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volatility */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--text-muted)] block">
                      Swing Size
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { val: 0.5, label: "0.5x Mild" },
                        { val: 1.0, label: "1.0x Normal" },
                        { val: 2.2, label: "2.2x High" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setTickerVolatility(item.val)}
                          className={`py-1.5 rounded-lg text-center transition-all ${
                            tickerVolatility === item.val
                              ? "bg-purple-600 text-white font-bold"
                              : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-[var(--surface-2)] rounded-xl p-2.5 border border-[var(--border-color)] flex flex-col justify-center space-y-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Active Trend:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {marketRegime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Ticks Run:</span>
                      <span className="font-bold text-[var(--text-primary)] tnum">{tickCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ========================================================================= */}
          {/* MODULE 2: NEWS & MARKET SHOCKS */}
          {/* ========================================================================= */}
          {activeTab === "news" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-[var(--border-color)] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                    News & Market Shocks
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Publish breaking news stories and trigger stock price shifts across sectors or specific companies.
                  </p>
                </div>
              </div>

              {/* Live 10-Second Gradual Price Transition Progress Banner */}
              {transitionState?.isActive && (
                <div className="bg-[var(--surface-1)] rounded-xl p-4 border border-emerald-500/40 shadow-sm font-mono space-y-2.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Updating stock prices smoothly over 10 seconds...
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold px-2 py-0.5 rounded bg-emerald-500 text-white tnum">
                        {transitionState.secondsRemaining}s remaining
                      </span>
                      <span className="text-[var(--text-secondary)] font-bold tnum">
                        Step {transitionState.currentStep}/{transitionState.totalSteps}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div
                      style={{ width: `${transitionState.progressPercent}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[var(--text-secondary)]">
                    <span className="truncate">
                      Moving prices for {transitionState.stocksCount} stocks in {transitionState.sector}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] tnum">
                      {transitionState.progressPercent}% Done
                    </span>
                  </div>
                </div>
              )}

              {/* Publish News & Shock Card */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                  <div>
                    <h2 className="font-serif text-base font-bold text-[var(--text-primary)] tracking-tight">
                      Publish Breaking News & Price Shift
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Write your own story or use AI to generate a realistic market shockwave.
                    </p>
                  </div>

                  <button
                    onClick={() => handleTriggerAINewsCatalyst(true)}
                    disabled={isAIGenerating}
                    className="px-3.5 py-2 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold text-xs flex items-center justify-center gap-1.5 border border-[var(--border-color)] shadow-sm transition-all active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAIGenerating ? "Generating Story…" : "✨ Generate with AI"}</span>
                  </button>
                </div>

                {/* Quick Scenario Preset Chips */}
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-medium">
                    Quick Story Ideas (Click to Fill)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: "AI Tech Breakthrough",
                        headline: "Apex Robotics Unveils Autonomous Quantum AI Engine with 400% Efficiency Gain",
                        sector: "Technology",
                        icon: <QuantumChipIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      },
                      {
                        label: "Tech Antitrust Probe",
                        headline: "Global Regulators Launch Coordinated Probe into Tech Monopoly Practices",
                        sector: "Technology",
                        icon: <AntitrustGavelIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      },
                      {
                        label: "FDA Drug Approval",
                        headline: "FDA Grants Accelerated Approval for BioGenix Revolutionary Oncology Drug",
                        sector: "Pharmaceuticals",
                        icon: <PharmaVialIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      },
                      {
                        label: "Energy Pipeline Freeze",
                        headline: "Major Energy Pipeline Frozen Due to Severe Arctic Winter Storm",
                        sector: "Energy",
                        icon: <EnergyPipelineIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      },
                      {
                        label: "Holiday Retail Boom",
                        headline: "Consumer Goods Titans Announce Record Holiday Demand and Supply Surge",
                        sector: "Consumer Goods",
                        icon: <SupplyCrateIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewsHeadline(preset.headline);
                          setTargetSector(preset.sector);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        {preset.icon}
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[var(--text-primary)] block mb-1 font-medium">
                      1. News Headline
                    </label>
                    <input
                      type="text"
                      value={newsHeadline}
                      onChange={(e) => setNewsHeadline(e.target.value)}
                      placeholder="e.g. NovaTech announces breakthrough processor with record sales"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3] font-sans"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[var(--text-primary)] font-medium">
                        2. Story Details (Optional)
                      </label>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        {newsBody.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      placeholder="Add article description, quotes, or background story for the trading floor..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3] font-sans leading-relaxed resize-y"
                    />
                  </div>

                  {/* 3. Target Scope */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[var(--text-primary)] font-medium">
                        3. Which stocks are affected?
                      </label>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setTargetScope("sector")}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            targetScope === "sector"
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          Whole Sector ({targetSector})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetScope("stocks")}
                          className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                            targetScope === "stocks"
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <span>Specific Stocks</span>
                          {selectedStockIds.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-bold">
                              {selectedStockIds.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sector Scope View */}
                    {targetScope === "sector" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)]">
                        <div>
                          <label className="text-[var(--text-muted)] text-[11px] block mb-1 font-medium">
                            Choose Sector
                          </label>
                          <select
                            value={targetSector}
                            onChange={(e) => setTargetSector(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                          >
                            <option value="Technology">Technology</option>
                            <option value="Pharmaceuticals">Pharmaceuticals</option>
                            <option value="Energy">Energy</option>
                            <option value="Consumer Goods">Consumer Goods</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
                            Stocks in this sector ({stocks.filter(s => s.sector === targetSector).length}):
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stocks.filter(s => s.sector === targetSector).map(stock => (
                              <span key={stock.id} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-3)] text-[var(--text-primary)]">
                                {stock.ticker} (${Number(stock.price).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Specific Stocks Picker */
                      <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            Select stocks to shift ({selectedStockIds.length} of {stocks.length} chosen):
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <button
                              type="button"
                              onClick={handleSelectAllInSector}
                              className="px-2 py-0.5 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              + All {targetSector}
                            </button>
                            <button
                              type="button"
                              onClick={handleSelectAllStocks}
                              className="px-2 py-0.5 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              + Select All
                            </button>
                            {selectedStockIds.length > 0 && (
                              <button
                                type="button"
                                onClick={handleClearSelectedStocks}
                                className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-[11px] font-bold text-rose-600 dark:text-rose-400"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                          {stocks.map((stock) => {
                            const isSelected = selectedStockIds.includes(stock.id);
                            const currentPrice = Number(stock.price);
                            const stockCustomShock = stockShocks[stock.id];
                            const effectivePct = (stockCustomShock !== undefined && stockCustomShock !== "")
                              ? Number(stockCustomShock)
                              : Number(shockPercent);
                            const projectedPrice = Number((currentPrice * (1 + effectivePct / 100)).toFixed(2));
                            return (
                              <div
                                key={stock.id}
                                onClick={() => handleToggleStockSelection(stock.id)}
                                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                                  isSelected
                                    ? "bg-[#402b28]/10 dark:bg-[#eae0d3]/15 border-[#402b28] dark:border-[#eae0d3]"
                                    : "bg-[var(--surface-1)] hover:bg-[var(--surface-3)] border-[var(--border-color)] opacity-80 hover:opacity-100"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                                    {stock.ticker}
                                  </span>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    isSelected
                                      ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805]"
                                      : "border border-[var(--border-color)] text-transparent"
                                  }`}>
                                    ✓
                                  </span>
                                </div>
                                <span className="text-[11px] text-[var(--text-secondary)] truncate block mt-0.5">
                                  {stock.name}
                                </span>
                                <div className="mt-1 pt-1 border-t border-[var(--border-color)]/50 flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-[var(--text-muted)]">${currentPrice.toFixed(2)}</span>
                                  <span className={`font-bold ${effectivePct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    ➜ ${projectedPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Price Shift Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[var(--text-primary)] block mb-1 font-medium">
                        Default Price Change (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          value={shockPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setShockPercent(val);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyShockToAllSelected(shockPercent)}
                          className="px-3 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold text-xs whitespace-nowrap active:scale-95 transition-all"
                        >
                          Apply All
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={handlePublishNewsAndShock}
                        disabled={isPublishingNews || !newsHeadline.trim() || (targetScope === "stocks" && selectedStockIds.length === 0)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                      >
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {isPublishingNews ? "Publishing…" : "Publish Story & Shift Prices"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Impact Result Drawer */}
                {aiNewsResult && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] animate-fade-in text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        AI Story Generated
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          aiNewsResult.overallSentiment === "BULLISH"
                            ? "text-emerald-500 bg-emerald-500/10"
                            : aiNewsResult.overallSentiment === "BEARISH"
                            ? "text-rose-500 bg-rose-500/10"
                            : "text-[#402b28] dark:text-[#eae0d3] bg-[#402b28]/10 dark:bg-[#eae0d3]/10"
                        }`}
                      >
                        {aiNewsResult.overallSentiment} Trend
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">{aiNewsResult.headline}</h3>
                      {aiNewsResult.body && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{aiNewsResult.body}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Published News Archive */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[var(--text-primary)] font-serif">
                      Past News Stories
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
                      {news.length} Stories
                    </span>
                  </div>

                  {news.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllNews}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/25 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {news.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] py-3 text-center font-mono">No news stories published yet.</p>
                  ) : (
                    news.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 rounded font-bold bg-[var(--surface-3)] text-[var(--text-secondary)]">
                              {item.sector}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-[var(--text-primary)] mt-1">{item.headline}</h3>
                          {item.body && <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">{item.body}</p>}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {item.impact_percent !== undefined && item.impact_percent !== null && (
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                Number(item.impact_percent) >= 0
                                  ? "text-emerald-500 bg-emerald-500/10"
                                  : "text-rose-500 bg-rose-500/10"
                              }`}
                            >
                              {Number(item.impact_percent) >= 0 ? "+" : ""}{item.impact_percent}%
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item.id)}
                            disabled={deletingNewsId === item.id}
                            title="Delete story"
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 3: STOCKS & PRICES */}
          {/* ========================================================================= */}
          {activeTab === "stocks" && (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold tracking-wider uppercase">
                    03 · Stocks & Prices
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                    Listed Stocks & Live Valuation
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    View listed companies, change market prices directly, or list a new stock.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-[var(--text-muted)] px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)]">
                    {stocks.length} Companies Listed
                  </span>
                  <button
                    onClick={() => setIsIpoModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Stock</span>
                  </button>
                </div>
              </div>

              {/* Stocks Table */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)]/60 border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-semibold">
                        <th className="py-3 px-4">Ticker</th>
                        <th className="py-3 px-4">Company Name</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4 text-right">Current Price</th>
                        <th className="py-3 px-4 text-right">Change</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/70">
                      {stocks.map((stock) => {
                        const isPos = Number(stock.change_percent) >= 0;
                        return (
                          <tr key={stock.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] font-mono text-xs">
                              {stock.ticker}
                            </td>
                            <td className="py-3.5 px-4 text-[var(--text-primary)] font-medium">
                              {stock.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                {stock.sector}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)] font-mono text-xs tnum">
                              ${Number(stock.price).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                  isPos ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" : "text-rose-600 bg-rose-500/10 dark:text-rose-400"
                                }`}
                              >
                                {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingStock(stock);
                                    setNewStockPrice(Number(stock.price).toFixed(2));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95 text-xs font-medium"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit Price</span>
                                </button>

                                <button
                                  onClick={() => setDeletingStock(stock)}
                                  title={`Delete ${stock.ticker}`}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 4: PARTICIPANTS & TEAMS */}
          {/* ========================================================================= */}
          {activeTab === "teams" && (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold tracking-wider uppercase">
                    04 · Participants & Teams
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                    Participant Teams & Solo Traders
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Manage team rosters, reset device locks, and share one-time login keys.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Emergency Reset All Desks */}
                  <button
                    onClick={handleUnlockAllDesks}
                    disabled={isUnlockingAllSessions || !teamSessions || teamSessions.length === 0}
                    title="Unlock all active student devices across the competition floor"
                    className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-amber-500/25 disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Reset All Devices ({Array.isArray(teamSessions) ? teamSessions.length : 0})</span>
                  </button>

                  {/* Register Individual Trader */}
                  <button
                    onClick={() => setIsCreateIndividualModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-color)] font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                    <span>+ Solo Trader</span>
                  </button>

                  {/* Register Team */}
                  <button
                    onClick={() => setIsCreateTeamModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Team</span>
                  </button>
                </div>
              </div>

              {/* Live Sign-In Approvals Queue Card */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      loginRequests.filter(r => r.status === 'pending').length > 0
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                        <span>Device Sign-In Approval Queue</span>
                        {loginRequests.filter(r => r.status === 'pending').length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                            {loginRequests.filter(r => r.status === 'pending').length} PENDING REVIEW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ALL VERIFIED
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Authorize student hardware to prevent unauthorized users from entering the simulation.
                      </p>
                    </div>
                  </div>

                  {/* Toggle: Require Manual Approval */}
                  <div className="flex items-center gap-2.5 bg-[var(--surface-2)] px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs shrink-0">
                    <span className="font-medium text-[var(--text-secondary)]">Director Approval Gate:</span>
                    <button
                      onClick={handleToggleRequireApproval}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                        gameState?.require_login_approval !== false
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                          : "bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {gameState?.require_login_approval !== false ? "REQUIRED (ON)" : "BYPASS (OFF)"}
                    </button>
                  </div>
                </div>

                {/* Pending Requests List */}
                {loginRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] font-mono">
                    No pending sign-in requests right now. When a participant logs in, their station prompt will appear here for instant authorization.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {loginRequests.filter(r => r.status === 'pending').map((req) => (
                      <div key={req.id} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-2.5 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase block">
                              Sign-In Request
                            </span>
                            <h4 className="font-bold text-sm text-[var(--text-primary)]">{req.team_name}</h4>
                            {req.member_name && (
                              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{req.member_name}</span>
                                {req.member_role && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-muted)] font-mono">
                                    {req.member_role}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                            {formatPresenceTime(req.created_at)}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)]/70 p-2 rounded-lg truncate">
                          IP: {req.ip_address || "unknown"} • {req.user_agent ? req.user_agent.substring(0, 40) + "..." : "Station Device"}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            disabled={isActioningRequest === req.id}
                            onClick={() => handleApproveLoginRequest(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all disabled:opacity-50 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Access</span>
                          </button>
                          <button
                            disabled={isActioningRequest === req.id}
                            onClick={() => handleRejectLoginRequest(req.id)}
                            className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-50 active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Deny</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Summary Cards with Live Presence */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium">Total Desks</span>
                  <span className="text-xl font-bold font-serif text-[var(--text-primary)] mt-1 block tnum">{teams.length}</span>
                </div>
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Desks Online</span>
                  </span>
                  <span className="text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1 block tnum">
                    {teams.filter(t => isTeamLoggedIn(t.id)).length} <span className="text-xs font-sans text-[var(--text-muted)] font-normal">/ {teams.length}</span>
                  </span>
                </div>
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Members Online</span>
                  </span>
                  <span className="text-xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1 block tnum">
                    {teamMembers.filter(m => isMemberOnline(m)).length} <span className="text-xs font-sans text-[var(--text-muted)] font-normal">/ {teamMembers.length}</span>
                  </span>
                </div>
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Desks Offline</span>
                  </span>
                  <span className="text-xl font-bold font-serif text-[var(--text-muted)] mt-1 block tnum">
                    {teams.filter(t => !isTeamLoggedIn(t.id)).length}
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar with Online/Offline Filtering */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-1)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    onClick={() => setParticipantFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      participantFilter === "ALL"
                        ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    All ({teams.length})
                  </button>
                  <button
                    onClick={() => setParticipantFilter("ONLINE")}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                      participantFilter === "ONLINE"
                        ? "bg-emerald-600 text-white shadow-sm font-bold"
                        : "bg-[var(--surface-2)] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Online ({teams.filter(t => isTeamLoggedIn(t.id)).length})</span>
                  </button>
                  <button
                    onClick={() => setParticipantFilter("OFFLINE")}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                      participantFilter === "OFFLINE"
                        ? "bg-slate-700 text-white shadow-sm font-bold"
                        : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Offline ({teams.filter(t => !isTeamLoggedIn(t.id)).length})</span>
                  </button>
                  <button
                    onClick={() => setParticipantFilter("TEAMS")}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                      participantFilter === "TEAMS"
                        ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teams ({teams.filter((t) => t.participant_type !== "individual").length})</span>
                  </button>
                  <button
                    onClick={() => setParticipantFilter("INDIVIDUALS")}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                      participantFilter === "INDIVIDUALS"
                        ? "bg-[#402b28] text-white dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm font-bold"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Solo ({teams.filter((t) => t.participant_type === "individual").length})</span>
                  </button>
                </div>

                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by name, username, key, member..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3] font-sans"
                  />
                  {participantSearch && (
                    <button
                      onClick={() => setParticipantSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Teams & Traders Table */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)]/60 border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-semibold">
                        <th className="py-3 px-4">Participant &amp; Status</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Members &amp; Presence</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4">Device Station</th>
                        <th className="py-3 px-4 text-right">Cash Balance</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/70">
                      {teams
                        .filter((team) => {
                          if (participantFilter === "ONLINE" && !isTeamLoggedIn(team.id)) return false;
                          if (participantFilter === "OFFLINE" && isTeamLoggedIn(team.id)) return false;
                          if (participantFilter === "TEAMS" && team.participant_type === "individual") return false;
                          if (participantFilter === "INDIVIDUALS" && team.participant_type !== "individual") return false;
                          if (participantSearch) {
                            const query = participantSearch.toLowerCase();
                            const matchName = team.name?.toLowerCase().includes(query);
                            const matchUser = team.username?.toLowerCase().includes(query);
                            const matchKey = team.secret_key?.toLowerCase().includes(query);
                            const matchTitle = team.trader_title?.toLowerCase().includes(query);
                            const matchMember = teamMembers.some(
                              (m) => m.team_id === team.id && m.name?.toLowerCase().includes(query)
                            );
                            return matchName || matchUser || matchKey || matchTitle || matchMember;
                          }
                          return true;
                        })
                        .map((team) => {
                          const isIndividual = team.participant_type === "individual";
                          const currentMembers = teamMembers.filter((m) => m.team_id === team.id);
                          const isKeyClaimed = Boolean(team.secret_key_used);

                          return (
                            <tr key={team.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isIndividual
                                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                    }`}
                                  >
                                    {isIndividual ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                      <span>{team.name}</span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                          isIndividual
                                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                                        }`}
                                      >
                                        {isIndividual ? "Solo" : "Team"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {isTeamLoggedIn(team.id) ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          <span>ONLINE • Active</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                          <span>OFFLINE • {formatPresenceTime(getTeamLastSeen(team.id))}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-secondary)]">
                                {team.username}
                              </td>

                              {/* Members & Presence */}
                              <td className="py-3.5 px-4">
                                {isIndividual ? (
                                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                    <Briefcase className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span>{team.trader_title || "Solo Trader"}</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                                      {currentMembers.slice(0, 3).map((m) => (
                                        <span
                                          key={m.id}
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                                            isMemberOnline(m)
                                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                                              : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-color)]"
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${isMemberOnline(m) ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                          <span className="truncate max-w-[65px]">{m.name.split(" ")[0]}</span>
                                        </span>
                                      ))}
                                      {currentMembers.length > 3 && (
                                        <span className="text-[10px] font-mono text-[var(--text-muted)]">+{currentMembers.length - 3}</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => setManagingRosterTeam(team)}
                                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                                    >
                                      <Users className="w-3 h-3" />
                                      <span>Manage Roster ({currentMembers.length})</span>
                                    </button>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {team.is_banned ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center gap-1 w-fit">
                                    <Ban className="w-3 h-3" />
                                    <span>FROZEN</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>ACTIVE</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isTeamLoggedIn(team.id) ? (
                                  <div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>ONLINE</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
                                      Active station
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface-3)] text-[var(--text-muted)] flex items-center gap-1.5 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                      <span>OFFLINE</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] block mt-0.5">
                                      {formatPresenceTime(getTeamLastSeen(team.id))}
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right font-bold font-mono text-[var(--text-primary)] text-xs tnum">
                                ${Number(team.cash_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Manage Roster for Teams */}
                                  {!isIndividual && (
                                    <button
                                      onClick={() => setManagingRosterTeam(team)}
                                      title="Manage Team Members"
                                      className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-blue-600 dark:text-blue-400 transition-all active:scale-95"
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Adjust Cash */}
                                  <button
                                    onClick={() => {
                                      setAdjustingTeam(team);
                                      setCashAdjustmentAmount(5000);
                                    }}
                                    title="Adjust Cash Balance"
                                    className="px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95 text-xs font-medium"
                                  >
                                    <DollarSign className="w-3 h-3 text-amber-500" />
                                    <span>Cash</span>
                                  </button>

                                  {/* Reset Password */}
                                  <button
                                    onClick={() => {
                                      setResettingTeam(team);
                                      setNewPasswordVal("");
                                    }}
                                    title="Reset Password"
                                    className="px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95 text-xs font-medium"
                                  >
                                    <Key className="w-3 h-3 text-[var(--text-secondary)]" />
                                    <span>Pass</span>
                                  </button>

                                  {/* Force Unlock Device Session */}
                                  <button
                                    onClick={() => handleForceUnlockTeam(team)}
                                    disabled={!isTeamLoggedIn(team.id) || isUnlockingSession}
                                    title={
                                      isTeamLoggedIn(team.id)
                                        ? `Unlock ${team.name}'s device to allow sign-in elsewhere`
                                        : "Device is not currently signed in"
                                    }
                                    className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 text-xs font-medium ${
                                      isTeamLoggedIn(team.id)
                                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer"
                                        : "bg-[var(--surface-2)] text-[var(--text-muted)] opacity-35 cursor-not-allowed"
                                    }`}
                                  >
                                    <Unlock className="w-3 h-3" />
                                    <span>Unlock</span>
                                  </button>

                                  {/* Freeze / Unfreeze Toggle */}
                                  <button
                                    onClick={() => handleToggleBanTeam(team)}
                                    title={team.is_banned ? "Unfreeze trading" : "Freeze trading"}
                                    className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                                      team.is_banned
                                        ? "text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/30"
                                        : "text-amber-500 hover:bg-amber-500/10 border border-amber-500/30"
                                    }`}
                                  >
                                    {team.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Delete Team */}
                                  <button
                                    onClick={() => setDeletingTeam(team)}
                                    title={`Delete ${team.name}`}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 5: LEADERBOARD & RESULTS */}
          {/* ========================================================================= */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold tracking-wider uppercase">
                    05 · Leaderboard & Results
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                    Live Tournament Standings
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Calculated in real time by summing cash balance and stock holdings.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleResultsReveal}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-sm ${
                      gameState.is_results_revealed
                        ? "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                        : "bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] hover:opacity-90"
                    }`}
                  >
                    {gameState.is_results_revealed ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Hide Results from Students</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-3.5 h-3.5 fill-current" />
                        <span>Reveal Results to All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Podium Display (Top 3 Teams) */}
              {rankedTeams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rankedTeams.slice(0, 3).map((champ, rankIdx) => {
                    const isGold = rankIdx === 0;
                    const isSilver = rankIdx === 1;
                    const isPos = champ.pnl >= 0;

                    return (
                      <div
                        key={champ.id}
                        className={`bg-[var(--surface-1)] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between border ${
                          isGold
                            ? "border-amber-500/40 shadow-sm"
                            : isSilver
                            ? "border-slate-400/40 shadow-sm"
                            : "border-amber-700/40 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs shadow-sm ${
                                isGold
                                  ? "bg-amber-500 text-black"
                                  : isSilver
                                  ? "bg-slate-300 text-black"
                                  : "bg-amber-700 text-white"
                              }`}
                            >
                              #{rankIdx + 1}
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold font-mono">
                                {isGold ? "1st Place · Leader" : isSilver ? "2nd Place" : "3rd Place"}
                              </span>
                              <h3 className="text-sm font-bold text-[var(--text-primary)] font-sans truncate max-w-[150px]">
                                {champ.name}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                              isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                            }`}
                          >
                            {isPos ? "+" : ""}
                            {champ.pnlPercent}%
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 font-mono text-xs">
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)] block">Net Worth</span>
                            <span className="font-bold text-[var(--text-primary)] text-sm tnum">
                              ${champ.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[var(--text-muted)] block">Cash / Stocks</span>
                            <span className="text-[11px] text-[var(--text-secondary)] tnum">
                              ${(champ.cash / 1000).toFixed(0)}k / ${(champ.stockValue / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Standings Table */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)]/60 border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-semibold">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Participant Name</th>
                        <th className="py-3 px-4 text-right">Cash Balance</th>
                        <th className="py-3 px-4 text-right">Stock Value</th>
                        <th className="py-3 px-4 text-right">Total Net Worth</th>
                        <th className="py-3 px-4 text-right">Return (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/70">
                      {rankedTeams.map((team, idx) => {
                        const isPos = team.pnl >= 0;
                        return (
                          <tr key={team.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold font-mono">
                              {idx === 0 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-500/10 border border-amber-500/25">
                                  <GoldMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : idx === 1 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-slate-400/10 border border-slate-400/25">
                                  <SilverMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : idx === 2 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-700/10 border border-amber-700/25">
                                  <BronzeMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold text-[var(--text-muted)] bg-[var(--surface-2)]">
                                  {idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] flex items-center gap-2">
                              <span>{team.name}</span>
                              {team.is_banned && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/10 text-rose-500">
                                  FROZEN
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-secondary)] font-mono tnum">
                              ${team.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[var(--text-secondary)] font-mono tnum">
                              ${team.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)] font-mono tnum">
                              ${team.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                                  isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                                }`}
                              >
                                {isPos ? "+" : ""}{team.pnlPercent}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 6: ADMIN SECURITY KEYS */}
          {/* ========================================================================= */}
          {activeTab === "keys" && (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold tracking-wider uppercase">
                    06 · Admin Keys
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                    Admin Security Keys
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Generate or revoke security keys for event staff and directors to sign in.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewKeyForm({
                        key_name: "",
                        key_code: generateRandomAdminKey(),
                        is_active: true
                      });
                      setIsCreateKeyModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all duration-150 active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Admin Key</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium">Total Registered Keys</span>
                  <span className="text-xl font-bold font-serif text-[var(--text-primary)] mt-1 block tnum">{adminKeys.length}</span>
                </div>
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium">Active Keys</span>
                  <span className="text-xl font-bold font-serif text-emerald-500 mt-1 block tnum">
                    {adminKeys.filter((k) => k.is_active).length}
                  </span>
                </div>
                <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-[var(--text-muted)] block font-medium">Revoked / Disabled</span>
                  <span className="text-xl font-bold font-serif text-rose-500 mt-1 block tnum">
                    {adminKeys.filter((k) => !k.is_active).length}
                  </span>
                </div>
              </div>

              {/* Keys Table */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)]/60 border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] font-semibold">
                        <th className="py-3 px-4">Key Label / Owner</th>
                        <th className="py-3 px-4">Key Code</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/70">
                      {adminKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                            No custom admin keys found. Default system keys are active.
                          </td>
                        </tr>
                      ) : (
                        adminKeys.map((key) => {
                          const isRevealed = Boolean(revealedKeys[key.id]);
                          const isCopied = copiedKeyId === key.id;
                          return (
                            <tr key={key.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                                <div className="flex items-center gap-2">
                                  <KeyRound className="w-3.5 h-3.5 text-[#402b28] dark:text-[#eae0d3]" />
                                  <span>{key.key_name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-primary)] font-bold tracking-wider text-xs">
                                    {isRevealed ? key.key_code : "••••••••••••••••"}
                                  </span>
                                  <button
                                    onClick={() => toggleKeyReveal(key.id)}
                                    title={isRevealed ? "Hide code" : "Show code"}
                                    className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => copyKeyToClipboard(key.key_code, key.id)}
                                    title="Copy key code"
                                    className={`p-1 rounded transition-colors ${
                                      isCopied
                                        ? "text-emerald-500 bg-emerald-500/10"
                                        : "hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    }`}
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                {key.is_active ? (
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>ACTIVE</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 inline-flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>DISABLED</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono text-xs">
                                {key.created_at ? new Date(key.created_at).toLocaleDateString() : "Default"}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleToggleAdminKey(key)}
                                    title={key.is_active ? "Disable this key" : "Enable this key"}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm ${
                                      key.is_active
                                        ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/25"
                                        : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/25"
                                    }`}
                                  >
                                    {key.is_active ? "Disable Key" : "Enable Key"}
                                  </button>

                                  {key.id && !key.id.startsWith("default") && (
                                    <button
                                      onClick={() => setDeletingKey(key)}
                                      title={`Delete key "${key.key_name}"`}
                                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explainer Box */}
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] flex items-start gap-3 text-xs shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[var(--text-primary)] font-serif text-sm">How Admin Keys Work</h4>
                  <p className="text-[var(--text-secondary)] font-sans leading-relaxed text-xs">
                    Any Active key listed above lets event organizers sign in under the <strong>&quot;Admin Key&quot;</strong> tab on the login page. Disabling a key will instantly block sign-in.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. EDIT STOCK PRICE MODAL */}
      {editingStock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Change Stock Price</h3>
            <p className="text-[var(--text-secondary)] font-sans">
              Update the market price for <span className="font-bold text-[var(--text-primary)] font-mono">{editingStock.ticker}</span> ({editingStock.name}).
            </p>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium text-xs">New Share Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={newStockPrice}
                onChange={(e) => setNewStockPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono text-sm focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingStock(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStockPrice(editingStock.id)}
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD NEW STOCK MODAL */}
      {isIpoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLaunchIpo}
            className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full text-xs shadow-2xl animate-fade-in space-y-4"
          >
            <div className="border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Add New Stock</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">List a new company on the trading floor.</p>
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Ticker Symbol</label>
              <input
                type="text"
                maxLength={5}
                required
                value={ipoForm.ticker}
                onChange={(e) => setIpoForm({ ...ipoForm, ticker: e.target.value })}
                placeholder="e.g. SYNC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono uppercase focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Company Name</label>
              <input
                type="text"
                required
                value={ipoForm.name}
                onChange={(e) => setIpoForm({ ...ipoForm, name: e.target.value })}
                placeholder="e.g. Synapse AI Inc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Sector</label>
              <select
                value={ipoForm.sector}
                onChange={(e) => setIpoForm({ ...ipoForm, sector: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              >
                <option value="Technology">Technology</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Energy">Energy</option>
                <option value="Consumer Goods">Consumer Goods</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Starting Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={ipoForm.price}
                onChange={(e) => setIpoForm({ ...ipoForm, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsIpoModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Add Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CONFIRM DELETE STOCK MODAL */}
      {deletingStock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Delete Stock?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed font-sans">
              Are you sure you want to permanently delete <span className="font-bold text-[var(--text-primary)] font-mono">{deletingStock.ticker}</span> ({deletingStock.name})? All student orders and holdings for this stock will be removed.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingStock(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStock}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REGISTER NEW TEAM MODAL */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateTeam}
            className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-lg w-full text-xs shadow-2xl animate-fade-in space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Add New Team</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Create a team with multiple trader members</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamForm.name}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                  placeholder="e.g. Alpha Capital"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>

              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Login Username</label>
                <input
                  type="text"
                  required
                  value={newTeamForm.username}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, username: e.target.value })}
                  placeholder="e.g. alpha_team"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Password</label>
                <input
                  type="text"
                  required
                  value={newTeamForm.password}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>

              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Starting Cash ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newTeamForm.cash_balance}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, cash_balance: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>
            </div>



            {/* Dynamic Initial Roster */}
            <div className="border-t border-[var(--border-color)] pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[var(--text-primary)] font-medium">
                  Team Members ({newTeamInitialMembers.length})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewTeamInitialMembers([
                      ...newTeamInitialMembers,
                      { name: "", role: "Trader" }
                    ])
                  }
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Member</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {newTeamInitialMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[var(--surface-2)] p-2 rounded-xl border border-[var(--border-color)]">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...newTeamInitialMembers];
                        updated[idx].name = e.target.value;
                        setNewTeamInitialMembers(updated);
                      }}
                      placeholder={`Member #${idx + 1} Name`}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans"
                    />

                    <select
                      value={member.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        const updated = newTeamInitialMembers.map((m, i) => {
                          if (i === idx) {
                            return { ...m, role: newRole };
                          }
                          if (newRole === "Lead Trader" && m.role === "Lead Trader") {
                            return { ...m, role: "Trader" };
                          }
                          return m;
                        });
                        setNewTeamInitialMembers(updated);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans font-medium"
                    >
                      <option value="Lead Trader">Lead Trader</option>
                      <option value="Trader">Trader</option>
                    </select>

                    {newTeamInitialMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTeamInitialMembers(newTeamInitialMembers.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 shadow-sm"
              >
                Save Team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4b. REGISTER NEW SOLO TRADER MODAL */}
      {isCreateIndividualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateIndividualTrader}
            className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full text-xs shadow-2xl animate-fade-in space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Add Solo Trader</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Create an individual trader account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateIndividualModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={newIndividualForm.name}
                onChange={(e) => setNewIndividualForm({ ...newIndividualForm, name: e.target.value })}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Login Username</label>
                <input
                  type="text"
                  required
                  value={newIndividualForm.username}
                  onChange={(e) => setNewIndividualForm({ ...newIndividualForm, username: e.target.value })}
                  placeholder="e.g. alex_trader"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>

              <div>
                <label className="text-[var(--text-primary)] block mb-1 font-medium">Password</label>
                <input
                  type="text"
                  required
                  value={newIndividualForm.password}
                  onChange={(e) => setNewIndividualForm({ ...newIndividualForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
                />
              </div>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Title / Specialty (Optional)</label>
              <input
                type="text"
                value={newIndividualForm.trader_title}
                onChange={(e) => setNewIndividualForm({ ...newIndividualForm, trader_title: e.target.value })}
                placeholder="e.g. Quantitative Trader, Value Investor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Starting Cash ($ USD)</label>
              <input
                type="number"
                required
                value={newIndividualForm.cash_balance}
                onChange={(e) => setNewIndividualForm({ ...newIndividualForm, cash_balance: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>



            <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsCreateIndividualModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 shadow-sm"
              >
                Save Trader
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4c. MANAGE TEAM ROSTER MODAL */}
      {managingRosterTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-lg w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">
                    {managingRosterTeam.name} · Team Members
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Username: <span className="font-bold font-mono">{managingRosterTeam.username}</span> · <span className="text-amber-600 dark:text-amber-400 font-medium">Max 1 Lead Trader</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setManagingRosterTeam(null);
                  setEditingMemberId(null);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            {/* Member List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {teamMembers.filter((m) => m.team_id === managingRosterTeam.id).length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] text-center text-[var(--text-muted)]">
                  No members added yet. Add team members below.
                </div>
              ) : (
                teamMembers
                  .filter((m) => m.team_id === managingRosterTeam.id)
                  .map((member) => {
                    const isEditing = editingMemberId === member.id;
                    const isLead = member.role === "Lead Trader";

                    if (isEditing) {
                      return (
                        <div key={member.id} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingMemberForm.name}
                              onChange={(e) => setEditingMemberForm({ ...editingMemberForm, name: e.target.value })}
                              placeholder="Member name"
                              className="px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans"
                            />
                            <select
                              value={editingMemberForm.role}
                              onChange={(e) => setEditingMemberForm({ ...editingMemberForm, role: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans font-medium"
                            >
                              <option value="Lead Trader">Lead Trader</option>
                              <option value="Trader">Trader</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingMemberId(null)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--surface-3)] text-[var(--text-secondary)] font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTeamMember(member.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={member.id}
                        className={`p-3 rounded-xl border transition-colors ${
                          isLead
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-[var(--surface-2)] border border-[var(--border-color)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isLead
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                                  : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                                <span>{member.name}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                    isLead
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {isLead ? "👑 Lead Trader" : "Trader"}
                                </span>
                              </div>
                              {member.email && <div className="text-[11px] text-[var(--text-muted)] truncate">{member.email}</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setEditingMemberForm({
                                  name: member.name,
                                  role: member.role || "Trader",
                                  email: member.email || ""
                                });
                              }}
                              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                              title="Edit Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMember(member.id, member.name)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Live Presence & Device Station Reset */}
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--border-color)]/70 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                              isMemberOnline(member)
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                                : "bg-[var(--surface-1)] text-[var(--text-muted)] border border-[var(--border-color)]"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isMemberOnline(member) ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                              <span>{isMemberOnline(member) ? "Online" : "Offline"}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {member.secret_key_used && (
                              <button
                                type="button"
                                onClick={() => handleResetMemberDeviceLock(member.id, member.name)}
                                title="Reset device station lock"
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3 text-amber-500" />
                                <span>Unlock Device</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Add Member Form */}
            <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
              <label className="text-[var(--text-primary)] font-medium block">Add New Member</label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="Full Name (e.g. Sarah Connor)"
                  className="sm:col-span-6 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans"
                />

                <select
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  className="sm:col-span-4 px-2.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-sans font-medium"
                >
                  <option value="Trader">Trader</option>
                  <option value="Lead Trader">Lead Trader</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleAddTeamMember(managingRosterTeam.id)}
                  className="sm:col-span-2 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold text-xs hover:opacity-90 flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setManagingRosterTeam(null);
                  setEditingMemberId(null);
                }}
                className="w-full py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold hover:bg-[var(--surface-3)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADJUST CASH MODAL */}
      {adjustingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Adjust Cash Balance</h3>
            <p className="text-[var(--text-secondary)] font-sans">
              Add or remove cash for <span className="font-bold text-[var(--text-primary)]">{adjustingTeam.name}</span>.
            </p>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Amount (+ to add, - to subtract)</label>
              <input
                type="number"
                value={cashAdjustmentAmount}
                onChange={(e) => setCashAdjustmentAmount(e.target.value)}
                placeholder="+5000 or -2000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono text-sm focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingTeam(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdjustCash(adjustingTeam.id)}
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 shadow-sm"
              >
                Save Cash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RESET PASSWORD MODAL */}
      {resettingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Reset Password</h3>
            <p className="text-[var(--text-secondary)] font-sans">
              Assign a new login password for <span className="font-bold text-[var(--text-primary)]">{resettingTeam.name}</span>.
            </p>
            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">New Password</label>
              <input
                type="text"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold font-mono text-sm focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setResettingTeam(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(resettingTeam.id)}
                className="flex-1 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90 shadow-sm"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONFIRM DELETE TEAM MODAL */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Delete Participant?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed font-sans">
              Are you sure you want to permanently delete <span className="font-bold text-[var(--text-primary)]">{deletingTeam.name}</span> ({deletingTeam.username})? All portfolio positions and order history will be deleted.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingTeam(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTeam}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CREATE ADMIN KEY MODAL */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAdminKey}
            className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-md w-full text-xs shadow-2xl animate-fade-in space-y-4"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-lg bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center border border-[var(--border-color)]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Create Admin Security Key</h3>
                <span className="text-xs text-[var(--text-secondary)]">Sign-in passcode for organizers and judges</span>
              </div>
            </div>

            <div>
              <label className="text-[var(--text-primary)] block mb-1 font-medium">Key Label / Owner</label>
              <input
                type="text"
                required
                value={newKeyForm.key_name}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, key_name: e.target.value })}
                placeholder="e.g. Lead Director, Judge Desk 1, IT Ops…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-primary)] font-medium">Security Key Code</label>
                <button
                  type="button"
                  onClick={() => setNewKeyForm({ ...newKeyForm, key_code: generateRandomAdminKey() })}
                  className="text-xs text-[#402b28] dark:text-[#eae0d3] font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Randomize Key</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={newKeyForm.key_code}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, key_code: e.target.value })}
                placeholder="e.g. IF-ADM-ABCD-1234…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold tracking-wider focus:outline-none focus:border-[#402b28] dark:focus:border-[#eae0d3]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="is_key_active"
                type="checkbox"
                checked={newKeyForm.is_active}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#402b28] dark:text-[#eae0d3] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="is_key_active" className="text-[var(--text-secondary)] cursor-pointer select-none font-sans text-xs">
                Activate key immediately upon creation
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsCreateKeyModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingKey}
                className="flex-1 py-2 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isCreatingKey ? "Saving…" : "Save Admin Key"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. CONFIRM DELETE ADMIN KEY MODAL */}
      {deletingKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">Delete Admin Key?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed font-sans">
              Are you sure you want to delete <span className="font-bold text-[var(--text-primary)]">{deletingKey.key_name}</span>? Organizers using this key will no longer be able to sign in.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingKey(null)}
                className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteKey}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition-colors"
              >
                Yes, Delete Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
