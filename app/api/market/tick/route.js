import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://txsvejwayjdfqzjtiqap.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const { volatility = 1.0, isMarketOpen = true } = body;

    if (!isMarketOpen) {
      return NextResponse.json({ success: true, message: "Market is closed, no tick executed." });
    }

    // 1. Fetch current stocks
    const { data: stocks, error: fetchErr } = await supabase
      .from("stocks")
      .select("*");

    if (fetchErr || !stocks || stocks.length === 0) {
      return NextResponse.json({ success: false, error: "No stocks found to tick." });
    }

    const updatedList = [];

    // 2. Perform realistic micro-fluctuation on each stock
    for (const stock of stocks) {
      const currentPrice = Number(stock.price) || 50;
      
      // Volatility factor (default volatility = 1.0 -> ~0.2% - 1.2% delta)
      const baseVolatility = (volatility || 1.0) * 0.008;
      // Normal random Gaussian approximation
      const u1 = Math.random();
      const u2 = Math.random();
      const randStd = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);

      // Micro-drift calculation
      const deltaPercent = randStd * baseVolatility;
      const rawNewPrice = currentPrice * (1 + deltaPercent);
      const newPrice = Number(Math.max(1.0, rawNewPrice).toFixed(2));
      
      const priceDelta = Number((newPrice - currentPrice).toFixed(2));
      const changePercent = Number((((newPrice - currentPrice) / currentPrice) * 100).toFixed(2));

      const rawSpark = Array.isArray(stock.spark_data) ? stock.spark_data : [currentPrice];
      const updatedSpark = [...rawSpark.slice(-12), newPrice];

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
      updatedCount: updatedList.length,
      stocks: updatedList
    });
  } catch (err) {
    console.error("Market Tick Engine error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
