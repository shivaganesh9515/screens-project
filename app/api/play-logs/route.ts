import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const logs = await request.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: "Array of play logs required" }, { status: 400 });
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

    const { error } = await supabase.from("play_logs").insert(logs);

    if (error) {
      return NextResponse.json({ error: "Failed to insert play logs" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: logs.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
