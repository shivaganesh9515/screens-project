import { createClient } from "@/lib/supabase/server";
import { ScheduleCalendar } from "./schedule-calendar";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  const [schedulesResult, screensResult, playlistsResult, templatesResult] = await Promise.all([
    supabase
      .from("schedules")
      .select("*, screens(name), screen_groups(name), playlists(name), templates(name)")
      .eq("org_id", member.org_id)
      .order("created_at", { ascending: false }),
    supabase.from("screens").select("id, name").eq("org_id", member.org_id).order("name"),
    supabase.from("playlists").select("id, name").eq("org_id", member.org_id).order("name"),
    supabase.from("templates").select("id, name").eq("org_id", member.org_id).order("name"),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
        <p className="text-sm text-muted-foreground">Manage content schedules for screens and groups</p>
      </div>
      <ScheduleCalendar
        schedules={schedulesResult.data ?? []}
        screens={screensResult.data ?? []}
        playlists={playlistsResult.data ?? []}
        templates={templatesResult.data ?? []}
        orgId={member.org_id}
      />
    </div>
  );
}
