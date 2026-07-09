import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { UpdatePlaylistSchema, UpdatePlaylistItemsSchema } from "@/lib/api/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const { data, error } = await supabase
      .from("playlists")
      .select("*, playlist_items(*, media_items(*))")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Playlist not found");
    }

    // Sort items by position
    const sortedItems = (data.playlist_items ?? []).sort(
      (a: any, b: any) => a.position - b.position
    );

    return NextResponse.json({ data: { ...data, items: sortedItems, playlist_items: undefined } });
  } catch (error) {
    return handleApiError(error, "playlists/[id] GET");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Try items update first
    const itemsParsed = UpdatePlaylistItemsSchema.safeParse(body);
    if (itemsParsed.success) {
      const { supabase, user } = await requireAuth();
      const { orgId } = await getUserOrgId(user.id);
      const { id } = await params;

      const { data: existing } = await supabase
        .from("playlists")
        .select("id")
        .eq("id", id)
        .eq("org_id", orgId)
        .single();

      if (!existing) {
        throw new ApiError(404, "NOT_FOUND", "Playlist not found");
      }

      // Delete existing items and re-insert
      await supabase.from("playlist_items").delete().eq("playlist_id", id);

      if (itemsParsed.data.items.length > 0) {
        const { error } = await supabase.from("playlist_items").insert(
          itemsParsed.data.items.map((item) => ({
            playlist_id: id,
            media_item_id: item.media_item_id,
            position: item.position,
            duration_ms: item.duration_ms,
          }))
        );

        if (error) throw error;
      }

      return NextResponse.json({ ok: true });
    }

    // Try name update
    const nameParsed = UpdatePlaylistSchema.safeParse(body);
    if (!nameParsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", nameParsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    if (!nameParsed.data.name) {
      throw new ApiError(400, "NO_CHANGES", "No fields to update");
    }

    const { data, error } = await supabase
      .from("playlists")
      .update({ name: nameParsed.data.name })
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "playlists/[id] PATCH");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const { data: existing } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Playlist not found");
    }

    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "playlists/[id] DELETE");
  }
}
