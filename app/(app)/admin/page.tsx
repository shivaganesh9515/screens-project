import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, Monitor, Megaphone, Clock, BarChart3, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/components/ui/count-up";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PendingApprovalsTable } from "./pending-approvals-table";
import { RecentActivityFeed } from "./recent-activity-feed";
import { AnalyticsCards } from "@/app/(app)/overview/analytics-cards";
import { PlaybackActivityChart } from "@/app/(app)/overview/playback-activity-chart";
import { RecentActivity } from "@/app/(app)/overview/recent-activity";
import { QuickDeployWidget } from "@/app/(app)/overview/quick-deploy-widget";
import { SmartInsights } from "@/app/(app)/overview/smart-insights";
import { OperationalMetrics } from "@/app/(app)/overview/operational-metrics";
import { ScreenHealthChart } from "@/app/(app)/overview/screen-health-chart";
import { MediaDistributionChart } from "@/app/(app)/overview/media-distribution-chart";
import { TopContent } from "@/app/(app)/overview/top-content";
import { RecentMedia } from "@/app/(app)/overview/recent-media";
import { ScreenStatusList } from "@/app/(app)/overview/screen-status-list";
import { UpcomingSchedules } from "@/app/(app)/overview/upcoming-schedules";
import { OverviewMap } from "@/components/overview/overview-map";

