import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "No org found" }, { status: 400 });
    }

    const orgId = member.org_id;

    const [screensResult, locationsResult] = await Promise.all([
      supabase
        .from("screens")
        .select("id, name, latitude, longitude, is_online, screen_type, last_seen")
        .eq("org_id", orgId),
      supabase
        .from("screen_locations")
        .select("*"),
    ]);

    return NextResponse.json({
      screens: screensResult.data ?? [],
      locations: locationsResult.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
