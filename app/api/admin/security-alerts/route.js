import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// In-memory fallback ring buffer for security alerts (up to 200 events)
let inMemoryAlerts = [];

export async function GET(req) {
  try {
    let combined = [...inMemoryAlerts];
    try {
      const { data: dbAlerts, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && Array.isArray(dbAlerts) && dbAlerts.length > 0) {
        const idMap = new Set(dbAlerts.map((a) => a.id));
        const nonDuplicateMemory = inMemoryAlerts.filter((a) => !idMap.has(a.id));
        combined = [...dbAlerts, ...nonDuplicateMemory];
      }
    } catch (_) {}

    // Sort by created_at descending
    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return NextResponse.json({ success: true, alerts: combined });
  } catch (err) {
    console.error("Error fetching security alerts:", err);
    return NextResponse.json({ success: true, alerts: inMemoryAlerts });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const teamId = body.teamId || body.team_id || null;
    const teamName = body.teamName || body.team_name || "Anonymous Desk";
    const leaderName = body.leaderName || body.leader_name || "Desk Trader";
    const eventType = body.eventType || body.event_type || "TOPBAR_AI_SUSPECTED";
    const details = body.details || "External browsing or AI assistance detected";
    const severity = body.severity || (eventType === "TOPBAR_AI_SUSPECTED" || eventType === "DEVTOOLS" ? "HIGH" : "MEDIUM");

    const alertItem = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      team_id: teamId,
      team_name: teamName,
      leader_name: leaderName,
      event_type: eventType,
      severity: severity,
      details: details,
      is_acknowledged: false,
      created_at: new Date().toISOString()
    };

    // Store in in-memory ring buffer immediately
    inMemoryAlerts = [alertItem, ...inMemoryAlerts.filter((a) => a.id !== alertItem.id).slice(0, 199)];

    // Try persisting to Supabase if configured
    try {
      await supabase.from("security_alerts").insert([alertItem]);

      if (teamId) {
        // Increment tab switch count on teams table
        if (eventType === "TAB_SWITCH" || eventType === "TOPBAR_AI_SUSPECTED") {
          try {
            const { data: teamData } = await supabase
              .from("teams")
              .select("tab_switches_count")
              .eq("id", teamId)
              .maybeSingle();

            const currentCount = Number(teamData?.tab_switches_count) || 0;
            await supabase
              .from("teams")
              .update({
                tab_switches_count: currentCount + 1,
                last_security_flag: new Date().toISOString()
              })
              .eq("id", teamId);
          } catch (_) {}
        }
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

      try {
        await supabase
          .from("security_alerts")
          .update({ is_acknowledged: true })
          .eq("id", alertId);
      } catch (_) {}

      return NextResponse.json({ success: true, message: "Alert acknowledged" });
    }

    if (action === "SEND_WARNING") {
      if (!teamId) {
        return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
      }

      const msg = warningMessage || "Director Notice: Tab switching and external AI tools are prohibited. Your desk is under audit.";
      
      try {
        await supabase
          .from("teams")
          .update({ director_warning: msg })
          .eq("id", teamId);
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Warning pushed directly to team desk.`
      });
    }

    if (action === "CLEAR_WARNING") {
      if (!teamId) {
        return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
      }

      try {
        await supabase
          .from("teams")
          .update({ director_warning: null })
          .eq("id", teamId);
      } catch (_) {}

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
      try {
        await supabase.from("security_alerts").delete().eq("id", alertId);
      } catch (_) {}
    } else {
      inMemoryAlerts = [];
      try {
        await supabase.from("security_alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch (_) {}
    }

    return NextResponse.json({ success: true, message: "Alerts cleared." });
  } catch (err) {
    console.error("Error deleting security alerts:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
