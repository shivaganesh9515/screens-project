import { createClient } from "@/lib/supabase/server";
import { TemplatesList } from "./templates-list";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const { data: templates } = await supabase
    .from("templates")
    .select("*, playlists(name)")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return <div className="animate-fade-in"><TemplatesList templates={templates ?? []} orgId={member.org_id} /></div>;
}
