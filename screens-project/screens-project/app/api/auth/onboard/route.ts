import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ org_id: existing.org_id });
  }

  let orgName = "My Organization";
  try {
    const body = await request.json();
    if (body.name && typeof body.name === "string" && body.name.trim()) {
      orgName = body.name.trim();
    }
  } catch {}

  const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-organization";
  let slug = baseSlug;
  for (let i = 1; i < 20; i++) {
    const { data: clash } = await supabase.from("orgs").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }

  const { error: memberError } = await supabase
    .from("org_members")
    .insert({ org_id: org.id, user_id: user.id, role: "admin" });

  if (memberError) {
    await supabase.from("orgs").delete().eq("id", org.id);
    return NextResponse.json({ error: "Failed to create membership" }, { status: 500 });
  }

  return NextResponse.json({ org_id: org.id });
}
