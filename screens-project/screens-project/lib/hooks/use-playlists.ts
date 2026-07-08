import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Playlist, PlaylistItemWithMedia } from "@/lib/types/database";

const supabase = createClient();

export function usePlaylists(orgId: string) {
  return useQuery({
    queryKey: ["playlists", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlists")
        .select("*, playlist_items(count)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      return data as Playlist[];
    },
    enabled: !!orgId,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlists")
        .select("*, playlist_items(*, media_items(*))")
        .eq("id", id)
        .order("playlist_items(position)", { ascending: true })
        .single();
      return data as Playlist & { playlist_items: PlaylistItemWithMedia[] };
    },
    enabled: !!id,
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}
