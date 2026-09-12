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
    const body = await req.json();
    const { username, password } = body;

    const cleanUser = sanitizeInput(username || "").toLowerCase().trim();
    const cleanPass = (password || "").trim();

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
      .select("id, name, username, password, cash_balance, is_admin, is_banned, created_at")
      .ilike("username", cleanUser);

    // If not found by username, try searching by team name
    if ((fetchErr || !teamList || teamList.length === 0) && cleanUser.length >= 2) {
      const { data: teamByName } = await supabase
        .from("teams")
        .select("id, name, username, password, cash_balance, is_admin, is_banned, created_at")
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

    // Single-device check: Is this team already logged in elsewhere?
    const { data: activeSession } = await supabase
      .from("team_sessions")
      .select("team_id, session_token, created_at")
      .eq("team_id", team.id)
      .maybeSingle();

    if (activeSession) {
      return NextResponse.json(
        {
          success: false,
          error: "This team is already logged in on another device. Please log out from that device first and try again."
        },
        { status: 409 }
      );
    }

    // Register new session in team_sessions
    const sessionToken = crypto.randomUUID();
    const { error: sessionInsertErr } = await supabase
      .from("team_sessions")
      .insert([
        {
          team_id: team.id,
          session_token: sessionToken,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        }
      ]);

    if (sessionInsertErr) {
      console.error("Session insert error:", sessionInsertErr);
      if (sessionInsertErr.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "This team is already logged in on another device. Please log out from that device first and try again."
          },
          { status: 409 }
        );
      }
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
