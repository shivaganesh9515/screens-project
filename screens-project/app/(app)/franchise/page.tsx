import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScreensTable } from "@/app/(app)/screens/screens-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MonitorSmartphone, Store } from "lucide-react";

export default async function FranchisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  const orgId = member.org_id;

  // Only franchise managers and admins can view this page
  if (member.role !== "franchise_manager" && member.role !== "admin") {
    redirect("/screens");
  }

  // Look up the franchise managed by this user
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, name")
    .eq("managed_by", user.id)
    .single();

  if (!franchise) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Franchise Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage your franchise locations and screens</p>
        </div>
        <EmptyState
          icon={Store}
          title="No franchise assigned"
          description="You are not assigned as a manager to any franchise territory. Contact your organization admin."
        />
      </div>
    );
  }

  // Fetch all screens belonging to this franchise
  const [screensResult, groupsResult] = await Promise.all([
    supabase
      .from("screens")
      .select("*, screen_groups(name), franchises(name)")
      .eq("org_id", orgId)
      .eq("franchise_id", franchise.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("screen_groups")
      .select("*")
      .eq("org_id", orgId)
      .order("name"),
  ]);

  const screens = screensResult.data ?? [];
  const groups = groupsResult.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Franchise Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Screens in <span className="font-medium text-foreground">{franchise.name}</span> territory
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{franchise.name}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2">
            <MonitorSmartphone className="h-4 w-4" />
            <span>{screens.length} screen{screens.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {screens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <MonitorSmartphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">No screens in this territory</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The {franchise.name} territory has no screens registered yet. Contact your admin to add screens.
          </p>
        </div>
      ) : (
        <ScreensTable
          screens={screens}
          groups={groups}
          orgId={orgId}
          franchiseName={franchise.name}
        />
      )}
    </div>
  );
}
