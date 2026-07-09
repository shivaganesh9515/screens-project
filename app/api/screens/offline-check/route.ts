import { NextResponse } from "next/server";
import { requireAuth, getServiceClient } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/errors";

export async function POST() {
  try {
    await requireAuth();
    const supabase = await getServiceClient();

    // Find screens that haven't sent a heartbeat in 90 seconds
    const threshold = new Date(Date.now() - 90_000).toISOString();

    const { data: staleScreens, error: findError } = await supabase
      .from("screens")
      .select("id, is_online")
      .lt("last_seen", threshold)
      .eq("is_online", true);

    if (findError) throw findError;

    if (!staleScreens || staleScreens.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Mark them offline
    const { error: updateError } = await supabase
      .from("screens")
      .update({ is_online: false })
      .in("id", staleScreens.map((s: { id: string }) => s.id));

    if (updateError) throw updateError;

    // Log status changes
    const logs = staleScreens.map((s: { id: string }) => ({
      screen_id: s.id,
      status: "offline" as const,
      changed_at: new Date().toISOString(),
    }));

    await supabase.from("screen_status_log").insert(logs);

    return NextResponse.json({ updated: staleScreens.length });
  } catch (error) {
    return handleApiError(error, "screens/offline-check POST");
  }
}
