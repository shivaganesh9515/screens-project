import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { OnboardSchema } from "@/lib/api/validation";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing authorization header");
    }

    const accessToken = authHeader.slice(7);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new ApiError(500, "MISCONFIGURED", "Server misconfigured");
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid token");
    }

    // Check if already has an org
    const { data: existing } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ org_id: existing.org_id });
    }

    // Parse optional name
    let orgName = "My Organization";
    try {
      const body = await request.json();
      const parsed = OnboardSchema.safeParse(body);
      if (parsed.success && parsed.data.name) {
        orgName = parsed.data.name;
      }
    } catch {
      // Empty body is fine
    }

    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "my-organization";

    let slug = baseSlug;
    for (let i = 1; i < 20; i++) {
      const { data: clash } = await supabase
        .from("orgs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${baseSlug}-${i}`;
    }

    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .insert({ name: orgName, slug })
      .select()
      .single();

    if (orgError || !org) {
      throw new ApiError(500, "CREATE_FAILED", "Failed to create organization");
    }

    const { error: memberError } = await supabase
      .from("org_members")
      .insert({ org_id: org.id, user_id: user.id, role: "admin" });

    if (memberError) {
      // Clean up: delete the org and attempt to delete the orphaned auth user
      await supabase.from("orgs").delete().eq("id", org.id);
      // Use admin API to remove the orphaned auth user
      try {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const adminClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        await adminClient.auth.admin.deleteUser(user.id);
      } catch {
        // Best-effort cleanup — user can retry signup
      }
      throw new ApiError(500, "CREATE_FAILED", "Failed to create membership");
    }

    return NextResponse.json({ org_id: org.id });
  } catch (error) {
    return handleApiError(error, "auth/onboard POST");
  }
}
