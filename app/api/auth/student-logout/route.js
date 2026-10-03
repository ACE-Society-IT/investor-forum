import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId, all } = body;

    if (all) {
      // Clear all team sessions
      try {
        await supabase
          .from("team_sessions")
          .delete()
          .neq("team_id", "00000000-0000-0000-0000-000000000000");
      } catch (_) {}

      return NextResponse.json({ success: true, message: "All desk sessions unlocked successfully." });
    }

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID is required to log out." },
        { status: 400 }
      );
    }

    try {
      await supabase
        .from("team_sessions")
        .delete()
        .eq("team_id", teamId);
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Session unlocked successfully." });
  } catch (err) {
    console.error("Student logout route error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during logout." },
      { status: 500 }
    );
  }
}
