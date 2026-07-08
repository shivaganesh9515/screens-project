import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FranchisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Franchise Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage your franchise locations and screens
        </p>
      </div>
    </div>
  );
}
