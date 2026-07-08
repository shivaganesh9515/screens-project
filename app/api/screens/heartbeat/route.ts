import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { screen_id, latitude, longitude } = body;

    if (!screen_id) {
      return NextResponse.json({ error: "screen_id is required" }, { status: 400 });
    }

    let supabase;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      supabase = await createClient();
    }

    const { data: existing } = await supabase
      .from("screens")
      .select("id")
      .eq("id", screen_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("screens")
      .update({ last_seen: now, is_online: true })
      .eq("id", screen_id);

    if (error) {
      return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 });
    }

    // If GPS coordinates are provided, log to screen_locations
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
        console.error("[Heartbeat] Failed to log GPS location:", locError);
      }
    }

    return NextResponse.json({ ok: true, last_seen: now });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
