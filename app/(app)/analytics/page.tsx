import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "./analytics-dashboard";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
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

  // Server-side date range filter to reduce rows fetched
  const range = params.range ?? "90d";
  const rangeDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = rangeDays[range];
  const sinceDate = days
    ? new Date(Date.now() - days * 86_400_000).toISOString()
    : null;

  // Fetch screens
  const screensResult = await supabase
    .from("screens")
    .select("id, name, is_online")
    .eq("org_id", orgId);

  const screens = screensResult.data ?? [];
  const screenIds = screens.map((s: any) => s.id);

  // Fetch play logs with server-side date filter
  let playLogsQuery = supabase
    .from("play_logs")
    .select("*, screens!inner(name), media_items(name, type), ads!left(name)")
    .in("screen_id", screenIds)
    .order("started_at", { ascending: false })
    .limit(2000);

  if (sinceDate) {
    playLogsQuery = playLogsQuery.gte("started_at", sinceDate);
  }

  const playLogsResult = screenIds.length > 0
    ? await playLogsQuery
    : { data: [] };

  // Fetch media items
  const mediaResult = await supabase
    .from("media_items")
    .select("id, name, type")
    .eq("org_id", orgId);

  // ---- Task 1: Uptime History ----
  const statusLogsResult = screenIds.length > 0
    ? await supabase
        .from("screen_status_log")
        .select("screen_id, status, changed_at")
        .in("screen_id", screenIds)
        .order("changed_at", { ascending: false })
        .limit(5000)
    : { data: [] };

  // ---- Task 2: Ad Play Counts ----
  // Fetch ads belonging to this org
  const adsResult = await supabase
    .from("ads")
    .select("id, name, status, advertiser_id, media_items(name, type)")
    .eq("org_id", orgId);

  const ads = adsResult.data ?? [];

  // Also fetch advertisers for reference
  const advertisersResult = await supabase
    .from("advertisers")
    .select("id, name")
    .eq("org_id", orgId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Deep dive into playback statistics, screen performance, and content insights
        </p>
      </div>
      <Suspense fallback={null}>
        <AnalyticsDashboard
          playLogs={playLogsResult.data ?? []}
          screens={screens}
          mediaItems={mediaResult.data ?? []}
          statusLogs={statusLogsResult.data ?? []}
          ads={ads}
          advertisers={advertisersResult.data ?? []}
        />
      </Suspense>
    </div>
  );
}
