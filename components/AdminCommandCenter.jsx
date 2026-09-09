"use client";

import React, { useState, useEffect, useRef } from "react";
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

  // Module 4 Form: Team Management & Ban/Delete
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [newTeamForm, setNewTeamForm] = useState({
    name: "",
    username: "",
    password: "password123",
    cash_balance: 100000
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

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("gamestate"); // 'gamestate' | 'news' | 'stocks' | 'teams' | 'leaderboard' | 'keys'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Load all competition data
  const loadAdminData = async () => {
    try {
      const [gsRes, sRes, nRes, tRes, pRes] = await Promise.all([
        supabase.from("game_state").select("*").single(),
        supabase.from("stocks").select("*").order("ticker"),
        supabase.from("news_feed").select("*").order("created_at", { ascending: false }).limit(40),
        supabase.from("teams").select("id, name, username, cash_balance, is_admin, is_banned, created_at").order("name"),
        supabase.from("portfolio").select("id, team_id, stock_id, shares, avg_buy_price")
      ]);

      if (gsRes?.data) setGameState(gsRes.data);
      if (sRes?.data) setStocks(sRes.data);
      if (nRes?.data) setNews(nRes.data);
      if (tRes?.data) setTeams(tRes.data.filter((t) => !t.is_admin));
      if (pRes?.data) setPortfolios(pRes.data);

      await loadAdminKeys();
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

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

      await supabase
        .from("stocks")
        .update({
          previous_price: oldPrice,
          price: p,
          change_percent: changePct,
          spark_data: stock?.spark_data ? [...stock.spark_data.slice(-9), p] : [p]
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
      await supabase.from("stocks").insert([
        {
          ticker: cleanTicker,
          name: cleanName,
          sector: ipoForm.sector,
          price: cleanPrice,
          previous_price: cleanPrice,
          change_percent: 0,
          spark_data: [cleanPrice, cleanPrice]
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

  // 4. Create New Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeInput(newTeamForm.name);
    const cleanUser = sanitizeInput(newTeamForm.username).toLowerCase();
    const cleanPass = newTeamForm.password.trim();
    const cleanCash = parseFloat(newTeamForm.cash_balance) || 100000;

    if (!cleanName || !cleanUser || !cleanPass) {
      showNotification("Please fill in all team credentials.", "error");
      return;
    }

    try {
      const { error } = await supabase.from("teams").insert([
        {
          name: cleanName,
          username: cleanUser,
          password: cleanPass,
          cash_balance: cleanCash,
          is_admin: false,
          is_banned: false
        }
      ]);

      if (!error) {
        setIsCreateTeamModalOpen(false);
        setNewTeamForm({ name: "", username: "", password: "password123", cash_balance: 100000 });
        showNotification(`Registered new participant team: ${cleanName}`, "success");
        await loadAdminData();
      } else {
        showNotification("Failed to register team. Username or team name may already exist.", "error");
      }
    } catch (err) {
      showNotification("Failed to create team.", "error");
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

  // Module 6: Director Master Keys Handlers
  const generateRandomAdminKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = (len) => Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return `IF-ADM-${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const loadAdminKeys = async () => {
    try {
      const res = await fetch("/api/admin/keys");
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setAdminKeys(data.keys);
      }
    } catch (err) {
      console.error("Failed to load admin master keys:", err);
    }
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-72 xl:w-80 bg-[var(--surface-1)] border-r border-[var(--border-color)] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-30 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Content Top */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Header & Logo */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-b from-[var(--surface-2)]/30 to-transparent">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Investor Forum Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-[var(--text-primary)] tracking-tight leading-none block">
                    INVESTOR FORUM
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isMarketPaused ? "bg-amber-500" : "bg-emerald-500 animate-ping"}`} />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)] inline-block">
                    DIRECTOR COMMAND DESK
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close navigation"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* System Telemetry Dashboard Widget */}
          <div className="p-3.5 mx-3.5 my-3.5 rounded-2xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">EXCHANGE PULSE</span>
              {isMarketPaused ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>PAUSED</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>LIVE TRADING</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Tournament Phase</span>
              <span className="text-[var(--text-primary)] font-bold truncate max-w-[130px]" title={gameState.current_round}>
                {gameState.current_round}
              </span>
            </div>

            {/* Micro Stats Grid in Sidebar */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div className="p-1.5 rounded-lg bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-between font-mono text-[10px]">
                <span className="text-[var(--text-muted)]">Teams</span>
                <span className="font-bold text-[var(--text-primary)]">{teams.length}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] flex items-center justify-between font-mono text-[10px]">
                <span className="text-[var(--text-muted)]">Stocks</span>
                <span className="font-bold text-[var(--text-primary)]">{stocks.length}</span>
              </div>
            </div>

            {isAutoTickerActive && (
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-purple-600 dark:text-purple-400">
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" /> Auto-Ticker Engine
                </span>
                <span className="font-bold">#{tickCount} Ticks</span>
              </div>
            )}
          </div>

          {/* Operations Modules Nav Items */}
          <div className="px-3.5 py-1">
            <div className="px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase flex items-center justify-between">
              <span>Operations Modules</span>
              <span className="text-[9px] text-[var(--text-muted)]">6 Desks</span>
            </div>
            <nav className="space-y-1.5 mt-1.5">
              {[
                { id: "gamestate", num: "01", label: "Market & Automation", desc: "Clock & exchange engine", icon: Sliders },
                { id: "news", num: "02", label: "AI News Reactor", desc: "Automated catalyst shocks", icon: Sparkles },
                { id: "stocks", num: "03", label: "Stock Matrix & IPOs", desc: "Equities, splits & prices", icon: DollarSign },
                { id: "teams", num: "04", label: "Participant & Bans", desc: "Delegates, cash & access", icon: Users },
                { id: "leaderboard", num: "05", label: "Standings Audit", desc: "Net worth & rankings", icon: Trophy },
                { id: "keys", num: "06", label: "Master Keys & Security", desc: "Director auth tokens", icon: KeyRound }
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-all duration-150 text-left active:scale-[0.99] group ${isActive
                      ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-md ring-1 ring-[#402b28]/30 dark:ring-[#eae0d3]/30"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] hover:translate-x-0.5"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive
                          ? "bg-white/15 dark:bg-black/15 text-current"
                          : "bg-[var(--surface-2)] group-hover:bg-[var(--surface-3)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold tracking-tight truncate">
                          {tab.label}
                        </div>
                        <div className={`text-[10px] truncate ${isActive ? "opacity-80 font-mono" : "text-[var(--text-muted)] font-mono"}`}>
                          {tab.desc}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${isActive ? "bg-white/20 dark:bg-black/20" : "text-[var(--text-muted)]"
                      }`}>
                      {tab.num}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--surface-1)] space-y-2.5 shrink-0">
          {/* Results reveal toggle card */}
          <button
            onClick={handleToggleResultsReveal}
            title={gameState.is_results_revealed ? "Results are REVEALED to everyone (Click to Hide)" : "Results are HIDDEN in Suspense Mode (Click to Reveal)"}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${gameState.is_results_revealed
              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[0_0_12px_rgba(64,43,40,0.3)]"
              : "bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]"
              }`}
          >
            <div className="flex items-center gap-2">
              {gameState.is_results_revealed ? <Trophy className="w-4 h-4 fill-current text-amber-400" /> : <Lock className="w-4 h-4" />}
              <span>Results Broadcast</span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-black/15 dark:bg-white/15">
              {gameState.is_results_revealed ? "REVEALED" : "SUSPENSE"}
            </span>
          </button>

          {/* Quick Utilities Row */}
          <div className="grid grid-cols-3 gap-1.5">
            <a
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Big-Screen Projector Display"
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-mono text-[11px] transition-all active:scale-95"
            >
              <span>Projector</span>
              <span className="text-[9px] text-[var(--text-muted)]">↗</span>
            </a>

            <button
              onClick={handleManualRefresh}
              aria-label="Refresh operational state"
              title="Sync Admin State"
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-mono text-[11px] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#402b28] dark:text-[#eae0d3]" : ""}`} />
              <span>Sync</span>
            </button>

            <div className="flex items-center justify-center rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
              <ThemeToggle />
            </div>
          </div>

          {/* Exit Desk CTA */}
          <button
            onClick={onSignOut}
            title="Sign Out of Admin Desk"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all duration-150 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Command Desk</span>
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
              className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum Logo" className="h-8 w-auto object-contain shrink-0" />
            <span className="font-bold text-xs text-[var(--text-primary)] truncate">Director Desk</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {isMarketPaused ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
                PAUSED
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE</span>
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop Context Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-[var(--surface-1)] border-b border-[var(--border-color)] sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
              <span>INVESTOR FORUM</span>
              <span>/</span>
              <span className="text-[var(--text-primary)] font-bold">
                {activeTab === "gamestate" && "Module 01: Market & Automation Engine"}
                {activeTab === "news" && "Module 02: AI News Reactor & Market Catalyst"}
                {activeTab === "stocks" && "Module 03: Stock Matrix & IPO Controls"}
                {activeTab === "teams" && "Module 04: Participant & Anti-Cheat Controls"}
                {activeTab === "leaderboard" && "Module 05: Tournament Standings & Audit"}
                {activeTab === "keys" && "Module 06: Director Master Keys & Security"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[10px] text-[var(--text-muted)]">
              {teams.length} Teams · {stocks.length} Securities · {news.length} Broadcasts
            </span>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#402b28] dark:text-[#eae0d3]" : ""}`} />
              <span className="text-[11px] font-bold">Sync Database</span>
            </button>
          </div>
        </div>

        {/* Main Admin Workspace Modules */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">

          {/* ========================================================================= */}
          {/* MODULE 1: MARKET OPERATIONS & AUTONOMOUS TICKER SIMULATION */}
          {/* ========================================================================= */}
          {activeTab === "gamestate" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Panic Pause Card */}
                <div className="vercel-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                          Emergency Floor Controls
                        </span>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-1">
                          Exchange Execution Status
                        </h2>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${gameState.is_market_open
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${gameState.is_market_open ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                            }`}
                        />
                        <span>{gameState.is_market_open ? "LIVE & OPEN" : "PAUSED / FROZEN"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                      Trigger an instantaneous panic freeze across all trading terminals to halt order execution during news announcements or round transitions.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleToggleMarket}
                      className={`w-full py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] ${gameState.is_market_open
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.4)]"
                        : "bg-emerald-500 text-black hover:opacity-90 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
                        }`}
                    >
                      {gameState.is_market_open ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>FREEZE TRADING FLOOR (PANIC PAUSE)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>RESUME TRADING FLOOR (ENABLE ORDERS)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Live Tournament Vital Stats */}
                <div className="vercel-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                          Live Tournament Pulse
                        </span>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-1">
                          System Liquidity & Velocity
                        </h2>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                        {teams.length} Active Desks
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] block">Total Cash Liquidity</span>
                        <span className="text-sm font-bold text-[var(--text-primary)] font-mono tnum block mt-0.5">
                          ${(Array.isArray(teams) ? teams : []).reduce((sum, t) => sum + (Number(t?.cash_balance) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] block">Listed Securities</span>
                        <span className="text-sm font-bold text-[var(--text-primary)] font-mono tnum block mt-0.5">
                          {stocks.length} Equities
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between font-mono text-xs">
                    <span className="text-[var(--text-muted)]">Big-Screen Projector:</span>
                    <a
                      href="/projector"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#402b28] dark:text-[#eae0d3] font-bold hover:underline"
                    >
                      <span>Launch Projector Stage</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                {/* 3. Tournament Round & Live Countdown Timer Engine */}
                <div className="vercel-card rounded-2xl p-6 md:col-span-2 border border-[var(--border-color)] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                        Tournament Schedule & Timekeeper Engine
                      </span>
                      <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5 flex items-center gap-2">
                        <Timer className="w-5 h-5 text-[#402b28] dark:text-[#eae0d3]" />
                        <span>Round Sequencing & Live Countdown Timers</span>
                      </h2>
                    </div>

                    {/* Live Timer Status Pill */}
                    {(() => {
                      const timing = getRoundTimingInfo(gameState);
                      return (
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[var(--text-secondary)]">CURRENT PHASE:</span>
                          <span className="px-3 py-1 rounded-lg font-bold bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]">
                            Round {timing.currentRoundNum} of {timing.totalRounds}
                          </span>
                          {timing.hasActiveTimer && (
                            <span className="px-3 py-1 rounded-lg font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] animate-pulse flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{timing.roundTimeFormatted} left</span>
                            </span>
                          )}
                          {timing.isIntermission && (
                            <span className="px-3 py-1 rounded-lg font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)] animate-pulse flex items-center gap-1.5">
                              <span>Next Round in {timing.nextRoundTimeFormatted}</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Total Rounds Config */}
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-3">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block font-bold">
                        1. Total Tournament Rounds
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Configure total number of competition rounds for the event.
                      </p>
                      <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleSetTotalRounds(num)}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all duration-150 ${(gameState.total_rounds || 3) === num
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-md"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Current Round Activation */}
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-3">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block font-bold">
                        2. Active Round Selector
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Switch which round is currently live and broadcasting.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                        {Array.from({ length: gameState.total_rounds || 3 }, (_, i) => i + 1).map((roundNum) => (
                          <button
                            key={roundNum}
                            onClick={() => handleSelectRoundNumber(roundNum, `Round ${roundNum} - Active`)}
                            className={`px-3 py-2 rounded-lg font-bold transition-all duration-150 flex items-center gap-1.5 ${(gameState.current_round_number || 1) === roundNum
                              ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-md"
                              : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                              }`}
                          >
                            <span>Round {roundNum}</span>
                            {(gameState.current_round_number || 1) === roundNum && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                        ))}
                        <button
                          onClick={() => handleSelectRoundNumber((gameState.total_rounds || 3) + 1, "Tournament Concluded")}
                          className={`px-3 py-2 rounded-lg font-bold transition-all duration-150 ${gameState.current_round === "Tournament Concluded"
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          Concluded
                        </button>
                      </div>
                    </div>

                    {/* 3. Live Timer Quick Launcher */}
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-3">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block font-bold">
                        3. Start Round Countdown
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Launch an automated synchronized timer across all screens.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-xs">
                        {[5, 10, 15, 20, 30].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => handleStartRoundTimer(mins)}
                            className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold transition-all"
                          >
                            {mins}m
                          </button>
                        ))}
                        <button
                          onClick={() => handleExtendRoundTimer(2)}
                          title="Add 2 minutes to timer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all"
                        >
                          +2m
                        </button>
                        <button
                          onClick={() => handleExtendRoundTimer(5)}
                          title="Add 5 minutes to timer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all"
                        >
                          +5m
                        </button>
                        <button
                          onClick={handleClearRoundTimer}
                          title="Stop and clear timer"
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/25 transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. Intermission / Break Scheduler */}
                  <div className="p-4 rounded-xl bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">
                        Intermission / Break Between Rounds
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Notify trading desks and projector that trading is on a scheduled pause with a countdown to next round.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSetIntermission(2)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        2 Min Break
                      </button>
                      <button
                        onClick={() => handleSetIntermission(5)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        5 Min Break
                      </button>
                      <button
                        onClick={() => handleSetIntermission(10)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold"
                      >
                        10 Min Break
                      </button>
                      <button
                        onClick={handleClearIntermission}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 font-bold"
                      >
                        End Break
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Official Results & Public Standings Broadcast Controller */}
                <div className="vercel-card rounded-2xl p-6 border-2 border-[#402b28]/30 dark:border-[#eae0d3]/30 bg-gradient-to-br from-[var(--surface-1)] to-[#402b28]/5 md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${gameState.is_results_revealed
                        ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[#402b28]/20"
                        : "bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]"
                        }`}>
                        {gameState.is_results_revealed ? <Trophy className="w-6 h-6 fill-current text-amber-400" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                            Tournament Standings & Winner Reveal Control
                          </h2>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${gameState.is_results_revealed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                            : "bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]"
                            }`}>
                            {gameState.is_results_revealed ? "PUBLICLY REVEALED" : "SUSPENSE AUDIT MODE"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                          {gameState.is_results_revealed
                            ? "Official final standings and podium champions are currently broadcasted live on the Projector display and student terminals."
                            : "Results are currently hidden. The Projector display and student desks show a dramatic 'RESULTS UNDER AUDIT / NOT OUT YET' screen."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleResultsReveal}
                      className={`px-5 py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shrink-0 ${gameState.is_results_revealed
                        ? "bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] hover:bg-[#402b28]/20 shadow-[0_0_0_1px_var(--border-color)]"
                        : "bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] shadow-lg shadow-stone-950/25"
                        }`}
                    >
                      {gameState.is_results_revealed ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>HIDE RESULTS (ENABLE SUSPENSE SCREEN)</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 fill-current text-amber-400" />
                          <span>REVEAL FINAL RESULTS TO EVERYONE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* AUTONOMOUS REAL-TIME MARKET SIMULATION ENGINE */}
              <div className="vercel-card rounded-2xl p-6 border-2 border-purple-500/20 bg-gradient-to-br from-[var(--surface-1)] to-purple-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_0_0_1px_rgba(168,85,247,0.3)] flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                          Autonomous Market Fluctuation Engine
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]">
                          AUTO-TICKER
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                        Simulates authentic live stock price micro-movements, momentum drift, and real-time chart updating in the background.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <button
                      onClick={handleManualTickNow}
                      disabled={isAutoTickerActive}
                      className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Single Tick Step</span>
                    </button>

                    <button
                      onClick={handleToggleAutoTicker}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-md ${isAutoTickerActive
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25"
                        }`}
                    >
                      {isAutoTickerActive ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Halt Auto-Ticker</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Auto-Ticker</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Market Climate & Regime Selector */}
                <div className="mt-5 pt-4 border-t border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold block font-mono">
                      Market Climate & Regime (Student Friendly Mode)
                    </label>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Calibrates macro trends, sector co-movement & mean-reversion
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-xs">
                    {[
                      {
                        id: "BULL",
                        label: "Steady Bull",
                        badge: "Easiest / Profit",
                        desc: "Smooth upward growth (+0.35% drift), low noise. Ideal for beginner student rounds.",
                        color: "emerald"
                      },
                      {
                        id: "BALANCED",
                        label: "Balanced Natural",
                        badge: "Realistic",
                        desc: "Realistic market cycles, sector rotations & moderate momentum.",
                        color: "blue"
                      },
                      {
                        id: "VOLATILE",
                        label: "Trading Frenzy",
                        badge: "High Action",
                        desc: "Fast-moving breakouts, wider swings (2.2x vol) for aggressive day trading.",
                        color: "purple"
                      },
                      {
                        id: "SIDEWAYS",
                        label: "Range-Bound",
                        badge: "Mean-Revert",
                        desc: "Calm channel oscillation with strong support & resistance bounces.",
                        color: "amber"
                      },
                      {
                        id: "BEAR",
                        label: "Bearish Squeeze",
                        badge: "Risk Defense",
                        desc: "Controlled downward pressure testing student risk control and hedging.",
                        color: "rose"
                      }
                    ].map((regime) => {
                      const isSelected = marketRegime === regime.id;
                      return (
                        <button
                          key={regime.id}
                          type="button"
                          onClick={() => {
                            setMarketRegime(regime.id);
                            showNotification(`Switched market regime to ${regime.label}.`, "info");
                          }}
                          className={`p-3 rounded-xl text-left transition-all relative flex flex-col justify-between ${isSelected
                            ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold shadow-md ring-2 ring-purple-500/50"
                            : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]"
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs">{regime.label}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${isSelected
                                ? "bg-white/20 dark:bg-black/20"
                                : "bg-[var(--surface-3)] text-[var(--text-muted)]"
                                }`}>
                                {regime.badge}
                              </span>
                            </div>
                            <p className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? "opacity-90 font-sans" : "text-[var(--text-muted)] font-sans"}`}>
                              {regime.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ticker Config Grid */}
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Speed Controls */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Tick Frequency (Interval)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { ms: 2000, label: "2s Fast" },
                        { ms: 4000, label: "4s Normal" },
                        { ms: 8000, label: "8s Slow" }
                      ].map((spd) => (
                        <button
                          key={spd.ms}
                          onClick={() => setTickerSpeedMs(spd.ms)}
                          className={`py-1.5 px-2 rounded-lg text-center transition-all ${tickerSpeedMs === spd.ms
                            ? "bg-purple-600 text-white font-bold"
                            : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
                            }`}
                        >
                          {spd.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volatility Intensity */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Volatility Multiplier
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 0.5, label: "0.5x Subtle" },
                        { val: 1.0, label: "1.0x Normal" },
                        { val: 2.2, label: "2.2x High" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setTickerVolatility(item.val)}
                          className={`py-1.5 px-2 rounded-lg text-center transition-all ${tickerVolatility === item.val
                            ? "bg-purple-600 text-white font-bold"
                            : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulation Telemetry */}
                  <div className="space-y-1 bg-[var(--surface-2)]/60 rounded-xl p-3 shadow-[0_0_0_1px_var(--border-color)] flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--text-muted)]">Active Regime:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400 uppercase">
                        {marketRegime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--text-muted)]">Total Ticks:</span>
                      <span className="font-bold text-[var(--text-primary)] tnum">{tickCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--text-muted)]">Last Tick:</span>
                      <span className="text-[var(--text-secondary)] tnum">{lastTickAt || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 2: AI NEWS REACTOR & ECONOMIC SHOCK ENGINE */}
          {/* ========================================================================= */}
          {activeTab === "news" && (
            <div className="space-y-6">
              {/* Live 10-Second Gradual Price Transition Progress Banner */}
              {transitionState?.isActive && (
                <div className="vercel-card rounded-2xl p-5 border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-[var(--surface-2)] to-emerald-500/10 shadow-lg font-mono space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Live 10-Second Gradual Price Transition Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white shadow-sm tnum">
                        {transitionState.secondsRemaining}s REMAINING
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] font-bold tnum">
                        Tick {transitionState.currentStep}/{transitionState.totalSteps}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--surface-3)] overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${transitionState.progressPercent}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[var(--text-secondary)]">
                    <span className="truncate">
                      Broadcasting price shifts across {transitionState.stocksCount} equities ({transitionState.sector})
                    </span>
                    <span className="font-bold text-[var(--text-primary)] tnum">
                      {transitionState.progressPercent}% Complete
                    </span>
                  </div>
                </div>
              )}

              {/* AI Generator Hero Box */}
              <div className="vercel-card rounded-2xl p-6 border-2 border-[#402b28]/30 dark:border-[#eae0d3]/30 bg-gradient-to-br from-[var(--surface-1)] to-[#402b28]/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] flex items-center justify-center font-bold shadow-[0_0_0_1px_rgba(0,0,0,0.1)] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                          AI News Reactor & Market Catalyst
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]">
                          AI ENGINE
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Deploy realistic economic catalysts that automatically adjust stock prices and update charts in real-time.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerAINewsCatalyst(true)}
                    disabled={isAIGenerating}
                    className="px-4 py-2.5 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-150 active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{isAIGenerating ? "Generating Shock..." : " Generate AI Breaking Shockwave"}</span>
                  </button>
                </div>

                {/* Quick Scenario Preset Chips */}
                <div className="pt-4">
                  <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-2 font-bold">
                    Quick Scenario Presets (Click to Pre-Fill)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Tech AI Quantum Surge",
                        headline: "Apex Robotics Unveils Autonomous Quantum Engine with 400% Efficiency Gain",
                        sector: "Technology",
                        icon: <QuantumChipIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      },
                      {
                        label: "Tech Antitrust Investigation",
                        headline: "Global Antitrust Regulators Launch Coordinated Probe Into Tech Monopoly Practices",
                        sector: "Technology",
                        icon: <AntitrustGavelIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      },
                      {
                        label: "Pharma FDA Clearance",
                        headline: "FDA Grants Accelerated Clearance for BioGenix Revolutionary Oncology Therapy",
                        sector: "Pharmaceuticals",
                        icon: <PharmaVialIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      },
                      {
                        label: "Energy Pipeline Disruption",
                        headline: "Key Continental Energy Pipeline Frozen Due to Severe Arctic Grid Failure",
                        sector: "Energy",
                        icon: <EnergyPipelineIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      },
                      {
                        label: "Consumer Goods Supply Surge",
                        headline: "Consumer Goods Titans Announce Record Holiday Demand and Supply Chain Surge",
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
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-mono text-[11px] transition-all active:scale-95 hover:translate-y-[-1px] flex items-center gap-1.5"
                      >
                        {preset.icon}
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom News Bulletin & Catalyst Form */}
                <div className="pt-4 space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                      1. News Bulletin Headline
                    </label>
                    <input
                      type="text"
                      value={newsHeadline}
                      onChange={(e) => setNewsHeadline(e.target.value)}
                      placeholder="e.g. NovaTech Unveils Breakthrough AI Processor / Global Regulators Launch Probe"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3] transition-all font-sans font-medium"
                    />
                  </div>

                  {/* News Paragraphs & Description Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[var(--text-secondary)] uppercase font-medium">
                        2. Article Paragraphs & Full Description (Optional Details)
                      </label>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {newsBody.length} characters · Supports multiple paragraphs
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      placeholder="Enter detailed news coverage, paragraphs, executive quotes, financial background, or press release statement. Both human readers and the AI engine will digest these paragraphs..."
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3] transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>

                  {/* 3. Target Scope & Specific Stock Selector */}
                  <div className="pt-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[var(--text-secondary)] uppercase font-medium">
                        3. Target Impact Scope & Stocks
                      </label>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTargetScope("sector")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${targetScope === "sector"
                            ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                            : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          Entire Sector ({targetSector})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetScope("stocks")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${targetScope === "stocks"
                            ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-sm"
                            : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          <span>Specific Equities</span>
                          {selectedStockIds.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-black">
                              {selectedStockIds.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sector Scope View */}
                    {targetScope === "sector" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)]">
                        <div>
                          <label className="text-[var(--text-muted)] text-[10px] uppercase block mb-1.5 font-bold">
                            Select Sector to Shift
                          </label>
                          <select
                            value={targetSector}
                            onChange={(e) => setTargetSector(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
                          >
                            <option value="Technology">Technology</option>
                            <option value="Pharmaceuticals">Pharmaceuticals</option>
                            <option value="Energy">Energy</option>
                            <option value="Consumer Goods">Consumer Goods</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">
                            Equities Affected ({stocks.filter(s => s.sector === targetSector).length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {stocks.filter(s => s.sector === targetSector).map(stock => (
                              <span key={stock.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-3)] text-[var(--text-primary)]">
                                {stock.ticker} (${Number(stock.price).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Specific Stocks Multi-Select Grid */
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                            Click equities to include in price shift ({selectedStockIds.length} of {stocks.length} selected):
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllInSector}
                              className="px-2 py-1 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              + All {targetSector}
                            </button>
                            <button
                              type="button"
                              onClick={handleSelectAllStocks}
                              className="px-2 py-1 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              + Select All ({stocks.length})
                            </button>
                            {selectedStockIds.length > 0 && (
                              <button
                                type="button"
                                onClick={handleClearSelectedStocks}
                                className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-[10px] font-bold text-rose-600 dark:text-rose-400"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
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
                                className={`p-2.5 rounded-xl transition-all relative flex flex-col justify-between ${isSelected
                                  ? "bg-[#402b28]/10 dark:bg-[#eae0d3]/15 shadow-[0_0_0_2px_#402b28] dark:shadow-[0_0_0_2px_#eae0d3]"
                                  : "bg-[var(--surface-1)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] opacity-75 hover:opacity-100"
                                  }`}
                              >
                                <div
                                  onClick={() => handleToggleStockSelection(stock.id)}
                                  className="cursor-pointer flex items-center justify-between"
                                >
                                  <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                                    {stock.ticker}
                                  </span>
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${isSelected
                                    ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805]"
                                    : "border border-[var(--border-color)] text-transparent"
                                    }`}>
                                    ✓
                                  </span>
                                </div>
                                <span
                                  onClick={() => handleToggleStockSelection(stock.id)}
                                  className="text-[10px] text-[var(--text-secondary)] truncate block mt-0.5 cursor-pointer"
                                >
                                  {stock.name}
                                </span>

                                <div className="mt-1.5 pt-1.5 border-t border-[var(--border-color)]/50 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-[var(--text-muted)]">${currentPrice.toFixed(2)}</span>
                                    <span className={`font-bold ${effectivePct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                      ➜ ${projectedPrice.toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Inline Quick Value Adjuster for selected stocks */}
                                  {isSelected && (
                                    <div className="flex items-center gap-1 pt-1">
                                      <input
                                        type="number"
                                        step="1"
                                        value={stockShocks[stock.id] !== undefined ? stockShocks[stock.id] : shockPercent}
                                        onChange={(e) => handleUpdateStockShock(stock.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="%"
                                        className="w-full px-1.5 py-0.5 rounded bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[10px] font-bold font-mono text-center text-[var(--text-primary)] focus:outline-none focus:shadow-[0_0_0_1px_#402b28]"
                                      />
                                      <span className="text-[10px] font-bold text-[var(--text-muted)]">%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Separate Values for Each Stock Breakdown Table & Bulk Bar */}
                  {(targetScope === "stocks" ? selectedStockIds.length > 0 : stocks.filter(s => s.sector === targetSector).length > 0) && (
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text-primary)] uppercase">
                              Separate Shift Values for Each Stock
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              Granular Per-Stock Controls
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">
                            Set custom increase or decrease percentages for individual equities independently.
                          </p>
                        </div>

                        {/* Bulk Apply Toolbar */}
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-[var(--text-muted)] font-bold uppercase">Presets:</span>
                          {[
                            { label: "+20%", val: 20 },
                            { label: "+10%", val: 10 },
                            { label: "+5%", val: 5 },
                            { label: "0%", val: 0 },
                            { label: "-5%", val: -5 },
                            { label: "-10%", val: -10 },
                            { label: "-20%", val: -20 }
                          ].map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyShockToAllSelected(chip.val)}
                              className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold transition-all active:scale-95"
                            >
                              {chip.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleResetStockShocks}
                            className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Individual Equities Value Table */}
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {(targetScope === "stocks"
                          ? stocks.filter(s => selectedStockIds.includes(s.id))
                          : stocks.filter(s => s.sector === targetSector)
                        ).map((stock) => {
                          const currentP = Number(stock.price);
                          const customVal = stockShocks[stock.id];
                          const effectiveVal = (customVal !== undefined && customVal !== "")
                            ? Number(customVal)
                            : Number(shockPercent);
                          const targetP = Number(Math.max(1.0, currentP * (1 + effectiveVal / 100)).toFixed(2));
                          const priceDiff = Number((targetP - currentP).toFixed(2));

                          return (
                            <div
                              key={stock.id}
                              className="p-2.5 rounded-xl bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
                            >
                              {/* Stock Info */}
                              <div className="flex items-center gap-2.5 min-w-[180px]">
                                <span className="px-2 py-1 rounded-lg bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] font-bold text-xs">
                                  {stock.ticker}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-[var(--text-primary)] truncate text-xs">
                                    {stock.name}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)]">
                                    {stock.sector} · Current: <span className="font-bold text-[var(--text-primary)]">${currentP.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Steppers & Value Input */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeltaStockShock(stock.id, -10)}
                                  className="px-1.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-rose-500 font-bold text-[10px] active:scale-95"
                                  title="Decrease by 10%"
                                >
                                  -10%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeltaStockShock(stock.id, -5)}
                                  className="px-1.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-rose-500 font-bold text-[10px] active:scale-95"
                                  title="Decrease by 5%"
                                >
                                  -5%
                                </button>

                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="1"
                                    value={stockShocks[stock.id] !== undefined ? stockShocks[stock.id] : shockPercent}
                                    onChange={(e) => handleUpdateStockShock(stock.id, e.target.value)}
                                    className="w-20 px-2 py-1 rounded-lg bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold text-center focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
                                  />
                                  <span className="font-bold text-[var(--text-muted)] text-xs">%</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeltaStockShock(stock.id, 5)}
                                  className="px-1.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-emerald-500 font-bold text-[10px] active:scale-95"
                                  title="Increase by 5%"
                                >
                                  +5%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeltaStockShock(stock.id, 10)}
                                  className="px-1.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-emerald-500 font-bold text-[10px] active:scale-95"
                                  title="Increase by 10%"
                                >
                                  +10%
                                </button>
                              </div>

                              {/* Target Price & Delta Result */}
                              <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px] pt-1 md:pt-0 border-t md:border-t-0 border-[var(--border-color)]">
                                <div className="text-right">
                                  <div className="text-[10px] text-[var(--text-muted)]">Projected Target</div>
                                  <div className="font-bold text-xs text-[var(--text-primary)]">
                                    ${targetP.toFixed(2)}
                                  </div>
                                </div>

                                <div className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${effectiveVal > 0
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : effectiveVal < 0
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : "bg-[var(--surface-3)] text-[var(--text-muted)]"
                                  }`}>
                                  <span>{effectiveVal >= 0 ? "+" : ""}{effectiveVal}%</span>
                                  <span className="text-[10px] opacity-75">({priceDiff >= 0 ? "+" : ""}${priceDiff.toFixed(2)})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Broadcast Trigger Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                        Default Baseline Price Shift (%)
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
                          className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyShockToAllSelected(shockPercent)}
                          className="px-3 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-1)] text-[var(--text-primary)] font-bold whitespace-nowrap active:scale-95 transition-all text-xs"
                        >
                          Apply To All
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end gap-2">
                      {/* Manual Broadcast */}
                      <button
                        type="button"
                        onClick={handlePublishNewsAndShock}
                        disabled={isPublishingNews || !newsHeadline.trim() || (targetScope === "stocks" && selectedStockIds.length === 0)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#ff5b4f]" />
                        <span>
                          {isPublishingNews
                            ? "Broadcasting..."
                            : targetScope === "stocks"
                              ? `Broadcast Shift (${selectedStockIds.length} Equit${selectedStockIds.length === 1 ? "y" : "ies"})`
                              : `Broadcast Shift (${stocks.filter(s => s.sector === targetSector).length} in ${targetSector})`}
                        </span>
                      </button>

                      {/* AI Engine Broadcast */}
                      <button
                        type="button"
                        onClick={() => handleTriggerAINewsCatalyst(false)}
                        disabled={isAIGenerating || !newsHeadline.trim()}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{isAIGenerating ? "Analyzing..." : "Deploy AI Shock"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Impact Result Drawer */}
                {aiNewsResult && (
                  <div className="mt-6 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] animate-fade-in font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#402b28] dark:text-[#eae0d3] font-bold uppercase tracking-wider">
                        Latest AI Shockwave Report
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${aiNewsResult.overallSentiment === "BULLISH"
                          ? "text-emerald-500 bg-emerald-500/10"
                          : aiNewsResult.overallSentiment === "BEARISH"
                            ? "text-rose-500 bg-rose-500/10"
                            : "text-[#402b28] dark:text-[#eae0d3] bg-[#402b28]/10 dark:bg-[#eae0d3]/10"
                          }`}
                      >
                        {aiNewsResult.overallSentiment} SENTIMENT
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{aiNewsResult.headline}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed font-sans">{aiNewsResult.body}</p>
                    </div>

                    {aiNewsResult.stockImpacts && (
                      <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase">Price Adjustments Executed:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aiNewsResult.stockImpacts.map((impact, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-[var(--surface-1)] flex items-center justify-between">
                              <span className="font-bold text-[var(--text-primary)]">{impact.ticker}</span>
                              <span
                                className={`font-bold ${Number(impact.priceChangePercent) >= 0 ? "text-emerald-500" : "text-rose-500"
                                  }`}
                              >
                                {Number(impact.priceChangePercent) >= 0 ? "+" : ""}
                                {impact.priceChangePercent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Broadcast History Wire */}
              <div className="vercel-card rounded-2xl p-6">
                <div className="flex items-center justify-between gap-3 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                      News Wire Broadcast Archive
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3]">
                      {news.length} Bulletins
                    </span>
                  </div>

                  {news.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllNews}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge All Broadcasts</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {news.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] font-mono py-4 text-center">No news bulletins published yet.</p>
                  ) : (
                    news.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-start justify-between gap-4 font-mono">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[var(--surface-3)] text-[var(--text-secondary)]">
                              {item.sector}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-[var(--text-primary)] mt-1">{item.headline}</h3>
                          {item.body && <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans whitespace-pre-line leading-relaxed">{item.body}</p>}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {item.impact_percent !== undefined && item.impact_percent !== null && (
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${Number(item.impact_percent) >= 0
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
                            title={`Delete news bulletin "${item.headline}"`}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all active:scale-95 disabled:opacity-40"
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
          {/* MODULE 3: STOCK MATRIX, IPO ENGINE & DELETE STOCKS */}
          {/* ========================================================================= */}
          {activeTab === "stocks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    Stock Valuation Matrix & IPO Desk
                  </h2>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Manage equity valuations, direct price overrides, IPO launches, and asset deletion.
                  </p>
                </div>

                <button
                  onClick={() => setIsIpoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold font-mono text-xs flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95 shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch New IPO</span>
                </button>
              </div>

              {/* Stocks Table */}
              <div className="vercel-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Ticker</th>
                        <th className="py-3 px-4">Company Name</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4 text-right">Current Price</th>
                        <th className="py-3 px-4 text-right">24h Shift</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {stocks.map((stock) => {
                        const isPos = Number(stock.change_percent) >= 0;
                        return (
                          <tr key={stock.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{stock.ticker}</td>
                            <td className="py-3 px-4 text-[var(--text-secondary)] font-sans font-medium">{stock.name}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-3)] text-[var(--text-secondary)]">
                                {stock.sector}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)] tnum">
                              ${Number(stock.price).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                                  }`}
                              >
                                {isPos ? "+" : ""}{Number(stock.change_percent).toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingStock(stock);
                                    setNewStockPrice(Number(stock.price).toFixed(2));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => setDeletingStock(stock)}
                                  title={`Delete ${stock.ticker}`}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all active:scale-95"
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
          {/* MODULE 4: PARTICIPANT LEDGER, BANS & CAPITAL CONTROLS */}
          {/* ========================================================================= */}
          {activeTab === "teams" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    Participant Teams & Capital Controls
                  </h2>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Manage accounts, cash injections/fines, passcode resets, freezing/banning teams, and team removal.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateTeamModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold font-mono text-xs flex items-center gap-1.5 hover:opacity-90 transition-all active:scale-95 shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Team</span>
                </button>
              </div>

              {/* Teams Table */}
              <div className="vercel-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Team Name</th>
                        <th className="py-3 px-4">Login Username</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Cash Balance</th>
                        <th className="py-3 px-4 text-center">Management Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-[var(--text-primary)] font-sans">{team.name}</td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">{team.username}</td>
                          <td className="py-3 px-4">
                            {team.is_banned ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)] flex items-center gap-1 w-fit">
                                <Ban className="w-3 h-3" />
                                <span>FROZEN (BANNED)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)] tnum">
                            ${Number(team.cash_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Adjust Cash */}
                              <button
                                onClick={() => {
                                  setAdjustingTeam(team);
                                  setCashAdjustmentAmount(5000);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95"
                              >
                                <DollarSign className="w-3 h-3 text-amber-500" />
                                <span>Cash</span>
                              </button>

                              {/* Reset Passcode */}
                              <button
                                onClick={() => {
                                  setResettingTeam(team);
                                  setNewPasswordVal("");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Key className="w-3 h-3 text-[var(--text-secondary)]" />
                                <span>Passcode</span>
                              </button>

                              {/* Ban / Unban Toggle */}
                              <button
                                onClick={() => handleToggleBanTeam(team)}
                                title={team.is_banned ? "Unban team and restore trading" : "Freeze team and revoke trading"}
                                className={`p-1.5 rounded-lg transition-all active:scale-95 ${team.is_banned
                                  ? "text-emerald-500 hover:bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                                  : "text-amber-500 hover:bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]"
                                  }`}
                              >
                                {team.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Team */}
                              <button
                                onClick={() => setDeletingTeam(team)}
                                title={`Delete team ${team.name}`}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 5: LEADERBOARD & AUDIT STANDINGS */}
          {/* ========================================================================= */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    Tournament Standings & Audit Ledger
                  </h2>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Real-time participant valuation calculated by Cash Balance + Portfolio Market Value.
                  </p>
                </div>

                <button
                  onClick={handleToggleResultsReveal}
                  className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-md ${gameState.is_results_revealed
                    ? "bg-[#402b28]/20 dark:bg-[#eae0d3]/20 text-[#402b28] dark:text-[#eae0d3] hover:opacity-90 shadow-[0_0_0_1px_rgba(64,43,40,0.4)]"
                    : "bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] hover:opacity-90 shadow-lg shadow-[#402b28]/20"
                    }`}
                >
                  {gameState.is_results_revealed ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Hide Results (Auditorium Suspense)</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-3.5 h-3.5 fill-current" />
                      <span>Reveal Final Results To All</span>
                    </>
                  )}
                </button>
              </div>

              {/* Podium Display (Top 3 Teams) */}
              {rankedTeams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rankedTeams.slice(0, 3).map((champ, rankIdx) => {
                    const isGold = rankIdx === 0;
                    const isSilver = rankIdx === 1;
                    const isBronze = rankIdx === 2;
                    const isPos = champ.pnl >= 0;

                    return (
                      <div
                        key={champ.id}
                        className={`vercel-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between border-2 ${isGold
                          ? "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[var(--surface-1)] to-[var(--surface-1)] shadow-lg shadow-amber-500/10"
                          : isSilver
                            ? "border-slate-400/40 bg-gradient-to-b from-slate-400/10 via-[var(--surface-1)] to-[var(--surface-1)]"
                            : "border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-[var(--surface-1)] to-[var(--surface-1)]"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm shadow-md ${isGold
                                ? "bg-amber-500 text-black shadow-amber-500/30"
                                : isSilver
                                  ? "bg-slate-300 text-black shadow-slate-300/30"
                                  : "bg-amber-700 text-white shadow-amber-700/30"
                                }`}
                            >
                              #{rankIdx + 1}
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                                {isGold ? "Leader & 1st Place" : isSilver ? "2nd Place" : "3rd Place"}
                              </span>
                              <h3 className="text-sm font-bold text-[var(--text-primary)] font-sans truncate max-w-[150px]">
                                {champ.name}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
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
                            <span className="text-[10px] text-[var(--text-muted)] block">Cash / Stock</span>
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
              <div className="vercel-card rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Participant Team</th>
                        <th className="py-3 px-4 text-right">Cash Power</th>
                        <th className="py-3 px-4 text-right">Holdings Value</th>
                        <th className="py-3 px-4 text-right">Total Net Worth</th>
                        <th className="py-3 px-4 text-right">Tournament P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {rankedTeams.map((team, idx) => {
                        const isPos = team.pnl >= 0;
                        return (
                          <tr key={team.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                            <td className="py-3 px-4 font-bold">
                              {idx === 0 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]">
                                  <GoldMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : idx === 1 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-slate-400/10 shadow-[0_0_0_1px_rgba(203,213,225,0.25)]">
                                  <SilverMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : idx === 2 ? (
                                <div className="inline-flex items-center justify-center p-0.5 rounded-md bg-amber-700/10 shadow-[0_0_0_1px_rgba(180,83,9,0.25)]">
                                  <BronzeMedalIcon className="w-5 h-5 drop-shadow" />
                                </div>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold text-[var(--text-muted)] bg-[var(--surface-3)]">
                                  {idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-[var(--text-primary)] font-sans flex items-center gap-2">
                              <span>{team.name}</span>
                              {team.is_banned && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-rose-500/10 text-rose-500">
                                  BANNED
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--text-secondary)] tnum">
                              ${team.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--text-secondary)] tnum">
                              ${team.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)] tnum">
                              ${team.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
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
          {/* MODULE 6: MASTER KEYS & ADMINISTRATIVE AUTH CREDENTIALS */}
          {/* ========================================================================= */}
          {activeTab === "keys" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#402b28] dark:text-[#eae0d3]" />
                    <span>Director Master Keys & Access Control</span>
                  </h2>
                  <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                    Generate, audit, and revoke master access passcodes used for director logins at the /admin portal.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewKeyForm({
                      key_name: "",
                      key_code: generateRandomAdminKey(),
                      is_active: true
                    });
                    setIsCreateKeyModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold font-mono text-xs flex items-center gap-2 shadow-md transition-all duration-150 active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Master Key</span>
                </button>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="vercel-card rounded-2xl p-4 border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] uppercase text-[10px] block">Total Registered Keys</span>
                  <span className="text-xl font-bold text-[var(--text-primary)] mt-1 block tnum">{adminKeys.length}</span>
                </div>
                <div className="vercel-card rounded-2xl p-4 border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] uppercase text-[10px] block">Active Valid Keys</span>
                  <span className="text-xl font-bold text-emerald-500 mt-1 block tnum">
                    {adminKeys.filter((k) => k.is_active).length}
                  </span>
                </div>
                <div className="vercel-card rounded-2xl p-4 border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] uppercase text-[10px] block">Revoked / Inactive Keys</span>
                  <span className="text-xl font-bold text-rose-500 mt-1 block tnum">
                    {adminKeys.filter((k) => !k.is_active).length}
                  </span>
                </div>
              </div>

              {/* Keys Table */}
              <div className="vercel-card rounded-2xl overflow-hidden border border-[var(--border-color)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Designation / Label</th>
                        <th className="py-3.5 px-4">Master Passcode</th>
                        <th className="py-3.5 px-4">Access Status</th>
                        <th className="py-3.5 px-4">Created Date</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {adminKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                            No custom admin keys found in database. Default keys are active.
                          </td>
                        </tr>
                      ) : (
                        adminKeys.map((key) => {
                          const isRevealed = Boolean(revealedKeys[key.id]);
                          const isCopied = copiedKeyId === key.id;
                          return (
                            <tr key={key.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] font-sans">
                                <div className="flex items-center gap-2">
                                  <KeyRound className="w-3.5 h-3.5 text-[#402b28] dark:text-[#eae0d3]" />
                                  <span>{key.key_name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono bg-[var(--surface-2)] px-2.5 py-1 rounded-lg shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold tracking-wider">
                                    {isRevealed ? key.key_code : "••••••••••••••••"}
                                  </span>
                                  <button
                                    onClick={() => toggleKeyReveal(key.id)}
                                    title={isRevealed ? "Mask passcode" : "Reveal passcode"}
                                    className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => copyKeyToClipboard(key.key_code, key.id)}
                                    title="Copy passcode to clipboard"
                                    className={`p-1 rounded transition-colors ${isCopied
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
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>ACTIVE (AUTHORIZED)</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.25)] inline-flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>REVOKED (DISABLED)</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                                {key.created_at ? new Date(key.created_at).toLocaleDateString() : "Default"}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleToggleAdminKey(key)}
                                    title={key.is_active ? "Revoke access for this key" : "Re-activate access for this key"}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm ${key.is_active
                                      ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
                                      : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                                      }`}
                                  >
                                    {key.is_active ? "Revoke Access" : "Activate Key"}
                                  </button>

                                  {key.id && !key.id.startsWith("default") && (
                                    <button
                                      onClick={() => setDeletingKey(key)}
                                      title={`Delete master key "${key.key_name}"`}
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all active:scale-95"
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
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-start gap-3 font-mono text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[var(--text-primary)]">How Master Keys Work</h4>
                  <p className="text-[var(--text-secondary)] font-sans leading-relaxed text-xs">
                    Any Active key configured here grants immediate access to tournament operators when entering the code under the <strong>&quot;Master Key&quot;</strong> tab on the director login screen. Revoking a key instantly blocks future sign-in attempts.
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
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Override Stock Price</h3>
            <p className="text-[var(--text-secondary)]">
              Modify valuation for <span className="font-bold text-[var(--text-primary)]">{editingStock.ticker}</span> ({editingStock.name}).
            </p>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">NEW SHARE PRICE ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={newStockPrice}
                onChange={(e) => setNewStockPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold text-sm focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingStock(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStockPrice(editingStock.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAUNCH IPO MODAL */}
      {isIpoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLaunchIpo}
            className="vercel-card rounded-2xl p-6 max-w-md w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4"
          >
            <h3 className="text-sm font-bold text-[var(--text-primary)]">List New Stock (IPO)</h3>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">TICKER SYMBOL</label>
              <input
                type="text"
                maxLength={5}
                required
                value={ipoForm.ticker}
                onChange={(e) => setIpoForm({ ...ipoForm, ticker: e.target.value })}
                placeholder="e.g. SYNC"
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold uppercase"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">COMPANY NAME</label>
              <input
                type="text"
                required
                value={ipoForm.name}
                onChange={(e) => setIpoForm({ ...ipoForm, name: e.target.value })}
                placeholder="e.g. Synapse AI Inc."
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">SECTOR</label>
              <select
                value={ipoForm.sector}
                onChange={(e) => setIpoForm({ ...ipoForm, sector: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="Technology">Technology</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Energy">Energy</option>
                <option value="Consumer Goods">Consumer Goods</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">INITIAL LISTING PRICE ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={ipoForm.price}
                onChange={(e) => setIpoForm({ ...ipoForm, price: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsIpoModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90"
              >
                Launch IPO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CONFIRM DELETE STOCK MODAL */}
      {deletingStock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Delete Stock Asset?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-[var(--text-primary)]">{deletingStock.ticker}</span> ({deletingStock.name})? All associated student positions and trade logs will be removed.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingStock(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStock}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REGISTER NEW TEAM MODAL */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTeam}
            className="vercel-card rounded-2xl p-6 max-w-md w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4"
          >
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Register Participant Team</h3>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">TEAM DISPLAY NAME</label>
              <input
                type="text"
                required
                value={newTeamForm.name}
                onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                placeholder="e.g. Nexus Capital"
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">LOGIN USERNAME (TEAM ID)</label>
              <input
                type="text"
                required
                value={newTeamForm.username}
                onChange={(e) => setNewTeamForm({ ...newTeamForm, username: e.target.value })}
                placeholder="e.g. team5"
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">INITIAL PASSCODE</label>
              <input
                type="text"
                required
                value={newTeamForm.password}
                onChange={(e) => setNewTeamForm({ ...newTeamForm, password: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">STARTING CASH ($ USD)</label>
              <input
                type="number"
                required
                value={newTeamForm.cash_balance}
                onChange={(e) => setNewTeamForm({ ...newTeamForm, cash_balance: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90"
              >
                Register Team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. ADJUST CASH MODAL */}
      {adjustingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Adjust Cash Balance</h3>
            <p className="text-[var(--text-secondary)]">
              Inject capital grant or fine for <span className="font-bold text-[var(--text-primary)]">{adjustingTeam.name}</span>.
            </p>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">DELTA AMOUNT (USE NEGATIVE FOR FINES)</label>
              <input
                type="number"
                value={cashAdjustmentAmount}
                onChange={(e) => setCashAdjustmentAmount(e.target.value)}
                placeholder="+5000 or -2000"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold text-sm focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingTeam(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdjustCash(adjustingTeam.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RESET PASSCODE MODAL */}
      {resettingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Reset Team Passcode</h3>
            <p className="text-[var(--text-secondary)]">
              Assign a new login passcode for <span className="font-bold text-[var(--text-primary)]">{resettingTeam.name}</span>.
            </p>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">NEW PASSCODE</label>
              <input
                type="text"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold text-sm focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setResettingTeam(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(resettingTeam.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold hover:opacity-90"
              >
                Save Passcode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONFIRM DELETE TEAM MODAL */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Delete Participant Team?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-[var(--text-primary)]">{deletingTeam.name}</span> ({deletingTeam.username})? All associated portfolio positions, cash, and transactions will be erased.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingTeam(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTeam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md"
              >
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CREATE ADMIN MASTER KEY MODAL */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAdminKey}
            className="vercel-card rounded-2xl p-6 max-w-md w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4 border border-[var(--border-color)]"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-xl bg-[#402b28]/10 dark:bg-[#eae0d3]/15 text-[#402b28] dark:text-[#eae0d3] flex items-center justify-center shadow-[0_0_0_1px_rgba(64,43,40,0.2)]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Generate Director Master Key</h3>
                <span className="text-[10px] text-[var(--text-muted)]">Admin Portal Master Passcode</span>
              </div>
            </div>

            <div>
              <label className="text-[var(--text-muted)] block mb-1 uppercase font-medium">KEY DESIGNATION / OWNER</label>
              <input
                type="text"
                required
                value={newKeyForm.key_name}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, key_name: e.target.value })}
                placeholder="e.g. Lead Director, Judge Station 1, IT Ops…"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-sans focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-muted)] uppercase font-medium">MASTER PASSCODE CODE</label>
                <button
                  type="button"
                  onClick={() => setNewKeyForm({ ...newKeyForm, key_code: generateRandomAdminKey() })}
                  className="text-[10px] text-[#402b28] dark:text-[#eae0d3] font-bold hover:underline flex items-center gap-1"
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
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-mono font-bold tracking-wider focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
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
              <label htmlFor="is_key_active" className="text-[var(--text-secondary)] cursor-pointer select-none">
                Activate key immediately upon creation
              </label>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsCreateKeyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingKey}
                className="flex-1 py-2.5 rounded-xl bg-[#402b28] hover:bg-[#1b0805] text-[#f8f4ed] dark:bg-[#eae0d3] dark:hover:bg-[#ffffff] dark:text-[#1b0805] font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isCreatingKey ? "Saving…" : "Save Master Key"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. CONFIRM DELETE MASTER KEY MODAL */}
      {deletingKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="vercel-card rounded-2xl p-6 max-w-sm w-full font-mono text-xs shadow-2xl animate-fade-in space-y-4 border border-[var(--border-color)]">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Delete Master Key?</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed font-sans">
              Are you sure you want to delete <span className="font-bold text-[var(--text-primary)] font-mono">{deletingKey.key_name}</span>? Tournament operators using this key will no longer be authorized to sign in.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingKey(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteKey}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md transition-all active:scale-95"
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
