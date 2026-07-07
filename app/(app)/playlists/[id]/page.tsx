import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaylistBuilder } from "./playlist-builder";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: playlist } = await supabase
    .from("playlists")
    .select("*, playlist_items(*, media_items(*))")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .order("playlist_items(position)", { ascending: true })
    .single();

  if (!playlist) notFound();

  const { data: mediaItems } = await supabase
    .from("media_items")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return (
    <PlaylistBuilder
      playlist={playlist}
      mediaItems={mediaItems ?? []}
      orgId={member.org_id}
    />
  );
}
