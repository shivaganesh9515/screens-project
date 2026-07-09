import { NextResponse } from "next/server";
import { requireAuth, getUserOrgId } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { CreateScreenGroupSchema } from "@/lib/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { data, error } = await supabase
      .from("screen_groups")
      .select("*, screens(id)")
      .eq("org_id", orgId)
      .order("name");

    if (error) throw error;

    const groups = (data ?? []).map((g: Record<string, unknown> & { screens?: unknown[] }) => ({
      ...g,
      screen_count: g.screens?.length ?? 0,
      screens: undefined,
    }));

    return NextResponse.json({ data: groups });
  } catch (error) {
    return handleApiError(error, "screen-groups GET");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateScreenGroupSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid group data", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { orgId } = await getUserOrgId(user.id);

    const { data, error } = await supabase
      .from("screen_groups")
      .insert({
        name: parsed.data.name,
        org_id: orgId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "screen-groups POST");
  }
}
