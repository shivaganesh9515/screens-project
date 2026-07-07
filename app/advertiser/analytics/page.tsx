import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdvertiserAnalyticsDashboard } from "./advertiser-analytics";

export default async function AdvertiserAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find the advertiser record linked to this user
  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id, name, org_id")
    .eq("user_id", user.id)
    .single();

  if (!advertiser) {
    redirect("/overview");
  }

  const orgId = advertiser.org_id;
  const advertiserId = advertiser.id;

  // Fetch ONLY this advertiser's ads
  const adsResult = await supabase
    .from("ads")
    .select("id, name, status, media_item_id, created_at, media_items(name, type)")
    .eq("advertiser_id", advertiserId)
    .order("created_at", { ascending: false });

  const ads = adsResult.data ?? [];
  const adIds = ads.map((a: any) => a.id);

  // Fetch franchise targets for these ads
  const franchiseTargetsResult = adIds.length > 0
    ? await supabase
        .from("ad_franchise_targets")
        .select("ad_id, franchise_id, status, reviewed_at, franchises!inner(name)")
        .in("ad_id", adIds)
    : { data: [] };

  // Fetch play_logs for these ads
  const playLogsResult = adIds.length > 0
    ? await supabase
        .from("play_logs")
        .select("id, ad_id, screen_id, started_at, duration_ms, screens!left(name)")
        .in("ad_id", adIds)
        .order("started_at", { ascending: false })
        .limit(5000)
    : { data: [] };

  // Fetch all franchises for reference
  const franchisesResult = await supabase
    .from("franchises")
    .select("id, name")
    .eq("org_id", orgId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My Ad Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track your ad performance, play counts, and approval status across all franchise locations
        </p>
      </div>
      <AdvertiserAnalyticsDashboard
        ads={ads}
        franchiseTargets={franchiseTargetsResult.data ?? []}
        playLogs={playLogsResult.data ?? []}
        franchises={franchisesResult.data ?? []}
      />
    </div>
  );
}
