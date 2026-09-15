import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import crypto from "crypto";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ success: false, error: "Missing requestId" }, { status: 400 });
    }

    const { data: requestData, error } = await supabase
      .from("login_requests")
      .select("id, team_id, team_name, member_id, member_name, member_role, status, session_token, created_at, reviewed_at")
      .eq("id", requestId)
      .single();

    if (error || !requestData) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    // If approved, also fetch the current team details for client session storage
    let team = null;
    if (requestData.status === "approved") {
      const { data: teamData } = await supabase
        .from("teams")
        .select("id, name, username, cash_balance, is_admin, is_banned, participant_type, trader_title")
        .eq("id", requestData.team_id)
        .single();
      team = teamData;
    }

    return NextResponse.json({
      success: true,
      request: requestData,
      status: requestData.status,
      sessionToken: requestData.session_token,
      team
    });
  } catch (err) {
    console.error("Login approval check error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    if (!requestId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const { data: loginReq, error: reqErr } = await supabase
      .from("login_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !loginReq) {
      return NextResponse.json({ success: false, error: "Login request not found" }, { status: 404 });
    }

    if (action === "reject") {
      await supabase
        .from("login_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", requestId);

      return NextResponse.json({ success: true, status: "rejected" });
    }

    // Action: Approve
    // 1. Generate session token
    const sessionToken = crypto.randomUUID();
    const now = new Date().toISOString();

    // 2. Clear previous active session on this team desk if any
    await supabase
      .from("team_sessions")
      .delete()
      .eq("team_id", loginReq.team_id);

    // 3. Register approved session
    await supabase
      .from("team_sessions")
      .insert([
        {
          team_id: loginReq.team_id,
          session_token: sessionToken,
          ip_address: loginReq.ip_address || "unknown",
          user_agent: (loginReq.user_agent || "unknown").substring(0, 200),
          created_at: now,
          last_seen_at: now
        }
      ]);

    // 4. Update member online status if member specified
    if (loginReq.member_id) {
      await supabase
        .from("team_members")
        .update({
          is_online: true,
          last_seen_at: now
        })
        .eq("id", loginReq.member_id);
    }

    // 5. Mark login request approved with session token
    await supabase
      .from("login_requests")
      .update({
        status: "approved",
        session_token: sessionToken,
        reviewed_at: now
      })
      .eq("id", requestId);

    return NextResponse.json({
      success: true,
      status: "approved",
      sessionToken
    });
  } catch (err) {
    console.error("Login approval action error:", err);
    return NextResponse.json({ success: false, error: "Approval failed" }, { status: 500 });
  }
}
