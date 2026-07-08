import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, group_id } = await request.json();

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "No org found" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: screen, error } = await supabase
      .from("screens")
      .insert({
        org_id: member.org_id,
        name: name ?? "New Screen",
        group_id: group_id || null,
        pairing_code: code,
        pairing_expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create screen" }, { status: 500 });
    }

    return NextResponse.json({ code, screen_id: screen.id, expires_at: expiresAt });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
