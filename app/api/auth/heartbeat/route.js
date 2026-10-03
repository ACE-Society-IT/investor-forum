import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId, memberId, token, tabSwitches, isFocused } = body;

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

      // Update session last_seen_at and proctoring metrics
      const sessionUpdates = { last_seen_at: now };
      if (typeof tabSwitches === "number") {
        sessionUpdates.tab_switches = tabSwitches;
      }
      if (typeof isFocused === "boolean") {
        sessionUpdates.is_focused = isFocused;
      }

      await supabase
        .from("team_sessions")
        .update(sessionUpdates)
        .eq("team_id", teamId);
    }

    const isDisconnecting = body.offline === true;

    // Update team member online status
    if (memberId) {
      await supabase
        .from("team_members")
        .update({
          is_online: !isDisconnecting,
          last_seen_at: isDisconnecting ? new Date(Date.now() - 60000).toISOString() : now
        })
        .eq("id", memberId);
    } else {
      await supabase
        .from("team_members")
        .update({
          is_online: !isDisconnecting,
          last_seen_at: isDisconnecting ? new Date(Date.now() - 60000).toISOString() : now
        })
        .eq("team_id", teamId);
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return NextResponse.json({ success: false, error: "Heartbeat failed" }, { status: 500 });
  }
}
