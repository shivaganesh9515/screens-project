import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { HeartbeatSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = HeartbeatSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid heartbeat data", parsed.error.flatten().fieldErrors);
    }

    const { screen_id, latitude, longitude } = parsed.data;
    const supabase = await getServiceClient();

    // Verify screen exists
    const { data: screen, error: findError } = await supabase
      .from("screens")
      .select("id")
      .eq("id", screen_id)
      .single();

    if (findError || !screen) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    const now = new Date().toISOString();

    // Update heartbeat
    const { error } = await supabase
      .from("screens")
      .update({ last_seen: now, is_online: true })
      .eq("id", screen_id);

    if (error) {
      console.error("[Heartbeat] Update error:", error);
      throw new ApiError(500, "UPDATE_FAILED", "Failed to update heartbeat");
    }

    // Log GPS if provided
    if (latitude != null && longitude != null) {
      const { error: locError } = await supabase
        .from("screen_locations")
        .insert({
          screen_id,
          latitude,
          longitude,
          recorded_at: now,
        });

      if (locError) {
        console.error("[Heartbeat] GPS log error:", locError);
      }
    }

    return NextResponse.json({ ok: true, last_seen: now });
  } catch (error) {
    return handleApiError(error, "heartbeat POST");
  }
}
