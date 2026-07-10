import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import type { MediaItem } from "@/lib/types/database";

/**
 * Generate a placeholder image URL for local development.
 * Produces an inline SVG data URL with the media name and gradient background.
 */
function generatePlaceholderUrl(media: {
  name: string;
  type: string;
  orientation?: string | null;
  external_url?: string | null;
}): string {
  if (media.external_url) return media.external_url;

  const name = media.name || "Media";
  const isVideo = media.type === "video";
  const gradientFrom = isVideo ? "#3B82F6" : "#8B5CF6";
  const gradientTo = isVideo ? "#1D4ED8" : "#6D28D9";
  const icon = isVideo ? "▶" : "🖼";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradientFrom};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradientTo};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#bg)" />
    <text x="960" y="420" font-family="Arial,sans-serif" font-size="120" fill="rgba(255,255,255,0.3)" text-anchor="middle">${icon}</text>
    <text x="960" y="540" font-family="Arial,sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">${name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
    <text x="960" y="600" font-family="Arial,sans-serif" font-size="24" fill="rgba(255,255,255,0.6)" text-anchor="middle">${isVideo ? "Video" : "Image"}</text>
    <rect x="760" y="660" width="400" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

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
        "id, media_items(id, name, type, storage_path, duration_ms, external_url, orientation), duration_ms, position"
      )
      .eq("playlist_id", selected.playlist_id)
      .order("position", { ascending: true });

    const itemsWithUrls = (items ?? []).map((item: any) => ({
      ...item,
      media_items: item.media_items
        ? {
            ...item.media_items,
            url: generatePlaceholderUrl(item.media_items),
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
