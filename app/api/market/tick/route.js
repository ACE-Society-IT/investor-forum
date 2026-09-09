import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Normal Box-Muller Gaussian Random Variable
 */
function gaussianRandom() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * POST /api/market/tick
 * Autonomous Quantitative Market Fluctuation Engine
 * Simulates realistic macroeconomic regimes, sector correlations, mean-reversion, and momentum.
 */
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const {
      volatility = 1.0,
      regime = "BALANCED", // 'BULL' | 'BALANCED' | 'VOLATILE' | 'BEAR' | 'SIDEWAYS'
      sectorBiases = {},
      isMarketOpen = true
    } = body;

    if (!isMarketOpen) {
      return NextResponse.json({ success: true, message: "Market is closed, no tick executed." });
    }

    // 1. Fetch all listed stocks from Supabase
    const { data: stocks, error: fetchErr } = await supabase
      .from("stocks")
      .select("*")
      .order("ticker");

    if (fetchErr || !stocks || stocks.length === 0) {
      return NextResponse.json({ success: false, error: "No stocks found to tick." });
    }

    // 2. Determine Macroeconomic Drift & Base Volatility by Regime
    let macroDrift = 0.0005; // Default slight natural market expansion (+0.05%)
    let regimeVolMultiplier = 1.0;

    switch (regime) {
      case "BULL":
        macroDrift = 0.0035; // +0.35% steady upward momentum
        regimeVolMultiplier = 0.85;
        break;
      case "BEAR":
        macroDrift = -0.0030; // -0.30% downward correction pressure
        regimeVolMultiplier = 1.25;
        break;
      case "VOLATILE":
        macroDrift = 0.0000;
        regimeVolMultiplier = 2.2; // High trading frenzy & wide swings
        break;
      case "SIDEWAYS":
        macroDrift = 0.0000;
        regimeVolMultiplier = 0.5; // Calm, range-bound market
        break;
      case "BALANCED":
      default:
        macroDrift = 0.0008;
        regimeVolMultiplier = 1.0;
        break;
    }

    const effectiveVol = Math.max(0.2, (Number(volatility) || 1.0) * regimeVolMultiplier);
    const baseStdDev = effectiveVol * 0.006; // ~0.3% - 1.2% base standard deviation

    // 3. Pre-calculate Sector Shocks to ensure realistic intra-sector co-movement
    const sectors = [...new Set(stocks.map((s) => s.sector || "Technology"))];
    const sectorShocks = {};

    sectors.forEach((sec) => {
      const customBias = Number(sectorBiases[sec]) || 0;
      // 50% sector random shock + sector custom bias + macro drift
      const randomSectorComponent = gaussianRandom() * (baseStdDev * 0.5);
      sectorShocks[sec] = macroDrift + customBias + randomSectorComponent;
    });

    const updatedList = [];

    // 4. Calculate realistic price dynamics for each equity
    for (const stock of stocks) {
      const currentPrice = Number(stock.price) || 50;
      const sec = stock.sector || "Technology";
      const sectorDrift = sectorShocks[sec] || macroDrift;

      // 4a. Company Idiosyncratic Shock (Alpha)
      const stockAlpha = gaussianRandom() * (baseStdDev * 0.6);

      // 4b. Autoregressive Momentum (Inertia from previous price delta)
      const prevPrice = Number(stock.previous_price) || currentPrice;
      const prevDeltaPct = currentPrice > 0 ? (currentPrice - prevPrice) / currentPrice : 0;
      const momentumInertia = Math.max(-0.015, Math.min(0.015, prevDeltaPct * 0.20));

      // 4c. Mean-Reversion Elasticity (Prevents runaway prices, creates tradeable cycles)
      const rawSpark = Array.isArray(stock.spark_data) && stock.spark_data.length > 0
        ? stock.spark_data
        : [currentPrice];
      const sparkAvg = rawSpark.reduce((sum, p) => sum + Number(p), 0) / rawSpark.length;
      const deviationFromMean = (currentPrice - sparkAvg) / (sparkAvg || 1);
      const meanReversionPull = -deviationFromMean * 0.08; // 8% pull back to rolling mean

      // 4d. Synthesize total delta percent
      const totalDeltaPct = sectorDrift + stockAlpha + momentumInertia + meanReversionPull;

      // Bound delta to realistic per-tick max/min (±3.5% per tick in normal, ±6% in volatile)
      const maxTickPct = regime === "VOLATILE" ? 0.06 : 0.035;
      const clampedDeltaPct = Math.max(-maxTickPct, Math.min(maxTickPct, totalDeltaPct));

      const rawNewPrice = currentPrice * (1 + clampedDeltaPct);
      const newPrice = Number(Math.max(1.0, Number(rawNewPrice.toFixed(2))));

      const priceDelta = Number((newPrice - currentPrice).toFixed(2));
      const changePercent = Number((((newPrice - currentPrice) / currentPrice) * 100).toFixed(2));

      // Update rolling sparkline (12 data points)
      const updatedSpark = [...rawSpark.slice(-11), newPrice];

      const { data: updatedRecord, error: updateErr } = await supabase
        .from("stocks")
        .update({
          previous_price: currentPrice,
          price: newPrice,
          change_percent: changePercent,
          spark_data: updatedSpark
        })
        .eq("id", stock.id)
        .select()
        .single();

      if (!updateErr && updatedRecord) {
        updatedList.push(updatedRecord);
      }
    }

    return NextResponse.json({
      success: true,
      regime,
      volatility: effectiveVol,
      updatedCount: updatedList.length,
      stocks: updatedList
    });
  } catch (err) {
    console.error("Autonomous Market Fluctuation Engine error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
