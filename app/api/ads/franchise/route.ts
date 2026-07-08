import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, media_item_id, franchise_id } = await request.json();

    if (!name || !franchise_id) {
      return NextResponse.json({ error: "Missing required fields: name, franchise_id" }, { status: 400 });
    }

    // Verify the user manages this franchise
    const { data: franchise, error: franchiseError } = await supabase
      .from("franchises")
      .select("id, org_id, managed_by")
      .eq("id", franchise_id)
      .single();

    if (franchiseError || !franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }

    if (franchise.managed_by !== user.id) {
      return NextResponse.json({ error: "You do not manage this franchise" }, { status: 403 });
    }

    // Create the ad with submitted_by_franchise_id
    const { data: ad, error: adError } = await supabase
      .from("ads")
      .insert({
        name,
        org_id: franchise.org_id,
        media_item_id: media_item_id || null,
        submitted_by_franchise_id: franchise_id,
        status: "pending",
      })
      .select()
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
    }

    // Create the franchise target
    const { error: targetError } = await supabase
      .from("ad_franchise_targets")
      .insert({
        ad_id: ad.id,
        franchise_id: franchise_id,
        status: "pending",
      });

    if (targetError) {
      // Rollback: delete the ad if target creation fails
      await supabase.from("ads").delete().eq("id", ad.id);
      return NextResponse.json({ error: "Failed to link franchise" }, { status: 500 });
    }

    return NextResponse.json({ ad, franchise_id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
