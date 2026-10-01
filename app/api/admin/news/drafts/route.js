import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/news/drafts
 * Fetches all saved/staged draft news bulletins.
 */
export async function GET() {
  try {
    const { data: drafts, error } = await supabase
      .from("staged_news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet or connection issues, gracefully return empty array
      console.warn("Error fetching staged_news:", error.message);
      return NextResponse.json({ success: true, drafts: [] });
    }

    return NextResponse.json({
      success: true,
      drafts: drafts || []
    });
  } catch (err) {
    console.error("GET /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/news/drafts
 * Creates and saves a draft/staged news bulletin with target stock shocks.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      headline,
      body: newsBody,
      sector,
      targetScope,
      targetStockIds,
      impactPercent,
      stockShocks
    } = body;

    if (!headline || !headline.trim()) {
      return NextResponse.json(
        { success: false, error: "Headline is required to save a draft." },
        { status: 400 }
      );
    }

    const payload = {
      headline: headline.trim(),
      body: (newsBody || "").trim(),
      sector: sector || "Technology",
      target_scope: targetScope === "stocks" ? "stocks" : "sector",
      target_stock_ids: Array.isArray(targetStockIds) ? targetStockIds : [],
      impact_percent: Number(impactPercent) || 0,
      stock_shocks: typeof stockShocks === "object" && stockShocks !== null ? stockShocks : {},
      status: "draft",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("staged_news")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      draft: data,
      message: "Draft catalyst successfully saved. You can release it at any time."
    });
  } catch (err) {
    console.error("POST /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/news/drafts
 * Updates an existing draft news bulletin.
 */
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      headline,
      body: newsBody,
      sector,
      targetScope,
      targetStockIds,
      impactPercent,
      stockShocks,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Draft ID is required." },
        { status: 400 }
      );
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (headline !== undefined) updates.headline = headline.trim();
    if (newsBody !== undefined) updates.body = (newsBody || "").trim();
    if (sector !== undefined) updates.sector = sector;
    if (targetScope !== undefined) updates.target_scope = targetScope;
    if (targetStockIds !== undefined) updates.target_stock_ids = targetStockIds;
    if (impactPercent !== undefined) updates.impact_percent = Number(impactPercent) || 0;
    if (stockShocks !== undefined) updates.stock_shocks = stockShocks;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("staged_news")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      draft: data,
      message: "Draft updated successfully."
    });
  } catch (err) {
    console.error("PUT /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/news/drafts
 * Permanently deletes a single draft or purges all drafts.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    if (all) {
      const { error } = await supabase
        .from("staged_news")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "All staged drafts cleared."
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Draft ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("staged_news")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Draft permanently deleted."
    });
  } catch (err) {
    console.error("DELETE /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
