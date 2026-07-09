import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { CreateAdSchema, ListAdsSchema } from "@/lib/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = ListAdsSchema.parse(params);

    const offset = (parsed.page - 1) * parsed.page_size;

    let query = supabase
      .from("ads")
      .select("*, ad_franchise_targets(franchise_id, status)", { count: "exact" })
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (parsed.status) {
      query = query.eq("status", parsed.status);
    }

    const { data, count, error } = await query.range(offset, offset + parsed.page_size - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page: parsed.page,
      page_size: parsed.page_size,
      pages: Math.ceil((count ?? 0) / parsed.page_size),
    });
  } catch (error) {
    return handleApiError(error, "ads GET");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateAdSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid ad data", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { name, media_item_id, franchise_ids } = parsed.data;

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      throw new ApiError(403, "FORBIDDEN", "Not a member of any organization");
    }

    // Franchise manager path — auto-sets franchise
    if (member.role === "franchise_manager") {
      const { data: managedFranchise } = await supabase
        .from("franchises")
        .select("id")
        .eq("managed_by", user.id)
        .single();

      if (!managedFranchise) {
        throw new ApiError(403, "FORBIDDEN", "No managed franchise found");
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
        throw new ApiError(500, "CREATE_FAILED", "Failed to create ad");
      }

      const { error: targetError } = await supabase
        .from("ad_franchise_targets")
        .insert({ ad_id: ad.id, franchise_id: managedFranchise.id });

      if (targetError) {
        await supabase.from("ads").delete().eq("id", ad.id);
        throw new ApiError(500, "CREATE_FAILED", "Failed to link franchise");
      }

      return NextResponse.json({ ad, franchise_ids: [managedFranchise.id] });
    }

    // Advertiser path — requires franchise_ids
    if (!franchise_ids || franchise_ids.length === 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "franchise_ids is required for advertisers");
    }

    const { data: advertiser, error: advertiserError } = await supabase
      .from("advertisers")
      .select("id, org_id")
      .eq("user_id", user.id)
      .single();

    if (advertiserError || !advertiser) {
      throw new ApiError(403, "FORBIDDEN", "Advertiser account not found");
    }

    // Verify franchise_ids belong to the same org
    const { data: validFranchises } = await supabase
      .from("franchises")
      .select("id")
      .eq("org_id", advertiser.org_id)
      .in("id", franchise_ids);

    const validIds = new Set(validFranchises?.map((f) => f.id) ?? []);
    const invalidFranchises = franchise_ids.filter((id) => !validIds.has(id));

    if (invalidFranchises.length > 0) {
      throw new ApiError(400, "INVALID_FRANCHISES", "Some franchises do not belong to your organization", {
        invalid: invalidFranchises,
      });
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
      throw new ApiError(500, "CREATE_FAILED", "Failed to create ad");
    }

    const targets = franchise_ids.map((franchise_id) => ({
      ad_id: ad.id,
      franchise_id,
    }));

    const { error: targetsError } = await supabase
      .from("ad_franchise_targets")
      .insert(targets);

    if (targetsError) {
      await supabase.from("ads").delete().eq("id", ad.id);
      throw new ApiError(500, "CREATE_FAILED", "Failed to link franchises");
    }

    return NextResponse.json({ ad, franchise_ids });
  } catch (error) {
    return handleApiError(error, "ads POST");
  }
}
