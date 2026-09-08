import { NextResponse } from "next/server";
import crypto from "crypto";

const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "investor-forum-hmac-master-secret-2026";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ isValid: false, error: "No token provided" }, { status: 401 });
    }

    const decodedStr = Buffer.from(token, "base64").toString("utf-8");
    const { username, role, timestamp, expiresAt, signature } = JSON.parse(decodedStr);

    if (!username || !expiresAt || !signature) {
      return NextResponse.json({ isValid: false, error: "Malformed session token" }, { status: 401 });
    }

    if (Date.now() > expiresAt) {
      return NextResponse.json({ isValid: false, error: "Session expired" }, { status: 401 });
    }

    const payload = `${username}:${role}:${timestamp}:${expiresAt}`;
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return NextResponse.json({ isValid: true, user: username, role });
    } else {
      return NextResponse.json({ isValid: false, error: "Invalid cryptographic signature" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ isValid: false, error: "Token verification failed" }, { status: 401 });
  }
}
