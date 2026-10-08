import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      crisis,
      analysisMinutes = 4,
      tradingMinutes = 5,
      eventNumber = 1,
      targetStocksWithShocks = []
    } = body;

    const now = new Date();

    if (action === "START_CRISIS_ROUND") {
      const cleanAnalysisMin = Math.max(0.5, Number(analysisMinutes) || 4);
      const cleanTradingMin = Math.max(0.5, Number(tradingMinutes) || 5);
      
      const analysisEndsAt = new Date(now.getTime() + cleanAnalysisMin * 60 * 1000).toISOString();
      const tradingEndsAt = new Date(now.getTime() + (cleanAnalysisMin + cleanTradingMin) * 60 * 1000).toISOString();
      
      const headline = crisis?.headline || "Breaking Economic Catalyst";
      const newsBody = crisis?.body || "";
      const sector = crisis?.sector || "General Market";
      const impacts = crisis?.stock_shocks_by_ticker || crisis?.stock_shocks || {};
      const avgImpact = Number(crisis?.impact_percent) || 0;

      // 1. Insert news bulletin to live news_feed
      await supabase.from("news_feed").insert([
        {
          headline,
          body: newsBody,
          sector,
          impact_percent: avgImpact
        }
      ]);

      // 2. Update game_state: Phase = ANALYSIS, Market = PAUSED
      const roundTitle = `Round ${eventNumber} - Crisis Analysis (${cleanAnalysisMin}m)`;
      const { error: gsErr } = await supabase
        .from("game_state")
        .update({
          phase: "ANALYSIS",
          is_market_open: false, // PAUSED during analysis
          current_round: roundTitle,
          current_round_number: eventNumber,
          analysis_duration_minutes: cleanAnalysisMin,
          trading_duration_minutes: cleanTradingMin,
          analysis_ends_at: analysisEndsAt,
          trading_ends_at: tradingEndsAt,
          active_crisis_id: crisis?.id || `crisis-${eventNumber}`,
          active_crisis_headline: headline,
          active_crisis_body: newsBody,
          active_crisis_sector: sector,
          active_crisis_impacts: impacts,
          active_event_number: eventNumber,
          phase_message: `CRISIS ANALYSIS PHASE (4 min) — Study the news report. Trading is paused.`
        })
        .eq("id", 1);

      if (gsErr) {
        console.error("Failed to update game_state in Supabase:", gsErr);
      }

      // 3. Remove from staged_news if it was a draft
      if (crisis?.id) {
        try {
          await supabase.from("staged_news").delete().eq("id", crisis.id);
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        phase: "ANALYSIS",
        analysisEndsAt,
        tradingEndsAt,
        message: `Crisis Round ${eventNumber} initiated. Analysis timer active for ${cleanAnalysisMin} minutes.`
      });
    }

    if (action === "OPEN_TRADING") {
      const cleanTradingMin = Math.max(0.5, Number(tradingMinutes) || 5);
      const tradingEndsAt = new Date(now.getTime() + cleanTradingMin * 60 * 1000).toISOString();
      const { data: gs } = await supabase.from("game_state").select("*").eq("id", 1).single();
      const currentEventNum = Number(body.eventNumber) || Number(gs?.current_round_number) || Number(gs?.active_event_number) || 1;

      const roundTitle = `Round ${currentEventNum} - Trading Window (${cleanTradingMin}m)`;
      await supabase
        .from("game_state")
        .update({
          phase: "TRADING",
          is_market_open: true, // UNPAUSED for trading
          current_round: roundTitle,
          current_round_number: currentEventNum,
          trading_duration_minutes: cleanTradingMin,
          trading_ends_at: tradingEndsAt,
          phase_message: `TRADING IS OPEN FOR ROUND ${currentEventNum}! Submit buy/sell orders.`
        })
        .eq("id", 1);

      return NextResponse.json({
        success: true,
        phase: "TRADING",
        tradingEndsAt,
        message: `Trading floor is now OPEN for ${cleanTradingMin} minutes.`
      });
    }

    if (action === "HALT_AND_APPLY_SHOCK") {
      // 1. Fetch current game_state to get active_crisis_impacts
      const { data: gs } = await supabase.from("game_state").select("*").eq("id", 1).single();
      const impacts = gs?.active_crisis_impacts || crisis?.stock_shocks_by_ticker || {};

      // 2. Fetch current stocks
      const { data: currentStocks } = await supabase.from("stocks").select("*");
      const updatedStocks = [];

      if (Array.isArray(currentStocks)) {
        for (const stock of currentStocks) {
          let shockPercent = null;

          // Check by ticker
          if (impacts[stock.ticker] !== undefined) {
            shockPercent = Number(impacts[stock.ticker]);
          } else if (impacts[stock.id] !== undefined) {
            shockPercent = Number(impacts[stock.id]);
          }

          if (shockPercent !== null && !isNaN(shockPercent)) {
            const currentPrice = Number(stock.price);
            const newPrice = Number(Math.max(1.0, currentPrice * (1 + shockPercent / 100)).toFixed(2));
            const changePercent = Number((((newPrice - Number(stock.previous_price || currentPrice)) / Number(stock.previous_price || currentPrice)) * 100).toFixed(2));

            const priceHistory = Array.isArray(stock.price_history) ? [...stock.price_history, newPrice] : [currentPrice, newPrice];

            await supabase
              .from("stocks")
              .update({
                price: newPrice,
                previous_price: currentPrice,
                change_percent: changePercent,
                price_history: priceHistory
              })
              .eq("id", stock.id);

            updatedStocks.push({ ticker: stock.ticker, oldPrice: currentPrice, newPrice, shockPercent });
          }
        }
      }

      // 3. Update game_state to CALCULATING / HALTED, Market = PAUSED
      const eventNum = gs?.active_event_number || 1;
      await supabase
        .from("game_state")
        .update({
          phase: "CALCULATING",
          is_market_open: false, // PAUSED
          current_round: `Round ${eventNum} - Trading Halted (Shockwave Applied)`,
          phase_message: "TRADING HALTED! Market price shockwave absorbed."
        })
        .eq("id", 1);

      return NextResponse.json({
        success: true,
        phase: "CALCULATING",
        updatedStocks,
        message: `Trading halted and crisis impact applied to ${updatedStocks.length} equities.`
      });
    }

    if (action === "ADJUST_ACTIVE_PHASE_TIMER") {
      const { minutesToAdd, setRemainingMinutes } = body;
      const { data: gs } = await supabase.from("game_state").select("*").eq("id", 1).single();
      const currentPhase = (gs?.phase || "IDLE").toUpperCase();
      const updates = {};

      if (currentPhase === "ANALYSIS") {
        const currentEndMs = gs?.analysis_ends_at ? new Date(gs.analysis_ends_at).getTime() : now.getTime();
        const baseMs = !isNaN(currentEndMs) && currentEndMs > now.getTime() ? currentEndMs : now.getTime();
        
        let newEndMs = baseMs;
        if (typeof minutesToAdd === "number") {
          newEndMs = Math.max(now.getTime() + 10000, baseMs + minutesToAdd * 60 * 1000);
        } else if (typeof setRemainingMinutes === "number") {
          newEndMs = Math.max(now.getTime() + 10000, now.getTime() + Math.max(0.1, setRemainingMinutes) * 60 * 1000);
        }

        const newAnalysisEndsAt = new Date(newEndMs).toISOString();
        const tradingDurationMs = (Number(gs?.trading_duration_minutes) || 5) * 60 * 1000;
        const newTradingEndsAt = new Date(newEndMs + tradingDurationMs).toISOString();

        updates.analysis_ends_at = newAnalysisEndsAt;
        updates.trading_ends_at = newTradingEndsAt;
      } else if (currentPhase === "TRADING") {
        const currentEndMs = gs?.trading_ends_at ? new Date(gs.trading_ends_at).getTime() : now.getTime();
        const baseMs = !isNaN(currentEndMs) && currentEndMs > now.getTime() ? currentEndMs : now.getTime();

        let newEndMs = baseMs;
        if (typeof minutesToAdd === "number") {
          newEndMs = Math.max(now.getTime() + 10000, baseMs + minutesToAdd * 60 * 1000);
        } else if (typeof setRemainingMinutes === "number") {
          newEndMs = Math.max(now.getTime() + 10000, now.getTime() + Math.max(0.1, setRemainingMinutes) * 60 * 1000);
        }

        updates.trading_ends_at = new Date(newEndMs).toISOString();
      } else {
        // Standard round timer fallback
        const currentEndMs = gs?.round_ends_at ? new Date(gs.round_ends_at).getTime() : now.getTime();
        const baseMs = !isNaN(currentEndMs) && currentEndMs > now.getTime() ? currentEndMs : now.getTime();

        let newEndMs = baseMs;
        if (typeof minutesToAdd === "number") {
          newEndMs = Math.max(now.getTime() + 10000, baseMs + minutesToAdd * 60 * 1000);
        } else if (typeof setRemainingMinutes === "number") {
          newEndMs = Math.max(now.getTime() + 10000, now.getTime() + Math.max(0.1, setRemainingMinutes) * 60 * 1000);
        }

        updates.round_ends_at = new Date(newEndMs).toISOString();
      }

      await supabase.from("game_state").update(updates).eq("id", 1);

      return NextResponse.json({
        success: true,
        phase: currentPhase,
        updates,
        message: `Active timer adjusted successfully.`
      });
    }

    if (action === "PREPARE_NEXT_ROUND" || action === "RESET_PHASE") {
      const { data: gs } = await supabase.from("game_state").select("*").eq("id", 1).single();
      const currentRoundNum = Number(gs?.current_round_number || 1);
      const totalRounds = Number(gs?.total_rounds || 3);
      const nextRoundNum = Math.min(totalRounds, currentRoundNum + 1);

      await supabase
        .from("game_state")
        .update({
          phase: "ROUND_ENDED",
          is_market_open: false, // PAUSED until the next crisis is released
          current_round: `Round ${currentRoundNum} Ended - Standby for Round ${nextRoundNum}`,
          current_round_number: currentRoundNum,
          analysis_ends_at: null,
          trading_ends_at: null,
          round_ends_at: null,
          active_crisis_id: null,
          active_crisis_headline: null,
          active_crisis_body: null,
          active_crisis_impacts: {},
          phase_message: `Round ${currentRoundNum} Ended. Standby for Round ${nextRoundNum} crisis release.`
        })
        .eq("id", 1);

      return NextResponse.json({
        success: true,
        phase: "ROUND_ENDED",
        message: `Round ${currentRoundNum} ended. Student terminals updated to Standby.`
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified." }, { status: 400 });
  } catch (err) {
    console.error("Round phase transition API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process phase transition." }, { status: 500 });
  }
}
