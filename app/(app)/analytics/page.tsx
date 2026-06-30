import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "./analytics-dashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const orgId = member.org_id;

  // Fetch screens
  const screensResult = await supabase
    .from("screens")
    .select("id, name, is_online")
    .eq("org_id", orgId);

  const screens = screensResult.data ?? [];
  const screenIds = screens.map((s: any) => s.id);

  // Fetch all play logs for analytics (with date range filtering on client)
  const playLogsResult = screenIds.length > 0
    ? await supabase
        .from("play_logs")
        .select("*, screens!inner(name), media_items(name, type)")
        .in("screen_id", screenIds)
        .order("started_at", { ascending: false })
        .limit(2000)
    : { data: [] };

  // Fetch media items
  const mediaResult = await supabase
    .from("media_items")
    .select("id, name, type")
    .eq("org_id", orgId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Deep dive into playback statistics, screen performance, and content insights
        </p>
      </div>
      <AnalyticsDashboard
        playLogs={playLogsResult.data ?? []}
        screens={screens}
        mediaItems={mediaResult.data ?? []}
      />
    </div>
  );
}
