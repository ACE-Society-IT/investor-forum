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
 * Simulates realistic trend persistence, higher-highs/higher-lows, sector co-movement, and mean-reversion.
 */
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const {
      volatility = 1.0,
      regime = "BALANCED", // 'BULL' | 'BALANCED' | 'VOLATILE' | 'SIDEWAYS' | 'BEAR'
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

    // 2. Macroeconomic Drift & Base Volatility by Regime
    let macroDrift = 0.0006;
    let regimeVolMultiplier = 1.0;
    let directionalBiasProbability = 0.65; // 65% trend continuation

    switch (regime) {
      case "BULL":
        macroDrift = 0.0035; // +0.35% steady upward momentum
        regimeVolMultiplier = 0.8;
        directionalBiasProbability = 0.78; // 78% of moves are upward
        break;
      case "BEAR":
        macroDrift = -0.0030; // -0.30% downward pressure
        regimeVolMultiplier = 1.2;
        directionalBiasProbability = 0.28; // 72% of moves are downward
        break;
      case "VOLATILE":
        macroDrift = 0.0000;
        regimeVolMultiplier = 2.0; // High trading frenzy
        directionalBiasProbability = 0.55;
        break;
      case "SIDEWAYS":
        macroDrift = 0.0000;
        regimeVolMultiplier = 0.5; // Calm, range-bound channel
        directionalBiasProbability = 0.50;
        break;
      case "BALANCED":
      default:
        macroDrift = 0.0008;
        regimeVolMultiplier = 1.0;
        directionalBiasProbability = 0.62;
        break;
    }

    const effectiveVol = Math.max(0.2, (Number(volatility) || 1.0) * regimeVolMultiplier);
    const baseStdDev = effectiveVol * 0.005; // ~0.25% - 1.0% base standard deviation

    // 3. Pre-calculate Sector Shocks for intra-sector correlation
    const sectors = [...new Set(stocks.map((s) => s.sector || "Technology"))];
    const sectorShocks = {};

    sectors.forEach((sec) => {
      const customBias = Number(sectorBiases[sec]) || 0;
      const randomSectorComponent = gaussianRandom() * (baseStdDev * 0.4);
      sectorShocks[sec] = macroDrift + customBias + randomSectorComponent;
    });

    const updatedList = [];

    // 4. Calculate realistic price dynamics for each equity
    for (const stock of stocks) {
      const currentPrice = Number(stock.price) || 50;
      const sec = stock.sector || "Technology";
      const sectorDrift = sectorShocks[sec] || macroDrift;

      // 4a. Trend Directional Momentum Check
      const prevChangePct = Number(stock.change_percent) || 0;
      const isCurrentlyGaining = prevChangePct >= 0;

      // If stock is gaining and market is supportive, skew probability towards higher-highs
      const upwardRoll = Math.random();
      const shouldMoveUp = isCurrentlyGaining
        ? upwardRoll < directionalBiasProbability
        : upwardRoll < (1 - directionalBiasProbability);

      let stepMagnitude = Math.abs(gaussianRandom()) * baseStdDev;
      // In uptrends: upward steps are standard (+0.2% - +1.0%), pullback steps are shallow (-0.1% - -0.3%)
      if (isCurrentlyGaining && !shouldMoveUp) {
        stepMagnitude *= 0.45; // Shallow pullback
      } else if (!isCurrentlyGaining && shouldMoveUp) {
        stepMagnitude *= 0.45; // Shallow dead-cat bounce
      }

      const directionalStep = shouldMoveUp ? stepMagnitude : -stepMagnitude;

      // 4b. Autoregressive Momentum (Smooth order flow continuity)
      const prevPrice = Number(stock.previous_price) || currentPrice;
      const prevDeltaPct = currentPrice > 0 ? (currentPrice - prevPrice) / currentPrice : 0;
      const momentumInertia = Math.max(-0.01, Math.min(0.01, prevDeltaPct * 0.15));

      // 4c. Mean-Reversion Elasticity (Soft barrier preventing runaway extremes)
      const rawSpark = Array.isArray(stock.spark_data) && stock.spark_data.length > 0
        ? stock.spark_data
        : [currentPrice];
      const sparkAvg = rawSpark.reduce((sum, p) => sum + Number(p), 0) / rawSpark.length;
      const deviationFromMean = (currentPrice - sparkAvg) / (sparkAvg || 1);
      const meanReversionPull = -deviationFromMean * 0.06; // 6% soft elastic pull

      // 4d. Total synthesized move
      const totalDeltaPct = sectorDrift + directionalStep + momentumInertia + meanReversionPull;

      // Bound delta to realistic max per tick (±2.5% in normal, ±4.5% in volatile)
      const maxTickPct = regime === "VOLATILE" ? 0.045 : 0.025;
      const clampedDeltaPct = Math.max(-maxTickPct, Math.min(maxTickPct, totalDeltaPct));

      const rawNewPrice = currentPrice * (1 + clampedDeltaPct);
      const newPrice = Number(Math.max(1.0, Number(rawNewPrice.toFixed(2))));

      const priceDelta = Number((newPrice - currentPrice).toFixed(2));
      const changePercent = Number((((newPrice - currentPrice) / currentPrice) * 100).toFixed(2));

      // Update rolling sparkline (12 data points)
      const updatedSpark = [...rawSpark.slice(-11), newPrice];

      const nowIso = new Date().toISOString();
      const existingTimestamps = Array.isArray(stock.spark_timestamps) ? stock.spark_timestamps : [];
      let updatedTimestamps = [...existingTimestamps.slice(-11), nowIso];
      while (updatedTimestamps.length < updatedSpark.length) {
        const oldestTime = new Date(updatedTimestamps[0] || nowIso).getTime();
        updatedTimestamps.unshift(new Date(oldestTime - 15000).toISOString());
      }

      const { data: updatedRecord, error: updateErr } = await supabase
        .from("stocks")
        .update({
          previous_price: currentPrice,
          price: newPrice,
          change_percent: changePercent,
          spark_data: updatedSpark,
          spark_timestamps: updatedTimestamps,
          updated_at: nowIso
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
