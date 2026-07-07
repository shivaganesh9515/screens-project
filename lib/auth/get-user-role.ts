import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "editor" | "viewer" | "main_admin" | "franchise_manager" | "franchise" | "advertiser";

export interface UserRoleInfo {
  user: { id: string; email: string } | null;
  orgId: string | null;
  role: UserRole | null;
}

export async function getUserRole(): Promise<UserRoleInfo> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, orgId: null, role: null };
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email ?? "" },
    orgId: member?.org_id ?? null,
    role: member?.role as UserRole | null,
  };
}
