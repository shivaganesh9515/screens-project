import { NextResponse } from "next/server";

export async function GET() {
  const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  try {
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

    const cutoff = new Date(Date.now() - OFFLINE_TIMEOUT_MS).toISOString();

    // Find screens that haven't sent a heartbeat within the timeout
    const { data: staleScreens, error: findError } = await supabase
      .from("screens")
      .select("id")
      .eq("is_online", true)
      .lt("last_seen", cutoff);

    if (findError) {
      return NextResponse.json({ error: "Failed to query stale screens" }, { status: 500 });
    }

    if (!staleScreens || staleScreens.length === 0) {
      return NextResponse.json({ ok: true, marked_offline: 0 });
    }

    const staleIds = staleScreens.map((s: any) => s.id);

    // Mark them as offline
    const { error: updateError } = await supabase
      .from("screens")
      .update({ is_online: false })
      .in("id", staleIds);

    if (updateError) {
      return NextResponse.json({ error: "Failed to mark screens offline" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      marked_offline: staleIds.length,
      screens: staleIds,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
