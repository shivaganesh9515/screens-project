import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") ?? "50")));

    let query = supabase
      .from("screens")
      .select("*", { count: "exact" })
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const offset = (page - 1) * pageSize;
    const { data, count, error } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      page_size: pageSize,
      pages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (error) {
    return handleApiError(error, "screens GET");
  }
}
