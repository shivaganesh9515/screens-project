import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ZoneEditor } from "./zone-editor";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .single();

  if (!template) notFound();

  const { data: playlists } = await supabase
    .from("playlists")
    .select("id, name")
    .eq("org_id", member.org_id)
    .order("name", { ascending: true });

  return (
    <div className="animate-fade-in">
      <ZoneEditor
        template={template}
        playlists={playlists ?? []}
        orgId={member.org_id}
      />
    </div>
  );
}
