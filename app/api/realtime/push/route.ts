import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { PushSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PushSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid push data", parsed.error.flatten().fieldErrors);
    }

    const { supabase } = await requireAuth();
    const { screen_id, type, payload } = parsed.data;

    // Verify screen exists
    const { data: screen } = await supabase
      .from("screens")
      .select("id")
      .eq("id", screen_id)
      .single();

    if (!screen) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    // Broadcast via Supabase Realtime
    const channel = supabase.channel(`screen:${screen_id}`);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new ApiError(500, "TIMEOUT", "Realtime subscription timed out"));
      }, 5000);

      channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          channel.send({
            type: "broadcast",
            event: type,
            payload: payload ?? {},
          });
          resolve();
        } else if (status === "CHANNEL_ERROR") {
          clearTimeout(timeout);
          reject(new ApiError(500, "CHANNEL_ERROR", "Realtime channel error"));
        }
      });
    });

    return NextResponse.json({ ok: true, screen_id, type });
  } catch (error) {
    return handleApiError(error, "realtime/push POST");
  }
}
