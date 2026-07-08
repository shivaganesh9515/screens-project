import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, Monitor, Megaphone, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/components/ui/count-up";
import { PendingApprovalsTable } from "./pending-approvals-table";
import { RecentActivityFeed } from "./recent-activity-feed";

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
    { data: recentFranchises },
    { data: recentAdvertisers },
    { data: recentScreens },
    { data: recentAds },
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
    supabase
      .from("franchises")
      .select("id, name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("advertisers")
      .select("id, name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("screens")
      .select("id, name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("ads")
      .select("id, name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),
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

  // Build unified activity feed
  type ActivityItem = {
    id: string;
    type: "franchise" | "advertiser" | "screen" | "ad";
    title: string;
    entityName: string;
    createdAt: string;
  };

  const allActivities: ActivityItem[] = [
    ...(recentFranchises ?? []).map((f) => ({
      id: `franchise-${f.id}`,
      type: "franchise" as const,
      title: "New franchise created",
      entityName: f.name,
      createdAt: f.created_at,
    })),
    ...(recentAdvertisers ?? []).map((a) => ({
      id: `advertiser-${a.id}`,
      type: "advertiser" as const,
      title: "New advertiser registered",
      entityName: a.name,
      createdAt: a.created_at,
    })),
    ...(recentScreens ?? []).map((s) => ({
      id: `screen-${s.id}`,
      type: "screen" as const,
      title: "New screen added",
      entityName: s.name,
      createdAt: s.created_at,
    })),
    ...(recentAds ?? []).map((ad) => ({
      id: `ad-${ad.id}`,
      type: "ad" as const,
      title: "New ad submitted",
      entityName: ad.name,
      createdAt: ad.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

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
        <RecentActivityFeed activities={allActivities} />

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
