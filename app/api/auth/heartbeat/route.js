import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId, memberId, token } = body;

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Verify session token if provided
    if (token) {
      const { data: session } = await supabase
        .from("team_sessions")
        .select("session_token")
        .eq("team_id", teamId)
        .maybeSingle();

      if (!session || session.session_token !== token) {
        return NextResponse.json({ success: false, error: "Session invalid or expired" }, { status: 401 });
      }

      // Update session last_seen_at
      await supabase
        .from("team_sessions")
        .update({ last_seen_at: now })
        .eq("team_id", teamId);
    }

    // Update team member online status
    if (memberId) {
      await supabase
        .from("team_members")
        .update({
          is_online: true,
          last_seen_at: now
        })
        .eq("id", memberId);
    } else {
      // If no specific memberId, update all members of this team or mark the lead trader active
      await supabase
        .from("team_members")
        .update({
          is_online: true,
          last_seen_at: now
        })
        .eq("team_id", teamId);
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return NextResponse.json({ success: false, error: "Heartbeat failed" }, { status: 500 });
  }
}
