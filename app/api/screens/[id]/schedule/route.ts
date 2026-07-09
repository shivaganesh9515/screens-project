import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError(400, "VALIDATION_ERROR", "Screen ID is required");
    }

    const supabase = await getServiceClient();

    const { data: screen, error: screenErr } = await supabase
      .from("screens")
      .select("group_id, org_id")
      .eq("id", id)
      .single();

    if (screenErr || !screen) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let query = supabase
      .from("schedules")
      .select("id, playlist_id, template_id, is_default, start_at, end_at, priority")
      .eq("org_id", screen.org_id);

    if (screen.group_id) {
      query = query.or(`screen_id.eq.${id},group_id.eq.${screen.group_id}`);
    } else {
      query = query.eq("screen_id", id);
    }

    const { data: schedules } = await query
      .order("priority", { ascending: false })
      .limit(50);

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        playlist: null,
        playlist_id: null,
        template_id: null,
        zones: [],
        items: [],
        next_change_at: null,
      });
    }

    const now = new Date().toISOString();

    // Find currently active schedule, then fall back to default
    let selected = schedules.find(
      (s: any) =>
        !s.is_default &&
        s.start_at &&
        now >= s.start_at &&
        (!s.end_at || now <= s.end_at)
    );
    if (!selected) {
      selected = schedules.find((s: any) => s.is_default);
    }
    if (!selected || !selected.playlist_id) {
      return NextResponse.json({
        playlist: null,
        playlist_id: null,
        template_id: selected?.template_id ?? null,
        zones: [],
        items: [],
        next_change_at: null,
      });
    }

    const { data: items } = await supabase
      .from("playlist_items")
      .select(
        "id, media_items(id, name, type, storage_path, duration_ms), duration_ms, position"
      )
      .eq("playlist_id", selected.playlist_id)
      .order("position", { ascending: true });

    const itemsWithUrls = (items ?? []).map((item: any) => ({
      ...item,
      media_items: item.media_items
        ? {
            ...item.media_items,
            url: `${supabaseUrl}/storage/v1/object/public/media/${item.media_items.storage_path}`,
          }
        : null,
    }));

    return NextResponse.json({
      playlist: { id: selected.playlist_id },
      playlist_id: selected.playlist_id,
      template_id: selected.template_id ?? null,
      zones: [],
      items: itemsWithUrls,
      next_change_at: null,
    });
  } catch (error) {
    return handleApiError(error, "schedule GET");
  }
}
