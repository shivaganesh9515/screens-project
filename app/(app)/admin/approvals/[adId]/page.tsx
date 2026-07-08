import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ApprovalPageProps {
  params: Promise<{ adId: string }>;
}

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/setup");

  const { adId } = await params;

  const { data: ad, error } = await supabase
    .from("ads")
    .select(`
      id,
      name,
      status,
      created_at,
      advertisers (name),
      ad_franchise_targets (
        franchises (name)
      )
    `)
    .eq("id", adId)
    .eq("org_id", member.org_id)
    .single();

  if (error || !ad) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Review Ad</h2>
          <p className="text-sm text-muted-foreground">
            Approve or reject this ad submission
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">{ad.name}</h3>
            <p className="text-sm text-muted-foreground">
              Submitted by {ad.advertisers?.name ?? "Unknown Advertiser"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <p className="mt-1 text-sm text-foreground capitalize">{ad.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
              <p className="mt-1 text-sm text-foreground">
                {new Date(ad.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Franchises</p>
              <p className="mt-1 text-sm text-foreground">
                {ad.ad_franchise_targets
                  ?.map((t) => t.franchises?.name)
                  .filter(Boolean)
                  .join(", ") ?? "None"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Approve/Reject functionality will be implemented in a future sprint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
