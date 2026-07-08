import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdvertiserPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Advertiser Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage your ad campaigns
        </p>
      </div>
    </div>
  );
}
