import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsCards } from "./analytics-cards";
import { PlaybackActivityChart } from "./playback-activity-chart";
import { RecentActivity } from "./recent-activity";
import { QuickDeployWidget } from "./quick-deploy-widget";
import { SmartInsights } from "./smart-insights";
import { OperationalMetrics } from "./operational-metrics";
import { ScreenHealthChart } from "./screen-health-chart";
import { MediaDistributionChart } from "./media-distribution-chart";
import { TopContent } from "./top-content";
import { RecentMedia } from "./recent-media";
import { ScreenStatusList } from "./screen-status-list";
import { UpcomingSchedules } from "./upcoming-schedules";
import { OverviewMap } from "@/components/overview/overview-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, ArrowRight, MapIcon } from "lucide-react";

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

export default async function OverviewPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/setup");
  }

  const orgId = member.org_id;

  // Fetch all data in parallel
  const [
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
  ] = await Promise.all([
    supabase.from("screens").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("screens").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("is_online", true),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("screens").select("*").eq("org_id", orgId).order("last_seen", { ascending: false }).limit(5),
    supabase.from("media_items").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(5),
    supabase.from("schedules").select("*, playlists(name), screens(name), screen_groups(name)").eq("org_id", orgId).order("created_at", { ascending: false }).limit(3),
    supabase.from("playlists").select("id, name").eq("org_id", orgId),
    supabase.from("screen_groups").select("id, name").eq("org_id", orgId),
    supabase.from("media_items").select("size_bytes").eq("org_id", orgId),
    supabase.from("screens").select("id, name, latitude, longitude, is_online, screen_type").eq("org_id", orgId),
    supabase.from("screen_locations").select("*").eq("org_id", orgId),
  ]);

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

  // Compute storage used: total size of all media vs 1GB free-tier limit
  const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB
  const totalStorageBytes = (allMediaForMetrics ?? []).reduce(
    (sum: number, item: { size_bytes?: number }) => sum + (typeof item.size_bytes === "number" ? item.size_bytes : 0),
    0
  );
  const storageUsed = Math.min(100, Math.round((totalStorageBytes / STORAGE_LIMIT_BYTES) * 100));

  // Compute content freshness: % of media items played in the last 7 days
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

  // Derive top content for SmartInsights
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time analytics for your signage network
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

      {/* ROW 1 — 4 KPI Stat Cards */}
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

      {/* ROW 2 — Live Map (full width) */}
      <OverviewMap
        screens={mapScreens ?? []}
        locations={screenLocations ?? []}
      />

      {/* ROW 3 — Split 60/40 */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <PlaybackActivityChart playLogs={allPlayLogs ?? []} />
        <QuickDeployWidget
          playlists={playlists ?? []}
          screens={screens ?? []}
          groups={screenGroups ?? []}
        />
      </div>

      {/* ROW 3 — Split 50/50 */}
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

      {/* BELOW FOLD — Demoted charts */}
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
    </div>
  );
}
