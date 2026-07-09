import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { UpdateScreenGroupSchema } from "@/lib/api/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const parsed = UpdateScreenGroupSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { id } = await params;

    if (!parsed.data.name) {
      throw new ApiError(400, "NO_CHANGES", "No fields to update");
    }

    const { data, error } = await supabase
      .from("screen_groups")
      .update({ name: parsed.data.name })
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, "screen-groups/[id] PATCH");
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
      .from("screen_groups")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Screen group not found");
    }

    const { error } = await supabase
      .from("screen_groups")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "screen-groups/[id] DELETE");
  }
}
