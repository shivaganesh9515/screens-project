import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaylistsList } from "./playlists-list";

export default async function PlaylistsPage() {
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

  // Fetch playlists flat
  const { data: playlists } = await supabase
    .from("playlists")
    .select("id, name, created_at")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  // Count items per playlist separately
  const playlistIds = (playlists ?? []).map((p: any) => p.id);
  const { data: playlistItemsCount } = playlistIds.length > 0
    ? await supabase
        .from("playlist_items")
        .select("playlist_id, id")
        .in("playlist_id", playlistIds)
    : { data: [] };

  const countByPlaylist = new Map<string, number>();
  for (const item of playlistItemsCount ?? []) {
    countByPlaylist.set(
      (item as any).playlist_id,
      (countByPlaylist.get((item as any).playlist_id) ?? 0) + 1
    );
  }

  const enrichedPlaylists = (playlists ?? []).map((p: any) => ({
    ...p,
    playlist_items: { count: countByPlaylist.get(p.id) ?? 0 },
    screens: null,
  }));

  return <PlaylistsList playlists={enrichedPlaylists} orgId={member.org_id} />;
}
