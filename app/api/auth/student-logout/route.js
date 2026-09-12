import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId, all } = body;

    if (all) {
      // Clear all team sessions (Director Emergency Reset)
      const { error } = await supabase
        .from("team_sessions")
        .delete()
        .neq("team_id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error("Error clearing all team sessions:", error);
        return NextResponse.json(
          { success: false, error: "Failed to clear all sessions." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "All desk sessions unlocked successfully." });
    }

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID is required to log out." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("team_sessions")
      .delete()
      .eq("team_id", teamId);

    if (error) {
      console.error("Error clearing team session:", error);
      return NextResponse.json(
        { success: false, error: "Failed to clear session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Session unlocked successfully." });
  } catch (err) {
    console.error("Student logout route error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during logout." },
      { status: 500 }
    );
  }
}
