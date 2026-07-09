import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    // Get the media item to find its storage path
    const { data: media, error: findError } = await supabase
      .from("media_items")
      .select("id, storage_path, thumbnail_path")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (findError || !media) {
      throw new ApiError(404, "NOT_FOUND", "Media item not found");
    }

    // Delete from Storage
    if (media.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([media.storage_path]);

      if (storageError) {
        console.error("[Media] Storage delete error:", storageError);
      }
    }

    // Delete thumbnail if exists
    if (media.thumbnail_path) {
      await supabase.storage.from("media").remove([media.thumbnail_path]);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("media_items")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (dbError) {
      throw new ApiError(500, "DELETE_FAILED", "Failed to delete media item");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "media/[id] DELETE");
  }
}
