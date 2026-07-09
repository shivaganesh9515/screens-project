import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { CreateScheduleSchema } from "@/lib/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { searchParams } = new URL(request.url);
    const screenId = searchParams.get("screen_id");
    const groupId = searchParams.get("group_id");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") ?? "50")));

    let query = supabase
      .from("schedules")
      .select("*, screens(name), screen_groups(name), playlists(name), templates(name)", { count: "exact" })
      .eq("org_id", orgId)
      .order("priority", { ascending: false });

    if (screenId) query = query.eq("screen_id", screenId);
    if (groupId) query = query.eq("group_id", groupId);

    const offset = (page - 1) * pageSize;
    const { data, count, error } = await query.range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      page_size: pageSize,
      pages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (error) {
    return handleApiError(error, "schedules GET");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateScheduleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid schedule data", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { screen_id, group_id, playlist_id, template_id, is_default, priority, start_at, end_at, recurrence } = parsed.data;

    const { data, error } = await supabase
      .from("schedules")
      .insert({
        org_id: orgId,
        screen_id: screen_id ?? null,
        group_id: group_id ?? null,
        playlist_id: playlist_id ?? null,
        template_id: template_id ?? null,
        is_default,
        priority,
        start_at: start_at ?? null,
        end_at: end_at ?? null,
        recurrence: recurrence ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "schedules POST");
  }
}
