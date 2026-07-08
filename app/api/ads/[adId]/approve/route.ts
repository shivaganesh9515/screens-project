import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function deployAdPlaylist(
  supabase: any,
  adId: string,
  franchiseId: string
) {
  const { data: approvedAd } = await supabase
    .from("ads")
    .select("id, name, media_item_id, org_id")
    .eq("id", adId)
    .single();

  if (!approvedAd?.media_item_id) return;

  const { data: mediaItem } = await supabase
    .from("media_items")
    .select("id, duration_ms")
    .eq("id", approvedAd.media_item_id)
    .single();

  const { data: screens } = await supabase
    .from("screens")
    .select("id")
    .eq("org_id", approvedAd.org_id)
    .eq("franchise_id", franchiseId);

  if (!screens || screens.length === 0) return;

  const { data: playlist } = await supabase
    .from("playlists")
    .insert({ name: approvedAd.name, org_id: approvedAd.org_id })
    .select("id")
    .single();

  if (!playlist) return;

  const durationMs = mediaItem?.duration_ms ?? 10000;

  await supabase.from("playlist_items").insert({
    playlist_id: playlist.id,
    media_item_id: approvedAd.media_item_id,
    position: 0,
    duration_ms: durationMs,
    repeat_count: 1,
  });

  const scheduleInserts = screens.map((screen) => ({
    org_id: approvedAd.org_id,
    playlist_id: playlist.id,
    screen_id: screen.id,
    is_default: true,
    priority: 0,
  }));

  await supabase.from("schedules").insert(scheduleInserts);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await params;

    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("id, org_id, submitted_by_franchise_id")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const { data: member, error: memberError } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", ad.org_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Not a member of this org" }, { status: 403 });
    }

    let franchiseId: string;

    if (member.role === "main_admin") {
      if (!ad.submitted_by_franchise_id) {
        return NextResponse.json({ error: "Ad was not submitted by a franchise" }, { status: 400 });
      }

      franchiseId = ad.submitted_by_franchise_id;
    } else if (member.role === "franchise_manager") {
      const { franchise_id } = await request.json();

      if (!franchise_id) {
        return NextResponse.json({ error: "franchise_id is required" }, { status: 400 });
      }

      const { data: franchise, error: franchiseError } = await supabase
        .from("franchises")
        .select("id, managed_by")
        .eq("id", franchise_id)
        .single();

      if (franchiseError || !franchise) {
        return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
      }

      if (franchise.managed_by !== user.id) {
        return NextResponse.json({ error: "You do not manage this franchise" }, { status: 403 });
      }

      franchiseId = franchise_id;
    } else {
      return NextResponse.json({ error: "You do not have permission to approve ads" }, { status: 403 });
    }

    const { data: target, error: targetError } = await supabase
      .from("ad_franchise_targets")
      .select("ad_id, franchise_id")
      .eq("ad_id", adId)
      .eq("franchise_id", franchiseId)
      .single();

    if (targetError || !target) {
      return NextResponse.json({ error: "Ad is not targeted to this franchise" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("ad_franchise_targets")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("ad_id", adId)
      .eq("franchise_id", franchiseId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to approve ad" }, { status: 500 });
    }

    await deployAdPlaylist(supabase, adId, franchiseId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
