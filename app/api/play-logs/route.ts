import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const logs = await request.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: "Array of play logs required" }, { status: 400 });
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
