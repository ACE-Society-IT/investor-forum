import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sanitizeInput } from "../../../../lib/security";

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

    // Server-side verification
    const { data: team, error } = await supabase
      .from("teams")
      .select("id, name, username, cash_balance, is_admin, is_banned, created_at")
      .eq("username", cleanUser)
      .eq("password", cleanPass)
      .single();

    if (error || !team) {
      // Record failed attempt
      userAttempts.count += 1;
      if (now > userAttempts.resetAt) {
        userAttempts.resetAt = now + WINDOW_MS;
      }
      loginAttempts.set(rateKey, userAttempts);

      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify your team ID and passcode." },
        { status: 401 }
      );
    }

    if (team.is_banned) {
      return NextResponse.json(
        { success: false, error: `Access Denied: Team "${team.name}" has been frozen by the Competition Director.` },
        { status: 403 }
      );
    }

    // Reset rate limit on success
    loginAttempts.delete(rateKey);

    // Return sanitized team object (NEVER exposing password or hash)
    return NextResponse.json({
      success: true,
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
