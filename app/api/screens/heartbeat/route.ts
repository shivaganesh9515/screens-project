import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { screen_id } = await request.json();

    if (!screen_id) {
      return NextResponse.json({ error: "screen_id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("screens")
      .update({ last_seen: now, is_online: true })
      .eq("id", screen_id);

    if (error) {
      return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, last_seen: now });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
