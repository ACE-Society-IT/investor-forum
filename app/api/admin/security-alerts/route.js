import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// In-memory fallback ring buffer for security alerts (up to 200 events)
let inMemoryAlerts = [];

export async function GET(req) {
  try {
    const { data: dbAlerts, error } = await supabase
      .from("security_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && Array.isArray(dbAlerts) && dbAlerts.length > 0) {
      return NextResponse.json({ success: true, alerts: dbAlerts });
    }

    return NextResponse.json({ success: true, alerts: inMemoryAlerts });
  } catch (err) {
    console.error("Error fetching security alerts:", err);
    return NextResponse.json({ success: true, alerts: inMemoryAlerts });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { teamId, teamName, leaderName, eventType, details, severity = "WARNING" } = body;

    if (!teamName) {
      return NextResponse.json({ success: false, error: "Missing teamName" }, { status: 400 });
    }

    const alertItem = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      team_id: teamId || null,
      team_name: teamName,
      leader_name: leaderName || "Desk Trader",
      event_type: eventType || "TAB_SWITCH",
      severity,
      details: details || `Suspicious activity detected on desk (${eventType})`,
      is_acknowledged: false,
      created_at: new Date().toISOString()
    };

    // Store in in-memory ring buffer
    inMemoryAlerts = [alertItem, ...inMemoryAlerts.slice(0, 199)];

    // Try persisting to Supabase if configured
    try {
      await supabase.from("security_alerts").insert([alertItem]).catch(() => {});

      if (teamId) {
        // Increment tab switch count on teams table
        await supabase
          .from("teams")
          .update({
            last_security_flag: new Date().toISOString()
          })
          .eq("id", teamId)
          .catch(() => {});
      }
    } catch (_) {}

    return NextResponse.json({ success: true, alert: alertItem });
  } catch (err) {
    console.error("Error creating security alert:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { action, alertId, teamId, warningMessage } = body;

    if (action === "ACKNOWLEDGE") {
      inMemoryAlerts = inMemoryAlerts.map((a) =>
        a.id === alertId ? { ...a, is_acknowledged: true } : a
      );

      await supabase
        .from("security_alerts")
        .update({ is_acknowledged: true })
        .eq("id", alertId)
        .catch(() => {});

      return NextResponse.json({ success: true, message: "Alert acknowledged" });
    }

    if (action === "SEND_WARNING") {
      if (!teamId) {
        return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
      }

      const msg = warningMessage || "Director Notice: Tab switching and external AI tools are prohibited. Your desk is under audit.";
      
      await supabase
        .from("teams")
        .update({ director_warning: msg })
        .eq("id", teamId)
        .catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Warning pushed directly to team desk.`
      });
    }

    if (action === "CLEAR_WARNING") {
      if (!teamId) {
        return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
      }

      await supabase
        .from("teams")
        .update({ director_warning: null })
        .eq("id", teamId)
        .catch(() => {});

      return NextResponse.json({ success: true, message: "Warning cleared from desk" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Error updating security alert:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("id");

    if (alertId) {
      inMemoryAlerts = inMemoryAlerts.filter((a) => a.id !== alertId);
      await supabase.from("security_alerts").delete().eq("id", alertId).catch(() => {});
    } else {
      inMemoryAlerts = [];
      await supabase.from("security_alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000").catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Alerts cleared." });
  } catch (err) {
    console.error("Error deleting security alerts:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
