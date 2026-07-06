import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("*, orgs(*)")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/setup");
  }

  // Fetch members separately without complex joins
  const { data: members } = await supabase
    .from("org_members")
    .select("org_id, user_id, role, joined_at")
    .eq("org_id", member.org_id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your organization and profile</p>
      </div>
      <SettingsForm
        user={user}
        org={member.orgs as any}
        members={members ?? []}
        role={member.role}
      />
    </div>
  );
}
