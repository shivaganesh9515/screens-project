import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/section-card";
import { FranchiseTable } from "./franchise-table";
import { CreateFranchiseDialog } from "./create-franchise-dialog";
import { getFranchises, getFranchiseManagers } from "./franchise-actions";

export default async function FranchisesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  const [franchises, managers] = await Promise.all([
    getFranchises(),
    getFranchiseManagers(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Franchises</h2>
          <p className="text-sm text-muted-foreground">
            Manage your franchise locations and assignments
          </p>
        </div>
        <CreateFranchiseDialog managers={managers} />
      </div>

      {/* Franchise Table */}
      <SectionCard
        title="All Franchises"
        subtitle={`${franchises.length} franchise${franchises.length !== 1 ? 's' : ''} total`}
      >
        <FranchiseTable franchises={franchises} managers={managers} />
      </SectionCard>
    </div>
  );
}
