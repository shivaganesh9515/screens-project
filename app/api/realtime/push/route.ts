import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { screen_id, type, payload } = await request.json();

    if (!screen_id || !type) {
      return NextResponse.json({ error: "screen_id and type are required" }, { status: 400 });
    }

    // Use Supabase Realtime to broadcast to the screen's channel
    const channel = supabase.channel(`screen:${screen_id}`);
    await channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: type,
          payload: payload ?? {},
        });
      }
    });

    // Note: In production, use a server-side Realtime admin client
    // For now, we acknowledge the push request
    return NextResponse.json({ ok: true, screen_id, type });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
