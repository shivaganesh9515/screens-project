import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, Monitor, Megaphone, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/hooks/useCountUp";
import { PendingApprovalsTable } from "./pending-approvals-table";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  const orgId = member.org_id;

  const [
    { count: totalFranchises },
    { count: totalScreens },
    { count: totalAdvertisers },
    { count: pendingApprovalsCount },
    { data: pendingAds },
  ] = await Promise.all([
    supabase.from("franchises").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("screens").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("advertisers").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("ads").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "pending"),
    supabase
      .from("ads")
      .select(`
        id,
        name,
        created_at,
        advertisers (name),
        ad_franchise_targets (
          franchises (name)
        )
      `)
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const stats = [
    {
      icon: <Building2 className="text-primary" />,
      label: "Total Franchises",
      value: totalFranchises ?? 0,
      description: "Active franchise locations",
    },
    {
      icon: <Monitor className="text-emerald-500" />,
      label: "Total Screens",
      value: totalScreens ?? 0,
      description: "Across all franchises",
    },
    {
      icon: <Megaphone className="text-amber-500" />,
      label: "Total Advertisers",
      value: totalAdvertisers ?? 0,
      description: "Active ad accounts",
    },
    {
      icon: <Clock className="text-red-400" />,
      label: "Pending Approvals",
      value: pendingApprovalsCount ?? 0,
      description: "Awaiting review",
    },
  ];

  const recentActivity = [
    { id: "1", franchise: "Downtown Location", action: "Added 3 new screens", time: "2 hours ago" },
    { id: "2", franchise: "Airport Terminal", action: "Updated ad campaign", time: "5 hours ago" },
    { id: "3", franchise: "Shopping Mall", action: "Approved ad targeting", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Main Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage franchises, screens, and advertisers across your organization
        </p>
      </div>

      {/* ROW 1 — 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <StaggerWrapper key={stat.label} index={idx} itemsPerRow={4}>
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={<CountUp end={stat.value} />}
            />
          </StaggerWrapper>
        ))}
      </div>

      {/* ROW 2 — Split 50/50 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Franchise Activity */}
        <SectionCard
          title="Recent Franchise Activity"
          subtitle="Latest updates from your franchise network"
        >
          <div className="max-h-[340px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No recent activity"
                description="Franchise activity will appear here"
                className="py-10 border-0"
              />
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, idx) => (
                  <StaggerWrapper key={item.id} index={idx} itemsPerRow={1}>
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-muted/50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {item.franchise}
                        </p>
                        <p className="text-xs text-muted-foreground/70">{item.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {item.time}
                      </span>
                    </div>
                  </StaggerWrapper>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Pending Franchise Approvals */}
        <SectionCard
          title="Pending Franchise Approvals"
          subtitle="Requests requiring your attention"
        >
          <div className="max-h-[400px] overflow-y-auto">
            <PendingApprovalsTable ads={pendingAds ?? []} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
