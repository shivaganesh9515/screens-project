import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScreensTable } from "./screens-table";
import { AddScreenModal } from "./add-screen-modal";
import { ScreenGroups } from "@/components/screens/screen-groups";

export default async function ScreensPage() {
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

  const [screensResult, groupsResult] = await Promise.all([
    supabase
      .from("screens")
      .select("*, screen_groups(name)")
      .eq("org_id", member.org_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("screen_groups")
      .select("*")
      .eq("org_id", member.org_id)
      .order("name"),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Screens</h2>
          <p className="text-sm text-muted-foreground">Manage your screen devices</p>
        </div>
        <AddScreenModal groups={groupsResult.data ?? []} orgId={member.org_id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScreensTable
            screens={screensResult.data ?? []}
            groups={groupsResult.data ?? []}
            orgId={member.org_id}
          />
        </div>
        <div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <ScreenGroups groups={groupsResult.data ?? []} screens={screensResult.data ?? []} orgId={member.org_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
