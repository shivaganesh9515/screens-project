import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email, role, orgId } = await request.json();

    if (!email || !role || !orgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["admin", "editor", "viewer", "franchise", "advertiser"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if the requesting user is an admin of the org
    const { data: member, error: memberError } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Not a member of this org" }, { status: 403 });
    }

    if (member.role !== "admin") {
      return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    // Use service_role client to look up users via Admin API
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Server configuration incomplete — contact the developer to set SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
    const { data: users } = await adminClient.auth.admin.listUsers();

    const invitedUser = users?.users.find((u) => u.email === email);

    if (!invitedUser) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "This email doesn't have an account yet. Ask them to sign up first, then invite them again.",
        },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("org_members")
      .select("user_id")
      .eq("user_id", invitedUser.id)
      .eq("org_id", orgId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 409 }
      );
    }

    // Insert the org_members row
    const { error: insertError } = await supabase
      .from("org_members")
      .insert({ org_id: orgId, user_id: invitedUser.id, role });

    if (insertError) {
      return NextResponse.json({ error: "Failed to add member: " + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${email} has been added as ${role}` });
  } catch (err) {
    console.error("[Invite API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
