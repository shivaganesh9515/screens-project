import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { BulkPlayLogSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BulkPlayLogSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid play log data", parsed.error.flatten().fieldErrors);
    }

    const { logs } = parsed.data;
    const supabase = await getServiceClient();

    // Validate screen_id references exist
    const screenIds = [...new Set(logs.map((l) => l.screen_id))];
    const { data: screens } = await supabase
      .from("screens")
      .select("id")
      .in("id", screenIds);

    const validScreenIds = new Set(screens?.map((s) => s.id) ?? []);
    const invalidScreens = screenIds.filter((id) => !validScreenIds.has(id));

    if (invalidScreens.length > 0) {
      throw new ApiError(400, "INVALID_SCREENS", "Some screen IDs do not exist", { invalid: invalidScreens });
    }

    // Insert play logs
    const { error } = await supabase.from("play_logs").insert(
      logs.map((log) => ({
        screen_id: log.screen_id,
        media_item_id: log.media_item_id ?? null,
        playlist_id: log.playlist_id ?? null,
        started_at: log.started_at,
        ended_at: log.ended_at ?? null,
        duration_ms: log.duration_ms ?? null,
      }))
    );

    if (error) {
      console.error("[PlayLogs] Insert error:", error);
      throw new ApiError(500, "INSERT_FAILED", "Failed to insert play logs");
    }

    return NextResponse.json({ ok: true, count: logs.length });
  } catch (error) {
    return handleApiError(error, "play-logs POST");
  }
}
