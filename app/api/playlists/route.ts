import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { CreatePlaylistSchema } from "@/lib/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") ?? "50")));

    const offset = (page - 1) * pageSize;

    const { data, count, error } = await supabase
      .from("playlists")
      .select("*, playlist_items(count)", { count: "exact" })
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const playlists = (data ?? []).map((p) => ({
      ...p,
      item_count: p.playlist_items?.[0]?.count ?? 0,
      playlist_items: undefined,
    }));

    return NextResponse.json({
      data: playlists,
      total: count ?? 0,
      page,
      page_size: pageSize,
      pages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (error) {
    return handleApiError(error, "playlists GET");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreatePlaylistSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid playlist data", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        name: parsed.data.name,
        org_id: orgId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "playlists POST");
  }
}
