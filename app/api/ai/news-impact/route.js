import { NextResponse } from "next/server";
import { generateAINewsImpact } from "@/lib/aiNewsEngine";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      headline = "",
      newsBody = "",
      targetSector = "Technology",
      generateFromScratch = false,
      applyToDatabase = true
    } = body;

    // 1. Fetch current stocks from Supabase
    const { data: currentStocks, error: stocksFetchError } = await supabase
      .from("stocks")
      .select("*")
      .order("ticker");

    if (stocksFetchError) {
      console.warn("Could not fetch stocks from Supabase:", stocksFetchError);
    }

    const availableStocks = currentStocks && currentStocks.length > 0 ? currentStocks : [];

    // 2. Generate AI News Impact with Google Gemma-4-26b-a4b-it
    const aiResult = await generateAINewsImpact({
      headline,
      body: newsBody,
      targetSector,
      stocks: availableStocks,
      generateFromScratch
    });

    const updatedStocks = [];

    // 3. If applyToDatabase is true or "gradual", prepare news & targets
    if (applyToDatabase) {
      const isGradual = applyToDatabase === "gradual" || body.gradual === true;

      // 3a. Insert breaking news into news_feed immediately
      const impactAvg =
        aiResult.stockImpacts?.length > 0
          ? Number(
              (
                aiResult.stockImpacts.reduce((acc, curr) => acc + Number(curr.priceChangePercent || 0), 0) /
                aiResult.stockImpacts.length
              ).toFixed(2)
            )
          : 0;

      const { data: insertedNews } = await supabase
        .from("news_feed")
        .insert([
          {
            headline: aiResult.headline || headline || "AI Breaking Market Catalyst",
            body: aiResult.body || newsBody || `${aiResult.sector || targetSector} market shockwave active.`,
            sector: aiResult.sector || targetSector,
            impact_percent: impactAvg
          }
        ])
        .select()
        .single();

      // 3b. Calculate targets for each impacted stock
      const stockTargets = [];
      if (aiResult.stockImpacts && Array.isArray(aiResult.stockImpacts)) {
        for (const impact of aiResult.stockImpacts) {
          const matchedStock = availableStocks.find(
            (s) => s.ticker.toUpperCase() === impact.ticker.toUpperCase()
          );

          if (matchedStock) {
            const currentPrice = Number(matchedStock.price);
            const changeMultiplier = 1 + Number(impact.priceChangePercent) / 100;
            const targetPrice = Number(Math.max(1.0, currentPrice * changeMultiplier).toFixed(2));
            const changePercent = Number(
              (((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2)
            );

            stockTargets.push({
              ...matchedStock,
              targetPrice,
              targetChangePercent: changePercent,
              rationale: impact.rationale
            });
          }
        }
      }

      // If gradual mode requested, let the caller orchestrate the 10s transition
      if (isGradual) {
        return NextResponse.json({
          success: true,
          aiResult,
          newsItem: insertedNews,
          stockTargets,
          gradual: true
        });
      }

      // Otherwise apply instantly in DB
      for (const target of stockTargets) {
        const rawSpark = Array.isArray(target.spark_data)
          ? target.spark_data
          : [Number(target.price)];
        const updatedSpark = [...rawSpark.slice(-9), target.targetPrice];

        const { data: updatedRecord, error: updateErr } = await supabase
          .from("stocks")
          .update({
            previous_price: Number(target.price),
            price: target.targetPrice,
            change_percent: target.targetChangePercent,
            spark_data: updatedSpark
          })
          .eq("id", target.id)
          .select()
          .single();

        if (!updateErr && updatedRecord) {
          updatedStocks.push({
            ...updatedRecord,
            rationale: target.rationale,
            priceDelta: Number((target.targetPrice - Number(target.price)).toFixed(2))
          });
        }
      }

      return NextResponse.json({
        success: true,
        aiResult,
        newsItem: insertedNews,
        updatedStocks
      });
    }

    return NextResponse.json({
      success: true,
      aiResult,
      updatedStocks
    });
  } catch (err) {
    console.error("AI News Impact error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process AI news impact."
      },
      { status: 500 }
    );
  }
}
