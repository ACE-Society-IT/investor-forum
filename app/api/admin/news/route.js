import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

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
 * Permanently deletes a single news item (by id) or all news items (by all=true).
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    if (all) {
      const { error } = await supabase
        .from("news_feed")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "All news bulletins permanently purged."
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "News bulletin ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("news_feed")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "News bulletin permanently deleted from database."
    });
  } catch (err) {
    console.error("DELETE /api/admin/news error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
