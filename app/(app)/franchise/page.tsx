import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Monitor,
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";
import { CountUp } from "@/components/ui/count-up";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FranchisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find the franchise record for the logged-in user
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, name, org_id")
    .eq("managed_by", user.id)
    .single();

  const franchiseId = franchise?.id;

  // Fetch stats with error handling
  const [
    { count: totalScreens },
    { count: pendingApprovalsCount },
    { count: approvedAdsCount },
    { count: rejectedAdsCount },
  ] = await Promise.all([
    // Total Screens: Count screens belonging to this franchise
    franchiseId
      ? supabase
          .from("screens")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
      : Promise.resolve({ count: 0, error: null }),

    // Pending Approvals: Count ads targeting this franchise with pending status
    franchiseId
      ? supabase
          .from("ad_franchise_targets")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
          .eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),

    // Approved Ads: Count ads targeting this franchise with approved status
    franchiseId
      ? supabase
          .from("ad_franchise_targets")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
          .eq("status", "approved")
      : Promise.resolve({ count: 0, error: null }),

    // Rejected Ads: Count ads targeting this franchise with rejected status
    franchiseId
      ? supabase
          .from("ad_franchise_targets")
          .select("*", { count: "exact", head: true })
          .eq("franchise_id", franchiseId)
          .eq("status", "rejected")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  const stats = [
    {
      icon: <Monitor className="text-primary" />,
      label: "Total Screens",
      value: totalScreens ?? 0,
      description: "Screens in your franchise",
    },
    {
      icon: <Clock className="text-amber-500" />,
      label: "Pending Approvals",
      value: pendingApprovalsCount ?? 0,
      description: "Awaiting your review",
    },
    {
      icon: <CheckCircle className="text-emerald-500" />,
      label: "Approved Ads",
      value: approvedAdsCount ?? 0,
      description: "Currently running",
    },
    {
      icon: <XCircle className="text-red-400" />,
      label: "Rejected Ads",
      value: rejectedAdsCount ?? 0,
      description: "Needs revision",
    },
  ];

  // Fetch screens belonging to this franchise
  const { data: screens } = franchiseId
    ? await supabase
        .from("screens")
        .select("id, name, is_online, created_at")
        .eq("franchise_id", franchiseId)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Fetch ads targeting this franchise with ad details
  const { data: pendingAds } = franchiseId
    ? await supabase
        .from("ad_franchise_targets")
        .select("id, status, reviewed_at, ads!inner(id, name, created_at, advertisers(name))")
        .eq("franchise_id", franchiseId)
        .eq("status", "pending")
        .order("ads(created_at)", { ascending: false })
    : { data: [] };

  const statusConfig = {
    approved: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    rejected: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Franchise Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage your franchise locations and screens
        </p>
      </div>

      {/* ROW 1 — 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <StaggerWrapper key={stat.label} index={idx} itemsPerRow={4}>
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={<CountUp end={stat.value} />}
            />
          </StaggerWrapper>
        ))}
      </div>

      {/* ROW 2 — Split 50/50 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Screens */}
        <SectionCard
          title="My Screens"
          subtitle="Screens in your franchise"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {(screens ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Monitor className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No screens assigned yet.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Contact your admin to assign screens to your franchise
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Screen Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Added
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(screens ?? []).map((screen: any) => (
                      <TableRow
                        key={screen.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <span className="font-medium text-foreground">
                            {screen.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                              screen.is_online
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {screen.is_online ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(screen.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Pending Approvals */}
        <SectionCard
          title="Pending Approvals"
          subtitle="Ads awaiting your review"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {(pendingAds ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No pending approvals.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Ads targeting your franchise will appear here
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Advertisement
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Advertiser
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Submitted
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pendingAds ?? []).map((target: any) => {
                      const ad = target.ads;
                      const advertiserName = ad?.advertisers?.name ?? "—";
                      return (
                        <TableRow
                          key={target.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <span className="font-medium text-foreground">
                              {ad?.name ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {advertiserName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ad?.created_at
                              ? new Date(ad.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
