import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { InviteMemberSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid invite data", parsed.error.flatten().fieldErrors);
    }

    const { email, role, orgId } = parsed.data;
    const { supabase, user } = await requireRole(orgId, ["admin"]);

    // Use Admin API to look up user by email (more efficient than listUsers)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      throw new ApiError(500, "MISCONFIGURED", "Server configuration incomplete");
    }

    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

    // listUsers doesn't support email filter, so scan pages
    let invitedUser: { id: string; email?: string } | null = null;
    let page = 1;
    const pageSize = 100;

    while (!invitedUser) {
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage: pageSize });

      if (listError) throw new ApiError(500, "LOOKUP_FAILED", "Failed to search users");
      if (!users?.users?.length) break;

      const found = users.users.find((u) => u.email === email);
      if (found) {
        invitedUser = found;
        break;
      }
      if (users.users.length < pageSize) break;
      page++;
    }

    if (!invitedUser) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found. Ask them to sign up first.", { email });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("org_members")
      .select("user_id")
      .eq("user_id", invitedUser.id)
      .eq("org_id", orgId)
      .single();

    if (existingMember) {
      throw new ApiError(409, "ALREADY_MEMBER", "User is already a member of this organization");
    }

    // Add the member
    const { error: insertError } = await supabase
      .from("org_members")
      .insert({ org_id: orgId, user_id: invitedUser.id, role });

    if (insertError) {
      throw new ApiError(500, "INSERT_FAILED", "Failed to add member: " + insertError.message);
    }

    return NextResponse.json({
      success: true,
      message: `${email} has been added as ${role}`,
    });
  } catch (error) {
    return handleApiError(error, "org/invite POST");
  }
}
