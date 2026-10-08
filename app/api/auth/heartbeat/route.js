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
    const isDisconnecting = body.offline === true;

    // Update or upsert session presence
    const sessionUpdates = {
      team_id: teamId,
      last_seen_at: isDisconnecting ? new Date(Date.now() - 120000).toISOString() : now
    };
    if (typeof tabSwitches === "number") {
      sessionUpdates.tab_switches_count = tabSwitches;
    }
    if (typeof isFocused === "boolean") {
      sessionUpdates.is_focused = isFocused;
    }
    if (token) {
      sessionUpdates.session_token = token;
    }

    try {
      // Try updating existing session
      const { data: updated } = await supabase
        .from("team_sessions")
        .update(sessionUpdates)
        .eq("team_id", teamId)
        .select();

      // If no row existed, insert session
      if (!updated || updated.length === 0) {
        try {
          await supabase.from("team_sessions").insert([sessionUpdates]);
        } catch (_) {}
      }
    } catch (_) {}

    // Update team member online status
    try {
      if (memberId) {
        try {
          await supabase
            .from("team_members")
            .update({
              is_online: !isDisconnecting,
              last_seen_at: isDisconnecting ? new Date(Date.now() - 120000).toISOString() : now
            })
            .eq("id", memberId);
        } catch (_) {}
      } else {
        try {
          await supabase
            .from("team_members")
            .update({
              is_online: !isDisconnecting,
              last_seen_at: isDisconnecting ? new Date(Date.now() - 120000).toISOString() : now
            })
            .eq("team_id", teamId);
        } catch (_) {}
      }
    } catch (_) {}

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return NextResponse.json({ success: false, error: "Heartbeat failed" }, { status: 500 });
  }
}
