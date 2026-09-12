import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId } = body;

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

    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    console.error("Student logout route error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during logout." },
      { status: 500 }
    );
  }
}
