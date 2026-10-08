import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { OFFICIAL_COMPETITION_DRAFTS } from "../drafts/route";

export const dynamic = "force-dynamic";

/**
 * Revert stock prices for an affected news item
 */
async function revertPricesForNewsItem(newsItem) {
  if (!newsItem) return [];

  const { data: currentStocks } = await supabase.from("stocks").select("*");
  if (!Array.isArray(currentStocks) || currentStocks.length === 0) return [];

  // Match official competition draft if available
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

      // If previous_price is not stored or equal to currentPrice, calculate old price from shock percentage
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

  // If this news was the active crisis in game_state, reset crisis state
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
    console.error("Error resetting game_state during news rollback:", err);
  }

  return revertedList;
}

/**
 * POST /api/admin/news/rollback
 * Rolls back a published news bulletin:
 * 1. Restores the story back into staged_news (Drafts)
 * 2. Reverts stock prices back to old/previous prices
 * 3. Removes the bulletin from news_feed
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, newsItem: rawNewsItem } = body;

    let newsItem = rawNewsItem;
    if (!newsItem && id) {
      const { data } = await supabase.from("news_feed").select("*").eq("id", id).single();
      newsItem = data;
    }

    if (!newsItem) {
      return NextResponse.json(
        { success: false, error: "News bulletin item or ID is required for rollback." },
        { status: 400 }
      );
    }

    // 1. Revert affected stock prices
    const revertedStocks = await revertPricesForNewsItem(newsItem);

    // 2. Reconstruct draft if not an official competition event
    const matchedDraft = OFFICIAL_COMPETITION_DRAFTS.find((d) =>
      d.headline?.trim().toLowerCase() === newsItem.headline?.trim().toLowerCase() ||
      (newsItem.headline && d.headline && (newsItem.headline.includes(d.headline) || d.headline.includes(newsItem.headline)))
    );

    let insertedDraft = null;
    if (!matchedDraft) {
      const draftPayload = {
        headline: newsItem.headline,
        body: newsItem.body || "",
        sector: newsItem.sector || "General",
        target_scope: "sector",
        target_stock_ids: [],
        impact_percent: Number(newsItem.impact_percent) || 0,
        stock_shocks: {},
        status: "draft",
        updated_at: new Date().toISOString()
      };

      try {
        const { data: insData } = await supabase
          .from("staged_news")
          .insert([draftPayload])
          .select()
          .single();
        insertedDraft = insData;
      } catch (_) {}
    } else {
      insertedDraft = matchedDraft;
    }

    // 3. Remove bulletin from news_feed
    if (newsItem.id) {
      await supabase.from("news_feed").delete().eq("id", newsItem.id);
    } else {
      await supabase.from("news_feed").delete().eq("headline", newsItem.headline);
    }

    return NextResponse.json({
      success: true,
      message: `News story rolled back to drafts and ${revertedStocks.length} stock prices reverted to old valuations.`,
      draft: insertedDraft,
      revertedStocks
    });
  } catch (err) {
    console.error("POST /api/admin/news/rollback error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to rollback news." }, { status: 500 });
  }
}
