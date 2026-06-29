import { createClient } from "@/lib/supabase/server";
import { PlaylistsList } from "./playlists-list";

export default async function PlaylistsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const { data: playlists } = await supabase
    .from("playlists")
    .select("*, playlist_items(count), screens: schedules(screens(name))")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return <PlaylistsList playlists={playlists ?? []} orgId={member.org_id} />;
}
