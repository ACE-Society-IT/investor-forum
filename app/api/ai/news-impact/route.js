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

    // 3. If applyToDatabase is true, update stocks and insert into news_feed
    if (applyToDatabase) {
      // 3a. Insert breaking news into news_feed
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
            sector: aiResult.sector || targetSector,
            impact_percent: impactAvg
          }
        ])
        .select()
        .single();

      // 3b. Update each impacted stock's price and sparkline
      if (aiResult.stockImpacts && Array.isArray(aiResult.stockImpacts)) {
        for (const impact of aiResult.stockImpacts) {
          const matchedStock = availableStocks.find(
            (s) => s.ticker.toUpperCase() === impact.ticker.toUpperCase()
          );

          if (matchedStock) {
            const currentPrice = Number(matchedStock.price);
            const changeMultiplier = 1 + Number(impact.priceChangePercent) / 100;
            const newPrice = Number(Math.max(1.0, currentPrice * changeMultiplier).toFixed(2));
            const changePercent = Number(
              (((newPrice - currentPrice) / currentPrice) * 100).toFixed(2)
            );

            // Rolling history and sparkline
            const rawSpark = Array.isArray(matchedStock.spark_data)
              ? matchedStock.spark_data
              : [currentPrice];
            const updatedSpark = [...rawSpark.slice(-9), newPrice];

            const { data: updatedRecord, error: updateErr } = await supabase
              .from("stocks")
              .update({
                previous_price: currentPrice,
                price: newPrice,
                change_percent: changePercent,
                spark_data: updatedSpark
              })
              .eq("id", matchedStock.id)
              .select()
              .single();

            if (!updateErr && updatedRecord) {
              updatedStocks.push({
                ...updatedRecord,
                rationale: impact.rationale,
                priceDelta: Number((newPrice - currentPrice).toFixed(2))
              });
            }
          }
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
