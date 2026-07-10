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

  // Fetch ONLY this advertiser's ads (flat, no nested joins)
  const adsResult = await supabase
    .from("ads")
    .select("id, name, status, media_item_id, created_at")
    .eq("advertiser_id", advertiserId)
    .order("created_at", { ascending: false });

  const adsRaw = adsResult.data ?? [];
  const adIds = adsRaw.map((a: any) => a.id);

  // Enrich ads with media_items name/type
  const adMediaIds = [...new Set(adsRaw.map((a: any) => a.media_item_id).filter(Boolean))];
  const { data: adMediaItems } = adMediaIds.length > 0
    ? await supabase.from("media_items").select("id, name, type").in("id", adMediaIds)
    : { data: [] };
  const mediaById = new Map((adMediaItems ?? []).map((m: any) => [m.id, m]));
  const ads = adsRaw.map((ad: any) => ({
    ...ad,
    media_items: ad.media_item_id && mediaById.has(ad.media_item_id)
      ? mediaById.get(ad.media_item_id)
      : null,
  }));

  // Fetch franchise targets for these ads (flat, no nested joins)
  const franchiseTargetsResult = adIds.length > 0
    ? await supabase
        .from("ad_franchise_targets")
        .select("ad_id, franchise_id, status, reviewed_at")
        .in("ad_id", adIds)
    : { data: [] };

  // Fetch franchise names for enrichment
  const targetFranchiseIds = [...new Set((franchiseTargetsResult.data ?? []).map((t: any) => t.franchise_id).filter(Boolean))];
  const { data: franchiseNamesData } = targetFranchiseIds.length > 0
    ? await supabase.from("franchises").select("id, name").in("id", targetFranchiseIds)
    : { data: [] };
  const franchiseNameMap = new Map((franchiseNamesData ?? []).map((f: any) => [f.id, f]));

  // Enrich targets with franchise names
  const franchiseTargets = (franchiseTargetsResult.data ?? []).map((t: any) => ({
    ...t,
    franchises: franchiseNameMap.has(t.franchise_id) ? franchiseNameMap.get(t.franchise_id) : null,
  }));

  // Fetch play_logs for these ads (flat, no nested joins)
  const playLogsRawResult = adIds.length > 0
    ? await supabase
        .from("play_logs")
        .select("id, ad_id, screen_id, started_at, duration_ms")
        .in("ad_id", adIds)
        .order("started_at", { ascending: false })
        .limit(5000)
    : { data: [] };

  // Enrich play_logs with screen names
  const logScreenIds = [...new Set((playLogsRawResult.data ?? []).map((l: any) => l.screen_id).filter(Boolean))];
  const { data: logScreens } = logScreenIds.length > 0
    ? await supabase.from("screens").select("id, name").in("id", logScreenIds)
    : { data: [] };
  const screenNameMap = new Map((logScreens ?? []).map((s: any) => [s.id, s]));
  const playLogs = (playLogsRawResult.data ?? []).map((log: any) => ({
    ...log,
    screens: screenNameMap.has(log.screen_id) ? screenNameMap.get(log.screen_id) : null,
  }));

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
        franchiseTargets={franchiseTargets}
        playLogs={playLogs}
        franchises={franchisesResult.data ?? []}
      />
    </div>
  );
}
