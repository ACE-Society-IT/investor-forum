// =====================================================================
// INVESTOR FORUM: GRADUAL 10-SECOND REALISTIC MARKET TRANSITION ENGINE
// Simulates authentic market dynamics with higher-highs/higher-lows waves
// =====================================================================

import { supabase } from "./supabase";

/**
 * Calculates intermediate price steps with realistic market zigzag waves
 * (Higher-Highs / Higher-Lows for uptrends; Lower-Lows / Lower-Highs for downtrends)
 * @param {number} startPrice - Initial stock price
 * @param {number} targetPrice - Final target price after full shock
 * @param {number} totalSteps - Number of discrete update steps (default 10 for 10 seconds)
 * @returns {number[]} Array of prices for each step [step1, step2, ..., stepN]
 */
export function calculateRealisticPriceSteps(startPrice, targetPrice, totalSteps = 10) {
  const start = Number(startPrice);
  const target = Number(targetPrice);
  const totalDelta = target - start;

  if (totalDelta === 0 || totalSteps <= 1) {
    return Array(totalSteps).fill(target);
  }

  // Realistic wave progression fractions for 10-second shock digestion
  // e.g. Uptrend progression: Initial burst (15%), continuation (32%), micro-pullback (26%), 
  // secondary surge (52%), consolidation (48%), strong leg (74%), pause (70%), final rally (90%), stretch (96%), settlement (100%)
  const baseWaveRatios = [
    0.14, // Step 1: Initial news reaction
    0.30, // Step 2: Early institutional buying
    0.24, // Step 3: Natural micro-pullback (profit taking)
    0.48, // Step 4: Breakout continuation wave
    0.62, // Step 5: Heavy volume momentum
    0.56, // Step 6: Shallow consolidation breather
    0.76, // Step 7: Secondary trend extension
    0.88, // Step 8: Approaching target valuation
    0.95, // Step 9: Final stabilization band
    1.00  // Step 10: Exact target price settlement
  ];

  const steps = [];

  for (let i = 0; i < totalSteps; i++) {
    const isFinalStep = i === totalSteps - 1;

    if (isFinalStep) {
      steps.push(Number(target.toFixed(2)));
      break;
    }

    const standardRatio = i < baseWaveRatios.length ? baseWaveRatios[i] : (i + 1) / totalSteps;
    
    // Subtle per-stock micro-noise (±1.5% of total delta) for natural organic variation
    const microNoise = (Math.random() * 0.03 - 0.015);
    const effectiveRatio = Math.max(0.02, Math.min(0.99, standardRatio + microNoise));

    const rawPrice = start + (totalDelta * effectiveRatio);
    let stepPrice = Number(rawPrice.toFixed(2));

    // Ensure direction consistency:
    // If target > start (uptrend), price stays above start and never exceeds target prematurely
    if (target > start) {
      stepPrice = Math.max(start, Math.min(target, stepPrice));
    } else {
      stepPrice = Math.min(start, Math.max(target, stepPrice));
    }

    steps.push(Number(stepPrice.toFixed(2)));
  }

  return steps;
}

/**
 * Executes a synchronized 10-second gradual price transition across multiple stocks
 * @param {Object} options
 * @param {Array<{id: string, ticker: string, price: number, targetPrice: number, spark_data?: number[]}>} options.stocksList - Target stocks
 * @param {number} [options.durationSeconds=10] - Total transition time in seconds
 * @param {number} [options.steps=10] - Total ticks (1 tick per second)
 * @param {Function} [options.onTick] - Callback executed on each tick
 * @param {Function} [options.onComplete] - Callback executed when all steps finish
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
      schedule.currentSpark = [...schedule.currentSpark.slice(-11), stepPrice];

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
