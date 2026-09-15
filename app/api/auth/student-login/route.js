import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sanitizeInput } from "../../../../lib/security";
import crypto from "crypto";

// In-memory rate limiting map (IP / username based)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 60 * 1000; // 1 minute window

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const body = await req.json();
    const { username, password, secretKey } = body;

    const cleanUser = sanitizeInput(username || "").toLowerCase().trim();
    const cleanPass = (password || "").trim();
    const cleanSecretKey = sanitizeInput(secretKey || "").trim().toUpperCase();

    if (!cleanUser || !cleanPass) {
      return NextResponse.json(
        { success: false, error: "Please provide both team identifier and passcode." },
        { status: 400 }
      );
    }

    // Rate Limiting Check
    const rateKey = `${ip}:${cleanUser}`;
    const now = Date.now();
    const userAttempts = loginAttempts.get(rateKey) || { count: 0, resetAt: now + WINDOW_MS };

    if (now < userAttempts.resetAt && userAttempts.count >= MAX_ATTEMPTS) {
      const waitSec = Math.ceil((userAttempts.resetAt - now) / 1000);
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Please wait ${waitSec}s before retrying.` },
        { status: 429 }
      );
    }

    // Server-side verification with flexible matching
    let { data: teamList, error: fetchErr } = await supabase
      .from("teams")
      .select("id, name, username, password, cash_balance, is_admin, is_banned, participant_type, trader_title, secret_key, secret_key_used, secret_key_used_at, locked_ip, locked_device_info, created_at")
      .ilike("username", cleanUser);

    // If not found by username, try searching by team name
    if ((fetchErr || !teamList || teamList.length === 0) && cleanUser.length >= 2) {
      const { data: teamByName } = await supabase
        .from("teams")
        .select("id, name, username, password, cash_balance, is_admin, is_banned, participant_type, trader_title, secret_key, secret_key_used, secret_key_used_at, locked_ip, locked_device_info, created_at")
        .ilike("name", cleanUser);
      if (teamByName && teamByName.length > 0) {
        teamList = teamByName;
      }
    }

    if (!teamList || teamList.length === 0) {
      userAttempts.count += 1;
      if (now > userAttempts.resetAt) userAttempts.resetAt = now + WINDOW_MS;
      loginAttempts.set(rateKey, userAttempts);

      return NextResponse.json(
        { success: false, error: `Team identifier "${username}" not found. Please verify your team ID.` },
        { status: 401 }
      );
    }

    // Match password (strictly case-sensitive)
    const team = teamList.find((t) => t.password === cleanPass);

    if (!team) {
      userAttempts.count += 1;
      if (now > userAttempts.resetAt) userAttempts.resetAt = now + WINDOW_MS;
      loginAttempts.set(rateKey, userAttempts);

      return NextResponse.json(
        { success: false, error: `Incorrect passcode entered for "${teamList[0].name}".` },
        { status: 401 }
      );
    }

    if (team.is_banned) {
      return NextResponse.json(
        { success: false, error: `Access Denied: Team "${team.name}" has been frozen by the Competition Director.` },
        { status: 403 }
      );
    }

    // Fetch team members if any
    const { data: membersList } = await supabase
      .from("team_members")
      .select("id, name, role, email, secret_key, secret_key_used, secret_key_used_at, locked_ip, locked_device_info, created_at")
      .eq("team_id", team.id)
      .order("created_at", { ascending: true });

    // Member Profile Resolution
    let matchedMember = null;
    if (body.memberId && membersList && membersList.length > 0) {
      matchedMember = membersList.find((m) => m.id === body.memberId) || null;
    }

    // 2. Multi-device member station session registration (each member can log in simultaneously)


    // 3. Admin Login Approval Workflow Check
    const { data: gsData } = await supabase
      .from("game_state")
      .select("require_login_approval")
      .single();

    const requireApproval = gsData?.require_login_approval !== false;

    if (requireApproval) {
      // Clean up previous pending requests from this team
      await supabase
        .from("login_requests")
        .update({ status: "cancelled" })
        .eq("team_id", team.id)
        .eq("status", "pending");

      // Insert new pending login request
      const { data: newLoginReq, error: reqInsertErr } = await supabase
        .from("login_requests")
        .insert([
          {
            team_id: team.id,
            team_name: team.name,
            member_id: matchedMember?.id || null,
            member_name: matchedMember?.name || null,
            member_role: matchedMember?.role || null,
            ip_address: ip,
            user_agent: userAgent.substring(0, 200),
            status: "pending"
          }
        ])
        .select()
        .single();

      if (!reqInsertErr && newLoginReq) {
        return NextResponse.json({
          success: true,
          pendingApproval: true,
          requestId: newLoginReq.id,
          teamName: team.name,
          memberName: matchedMember?.name || null,
          memberRole: matchedMember?.role || null,
          message: "Login request submitted. Waiting for Competition Director approval..."
        });
      }
    }

    // Register active session token
    const sessionToken = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await supabase
      .from("team_sessions")
      .upsert([
        {
          team_id: team.id,
          member_id: matchedMember?.id || null,
          session_token: sessionToken,
          ip_address: ip,
          user_agent: userAgent.substring(0, 200),
          created_at: nowIso,
          last_seen_at: nowIso
        }
      ]);

    // Update member online status
    if (matchedMember?.id) {
      await supabase
        .from("team_members")
        .update({ is_online: true, last_seen_at: nowIso })
        .eq("id", matchedMember.id);
    }

    // Reset rate limit on success
    loginAttempts.delete(rateKey);

    // Return sanitized team object & sessionToken
    return NextResponse.json({
      success: true,
      sessionToken,
      team: {
        id: team.id,
        name: team.name,
        username: team.username,
        cash_balance: team.cash_balance,
        is_admin: team.is_admin,
        is_banned: team.is_banned,
        participant_type: team.participant_type || "team",
        trader_title: team.trader_title || null,
        secret_key_used: true,
        activeMember: matchedMember ? { id: matchedMember.id, name: matchedMember.name, role: matchedMember.role } : null,
        members: membersList || [],
        created_at: team.created_at
      }
    });
  } catch (err) {
    console.error("Student Auth Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication service unavailable. Please try again." },
      { status: 500 }
    );
  }
}
