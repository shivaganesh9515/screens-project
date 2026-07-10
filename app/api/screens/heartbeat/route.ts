import { NextResponse } from "next/server";

function isValidCoordinate(lat: number, lng: number): boolean {
  // Reject out-of-bounds coordinates
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // Reject (0,0) — unset/sentinel location
  if (lat === 0 && lng === 0) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { screen_id, latitude, longitude, accuracy, token } = body;

    if (!screen_id || typeof screen_id !== "string") {
      return NextResponse.json({ error: "screen_id is required" }, { status: 400 });
    }

    // Validate GPS coordinates if provided
    if (latitude != null || longitude != null) {
      if (!isValidCoordinate(latitude, longitude)) {
        console.warn("[Heartbeat] Invalid GPS coordinates:", latitude, longitude, "for screen", screen_id);
        return NextResponse.json({ error: "Invalid GPS coordinates" }, { status: 400 });
      }
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
      .select("id, unique_number")
      .eq("id", screen_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    // Validate screen token if the screen has one assigned
    if (existing.unique_number) {
      if (!token) {
        return NextResponse.json({ error: "Screen token required" }, { status: 401 });
      }
      if (token !== existing.unique_number) {
        console.warn("[Heartbeat] Token mismatch for screen", screen_id);
        return NextResponse.json({ error: "Invalid screen token" }, { status: 403 });
      }
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
      const locationRecord: Record<string, any> = {
        screen_id,
        latitude,
        longitude,
        recorded_at: now,
      };

      // Store GPS accuracy if provided (from navigator.geolocation.watchPosition)
      if (typeof accuracy === "number") {
        locationRecord.accuracy = accuracy;
      }

      const { error: locError } = await supabase
        .from("screen_locations")
        .insert(locationRecord);

      if (locError) {
        console.error("[Heartbeat] Failed to log GPS location:", locError);
      }
    }

    // NOTE: Offline detection is handled by the scheduled cron job
    // at /api/screens/check-online (see vercel.json for cron config).
    // The inline check was removed because running a full table scan on
    // every heartbeat does not scale to thousands of screens.

    return NextResponse.json({ ok: true, last_seen: now });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