interface ScreenRow {
  id: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  group_id: string | null;
  tags: string[] | null;
  resolution: string | null;
  screen_groups: { name: string } | null;
  created_at: string;
}

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

  // Fetch ALL data — both overview and franchise
  const [
    // Overview data
    { count: totalScreens },
    { count: onlineScreens },
    { count: totalMedia },
    { data: screens },
    { data: mediaItems },
    { data: schedules },
    { data: playlists },
    { data: screenGroups },
    { data: allMediaForMetrics },
    { data: mapScreens },
    { data: screenLocations },
    // Franchise data
    { count: totalFranchises },
    { count: totalAdvertisers },
    { count: pendingApprovalsCount },
    { data: pendingAds },
    { data: recentFranchises },
    { data: recentAdvertisers },
    { data: recentScreens },
    { data: recentAds },
  ] = await Promise.all([
    // Overview queries
    supabase.from("screens").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("screens").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("is_online", true),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("screens").select("*").eq("org_id", orgId).order("last_seen", { ascending: false }).limit(5),
    supabase.from("media_items").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(5),
    supabase.from("schedules").select("*, playlists(name), screens(name), screen_groups(name)").eq("org_id", orgId).order("created_at", { ascending: false }).limit(3),
    supabase.from("playlists").select("id, name").eq("org_id", orgId),
    supabase.from("screen_groups").select("id, name").eq("org_id", orgId),
    supabase.from("media_items").select("size_bytes").eq("org_id", orgId),
    supabase.from("screens").select("id, name, latitude, longitude, is_online, screen_type, last_seen").eq("org_id", orgId),
    supabase.from("screen_locations").select("*").eq("org_id", orgId),
    // Franchise queries
    supabase.from("franchises").select("*", { count: "exact", head: true }).eq("org_id", orgId),
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

  // Compute derived metrics
  const screenRows = (screens ?? []) as ScreenRow[];
  const screenIds = screenRows.map((s) => s.id);
  const { data: allPlayLogs } = screenIds.length > 0
    ? await supabase
        .from("play_logs")
        .select("*, screens!inner(name), media_items(name, type)")
        .in("screen_id", screenIds)
        .order("started_at", { ascending: false })
        .limit(1000)
    : { data: [] };

  const offlineScreens = (totalScreens ?? 0) - (onlineScreens ?? 0);
  const totalImpressions = allPlayLogs?.length ?? 0;
  const fleetUptime = totalScreens && totalScreens > 0 ? Math.round((onlineScreens / totalScreens) * 100) : 0;

  // Storage used
  const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;
  const totalStorageBytes = (allMediaForMetrics ?? []).reduce(
    (sum: number, item: { size_bytes?: number }) => sum + (typeof item.size_bytes === "number" ? item.size_bytes : 0),
    0
  );
  const storageUsed = Math.min(100, Math.round((totalStorageBytes / STORAGE_LIMIT_BYTES) * 100));

  // Content freshness
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentlyPlayedMediaIds = new Set(
    (allPlayLogs ?? [])
      .filter((log: { started_at: string; media_item_id?: string }) => new Date(log.started_at).getTime() > sevenDaysAgo)
      .map((log: { media_item_id?: string }) => log.media_item_id)
      .filter(Boolean)
  );
  const totalMediaCount = totalMedia ?? 0;
  const contentFreshness =
    totalMediaCount > 0
      ? Math.round((recentlyPlayedMediaIds.size / totalMediaCount) * 100)
      : 100;

  // Top content for SmartInsights
  const topContent = (() => {
    const count: Record<string, { plays: number; name: string }> = {};
    for (const log of allPlayLogs ?? []) {
      const name = log.media_items?.name;
      if (!name) continue;
      if (!count[name]) count[name] = { plays: 0, name };
      count[name].plays++;
    }
    const entries = Object.values(count).sort((a, b) => b.plays - a.plays);
    return entries[0] ?? null;
  })();

  // Franchise KPIs
  const franchiseStats = [
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

  // Unified activity feed
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
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Main Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage franchises, screens, and advertisers across your organization
          </p>
        </div>
        <Link href="/analytics">
          <Button variant="outline" className="gap-2 rounded-xl border-border">
            <BarChart3 className="h-4 w-4" />
            View Full Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* ─── ROW 1 — Overview KPI Stat Cards with trends ─── */}
      <AnalyticsCards
        totalScreens={totalScreens ?? 0}
        onlineScreens={onlineScreens ?? 0}
        offlineScreens={offlineScreens}
        totalMedia={totalMedia ?? 0}
        totalImpressions={totalImpressions}
        screenTrend={12}
        onlineTrend={5}
        offlineTrend={-3}
        contentTrend={8}
      />

      {/* ─── ROW 2 — Live Map (full width) ─── */}
      <OverviewMap
        screens={mapScreens ?? []}
        locations={screenLocations ?? []}
      />

      {/* ─── ROW 3 — Split 60/40 ─── */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <PlaybackActivityChart playLogs={allPlayLogs ?? []} />
        <QuickDeployWidget
          playlists={playlists ?? []}
          screens={screens ?? []}
          groups={screenGroups ?? []}
        />
      </div>

      {/* ─── ROW 4 — Split 50/50 ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity playLogs={allPlayLogs ?? []} />
        <div className="space-y-6">
          <SmartInsights
            totalScreens={totalScreens ?? 0}
            onlineScreens={onlineScreens ?? 0}
            offlineScreens={offlineScreens}
            topContentName={topContent?.name}
            topContentPlays={topContent?.plays}
          />
          <OperationalMetrics
            fleetUptime={fleetUptime}
            storageUsed={storageUsed}
            contentFreshness={contentFreshness}
          />
        </div>
      </div>

      {/* ─── BELOW FOLD — Detailed Analytics ─── */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          Detailed Analytics
        </h3>
        <div className="grid gap-6 lg:grid-cols-3">
          <MediaDistributionChart playLogs={allPlayLogs ?? []} />
          <ScreenHealthChart online={onlineScreens ?? 0} offline={offlineScreens} />
          <TopContent playLogs={allPlayLogs ?? []} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <RecentMedia mediaItems={mediaItems ?? []} />
          <ScreenStatusList screens={screens ?? []} />
          <UpcomingSchedules schedules={schedules ?? []} />
        </div>
      </div>

      {/* ─── DIVIDER: Franchise Section ─── */}
      <hr className="border-border" />

      {/* ─── FRANCHISE ROW 1 — Franchise KPIs ─── */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          Franchise Management
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {franchiseStats.map((stat, idx) => (
            <StaggerWrapper key={stat.label} index={idx} itemsPerRow={4}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={<CountUp end={stat.value} />}
              />
            </StaggerWrapper>
          ))}
        </div>
      </div>

      {/* ─── FRANCHISE ROW 2 — Split 50/50 ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityFeed activities={allActivities} />
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
