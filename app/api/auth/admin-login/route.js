import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sanitizeInput } from "../../../../lib/security";
import crypto from "crypto";

const adminLoginAttempts = new Map();
const MAX_ADMIN_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 60 * 1000;
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "investor-forum-hmac-master-secret-2026";

function generateAdminToken(username, role = "director") {
  const timestamp = Date.now();
  const expiresAt = timestamp + SESSION_EXPIRY_MS;
  const payload = `${username}:${role}:${timestamp}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  const token = Buffer.from(JSON.stringify({ username, role, timestamp, expiresAt, signature })).toString("base64");
  return { token, expiresAt, user: username };
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const body = await req.json();
    const { authMode, username, password, adminKey } = body;

    const rateKey = `admin:${ip}`;
    const now = Date.now();
    const attempts = adminLoginAttempts.get(rateKey) || { count: 0, resetAt: now + ADMIN_LOCKOUT_MS };

    if (now < attempts.resetAt && attempts.count >= MAX_ADMIN_ATTEMPTS) {
      const waitSec = Math.ceil((attempts.resetAt - now) / 1000);
      return NextResponse.json(
        { success: false, error: `Too many failed admin attempts. Locked for ${waitSec}s.` },
        { status: 429 }
      );
    }

    if (authMode === "key") {
      const cleanKey = (adminKey || "").trim();
      if (!cleanKey) {
        return NextResponse.json(
          { success: false, error: "Please enter your Director Master Key." },
          { status: 400 }
        );
      }

      // Check admin_keys table
      const { data: keyRecord, error: keyErr } = await supabase
        .from("admin_keys")
        .select("id, key_name, is_active")
        .eq("key_code", cleanKey)
        .eq("is_active", true)
        .single();

      if (keyErr || !keyRecord) {
        attempts.count += 1;
        if (now > attempts.resetAt) attempts.resetAt = now + ADMIN_LOCKOUT_MS;
        adminLoginAttempts.set(rateKey, attempts);

        return NextResponse.json(
          { success: false, error: `Invalid Director Key. (${MAX_ADMIN_ATTEMPTS - attempts.count} attempts left)` },
          { status: 401 }
        );
      }

      adminLoginAttempts.delete(rateKey);
      const session = generateAdminToken(keyRecord.key_name || "master_director", "director");

      return NextResponse.json({
        success: true,
        session
      });
    } else {
      // Credentials mode
      const cleanUser = sanitizeInput(username || "").toLowerCase().trim();
      const cleanPass = (password || "").trim();

      if (!cleanUser || !cleanPass) {
        return NextResponse.json(
          { success: false, error: "Please provide both username and password." },
          { status: 400 }
        );
      }

      const { data: adminRecord, error: adminErr } = await supabase
        .from("teams")
        .select("id, username, is_admin")
        .eq("username", cleanUser)
        .eq("password", cleanPass)
        .eq("is_admin", true)
        .single();

      if (adminErr || !adminRecord) {
        attempts.count += 1;
        if (now > attempts.resetAt) attempts.resetAt = now + ADMIN_LOCKOUT_MS;
        adminLoginAttempts.set(rateKey, attempts);

        return NextResponse.json(
          { success: false, error: `Invalid administrator credentials. (${MAX_ADMIN_ATTEMPTS - attempts.count} attempts left)` },
          { status: 401 }
        );
      }

      adminLoginAttempts.delete(rateKey);
      const session = generateAdminToken(adminRecord.username, "admin");

      return NextResponse.json({
        success: true,
        session
      });
    }
  } catch (err) {
    console.error("Admin Auth Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication system error. Please try again." },
      { status: 500 }
    );
  }
}
