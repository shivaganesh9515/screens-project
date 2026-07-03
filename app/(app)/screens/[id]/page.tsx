import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScreenDetail } from "./screen-detail";

export default async function ScreenDetailPage({
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

  const { data: screen } = await supabase
    .from("screens")
    .select("*, screen_groups(name)")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .single();

  if (!screen) notFound();

  const { data: groups } = await supabase
    .from("screen_groups")
    .select("*")
    .eq("org_id", member.org_id)
    .order("name");

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, playlists(name)")
    .eq("screen_id", id)
    .order("created_at", { ascending: false });

  return (
    <ScreenDetail
      screen={screen}
      groups={groups ?? []}
      schedules={schedules ?? []}
      orgId={member.org_id}
    />
  );
}
