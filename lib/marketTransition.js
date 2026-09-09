// =====================================================================
// INVESTOR FORUM: GRADUAL 10-SECOND REALISTIC MARKET TRANSITION ENGINE
// Simulates live algorithmic market dynamics with momentum easing & micro-volatility
// =====================================================================

import { supabase } from "./supabase";

/**
 * Cubic Ease-In-Out progression curve (0 to 1)
 * Simulates initial news digestion (slow), heavy institutional flow (fast), and settlement (stabilization)
 */
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Calculates intermediate price steps with realistic market jitter
 * @param {number} startPrice - Initial stock price
 * @param {number} targetPrice - Final target price after full shock
 * @param {number} totalSteps - Number of discrete update steps (e.g. 10 for 10 seconds)
 * @returns {number[]} Array of prices for each step [step1, step2, ..., stepN]
 */
export function calculateRealisticPriceSteps(startPrice, targetPrice, totalSteps = 10) {
  const start = Number(startPrice);
  const target = Number(targetPrice);
  const totalDelta = target - start;

  if (totalDelta === 0 || totalSteps <= 1) {
    return Array(totalSteps).fill(target);
  }

  const steps = [];

  for (let i = 1; i <= totalSteps; i++) {
    if (i === totalSteps) {
      // Final step is always exactly the target price
      steps.push(Number(target.toFixed(2)));
      break;
    }

    const progress = i / totalSteps;
    const easedProgress = easeInOutCubic(progress);

    // Subtle micro-volatility (±4% of total delta) on intermediate steps
    const jitterFactor = (Math.random() * 0.08 - 0.04);
    const rawStepPrice = start + (totalDelta * easedProgress) + (totalDelta * jitterFactor);

    // Keep intermediate price bounded between start and target direction
    let clampedPrice;
    if (target > start) {
      clampedPrice = Math.max(start, Math.min(target, rawStepPrice));
    } else {
      clampedPrice = Math.min(start, Math.max(target, rawStepPrice));
    }

    steps.push(Number(clampedPrice.toFixed(2)));
  }

  return steps;
}

/**
 * Executes a synchronized 10-second gradual price transition across multiple stocks
 * @param {Object} options
 * @param {Array<{id: string, ticker: string, price: number, targetPrice: number, spark_data?: number[]}>} options.stocksList - Target stocks
 * @param {number} [options.durationSeconds=10] - Total transition time in seconds
 * @param {number} [options.steps=10] - Total ticks (1 tick per second)
 * @param {Function} [options.onTick] - Callback executed on each tick (step, totalSteps, percentComplete, currentPrices)
 * @param {Function} [options.onComplete] - Callback executed when all 10 seconds finish
 * @returns {Promise<{success: boolean, completed: boolean}>}
 */
export async function executeGradualMarketShock({
  stocksList = [],
  durationSeconds = 10,
  steps = 10,
  onTick = null,
  onComplete = null
}) {
  if (!stocksList || stocksList.length === 0) {
    if (onComplete) onComplete();
    return { success: true, completed: true };
  }

  const intervalMs = Math.max(400, Math.floor((durationSeconds * 1000) / steps));

  // Pre-calculate step schedules for all target stocks
  const stockSchedules = stocksList.map((stock) => {
    const currentPrice = Number(stock.price);
    const finalTarget = Number(stock.targetPrice);
    const stepPrices = calculateRealisticPriceSteps(currentPrice, finalTarget, steps);
    const baseSpark = Array.isArray(stock.spark_data) && stock.spark_data.length > 0
      ? stock.spark_data
      : [currentPrice];

    return {
      stock,
      initialPrice: currentPrice,
      targetPrice: finalTarget,
      stepPrices,
      currentSpark: [...baseSpark]
    };
  });

  // Step-by-step transition execution
  for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
    const currentStepNum = stepIndex + 1;
    const isFinalStep = currentStepNum === steps;

    // 1. Update database for all target stocks concurrently
    const updatePromises = stockSchedules.map(async (schedule) => {
      const stepPrice = schedule.stepPrices[stepIndex];
      const previousPrice = stepIndex === 0 ? schedule.initialPrice : schedule.stepPrices[stepIndex - 1];
      const changePct = Number((((stepPrice - schedule.initialPrice) / schedule.initialPrice) * 100).toFixed(2));

      // Append step price to rolling sparkline
      schedule.currentSpark = [...schedule.currentSpark.slice(-9), stepPrice];

      return supabase
        .from("stocks")
        .update({
          previous_price: previousPrice,
          price: stepPrice,
          change_percent: changePct,
          spark_data: schedule.currentSpark
        })
        .eq("id", schedule.stock.id);
    });

    await Promise.allSettled(updatePromises);

    // 2. Trigger onTick callback
    if (onTick) {
      const progressPercent = Math.round((currentStepNum / steps) * 100);
      const activePrices = stockSchedules.map((s) => ({
        ticker: s.stock.ticker,
        price: s.stepPrices[stepIndex]
      }));

      onTick({
        step: currentStepNum,
        totalSteps: steps,
        progressPercent,
        secondsRemaining: Math.max(0, durationSeconds - currentStepNum),
        activePrices,
        isFinalStep
      });
    }

    // 3. Wait interval before next tick (unless final step)
    if (!isFinalStep) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  if (onComplete) {
    onComplete();
  }

  return { success: true, completed: true };
}
