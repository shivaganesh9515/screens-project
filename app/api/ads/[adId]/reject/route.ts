import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { ApproveRejectAdSchema } from "@/lib/api/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { adId } = await params;

    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("id, org_id, submitted_by_franchise_id")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      throw new ApiError(404, "NOT_FOUND", "Ad not found");
    }

    const { data: member, error: memberError } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", ad.org_id)
      .single();

    if (memberError || !member) {
      throw new ApiError(403, "FORBIDDEN", "Not a member of this organization");
    }

    let franchiseId: string;

    if (member.role === "admin") {
      if (!ad.submitted_by_franchise_id) {
        throw new ApiError(400, "INVALID_AD", "Ad was not submitted by a franchise");
      }
      franchiseId = ad.submitted_by_franchise_id;
    } else if (member.role === "franchise_manager") {
      const body = await request.json();
      const parsed = ApproveRejectAdSchema.safeParse(body);

      if (!parsed.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "franchise_id is required", parsed.error.flatten().fieldErrors);
      }

      const { data: franchise, error: franchiseError } = await supabase
        .from("franchises")
        .select("id, managed_by")
        .eq("id", parsed.data.franchise_id)
        .single();

      if (franchiseError || !franchise) {
        throw new ApiError(404, "NOT_FOUND", "Franchise not found");
      }

      if (franchise.managed_by !== user.id) {
        throw new ApiError(403, "FORBIDDEN", "You do not manage this franchise");
      }

      franchiseId = parsed.data.franchise_id;
    } else {
      throw new ApiError(403, "FORBIDDEN", "You do not have permission to reject ads");
    }

    const { data: target, error: targetError } = await supabase
      .from("ad_franchise_targets")
      .select("ad_id, franchise_id")
      .eq("ad_id", adId)
      .eq("franchise_id", franchiseId)
      .single();

    if (targetError || !target) {
      throw new ApiError(400, "NOT_TARGETED", "Ad is not targeted to this franchise");
    }

    const { error: updateError } = await supabase
      .from("ad_franchise_targets")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("ad_id", adId)
      .eq("franchise_id", franchiseId);

    if (updateError) {
      throw new ApiError(500, "UPDATE_FAILED", "Failed to reject ad");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "ads/[adId]/reject POST");
  }
}
