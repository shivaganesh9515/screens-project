import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MediaItem } from "@/lib/types/database";

const supabase = createClient();

export function useMediaItems(orgId: string) {
  return useQuery({
    queryKey: ["media-items", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_items")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      return data as MediaItem[];
    },
    enabled: !!orgId,
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
    },
  });
}
