import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const token = searchParams.get("token");

    if (!teamId || !token) {
      return NextResponse.json({ valid: false, error: "Missing parameters" }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from("team_sessions")
      .select("team_id, session_token")
      .eq("team_id", teamId)
      .eq("session_token", token)
      .maybeSingle();

    if (error || !session) {
      // If team_sessions record isn't matching, check if team still exists and is not banned
      const { data: team } = await supabase
        .from("teams")
        .select("id, is_banned")
        .eq("id", teamId)
        .maybeSingle();

      if (!team || team.is_banned) {
        return NextResponse.json({ valid: false });
      }
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("Session check error:", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
