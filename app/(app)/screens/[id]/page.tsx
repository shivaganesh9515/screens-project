import { notFound, redirect } from "next/navigation";
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
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/setup");
  }

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

  // Fetch latest GPS location from screen_locations for bus/auto screens
  let latestGpsLocation: { latitude: number; longitude: number; recorded_at: string; accuracy?: number } | null = null;
  if (screen.screen_type === "bus" || screen.screen_type === "auto") {
    const { data: gpsRecords } = await supabase
      .from("screen_locations")
      .select("latitude, longitude, recorded_at, accuracy")
      .eq("screen_id", id)
      .order("recorded_at", { ascending: false })
      .limit(1);
    if (gpsRecords && gpsRecords.length > 0) {
      latestGpsLocation = gpsRecords[0];
    }
  }

  return (
    <ScreenDetail
      screen={screen}
      groups={groups ?? []}
      schedules={schedules ?? []}
      orgId={member.org_id}
      latestGpsLocation={latestGpsLocation}
    />
  );
}
