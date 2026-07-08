import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScreensTable } from "./screens-table";
import { AddScreenModal } from "./add-screen-modal";
import { ScreenGroups } from "@/components/screens/screen-groups";

export default async function ScreensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/setup");
  }

  const orgId = member.org_id;
  const role = member.role;

  // Franchise scoping: franchise managers only see screens in their territory
  let franchiseIdFilter: string | null = null;
  if (role === "franchise_manager") {
    const { data: franchise } = await supabase
      .from("franchises")
      .select("id")
      .eq("managed_by", user.id)
      .single();
    // If no franchise found, filter by impossible ID so they see nothing
    franchiseIdFilter = franchise?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  // Build screens query with optional franchise filter
  let screensQuery = supabase
    .from("screens")
    .select("*, screen_groups(name), franchises(name)")
    .eq("org_id", orgId);

  if (franchiseIdFilter) {
    screensQuery = screensQuery.eq("franchise_id", franchiseIdFilter);
  }

  const [screensResult, groupsResult, franchisesResult] = await Promise.all([
    screensQuery.order("created_at", { ascending: false }),
    supabase
      .from("screen_groups")
      .select("*")
      .eq("org_id", orgId)
      .order("name"),
    supabase
      .from("franchises")
      .select("*")
      .eq("org_id", orgId)
      .order("name"),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Screens</h2>
          <p className="text-sm text-muted-foreground">Manage your screen devices</p>
        </div>
        <AddScreenModal groups={groupsResult.data ?? []} franchises={franchisesResult.data ?? []} orgId={orgId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScreensTable
            screens={screensResult.data ?? []}
            groups={groupsResult.data ?? []}
            orgId={orgId}
          />
        </div>
        <div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <ScreenGroups groups={groupsResult.data ?? []} screens={screensResult.data ?? []} orgId={orgId} />
          </div>
        </div>
      </div>
    </div>
  );
}
