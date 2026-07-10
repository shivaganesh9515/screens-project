import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminScreensTable } from "./admin-screens-table";
import { Building2, MonitorSmartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  if (member.role !== "admin" && member.role !== "main_admin") {
    redirect("/screens");
  }

  const orgId = member.org_id;

  // Fetch all screens with franchise info
  const [screensResult, franchisesResult] = await Promise.all([
    supabase
      .from("screens")
      .select("*, screen_groups(name), franchises(name)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("franchises")
      .select("id, name")
      .eq("org_id", orgId)
      .order("name"),
  ]);

  const screens = screensResult.data ?? [];
  const franchises = franchisesResult.data ?? [];

  // Count stats
  const totalScreens = screens.length;
  const onlineScreens = screens.filter((s) => s.is_online && s.last_seen && Date.now() - new Date(s.last_seen).getTime() < 90_000).length;
  const franchiseCount = franchises.length;
  const screensWithFranchise = screens.filter((s) => s.franchise_id).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin Overview</h2>
        <p className="text-sm text-muted-foreground">
          Complete visibility across all franchises and screens
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <MonitorSmartphone className="h-3.5 w-3.5" />
            Total Screens
          </div>
          <p className="text-3xl font-bold text-foreground">{totalScreens}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Screens Online
          </div>
          <p className="text-3xl font-bold text-emerald-600">{onlineScreens}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <Building2 className="h-3.5 w-3.5" />
            Franchises
          </div>
          <p className="text-3xl font-bold text-foreground">{franchiseCount}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <MonitorSmartphone className="h-3.5 w-3.5" />
            Assigned to Franchise
          </div>
          <p className="text-3xl font-bold text-foreground">{screensWithFranchise}</p>
        </div>
      </div>

      {/* Screens table with all filters */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">All Screens</h3>
        <AdminScreensTable
          screens={screens}
          franchises={franchises}
          orgId={orgId}
        />
      </div>
    </div>
  );
}
