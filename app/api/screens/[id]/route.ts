import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { UpdateScreenSchema } from "@/lib/api/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const { data, error } = await supabase
      .from("screens")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "screens/[id] GET");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    const body = await request.json();
    const parsed = UpdateScreenSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors);
    }

    // Verify screen belongs to this org
    const { data: existing } = await supabase
      .from("screens")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.group_id !== undefined) updates.group_id = parsed.data.group_id;
    if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
    if (parsed.data.resolution !== undefined) updates.resolution = parsed.data.resolution;

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "NO_CHANGES", "No fields to update");
    }

    const { data, error } = await supabase
      .from("screens")
      .update(updates)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, "UPDATE_FAILED", "Failed to update screen");
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "screens/[id] PATCH");
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
      .from("screens")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Screen not found");
    }

    const { error } = await supabase
      .from("screens")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) {
      throw new ApiError(500, "DELETE_FAILED", "Failed to delete screen");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "screens/[id] DELETE");
  }
}
