import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { data, error } = await supabase
      .from("org_members")
      .select("user_id, role, joined_at")
      .eq("org_id", orgId)
      .order("joined_at");

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return handleApiError(error, "org/members GET");
  }
}
