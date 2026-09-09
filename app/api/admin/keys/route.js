import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sanitizeInput } from "../../../../lib/security";

/**
 * GET /api/admin/keys
 * Fetches all registered Director Master Keys.
 */
export async function GET(req) {
  try {
    const { data: keys, error } = await supabase
      .from("admin_keys")
      .select("id, key_name, key_code, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch admin keys from DB:", error);
      // Return default master keys as fallback if table is empty or uninitialized
      return NextResponse.json({
        success: true,
        keys: [
          {
            id: "default-1",
            key_name: "Lead Director Key (Default)",
            key_code: "IF-ADMIN-KEY-2026",
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: "default-2",
            key_name: "Operations Key (Default)",
            key_code: "admin123",
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      keys: keys || []
    });
  } catch (err) {
    console.error("GET /api/admin/keys error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/keys
 * Creates a new Director Master Key.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const keyName = sanitizeInput(body.key_name || "").trim() || "Director Master Key";
    const keyCode = sanitizeInput(body.key_code || "").trim();
    const isActive = body.is_active !== undefined ? Boolean(body.is_active) : true;

    if (!keyCode || keyCode.length < 4) {
      return NextResponse.json(
        { success: false, error: "Master key code must be at least 4 characters long." },
        { status: 400 }
      );
    }

    // Insert into admin_keys table
    const { data, error } = await supabase
      .from("admin_keys")
      .insert([
        {
          key_name: keyName,
          key_code: keyCode,
          is_active: isActive
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, error: "An admin key with this exact code already exists." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      key: data,
      message: "Admin Master Key created successfully."
    });
  } catch (err) {
    console.error("POST /api/admin/keys error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/keys
 * Toggles active state or updates key details.
 */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, is_active, key_name } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Key ID is required." }, { status: 400 });
    }

    const updates = {};
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (key_name) updates.key_name = sanitizeInput(key_name).trim();

    const { data, error } = await supabase
      .from("admin_keys")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      key: data,
      message: `Key status updated to ${data.is_active ? "ACTIVE" : "REVOKED"}.`
    });
  } catch (err) {
    console.error("PATCH /api/admin/keys error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/keys
 * Permanently removes an admin master key.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Key ID is required." }, { status: 400 });
    }

    const { error } = await supabase.from("admin_keys").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Admin Master Key permanently deleted."
    });
  } catch (err) {
    console.error("DELETE /api/admin/keys error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
