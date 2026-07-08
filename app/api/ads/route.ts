import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, media_item_id, franchise_ids } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Not a member of any org" }, { status: 403 });
    }

    if (member.role === "franchise_manager") {
      const { data: managedFranchise } = await supabase
        .from("franchises")
        .select("id")
        .eq("managed_by", user.id)
        .single();

      if (!managedFranchise) {
        return NextResponse.json({ error: "No managed franchise found" }, { status: 403 });
      }

      const { data: ad, error: adError } = await supabase
        .from("ads")
        .insert({
          name,
          org_id: member.org_id,
          media_item_id: media_item_id || null,
          submitted_by_franchise_id: managedFranchise.id,
        })
        .select()
        .single();

      if (adError || !ad) {
        return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
      }

      const { error: targetError } = await supabase
        .from("ad_franchise_targets")
        .insert({ ad_id: ad.id, franchise_id: managedFranchise.id });

      if (targetError) {
        await supabase.from("ads").delete().eq("id", ad.id);
        return NextResponse.json({ error: "Failed to link franchise" }, { status: 500 });
      }

      return NextResponse.json({ ad, franchise_ids: [managedFranchise.id] });
    }

    if (!franchise_ids || !Array.isArray(franchise_ids) || franchise_ids.length === 0) {
      return NextResponse.json({ error: "Missing required field: franchise_ids" }, { status: 400 });
    }

    const { data: advertiser, error: advertiserError } = await supabase
      .from("advertisers")
      .select("id, org_id")
      .eq("user_id", user.id)
      .single();

    if (advertiserError || !advertiser) {
      return NextResponse.json({ error: "Advertiser account not found" }, { status: 403 });
    }

    const { data: ad, error: adError } = await supabase
      .from("ads")
      .insert({
        name,
        advertiser_id: advertiser.id,
        org_id: advertiser.org_id,
        media_item_id: media_item_id || null,
      })
      .select()
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
    }

    const targets = franchise_ids.map((franchise_id: string) => ({
      ad_id: ad.id,
      franchise_id,
    }));

    const { error: targetsError } = await supabase
      .from("ad_franchise_targets")
      .insert(targets);

    if (targetsError) {
      await supabase.from("ads").delete().eq("id", ad.id);
      return NextResponse.json({ error: "Failed to link franchises" }, { status: 500 });
    }

    return NextResponse.json({ ad, franchise_ids });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
