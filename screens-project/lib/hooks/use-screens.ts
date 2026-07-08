import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Screen } from "@/lib/types/database";

const supabase = createClient();

export function useScreens(orgId: string) {
  return useQuery({
    queryKey: ["screens", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("screens")
        .select("*, screen_groups(name)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      return data as (Screen & { screen_groups: { name: string } | null })[];
    },
    enabled: !!orgId,
  });
}

export function useScreen(id: string) {
  return useQuery({
    queryKey: ["screen", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("screens")
        .select("*, screen_groups(name)")
        .eq("id", id)
        .single();
      return data as Screen & { screen_groups: { name: string } | null };
    },
    enabled: !!id,
  });
}

export function useDeleteScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("screens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screens"] });
    },
  });
}
