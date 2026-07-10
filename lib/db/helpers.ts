// Helpers for enriching flat database query results with related data
// Replaces Supabase's nested join syntax: .select("*, screens!inner(name), media_items(name, type)")
// with two-step queries + client-side merge

import { createClient } from "@/lib/supabase/server";

type SupabaseResult = {
  data: any[] | null;
  error?: any;
};

/**
 * Fetch play_logs and enrich each row with related screens, media_items, and ads data.
 * Mimics: .select("*, screens!inner(name), media_items(name, type), ads!left(name)")
 */
export async function fetchEnrichedPlayLogs(
  options: {
    screenIds: string[];
    sinceDate?: string | null;
    limit?: number;
  }
): Promise<SupabaseResult> {
  const supabase = await createClient();

  if (options.screenIds.length === 0) {
    return { data: [] };
  }

  // 1. Fetch screens for name lookup
  const { data: screens } = await supabase
    .from("screens")
    .select("id, name")
    .in("id", options.screenIds);

  const screenMap = new Map((screens ?? []).map((s: any) => [s.id, s.name]));

  // 2. Fetch media items for name/type lookup
  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("id, name, type");

  const mediaMap = new Map((mediaItems ?? []).map((m: any) => [m.id, m]));

  // 3. Fetch ads for name lookup
  const { data: ads } = await supabase
    .from("ads")
    .select("id, name");

  const adMap = new Map((ads ?? []).map((a: any) => [a.id, a.name]));

  // 4. Fetch flat play_logs
  let query = supabase
    .from("play_logs")
    .select("id, screen_id, media_item_id, playlist_id, ad_id, started_at, ended_at, duration_ms")
    .in("screen_id", options.screenIds)
    .order("started_at", { ascending: false })
    .limit(options.limit ?? 2000);

  if (options.sinceDate) {
    query = query.gte("started_at", options.sinceDate);
  }

  const { data: logs, error } = await query;

  if (error) return { data: null, error };

  // 5. Enrich each log with nested objects
  const enriched = (logs ?? []).map((log: any) => ({
    ...log,
    screens: screenMap.has(log.screen_id)
      ? { name: screenMap.get(log.screen_id) }
      : null,
    media_items: mediaMap.has(log.media_item_id)
      ? mediaMap.get(log.media_item_id)
      : null,
    ads: log.ad_id && adMap.has(log.ad_id)
      ? { name: adMap.get(log.ad_id) }
      : null,
  }));

  return { data: enriched, error: null };
}


