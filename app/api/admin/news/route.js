import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { OFFICIAL_COMPETITION_DRAFTS } from "./drafts/route";

export const dynamic = "force-dynamic";

/**
 * Helper to revert stock prices associated with a news item
 */
async function revertPricesForNewsItem(newsItem) {
  if (!newsItem) return [];

  const { data: currentStocks } = await supabase.from("stocks").select("*");
  if (!Array.isArray(currentStocks) || currentStocks.length === 0) return [];

  const matchedDraft = OFFICIAL_COMPETITION_DRAFTS.find((d) =>
    d.headline?.trim().toLowerCase() === newsItem.headline?.trim().toLowerCase() ||
    (newsItem.headline && d.headline && (newsItem.headline.includes(d.headline) || d.headline.includes(newsItem.headline)))
  );

  const tickerShocks = matchedDraft?.stock_shocks_by_ticker || {};
  const targetTickers = matchedDraft?.target_stock_tickers || [];
  const sector = newsItem.sector;
  const impactPct = Number(newsItem.impact_percent) || 0;

  const revertedList = [];

  for (const stock of currentStocks) {
    let shouldRevert = false;
    let customShock = tickerShocks[stock.ticker];

    if (customShock !== undefined && customShock !== null) {
      shouldRevert = true;
    } else if (targetTickers.includes(stock.ticker)) {
      shouldRevert = true;
      customShock = impactPct;
    } else if (sector && sector !== "General" && stock.sector === sector && impactPct !== 0) {
      shouldRevert = true;
      customShock = impactPct;
    } else if (stock.previous_price && Number(stock.previous_price) !== Number(stock.price)) {
      if (sector && stock.sector === sector) {
        shouldRevert = true;
      }
    }

    if (shouldRevert) {
      const currentPrice = Number(stock.price);
      let oldPrice = Number(stock.previous_price);

      if (!oldPrice || isNaN(oldPrice) || oldPrice <= 0 || oldPrice === currentPrice) {
        if (customShock !== undefined && !isNaN(customShock) && customShock !== 0) {
          oldPrice = Number(Math.max(1.0, currentPrice / (1 + Number(customShock) / 100)).toFixed(2));
        }
      }

      if (oldPrice && !isNaN(oldPrice) && oldPrice > 0 && oldPrice !== currentPrice) {
        await supabase
          .from("stocks")
          .update({
            price: oldPrice,
            previous_price: oldPrice,
            change_percent: 0,
            updated_at: new Date().toISOString()
          })
          .eq("id", stock.id);

        revertedList.push({
          ticker: stock.ticker,
          revertedFrom: currentPrice,
          revertedTo: oldPrice
        });
      }
    }
  }

  // Reset active crisis in game_state if matching
  try {
    const { data: gs } = await supabase.from("game_state").select("*").eq("id", 1).single();
    if (
      gs?.active_crisis_headline === newsItem.headline ||
      gs?.active_crisis_id === newsItem.id ||
      (newsItem.headline && gs?.active_crisis_headline && gs.active_crisis_headline.includes(newsItem.headline))
    ) {
      await supabase
        .from("game_state")
        .update({
          phase: "IDLE",
          is_market_open: true,
          active_crisis_id: null,
          active_crisis_headline: null,
          active_crisis_body: null,
          active_crisis_impacts: {},
          phase_message: "Market Ready"
        })
        .eq("id", 1);
    }
  } catch (err) {
    console.error("Error resetting game_state during news delete:", err);
  }

  return revertedList;
}

/**
 * GET /api/admin/news
 * Fetches all news bulletins from the database.
 */
export async function GET() {
  try {
    const { data: news, error } = await supabase
      .from("news_feed")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      news: news || []
    });
  } catch (err) {
    console.error("GET /api/admin/news error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/news
 * Creates and broadcasts a news bulletin.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { headline, body: newsBody, sector, impact_percent } = body;

    if (!headline) {
      return NextResponse.json(
        { success: false, error: "News headline is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("news_feed")
      .insert([
        {
          headline: headline.trim(),
          body: (newsBody || headline).trim(),
          sector: sector || "General",
          impact_percent: Number(impact_percent) || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      news: data,
      message: "News bulletin broadcasted successfully."
    });
  } catch (err) {
    console.error("POST /api/admin/news error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/news
 * Permanently deletes a single news item (by id) or all news items (by all=true),
 * and automatically reverts changed stock prices back to their old prices!
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    if (all) {
      // Fetch all news items to revert prices for each
      const { data: allNews } = await supabase.from("news_feed").select("*");
      let totalReverted = 0;
      if (Array.isArray(allNews)) {
        for (const item of allNews) {
          const reverted = await revertPricesForNewsItem(item);
          totalReverted += reverted.length;
        }
      }

      const { error } = await supabase
        .from("news_feed")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `All news bulletins purged and ${totalReverted} stock prices restored to old prices.`
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "News bulletin ID is required." },
        { status: 400 }
      );
    }

    // 1. Fetch news item first
    const { data: newsItem } = await supabase.from("news_feed").select("*").eq("id", id).single();

    // 2. Revert affected stock prices to old prices
    let revertedStocks = [];
    if (newsItem) {
      revertedStocks = await revertPricesForNewsItem(newsItem);
    }

    // 3. Delete news item from news_feed
    const { error } = await supabase
      .from("news_feed")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `News bulletin deleted and ${revertedStocks.length} stock prices reverted to old prices.`,
      revertedStocks
    });
  } catch (err) {
    console.error("DELETE /api/admin/news error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
