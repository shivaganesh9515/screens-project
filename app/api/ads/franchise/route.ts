import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { CreateFranchiseAdSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateFranchiseAdSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid ad data", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { name, media_item_id, franchise_id } = parsed.data;

    // Verify the user manages this franchise
    const { data: franchise, error: franchiseError } = await supabase
      .from("franchises")
      .select("id, org_id, managed_by")
      .eq("id", franchise_id)
      .single();

    if (franchiseError || !franchise) {
      throw new ApiError(404, "NOT_FOUND", "Franchise not found");
    }

    if (franchise.managed_by !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You do not manage this franchise");
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
      throw new ApiError(500, "CREATE_FAILED", "Failed to create ad");
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
      await supabase.from("ads").delete().eq("id", ad.id);
      throw new ApiError(500, "CREATE_FAILED", "Failed to link franchise");
    }

    return NextResponse.json({ ad, franchise_id });
  } catch (error) {
    return handleApiError(error, "ads/franchise POST");
  }
}
