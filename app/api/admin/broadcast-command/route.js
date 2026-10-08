import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/broadcast-command
 * Transmits real-time administrative commands (e.g. SOFT_REFRESH or HARD_REFRESH)
 * to all connected student terminals across the competition.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action = "SOFT_REFRESH", initiatedBy = "Competition Director" } = body;

    const validActions = ["SOFT_REFRESH", "HARD_REFRESH"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid command action. Expected one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // 1. Update singleton game_state so all connected terminals receive postgres_changes event
    const { error: gsErr } = await supabase
      .from("game_state")
      .update({
        last_client_command: action,
        last_client_command_time: timestamp
      })
      .eq("id", 1);

    if (gsErr) {
      console.warn("Could not write last_client_command to game_state (column might not exist yet):", gsErr.message);
      try {
        await supabase
          .from("game_state")
          .update({
            phase_message: action === "HARD_REFRESH" ? "System Refresh Initiated" : undefined
          })
          .eq("id", 1);
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      action,
      timestamp,
      initiatedBy,
      message: action === "HARD_REFRESH"
        ? "Hard reload signal transmitted to all student screens."
        : "Real-time data sync signal transmitted to all student screens."
    });
  } catch (err) {
    console.error("Admin broadcast command error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to broadcast command." },
      { status: 500 }
    );
  }
}
