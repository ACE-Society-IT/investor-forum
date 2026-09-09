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
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates time remaining and phase details given game state
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

  let roundSecondsLeft = 0;
  let nextRoundSecondsLeft = 0;
  let isRoundOver = false;
  let isIntermission = false;

  // 1. Current Round Ends At calculation
  if (gameState?.round_ends_at && !isConcluded) {
    const endMs = new Date(gameState.round_ends_at).getTime();
    if (!isNaN(endMs)) {
      roundSecondsLeft = Math.max(0, Math.floor((endMs - now) / 1000));
      if (roundSecondsLeft === 0 && endMs <= now) {
        isRoundOver = true;
      }
    }
  }

  // 2. Next Round Starts At calculation
  if (gameState?.next_round_starts_at && !isConcluded) {
    const nextStartMs = new Date(gameState.next_round_starts_at).getTime();
    if (!isNaN(nextStartMs) && nextStartMs > now) {
      nextRoundSecondsLeft = Math.max(0, Math.floor((nextStartMs - now) / 1000));
      isIntermission = true;
    }
  }

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
    hasActiveTimer: Boolean(gameState?.round_ends_at && roundSecondsLeft > 0 && !isConcluded)
  };
}
