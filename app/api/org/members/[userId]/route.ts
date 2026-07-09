import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const UpdateMemberSchema = z.object({
  role: z.enum(["admin", "editor", "viewer", "franchise_manager", "advertiser"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const body = await request.json();
    const parsed = UpdateMemberSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid role", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { userId } = await params;

    // Verify requesting user is an admin
    const { data: caller } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (!caller || caller.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Only admins can update member roles");
    }

    // Don't allow self-demotion
    if (userId === user.id && parsed.data.role !== "admin") {
      throw new ApiError(400, "SELF_DEMOTE", "Cannot change your own admin role");
    }

    const { error } = await supabase
      .from("org_members")
      .update({ role: parsed.data.role })
      .eq("user_id", userId)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "org/members/[userId] PATCH");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);
    const { userId } = await params;

    // Verify requesting user is an admin
    const { data: caller } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (!caller || caller.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Only admins can remove members");
    }

    // Don't allow self-removal
    if (userId === user.id) {
      throw new ApiError(400, "SELF_REMOVE", "Cannot remove yourself from the organization");
    }

    const { error } = await supabase
      .from("org_members")
      .delete()
      .eq("user_id", userId)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "org/members/[userId] DELETE");
  }
}
