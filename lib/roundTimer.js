// =====================================================================
// INVESTOR FORUM: ROUND TIMER & PHASE SCHEDULER UTILITIES
// =====================================================================

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatSecondsToTime(totalSeconds) {
  if (totalSeconds <= 0 || isNaN(totalSeconds)) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates time remaining, multi-phase crisis workflow details given game state
 */
export function getRoundTimingInfo(gameState = {}) {
  const now = new Date().getTime();
  const totalRounds = Number(gameState?.total_rounds) || 3;
  const currentRoundNum = Number(gameState?.current_round_number) || 1;
  const currentRoundName = gameState?.current_round || `Round ${currentRoundNum} - Active`;

  const isConcluded = Boolean(
    gameState?.status === "completed" ||
    gameState?.status === "concluded" ||
    currentRoundName === "Tournament Concluded" ||
    currentRoundName?.toLowerCase().includes("concluded") ||
    currentRoundNum > totalRounds
  );

  // 1. Standard Round Timers (Legacy / Fallback)
  let roundSecondsLeft = 0;
  let nextRoundSecondsLeft = 0;
  let isRoundOver = false;
  let isIntermission = false;

  if (gameState?.round_ends_at && !isConcluded) {
    const endMs = new Date(gameState.round_ends_at).getTime();
    if (!isNaN(endMs)) {
      roundSecondsLeft = Math.max(0, Math.floor((endMs - now) / 1000));
      if (roundSecondsLeft === 0 && endMs <= now) {
        isRoundOver = true;
      }
    }
  }

  if (gameState?.next_round_starts_at && !isConcluded) {
    const nextStartMs = new Date(gameState.next_round_starts_at).getTime();
    if (!isNaN(nextStartMs) && nextStartMs > now) {
      nextRoundSecondsLeft = Math.max(0, Math.floor((nextStartMs - now) / 1000));
      isIntermission = true;
    }
  }

  // 2. TIMED CRISIS MULTI-PHASE ROUND LOGIC
  // Phases: 'IDLE' | 'ANALYSIS' | 'TRADING' | 'CALCULATING'
  let rawPhase = (gameState?.phase || "IDLE").toUpperCase();
  let analysisSecondsLeft = 0;
  let tradingSecondsLeft = 0;
  let activeSecondsLeft = 0;
  let activePhaseTotalSeconds = 0;

  const analysisEndMs = gameState?.analysis_ends_at ? new Date(gameState.analysis_ends_at).getTime() : NaN;
  const tradingEndMs = gameState?.trading_ends_at ? new Date(gameState.trading_ends_at).getTime() : NaN;

  const analysisTotalSeconds = Math.max(1, (Number(gameState?.analysis_duration_minutes) || 4) * 60);
  const tradingTotalSeconds = Math.max(1, (Number(gameState?.trading_duration_minutes) || 5) * 60);

  // Derive dynamic phase if timestamps exist
  if (!isNaN(analysisEndMs) && analysisEndMs > now) {
    // Currently in ANALYSIS window
    rawPhase = "ANALYSIS";
    analysisSecondsLeft = Math.max(0, Math.floor((analysisEndMs - now) / 1000));
    activeSecondsLeft = analysisSecondsLeft;
    activePhaseTotalSeconds = analysisTotalSeconds;
  } else if (!isNaN(tradingEndMs) && tradingEndMs > now) {
    // Currently in TRADING window
    rawPhase = "TRADING";
    tradingSecondsLeft = Math.max(0, Math.floor((tradingEndMs - now) / 1000));
    activeSecondsLeft = tradingSecondsLeft;
    activePhaseTotalSeconds = tradingTotalSeconds;
  } else if (!isNaN(tradingEndMs) && tradingEndMs <= now && (rawPhase === "TRADING" || rawPhase === "ANALYSIS")) {
    // Trading window just finished -> transition to CALCULATING / HALTED
    rawPhase = "CALCULATING";
    activeSecondsLeft = 0;
  }

  const isAnalysisActive = rawPhase === "ANALYSIS" && activeSecondsLeft > 0;
  const isTradingActive = rawPhase === "TRADING" && activeSecondsLeft > 0;
  const isCalculatingActive = rawPhase === "CALCULATING";
  const isIdle = rawPhase === "IDLE";

  // Calculate Progress Percent for visual progress bar
  let activePhaseProgress = 0;
  if (activePhaseTotalSeconds > 0 && activeSecondsLeft >= 0) {
    const elapsed = activePhaseTotalSeconds - activeSecondsLeft;
    activePhaseProgress = Math.min(100, Math.max(0, Math.round((elapsed / activePhaseTotalSeconds) * 100)));
  }

  // Active crisis payload
  const activeCrisis = {
    id: gameState?.active_crisis_id || null,
    headline: gameState?.active_crisis_headline || null,
    body: gameState?.active_crisis_body || null,
    sector: gameState?.active_crisis_sector || null,
    impacts: gameState?.active_crisis_impacts || {},
    eventNumber: Number(gameState?.active_event_number) || currentRoundNum
  };

  return {
    totalRounds,
    currentRoundNum,
    currentRoundName,
    isConcluded,
    roundSecondsLeft,
    roundTimeFormatted: formatSecondsToTime(roundSecondsLeft),
    nextRoundSecondsLeft,
    nextRoundTimeFormatted: formatSecondsToTime(nextRoundSecondsLeft),
    isRoundOver,
    isIntermission,
    hasActiveTimer: Boolean(gameState?.round_ends_at && roundSecondsLeft > 0 && !isConcluded),

    // Multi-phase round properties
    phase: rawPhase,
    isAnalysisActive,
    isTradingActive,
    isCalculatingActive,
    isIdle,
    activeSecondsLeft,
    activePhaseFormattedTime: formatSecondsToTime(activeSecondsLeft),
    activePhaseProgress,
    analysisSecondsLeft,
    tradingSecondsLeft,
    activeCrisis,
    isMarketOpen: gameState?.is_market_open ?? true,
    phaseMessage: gameState?.phase_message || (
      isAnalysisActive
        ? "CRISIS ANALYSIS PHASE — Market Paused"
        : isTradingActive
        ? "TRADING WINDOW ACTIVE"
        : isCalculatingActive
        ? "TRADING HALTED — Processing Price Shockwave"
        : "Market Standby"
    )
  };
}
