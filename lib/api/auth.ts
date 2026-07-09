import { createClient } from "@/lib/supabase/server";
import { ApiError } from "./errors";

/**
 * Require an authenticated user via cookie-based Supabase session.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  return { supabase, user };
}

/**
 * Require the user to be a member of the specified org.
 */
export async function requireOrgMember(orgId: string) {
  const { supabase, user } = await requireAuth();

  const { data: member, error } = await supabase
    .from("org_members")
    .select("role, org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (error || !member) {
    throw new ApiError(403, "FORBIDDEN", "Not a member of this organization");
  }

  return { supabase, user, member };
}

/**
 * Require the user to have one of the specified roles in the org.
 */
export async function requireRole(orgId: string, roles: string[]) {
  const { supabase, user, member } = await requireOrgMember(orgId);

  if (!roles.includes(member.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      `Requires role: ${roles.join(" or ")}`,
      { required: roles, current: member.role }
    );
  }

  return { supabase, user, member };
}

/**
 * Get the user's org ID from their membership.
 */
export async function getUserOrgId(user: string) {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user)
    .single();

  if (error || !member) {
    throw new ApiError(403, "FORBIDDEN", "Not a member of any organization");
  }

  return { supabase, orgId: member.org_id };
}

/**
 * Create a service-role Supabase client (bypasses RLS).
 * Use only for device endpoints or admin operations.
 */
export async function getServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = await createClient();
    return supabase;
  }

  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
