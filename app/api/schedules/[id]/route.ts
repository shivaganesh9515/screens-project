import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { UpdateScheduleSchema } from "@/lib/api/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const { data, error } = await supabase
      .from("schedules")
      .select("*, screens(name), screen_groups(name), playlists(name), templates(name)")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Schedule not found");
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "schedules/[id] GET");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const parsed = UpdateScheduleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const updates: Record<string, unknown> = {};
    if (parsed.data.playlist_id !== undefined) updates.playlist_id = parsed.data.playlist_id;
    if (parsed.data.template_id !== undefined) updates.template_id = parsed.data.template_id;
    if (parsed.data.is_default !== undefined) updates.is_default = parsed.data.is_default;
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
    if (parsed.data.start_at !== undefined) updates.start_at = parsed.data.start_at;
    if (parsed.data.end_at !== undefined) updates.end_at = parsed.data.end_at;
    if (parsed.data.recurrence !== undefined) updates.recurrence = parsed.data.recurrence;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "NO_CHANGES", "No fields to update");
    }

    const { data, error } = await supabase
      .from("schedules")
      .update(updates)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "schedules/[id] PATCH");
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
      .from("schedules")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Schedule not found");
    }

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "schedules/[id] DELETE");
  }
}
