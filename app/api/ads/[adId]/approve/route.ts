import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { franchise_id } = await request.json();

    if (!franchise_id) {
      return NextResponse.json({ error: "franchise_id is required" }, { status: 400 });
    }

    const { data: franchise, error: franchiseError } = await supabase
      .from("franchises")
      .select("id, org_id, managed_by")
      .eq("id", franchise_id)
      .single();

    if (franchiseError || !franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 });
    }

    const { data: member, error: memberError } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", franchise.org_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Not a member of this org" }, { status: 403 });
    }

    if (member.role !== "franchise_manager") {
      return NextResponse.json({ error: "Only franchise managers can approve ads" }, { status: 403 });
    }

    if (franchise.managed_by !== user.id) {
      return NextResponse.json({ error: "You do not manage this franchise" }, { status: 403 });
    }

    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("id")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const { data: target, error: targetError } = await supabase
      .from("ad_franchise_targets")
      .select("ad_id, franchise_id")
      .eq("ad_id", adId)
      .eq("franchise_id", franchise_id)
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
      .eq("franchise_id", franchise_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to approve ad" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
