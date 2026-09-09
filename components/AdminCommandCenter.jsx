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
  TrendingUp,
  TrendingDown,
  CheckCircle2,
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
  Bot
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ThemeToggle from "./ThemeToggle";
import { sanitizeInput } from "../lib/security";
import { getRoundTimingInfo, formatSecondsToTime } from "../lib/roundTimer";

const calculateFutureIso = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
};

const calculateExtendedIso = (currentEndsAt, minsToAdd) => {
  const base = currentEndsAt ? Math.max(Date.now(), new Date(currentEndsAt).getTime()) : Date.now();
  return new Date(base + minsToAdd * 60 * 1000).toISOString();
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

  // Teams & Portfolios for Leaderboard
  const [teams, setTeams] = useState([]);
  const [portfolios, setPortfolios] = useState([]);

  // Module 2 Form: Publish News & Shock
  const [newsHeadline, setNewsHeadline] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [targetSector, setTargetSector] = useState("Technology");
  const [shockPercent, setShockPercent] = useState(10);
  const [isPublishingNews, setIsPublishingNews] = useState(false);

  // AI News Engine (Gemma-4-26b)
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiNewsResult, setAiNewsResult] = useState(null);

  // Autonomous Market Simulation Engine (Auto-Ticker)
  const [isAutoTickerActive, setIsAutoTickerActive] = useState(false);
  const [tickerSpeedMs, setTickerSpeedMs] = useState(4000); // 4 seconds
  const [tickerVolatility, setTickerVolatility] = useState(1.0); // 1.0x normal
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

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("gamestate"); // 'gamestate' | 'news' | 'stocks' | 'teams' | 'leaderboard'
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        showNotification(`⏱️ Round timer started for ${mins} minutes!`, "success");
      }
    } catch (err) {
      setGameState((prev) => ({
        ...prev,
        round_ends_at: endTimestamp,
        next_round_starts_at: null,
        round_duration_minutes: mins
      }));
      showNotification(`⏱️ Round timer started for ${mins}m (local).`, "warning");
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
        showNotification(`☕ Intermission scheduled: Next round starts in ${mins}m.`, "success");
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
  }, [isAutoTickerActive, tickerSpeedMs, tickerVolatility, gameState.is_market_open]);

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
            ? "🎉 TOURNAMENT RESULTS REVEALED TO PROJECTOR & ALL DESKS!"
            : "🔒 Results HIDDEN. Suspense audit screen activated on Projector.",
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
  // AI BREAKING NEWS CATALYST (Gemma-4-26b-a4b-it)
  // -------------------------------------------------------------
  const handleTriggerAINewsCatalyst = async (generateFromScratch = false) => {
    if (!generateFromScratch && !newsHeadline.trim()) {
      showNotification("Please enter a news headline to analyze.", "error");
      return;
    }

    setIsAIGenerating(true);
    try {
      const res = await fetch("/api/ai/news-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: sanitizeInput(newsHeadline),
          newsBody: sanitizeInput(newsBody),
          targetSector,
          generateFromScratch,
          applyToDatabase: true
        })
      });

      const data = await res.json();
      if (data.success && data.aiResult) {
        setAiNewsResult(data.aiResult);
        setNewsHeadline("");
        setNewsBody("");
        showNotification(
          `⚡ AI Catalyst Deployed: "${data.aiResult.headline}" updated ${data.updatedStocks?.length || 0} stocks in the backend.`,
          "success"
        );
        await loadAdminData();
      } else {
        showNotification(data.error || "Failed to generate AI news impact.", "error");
      }
    } catch (err) {
      showNotification("AI News Engine network error.", "error");
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 2. Manual Broadcast News & Sector Shock
  const handlePublishNewsAndShock = async (e) => {
    e.preventDefault();
    if (!newsHeadline.trim()) return;

    setIsPublishingNews(true);
    const cleanHeadline = sanitizeInput(newsHeadline);
    const cleanBody = sanitizeInput(newsBody);
    const shockMultiplier = 1 + shockPercent / 100;

    try {
      await supabase.from("news_feed").insert([
        {
          headline: cleanHeadline,
          body: cleanBody || `${targetSector} sector experiencing a ${shockPercent >= 0 ? "+" : ""}${shockPercent}% market adjustment.`,
          sector: targetSector,
          impact_percent: shockPercent
        }
      ]);

      const targetStocks = stocks.filter((s) => s.sector === targetSector);
      for (const stock of targetStocks) {
        const currentP = Number(stock.price);
        const newPrice = Number((currentP * shockMultiplier).toFixed(2));
        const priceChange = Number((newPrice - currentP).toFixed(2));
        const changePct = Number(((priceChange / currentP) * 100).toFixed(2));

        const updatedSpark = stock.spark_data
          ? [...stock.spark_data.slice(-9), newPrice]
          : [currentP, newPrice];

        await supabase
          .from("stocks")
          .update({
            previous_price: currentP,
            price: newPrice,
            change_percent: changePct,
            spark_data: updatedSpark
          })
          .eq("id", stock.id);
      }

      setNewsHeadline("");
      setNewsBody("");
      showNotification(
        `Transmitted news bulletin and executed ${shockPercent >= 0 ? "+" : ""}${shockPercent}% shock across ${targetSector}.`,
        "success"
      );
      await loadAdminData();
    } catch (err) {
      showNotification("Failed to publish news and execute shock.", "error");
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
      const changePct = Number((((p - oldPrice) / oldPrice) * 100).toFixed(2));

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
      const newCash = Number((Number(targetTeam.cash_balance) + amount).toFixed(2));

      await supabase
        .from("teams")
        .update({ cash_balance: newCash })
        .eq("id", teamId);

      setAdjustingTeam(null);
      showNotification(
        `Adjusted ${targetTeam.name} cash by ${amount >= 0 ? "+$" : "-$"}${Math.abs(amount).toLocaleString()} (New: $${newCash.toLocaleString()})`,
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
            ? `Team "${team.name}" is now FROZEN (Trading Privileges Suspended).`
            : `Team "${team.name}" trading privileges RESTORED.`,
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

  // Compute Leaderboard
  const rankedTeams = teams
    .map((team) => {
      const teamHoldings = portfolios.filter((p) => p.team_id === team.id && p.shares > 0);
      const stockValue = teamHoldings.reduce((sum, item) => {
        const stock = stocks.find((s) => s.id === item.stock_id);
        const currentPrice = Number(stock?.price) || 0;
        return sum + item.shares * currentPrice;
      }, 0);

      const netWorth = Number((Number(team.cash_balance) + stockValue).toFixed(2));
      const pnl = netWorth - 100000;
      const pnlPercent = ((pnl / 100000) * 100).toFixed(2);

      return {
        ...team,
        cash: Number(team.cash_balance),
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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between font-sans selection:bg-[var(--accent-sand)] selection:text-[#1b0805]">
      <header className="sticky top-0 z-40 bg-[var(--surface-1)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-2.5 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Investor Forum Logo" className="h-9 sm:h-11 w-auto object-contain shrink-0 drop-shadow-sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-bold text-[var(--text-primary)] tracking-tight leading-none truncate">
                  Director Command Desk
                </h1>
                {isMarketPaused ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)] shrink-0">
                    PAUSED
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] flex items-center gap-1 shrink-0">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span>LIVE</span>
                  </span>
                )}
                {isAutoTickerActive && (
                  <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_0_0_1px_rgba(168,85,247,0.25)] items-center gap-1">
                    <Bot className="w-3 h-3" />
                    <span>AUTO-TICK #{tickCount}</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5 hidden md:block truncate">
                Tournament Operations, AI News Reactor & Market Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs shrink-0">
            <ThemeToggle />

            <button
              onClick={handleManualRefresh}
              aria-label="Refresh operational state"
              title="Sync Admin State"
              className="p-1.5 sm:p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#402b28] dark:text-[#eae0d3]" : ""}`} />
            </button>

            <button
              onClick={handleToggleResultsReveal}
              title={gameState.is_results_revealed ? "Results are REVEALED to everyone (Click to Hide)" : "Results are HIDDEN in Suspense Mode (Click to Reveal)"}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-150 active:scale-95 shrink-0 ${
                gameState.is_results_revealed
                  ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[0_0_12px_rgba(64,43,40,0.4)]"
                  : "bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)] hover:bg-[#402b28]/20"
              }`}
            >
              {gameState.is_results_revealed ? (
                <>
                  <Trophy className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Results: REVEALED</span>
                  <span className="sm:hidden">Live</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Results: HIDDEN</span>
                  <span className="sm:hidden">Hidden</span>
                </>
              )}
            </button>

            <a
              href="/projector"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Projector Display"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] transition-all duration-150 active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Projector</span>
              <span className="sm:hidden">Proj</span>
              <span className="text-[10px] text-[var(--text-muted)]">↗</span>
            </a>

            <button
              onClick={onSignOut}
              title="Sign Out of Admin Desk"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 shadow-[0_0_0_1px_rgba(244,63,94,0.2)] transition-all duration-150 active:scale-95 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Desk</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`fixed top-16 right-4 sm:right-6 z-50 p-3.5 sm:p-4 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-fade-in ${
            notification.type === "warning"
              ? "bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400"
              : notification.type === "error"
              ? "bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* 3. DESK NAVIGATION TABS */}
      <div className="bg-[var(--surface-1)] border-b border-[var(--border-color)] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto py-2.5 font-mono text-xs no-scrollbar">
          {[
            { id: "gamestate", label: "1. Market & Automation Engine", icon: Sliders },
            { id: "news", label: "2. AI News Reactor (Gemma-4)", icon: Sparkles },
            { id: "stocks", label: "3. Stock Matrix & IPOs", icon: DollarSign },
            { id: "teams", label: "4. Participant & Bans", icon: Users },
            { id: "leaderboard", label: "5. Standings Audit", icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all duration-150 whitespace-nowrap active:scale-95 shrink-0 ${
                  isActive
                    ? "bg-[#402b28] dark:bg-[#eae0d3] text-[#f8f4ed] dark:text-[#1b0805] font-bold shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN ADMIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* MODULE 1: MARKET OPERATIONS & AUTONOMOUS TICKER SIMULATION */}
        {/* ========================================================================= */}
        {activeTab === "gamestate" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Panic Pause Card */}
              <div className="vercel-card rounded-2xl p-6 relative overflow-hidden">
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
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                      gameState.is_market_open
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        gameState.is_market_open ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                      }`}
                    />
                    <span>{gameState.is_market_open ? "LIVE & OPEN" : "PAUSED / FROZEN"}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                  Trigger an instantaneous panic freeze across all trading terminals to halt order execution during news announcements or round transitions.
                </p>

                <div className="mt-6">
                  <button
                    onClick={handleToggleMarket}
                    className={`w-full py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] ${
                      gameState.is_market_open
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

              {/* Tournament Round & Live Countdown Timer Engine */}
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
                            <span>☕ Next Round in {timing.nextRoundTimeFormatted}</span>
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
                          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-150 ${
                            (gameState.total_rounds || 3) === num
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
                          className={`px-3 py-2 rounded-lg font-bold transition-all duration-150 flex items-center gap-1.5 ${
                            (gameState.current_round_number || 1) === roundNum
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
                        className={`px-3 py-2 rounded-lg font-bold transition-all duration-150 ${
                          gameState.current_round === "Tournament Concluded"
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
                      ☕ Intermission / Break Between Rounds
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

              {/* Official Results & Public Standings Broadcast Controller */}
              <div className="vercel-card rounded-2xl p-6 border-2 border-[#402b28]/30 dark:border-[#eae0d3]/30 bg-gradient-to-br from-[var(--surface-1)] to-[#402b28]/5 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      gameState.is_results_revealed 
                        ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] shadow-[#402b28]/20" 
                        : "bg-[#402b28]/10 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]"
                    }`}>
                      {gameState.is_results_revealed ? <Trophy className="w-6 h-6 fill-current" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                          Tournament Standings & Winner Reveal Control
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          gameState.is_results_revealed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                            : "bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]"
                        }`}>
                          {gameState.is_results_revealed ? "🎉 PUBLICLY REVEALED" : "🔒 SUSPENSE AUDIT MODE"}
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
                    className={`px-5 py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shrink-0 ${
                      gameState.is_results_revealed
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
                        <Trophy className="w-4 h-4 fill-current" />
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
                    onClick={() => setIsAutoTickerActive(!isAutoTickerActive)}
                    className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-150 active:scale-95 ${
                      isAutoTickerActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700"
                        : "bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)]"
                    }`}
                  >
                    {isAutoTickerActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Simulation</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Auto-Ticker</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Engine Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[var(--border-color)] font-mono text-xs">
                {/* Tick Speed */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                    Update Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { ms: 2500, label: "Fast (2.5s)" },
                      { ms: 5000, label: "Normal (5s)" },
                      { ms: 10000, label: "Slow (10s)" }
                    ].map((item) => (
                      <button
                        key={item.ms}
                        onClick={() => setTickerSpeedMs(item.ms)}
                        className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                          tickerSpeedMs === item.ms
                            ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold"
                            : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-color)]"
                        }`}
                      >
                        {item.label}
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
                        className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                          tickerVolatility === item.val
                            ? "bg-[#402b28] text-[#f8f4ed] dark:bg-[#eae0d3] dark:text-[#1b0805] font-bold"
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
                    <span className="text-[var(--text-muted)]">Engine Status:</span>
                    <span className={`font-bold ${isAutoTickerActive ? "text-emerald-500" : "text-[#402b28] dark:text-[#eae0d3]"}`}>
                      {isAutoTickerActive ? "ACTIVE (RUNNING)" : "IDLE (PAUSED)"}
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
                        Google Gemma-4 AI News Reactor & Market Catalyst
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#402b28]/15 text-[#402b28] dark:bg-[#eae0d3]/15 dark:text-[#eae0d3] shadow-[0_0_0_1px_var(--border-color)]">
                        GEMMA-4-26B
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
                  <span>{isAIGenerating ? "Generating Shock..." : "⚡ Generate AI Breaking Shockwave"}</span>
                </button>
              </div>

              {/* Custom AI Impact Input */}
              <div className="pt-5 space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                    Or Type Custom Headline For AI Stock Impact Analysis
                  </label>
                  <input
                    type="text"
                    value={newsHeadline}
                    onChange={(e) => setNewsHeadline(e.target.value)}
                    placeholder="e.g. FDA Approves NovaTech Breakthrough Gene Therapy / OPEC Slashes Production"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] block mb-1.5 uppercase font-medium">
                      Sector Focus
                    </label>
                    <select
                      value={targetSector}
                      onChange={(e) => setTargetSector(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:shadow-[0_0_0_2px_#402b28] dark:focus:shadow-[0_0_0_2px_#eae0d3]"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Energy">Energy</option>
                      <option value="Consumer Goods">Consumer Goods</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleTriggerAINewsCatalyst(false)}
                      disabled={isAIGenerating || !newsHeadline.trim()}
                      className="w-full py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--border-color)] text-[var(--text-primary)] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                    >
                      <Cpu className="w-4 h-4 text-purple-500" />
                      <span>{isAIGenerating ? "Calculating Impact..." : "⚡ AI Analyze & Shift Stock Prices"}</span>
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
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        aiNewsResult.overallSentiment === "BULLISH"
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
                              className={`font-bold ${
                                Number(impact.priceChangePercent) >= 0 ? "text-emerald-500" : "text-rose-500"
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
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight mb-4 font-mono">
                News Wire Broadcast Archive
              </h2>

              <div className="space-y-3">
                {news.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] font-mono py-4 text-center">No news bulletins published yet.</p>
                ) : (
                  news.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-[var(--surface-2)] shadow-[0_0_0_1px_var(--border-color)] flex items-start justify-between gap-4 font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[var(--surface-3)] text-[var(--text-secondary)]">
                            {item.sector}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)] mt-1">{item.headline}</h3>
                        {item.body && <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">{item.body}</p>}
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            Number(item.impact_percent) >= 0
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-rose-500 bg-rose-500/10"
                          }`}
                        >
                          {Number(item.impact_percent) >= 0 ? "+" : ""}{item.impact_percent}%
                        </span>
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
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPos ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
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
                              className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                                team.is_banned
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
                className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-md ${
                  gameState.is_results_revealed
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

            <div className="vercel-card rounded-2xl overflow-hidden">
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
                            {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
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
                              className={`px-2 py-0.5 rounded font-bold ${
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
      </main>

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
    </div>
  );
}
